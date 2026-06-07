import { logger } from '../lib/logger.js';
import { playwrightScraper } from './playwrightScraper.js';
import type { ScrapedBusiness } from './playwrightScraper.js';

export type { ScrapedBusiness };

export interface Scraper {
    scrape(query: string, country: string, page?: number, cardLimit?: number): Promise<ScrapedBusiness[]>;
}

export class Scraper {
    /**
     * Scrapes businesses using the Playwright browser sweep.
     * @param query      Search query string
     * @param country    Country code (default: 'ZW')
     * @param page       Legacy page param (unused)
     * @param cardLimit  Max number of listing cards to visit per query (default: 40)
     */
    async scrape(query: string, country: string = 'ZW', page: number = 1, cardLimit: number = 40): Promise<ScrapedBusiness[]> {
        // DRY RUN: Return mock data if enabled
        if (process.env.DRY_RUN === 'true') {
            logger.info(`[DRY RUN] Skipping actual scrape for: "${query}"`);
            // Return multiple mocks to simulate scroll capacity
            return Array.from({ length: Math.min(cardLimit, 40) }, (_, i) => ({
                name: `Mock Business ${i + 1} - ${Math.floor(Math.random() * 9000) + 1000}`,
                website: `https://mock-business-${i + 1}.example.com`,
                phone: country === 'ZW' ? `+2637712345${String(i).padStart(2, '0')}` : `+2711234${String(i).padStart(4, '0')}`,
                category: 'Mock Category',
                email: `business${i + 1}@example.com`
            }));
        }

        // Browser Sweep via Playwright
        logger.info(`[SCRAPER] Launching Playwright browser sweep for: "${query}" | cardLimit: ${cardLimit}`);
        try {
            const results = await playwrightScraper.scrape(query, country, page, cardLimit);
            logger.info(`[SCRAPER] Browser sweep complete. Found ${results.length} leads.`);
            return results;
        } catch (error: any) {
            logger.error({ err: error.message }, '[SCRAPER] Browser sweep failed');
            return [];
        }
    }

    async close() {
        await playwrightScraper.close();
    }
}

export const scraper = new Scraper();
