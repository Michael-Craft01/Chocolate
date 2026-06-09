import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, authError } from '@/lib/api-auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req);
  if (!user) return authError();

  const { id } = await params;

  try {
    const campaign = await prisma.campaign.findFirst({
      where: { id, userId: user.id },
      include: {
        _count: { select: { leads: true } },
        cycleRuns: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function withPrismaRetry<T>(fn: () => Promise<T>, maxRetries = 3, delay = 500): Promise<T> {
  let lastErr: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastErr = err;
      const isConflict =
        err.code === 'P2034' ||
        err.code === 'P2002' || // Unique constraint during concurrency
        String(err.message).includes('deadlock') ||
        String(err.message).includes('conflict') ||
        String(err.message).includes('serialization') ||
        String(err.message).includes('transaction');

      if (!isConflict) {
        throw err;
      }
      console.warn(`[PRISMA RETRY] Conflict/lock detected. Retrying attempt ${i + 1}/${maxRetries} after ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay + Math.random() * 200));
    }
  }
  throw lastErr;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req);
  if (!user) return authError();

  const { id } = await params;

  try {
    const body = await req.json();

    const updated = await withPrismaRetry(async () => {
      // Check if campaign belongs to user
      const campaign = await prisma.campaign.findFirst({
        where: { id, userId: user.id }
      });

      if (!campaign) {
        throw new Error('NOT_FOUND');
      }

      return prisma.campaign.update({
        where: { id },
        data: body
      });
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req);
  if (!user) return authError();

  const { id } = await params;

  try {
    // Check ownership
    const campaign = await prisma.campaign.findFirst({
      where: { id, userId: user.id }
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Authoritative Drop: Delete associated data in transaction
    await prisma.$transaction([
      prisma.lead.deleteMany({ where: { campaignId: id } }),
      prisma.queryHistory.deleteMany({ where: { campaignId: id } }),
      prisma.campaign.delete({ where: { id } })
    ]);

    return NextResponse.json({ success: true, message: 'Hub decommissioned' });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
