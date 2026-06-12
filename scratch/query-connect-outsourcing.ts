import { PrismaClient } from '@prisma/client';

async function queryLead() {
  const prisma = new PrismaClient();
  try {
    const lead = await prisma.lead.findFirst({
      where: {
        OR: [
          { business: { email: { contains: 'connectoutsourcing' } } },
          { business: { website: { contains: 'connectoutsourcing' } } },
          { business: { name: { contains: 'Connect Outsourcing' } } }
        ]
      },
      include: {
        business: true,
        campaign: true,
        cycleRun: true
      }
    });

    if (!lead) {
      console.log('❌ Lead not found in the database.');
      return;
    }

    console.log('=============================================');
    console.log('🔍 LEAD RECORD DETAILS:');
    console.log('=============================================');
    console.log(`Lead ID:         ${lead.id}`);
    console.log(`Company Name:    ${lead.business.name}`);
    console.log(`Website:         ${lead.business.website}`);
    console.log(`Phone:           ${lead.business.phone}`);
    console.log(`Email:           ${lead.business.email}`);
    console.log(`Industry (AI):   ${lead.industry}`);
    console.log(`Pain Point (AI): ${lead.painPoint}`);
    console.log(`Suggested Msg:   ${lead.suggestedMessage}`);
    console.log(`Status:          ${lead.status}`);
    console.log(`Sweep Date:      ${lead.sweepDate}`);
    console.log(`Sweep ID:        ${lead.sweepId}`);
    console.log(`Created At:      ${lead.createdAt}`);

    console.log('\n=============================================');
    console.log('🎯 CAMPAIGN SETTINGS:');
    console.log('=============================================');
    console.log(`Campaign Name:   ${lead.campaign.name}`);
    console.log(`Locations:       ${JSON.stringify(lead.campaign.locations)}`);
    console.log(`Industries:      ${JSON.stringify(lead.campaign.industries)}`);
    console.log(`Target Country:  ${lead.campaign.targetCountry}`);
    console.log(`Product Name:    ${lead.campaign.productName}`);
    console.log(`Product Desc:    ${lead.campaign.productDescription}`);
    console.log(`Pain Points:     ${lead.campaign.targetPainPoints}`);

    if (lead.cycleRun) {
      console.log('\n=============================================');
      console.log('🔄 CYCLE RUN:');
      console.log('=============================================');
      console.log(`Cycle ID:        ${lead.cycleRun.id}`);
      console.log(`Max Leads:       ${lead.cycleRun.maxLeads}`);
      console.log(`Leads Found:     ${lead.cycleRun.leadsFound}`);
    }

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

queryLead();
