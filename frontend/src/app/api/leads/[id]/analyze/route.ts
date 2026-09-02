import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, authError } from '@/lib/api-auth';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY || 'dummy_build_key',
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
});

const ALLOWED_GEMMA_MODELS = new Set(['gemma-4-26b-a4b-it', 'gemma-3-27b-it']);
const rawModel = process.env.GEMINI_MODEL || 'gemma-4-26b-a4b-it';
// Strict whitelist: only allow verified Gemma models. Any other value falls back to the safe Gemma 4 model.
const MODEL = ALLOWED_GEMMA_MODELS.has(rawModel) ? rawModel : 'gemma-4-26b-a4b-it';

function extractJson<T>(text: string): T {
  const cleanText = text
    .replace(/<thought>[\s\S]*?<\/thought>/gi, '')
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
    .replace(/<\|channel>thought[\s\S]*?<channel\|>/gi, '')
    .trim();

  const start = cleanText.indexOf('{');
  const end = cleanText.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('No JSON found in response');
  }
  return JSON.parse(cleanText.substring(start, end + 1)) as T;
}

function normalizeAnalysis(parsed: any) {
  return {
    summary: parsed.summary || 'No summary available.',
    opportunityScore: Math.min(10, Math.max(1, parseInt(String(parsed.opportunityScore ?? '7')) || 7)),
    whyThisLead: parsed.whyThisLead || '',
    salesApproach: parsed.salesApproach || 'CONSULTATIVE - lead with the detected pain and ask for a short fit check.',
    talkingPoints: Array.isArray(parsed.talkingPoints) ? parsed.talkingPoints.slice(0, 4) : [],
    likelyObjection: parsed.likelyObjection || '',
    objectionResponse: parsed.objectionResponse || '',
    nextBestAction: parsed.nextBestAction || '',
    urgencySignal: parsed.urgencySignal || '',
  };
}

