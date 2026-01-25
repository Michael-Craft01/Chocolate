import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config.js';
import { logger } from '../lib/logger.js';

export interface AIEnrichment {
    industry: string;
    painPoint: string;
}

export class AIService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor() {
        this.genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: 'gemma-3-27b-ts' });
    }

    async enrichLead(businessName: string, category?: string, description?: string): Promise<AIEnrichment> {
        const prompt = `
      Classify the following business and suggest a major pain point it likely faces regarding digital presence or operations.
      Respond ONLY with a JSON object in this format: {"industry": "string", "painPoint": "string"}

      Business Name: ${businessName}
      Category: ${category || 'Unknown'}
      Description: ${description || 'N/A'}
    `;

        try {
            logger.info(`Requesting AI enrichment for: ${businessName}`);
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Clean up the response (remove potential markdown blocks)
            const cleanedText = text.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(cleanedText);

            return {
                industry: parsed.industry || 'General Business',
                painPoint: parsed.painPoint || 'Low online visibility',
            };
        } catch (error) {
            logger.error({ err: error }, 'AI Enrichment error:');
            return {
                industry: 'General Business',
                painPoint: 'Low online visibility',
            };
        }
    }
}

export const aiService = new AIService();
