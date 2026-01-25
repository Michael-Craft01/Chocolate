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
        this.browser = await chromium.launch({
            headless: true,
            args: ['--disable-blink-features=AutomationControlled'],
        });
    }

    async scrape(query: string): Promise<ScrapedBusiness[]> {
        if (!this.browser) await this.init();
        const context = await this.browser!.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            extraHTTPHeaders: {
                'Accept-Language': 'en-US,en;q=0.9',
            },
        });
        const page = await context.newPage();

        try {
            logger.info(`Scraping Google for: "${query}"`);

            // Navigate to Google home first to mimic human behavior
            await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded', timeout: 60000 });

            // Handle "Accept all" cookies if it appears
            const acceptBtn = await page.$('button:has-text("Accept all")');
            if (acceptBtn) await acceptBtn.click();

            // Type the query
            await page.fill('textarea[name="q"]', query);
            await page.keyboard.press('Enter');

            // Wait for results to load
            await page.waitForTimeout(5000);

            // Click on "Maps" or "More places" if available to ensure we get local results
            // Note: This is tricky as the selector changes. We might need to construct the URL if this fails.
            // But let's try direct URL navigation *after* establishing a session if typing fails to get local results.

            const placesLink = await page.$('a:has-text("Maps")');
            if (placesLink) {
                 await placesLink.click();
                 await page.waitForTimeout(3000);
            } else {
                 // Fallback: Force navigation to local results preserving the session
                 const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=lcl`;
                 await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
            }

            // Manual wait to allow dynamic content/scripts to settle
            await page.waitForTimeout(5000);

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
                        (el.querySelector('a[href^="http"]:not([href*="google"])') as HTMLAnchorElement)?.href ||
                        undefined;

                    // Try different selectors for Phone
                    // Look for sequences of digits that resemble a phone number (at least 6 digits roughly)
                    const phoneRegex = /(\+?\d[\d\s-]{5,}\d)/;
                    let phone: string | undefined = undefined;

                    // 1. Try finding in specific known containers first
                    const phoneEl =
                        findByRegex('span', phoneRegex) ||
                        findByRegex('div', phoneRegex) ||
                        el.querySelector('.LrzPdb');

                    if (phoneEl?.textContent) {
                        phone = phoneEl.textContent;
                    } else {
                        // 2. Fallback: Search the full text of the card but try to extract just the number
                        // This is riskier but catches cases where the number isn't in a nice span
                        const fullText = el.textContent || '';
                        const match = fullText.match(phoneRegex);
                        if (match) {
                            phone = match[0];
                        }
                    }

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
