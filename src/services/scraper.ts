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

            // Use string-based evaluate to completely bypass tsx transpilation
            const extractionScript = `
                (function() {
                    var resultSelector = ${JSON.stringify(resultSelector)};
                    var country = ${JSON.stringify(country)};
                    console.log('Processing elements for country: ' + country);
                    var elements = Array.from(document.querySelectorAll(resultSelector));
                    
                    return elements.map(function(el) {
                        // Try different selectors for Name
                        var rawName =
                            (el.querySelector('div[role="heading"]') && el.querySelector('div[role="heading"]').textContent) ||
                            (el.querySelector('.OSrXXb') && el.querySelector('.OSrXXb').textContent) ||
                            (el.querySelector('.V_P8d') && el.querySelector('.V_P8d').textContent) ||
                            'Unknown';

                        // Clean the name - remove Google UI junk
                        var name = rawName
                            .replace(/My Ad Centre/gi, '')
                            .replace(/Ad\\s*·/gi, '')
                            .replace(/Sponsored/gi, '')
                            .replace(/\\s{2,}/g, ' ')
                            .trim();

                        // Website Extraction: Search all anchors
                        var website = undefined;
                        var anchors = Array.from(el.querySelectorAll('a'));
                        for (var i = 0; i < anchors.length; i++) {
                            var href = anchors[i].href;
                            if (!href) continue;
                            if (href.indexOf('http') === 0 && href.indexOf('google.com') === -1 && href.indexOf('google.co') === -1) {
                                website = href;
                                break;
                            }
                        }

                        // Phone Extraction
                        var phoneRegex = /(\\+?\\d[\\d\\s-]{8,})/;
                        var phone = undefined;

                        // Try finding in span/div elements
                        var spans = Array.from(el.querySelectorAll('span'));
                        for (var j = 0; j < spans.length; j++) {
                            if (spans[j].textContent && phoneRegex.test(spans[j].textContent)) {
                                var match = spans[j].textContent.match(phoneRegex);
                                if (match) { phone = match[0]; break; }
                            }
                        }
                        
                        if (!phone) {
                            var divs = Array.from(el.querySelectorAll('div'));
                            for (var k = 0; k < divs.length; k++) {
                                if (divs[k].textContent && phoneRegex.test(divs[k].textContent)) {
                                    var match2 = divs[k].textContent.match(phoneRegex);
                                    if (match2) { phone = match2[0]; break; }
                                }
                            }
                        }

                        if (!phone) {
                            var fullText = el.textContent || '';
                            var fullMatch = fullText.match(phoneRegex);
                            if (fullMatch) { phone = fullMatch[0].trim(); }
                        }

                        // Email Extraction
                        var emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/;
                        var fullTextForEmail = el.textContent || '';
                        var emailMatch = fullTextForEmail.match(emailRegex);
                        var email = emailMatch ? emailMatch[0] : undefined;

                        return {
                            name: name.trim(),
                            website: website,
                            phone: phone ? phone.trim() : undefined,
                            email: email,
                        };
                    }).filter(function(r) {
                        if (r.name === 'Unknown') return false;

                        if (r.phone) {
                            var cleanPhone = r.phone.replace(/\\s/g, '');
                            if (country === 'SA') {
                                if (cleanPhone.indexOf('+263') === 0 || cleanPhone.indexOf('263') === 0) return false;
                            } else if (country === 'ZW') {
                                if (cleanPhone.indexOf('+27') === 0 || cleanPhone.indexOf('27') === 0) return false;
                            }
                        }
                        return true;
                    });
                })()
            `;

            const results = await page!.evaluate(extractionScript) as ScrapedBusiness[];

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
