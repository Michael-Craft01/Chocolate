import prisma from './src/lib/prisma.js';

async function main() {
  console.log('🧹 Starting lead and campaign cleanup...');
  try {
    const leadCount = await prisma.lead.deleteMany({});
    console.log(`✅ Deleted ${leadCount.count} leads.`);

    const cycleRunCount = await prisma.cycleRun.deleteMany({});
    console.log(`✅ Deleted ${cycleRunCount.count} cycle runs.`);

    const queryHistoryCount = await prisma.queryHistory.deleteMany({});
    console.log(`✅ Deleted ${queryHistoryCount.count} query history records.`);

    const campaignCount = await prisma.campaign.deleteMany({});
    console.log(`✅ Deleted ${campaignCount.count} campaigns.`);

    const businessCount = await prisma.business.deleteMany({});
    console.log(`✅ Deleted ${businessCount.count} businesses.`);

    console.log('🎉 Cleanup complete. Database is fresh for campaign and lead discovery!');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
