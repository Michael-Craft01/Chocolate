import dotenv from 'dotenv';
dotenv.config();

import prisma from '../src/lib/prisma.js';
import { queryGenerator } from '../src/services/queryGenerator.js';

async function main() {
  const campaign = await prisma.campaign.findFirst({
    where: { name: 'Main Engine' }
  });

  if (!campaign) {
    console.error("No campaign found!");
    return;
  }

  console.log("Campaign Industries:", campaign.industries);
  console.log("Campaign Locations:", campaign.locations);

  const queries = await queryGenerator.generateBatchQueries(5, campaign);
  console.log("\n=================== GENERATED QUERIES ===================");
  console.log(queries);
  console.log("=========================================================");
}

main().catch(console.error).finally(() => prisma.$disconnect());