function fallbackAnalysis(lead: any, campaign: any) {
  const hasDirectContact = Boolean(lead.business.email || lead.business.phone);
  const product = campaign.productName || 'your offer';
  const painPoint = lead.painPoint || campaign.targetPainPoints || 'operational friction';
  const channel = lead.business.email
    ? 'email'
    : lead.business.phone
      ? 'WhatsApp or phone'
      : lead.business.bestContactChannel === 'social_profile'
        ? 'social-profile outreach'
        : lead.business.bestContactChannel === 'contact_page'
          ? 'contact-page outreach'
          : 'website-first outreach';

  return normalizeAnalysis({
    summary: `${lead.business.name} is a ${lead.industry || 'target'} prospect matched to this campaign because its detected friction overlaps with ${product}'s value proposition. The strongest sales path is to connect the pain signal to a measurable outcome, then move quickly toward a short diagnostic conversation.`,
    opportunityScore: hasDirectContact ? 8 : 6,
    whyThisLead: `This lead matches the campaign because it sits in ${lead.industry || 'the selected industry'} and shows signs of ${painPoint}. ${hasDirectContact ? 'A direct contact channel is available, so outreach can start immediately.' : 'Contact data is thinner, so qualify through the website before pushing for a meeting.'}`,
    salesApproach: `${campaign.outreachTone === 'DIRECT' ? 'DIRECT' : 'CONSULTATIVE'} - lead with the specific pain signal, then position ${product} as the practical fix.`,
    talkingPoints: [
      `Open with the detected pain point: ${painPoint}.`,
      `Tie the issue to ${campaign.productDescription || product}.`,
      `Reference their ${lead.industry || 'industry'} context instead of sending a generic pitch.`,
      `End with one low-friction next step, such as a short review or demo.`,
    ],
    likelyObjection: 'We already have a process for this.',
    objectionResponse: `Acknowledge that, then frame ${product} as a way to improve the current process without forcing a full workflow change upfront.`,
    nextBestAction: `Send a ${channel} message that mentions ${painPoint} and asks for a 10-minute fit check.`,
    urgencySignal: `This lead was found by a live campaign targeting ${campaign.locations?.join(', ') || campaign.targetCountry || 'the selected market'}, so the context is fresh enough for immediate outreach.`,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req);
  if (!user) return authError();

  const { id } = await params;

  try {
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        business: true,
        cycleRun: true,
        campaign: {
          include: {
            user: {
              select: {
                tier: true,
                automationMode: true,
                autoRunFrequency: true,
                profile: true,
              },
            },
          },
        },
      },
    });

    if (!lead || lead.campaign.userId !== user.id) {
      return NextResponse.json({ error: 'Lead not found or access denied' }, { status: 404 });
    }

    const { business, campaign } = lead;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(fallbackAnalysis(lead, campaign));
    }

    const systemPrompt =
      'You are a senior B2B sales strategist embedded in the HyprLead platform. ' +
      'Analyze the given lead and explain how the user can convert it into a sale. ' +
      'Ground every recommendation in the lead findings, campaign context, and user settings. ' +
      'Be specific, practical, and commercial. No generic advice. ' +
      'Return ONLY a valid JSON object matching the schema exactly. No prose, no markdown.';

    const userPrompt =
      `LEAD:\n` +
      `- Company: "${business.name}"\n` +
      `- Industry: "${lead.industry}"\n` +
      `- Detected Pain Point: "${lead.painPoint}"\n` +
      `- Suggested Outreach Draft: "${lead.suggestedMessage}"\n` +
      `- Has Phone: ${business.phone ? 'Yes' : 'No'}\n` +
      `- Has Email: ${business.email ? 'Yes' : 'No'}\n` +
      `- Website: ${business.website || 'None'}\n` +
      `- Contact Status: ${business.contactStatus || 'unknown'}\n` +
      `- Best Contact Channel: ${business.bestContactChannel || 'unknown'}\n` +
      `- Contact Confidence: ${business.contactConfidence || 0}\n` +
      `- Contact Pages: ${Array.isArray(business.contactPages) ? business.contactPages.join(', ') : 'None'}\n` +
      `- Social Profiles: ${Array.isArray(business.socialProfiles) ? business.socialProfiles.join(', ') : 'None'}\n` +
      `- People To Contact: ${Array.isArray(business.decisionMakers) ? business.decisionMakers.map((p: any) => [p.name, p.role, p.profileUrl].filter(Boolean).join(' / ')).join('; ') : 'None'}\n` +
      `- Discovery Cycle: ${lead.cycleRun ? `${lead.cycleRun.triggerType} / ${lead.cycleRun.status} / ${lead.cycleRun.leadsFound} of ${lead.cycleRun.maxLeads} found` : 'Legacy or uncategorized'}\n\n` +
      `CAMPAIGN CONTEXT:\n` +
      `- Campaign: "${campaign.name}"\n` +
      `- Our Product: "${campaign.productName}"\n` +
      `- What We Do: "${campaign.productDescription}"\n` +
      `- Pain Points We Target: "${campaign.targetPainPoints}"\n` +
      `- Our Company: "${campaign.companyName}"\n` +
      `- Sender: "${campaign.senderName}" (${campaign.senderRole})\n` +
      `- Target Regions: "${campaign.locations?.join(', ') || campaign.targetCountry}"\n` +
      `- Target Industries: "${campaign.industries?.join(', ')}"\n` +
      `- Outreach Tone: "${campaign.outreachTone}"\n` +
      `- CTA Link: "${campaign.ctaLink || campaign.user.profile?.website || 'None'}"\n\n` +
      `USER SETTINGS:\n` +
      `- Account Tier: "${campaign.user.tier}"\n` +
      `- Automation Mode: "${campaign.user.automationMode}"\n` +
      `- Auto Run Frequency: "${campaign.user.autoRunFrequency}"\n` +
      `- Profile Company: "${campaign.user.profile?.companyName || campaign.companyName}"\n` +
      `- Profile Website: "${campaign.user.profile?.website || 'None'}"\n\n` +
      `TASK: Produce a sales intelligence brief that explains what this lead is, why it matters, and how to turn it into a sale.\n\n` +
      `JSON SCHEMA:\n` +
      `{\n` +
      `  "summary": "2-3 sentence plain-English explanation of what this lead is, what was found, and why it is commercially useful",\n` +
      `  "opportunityScore": 1-10 integer representing product-market fit strength,\n` +
      `  "whyThisLead": "1-2 sentences on why this business matches our ICP",\n` +
      `  "salesApproach": "DIRECT | CONSULTATIVE | EDUCATIONAL - best approach in one sentence, based on campaign tone and available contact channels",\n` +
      `  "talkingPoints": ["3-4 specific concrete talking points referencing their pain, our product, and the next sale step"],\n` +
      `  "likelyObjection": "Most likely objection from this business type",\n` +
      `  "objectionResponse": "Concise confident response to that objection",\n` +
      `  "nextBestAction": "Single most effective next action to move toward a meeting or sale",\n` +
      `  "urgencySignal": "One specific reason why outreach timing is ideal now for this business type"\n` +
      `}`;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.25,
    });

    const raw = response.choices[0].message.content ?? '';
    return NextResponse.json(normalizeAnalysis(extractJson<any>(raw)));
  } catch (error: any) {
    console.error('Lead analysis failed:', error.message);
    try {
      const lead = await prisma.lead.findUnique({
        where: { id },
        include: { business: true, campaign: true },
      });
      if (lead) return NextResponse.json(fallbackAnalysis(lead, lead.campaign));
    } catch {}
    return NextResponse.json({ error: error.message || 'Analysis failed' }, { status: 500 });
  }
}
