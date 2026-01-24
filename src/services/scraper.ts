import { chromium, Browser, Page } from 'playwright';
import { logger } from '../lib/logger';

export interface ScrapedBusiness {
    name: string;
    address?: string;
    category?: string;
    website?: string;
    phone?: string;
    description?: string;
}

export class Scraper {
    private browser: Browser | null = null;

    async init() {
        this.browser = await chromium.launch({ headless: true });
    }

    async scrape(query: string): Promise<ScrapedBusiness[]> {
        if (!this.browser) await this.init();
        const context = await this.browser!.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        });
        const page = await context.newPage();

        try {
            logger.info(`Scraping Google for: "${query}"`);
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=lcl`;
            await page.goto(searchUrl, { waitUntil: 'networkidle' });

            // Handle "Accept all" cookies if it appears
            const acceptBtn = await page.$('button:has-text("Accept all")');
            if (acceptBtn) await acceptBtn.click();

            // Simple extraction logic for Google Maps results
            // Note: In a real production app, selectors might need more robustness (human-like behavior)
            await page.waitForSelector('div[role="article"]', { timeout: 10000 }).catch(() => {
                logger.warn('No results found or selector timeout.');
            });

            const results = await page.$$eval('div[role="article"]', (elements) => {
                return elements.map((el) => {
                    const name = el.querySelector('div[role="heading"]')?.textContent || 'Unknown';
                    const website = (el.querySelector('a[aria-label*="Website"]') as HTMLAnchorElement)?.href || undefined;
                    const phone = el.querySelector('span:has-text("0")')?.textContent || undefined; // Very basic regex-like grab

                    return {
                        name,
                        website,
                        phone,
                    };
                });
            });

            logger.info(`Found ${results.length} potential leads.`);
            return results;

        } catch (error) {
            logger.error('Scraping error:', error);
            return [];
        } finally {
            await context.close();
        }
    }

    async close() {
        if (this.browser) await this.browser.close();
    }
}

export const scraper = new Scraper();
