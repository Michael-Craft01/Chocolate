import prisma from '../src/lib/prisma.js';

async function main() {
  const latestCycle = await prisma.cycleRun.findFirst({
    orderBy: { createdAt: 'desc' },
    include: { campaign: true }
  });
  
  if (!latestCycle) {
    console.log("❌ No cycles have been run yet.");
    return;
  }
  
  console.log("📊 LATEST CYCLE RUN DETAILS:");
  console.log(`- Campaign: ${latestCycle.campaign?.name} (ID: ${latestCycle.campaignId})`);
  console.log(`- Status: ${latestCycle.status}`);
  console.log(`- Leads Target: ${latestCycle.maxLeads}`);
  console.log(`- Leads Found: ${latestCycle.leadsFound}`);
  console.log(`- Created At: ${latestCycle.createdAt.toISOString()}`);
  
  const leads = await prisma.lead.findMany({
    where: { cycleRunId: latestCycle.id },
    include: { business: true }
  });
  
  console.log(`- Verified Leads in DB for this Cycle: ${leads.length}`);
  if (leads.length > 0) {
    leads.forEach((l, i) => {
      console.log(`  ${i+1}. ${l.business?.name} (${l.business?.email || 'No email'})`);
    });
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
