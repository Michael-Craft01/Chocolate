import { GoogleGenerativeAI } from '@google/generative-ai';

export class AIService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
        this.model = this.genAI.getGenerativeModel({
            model: process.env.GEMINI_MODEL || 'gemma-3-27b-it',
            generationConfig: {
                temperature: 0.9,
                topP: 0.95,
                topK: 40,
            }
        });
    }

    async generateMissionBrief(campaign: any): Promise<string> {
        const prompt = `<start_of_turn>user
SYSTEM: You are the HyprLead Mission Strategist (Gemma-4 Powered).
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
<thought>
`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            let text = response.text().trim();
            text = text.replace(/<thought>[\s\S]*?<\/thought>/g, '').trim();
            text = text.replace(/<[^>]*>?/gm, '').trim(); 
            return text;
        } catch (error) {
            console.error('AI Service Error:', error);
            return "Analyzing mission parameters for strategic synthesis...";
        }
    }
}

export const aiService = new AIService();
