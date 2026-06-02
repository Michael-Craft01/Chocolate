import prisma from './src/lib/prisma.js';

async function main() {
  const users = await prisma.user.findMany();
  for (const user of users) {
    if (user.tier === 'ELITE') {
      console.log(`Updating cycle balances for ELITE user: ${user.email}`);
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
          monthlyCycleLimit: 40,
          cyclesRemaining: 40,
          leadsPerCycle: 75,
          maxCampaigns: 10,
          automationMode: 'AUTOMATIC',
          autoRunFrequency: 'DAILY',
          paymentStatus: 'active'
        }
      });
      console.log('✅ User updated successfully:', {
        id: updated.id,
        email: updated.email,
        tier: updated.tier,
        monthlyCycleLimit: updated.monthlyCycleLimit,
        cyclesRemaining: updated.cyclesRemaining
      });
    }
  }
}

main().finally(() => prisma.$disconnect());
