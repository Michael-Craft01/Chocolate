import { config } from '../config.js';
import { logger } from '../lib/logger.js';
import OpenAI from 'openai';

// ─────────────────────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────────────────────

export interface AIEnrichment {
    brandName: string;
    industry: string;
    painPoint: string;
    recommendedSolution: string;
    score: number;
    companySize: string;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Parsing Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Strip any residual thought / reasoning tags the model might still emit
 * even when using the OpenAI-compat endpoint.
 */
function stripThinking(text: string): string {
    return text
        .replace(/<thought>[\s\S]*?<\/thought>/gi, '')
        .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
        .replace(/<[^>]+>/gm, '')
        .trim();
}

/**
 * Robust JSON extractor.
 * Finds the LAST complete {...} block in a string so it works even if the
 * model prepends reasoning prose before the actual JSON object.
 */
function extractJson<T>(text: string): T {
    const cleanText = text
        .replace(/<thought>[\s\S]*?<\/thought>/gi, '')
        .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
        .replace(/<\|channel>thought[\s\S]*?<channel\|>/gi, '')
        .trim();

    const start = cleanText.indexOf('{');
    const end   = cleanText.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) {
        throw new Error(`No JSON object found in AI response: ${cleanText.slice(0, 200)}`);
    }
    return JSON.parse(cleanText.substring(start, end + 1)) as T;
}

/**
 * Extract content wrapped in <email>...</email> tags.
 * Falls back to stripping all XML-like tags if the model omitted the wrapper.
 */
function extractEmail(text: string): string {
    const match = text.match(/<email>([\s\S]*?)<\/email>/i);
    if (match?.[1]) return match[1].trim();
    return stripThinking(text);
}

