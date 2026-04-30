import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const campaigns = await prisma.campaign.findMany();
  console.log('--- CAMPAIGNS IN DB ---');
  console.log(JSON.stringify(campaigns, null, 2));
  console.log('-------------------');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
