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

    // Check quota
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if ((dbUser.cyclesRemaining ?? 0) <= 0) {
      return NextResponse.json({ error: 'No search cycles remaining. Top up on the billing page.' }, { status: 402 });
    }

    // ── Strategy 1: Proxy to Express backend if available ─────────────────
    const backendUrl = process.env.BACKEND_URL;
    if (backendUrl && !backendUrl.includes('localhost') && !backendUrl.includes('127.0.0.1')) {
      const authHeader = req.headers.get('authorization') || '';
      try {
        const response = await fetch(`${backendUrl}/api/campaigns/${id}/cycles`, {
          method: 'POST',
          headers: { authorization: authHeader },
          signal: AbortSignal.timeout(10_000), // 10s timeout — don't wait for the full cycle
        });
        const text = await response.text();
        return new NextResponse(text, {
          status: response.status,
          headers: { 'content-type': response.headers.get('content-type') || 'application/json' }
        });
      } catch (proxyErr: any) {
        console.warn(`[Cycles] Backend proxy failed (${proxyErr.message}), falling through to GitHub dispatch.`);
        // Fall through to strategy 2
      }
    }

    // ── Strategy 2: GitHub Actions repository_dispatch ────────────────────
    const ghToken = process.env.GH_DISPATCH_TOKEN;
    const ghRepo = process.env.GH_REPO || 'Michael-Craft01/Chocolate'; // owner/repo

    if (ghToken && ghRepo) {
      // Create a QUEUED cycle record immediately so the UI shows activity
      const pendingCycle = await prisma.cycleRun.create({
        data: {
          campaignId: id,
          userId: user.id,
          status: 'QUEUED',
          triggerType: 'MANUAL',
          leadsFound: 0,
          maxLeads: dbUser.leadsPerCycle ?? 15,
        }
      });

      // Deduct one cycle immediately to prevent double-spending
      await prisma.user.update({
        where: { id: user.id },
        data: { cyclesRemaining: { decrement: 1 } }
      });

      // Fire the GitHub Actions workflow
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

      if (!dispatchRes.ok) {
        const errText = await dispatchRes.text();
        console.error('[Cycles] GitHub dispatch failed:', dispatchRes.status, errText);
        // Roll back the cycle deduction if dispatch fails
        await prisma.user.update({
          where: { id: user.id },
          data: { cyclesRemaining: { increment: 1 } }
        });
        await prisma.cycleRun.delete({ where: { id: pendingCycle.id } });
        return NextResponse.json({ error: 'Failed to queue search cycle. Please try again.' }, { status: 502 });
      }

      console.info(`[Cycles] Dispatched cycle for campaign ${id} — cycle run ${pendingCycle.id}`);
      return NextResponse.json(
        { message: 'Discovery cycle queued successfully.', cycle: pendingCycle },
        { status: 202 }
      );
    }

    // ── Strategy 3: No backend configured ────────────────────────────────
    console.error('[Cycles] Neither BACKEND_URL nor GH_DISPATCH_TOKEN is configured. Cannot trigger cycle.');
    return NextResponse.json(
      { error: 'The search engine is not configured for this deployment. Set BACKEND_URL or GH_DISPATCH_TOKEN.' },
      { status: 503 }
    );

  } catch (error: any) {
    console.error('Cycle trigger error:', error);
    return NextResponse.json({ error: error.message || 'Failed to start cycle' }, { status: 500 });
  }
}
