import prisma from './src/lib/prisma.js';

async function main() {
  const users = await prisma.user.findMany({
    include: { profile: true }
  });
  
  console.log('--- USER PROFILE AND CYCLE WALLETS ---');
  for (const user of users) {
    console.log({
      id: user.id,
      email: user.email,
      tier: user.tier,
      monthlyCycleLimit: user.monthlyCycleLimit,
      cyclesRemaining: user.cyclesRemaining,
      dailyLimit: user.dailyLimit,
      leadsPerCycle: user.leadsPerCycle,
      company: user.profile?.companyName
    });
  }
}

main().finally(() => prisma.$disconnect());
