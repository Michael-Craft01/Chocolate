import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Paynow } from 'paynow';
import prisma from '@/lib/prisma';
import { getAuthUser, authError } from '@/lib/api-auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleBilling(req, path);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleBilling(req, path);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleProxy(req, path);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleProxy(req, path);
}

function getTierPrice(tier: string) {
  switch (tier) {
    case 'STARTER':
      return 20;
    case 'PROFESSIONAL':
      return 49;
    case 'ELITE':
      return 300;
    default:
      return 0;
  }
}

function getCheckoutPrice(tier: string, amount: number) {
  return amount || getTierPrice(tier);
}

function getFrontendUrl(req: NextRequest) {
  const configured = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_FRONTEND_URL;
  const isLocalRequest = req.nextUrl.hostname === 'localhost' || req.nextUrl.hostname === '127.0.0.1';

  if (configured?.startsWith('http') && !configured.includes('localhost')) {
    return configured.replace(/\/$/, '');
  }

  if (configured?.startsWith('http') && isLocalRequest) {
    return configured.replace(/\/$/, '');
  }

  return req.nextUrl.origin;
}

async function handleBilling(req: NextRequest, pathSegments: string[]) {
  const path = pathSegments.join('/');

  if (path === 'create-checkout' && req.method === 'POST') {
    return createCheckout(req);
  }

  if (path === 'transactions' && req.method === 'GET') {
    return listTransactions(req);
  }

  if (path === 'diagnostics' && req.method === 'GET') {
    return billingDiagnostics(req);
  }

  return handleProxy(req, pathSegments);
}

async function billingDiagnostics(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return authError();

  const stripeKey = process.env.STRIPE_SECRET_KEY || '';
  const frontendUrl = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_FRONTEND_URL || '';
  const backendUrl = process.env.BACKEND_URL || '';

  return NextResponse.json({
    checkoutRuntime: 'next-api',
    requestOrigin: req.nextUrl.origin,
    stripeMode: stripeKey.startsWith('sk_live_') ? 'live' : stripeKey.startsWith('sk_test_') ? 'test' : 'missing-or-invalid',
    frontendUrlMode: frontendUrl.includes('localhost') ? 'localhost' : frontendUrl ? 'configured' : 'request-origin-fallback',
    backendUrlMode: backendUrl ? (backendUrl.includes('localhost') ? 'localhost' : 'configured') : 'not-configured',
  });
}

async function createCheckout(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return authError();
  const frontendUrl = getFrontendUrl(req);
  return NextResponse.json({ url: `${frontendUrl}/dashboard?open_access=true`, message: 'All features are open and free.' });
}

async function createPaynowCheckout(options: {
  userId: string;
  email: string;
  tier: 'STARTER' | 'PROFESSIONAL' | 'ELITE' | 'CYCLE_PACK';
  price: number;
  frontendUrl: string;
}) {
  const integrationId = process.env.PAYNOW_INTEGRATION_ID;
  const integrationKey = process.env.PAYNOW_INTEGRATION_KEY;

  if (!integrationId || !integrationKey) {
    return NextResponse.json({ error: 'Paynow is not configured' }, { status: 500 });
  }

  const paynow = new Paynow(integrationId, integrationKey);
  const reference = `INV-${Date.now()}-${options.userId.slice(0, 8)}`;
  paynow.resultUrl = `${options.frontendUrl}/api/payments/paynow/result`;
  paynow.returnUrl = `${options.frontendUrl}/billing?success=true&gateway=paynow&reference=${encodeURIComponent(reference)}`;

  const payment = paynow.createPayment(reference, options.email);
  payment.add(
    options.tier === 'CYCLE_PACK' ? 'HyprLead Discovery Cycle Pack' : `HyprLead ${options.tier} Plan`,
    options.price,
  );

  const response = await paynow.send(payment);

  if (!response?.success || !response.redirectUrl || !response.pollUrl) {
    return NextResponse.json(
      { error: response?.error || 'Paynow rejected checkout creation' },
      { status: 502 },
    );
  }

  await prisma.transaction.upsert({
    where: { gatewayRef: response.pollUrl },
    update: {
      userId: options.userId,
      amount: options.price,
      status: 'PENDING',
    },
    create: {
      userId: options.userId,
      amount: options.price,
      gateway: 'PAYNOW',
      type: options.tier === 'CYCLE_PACK' ? 'CYCLE_PACK' : 'SUBSCRIPTION',
      tier: options.tier === 'CYCLE_PACK' ? null : options.tier,
      gatewayRef: response.pollUrl,
      status: 'PENDING',
    },
  });

  return NextResponse.json({ url: response.redirectUrl });
}

async function listTransactions(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return authError();

  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json(transactions);
}

async function handleProxy(req: NextRequest, pathSegments: string[]) {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl || backendUrl.includes('localhost')) {
    return NextResponse.json({ error: 'Billing backend is not configured' }, { status: 502 });
  }

  const path = pathSegments.join('/');
  const targetUrl = `${backendUrl.replace(/\/$/, '')}/api/billing/${path}${req.nextUrl.search}`;
  const forwardHeaders: Record<string, string> = {};
  const skipHeaders = new Set(['host', 'connection', 'transfer-encoding']);

  req.headers.forEach((val, key) => {
    if (!skipHeaders.has(key.toLowerCase())) forwardHeaders[key] = val;
  });

  if (['POST', 'PATCH', 'PUT'].includes(req.method)) {
    forwardHeaders['content-type'] = 'application/json';
  }

  const init: RequestInit = {
    method: req.method,
    headers: forwardHeaders,
  };

  if (['POST', 'PATCH', 'PUT'].includes(req.method)) {
    init.body = await req.text().catch(() => '');
  }

  try {
    const response = await fetch(targetUrl, init);
    const data = await response.text();
    const resHeaders = new Headers();
    response.headers.forEach((val, key) => {
      if (key.toLowerCase() !== 'transfer-encoding') resHeaders.set(key, val);
    });
    return new NextResponse(data, { status: response.status, headers: resHeaders });
  } catch (error) {
    console.error(`[Billing Proxy] Failed to reach backend at ${targetUrl}:`, error);
    return NextResponse.json({ error: 'Failed to communicate with billing backend' }, { status: 502 });
  }
}
