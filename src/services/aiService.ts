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
        });
    }

    // ── 1. Form Field Refinement (enforced JSON output) ───────────────────────

    async refineInput(field: string, value: string, context?: any): Promise<string> {
        const isListField = 
            field.toLowerCase().includes('industry') || 
            field.toLowerCase().includes('location') || 
            field.toLowerCase().includes('city') || 
            field.toLowerCase().includes('area');

        const systemPrompt = isListField
            ? 'You are the HyprLead Form Assistant (HyprLead AI Powered). ' +
              'Your goal is to refine the user input into a clean, comma-separated list of concise B2B categories, industries, or geographic targets (maximum 3 words per item). ' +
              'Do NOT output full sentences, explanation text, bullet points, or conjunctions like "and/or". ' +
              'Return ONLY a valid JSON object with a single key "refined" containing the final refined value. ' +
              'Do NOT output any reasoning, thoughts, drafts, or markdown.'
            : 'You are the HyprLead Form Assistant (HyprLead AI Powered). ' +
              'Your goal is to refine the user input into a high-fidelity, professional description ' +
              'optimized for a B2B lead discovery engine. ' +
              'Return ONLY a valid JSON object with a single key "refined" containing the final refined value. ' +
              'Do NOT output any reasoning, thoughts, drafts, or markdown.';

        return this.withRetry('refineInput', async () => {
            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt,
                    },
                    {
                        role: 'user',
                        content: `FIELD: "${field}"\nUSER INPUT: "${value || 'None provided'}"\nCONTEXT: ${JSON.stringify(context || {})}`,
                    },
                ],
                response_format: { type: 'json_object' },
                temperature: 0.1,
            });

            const raw = firstChoiceContent(response);
            const parsed = extractJson<{ refined?: string }>(raw);

            if (parsed.refined && typeof parsed.refined === 'string') {
                return parsed.refined.trim();
            }

            // Fallback: clean and return raw text if JSON key is missing
            return stripThinking(raw);
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
            'Perform high-fidelity business discovery and sector-specific operational friction detection. ' +
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
            (imageBuffer ? `4. Analyze the provided website screenshot for design/business presence signals.\n` : '') +
            `\nJSON OUTPUT SCHEMA:\n` +
            `{\n` +
            `  "brandName": "Short clean human name",\n` +
            `  "industry": "Specific vertical",\n` +
            `  "painPoint": "Sector-relevant friction point",\n` +
            `  "recommendedSolution": "${product}",\n` +
            `  "score": 0.0\n` +
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

        return this.withRetry('enrichLead', async () => {
            logger.info(`[HyprLead AI] Thinking... Deep-diving into: ${businessName}`);

            const response = await this.openai.chat.completions.create({
                model: this.model,
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
            }>(raw);

            return {
                brandName:           parsed.brandName           || businessName,
                industry:            parsed.industry            || category || 'SME',
                painPoint:           parsed.painPoint           || 'Operational friction detected',
                recommendedSolution: parsed.recommendedSolution || product,
                score:               parseFloat(String(parsed.score ?? '8.5')) || 8.5,
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

        return this.withRetry('generatePersonalizedMessage', async () => {
            logger.info(`[HyprLead AI] Generating personalized outreach for ${businessName}`);

            const response = await this.openai.chat.completions.create({
                model: this.model,
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

        return this.withRetry('analyzeLead', async () => {
            const response = await this.openai.chat.completions.create({
                model: this.model,
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

        return this.withRetry('generateMissionBrief', async () => {
            const response = await this.openai.chat.completions.create({
                model: this.model,
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

    // ─────────────────────────────────────────────────────────────────────────
    //  Unified Retry with Exponential Backoff
    // ─────────────────────────────────────────────────────────────────────────

    async generateText(prompt: string, operationName = 'generateText'): Promise<string> {
        return this.withRetry(operationName, async () => {
            const response = await this.openai.chat.completions.create({
                model: this.model,
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
        operation: () => Promise<T>,
        maxRetries = 3,
    ): Promise<T> {
        let lastError: any;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                return await operation();
            } catch (err: any) {
                lastError = err;

                const isRateLimit   = err.status === 429 || String(err.message).includes('429');
                const isServerError = err.status >= 500;
                const isRetryable   = isRateLimit || isServerError;

                if (!isRetryable) {
                    // Hard failure (bad request, auth error, etc.) — don't waste retries
                    logger.error(
                        { err: err.message, operationName, status: err.status },
                        '[HyprLead AI] Non-retryable error. Aborting.',
                    );
                    throw err;
                }

                const delayMs = Math.pow(2, attempt) * 2000; // 2s → 4s → 8s
                logger.warn(
                    { operationName, attempt: attempt + 1, maxRetries, delayMs, status: err.status },
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
