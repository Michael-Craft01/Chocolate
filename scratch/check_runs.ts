import prisma from '../src/lib/prisma.js';

async function main() {
  const cycles = await prisma.cycleRun.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: { campaign: true }
  });

  console.log("📊 RECENT CYCLE RUNS:");
  for (const c of cycles) {
    console.log({
      id: c.id,
      campaignName: c.campaign?.name,
      status: c.status,
      triggerType: c.triggerType,
      leadsFound: c.leadsFound,
      failureReason: c.failureReason,
      createdAt: c.createdAt.toISOString()
    });
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
