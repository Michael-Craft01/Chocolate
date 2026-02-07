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
        // Use temperature 0.9 for varied responses across different leads
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
        const prompt = `
You are a PropTech strategist analyzing real estate businesses in Zimbabwe and South Africa.

Identify ONE primary pain point from this list that most likely applies to this business:
- No online booking for property viewings
- Properties sitting on the market too long (slow sales cycle)
- Competitors have better online presence
- Manual WhatsApp follow-ups taking too much time
- No CRM to track buyer/tenant inquiries

Then suggest ONE high-value tech solution from this list:
- Property CRM System (lead & deal tracking)
- WhatsApp Automation (instant inquiry response)
- Professional Property Portal/Website
- Virtual Tour Platform (3D/360 tours)
- Agent Performance Dashboard
- AI-Powered Property Valuation (AVM)
- Automated Tenant Screening & Credit Scoring
- Digital Lease Management & E-signatures
- Smart Property Management (Rent collection & Maintenance)
- Predictive Market Analytics
- Blockchain-based Title Deed Verification
- IoT-enabled Smart Building Management

Respond ONLY with a JSON object in this format:
{"industry": "Real Estate", "painPoint": "Specific pain point from list", "recommendedSolution": "Specific solution from list"}

Business Name: ${businessName}
Category: ${category || 'Real Estate'}
Description: ${description || 'N/A'}
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
                industry: parsed.industry || 'Real Estate',
                painPoint: parsed.painPoint || 'Manual processes limiting growth',
                recommendedSolution: parsed.recommendedSolution || parsed.suggestedSolution || 'Property CRM System',
            };
        } catch (error) {
            logger.error({ err: error }, 'AI Enrichment error:');
            return {
                industry: 'Real Estate',
                painPoint: 'Manual processes limiting growth',
                recommendedSolution: 'Property CRM System',
            };
        }
    }
}

export const aiService = new AIService();
