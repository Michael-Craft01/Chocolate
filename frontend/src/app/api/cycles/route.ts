import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, authError } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return authError();

  try {
    const limit = Math.min(100, parseInt(req.nextUrl.searchParams.get('limit') || '20'));
    const cycles = await prisma.cycleRun.findMany({
      where: { 
        userId: user.id,
        campaign: {
          name: { not: 'Main Engine' }
        }
      },
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
