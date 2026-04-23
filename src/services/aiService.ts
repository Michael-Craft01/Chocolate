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
        context?: string | null
    ): Promise<AIEnrichment> {
        const product = campaignConfig?.productDescription || "HyprLead Intelligence & Automation Solutions";
        const customInstructions = campaignConfig?.targetPainPoints || "";

        // GEMMA 3 OPTIMIZED PROMPT STRUCTURE
        const prompt = `<start_of_turn>user
SYSTEM INSTRUCTIONS:
You are a high-performance business analyst for: "${product}". 
Your goal is to perform high-fidelity extraction and operational friction detection.
Always respond in valid, parseable JSON.

TASK:
Analyze this intelligence package:
- RAW TITLE: "${businessName}"
- CONTEXT/TELEMETRY: "${context || 'No telemetry available'}"
- SECTOR: "${category || 'SME'}"

GUIDELINES:
1. Extract the actual BRAND NAME (company name only).
2. Detect a deep OPERATIONAL PAIN POINT based on the telemetry.
   - Low ratings (<4.0) -> Customer experience or reputation friction.
   - "Ghost Town" (No website) -> Digital invisibility and lead leakage.
   - "Manual/Slow/Queue" in snippet -> Process automation bottleneck.
   - Otherwise, identify a specific sectoral friction point.

${customInstructions}

JSON OUTPUT FORMAT:
{
  "brandName": "Short, Clean Company Name",
  "industry": "Specific Niche Industry", 
  "painPoint": "Specific identified operational friction", 
  "recommendedSolution": "${product}"
}
<end_of_turn>
<start_of_turn>model
`;

        try {
            logger.info(`[GEMMA-3] Requesting High-Fidelity enrichment for: ${businessName}`);
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON object found in AI response');
            }

            const parsed = JSON.parse(jsonMatch[0]);

            return {
                brandName: parsed.brandName || businessName.split(' ')[0] || 'Business',
                industry: parsed.industry || category || 'SME / Retail',
                painPoint: parsed.painPoint || 'Non-optimized operational workflow',
                recommendedSolution: product,
            };
        } catch (error) {
            logger.error({ err: error }, 'AI Enrichment error:');
            return {
                brandName: businessName.split(' ')[0] || 'Business',
                industry: category || 'SME / Retail',
                painPoint: 'Operational visibility gaps',
                recommendedSolution: product,
            };
        }
    }
}

export const aiService = new AIService();
