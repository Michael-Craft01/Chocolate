import OpenAI from 'openai';

function stripThinking(text: string) {
  return text
    .replace(/<thought>[\s\S]*?<\/thought>/gi, '')
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
    .replace(/<[^>]+>/gm, '')
    .trim();
}

export class AIService {
  private openai: OpenAI;
  private model: string;

  constructor() {
    this.model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    this.openai = new OpenAI({
      apiKey: process.env.GEMINI_API_KEY,
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    });
  }

  async generateMissionBrief(campaign: any): Promise<string> {
    if (!process.env.GEMINI_API_KEY) {
      return 'Campaign mission is ready for strategic synthesis once AI credentials are configured.';
    }

    const prompt =
      `CAMPAIGN DNA:\n` +
      `- NAME: "${campaign.name}"\n` +
      `- PRODUCT: "${campaign.productName}"\n` +
      `- SECTORS: "${campaign.industries?.join(', ') || 'General SME'}"\n` +
      `- REGIONS: "${campaign.locations?.join(', ') || 'Unspecified'}"\n` +
      `- TONE: "${campaign.outreachTone}"\n` +
      `- PAIN POINTS: "${campaign.targetPainPoints}"\n\n` +
      `TASK:\n` +
      `Write a 2-3 sentence summary explaining exactly what this campaign is trying to achieve. ` +
      `Use professional, mission-driven language. Keep it under 400 characters. ` +
      `Return only the brief text.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              'You are the HyprLead Mission Strategist. Write concise, practical campaign mission briefs. No markdown, no labels, no reasoning.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
      });

      return stripThinking(response.choices[0]?.message?.content || '');
    } catch (error) {
      console.error('AI Service Error:', error);
      return 'Analyzing mission parameters for strategic synthesis...';
    }
  }
}

export const aiService = new AIService();
