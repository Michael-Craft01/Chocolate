import prisma from '../src/lib/prisma.js';
import { runCampaignCycle } from '../src/services/discoveryEngine.js';

async function main() {
  console.log("Setting up campaign pause test...");

  // 1. Create a temporary campaign
  const campaign = await prisma.campaign.create({
    data: {
      userId: "8402e1ea-d8cc-4c17-a92a-4e2d4c17d696",
      name: "Temporary Pause Test",
      senderName: "Tester",
      senderRole: "QA",
      companyName: "QA Inc",
      targetCountry: "ZW",
      locations: ["Harare"],
      industries: ["IT services"],
      productName: "QA Tool",
      productDescription: "Continuous integration and QA testing automated frameworks.",
      targetPainPoints: "Lack of testing resources",
      outreachTone: "PROFESSIONAL"
    }
  });

  // 2. Create a CycleRun in RUNNING state
  const cycle = await prisma.cycleRun.create({
    data: {
      userId: "8402e1ea-d8cc-4c17-a92a-4e2d4c17d696",
      campaignId: campaign.id,
      triggerType: "MANUAL",
      maxLeads: 10,
      maxRuntimeMs: 60000,
      status: "QUEUED"
    }
  });

  console.log(`Created campaign ${campaign.id} and cycle ${cycle.id}`);

  // 3. Start running the cycle in the background
  const runPromise = runCampaignCycle(cycle.id);

  // 4. Wait 3 seconds, then pause the campaign
  await new Promise(r => setTimeout(r, 3000));
  console.log("Pausing campaign in DB...");
  await prisma.campaign.update({
    where: { id: campaign.id },
    data: { status: "PAUSED" }
  });

  // Also simulate what the API route does by marking the cycle as FAILED
  await prisma.cycleRun.updateMany({
    where: { campaignId: campaign.id, status: { in: ['QUEUED', 'RUNNING'] } },
    data: { status: 'FAILED', failureReason: 'Campaign paused by user', completedAt: new Date() }
  });

  // 5. Wait for the cycle run promise to resolve
  const result = await runPromise;
  console.log("Cycle run completed with status:", result?.status, "failureReason:", result?.failureReason);

  // 6. Clean up
  await prisma.lead.deleteMany({ where: { campaignId: campaign.id } });
  await prisma.cycleRun.deleteMany({ where: { campaignId: campaign.id } });
  await prisma.campaign.delete({ where: { id: campaign.id } });

  console.log("Cleanup complete!");
  if (result?.status === 'FAILED' && result?.failureReason === 'Campaign paused by user') {
    console.log("✅ Test passed: Paused campaign aborted cycle correctly!");
  } else {
    console.error("❌ Test failed: Cycle did not abort or status was overwritten!");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
