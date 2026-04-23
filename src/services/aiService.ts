import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config.js';
import { logger } from '../lib/logger.js';

export interface AIEnrichment {
    brandName: string;
    industry: string;
    painPoint: string;
    recommendedSolution: string;
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
SYSTEM: You are the HyprLead Engine (Gemma-4 Optimized). 
GOAL: High-fidelity business extraction and sector-specific operational friction detection.
REASONING: Use your internal thinking mode to analyze the telemetry AND visual data. 
IMPORTANT: Ground your analysis in the lead's specific SECTOR. Do not invent technical software issues (like 'API failures' or 'list hygiene') unless the lead is actually in the technology space.

INPUT PACKAGE:
- BRAND: "${businessName}"
- SECTOR: "${category || 'SME'}"
- TELEMETRY: "${context || 'No telemetry available'}"

TASK:
1. Clean the Brand Name for professional outreach.
2. Identify 3 possible friction points RELEVANT to a "${category || 'SME'}" business.
3. Select the MOST CRITICAL friction point that "${product}" can actually solve.
4. If a screenshot is provided, analyze the actual design/business presence, not just the code.

${customInstructions}

JSON OUTPUT:
{
  "brandName": "Short Clean Name",
  "industry": "Specific Vertical",
  "painPoint": "Sector-relevant friction point (e.g. 'Inconsistent brand aesthetic' for Fashion, or 'Supply chain opacity' for Logistics)",
  "recommendedSolution": "${product}"
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
                recommendedSolution: product
            };
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
