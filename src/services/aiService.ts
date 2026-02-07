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
        // Add randomization hint to encourage varied responses
        const painPointHint = Math.floor(Math.random() * 10) + 1; // 10 pain points now
        const solutionHint = Math.floor(Math.random() * 12) + 1;

        const prompt = `
You are a PropTech strategist analyzing real estate businesses in Zimbabwe and South Africa.
IMPORTANT: Vary your responses. For this business, focus on pain point area #${painPointHint} and solution type #${solutionHint}.

Pain Points (choose ONE based on what fits this specific business):

1. Manual viewing coordination and high no-show rates for property tours.
2. Extended time-on-market and high vacancy rates due to poor listing visibility.
3. Weak digital brand presence and outdated website compared to tech-forward competitors.
4. Overwhelming manual WhatsApp/Social Media inquiries leading to slow response times.
5. Fragmented lead data and lack of a centralized CRM for buyer/tenant tracking.
6. Difficulty in verifying tenant reliability and creditworthiness in the local market.
7. Slow, paper-based lease management and manual rent collection processes.
8. Inaccurate property valuations resulting in overpriced listings and lost interest.
9. High volume of unqualified leads wasting agent time on non-serious inquiries.
10. Lack of data-driven insights

Solutions (choose ONE that solves the pain point):
1. Property CRM System (lead & deal tracking)
2. WhatsApp Automation (instant inquiry response)
3. Professional Property Portal/Website
4. Virtual Tour Platform (3D/360 tours)
5. Agent Performance Dashboard
6. AI-Powered Property Valuation (AVM)
7. Automated Tenant Screening & Credit Scoring
8. Digital Lease Management & E-signatures
9. Smart Property Management (Rent collection & Maintenance)
10. Predictive Market Analytics
11. Blockchain-based Title Deed Verification
12. IoT-enabled Smart Building Management

Respond ONLY with a JSON object:
{"industry": "Real Estate", "painPoint": "Your chosen pain point", "recommendedSolution": "Your chosen solution"}

Business: ${businessName}
Category: ${category || 'Real Estate'}
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
            // Randomized fallback values
            const fallbackPainPoints = [
                'Manual viewing coordination and high no-show rates',
                'Weak digital brand presence compared to competitors',
                'Overwhelming manual WhatsApp inquiries',
                'Fragmented lead data and lack of CRM',
                'Slow paper-based lease management',
            ];
            const fallbackSolutions = [
                'Property CRM System',
                'WhatsApp Automation',
                'Professional Property Portal',
                'Virtual Tour Platform',
                'Agent Performance Dashboard',
            ];
            return {
                industry: 'Real Estate',
                painPoint: fallbackPainPoints[Math.floor(Math.random() * fallbackPainPoints.length)]!,
                recommendedSolution: fallbackSolutions[Math.floor(Math.random() * fallbackSolutions.length)]!,
            };
        }
    }
}

export const aiService = new AIService();
