import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
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

function getFrontendUrl(req: NextRequest) {
  const configured = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_FRONTEND_URL;
  if (configured?.startsWith('http')) return configured.replace(/\/$/, '');
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

  return handleProxy(req, pathSegments);
}

async function createCheckout(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return authError();

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
  }

  const body = await req.json().catch(() => ({}));
  const method = body.method || 'STRIPE';
  const tier = body.tier as 'STARTER' | 'PROFESSIONAL' | 'ELITE' | 'CYCLE_PACK';
  const amount = Number(body.amount || 0);

  if (method !== 'STRIPE') {
    return NextResponse.json({ error: 'Paynow checkout requires the backend worker URL to be configured' }, { status: 400 });
  }

  if (!['STARTER', 'PROFESSIONAL', 'ELITE', 'CYCLE_PACK'].includes(tier)) {
    return NextResponse.json({ error: 'Invalid billing tier' }, { status: 400 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const price = amount || getTierPrice(tier);
  if (price <= 0) {
    return NextResponse.json({ error: 'Invalid checkout amount' }, { status: 400 });
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  const frontendUrl = getFrontendUrl(req);

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
    success_url: `${frontendUrl}/billing?success=true`,
    cancel_url: `${frontendUrl}/billing?canceled=true`,
    metadata: {
      userId: user.id,
      email: dbUser?.email || user.email || '',
      tier,
    },
  });

  return NextResponse.json({ url: session.url });
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
