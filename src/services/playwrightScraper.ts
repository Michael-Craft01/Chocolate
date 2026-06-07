import { chromium } from 'playwright-extra';
// @ts-ignore
import stealth from 'puppeteer-extra-plugin-stealth';
import { Browser, Page } from 'playwright';
import { logger } from '../lib/logger.js';

chromium.use(stealth());

export interface ScrapedBusiness {
    name: string;
    website?: string | null;
    phone?: string | null;
    email?: string | null;
    contactPages?: string[];
    socialProfiles?: string[];
    decisionMakers?: Array<{ name: string; role?: string | null; profileUrl?: string | null; sourceUrl?: string | null; confidence?: number | null }>;
    contactStatus?: string | null;
    bestContactChannel?: string | null;
    contactConfidence?: number | null;
    contactEvidence?: string[];
    category?: string | null;
    address?: string | null;
}

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
];

// ── Scroll the Google Maps results feed to trigger lazy loading of additional cards ──
async function scrollFeedToLoadMore(page: Page, targetCards: number, timeoutMs: number = 28000): Promise<void> {
    const deadline = Date.now() + timeoutMs;

    try {
        await Promise.race([
            (async () => {
                let lastCount = 0;
                let stalledRounds = 0;

                while (Date.now() < deadline) {
                    // Scroll inside the feed panel (left sidebar on Google Maps)
                    await page.evaluate(() => {
                        const feed = document.querySelector('div[role="feed"]');
                        if (feed) {
                            feed.scrollTop += 1200;
                        } else {
                            window.scrollBy(0, 800);
                        }
                    });

                    await page.waitForTimeout(1800);

                    const currentCount = await page.evaluate(() => {
                        return document.querySelectorAll('div[role="feed"] .hfpxzc').length;
                    });

                    logger.info(`[SCROLL] Cards visible: ${currentCount} / target: ${targetCards}`);

                    if (currentCount >= targetCards) break;

                    // Detect stall — if count hasn't grown in 2 rounds, we've hit the bottom
                    if (currentCount === lastCount) {
                        stalledRounds++;
                        if (stalledRounds >= 2) {
                            logger.info(`[SCROLL] Feed stalled at ${currentCount} cards. Stopping scroll.`);
                            break;
                        }
                    } else {
                        stalledRounds = 0;
                    }

                    lastCount = currentCount;
                }
            })(),
            new Promise<void>((_, reject) =>
                setTimeout(() => reject(new Error('Scroll timeout')), timeoutMs)
            )
        ]);
    } catch (err: any) {
        // Timeout is acceptable — we just use whatever cards we have
        logger.warn(`[SCROLL] ${err.message} — proceeding with cards loaded so far`);
    }
}

// ── Extract all visible place card links from the current feed state ──
async function collectPlaceCards(page: Page): Promise<Array<{ name: string; href: string }>> {
    return page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('div[role="feed"] .hfpxzc'));
        return cards
            .map(el => ({
                name: el.getAttribute('aria-label')?.trim() || '',
                href: (el as HTMLAnchorElement).href || '',
            }))
            .filter(c => c.name.length > 2 && c.href.includes('/maps/place/'));
    });
}

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

    /**
     * Scrape Google Maps for businesses matching the query.
     * @param query         Search query string
     * @param country       Country code or name (appended to query)
     * @param _page         Legacy pagination param (unused — we use scroll instead)
     * @param cardLimit     Maximum number of place cards to visit and extract (default: 40)
     */
    async scrape(query: string, country: string = 'ZW', _page: number = 1, cardLimit: number = 40): Promise<ScrapedBusiness[]> {
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
        // Block heavy assets to speed up loading — we only need DOM content
        await p.route('**/*.{png,jpg,jpeg,gif,svg,woff,woff2,ttf,otf,css}', route => route.abort());

        const results: ScrapedBusiness[] = [];

        try {
            logger.info(`[ENGINE] High-Fidelity Lead Extraction | Limit: ${cardLimit} | Query: ${query}`);

            // ── Stealth delay before hitting Google ──
            const delay = 5000 + Math.floor(Math.random() * 8000);
            logger.info(`[STEALTH] Cooling down for ${Math.round(delay / 1000)}s before Google Maps...`);
            await p.waitForTimeout(delay);

            // ── Step 1: Load search results page ──
            const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(query + ' ' + country)}`;
            logger.info(`[PLAYWRIGHT] Loading Google Maps for: "${query}"`);

            await p.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

            // Wait for the initial feed to populate
            try {
                await p.waitForSelector('div[role="feed"] .hfpxzc', { timeout: 20000 });
            } catch {
                logger.warn(`[SCRAPER] No result cards found for: "${query}"`);
                return results;
            }

            // ── Step 2: Scroll feed to load more cards up to cardLimit ──
            // Only scroll if we need more than what the first paint shows (~15)
            const initialCount = await p.evaluate(() =>
                document.querySelectorAll('div[role="feed"] .hfpxzc').length
            );

            if (initialCount < cardLimit) {
                logger.info(`[SCROLL] Initial cards: ${initialCount}. Scrolling to reach ${cardLimit}...`);
                await scrollFeedToLoadMore(p, cardLimit, 28000);
            }

            // ── Step 3: Collect all place card URLs after scrolling ──
            const placeCards = await collectPlaceCards(p);
            logger.info(`[PLAYWRIGHT] Found ${placeCards.length} place cards total after scroll.`);

            const targetCards = placeCards.slice(0, cardLimit);

            // ── Step 4: Navigate to each place page to extract details ──
            const seen = new Set<string>();
            for (const card of targetCards) {
                if (seen.has(card.name.toLowerCase())) continue;
                seen.add(card.name.toLowerCase());

                try {
                    await p.goto(card.href, { waitUntil: 'domcontentloaded', timeout: 30000 });
                    await p.waitForTimeout(1800);

                    // Wait for the contact/phone/website section to appear
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

                        // ── Phone: button.CsEnBe with aria-label starting "Phone:" ──
                        const phoneBtn = document.querySelector('button.CsEnBe[aria-label^="Phone:"]');
                        if (phoneBtn) {
                            const inner = phoneBtn.querySelector('div.fontBodyMedium');
                            phone = inner?.textContent?.trim() ||
                                    phoneBtn.getAttribute('aria-label')?.replace(/^Phone:\s*/i, '').trim() || '';
                        }

                        // ── Phone: tel: href link ──
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

                        // ── Category: button.DkEaL ──
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

            logger.info(`[PLAYWRIGHT] Secured ${results.length}/${targetCards.length} leads from Google Maps.`);
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
