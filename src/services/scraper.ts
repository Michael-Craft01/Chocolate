import { logger } from '../lib/logger.js';
import { playwrightScraper, ScrapedBusiness } from './playwrightScraper.js';

export { ScrapedBusiness };

export class Scraper {
    /**
     * Scrapes businesses using the internal Playwright browser.
     * This is the primary (and now only) method for finding leads.
     */
    async scrape(query: string, country: string = 'ZW'): Promise<ScrapedBusiness[]> {
        // DRY RUN: Return mock data if enabled
        if (process.env.DRY_RUN === 'true') {
            logger.info(`[DRY RUN] Skipping actual scrape for: "${query}"`);
            return [
                {
                    name: `Mock Business ${Math.floor(Math.random() * 1000)}`,
                    website: 'https://example.com',
                    phone: country === 'ZW' ? '+263771234567' : '+27112345678',
                    category: 'Mock Category',
                    email: 'mock@example.com'
                }
            ];
        }

        logger.info(`[SCRAPER] Launching Playwright browser to hunt for: "${query}"...`);
        
        try {
            const results = await playwrightScraper.scrape(query, country);
            logger.info(`[SCRAPER] Hunt complete. Found ${results.length} potential leads.`);
            return results;
        } catch (error: any) {
            logger.error({ err: error.message }, '[SCRAPER] Playwright hunt failed');
            return [];
        }
    }

    async close() {
        await playwrightScraper.close();
    }
}

export const scraper = new Scraper();
