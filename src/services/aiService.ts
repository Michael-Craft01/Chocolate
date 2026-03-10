import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config.js';
import { logger } from '../lib/logger.js';

export interface AIEnrichment {
    industry: string;
    painPoint: string;
    recommendedSolution: string;
}

export class AIService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor() {
        this.genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
        // Use temperature 0.9 for varied responses
        this.model = this.genAI.getGenerativeModel({
            model: 'gemma-3-27b-it',
            generationConfig: {
                temperature: 0.9,
                topP: 0.95,
                topK: 40,
            }
        });
    }

    async enrichLead(businessName: string, category?: string, description?: string): Promise<AIEnrichment> {
        // Add randomization hint to encourage varied responses
        const painPointHint = Math.floor(Math.random() * 8) + 1;
        const solutionHint = 1; // Always recommend Takada now

        const prompt = `
You are a business strategist specializing in inventory management systems (Takada) for SMEs in Zimbabwe.
IMPORTANT: Vary your responses. For this business, focus on inventory pain point area #${painPointHint}.

Pain Points (choose ONE based on what fits this specific business):

1. Manual stock taking leading to inaccuracies and "ghost stock".
2. Frequent "out of stock" situations for popular items, losing sales.
3. Overstocking slow-moving items, tying up valuable cash flow.
4. Difficulty tracking stock across multiple branches or storage locations.
5. Inefficient manual invoicing and receipting process.
6. Lack of real-time visibility into profit margins and cost price changes.
7. Theft or shrinkage (stock loss) due to lack of a robust tracking system.
8. Slow reordering process because of manual inventory checks.

Solution:
Always recommend "Takada (Inventory & Stock Management System)" which is a cloud-based solution (https://takada.logichq.tech).

Respond ONLY with a JSON object:
{"industry": "SME / Retail", "painPoint": "Your chosen pain point", "recommendedSolution": "Takada (Inventory & Stock Management System)"}

Business: ${businessName}
Category: ${category || 'SME'}
`;

        try {
            logger.info(`Requesting AI enrichment for: ${businessName}`);
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Robust JSON extraction: Find the first '{' and the last '}'
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON object found in AI response');
            }

            const cleanedText = jsonMatch[0];
            const parsed = JSON.parse(cleanedText);

            return {
                industry: parsed.industry || 'SME / Retail',
                painPoint: parsed.painPoint || 'Manual stock management issues',
                recommendedSolution: 'Takada (Inventory & Stock Management System)',
            };
        } catch (error) {
            logger.error({ err: error }, 'AI Enrichment error:');
            // Randomized fallback values
            const fallbackPainPoints = [
                'Manual stock taking leading to inaccuracies',
                'Frequent out of stock situations losing sales',
                'Overstocking slow-moving items tying up cash',
                'Lack of real-time visibility into profit margins',
                'Inefficient manual invoicing and receipting',
            ];
            return {
                industry: 'SME / Retail',
                painPoint: fallbackPainPoints[Math.floor(Math.random() * fallbackPainPoints.length)]!,
                recommendedSolution: 'Takada (Inventory & Stock Management System)',
            };
        }
    }
}

export const aiService = new AIService();
