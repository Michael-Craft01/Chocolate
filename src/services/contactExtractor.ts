import { chromium } from 'playwright';
import { logger } from '../lib/logger.js';

export class ContactExtractor {
    async extract(url: string): Promise<{ email?: string | null, phone?: string | null, screenshot?: Buffer | null }> {
        if (!url || url.includes('google.com') || url.includes('facebook.com')) return {};

        let browser;
        try {
            browser = await chromium.launch({ headless: true });
            const context = await browser.newContext({ userAgent: 'Mozilla/5.0' });
            const page = await context.newPage();
            
            logger.debug(`[HUNGRY] Diving into ${url} for contact data and visual intel...`);
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
            
            const content = await page.content();
            const text = await page.evaluate(() => document.body.innerText);

            // Hungry Regex
            const emailMatch = content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
            const phoneMatch = text.match(/(\+263|077|078|071)\s?\d{7,}/g);

            // Visual Intel
            const screenshot = await page.screenshot({ type: 'png' });

            return {
                email: emailMatch ? emailMatch[0] : null,
                phone: phoneMatch ? phoneMatch[0] : null,
                screenshot
            };
        } catch (error) {
            logger.debug(`[HUNGRY] Failed to dive into ${url}`);
            return {};
        } finally {
            if (browser) await browser.close();
        }
    }
}

export const contactExtractor = new ContactExtractor();
