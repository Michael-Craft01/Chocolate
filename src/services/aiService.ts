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
                temperature: 0.3, // Lowered temperature to ensure deterministic, professional business emails and structured profiles
                topP: 0.95,
                topK: 40,
                stopSequences: ["<end_of_turn>"] // Prevent generation leakage into pre-training Chinese text or generic website scrapes
            }
        });
    }

    async refineInput(field: string, value: string, context?: any): Promise<string> {
        const prompt = `<start_of_turn>user
SYSTEM: You are the HyprLead Form Assistant (HyprLead AI Powered).
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
SYSTEM: You are the HyprLead Outreach Specialist (HyprLead AI Powered).
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
1. Write a warm, friendly, and robust message, speaking like a dedicated sales representative of the company who genuinely cares about helping their business grow.
2. Adopt a highly persuasive yet fully natural, human-sounding conversational tone—absolutely avoid sounding like a boring robotic corporate sales bot.
3. ABSOLUTELY AVOID robotic buzzwords or generic jargon like "strategic walkthrough", "protocol", "high-performance framework", "reclaim competitive edge", or "invisible revenue leakage".
4. Address the lead's pain point specifically and show how "${product}" can directly solve their frustrations, recover lost sales, or streamline operations.
5. Ensure proper capitalization (e.g., "${company}", NOT lowercase).
6. Keep it under 120 words.
7. Use a clear, warm, and highly persuasive call-to-action (e.g., "Are you open to a quick 5-minute chat this week to see if we can help?", or "Open to a quick call to check this out?").
8. Structure the message with line breaks for readability.
9. If the brand name still sounds like "Scraper Junk", fix it in the message body.
10. MANDATORY: USE THE LINK PROVIDED IN THE INPUTS ("${link}"). DO NOT INVENT OR USE ANY OTHER URL. THIS IS THE AUTHORITATIVE DESTINATION.

MANDATORY: Wrap the final completed cold outreach message inside <email> and </email> XML tags (e.g., <email>Hi there, ... Best, Mike</email>). Do NOT output anything else inside these XML tags.
<end_of_turn>
<start_of_turn>model

`;

        return this.retryOperation(async () => {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().trim();
            
            // Bulletproof extraction: match content within <email> tags
            const emailMatch = text.match(/<email>([\s\S]*?)<\/email>/i);
            if (emailMatch && emailMatch[1]) {
                return emailMatch[1].trim();
            }

            // Fallback parser if tags are absent or mutated
            let fallback = text;
            fallback = fallback.replace(/<thought>[\s\S]*?<\/thought>/g, '').trim();
            fallback = fallback.replace(/<[^>]*>?/gm, '').trim(); 
            return fallback;
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

        // HyprLead AI ROBUST REASONING PROMPT
        const prompt = `<start_of_turn>user
SYSTEM: You are the HyprLead Discovery Engine (HyprLead AI Optimized). 
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
            logger.info(`[HyprLead AI] Thinking... Deep-diving into: ${businessName}`);
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
SYSTEM: You are the HyprLead Mission Strategist (HyprLead AI Powered).
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
                    logger.warn(`[HyprLead AI] Rate limited. Retrying in ${wait}ms...`);
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
