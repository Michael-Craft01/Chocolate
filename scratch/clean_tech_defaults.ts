import prisma from '../src/lib/prisma.js';

async function main() {
  console.log('Cleaning Profiles...');
  const profileResult = await prisma.profile.updateMany({
    where: {
      industry: {
        contains: 'Technology Industry'
      }
    },
    data: {
      industry: 'Business'
    }
  });
  console.log(`Updated ${profileResult.count} profiles.`);

  console.log('Cleaning Campaigns...');
  const campaigns = await prisma.campaign.findMany();
  let updatedCount = 0;
  for (const c of campaigns) {
    if (JSON.stringify(c.industries).includes('Technology Industry')) {
      await prisma.campaign.update({
        where: { id: c.id },
        data: {
          industries: ['Business']
        }
      });
      updatedCount++;
    }
  }
  console.log(`Updated ${updatedCount} campaigns.`);
  console.log('Cleanup completed successfully!');
}

main().finally(() => prisma.$disconnect());
