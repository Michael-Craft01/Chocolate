import { chromium } from 'playwright-extra';
// @ts-ignore
import stealth from 'puppeteer-extra-plugin-stealth';
import { Browser } from 'playwright';
import { logger } from '../lib/logger.js';

chromium.use(stealth());

export interface ScrapedBusiness {
    name: string;
    website?: string | null;
    phone?: string | null;
    email?: string | null;
    category?: string | null;
    address?: string | null;
}

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
];

export class PlaywrightScraper {
    private browser: Browser | null = null;

    async init() {
        if (this.browser && !this.browser.isConnected()) {
            logger.warn('[SCRAPER] Browser disconnected, re-initializing...');
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

    async scrape(query: string, country: string = 'ZW', _page: number = 1): Promise<ScrapedBusiness[]> {
        await this.init();

        const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
        const context = await this.browser!.newContext({
            locale: 'en-US',
            timezoneId: 'Africa/Harare',
            userAgent,
            viewport: { width: 1920, height: 1080 },
            extraHTTPHeaders: { 'Accept-Language': 'en-US,en;q=0.9' },
        });

        const p = await context.newPage();
        // Block images/fonts/styles to speed up loading
        await p.route('**/*.{png,jpg,jpeg,gif,svg,woff,woff2,ttf,otf}', route => route.abort());

        const results: ScrapedBusiness[] = [];

        try {
            logger.info(`[ENGINE] High-Fidelity Lead Extraction: ${query}...`);

            // Stealth delay before hitting Google
            const delay = 6000 + Math.floor(Math.random() * 10000);
            logger.info(`[STEALTH] Cooling down for ${Math.round(delay / 1000)}s before Google Maps...`);
            await p.waitForTimeout(delay);

            // ── Step 1: Load search results page ──
            const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(query + ' ' + country)}`;
            logger.info(`[PLAYWRIGHT] Loading Google Maps for: "${query}"`);

            await p.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

            // Wait for result cards to appear
            try {
                await p.waitForSelector('div[role="feed"] .hfpxzc', { timeout: 20000 });
            } catch {
                logger.warn(`[SCRAPER] No result cards found for: "${query}"`);
                return results;
            }

            // Scroll a bit to trigger lazy loading
            await p.mouse.wheel(0, 800);
            await p.waitForTimeout(1500);
            await p.mouse.wheel(0, 800);
            await p.waitForTimeout(1000);

            // ── Step 2: Collect all place URLs from the feed ──
            const placeCards = await p.evaluate(() => {
                const cards = Array.from(document.querySelectorAll('div[role="feed"] .hfpxzc'));
                return cards
                    .map(el => ({
                        name: el.getAttribute('aria-label')?.trim() || '',
                        href: (el as HTMLAnchorElement).href || '',
                    }))
                    .filter(c => c.name.length > 2 && c.href.includes('/maps/place/'));
            });

            logger.info(`[PLAYWRIGHT] Found ${placeCards.length} place cards in feed.`);

            // ── Step 3: Navigate to each place page to extract details ──
            const seen = new Set<string>();
            for (const card of placeCards.slice(0, 15)) {
                if (seen.has(card.name.toLowerCase())) continue;
                seen.add(card.name.toLowerCase());

                try {
                    // Navigate directly to the place page
                    await p.goto(card.href, { waitUntil: 'domcontentloaded', timeout: 30000 });
                    await p.waitForTimeout(2000);

                    // Wait for the phone/website section to load in the detail panel
                    await p.waitForSelector(
                        'button.CsEnBe[aria-label^="Phone:"], a[href^="tel:"], a.CsEnBe[href^="http"]',
                        { timeout: 8000 }
                    ).catch(() => {});

                    const details = await p.evaluate((): {
                        phone: string; website: string; address: string; category: string;
                    } => {
                        let phone = '';
                        let website = '';
                        let address = '';
                        let category = '';

                        // ── Phone: button.CsEnBe with aria-label starting "Phone:" (confirmed real selector) ──
                        const phoneBtn = document.querySelector('button.CsEnBe[aria-label^="Phone:"]');
                        if (phoneBtn) {
                            // The number is both in aria-label AND in the inner div text
                            const inner = phoneBtn.querySelector('div.fontBodyMedium');
                            phone = inner?.textContent?.trim() ||
                                    phoneBtn.getAttribute('aria-label')?.replace(/^Phone:\s*/i, '').trim() || '';
                        }

                        // ── Phone: tel: href link (a[href^="tel:"]) ──
                        if (!phone) {
                            const tel = document.querySelector('a[href^="tel:"]');
                            if (tel) phone = (tel as HTMLAnchorElement).href.replace('tel:', '').trim();
                        }

                        // ── Phone: data-item-id contains phone:tel: ──
                        if (!phone) {
                            const allItems = Array.from(document.querySelectorAll('[data-item-id]'));
                            for (const el of allItems) {
                                const id = el.getAttribute('data-item-id') || '';
                                const m = id.match(/phone:tel:(.+)/i);
                                if (m && m[1]) { phone = decodeURIComponent(m[1]); break; }
                            }
                        }

                        // ── Phone: WhatsApp wa.me links ──
                        if (!phone) {
                            const wa = document.querySelector('a[href*="wa.me/"]');
                            if (wa) {
                                const m = (wa as HTMLAnchorElement).href.match(/wa\.me\/(\+?\d+)/);
                                if (m && m[1]) phone = '+' + m[1].replace(/^\+/, '');
                            }
                        }

                        // ── Website: a.CsEnBe with aria-label starting "Website:" ──
                        const webLink = document.querySelector('a.CsEnBe[aria-label^="Website:"]') as HTMLAnchorElement;
                        if (webLink?.href && !webLink.href.includes('google.com')) {
                            website = webLink.href;
                        }

                        // ── Address: button.CsEnBe with aria-label starting "Address:" ──
                        const addrBtn = document.querySelector('button.CsEnBe[aria-label^="Address:"]');
                        if (addrBtn) {
                            const inner = addrBtn.querySelector('div.fontBodyMedium');
                            address = inner?.textContent?.trim() ||
                                      addrBtn.getAttribute('aria-label')?.replace(/^Address:\s*/i, '').trim() || '';
                        }

                        // ── Category: button.DkEaL (confirmed real selector) ──
                        category = document.querySelector('button.DkEaL')?.textContent?.trim() || '';

                        return { phone, website, address, category };
                    });

                    results.push({
                        name: card.name,
                        phone: details.phone || null,
                        website: details.website || null,
                        address: details.address || null,
                        category: details.category || 'Google Maps Listing',
                    });

                    logger.info(
                        `[PLAYWRIGHT] Extracted: "${card.name}" | Phone: ${details.phone || 'none'} | Web: ${details.website ? 'yes' : 'no'}`
                    );

                } catch (err: any) {
                    logger.warn(`[PLAYWRIGHT] Failed to load place page for "${card.name}": ${err.message}`);
                }
            }

            logger.info(`[PLAYWRIGHT] Secured ${results.length} leads from Google Maps.`);
            logger.info(`[ENGINE] Extraction complete. ${results.length} high-fidelity leads secured.`);

        } catch (err: any) {
            logger.error(`[ERROR] Critical engine failure: ${err.message}`);
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

export const playwrightScraper = new PlaywrightScraper();
