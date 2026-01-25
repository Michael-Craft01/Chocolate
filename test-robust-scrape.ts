import { chromium } from 'playwright';

async function testExtraction() {
    const query = 'HVAC in Harare';
    console.log(`Starting test for query: "${query}"`);
    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    });
    const page = await context.newPage();

    // Log all console messages
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    try {
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=lcl`;
        console.log(`Navigating to: ${searchUrl}`);

        // Try a different wait condition
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        console.log('Page DOM content loaded.');

        // Wait a bit manually
        await page.waitForTimeout(5000);
        console.log('Waited 5s manually.');

        // Take a screenshot to see what happened
        await page.screenshot({ path: 'test_debug.png' });
        console.log('Screenshot saved to test_debug.png');

        const resultSelector = [
            'div[role="article"]',
            '.VkpGBb',
            '.u30pqe',
            'div[data-cid]',
        ].join(',');

        console.log('Checking for results...');
        const exists = await page.$(resultSelector);
        if (!exists) {
            console.log('Selector not found. Dumping body text snippet:');
            const body = await page.innerText('body');
            console.log(body.substring(0, 500));
        } else {
            const count = await page.$$eval(resultSelector, els => els.length);
            console.log(`Found ${count} elements matching selector.`);
        }

    } catch (e) {
        console.error('TEST ERROR:', e);
    } finally {
        await browser.close();
        console.log('Test finished.');
    }
}

testExtraction().catch(err => {
    console.error('FATAL TEST ERROR:', err);
    process.exit(1);
});
