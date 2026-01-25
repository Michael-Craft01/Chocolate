import { chromium, Browser, Page } from 'playwright';
import { logger } from '../lib/logger.js';

export interface ScrapedBusiness {
    name: string;
    address?: string | null;
    category?: string | null;
    website?: string | null;
    phone?: string | null;
    description?: string | null;
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
            await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });

            // Manual wait to allow dynamic content/scripts to settle
            await page.waitForTimeout(5000);

            // Handle "Accept all" cookies if it appears
            const acceptBtn = await page.$('button:has-text("Accept all")');
            if (acceptBtn) await acceptBtn.click();

            // Enhanced extraction logic
            // Try multiple selectors for result containers
            const resultSelector = [
                'div[role="article"]',
                '.VkpGBb', // Google Local snippet
                '.u30pqe', // Alternate local snippet
                'div[data-cid]', // Elements with cid (common in local results)
            ].join(',');

            await page.waitForSelector(resultSelector, { timeout: 15000 }).catch(() => {
                logger.warn('No robust results found or selector timeout.');
            });

            const results = await page.$$eval(resultSelector, (elements) => {
                return elements.map((el) => {
                    const findByText = (tag: string, text: string) => {
                        const nodes = Array.from(el.querySelectorAll(tag));
                        return nodes.find(n => n.textContent && n.textContent.includes(text));
                    };

                    const findByRegex = (tag: string, regex: RegExp) => {
                        const nodes = Array.from(el.querySelectorAll(tag));
                        return nodes.find(n => n.textContent && regex.test(n.textContent));
                    };

                    // Try different selectors for Name
                    const name =
                        el.querySelector('div[role="heading"]')?.textContent ||
                        el.querySelector('.OSrXXb')?.textContent ||
                        el.querySelector('.V_P8d')?.textContent ||
                        'Unknown';

                    // Try different selectors for Website
                    const website =
                        (el.querySelector('a[aria-label*="Website"]') as HTMLAnchorElement)?.href ||
                        (findByText('a', 'Website') as HTMLAnchorElement)?.href ||
                        undefined;

                    // Try different selectors for Phone
                    // Look for sequences of digits that resemble a phone number (at least 6 digits roughly)
                    const phoneRegex = /(\+?\d[\d\s-]{5,}\d)/;
                    const phoneEl =
                        findByRegex('span', phoneRegex) ||
                        el.querySelector('.LrzPdb');

                    const phone = phoneEl?.textContent || undefined;

                    return {
                        name: name.trim(),
                        website,
                        phone: phone?.trim(),
                    };
                }).filter(r => r.name !== 'Unknown');
            });

            logger.info(`Found ${results.length} potential leads.`);
            return results;

        } catch (error) {
            logger.error({ err: error }, 'Scraping error:');
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
