import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, authError } from '@/lib/api-auth';
import { Parser } from 'json2csv';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return authError();

  try {
    const campaignId = req.nextUrl.searchParams.get('campaignId');
    
    const where: any = {
      campaign: {
        userId: user.id
      }
    };
    
    if (campaignId && campaignId !== 'ALL') {
      where.campaign.id = campaignId;
    }

    const leads = await prisma.lead.findMany({
      where,
      include: { business: true }
    });

    const fields = [
      { label: 'Business Name', value: 'business.name' },
      { label: 'Industry', value: 'industry' },
      { label: 'Phone', value: 'business.phone' },
      { label: 'Email', value: 'business.email' },
      { label: 'Website', value: 'business.website' },
      { label: 'Pain Point', value: 'painPoint' },
      { label: 'Suggested Message', value: 'suggestedMessage' }
    ];
    
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(leads);

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=leads.csv'
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
