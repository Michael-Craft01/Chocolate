import { chromium, Browser, Page } from 'playwright';
import { logger } from '../lib/logger.js';
import path from 'path';
import fs from 'fs';

export interface ScrapedBusiness {
    name: string;
    address?: string | null;
    category?: string | null;
    website?: string | null;
    phone?: string | null;
    email?: string | null;
    description?: string | null;
}

export class Scraper {
    private browser: Browser | null = null;

    async init() {
        this.browser = await chromium.launch({
            headless: true,
            args: [
                '--disable-blink-features=AutomationControlled',
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ],
        });
    }

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
                },
                {
                    name: `Another Mock ${Math.floor(Math.random() * 1000)}`,
                    website: 'https://test-site.co.zw',
                    phone: country === 'ZW' ? '+263719876543' : '+27829876543',
                    category: 'Test Category'
                }
            ];
        }

        // Ensure browser is healthy
        if (!this.browser || !this.browser.isConnected()) {
            if (this.browser) await this.close();
            await this.init();
        }

        const context = await this.browser!.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            extraHTTPHeaders: {
                'Accept-Language': 'en-US,en;q=0.9',
            },
        });

        let page: Page;

        try {
            logger.info(`Scraping Google for: "${query}"`);

            // Navigate to Google home first to mimic human behavior
            // Add retry logic for initial navigation with page recreation
            let attempts = 0;
            const maxAttempts = 3;

            while (true) {
                try {
                    page = await context.newPage();
                    await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
                    break;
                } catch (navError: any) {
                    attempts++;
                    logger.warn(`Navigation attempt ${attempts} failed: ${navError.message}`);
                    if (page!) await page!.close().catch(() => { });

                    if (attempts >= maxAttempts) {
                        throw navError;
                    }
                    await new Promise(r => setTimeout(r, 2000));
                }
            }


            // Handle cookie consent dialogs (EU GDPR) - try multiple language variants
            try {
                // Wait for consent dialog to appear (short timeout)
                await page!.waitForSelector('button', { timeout: 3000 });

                // Try multiple button texts used across EU regions
                const consentButtons = [
                    'button:has-text("Accept all")',           // English
                    'button:has-text("Godkänn alla")',         // Swedish
                    'button:has-text("Alle akzeptieren")',     // German
                    'button:has-text("Accepter tout")',        // French
                    'button:has-text("Accetta tutto")',        // Italian
                    'button:has-text("Aceptar todo")',         // Spanish
                    'button:has-text("Aceitar tudo")',         // Portuguese
                    'button:has-text("Alles accepteren")',     // Dutch
                    'button[id*="accept"]',                    // ID-based fallback
                    'button[aria-label*="Accept"]',            // Aria-label fallback
                ];

                for (const selector of consentButtons) {
                    const btn = await page!.$(selector);
                    if (btn) {
                        await btn.click();
                        logger.info('Clicked cookie consent button');
                        await page!.waitForTimeout(1000);
                        break;
                    }
                }
            } catch (e) {
                logger.debug('Cookie consent handling: ' + (e as Error).message);
            }

            // Type the query
            try {
                await page!.waitForSelector('textarea[name="q"]', { timeout: 5000 });
                await page!.fill('textarea[name="q"]', query);
                await page!.keyboard.press('Enter');
            } catch (e) {
                logger.warn('Search box interaction failed, falling back to direct URL.');
                const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=lcl`;
                await page!.goto(searchUrl, { waitUntil: 'domcontentloaded' });
            }

            // Wait for results to load
            await page!.waitForTimeout(3000);

            // Ensure we are on the maps/local results
            try {
                // Check if we are already on a local results page (sometimes Google redirects automatically)
                if (page!.url().includes('tbm=lcl')) {
                    logger.info('Already on local results page.');
                } else {
                    const placesLink = await page!.$('a:has-text("Maps")');
                    if (placesLink) {
                        await placesLink.click();
                        await page!.waitForTimeout(3000);
                    } else {
                        // Fallback: Force navigation to local results if not already there
                        throw new Error('Maps link not found');
                    }
                }
            } catch (e) {
                logger.warn('Maps navigation failed/not found, forcing new page navigation: ' + (e as Error).message);
                // If context is destroyed or navigation failed, it's safer to recreate the page for the fallback
                try { await page!.close(); } catch { }
                page = await context.newPage();
                const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=lcl`;
                await page!.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
            }

            // Manual wait to allow dynamic content/scripts to settle
            await page!.waitForTimeout(5000);

            // Debug: Save screenshot only if DEBUG_SCREENSHOTS is enabled (off by default in production)
            if (process.env.DEBUG_SCREENSHOTS === 'true') {
                const debugDir = path.join(process.cwd(), 'data', 'debug');
                if (!fs.existsSync(debugDir)) fs.mkdirSync(debugDir, { recursive: true });
                const timestamp = Date.now();
                await page!.screenshot({ path: path.join(debugDir, `google_page_${timestamp}.png`), fullPage: true });
                logger.info(`Debug screenshot saved: data/debug/google_page_${timestamp}.png`);
            }

            // Enhanced extraction logic
            // Try multiple selectors for result containers
            const resultSelector = [
                'div[role="article"]',
                '.VkpGBb', // Google Local snippet
                '.u30pqe', // Alternate local snippet
                'div[data-cid]', // Elements with cid (common in local results)
                '.rllt__details', // Map list details container
                'div.JsZOMb', // Another local pack container
                'div[jscontroller="AtSb"]', // Generic container often used
            ].join(',');

            await page!.waitForSelector(resultSelector, { timeout: 30000 }).catch(async () => {
                logger.warn('No robust results found or selector timeout.');
                // Save failure screenshot only if debugging is enabled
                if (process.env.DEBUG_SCREENSHOTS === 'true') {
                    const debugDir = path.join(process.cwd(), 'data', 'debug');
                    if (!fs.existsSync(debugDir)) fs.mkdirSync(debugDir, { recursive: true });
                    const timestamp = Date.now();
                    await page!.screenshot({ path: path.join(debugDir, `selector_fail_${timestamp}.png`), fullPage: true });
                    logger.info(`Failure screenshot saved: data/debug/selector_fail_${timestamp}.png`);
                }
                return null;
            });

            const results = await page!.$$eval(resultSelector, (elements, country) => {
                // Debug log inside browser
                console.log(`Processing ${elements.length} elements for country: ${country}`);
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
                    let rawName =
                        el.querySelector('div[role="heading"]')?.textContent ||
                        el.querySelector('.OSrXXb')?.textContent ||
                        el.querySelector('.V_P8d')?.textContent ||
                        'Unknown';

                    // Clean the name - remove Google UI junk
                    const cleanName = (name: string): string => {
                        return name
                            .replace(/My Ad Centre/gi, '')
                            .replace(/Ad\s*·/gi, '')
                            .replace(/Sponsored/gi, '')
                            .replace(/\s{2,}/g, ' ')
                            .trim();
                    };

                    const name = cleanName(rawName);

                    // Website Extraction: Search all anchors
                    let website: string | undefined = undefined;
                    const anchors = Array.from(el.querySelectorAll('a'));
                    for (const a of anchors) {
                        const href = a.href;
                        if (!href) continue;
                        if (href.startsWith('http') && !href.includes('google.com') && !href.includes('google.co')) {
                            website = href;
                            break; // Take the first external link
                        }
                    }

                    // Phone Extraction
                    const phoneRegex = /(\+?\d[\d\s-]{8,})/; // Slightly stricter to avoid dates, at least 8 digits
                    let phone: string | undefined = undefined;

                    // 1. Try finding in specific known containers first
                    const phoneEl =
                        findByRegex('span', phoneRegex) ||
                        findByRegex('div', phoneRegex) ||
                        el.querySelector('.LrzPdb');

                    if (phoneEl?.textContent) {
                        // Extract just the phone number, not the entire element text
                        const phoneMatch = phoneEl.textContent.match(phoneRegex);
                        phone = phoneMatch ? phoneMatch[0] : undefined;
                    }

                    if (!phone) {
                        // 2. Search full text of the card
                        const fullText = el.textContent || '';
                        const match = fullText.match(phoneRegex);
                        if (match) {
                            // Filter out common false positives like dates (2020-...) if needed,
                            // but 8+ digits check helps.
                            // Also check if it looks like a year (starting with 19 or 20 and 4 digits... regex is 8+)
                            phone = match[0].trim();
                        }
                    }

                    // Email Extraction
                    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
                    // Reuse fullText from above - ensure it is defined
                    const fullTextForEmail = el.textContent || '';
                    const emailMatch = fullTextForEmail.match(emailRegex);
                    const email = emailMatch ? emailMatch[0] : undefined;

                    return {
                        name: name.trim(),
                        website,
                        phone: phone?.trim(),
                        email,
                    };
                }).filter(r => {
                    // Filter out unknown names
                    if (r.name === 'Unknown') return false;

                    // Filter out phones based on country rules
                    if (r.phone) {
                        const cleanPhone = r.phone.replace(/\s/g, '');

                        if (country === 'SA') {
                            // For South Africa, we allow 07/08/06 (Mobile/VoIP) and +27
                            // We block +263 to ensure we don't get Zim businesses if they appear
                            if (cleanPhone.startsWith('+263') || cleanPhone.startsWith('263')) return false;
                        } else if (country === 'ZW') {
                            // For Zimbabwe, we allow +263
                            // We exclude SA numbers
                            if (cleanPhone.startsWith('+27') || cleanPhone.startsWith('27')) return false;
                        }
                    }
                    return true;
                });
            }, country);

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
