import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, authError } from '@/lib/api-auth';

// ── GET: fetch cycle history for a campaign ──────────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req);
  if (!user) return authError();
  const { id } = await params;

  try {
    const limit = Math.min(100, parseInt(req.nextUrl.searchParams.get('limit') || '10'));
    const campaign = await prisma.campaign.findFirst({ where: { id, userId: user.id } });
    if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });

    const cycles = await prisma.cycleRun.findMany({
      where: { campaignId: id, userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        campaign: { select: { id: true, name: true, status: true } }
      }
    });

    return NextResponse.json(cycles);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// ── POST: trigger a manual search cycle ──────────────────────────────────────
//
// Strategy (in priority order):
//  1. If BACKEND_URL is configured and not localhost → proxy to Express engine (Railway/Fly.io)
//  2. If GH_DISPATCH_TOKEN is configured → fire a GitHub Actions repository_dispatch
//  3. Fallback: return a clear error explaining the backend is not reachable
//
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req);
  if (!user) return authError();
  const { id } = await params;

  try {
    // Validate campaign ownership & existence
    const campaign = await prisma.campaign.findFirst({ where: { id, userId: user.id } });
    if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // ── Strategy 1: Proxy to Express backend if available ─────────────────
    // ── Strategy 1: Proxy to Express backend if available ─────────────────
    const backendUrl = process.env.BACKEND_URL || (process.env.NODE_ENV !== 'production' ? 'http://localhost:3005' : undefined);
    if (backendUrl) {
      const authHeader = req.headers.get('authorization') || '';
      try {
        const response = await fetch(`${backendUrl}/api/campaigns/${id}/cycles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authHeader ? { authorization: authHeader } : {}),
            ...(process.env.ENGINE_TRIGGER_SECRET ? { 'x-engine-secret': process.env.ENGINE_TRIGGER_SECRET } : {})
          },
          signal: AbortSignal.timeout(10_000), // 10s timeout — don't block the request
        });
        const text = await response.text();
        if (response.ok || response.status < 500) {
          return new NextResponse(text, {
            status: response.status,
            headers: { 'content-type': response.headers.get('content-type') || 'application/json' }
          });
        }
      } catch (proxyErr: any) {
        console.warn(`[Cycles] Backend proxy to ${backendUrl} failed (${proxyErr.message}), falling through to GitHub dispatch.`);
      }
    }

    // ── Always create a QUEUED cycle record in database so the mission is preserved ──
    const pendingCycle = await prisma.cycleRun.create({
      data: {
        campaignId: id,
        userId: user.id,
        status: 'QUEUED',
        triggerType: 'MANUAL',
        leadsFound: 0,
        maxLeads: 50,
      }
    });

    // ── Strategy 2: GitHub Actions repository_dispatch ────────────────────
    const ghToken =
      process.env.GH_DISPATCH_TOKEN ||
      process.env.GITHUB_TOKEN ||
      process.env.GH_TOKEN ||
      process.env.GITHUB_PAT ||
      process.env.GITHUB_ACCESS_TOKEN;
    const ghRepo = process.env.GH_REPO || 'Michael-Craft01/Chocolate'; // owner/repo

    if (ghToken && ghRepo) {
      try {
        const dispatchRes = await fetch(`https://api.github.com/repos/${ghRepo}/dispatches`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${ghToken}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event_type: 'manual_cycle_trigger',
            client_payload: {
              campaign_id: id,
              user_id: user.id,
              cycle_run_id: pendingCycle.id,
            }
          })
        });

        if (dispatchRes.ok) {
          console.info(`[Cycles] Dispatched cycle for campaign ${id} to GitHub Actions (${ghRepo})`);
          return NextResponse.json(
            { message: 'Discovery cycle triggered on GitHub runner.', cycle: pendingCycle },
            { status: 202 }
          );
        } else {
          const errText = await dispatchRes.text();
          console.warn(`[Cycles] GitHub dispatch responded with ${dispatchRes.status}: ${errText}`);
        }
      } catch (dispatchErr: any) {
        console.warn(`[Cycles] GitHub dispatch error: ${dispatchErr.message}`);
      }
    }

    // ── Strategy 3: Queued for background sweep / worker ─────────────────
    // The cycle is safely saved in PostgreSQL. It will run on the next scheduled GitHub sweep (06:00/18:00 UTC)
    // or when the backend worker process is started.
    return NextResponse.json(
      { 
        message: 'Search cycle queued successfully. The discovery engine will process this sweep.',
        cycle: pendingCycle,
        queued: true
      },
      { status: 202 }
    );

  } catch (error: any) {
    console.error('Cycle trigger error:', error);
    return NextResponse.json({ error: error.message || 'Failed to start cycle' }, { status: 500 });
  }
}
