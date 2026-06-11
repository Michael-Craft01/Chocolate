import prisma from '../src/lib/prisma.js';
import { cleanupStaleCycles } from '../src/services/databaseCleanup.js';

async function testCleanup() {
  console.log('🏁 [TEST START] Verifying cleanup thresholds...');

  // 1. Get an existing campaign/user to associate
  const user = await prisma.user.findFirst();
  const campaign = await prisma.campaign.findFirst({ where: { userId: user?.id } });

  if (!user || !campaign) {
    console.error('❌ Test prerequisite failed: No user or campaign found in database.');
    return;
  }

  console.log(`Using User: ${user.email}, Campaign: ${campaign.name}`);

  // 2. Create a mock cycle run started 2 hours ago
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const cycleRun = await prisma.cycleRun.create({
    data: {
      userId: user.id,
      campaignId: campaign.id,
      status: 'RUNNING',
      maxLeads: 10,
      leadsFound: 0,
      startedAt: twoHoursAgo,
      createdAt: twoHoursAgo,
      maxRuntimeMs: 30 * 60 * 1000 // 30 minutes limit in tier (should be ignored in cron)
    }
  });

  console.log(`Created mock cycle run ${cycleRun.id} started 2 hours ago`);

  try {
    // 3. Run cron cleanup (onStartup = false)
    console.log('⚡ Running cleanupStaleCycles(false) [Routine Cron Mode]...');
    await cleanupStaleCycles(false);

    // Verify it was NOT cleaned up (because 2 hours < 24 hours threshold)
    const runAfterCron = await prisma.cycleRun.findUnique({ where: { id: cycleRun.id } });
    if (runAfterCron?.status === 'RUNNING') {
      console.log('✅ Success: Run was NOT aborted during routine cron cleanup (spared as requested).');
    } else {
      console.error(`❌ Failure: Run was incorrectly updated to ${runAfterCron?.status} during routine cron.`);
    }

    // 4. Run startup cleanup (onStartup = true)
    console.log('⚡ Running cleanupStaleCycles(true) [Startup Boot Mode]...');
    await cleanupStaleCycles(true);

    // Verify it WAS cleaned up (because server reboot/boot fails all active cycles)
    const runAfterStartup = await prisma.cycleRun.findUnique({ where: { id: cycleRun.id } });
    if (runAfterStartup?.status === 'FAILED') {
      console.log('✅ Success: Run was correctly terminated and marked as FAILED during startup check.');
      console.log(`   Failure Reason: ${runAfterStartup.failureReason}`);
    } else {
      console.error(`❌ Failure: Run was NOT terminated during startup check (status: ${runAfterStartup?.status}).`);
    }

  } finally {
    // 5. Clean up after test
    await prisma.cycleRun.delete({ where: { id: cycleRun.id } });
    console.log('🧹 Cleaned up mock cycle run database record.');
    console.log('🏁 [TEST END] Verifying cleanup thresholds completed.');
  }
}

testCleanup().catch(console.error).finally(() => prisma.$disconnect());
