import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config.js';
import { logger } from '../lib/logger.js';

export interface AIEnrichment {
    industry: string;
    painPoint: string;
<<<<<<< HEAD
    recommendedSolution: string;
=======
    suggestedSolution: string;
>>>>>>> 6c9b1eb90b6e95f077b1c7bd634f5c5c35c78336
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
<<<<<<< HEAD
You are a digital marketing expert analyzing a business lead.
=======
      You are an expert Software Engineer, AI Engineer, and Market Strategist.
      Analyze the following business and identify a High-Value Operational or Strategic Pain Point (beyond just "visibility").
      Focus on scaling bottlenecks, manual process inefficiencies, customer engagement friction, or data management issues.

      Then, suggest a specific, high-tech solution from this list:
      - WhatsApp Chatbots (for automated support/booking)
      - AI Automations (for workflow efficiency)
      - Custom Management Systems (CRM/ERP)
      - Mobile Apps (for booking, membership, or loyalty)
      - Custom Web Applications
      - Strategic Branding & Digital Transformation

      Respond ONLY with a JSON object in this format:
      {"industry": "Specific Industry", "painPoint": "Detailed operational pain point", "suggestedSolution": "Specific solution from the list matching the pain point"}
>>>>>>> 6c9b1eb90b6e95f077b1c7bd634f5c5c35c78336

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
<<<<<<< HEAD
                painPoint: parsed.painPoint || 'Low online visibility',
                recommendedSolution: parsed.recommendedSolution || 'Digital marketing strategy',
=======
                painPoint: parsed.painPoint || 'Inefficient manual processes limiting growth',
                suggestedSolution: parsed.suggestedSolution || 'Custom Digital Strategy',
>>>>>>> 6c9b1eb90b6e95f077b1c7bd634f5c5c35c78336
            };
        } catch (error) {
            logger.error({ err: error }, 'AI Enrichment error:');
            return {
                industry: 'General Business',
<<<<<<< HEAD
                painPoint: 'Low online visibility',
                recommendedSolution: 'Digital marketing strategy',
=======
                painPoint: 'Inefficient manual processes limiting growth',
                suggestedSolution: 'Custom Digital Strategy',
>>>>>>> 6c9b1eb90b6e95f077b1c7bd634f5c5c35c78336
            };
        }
    }
}

export const aiService = new AIService();
