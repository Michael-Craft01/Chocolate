import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, authError } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return authError();

  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaignId') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where = { 
      campaign: { 
        userId: user.id,
        ...(campaignId ? { id: campaignId } : {})
      } 
    };

    const [leads, totalLeads] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          business: true,
          campaign: {
            select: {
              id: true,
              name: true,
              status: true,
              companyName: true,
              senderName: true,
              senderRole: true,
              targetCountry: true,
              locations: true,
              industries: true,
              productName: true,
              productDescription: true,
              targetPainPoints: true,
              outreachTone: true,
              ctaLink: true
            }
          },
          cycleRun: true
        }
      }),
      prisma.lead.count({ where })
    ]);

    return NextResponse.json({
      leads,
      pagination: { page, limit, totalPages: Math.ceil(totalLeads / limit), totalLeads }
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
