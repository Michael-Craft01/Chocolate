import dotenv from 'dotenv';
dotenv.config();

import { scraper } from '../src/services/scraper.js';

async function main() {
  console.log("Testing Google Maps Scraper...");
  try {
    // Run scrape for IT services in Harare ZW
    const results = await scraper.scrape("IT services", "ZW");
    console.log(`\n=================== SCRAPE RESULTS ===================`);
    console.log(`Found ${results.length} results:`);
    console.log(JSON.stringify(results, null, 2));
    console.log("======================================================");
  } catch (error) {
    console.error("Scrape failed:", error);
  } finally {
    await scraper.close();
  }
}

main();
