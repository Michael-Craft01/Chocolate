import dotenv from 'dotenv';
dotenv.config();

import prisma from '../src/lib/prisma.js';
import { createAndRunCampaignCycle } from '../src/services/discoveryEngine.js';

async function main() {
  const campaign = await prisma.campaign.findFirst({
    where: { name: 'Main Engine' }
  });

  if (!campaign) {
    console.error("No active campaign found to trigger!");
    return;
  }

  console.log(`🚀 Triggering Campaign Cycle for: ${campaign.name} (ID: ${campaign.id})...`);
  
  try {
    const cycle = await createAndRunCampaignCycle(campaign.id, campaign.userId, 'MANUAL');
    console.log("✅ Cycle successfully queued/started:", {
      id: cycle.id,
      status: cycle.status,
      maxLeads: cycle.maxLeads,
      cyclesRemainingAfterDecrease: await prisma.user.findUnique({
        where: { id: campaign.userId },
        select: { cyclesRemaining: true }
      }).then(u => u?.cyclesRemaining)
    });
  } catch (error) {
    console.error("❌ Failed to trigger cycle:", error);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
