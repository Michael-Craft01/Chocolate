import prisma from '../src/lib/prisma.js';

async function main() {
  const count = await prisma.lead.count();
  console.log(`Total leads in DB: ${count}`);
  const leads = await prisma.lead.findMany({
    take: 10,
    include: { business: true }
  });
  for (const l of leads) {
    console.log(`- Lead ID: ${l.id}, Business: ${l.business.name}, Phone: ${l.business.phone}, Email: ${l.business.email}, Website: ${l.business.website}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
