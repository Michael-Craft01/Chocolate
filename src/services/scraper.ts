import { logger } from '../lib/logger.js';
import { playwrightScraper } from './playwrightScraper.js';
import { serperScraper } from './serperScraper.js';
import { config } from '../config.js';
import type { ScrapedBusiness } from './playwrightScraper.js';

export type { ScrapedBusiness };

export class Scraper {
    /**
     * Scrapes businesses using the most reliable source available.
     * Prioritizes API-based search to avoid bot detection/throttling.
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

        let results: ScrapedBusiness[] = [];

        // 1. Try Serper API (Primary - Zero Throttling)
        if (config.SERPER_API_KEY) {
            try {
                results = await serperScraper.scrape(query, country);
                if (results.length > 0) {
                    logger.info(`[SCRAPER] Successfully secured ${results.length} leads via high-reliability API.`);
                    return results;
                }
            } catch (error: any) {
                logger.warn(`[SCRAPER] API search failed, attempting browser sweep: ${error.message}`);
            }
        }

        // 2. Fallback to Playwright (Browser Sweep)
        logger.info(`[SCRAPER] Launching Playwright browser sweep for: "${query}"...`);
        try {
            results = await playwrightScraper.scrape(query, country);
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
