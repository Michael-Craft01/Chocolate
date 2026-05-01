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

    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    
    return NextResponse.json({
      totalBusinesses,
      totalLeads,
      leadsToday,
      tier: dbUser?.tier || 'FREE',
      quota: {
        used: dbUser?.leadsFoundToday || 0,
        limit: dbUser?.dailyLimit || 10,
        credits: dbUser?.creditBalance || 0
      }
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
