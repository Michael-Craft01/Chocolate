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
        this.model = this.genAI.getGenerativeModel({ model: 'gemma-3-27b-it' });
    }

    async enrichLead(businessName: string, category?: string, description?: string): Promise<AIEnrichment> {
        const prompt = `
You are a digital marketing expert analyzing a business lead.

Classify the following business into a SPECIFIC industry (e.g., "Plumbing", "Digital Marketing", "Dentistry", not "General Business").
Identify their major pain point regarding digital presence or operations.
Recommend a specific solution you can offer to solve this pain point.

Respond ONLY with a JSON object in this exact format:
{
  "industry": "specific industry name",
  "painPoint": "their main digital/operational challenge",
  "recommendedSolution": "specific service or strategy you recommend"
}

Business Name: ${businessName}
Category: ${category || 'Unknown'}
Description: ${description || 'N/A'}
`;

        try {
            logger.info(`Requesting AI enrichment for: ${businessName}`);
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const cleanedText = text.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(cleanedText);

            return {
                industry: parsed.industry || 'General Business',
                painPoint: parsed.painPoint || 'Low online visibility',
                recommendedSolution: parsed.recommendedSolution || 'Digital marketing strategy',
            };
        } catch (error) {
            logger.error({ err: error }, 'AI Enrichment error:');
            return {
                industry: 'General Business',
                painPoint: 'Low online visibility',
                recommendedSolution: 'Digital marketing strategy',
            };
        }
    }
}

export const aiService = new AIService();
