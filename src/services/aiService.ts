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

    async enrichLead(
        businessName: string, 
        category?: string, 
        campaignConfig?: { productDescription?: string | null, targetPainPoints?: string | null }
    ): Promise<AIEnrichment> {
        // Defaults to Takada if no config provided (backward compatibility / default)
        const product = campaignConfig?.productDescription || "Takada (Inventory & Stock Management System)";
        const customInstructions = campaignConfig?.targetPainPoints || "";

        // Add randomization hint to encourage varied responses
        const painPointHint = Math.floor(Math.random() * 8) + 1;

        const prompt = `
You are a business strategist specializing in selling: "${product}".
${customInstructions}

IMPORTANT: Vary your responses. Focus on a unique pain point that matches the business.

Example Pain Points to consider (if applicable):
1. Manual processes leading to inaccuracies.
2. Loss of sales due to inefficiency.
3. Cash flow tied up in slow-moving operations.
4. Difficulty tracking across branches.
5. Inefficient invoicing and receipting.
6. Lack of real-time visibility.
7. Shrinkage or loss.
8. Slow reordering/ restocking.

Respond ONLY with a JSON object:
{"industry": "Specific Industry", "painPoint": "Specific identified pain point", "recommendedSolution": "${product}"}

Business: ${businessName}
Category: ${category || 'SME'}
`;

        try {
            logger.info(`Requesting AI enrichment for: ${businessName} (Product: ${product})`);
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Robust JSON extraction
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON object found in AI response');
            }

            const parsed = JSON.parse(jsonMatch[0]);

            return {
                industry: parsed.industry || 'SME / Retail',
                painPoint: parsed.painPoint || 'Manual management issues',
                recommendedSolution: product,
            };
        } catch (error) {
            logger.error({ err: error }, 'AI Enrichment error:');
            return {
                industry: 'SME / Retail',
                painPoint: 'Inefficient manual operations',
                recommendedSolution: product,
            };
        }
    }
}

export const aiService = new AIService();
