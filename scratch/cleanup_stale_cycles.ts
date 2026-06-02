import prisma from '../src/lib/prisma.js';

async function main() {
  // Find all stale cycle runs (status is RUNNING or QUEUED, and created more than 10 minutes ago)
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const staleCycles = await prisma.cycleRun.findMany({
    where: {
      status: { in: ['QUEUED', 'RUNNING'] },
      createdAt: { lt: tenMinutesAgo }
    },
    include: { campaign: true }
  });

  if (staleCycles.length === 0) {
    console.log("✅ No stale cycle runs found.");
    return;
  }

  console.log(`🧹 Found ${staleCycles.length} stale cycle run(s). Cleaning up...`);

  for (const cycle of staleCycles) {
    console.log(`- Cycle ${cycle.id} (${cycle.campaign?.name || 'Unknown Campaign'}) was in status: ${cycle.status}`);

    // Update cycle status to FAILED
    await prisma.cycleRun.update({
      where: { id: cycle.id },
      data: {
        status: 'FAILED',
        failureReason: 'Server interrupted / crashed',
        completedAt: new Date()
      }
    });

    // Refund 1 cycle to the user if they had 0 leads found
    if (cycle.leadsFound === 0) {
      console.log(`  🔄 Refunding 1 cycle to User ${cycle.userId}...`);
      await prisma.user.update({
        where: { id: cycle.userId },
        data: {
          cyclesRemaining: { increment: 1 }
        }
      });
    }
  }

  console.log("🎉 Database cleanup and cycle refunds complete.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