export function cleanOutreachMessage(text: string): string {
    let cleaned = extractEmail(text || '');

    cleaned = cleaned
        .replace(/```[\w-]*\n?/g, '')
        .replace(/\*\*(Opening|The Hook\/Pain Point|The Solution|Call to Action|CTA|Subject):\*\*:?/gi, '')
        .replace(/^\s*[-*]\s+\*\*[^*\n]+:\*\*\s*/gm, '')
        .replace(/^\s*[-*]\s*(Opening|The Hook\/Pain Point|The Solution|Call to Action|CTA|Subject):\s*/gim, '')
        .replace(/^\s*`+\s*/gm, '')
        .replace(/\s*`+\s*$/gm, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

    const firstGreeting = cleaned.search(/\b(hi|hello|good day|hey|greetings)\b/i);
    if (firstGreeting > 0) cleaned = cleaned.slice(firstGreeting).trim();

    return cleaned;
}

function firstChoiceContent(response: OpenAI.Chat.ChatCompletion): string {
    return response.choices[0]?.message?.content ?? '';
}

/**
 * Robustly sanitizes list outputs from the AI model to guarantee they consist
 * ONLY of a clean, deduplicated, comma-separated list of short categories.
 * Drops conversational headers, markdown formatting, lists, numbering, and trailing prose.
 */
export function sanitizeRefinedList(input: string): string {
    if (!input) return '';
    
    let cleanInput = input.trim();

    // 1. Remove reasoning thought blocks if any remaining (safety fallback)
    cleanInput = cleanInput
        .replace(/<thought>[\s\S]*?<\/thought>/gi, '')
        .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
        .trim();

    // 2. Strip conversational header prose ending in colon (e.g. "Here is your refined list of industries:")
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

// ─────────────────────────────────────────────────────────────────────────────
//  AIService — single OpenAI-compat client for ALL AI calls
// ─────────────────────────────────────────────────────────────────────────────

export class AIService {
    private openai: OpenAI;
    private model: string;

    constructor() {
        this.model  = config.GEMINI_MODEL;
        this.openai = new OpenAI({
            apiKey:  config.GEMINI_API_KEY,
            baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
            timeout: 30000, // 30 seconds request timeout
        });
    }

    // ── 1. Form Field Refinement (enforced JSON output) ───────────────────────

    async refineInput(field: string, value: string, context?: Record<string, unknown>): Promise<string> {
        // Skip API call for empty input — nothing to elaborate
        if (!value || !value.trim()) return '';

        const isListField = 
            field.toLowerCase().includes('industry') || 
            field.toLowerCase().includes('location') || 
            field.toLowerCase().includes('city') || 
            field.toLowerCase().includes('area');

        const systemPrompt = isListField
            ? 'You are the HyprLead AI Assistant. ' +
              'The user has typed a partial or rough list of target markets, industries, or locations. ' +
              'Your job is to expand and elaborate it into a clean, comma-separated list of specific B2B categories, industries, or geographic targets (maximum 3 words per item). ' +
              'Add relevant, high-value B2B categories and sectors the user may have missed that align with their input. ' +
              'CRITICAL: Return ONLY a valid JSON object matching this structure: {"refined": "item1, item2, item3"}. ' +
              'Do NOT wrap the value in lists, bullets (- or *), or numbers (1., 2.). Do NOT include conversational prefixes, introductory prose, or conclusion chat ' +
              '(do not say "Sure, here are...", "Hope this helps", "Refined list:", etc.). Just return the raw comma-separated items inside the JSON key. ' +
              'Do NOT output any reasoning blocks, thought tags, drafts, or markdown.'
            : 'You are the HyprLead AI Assistant. ' +
              'The user has typed a short or rough input. Elaborate it into a detailed, professional, persuasive description ' +
              'optimised for B2B lead outreach and discovery. Expand vague language, add specifics, and make it compelling. ' +
              'Maintain the user\'s original intent and tone — just make it richer and more complete. ' +
              'Return ONLY a valid JSON object with a single key "refined" containing the elaborated value (plain text, no markdown). ' +
              'Do NOT output any reasoning, thoughts, drafts, or markdown.';

        return this.withRetry('refineInput', async (_model) => {
            const response = await this.openai.chat.completions.create({
                // Elaborate uses gemma-4-26b-a4b-it — verified working Gemma 4 model.
                // (gemma-3-27b-it is not available on the Gemini API — use gemma-4-26b-a4b-it instead)
                model: 'gemma-4-26b-a4b-it',
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt,
                    },
                    {
                        role: 'user',
                        content: `FIELD: "${field}"\nUSER INPUT: "${value}"\nCONTEXT: ${JSON.stringify(context ?? {})}\n\nElaborate the user's input for this field into a high-quality, detailed version.`,
                    },
                ],
                // NOTE: response_format json_object is NOT supported by Gemma models on the Gemini API.
                // We rely on the prompt + extractJson to parse the JSON response instead.
                // max_tokens must be high enough to include both the <thought> block and the JSON output.
                temperature: 0.4,
                max_tokens: 2000,
            });

            const raw = firstChoiceContent(response);
            if (!raw.trim()) {
                throw new Error('Empty response from AI model');
            }

            // Try strict JSON parse first
            let result = '';
            try {
                const parsed = extractJson<{ refined?: string }>(raw);
                if (parsed.refined && typeof parsed.refined === 'string' && parsed.refined.trim()) {
                    result = parsed.refined.trim();
                }
            } catch {
                // JSON parse failed — model returned plain text, use it directly
                const stripped = stripThinking(raw);
                if (stripped) result = stripped;
            }

            if (!result) {
                throw new Error('Could not extract elaborated text from AI response');
            }

            if (isListField) {
                return sanitizeRefinedList(result);
            }
            return result;
        });
    }

    // ── 2. Lead Enrichment (enforced JSON + optional vision) ──────────────────

    async enrichLead(
        businessName: string,
        category?: string,
        campaignConfig?: { productDescription?: string | null; targetPainPoints?: string | null },
        context?: string | null,
        imageBuffer?: Buffer | null,
    ): Promise<AIEnrichment> {
        const product            = campaignConfig?.productDescription || 'HyprLead Intelligence & Automation Solutions';
        const customInstructions = campaignConfig?.targetPainPoints   || '';

        const systemPrompt =
            'You are the HyprLead Discovery Engine (HyprLead AI Optimized). ' +
            'Perform high-fidelity business discovery, sector-specific operational friction detection, and size classification. ' +
            'Ground your analysis in the lead\'s specific SECTOR. ' +
            'Do not invent technical software issues (like "API failures") unless the lead is actually in the technology space. ' +
            'Return ONLY a valid JSON object — no prose, no markdown, no reasoning text.';

        const userPrompt =
            `INPUT PACKAGE:\n` +
            `- BRAND: "${businessName}"\n` +
            `- SECTOR: "${category || 'SME'}"\n` +
            `- CONTEXT: "${context || 'No context available'}"\n` +
            (customInstructions ? `- CUSTOM INSTRUCTIONS: "${customInstructions}"\n` : '') +
            `\nTASK:\n` +
            `1. Clean the Brand Name for professional outreach (remove "Leads", "Inc", "Limited", "Corp", or location suffixes that make it robotic).\n` +
            `2. Identify 3 possible friction points RELEVANT to a "${category || 'SME'}" business.\n` +
            `3. Select the MOST CRITICAL friction point that "${product}" can actually solve.\n` +
            `4. Classify the estimated company size based on contextual clues (employee count, local storefront vs multi-location or enterprise scale). Value must be exactly one of: "Small" (1-10 employees/local footprint), "Medium" (11-50 employees/regional scale), or "Large" (50+ employees/enterprise scale).\n` +
            (imageBuffer ? `5. Analyze the provided website screenshot for design/business presence signals.\n` : '') +
            `\nJSON OUTPUT SCHEMA:\n` +
            `{\n` +
            `  "brandName": "Short clean human name",\n` +
            `  "industry": "Specific vertical",\n` +
            `  "painPoint": "Sector-relevant friction point",\n` +
            `  "recommendedSolution": "${product}",\n` +
            `  "score": 0.0,\n` +
            `  "companySize": "Small"\n` +
            `}`;

        // Build content array — inject image using OpenAI vision format if provided
        const userContent: OpenAI.Chat.ChatCompletionContentPart[] = [
            { type: 'text', text: userPrompt },
        ];

        if (imageBuffer) {
            userContent.push({
                type: 'image_url',
                image_url: {
                    url: `data:image/png;base64,${imageBuffer.toString('base64')}`,
                },
            });
        }

        return this.withRetry('enrichLead', async (model) => {
            logger.info(`[HyprLead AI] Thinking... Deep-diving into: ${businessName} using model ${model}`);

            const response = await this.openai.chat.completions.create({
                model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user',   content: userContent  },
                ],
                response_format: { type: 'json_object' },
                temperature: 0.2,
            });

            const raw    = firstChoiceContent(response);
            const parsed = extractJson<{
                brandName?: string;
                industry?: string;
                painPoint?: string;
                recommendedSolution?: string;
                score?: number | string;
                companySize?: string;
            }>(raw);

            // Clean parsed companySize to make sure it's valid
            let companySize = 'Small';
            const parsedSize = String(parsed.companySize || '').trim().toLowerCase();
            if (parsedSize.includes('large') || parsedSize === 'large') {
                companySize = 'Large';
            } else if (parsedSize.includes('medium') || parsedSize === 'medium') {
                companySize = 'Medium';
            } else {
                companySize = 'Small';
            }

            return {
                brandName:           parsed.brandName           || businessName,
                industry:            parsed.industry            || category || 'SME',
                painPoint:           parsed.painPoint           || 'Operational friction detected',
                recommendedSolution: parsed.recommendedSolution || product,
                score:               parseFloat(String(parsed.score ?? '8.5')) || 8.5,
                companySize,
            };
        });
    }

    // ── 3. Personalized Outreach Message (structured free text) ───────────────

    async generatePersonalizedMessage(
        campaign: any,
        businessName: string,
        industry: string,
        painPoint: string,
    ): Promise<string> {
        const product   = campaign.productName        || 'HyprLead Core';
        const sender    = campaign.senderName         || 'Michael';
        const company   = campaign.companyName        || 'HyprLead';
        const link      = campaign.ctaLink || campaign.user?.profile?.website || 'https://hyprlead.com';
        const valueProp = campaign.productDescription || 'we help businesses eliminate bottlenecks.';

        const systemPrompt =
            'You are the HyprLead Outreach Specialist (HyprLead AI Powered). ' +
            'Write personalized, high-converting cold outreach messages.\n' +
            'RULES:\n' +
            '- Warm, friendly, human-sounding — NOT robotic or corporate.\n' +
            '- AVOID buzzwords: "strategic walkthrough", "protocol", "high-performance framework", "reclaim competitive edge", "invisible revenue leakage".\n' +
            '- Under 120 words.\n' +
            '- End with a clear, warm call-to-action.\n' +
            '- Use line breaks for readability.\n' +
            '- Return ONLY JSON in this exact shape: {"message":"final outreach message"}.\n' +
            '- Do NOT include thoughts, analysis, labels, markdown, bullets, or code fences.';

        const userPrompt =
            `LEAD BRAND: "${businessName}"\n` +
            `SECTOR: "${industry}"\n` +
            `DETECTED PAIN POINT: "${painPoint}"\n` +
            `MY PRODUCT: "${product}"\n` +
            `MY COMPANY: "${company}"\n` +
            `MY VALUE PROP: "${valueProp}"\n` +
            `SENDER: "${sender}"\n` +
            `MANDATORY LINK (use EXACTLY this, do NOT invent another URL): "${link}"`;

        return this.withRetry('generatePersonalizedMessage', async (model) => {
            logger.info(`[HyprLead AI] Generating personalized outreach for ${businessName} using model ${model}`);

            const response = await this.openai.chat.completions.create({
                model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user',   content: userPrompt   },
                ],
                response_format: { type: 'json_object' },
                temperature: 0.4,
            });

            const raw = firstChoiceContent(response);
            try {
                const parsed = extractJson<{ message?: string }>(raw);
                return cleanOutreachMessage(parsed.message || raw);
            } catch {
                return cleanOutreachMessage(raw);
            }
        });
    }

    // ── 5. Lead Sales Intelligence Analysis (enforced JSON) ──────────────────

    async analyzeLead(lead: {
        businessName: string;
        industry: string;
        painPoint: string;
        website?: string | null;
        phone?: string | null;
        email?: string | null;
    }, campaign: {
        productName: string;
        productDescription: string;
        targetPainPoints: string;
        companyName: string;
        senderName: string;
    }): Promise<{
        summary: string;
        opportunityScore: number;
        whyThisLead: string;
        salesApproach: string;
        talkingPoints: string[];
        likelyObjection: string;
        objectionResponse: string;
        nextBestAction: string;
        urgencySignal: string;
    }> {
        const systemPrompt =
            'You are a senior B2B sales strategist embedded in the HyprLead platform. ' +
            'Your job is to analyze a discovered lead and produce a concise, actionable sales intelligence brief. ' +
            'Be specific to the business context — no generic advice. ' +
            'Return ONLY a valid JSON object matching the schema exactly.';

        const userPrompt =
            `LEAD:
- Company: "${lead.businessName}"
- Industry: "${lead.industry}"
- Detected Pain Point: "${lead.painPoint}"
- Has Phone: ${lead.phone ? 'Yes' : 'No'}
- Has Email: ${lead.email ? 'Yes' : 'No'}
- Has Website: ${lead.website ? 'Yes (' + lead.website + ')' : 'No'}

CAMPAIGN CONTEXT:
- Our Product: "${campaign.productName}"
- What We Do: "${campaign.productDescription}"
- Pain Points We Target: "${campaign.targetPainPoints}"
- Our Company: "${campaign.companyName}"
- Sender: "${campaign.senderName}"

TASK: Produce a sales intelligence brief for this specific lead.

JSON SCHEMA:
{
  "summary": "2-3 sentence plain-English explanation of what this business does and why they are a strong lead for us",
  "opportunityScore": 1-10 integer (how strong this opportunity is given our product fit),
  "whyThisLead": "1-2 sentences explaining specifically why this business matches our ICP",
  "salesApproach": "DIRECT | CONSULTATIVE | EDUCATIONAL — which approach fits best and why in one sentence",
  "talkingPoints": ["3-4 specific, concrete talking points to use in the outreach — reference their pain point and our product directly"],
  "likelyObjection": "The most likely objection this type of business will raise",
  "objectionResponse": "A concise, confident response to that objection",
  "nextBestAction": "The single most effective next action to move this lead toward a meeting or sale",
  "urgencySignal": "One specific reason why reaching out now is timely for this business type"
}`;

        return this.withRetry('analyzeLead', async (model) => {
            const response = await this.openai.chat.completions.create({
                model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user',   content: userPrompt   },
                ],
                response_format: { type: 'json_object' },
                temperature: 0.3,
            });

            const raw    = firstChoiceContent(response);
            const parsed = extractJson<any>(raw);

            return {
                summary:           parsed.summary           || 'No summary available.',
                opportunityScore:  parseInt(String(parsed.opportunityScore ?? '7')) || 7,
                whyThisLead:       parsed.whyThisLead       || '',
                salesApproach:     parsed.salesApproach     || 'CONSULTATIVE',
                talkingPoints:     Array.isArray(parsed.talkingPoints) ? parsed.talkingPoints : [],
                likelyObjection:   parsed.likelyObjection   || '',
                objectionResponse: parsed.objectionResponse || '',
                nextBestAction:    parsed.nextBestAction    || '',
                urgencySignal:     parsed.urgencySignal     || '',
            };
        });
    }

    // ── 5. Mission Brief (structured free text) ───────────────────────────────

    async generateMissionBrief(campaign: any): Promise<string> {
        const systemPrompt =
            'You are the HyprLead Mission Strategist (HyprLead AI Powered). ' +
            'Write a concise 2-3 sentence professional mission brief. ' +
            'Use expert, mission-driven language. ' +
            'Keep it under 400 characters. ' +
            'Return ONLY the brief text — no markdown, no labels, no extra commentary.';

        const userPrompt =
            `CAMPAIGN NAME: "${campaign.name}"\n` +
            `PRODUCT: "${campaign.productName}"\n` +
            `SECTORS: "${campaign.industries?.join(', ') || 'General SME'}"\n` +
            `REGIONS: "${campaign.locations?.join(', ')  || 'Unspecified'}"\n` +
            `TONE: "${campaign.outreachTone}"\n` +
            `PAIN POINTS: "${campaign.targetPainPoints}"`;

        return this.withRetry('generateMissionBrief', async (model) => {
            const response = await this.openai.chat.completions.create({
                model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user',   content: userPrompt   },
                ],
                temperature: 0.3,
            });

            const raw = firstChoiceContent(response);
            return stripThinking(raw);
        });
    }

    // ── 6. Campaign Source Classification (enforced JSON) ───────────────────

    async classifyCampaignSources(targetMarket: string, productDescription?: string): Promise<string[]> {
        const systemPrompt =
            'You are the HyprLead Sourcing Intelligence (HyprLead AI Optimized). ' +
            'Classify a campaign\'s target market to determine the best lead sources.\n' +
            'Sources options:\n' +
            '- GOOGLE_MAPS: Best for local brick-and-mortar, physical storefronts, service providers (e.g., cafes, clinics, plumbers, gyms).\n' +
            '- APPLE_MAPS: Best for physical retail, consumer-facing storefronts, hotels, restaurants, local shops.\n' +
            '- GOOGLE_SEARCH: Best for digital companies, SaaS, agencies, B2B services, wholesale, manufacturers, or businesses without a strong physical storefront.\n\n' +
            'Return ONLY a valid JSON object: {"sources": ["SOURCE1", "SOURCE2"]}.\n' +
            'Do not output reasoning, thought tags, or extra commentary.';

        const userPrompt =
            `TARGET MARKET: "${targetMarket}"\n` +
            `PRODUCT DESCRIPTION: "${productDescription || ''}"`;

        return this.withRetry('classifyCampaignSources', async (model) => {
            const response = await this.openai.chat.completions.create({
                model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user',   content: userPrompt },
                ],
                response_format: { type: 'json_object' },
                temperature: 0.1,
            });

            const raw = firstChoiceContent(response);
            const parsed = extractJson<{ sources?: string[] }>(raw);
            if (parsed.sources && Array.isArray(parsed.sources)) {
                // Filter valid sources
                const valid = parsed.sources.filter(s => ['GOOGLE_MAPS', 'APPLE_MAPS', 'GOOGLE_SEARCH'].includes(s));
                if (valid.length > 0) return valid;
            }
            return ['GOOGLE_MAPS']; // fallback default
        });
    }

    // ── 7. Target Market Query Generation (enforced JSON) ───────────────────

    async generateQueriesFromTargetMarket(
        targetMarket: string,
        locations: string[],
        industries: string[],
        targetBusinessSize: string,
        count: number = 25
    ): Promise<Array<{ query: string; location: string; industry: string }>> {
        const systemPrompt =
            'You are the HyprLead Query Generator (HyprLead AI Optimized). ' +
            'Your job is to generate highly effective search queries for local lead generation ' +
            'optimized for Google Search/Maps or Apple Maps.\n' +
            'Guidelines:\n' +
            '- Generate high-value, specific query strings targeting the business types described in the target market.\n' +
            '- Match the queries with the most appropriate location and industry category from the input list or infer close matches.\n' +
            '- Vary the query format (e.g., "cafes in Harare", "Harare specialty coffee shop", "artisanal cafe").\n' +
            '- Return ONLY a valid JSON object matching the schema: {"queries": [{"query": "query string", "location": "Harare", "industry": "Cafes"}]}.\n' +
            '- Do not output reasoning, thoughts, markdown, or code fences.';

        const userPrompt =
            `TARGET MARKET DESCRIPTION: "${targetMarket}"\n` +
            `LOCATIONS LIST: ${JSON.stringify(locations)}\n` +
            `INDUSTRIES LIST: ${JSON.stringify(industries)}\n` +
            `TARGET BUSINESS SIZE: "${targetBusinessSize}"\n` +
            `NUMBER OF QUERIES TO GENERATE: ${count}`;

        return this.withRetry('generateQueriesFromTargetMarket', async (model) => {
            const response = await this.openai.chat.completions.create({
                model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user',   content: userPrompt },
                ],
                response_format: { type: 'json_object' },
                temperature: 0.3,
            });

            const raw = firstChoiceContent(response);
            const parsed = extractJson<{ queries?: Array<{ query: string; location: string; industry: string }> }>(raw);
            if (parsed.queries && Array.isArray(parsed.queries)) {
                return parsed.queries.map(q => ({
                    query: String(q.query).trim(),
                    location: String(q.location || locations[0] || 'Global').trim(),
                    industry: String(q.industry || industries[0] || 'Business').trim()
                }));
            }
            return [];
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Unified Retry with Exponential Backoff
    // ─────────────────────────────────────────────────────────────────────────

    async generateText(prompt: string, operationName = 'generateText'): Promise<string> {
        return this.withRetry(operationName, async (model) => {
            const response = await this.openai.chat.completions.create({
                model,
                messages: [
                    {
                        role: 'system',
                        content: 'Return only the requested plain text. No markdown, labels, or explanation.',
                    },
                    { role: 'user', content: prompt },
                ],
                temperature: 0.2,
            });

            return stripThinking(firstChoiceContent(response));
        });
    }

    private async withRetry<T>(
        operationName: string,
        operation: (model: string) => Promise<T>,
        maxRetries = 3,
    ): Promise<T> {
        let lastError: unknown;
        // Whitelist of allowed Gemma models — per product requirement.
        const ALLOWED_GEMMA = new Set(['gemma-4-26b-a4b-it', 'gemma-3-27b-it']);
        const resolveModel = (m: string) => ALLOWED_GEMMA.has(m) ? m : 'gemma-4-26b-a4b-it';

        let currentModel = config.GEMINI_MODEL;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                return await operation(resolveModel(currentModel));
            } catch (err: unknown) {
                lastError = err;
                const apiErr = err as { status?: number; message?: string };

                const isRateLimit   = apiErr.status === 429 || String(apiErr.message).includes('429');
                const isServerError = typeof apiErr.status === 'number' && apiErr.status >= 500;
                const isRetryable   = isRateLimit || isServerError;

                if (!isRetryable) {
                    // Hard failure (bad request, auth error, etc.) — don't waste retries
                    logger.error(
                        { err: apiErr.message, operationName, status: apiErr.status },
                        '[HyprLead AI] Non-retryable error. Aborting.',
                    );
                    throw err;
                }

                // Switch to fallback model on retryable failure
                const nextModel = config.FALLBACK_MODEL;
                if (currentModel !== nextModel) {
                    logger.warn(
                        { operationName, fromModel: currentModel, toModel: nextModel },
                        '[HyprLead AI] Swapping to fallback model on retry'
                    );
                    currentModel = nextModel;
                }

                const delayMs = Math.pow(2, attempt) * 2000; // 2s → 4s → 8s
                logger.warn(
                    { operationName, attempt: attempt + 1, maxRetries, delayMs, status: apiErr.status },
                    '[HyprLead AI] Retryable error. Backing off...',
                );
                await new Promise(r => setTimeout(r, delayMs));
            }
        }

        logger.error({ operationName, maxRetries }, '[HyprLead AI] All retries exhausted.');
        throw lastError;
    }
}

export const aiService = new AIService();
