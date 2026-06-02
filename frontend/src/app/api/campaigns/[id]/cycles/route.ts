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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req);
  if (!user) return authError();
  const { id } = await params;

  try {
    const campaign = await prisma.campaign.findFirst({ where: { id, userId: user.id } });
    if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });

    const authHeader = req.headers.get('authorization') || '';
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3005';
    const response = await fetch(`${backendUrl}/api/campaigns/${id}/cycles`, {
      method: 'POST',
      headers: { authorization: authHeader }
    });

    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: { 'content-type': response.headers.get('content-type') || 'application/json' }
    });
  } catch (error: any) {
    console.error('Cycle trigger proxy error:', error);
    return NextResponse.json({ error: error.message || 'Failed to start cycle' }, { status: 502 });
  }
}
