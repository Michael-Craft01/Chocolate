import { chromium } from 'playwright';
import fs from 'fs';

async function captureSearch() {
    const query = 'Plumbing in Harare';
    console.log(`Searching for: ${query}`);
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    });
    const page = await context.newPage();

    try {
        const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=lcl`;
        console.log(`Navigating to ${url}`);
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(7000); // Give it plenty of time

        await page.screenshot({ path: '/home/dev/projects/Chocolate/debug_search_result.png', fullPage: true });
        const html = await page.content();
        fs.writeFileSync('/home/dev/projects/Chocolate/debug_search_result.html', html);

        console.log('Capture complete. Files saved: debug_search_result.png, debug_search_result.html');

        // Basic check in the current script
        const count = await page.evaluate(() => document.querySelectorAll('div[role="article"]').length);
        console.log(`In-page check for [role="article"]: ${count} found.`);

    } catch (e) {
        console.error('Capture failed:', e);
    } finally {
        await browser.close();
    }
}

captureSearch();
