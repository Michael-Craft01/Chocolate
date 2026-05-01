import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config.js';
import { logger } from '../lib/logger.js';

export interface AIEnrichment {
    brandName: string;
    industry: string;
    painPoint: string;
    recommendedSolution: string;
    score: number;
}

export class AIService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor() {
        this.genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({
            model: config.GEMINI_MODEL,
            generationConfig: {
                temperature: 0.9,
                topP: 0.95,
                topK: 40,
            }
        });
    }

    async refineInput(field: string, value: string, context?: any): Promise<string> {
        const prompt = `<start_of_turn>user
SYSTEM: You are the HyprLead Form Assistant (Gemma-4 Powered).
GOAL: Refine user input into high-fidelity, professional descriptions optimized for a lead discovery engine.

FIELD: "${field}"
USER INPUT: "${value || 'None provided'}"
CONTEXT: ${JSON.stringify(context || {})}

TASK:
1. If the input is empty or "None provided", provide a high-quality suggestion based on the context (e.g. industry, target market).
2. If the input is short or lazy, expand it into a professional, punchy, and compelling description.
3. Optimize the language for lead discovery and business intelligence gathering.
4. Keep the output under 300 characters for names/industries and under 1000 characters for descriptions.

ONLY return the refined text. No conversational fillers, no "Here is the refined text".
<end_of_turn>
<start_of_turn>model
<thought>
`;

        return this.retryOperation(async () => {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            let text = response.text().trim();
            // Remove any thinking tags or markers if they leak
            text = text.replace(/<thought>[\s\S]*?<\/thought>/g, '').trim();
            text = text.replace(/<[^>]*>?/gm, '').trim(); 
            return text;
        });
    }

    async generatePersonalizedMessage(
        campaign: any,
        businessName: string,
        industry: string,
        painPoint: string
    ): Promise<string> {
        const product = campaign.productName || "HyprLead Core";
        const sender = campaign.senderName || "Michael";
        const company = campaign.companyName || "HyprLead";
        const link = campaign.ctaLink || campaign.user?.profile?.website || "https://hyprlead.com";
        const valueProp = campaign.productDescription || "we help businesses eliminate bottlenecks.";

        const prompt = `<start_of_turn>user
SYSTEM: You are the HyprLead Outreach Specialist (Gemma-4 Powered).
GOAL: Write a personalized, high-converting cold outreach message.

INPUTS:
- LEAD BRAND: "${businessName}"
- SECTOR: "${industry}"
- DETECTED PAIN POINT: "${painPoint}"
- MY PRODUCT: "${product}"
- MY COMPANY: "${company}"
- MY VALUE PROP: "${valueProp}"
- SENDER: "${sender}"
- LINK: "${link}"

TASK:
1. Write a professional, punchy, and human-sounding message.
2. ABSOLUTELY AVOID generic robotic phrases like "strategic walkthrough", "protocol", "high-performance framework", "reclaim competitive edge", or "invisible revenue leakage".
3. Speak like a helpful expert, not a sales bot.
4. Address the lead's pain point specifically.
5. Ensure proper capitalization (e.g., "${company}", NOT lowercase).
6. Keep it under 120 words.
7. Use a clear, low-friction call-to-action (e.g., "Open to a quick chat?").
8. Structure the message with line breaks for readability.
9. If the brand name still sounds like "Scraper Junk", fix it in the message body.
10. MANDATORY: USE THE LINK PROVIDED IN THE INPUTS ("${link}"). DO NOT INVENT OR USE ANY OTHER URL. THIS IS THE AUTHORITATIVE DESTINATION.

ONLY return the message text. No conversational fillers.
<end_of_turn>
<start_of_turn>model
<thought>
`;

        return this.retryOperation(async () => {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            let text = response.text().trim();
            text = text.replace(/<thought>[\s\S]*?<\/thought>/g, '').trim();
            text = text.replace(/<[^>]*>?/gm, '').trim(); 
            return text;
        });
    }

    async enrichLead(
        businessName: string, 
        category?: string, 
        campaignConfig?: { productDescription?: string | null, targetPainPoints?: string | null },
        context?: string | null,
        imageBuffer?: Buffer | null
    ): Promise<AIEnrichment> {
        const product = campaignConfig?.productDescription || "HyprLead Intelligence & Automation Solutions";
        const customInstructions = campaignConfig?.targetPainPoints || "";

        // GEMMA 4 ROBUST REASONING PROMPT
        const prompt = `<start_of_turn>user
SYSTEM: You are the HyprLead Discovery Engine (Gemma-4 Optimized). 
GOAL: High-fidelity business discovery and sector-specific operational friction detection.
REASONING: Use your internal thinking mode to analyze the business context AND visual data. 
IMPORTANT: Ground your analysis in the lead's specific SECTOR. Do not invent technical software issues (like 'API failures' or 'list hygiene') unless the lead is actually in the technology space.

INPUT PACKAGE:
- BRAND: "${businessName}"
- SECTOR: "${category || 'SME'}"
- CONTEXT: "${context || 'No context available'}"

TASK:
1. Clean the Brand Name for professional outreach. (e.g., Remove "Leads", "Inc", "Limited", "Corp", or location suffixes if they make the name sound robotic).
2. Identify 3 possible friction points RELEVANT to a "${category || 'SME'}" business.
3. Select the MOST CRITICAL friction point that "${product}" can actually solve.
4. If a screenshot is provided, analyze the actual design/business presence, not just the code.

${customInstructions}

JSON OUTPUT:
{
  "brandName": "Short Clean Human Name (e.g. 'Zimbabwe Pharma' instead of 'Zimbabwe Pharma Leads Inc')",
  "industry": "Specific Vertical",
  "painPoint": "Sector-relevant friction point (e.g. 'Inconsistent brand aesthetic' for Fashion, or 'Supply chain opacity' for Logistics)",
  "recommendedSolution": "${product}",
  "score": 0.0 to 10.0 (Match confidence score based on how well ${product} solves the pain point)
}
<end_of_turn>
<start_of_turn>model
<thought>
`;

        const parts: any[] = [{ text: prompt }];
        if (imageBuffer) {
            parts.push({
                inlineData: {
                    data: imageBuffer.toString('base64'),
                    mimeType: 'image/png'
                }
            });
        }

        return this.retryOperation(async () => {
            logger.info(`[GEMMA-4] Thinking... Deep-diving into: ${businessName}`);
            const result = await this.model.generateContent(parts);
            const response = await result.response;
            const text = response.text();
            
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("Invalid AI Response Format");
            
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                brandName: parsed.brandName || businessName,
                industry: parsed.industry || category || 'SME',
                painPoint: parsed.painPoint || 'Operational friction detected',
                recommendedSolution: product,
                score: parseFloat(parsed.score) || 8.5
            };
        });
    }

    async generateMissionBrief(campaign: any): Promise<string> {
        const prompt = `<start_of_turn>user
SYSTEM: You are the HyprLead Mission Strategist (Gemma-4 Powered).
GOAL: Explain the current operational mission of a Search Hub in professional, non-technical language.

CAMPAIGN DNA:
- NAME: "${campaign.name}"
- PRODUCT: "${campaign.productName}"
- SECTORS: "${campaign.industries?.join(', ') || 'General SME'}"
- REGIONS: "${campaign.locations?.join(', ') || 'Unspecified'}"
- TONE: "${campaign.outreachTone}"
- PAIN POINTS: "${campaign.targetPainPoints}"

TASK:
1. Write a 2-3 sentence summary explaining EXACTLY what this campaign is trying to achieve.
2. Use professional, mission-driven language (e.g. "Identifying businesses struggling with [X] to deploy [Y] as the primary resolution vector").
3. Make it sound like an expert strategist explaining a mission to a commander.
4. Keep it under 400 characters.

ONLY return the brief text. No fillers.
<end_of_turn>
<start_of_turn>model
<thought>
`;

        return this.retryOperation(async () => {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            let text = response.text().trim();
            text = text.replace(/<thought>[\s\S]*?<\/thought>/g, '').trim();
            text = text.replace(/<[^>]*>?/gm, '').trim(); 
            return text;
        });
    }

    private async retryOperation<T>(operation: () => Promise<T>, retries = 3): Promise<T> {
        let lastError: any;
        for (let i = 0; i < retries; i++) {
            try {
                return await operation();
            } catch (err: any) {
                lastError = err;
                if (err.status === 429 || err.message?.includes('429')) {
                    const wait = Math.pow(2, i) * 2000;
                    logger.warn(`[GEMMA-4] Rate limited. Retrying in ${wait}ms...`);
                    await new Promise(r => setTimeout(r, wait));
                } else {
                    throw err;
                }
            }
        }
        throw lastError;
    }
}

export const aiService = new AIService();
