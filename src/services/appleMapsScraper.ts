import { chromium } from 'playwright-extra';
// @ts-ignore
import stealth from 'puppeteer-extra-plugin-stealth';
import { Browser } from 'playwright';
import { logger } from '../lib/logger.js';
import type { ScrapedBusiness } from './playwrightScraper.js';

chromium.use(stealth());

export class AppleMapsScraper {
    private browser: Browser | null = null;

    async init() {
        if (this.browser && !this.browser.isConnected()) {
            this.browser = null;
        }
        if (!this.browser) {
            this.browser = await chromium.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-blink-features=AutomationControlled',
                    '--window-size=1920,1080',
                    '--disable-gpu',
                ],
            });
        }
    }

    async scrape(query: string, country: string = 'ZW', page: number = 1, cardLimit: number = 20): Promise<ScrapedBusiness[]> {
        await this.init();

        const context = await this.browser!.newContext({
            locale: 'en-US',
            timezoneId: 'Africa/Harare',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            viewport: { width: 1920, height: 1080 },
        });

        const p = await context.newPage();
        // Block heavy assets to speed up loading
        await p.route('**/*.{png,jpg,jpeg,gif,svg,woff,woff2,ttf,otf,css}', route => route.abort());

        const results: ScrapedBusiness[] = [];

        try {
            logger.info(`[APPLE_MAPS] Scrape started for query: "${query}" | limit: ${cardLimit}`);
            
            // Random delay to avoid detection
            const delay = 3000 + Math.floor(Math.random() * 4000);
            await p.waitForTimeout(delay);

            const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query + ' ' + country)}&iaxm=maps`;
            await p.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

            // Wait for articles to load
            try {
                await p.waitForSelector('section[scrollable="true"] article', { timeout: 20000 });
            } catch {
                logger.warn(`[APPLE_MAPS] No listings found for query "${query}"`);
                return [];
            }

            // Scroll listing panel to load enough elements
            let cardsCount = await p.evaluate(() => document.querySelectorAll('section[scrollable="true"] article').length);
            let scrolls = 0;
            while (cardsCount < cardLimit && scrolls < 10) {
                await p.evaluate(() => {
                    const scrollContainer = document.querySelector('section[scrollable="true"]');
                    if (scrollContainer) {
                        scrollContainer.scrollTop += 1000;
                    }
                });
                await p.waitForTimeout(1500);
                const currentCount = await p.evaluate(() => document.querySelectorAll('section[scrollable="true"] article').length);
                if (currentCount === cardsCount) break; // Stalled
                cardsCount = currentCount;
                scrolls++;
            }

            // Collect items
            const articles = await p.evaluate(() => {
                const list = Array.from(document.querySelectorAll('section[scrollable="true"] article'));
                return list.map((art, index) => {
                    const h2Text = art.querySelector('h2')?.textContent || '';
                    // Clean rank prefix like "1. Café Pistachio" -> "Café Pistachio"
                    const name = h2Text.replace(/^\d+\.\s*/, '').trim();
                    return {
                        name,
                        index
                    };
                }).filter(a => a.name.length > 0);
            });

            const targets = articles.slice(0, cardLimit);
            logger.info(`[APPLE_MAPS] Crawling ${targets.length} listings sequentially`);

            for (const target of targets) {
                try {
                    // Click the article at index to open detail view
                    const articleSelector = `section[scrollable="true"] article`;
                    const listArticles = p.locator(articleSelector);
                    await listArticles.nth(target.index).click();
                    await p.waitForTimeout(2000);

                    // Extract data from details sidebar
                    const details = await p.evaluate(() => {
                        let phone = '';
                        let website = '';
                        let address = '';

                        // Phone
                        const telLink = document.querySelector('section[scrollable="true"] a[href^="tel:"]') as HTMLAnchorElement;
                        if (telLink) {
                            phone = telLink.href.replace('tel:', '').trim();
                        }

                        // Website
                        const webLink = document.querySelector('section[scrollable="true"] a[href^="http"]:not([href*="tripadvisor.com"]):not([href*="duckduckgo.com"]):not([href*="apple.com"])') as HTMLAnchorElement;
                        if (webLink) {
                            website = webLink.href;
                        }

                        // Address: Find the element with text "Address" and extract next sibling
                        const addressLabel = Array.from(document.querySelectorAll('section[scrollable="true"] *')).find(el => el.textContent === 'Address');
                        if (addressLabel && addressLabel.nextElementSibling) {
                            address = addressLabel.nextElementSibling.textContent || '';
                        }

                        return { phone, website, address };
                    });

                    results.push({
                        name: target.name,
                        website: details.website || null,
                        phone: details.phone || null,
                        address: details.address || null,
                        category: 'Apple Maps Listing'
                    });

                    logger.info(`[APPLE_MAPS] Extracted: "${target.name}" | Web: ${details.website ? 'yes' : 'no'} | Phone: ${details.phone || 'none'}`);

                    // Click back button to return to list
                    const backButton = p.locator('section[scrollable="true"] button').first();
                    if (await backButton.count() > 0) {
                        await backButton.click();
                        await p.waitForTimeout(1000);
                    }
                } catch (err: any) {
                    logger.warn(`[APPLE_MAPS] Failed to extract listing details: ${err.message}`);
                }
            }

        } catch (err: any) {
            logger.error({ err }, '[APPLE_MAPS] Scraping session crashed');
        } finally {
            await context.close();
        }

        return results;
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
}

export const appleMapsScraper = new AppleMapsScraper();
