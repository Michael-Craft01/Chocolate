import { PrismaClient } from '@prisma/client';

async function diagnoseCampaign() {
  console.log('--- STARTING CAMPAIGN DIAGNOSTICS FOR "Custom Software" ---');
  const prisma = new PrismaClient();
  
  try {
    // 1. Find the campaign details
    const campaign = await prisma.campaign.findFirst({
      where: {
        name: {
          contains: 'Custom Software',
          mode: 'insensitive'
        }
      },
      include: {
        user: true,
        cycleRuns: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: { leads: true }
        }
      }
    });

    if (!campaign) {
      console.log('❌ Campaign with name containing "Custom Software" not found in the database.');
      
      // Let's print out all campaign names to see what exists
      const allCampaigns = await prisma.campaign.findMany({
        select: { id: true, name: true, status: true }
      });
      console.log('\nAvailable campaigns:');
      console.table(allCampaigns);
      return;
    }

    console.log('\n📊 CAMPAIGN PROPERTIES:');
    console.log(`- Campaign ID: ${campaign.id}`);
    console.log(`- Campaign Name: ${campaign.name}`);
    console.log(`- Status: ${campaign.status}`);
    console.log(`- Target Country: ${campaign.targetCountry}`);
    console.log(`- Locations: ${JSON.stringify(campaign.locations)}`);
    console.log(`- Industries: ${JSON.stringify(campaign.industries)}`);
    console.log(`- Assigned Sources: ${JSON.stringify(campaign.assignedSources)}`);
    console.log(`- Product Name: ${campaign.productName}`);
    console.log(`- Product Description: ${campaign.productDescription}`);
    console.log(`- Target Pain Points: ${campaign.targetPainPoints}`);
    console.log(`- Discord Webhook: ${campaign.discordWebhook ? 'Configured' : 'None'}`);
    console.log(`- Leads Count: ${campaign._count.leads}`);

    console.log('\n👤 OWNER USER STATUS:');
    const user = campaign.user;
    console.log(`- User ID: ${user.id}`);
    console.log(`- User Email: ${user.email}`);
    console.log(`- Tier: ${user.tier}`);
    console.log(`- Payment Status: ${user.paymentStatus}`);
    console.log(`- Cycles Remaining: ${user.cyclesRemaining}`);
    console.log(`- Daily Limit: ${user.dailyLimit}`);
    console.log(`- Leads Found Today: ${user.leadsFoundToday}`);

    console.log('\n🔄 CYCLE RUN HISTORY (Last 10):');
    if (campaign.cycleRuns.length === 0) {
      console.log('No cycle runs found for this campaign.');
    } else {
      console.table(campaign.cycleRuns.map(run => ({
        ID: run.id,
        Status: run.status,
        Trigger: run.triggerType,
        LeadsFound: run.leadsFound,
        StartedAt: run.startedAt ? run.startedAt.toISOString() : 'N/A',
        Failure: run.failureReason || 'None'
      })));
    }

    // 2. Look for any active engine errors in log files or query histories if relevant
    const queries = await prisma.queryHistory.findMany({
      where: { campaignId: campaign.id }
    });
    console.log('\n🔍 QUERY HISTORY FOR THIS CAMPAIGN:');
    console.table(queries);

  } catch (error) {
    console.error('❌ Diagnostics Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnoseCampaign();
