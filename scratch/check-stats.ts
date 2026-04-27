import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.count();
  const campaigns = await prisma.campaign.count();
  const leads = await prisma.lead.count();
  const businesses = await prisma.business.count();
  
  console.log(`--- Statistics ---`);
  console.log(`Users: ${users}`);
  console.log(`Campaigns: ${campaigns}`);
  console.log(`Leads: ${leads}`);
  console.log(`Businesses: ${businesses}`);

  const recentLeads = await prisma.lead.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { business: true }
  });

  console.log('\n--- Recent Leads ---');
  recentLeads.forEach(l => {
    console.log(`[${l.createdAt.toISOString()}] ${l.business.name} | ${l.industry}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
