import prisma from '../src/lib/prisma.js';

async function main() {
  console.log('Searching Profiles...');
  const profiles = await prisma.profile.findMany();
  for (const p of profiles) {
    if (JSON.stringify(p).includes('Technology')) {
      console.log('FOUND in Profile:', p);
    }
  }

  console.log('Searching Campaigns...');
  const campaigns = await prisma.campaign.findMany();
  for (const c of campaigns) {
    if (JSON.stringify(c).includes('Technology')) {
      console.log('FOUND in Campaign:', c);
    }
  }
}

main().finally(() => prisma.$disconnect());
