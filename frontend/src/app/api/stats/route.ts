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
      tier: 'ELITE',
      quota: {
        used: dbUser?.leadsFoundToday || 0,
        limit: 99999,
        credits: 99999
      },
      cycles: {
        remaining: 99999,
        monthlyLimit: 99999,
        usedThisPeriod: 0,
        leadsPerCycle: 50,
        automationMode: dbUser?.automationMode || 'AUTOMATIC',
        autoRunFrequency: dbUser?.autoRunFrequency || 'DAILY',
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
