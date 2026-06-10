import OpenAI from 'openai';

function stripThinking(text: string) {
  return text
    .replace(/<thought>[\s\S]*?<\/thought>/gi, '')
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
    .replace(/<[^>]+>/gm, '')
    .trim();
}

function extractJson<T>(text: string): T {
  // Strip thinking tags FIRST before looking for JSON
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
    // Lock to Gemma models only — per product requirement.
    // gemma-4-26b-a4b-it is the verified working Gemma 4 model.
    // Any legacy env value that accidentally points to a broken model is rewritten here.
    const rawModel = process.env.GEMINI_MODEL || 'gemma-4-26b-a4b-it';
    const ALLOWED_GEMMA = [
      'gemma-4-26b-a4b-it',
      'gemma-3-27b-it',
    ];
    this.model = ALLOWED_GEMMA.includes(rawModel) ? rawModel : 'gemma-4-26b-a4b-it';
    this.openai = new OpenAI({
      apiKey: process.env.GEMINI_API_KEY,
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
      timeout: 30000, // 30 seconds request timeout
    });
  }

  async refineInput(field: string, value: string, context?: Record<string, unknown>): Promise<string> {
    if (!process.env.GEMINI_API_KEY) {
      return value || '';
    }

    // If the input is completely empty, nothing to elaborate
    if (!value || !value.trim()) {
      return '';
    }

    const isListField =
      field.toLowerCase().includes('industry') ||
      field.toLowerCase().includes('location') ||
      field.toLowerCase().includes('city') ||
      field.toLowerCase().includes('area');

    const systemPrompt = isListField
      ? 'You are the HyprLead AI Assistant. ' +
        'The user has typed a partial or rough list. Elaborate it into a clean, comma-separated list of specific B2B categories, industries, or geographic targets (maximum 3 words per item). ' +
        'Add relevant entries the user may have missed but that align with their input. ' +
        'Do NOT output full sentences, explanation, bullet points, or conjunctions like "and/or". ' +
        'Return ONLY a valid JSON object with a single key "refined" containing the elaborated value. ' +
        'Do NOT output any reasoning, thoughts, drafts, or markdown.'
      : 'You are the HyprLead AI Assistant. ' +
        'The user has typed a short or rough input. Elaborate it into a detailed, professional, persuasive description ' +
        'optimised for B2B lead outreach and discovery. Expand vague language, add specifics, and make it compelling. ' +
        'Maintain the user\'s original intent and tone — just make it richer and more complete. ' +
        'Return ONLY a valid JSON object with a single key "refined" containing the elaborated value (plain text, no markdown). ' +
        'Do NOT output any reasoning, thoughts, drafts, or markdown.';

    try {
      const response = await this.openai.chat.completions.create({
        // Elaborate uses gemma-4-26b-a4b-it — verified working Gemma 4 model.
        // (gemma-3-27b-it is not available on the Gemini API — use gemma-4-26b-a4b-it instead)
        model: 'gemma-4-26b-a4b-it',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: `FIELD: "${field}"\nUSER INPUT: "${value}"\nCONTEXT: ${JSON.stringify(context ?? {})}\n\nElaborate the user's input for this field into a high-quality, detailed version.`,
          },
        ],
        // NOTE: response_format json_object is NOT supported by Gemma models on the Gemini API.
        // We rely on the prompt + extractJson to parse the JSON response instead.
        // max_tokens must be high enough to include both the <thought> block and the JSON output.
        temperature: 0.4,
        max_tokens: 2000,
      });

      const raw = response.choices[0]?.message?.content ?? '';
      if (!raw.trim()) {
        throw new Error('Empty response from AI model');
      }

      // Try strict JSON parse first
      try {
        const parsed = extractJson<{ refined?: string }>(raw);
        if (parsed.refined && typeof parsed.refined === 'string' && parsed.refined.trim()) {
          return parsed.refined.trim();
        }
      } catch {
        // JSON parse failed — model returned plain text, use it directly
        const stripped = stripThinking(raw);
        if (stripped) return stripped;
      }

      throw new Error('Could not extract elaborated text from AI response');
    } catch (error) {
      // Re-throw so the ElaborateButton shows "Failed" instead of silently returning the original value
      console.error('[AIService.refineInput] Elaborate failed:', error);
      throw error;
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
