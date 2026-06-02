import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, authError } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return authError();

  try {
    const userId = user.id;
    const totalBusinesses = await prisma.business.count();
    const totalLeads = await prisma.lead.count({ where: { campaign: { userId } } });
    
    const startOfToday = new Date();
    startOfToday.setHours(0,0,0,0);
    const leadsToday = await prisma.lead.count({
      where: { createdAt: { gte: startOfToday }, campaign: { userId } }
    });

    const [dbUser, latestCycle] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.cycleRun.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          campaign: { select: { id: true, name: true, status: true } }
        }
      })
    ]);
    
    return NextResponse.json({
      totalBusinesses,
      totalLeads,
      leadsToday,
      tier: dbUser?.tier || 'FREE',
      quota: {
        used: dbUser?.leadsFoundToday || 0,
        limit: dbUser?.dailyLimit || 10,
        credits: dbUser?.creditBalance || 0
      },
      cycles: {
        remaining: dbUser?.cyclesRemaining || 0,
        monthlyLimit: dbUser?.monthlyCycleLimit || 0,
        usedThisPeriod: Math.max(0, (dbUser?.monthlyCycleLimit || 0) - (dbUser?.cyclesRemaining || 0)),
        leadsPerCycle: dbUser?.leadsPerCycle || 10,
        automationMode: dbUser?.automationMode || 'MANUAL',
        autoRunFrequency: dbUser?.autoRunFrequency || 'MANUAL',
        currentPeriodStart: dbUser?.currentPeriodStart,
        currentPeriodEnd: dbUser?.currentPeriodEnd
      },
      latestCycle
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
