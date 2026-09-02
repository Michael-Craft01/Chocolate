import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, authError } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return authError();

  try {
    // Auto-upsert the user in our Prisma database to mirror Supabase Auth
    const dbUser = await prisma.user.upsert({
      where: { id: user.id },
      update: { email: user.email || undefined, paymentStatus: 'active', tier: 'ELITE' },
      create: {
        id: user.id,
        email: user.email,
        tier: 'ELITE',
        dailyLimit: 1000,
        maxCampaigns: 50,
        leadsPerCycle: 50,
        cyclesRemaining: 99999,
        monthlyCycleLimit: 99999,
        automationMode: 'AUTOMATIC',
        autoRunFrequency: 'DAILY',
        paymentStatus: 'active'
      },
      include: { profile: true }
    });

    return NextResponse.json({ ...dbUser, paymentStatus: 'active', tier: 'ELITE' });
  } catch (error) {
    console.error('API Error in /api/me:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
