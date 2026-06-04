import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';
import { getAuthUser, authError } from '@/lib/api-auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handlePayments(req, path);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handlePayments(req, path);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleProxy(req, path);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleProxy(req, path);
}

function getPlanConfig(tier: string) {
  switch (tier) {
    case 'ELITE':
      return {
        tier: 'ELITE' as const,
        amount: 300,
        dailyLimit: 2500,
        monthlyCycleLimit: 40,
        leadsPerCycle: 75,
        autoRunFrequency: 'DAILY' as const,
        maxCampaigns: 10,
      };
    case 'PROFESSIONAL':
      return {
        tier: 'PROFESSIONAL' as const,
        amount: 49,
        dailyLimit: 500,
        monthlyCycleLimit: 15,
        leadsPerCycle: 40,
        autoRunFrequency: 'EVERY_2_DAYS' as const,
        maxCampaigns: 5,
      };
    default:
      return {
        tier: 'STARTER' as const,
        amount: 20,
        dailyLimit: 100,
        monthlyCycleLimit: 4,
        leadsPerCycle: 25,
        autoRunFrequency: 'WEEKLY' as const,
        maxCampaigns: 1,
      };
  }
}

async function handlePayments(req: NextRequest, pathSegments: string[]) {
  const path = pathSegments.join('/');

  if (path === 'stripe/sync' && req.method === 'POST') {
    return syncStripePayment(req);
  }

  return handleProxy(req, pathSegments);
}

async function syncStripePayment(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return authError();

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
  }

  const user = await prisma.user.findUnique({ where: { id: authUser.id } });
  const email = user?.email || authUser.email;

  if (!user || !email) {
    return NextResponse.json({ error: 'User or billing email not found' }, { status: 400 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const body = await req.json().catch(() => ({}));
  const sessionId = typeof body.sessionId === 'string'
    ? body.sessionId
    : req.nextUrl.searchParams.get('session_id');

  const session = sessionId
    ? await stripe.checkout.sessions.retrieve(sessionId)
    : await findLatestPaidSession(stripe, email, user.id);

  if (!session) {
    return NextResponse.json({ success: false, message: 'No successful Stripe checkout session found yet.' }, { status: 404 });
  }

  const ownsSession = (() => {
    const metadataUserId = session.metadata?.userId;
    const metadataEmail = session.metadata?.email;
    const customerEmail = session.customer_details?.email || session.customer_email;

    return metadataUserId === user.id || metadataEmail === email || customerEmail === email;
  })();

  if (!ownsSession) {
    return NextResponse.json({ error: 'Stripe checkout session does not belong to this account' }, { status: 403 });
  }

  if (session.status !== 'complete' || session.payment_status !== 'paid') {
    return NextResponse.json({ success: false, message: 'Stripe payment has not completed.' }, { status: 402 });
  }

  const existing = await prisma.transaction.findUnique({ where: { gatewayRef: session.id } });
  if (existing?.status === 'SUCCESS') {
    return NextResponse.json({
      success: true,
      alreadyProcessed: true,
      tier: existing.tier,
      type: existing.type,
    });
  }

  const tier = session.metadata?.tier || 'STARTER';
  const amount = (session.amount_total || 0) / 100;

  if (tier === 'CYCLE_PACK') {
    const cycles = Math.max(1, Math.floor(amount / 2));

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { cyclesRemaining: { increment: cycles } },
      }),
      prisma.transaction.upsert({
        where: { gatewayRef: session.id },
        update: { status: 'SUCCESS', userId: user.id },
        create: {
          userId: user.id,
          amount,
          gateway: 'STRIPE',
          type: 'CYCLE_PACK',
          status: 'SUCCESS',
          gatewayRef: session.id,
        },
      }),
    ]);

    return NextResponse.json({ success: true, type: 'CYCLE_PACK', cycles });
  }

  const plan = getPlanConfig(tier);
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  const stripeCustomerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
  const stripeSubscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        tier: plan.tier,
        dailyLimit: plan.dailyLimit,
        monthlyCycleLimit: plan.monthlyCycleLimit,
        cyclesRemaining: plan.monthlyCycleLimit,
        leadsPerCycle: plan.leadsPerCycle,
        automationMode: 'AUTOMATIC',
        autoRunFrequency: plan.autoRunFrequency,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        maxCampaigns: plan.maxCampaigns,
        paymentStatus: 'active',
        stripeCustomerId,
        stripeSubscriptionId,
      },
    }),
    prisma.transaction.upsert({
      where: { gatewayRef: session.id },
      update: {
        status: 'SUCCESS',
        userId: user.id,
        tier: plan.tier,
      },
      create: {
        userId: user.id,
        amount: plan.amount,
        gateway: 'STRIPE',
        type: 'SUBSCRIPTION',
        status: 'SUCCESS',
        tier: plan.tier,
        gatewayRef: session.id,
      },
    }),
  ]);

  return NextResponse.json({ success: true, tier: plan.tier });
}

async function findLatestPaidSession(stripe: Stripe, email: string, userId: string) {
  const sessions = await stripe.checkout.sessions.list({
    limit: 10,
    customer_details: { email },
  });

  return sessions.data.find((candidate) => {
    const metadataUserId = candidate.metadata?.userId;
    const metadataEmail = candidate.metadata?.email;
    const customerEmail = candidate.customer_details?.email || candidate.customer_email;

    return candidate.status === 'complete'
      && candidate.payment_status === 'paid'
      && (metadataUserId === userId || metadataEmail === email || customerEmail === email);
  });
}

async function handleProxy(req: NextRequest, pathSegments: string[]) {
  const BACKEND_URL = process.env.BACKEND_URL;
  if (!BACKEND_URL || BACKEND_URL.includes('localhost')) {
    return NextResponse.json({ error: 'Payments backend is not configured' }, { status: 502 });
  }

  const path = pathSegments.join('/');
  const targetUrl = `${BACKEND_URL.replace(/\/$/, '')}/api/payments/${path}${req.nextUrl.search}`;

  // Forward only safe headers - skip host which would confuse Express
  const forwardHeaders: Record<string, string> = {};
  const skipHeaders = new Set(['host', 'connection', 'transfer-encoding']);
  req.headers.forEach((val, key) => {
    if (!skipHeaders.has(key.toLowerCase())) {
      forwardHeaders[key] = val;
    }
  });

  // Always ensure JSON content type for mutating requests
  if (['POST', 'PATCH', 'PUT'].includes(req.method)) {
    forwardHeaders['content-type'] = 'application/json';
  }

  const init: RequestInit = {
    method: req.method,
    headers: forwardHeaders,
  };

  if (['POST', 'PATCH', 'PUT'].includes(req.method)) {
    try {
      init.body = await req.text();
    } catch (e) {
      // No body
    }
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
    console.error(`[Payments Proxy] Failed to reach backend at ${targetUrl}:`, error);
    return NextResponse.json({ error: 'Failed to communicate with payments backend' }, { status: 502 });
  }
}
