import OpenAI from 'openai';

function stripThinking(text: string) {
  return text
    .replace(/<thought>[\s\S]*?<\/thought>/gi, '')
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
    .replace(/<[^>]+>/gm, '')
    .trim();
}

function extractJson<T>(text: string): T {
  const cleanText = text
    .replace(/<thought>[\s\S]*?<\/thought>/gi, '')
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
    .replace(/<\|channel>thought[\s\S]*?<channel\|>/gi, '')
    .trim();

  const start = cleanText.indexOf('{');
  const end = cleanText.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error(`No JSON object found in AI response: ${cleanText.slice(0, 200)}`);
  }
  return JSON.parse(cleanText.substring(start, end + 1)) as T;
}

export class AIService {
  private openai: OpenAI;
  private model: string;

  constructor() {
    const rawModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    this.model = rawModel.includes('gemma-3') || rawModel.includes('gemma-30') ? 'gemma-4-26b-a4b-it' : rawModel;
    this.openai = new OpenAI({
      apiKey: process.env.GEMINI_API_KEY,
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    });
  }

  async refineInput(field: string, value: string, context?: any): Promise<string> {
    if (!process.env.GEMINI_API_KEY) {
      return value || '';
    }

    const isListField =
      field.toLowerCase().includes('industry') ||
      field.toLowerCase().includes('location') ||
      field.toLowerCase().includes('city') ||
      field.toLowerCase().includes('area');

    const systemPrompt = isListField
      ? 'You are the HyprLead Form Assistant (HyprLead AI Powered). ' +
        'Your goal is to refine the user input into a clean, comma-separated list of concise B2B categories, industries, or geographic targets (maximum 3 words per item). ' +
        'Do NOT output full sentences, explanation text, bullet points, or conjunctions like "and/or". ' +
        'Return ONLY a valid JSON object with a single key "refined" containing the final refined value. ' +
        'Do NOT output any reasoning, thoughts, drafts, or markdown.'
      : 'You are the HyprLead Form Assistant (HyprLead AI Powered). ' +
        'Your goal is to refine the user input into a high-fidelity, professional description ' +
        'optimized for a B2B lead discovery engine. ' +
        'Return ONLY a valid JSON object with a single key "refined" containing the final refined value. ' +
        'Do NOT output any reasoning, thoughts, drafts, or markdown.';

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: `FIELD: "${field}"\nUSER INPUT: "${value || 'None provided'}"\nCONTEXT: ${JSON.stringify(context || {})}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      });

      const raw = response.choices[0]?.message?.content ?? '';
      const parsed = extractJson<{ refined?: string }>(raw);

      if (parsed.refined && typeof parsed.refined === 'string') {
        return parsed.refined.trim();
      }

      return stripThinking(raw);
    } catch (error) {
      console.error('AI Refinement failed, returning raw input:', error);
      return value || '';
    }
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
