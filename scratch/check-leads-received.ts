import { PrismaClient } from '@prisma/client';

async function checkLeads() {
  const prisma = new PrismaClient();
  try {
    const campaign = await prisma.campaign.findFirst({
      where: { name: { contains: 'Custom Software' } },
      include: {
        _count: { select: { leads: true } },
        cycleRuns: {
          orderBy: { createdAt: 'desc' },
          take: 3
        }
      }
    });

    if (!campaign) {
      console.log('Campaign not found.');
      return;
    }

    console.log(`Campaign Name: ${campaign.name}`);
    console.log(`Current Leads Count: ${campaign._count.leads}`);
    console.log('\nLatest Cycle Runs:');
    console.table(campaign.cycleRuns.map(run => ({
      ID: run.id,
      Status: run.status,
      LeadsFound: run.leadsFound,
      StartedAt: run.startedAt,
      CompletedAt: run.completedAt,
      Failure: run.failureReason || 'None'
    })));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

checkLeads();
