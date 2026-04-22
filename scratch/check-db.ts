import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkUser() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 1
  });
  
  if (users.length === 0) {
    console.log("No users found in database.");
    return;
  }

  const user = users[0];
  console.log("\n--- Latest User Status ---");
  console.log(`Email: ${user.email}`);
  console.log(`Tier: ${user.tier}`);
  console.log(`Payment Status: ${user.paymentStatus}`);
  
  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 3
  });
  
  console.log("\n--- Recent Transactions ---");
  transactions.forEach(t => {
    console.log(`[${t.createdAt.toISOString()}] ${t.gateway} | ${t.type} | ${t.amount} | Status: ${t.status}`);
  });
}

checkUser()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
