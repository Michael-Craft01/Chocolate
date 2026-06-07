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

  const body = await req.json().catch(() => ({}));
  const method = body.method || 'STRIPE';
  const tier = body.tier as 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ELITE' | 'CYCLE_PACK';
  const amount = Number(body.amount || 0);

  if (!['FREE', 'STARTER', 'PROFESSIONAL', 'ELITE', 'CYCLE_PACK'].includes(tier)) {
    return NextResponse.json({ error: 'Invalid billing tier' }, { status: 400 });
  }

  if (tier === 'FREE') {
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (dbUser) {
      if (dbUser.stripeSubscriptionId && process.env.STRIPE_SECRET_KEY) {
        try {
          const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
          await stripe.subscriptions.cancel(dbUser.stripeSubscriptionId);
        } catch (err) {
          console.error("Failed to cancel Stripe subscription:", err);
        }
      }

      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: {
            tier: 'FREE',
            dailyLimit: 25,
            monthlyCycleLimit: 1,
            cyclesRemaining: 1,
            leadsPerCycle: 15,
            automationMode: 'MANUAL',
            autoRunFrequency: 'MANUAL',
            maxCampaigns: 1,
            paymentStatus: 'free',
            stripeSubscriptionId: null,
          }
        }),
        prisma.transaction.create({
          data: {
            userId: user.id,
            amount: 0,
            gateway: 'STRIPE',
            type: 'SUBSCRIPTION',
            status: 'SUCCESS',
            tier: 'FREE',
            gatewayRef: `downgrade_${Date.now()}_${user.id.slice(0, 8)}`,
          }
        })
      ]);
    }
    const frontendUrl = getFrontendUrl(req);
    return NextResponse.json({ url: `${frontendUrl}/billing?success=true` });
  }

  const price = getCheckoutPrice(tier, amount);
  if (price <= 0) {
    return NextResponse.json({ error: 'Invalid checkout amount' }, { status: 400 });
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  const frontendUrl = getFrontendUrl(req);

  if (method === 'PAYNOW') {
    return createPaynowCheckout({
      userId: user.id,
      email: dbUser?.email || user.email || 'customer@hyprlead.engine',
      tier,
      price,
      frontendUrl,
    });
  }

  if (method !== 'STRIPE') {
    return NextResponse.json({ error: 'Unsupported checkout method' }, { status: 400 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
  }

  if (process.env.NODE_ENV === 'production' && process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
    return NextResponse.json({ error: 'Production checkout is using a Stripe test key' }, { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: tier === 'CYCLE_PACK' ? 'Discovery Cycle Pack' : `HyprLead Lead Engine - ${tier} Plan`,
            description: tier === 'CYCLE_PACK'
              ? `Add ${Math.max(1, Math.floor(price / 2))} discovery cycles`
              : `Monthly subscription to ${tier} tier`,
          },
          unit_amount: Math.round(price * 100),
          recurring: tier !== 'CYCLE_PACK' ? { interval: 'month' } : undefined,
        },
        quantity: 1,
      },
    ],
    mode: tier !== 'CYCLE_PACK' ? 'subscription' : 'payment',
    customer_email: dbUser?.email || user.email || undefined,
    success_url: `${frontendUrl}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${frontendUrl}/billing?canceled=true`,
    metadata: {
      userId: user.id,
      email: dbUser?.email || user.email || '',
      tier,
    },
  });

  return NextResponse.json({ url: session.url });
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
