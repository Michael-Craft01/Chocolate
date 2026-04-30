import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const txs = await prisma.transaction.findMany({
    where: { userId: "8402e1ea-d8cc-4c17-a92a-4e2d4c17d696" }
  });
  console.log('--- TRANSACTIONS FOR USER ---');
  console.log(JSON.stringify(txs, null, 2));
  console.log('-------------------');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
