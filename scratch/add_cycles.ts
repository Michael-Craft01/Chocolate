import prisma from '../src/lib/prisma.js';

const email = 'thinkworkfirst@gmail.com';
const cyclesToAdd = 10;

const user = await prisma.user.findFirst({ where: { email } });
if (!user) { console.error('User not found'); process.exit(1); }

console.log('Before:', {
  email: user.email,
  tier: user.tier,
  cyclesRemaining: user.cyclesRemaining,
  paymentStatus: user.paymentStatus
});

const updated = await prisma.user.update({
  where: { id: user.id },
  data: { cyclesRemaining: { increment: cyclesToAdd } }
});

console.log(`✅ Added ${cyclesToAdd} cycles. New balance: ${updated.cyclesRemaining}`);
await prisma.$disconnect();
