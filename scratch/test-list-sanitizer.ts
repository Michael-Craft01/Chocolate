import { logger } from '../src/lib/logger.js';

function sanitizeRefinedList(input: string): string {
    if (!input) return '';
    
    let cleanInput = input.trim();

    // 1. Remove reasoning thought blocks if any remaining (safety fallback)
    cleanInput = cleanInput
        .replace(/<thought>[\s\S]*?<\/thought>/gi, '')
        .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
        .trim();

    // 2. Strip conversational header prose ending in colon
    const headerRegex = /^(sure|certainly|here\s+(is|are)|refined|expanded|suggested|list\s+of|based\s+on|industries|locations|target\s+markets|niches)[\s\S]*?:/i;
    if (headerRegex.test(cleanInput)) {
        cleanInput = cleanInput.replace(headerRegex, '').trim();
    }

    // 3. Strip conversational footer prose starting with common phrases
    const footerRegex = /(hope\s+this\s+helps|let\s+me\s+know|if\s+you\s+need|anything\s+else|this\s+should\s+help|here\s+are\s+the|is\s+a\s+list|good\s+luck)[\s\S]*$/i;
    cleanInput = cleanInput.replace(footerRegex, '').trim();

    // 4. Split by commas, semicolons, or newlines
    const rawItems = cleanInput.split(/[,\n;]/);
    const cleanedItems: string[] = [];
    const seen = new Set<string>();

    for (let item of rawItems) {
        // Strip leading list characters, bullets, or numbers
        // e.g. "- Software", "* Software", "1. Software", "• Software", "1) Software"
        item = item.trim().replace(/^[-*•\d+.)]+\s*/, '').trim();
        if (!item) continue;

        // Strip surrounding quotes
        item = item.replace(/^["']|["']$/g, '').trim();

        // Skip common conversational filler items
        if (/^(sure|certainly|okay|yes|here\s+it\s+is|this\s+list)$/i.test(item)) continue;

        // Heuristics for sentence skipping:
        // Skip items that are too long (e.g. > 6 words) or contain ending punctuation (like period, exclamation, question mark)
        const wordCount = item.split(/\s+/).length;
        if (wordCount > 6) continue;
        if (/[.!?]$/.test(item)) {
            // Strip terminal punctuation if it's a short valid industry, else skip if it's a sentence
            if (wordCount <= 3) {
                item = item.replace(/[.!?]+$/, '').trim();
            } else {
                continue;
            }
        }

        // Skip items that end with colon
        if (item.endsWith(':')) continue;

        const lowerKey = item.toLowerCase();
        if (!seen.has(lowerKey)) {
            seen.add(lowerKey);

            // Clean/normalize casing (capitalize first letter of each word, except minor prepositions/conjunctions)
            const capitalized = item
                .split(/\s+/)
                .map(word => {
                    const lWord = word.toLowerCase();
                    if (lWord === 'and' || lWord === 'or' || lWord === 'of' || lWord === 'for' || lWord === 'in') {
                        return lWord;
                    }
                    return word.charAt(0).toUpperCase() + word.slice(1);
                })
                .join(' ');

            cleanedItems.push(capitalized);
        }
    }

    return cleanedItems.join(', ');
}

// Test suite
const testCases = [
    {
        name: "Standard comma list",
        input: "software development, retail, real estate",
        expected: "Software Development, Retail, Real Estate"
    },
    {
        name: "Conversational wrappers with colon",
        input: "Sure, here is your expanded list of industries: Software Development, Mobile Apps, IT Consulting. Hope this helps!",
        expected: "Software Development, Mobile Apps, IT Consulting"
    },
    {
        name: "Newline list with bullets",
        input: "Here is the refined list of niches:\n- marketing agency\n- SaaS companies\n- e-commerce stores\nLet me know if you need more.",
        expected: "Marketing Agency, SaaS Companies, E-commerce Stores"
    },
    {
        name: "Numbered markdown list",
        input: "1. solar panel installation\n2. plumbing services\n3. electric installation",
        expected: "Solar Panel Installation, Plumbing Services, Electric Installation"
    },
    {
        name: "List with parenthetical and trailing punctuation",
        input: "Agribusiness., Biotech., and Cleantech.",
        expected: "Agribusiness, Biotech, and Cleantech"
    },
    {
        name: "Plain paragraph text (should be skipped or parsed if short)",
        input: "We should target large retail stores because they need software.",
        expected: ""
    }
];

let failed = false;
console.log("=== Running sanitizeRefinedList Tests ===");
for (const tc of testCases) {
    const result = sanitizeRefinedList(tc.input);
    const passed = result === tc.expected;
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${tc.name}`);
    console.log(`  Input   : "${tc.input.replace(/\n/g, '\\n')}"`);
    console.log(`  Expected: "${tc.expected}"`);
    console.log(`  Result  : "${result}"\n`);
    if (!passed) failed = true;
}

if (failed) {
    console.error("❌ Some tests failed!");
    process.exit(1);
} else {
    console.log("✅ All tests passed successfully!");
}
