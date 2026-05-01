import { logger } from '../lib/logger.js';
import { aiService } from './aiService.js';

export class MessageGenerator {
    private getOpenings(campaign: any, businessName: string) {
        const company = campaign.companyName || 'HyprLead';
        return [
            `Hello ${businessName} team,`,
            `Hi ${businessName},`,
            `Good day ${businessName} leadership,`,
            `Greetings from the ${company} operations desk,`,
        ];
    }

    private getIntros(campaign: any) {
        const name = campaign.senderName || 'Michael';
        const company = campaign.companyName || 'HyprLead';
        const role = campaign.senderRole || 'Intelligence Analyst';
        const description = campaign.productDescription || 'we engineer autonomous systems that turn operational friction into high-velocity growth.';

        return [
            `I'm ${name} from ${company} — ${description}`,
            `${name} here from ${company}. We specialize in ${campaign.productName || 'mission-critical intelligence'} for growing market leaders.`,
            `I'm an ${role} at ${company}. We help businesses eliminate bottlenecks and scale with precision.`,
            `I'm ${name}, a ${role} focused on helping teams reclaim their competitive edge through hyper-automation.`,
        ];
    }

    private getHooks(campaign: any, businessName: string, industry: string) {
        const location = campaign.locations?.[0] || 'your region';
        return [
            `While mapping the growth trajectory of businesses in ${location}, ${businessName} stood out as a primary candidate for operational optimization.`,
            `I've been analyzing the tech landscape for ${industry} players, and I noticed ${businessName} is perfectly positioned to capture more market share by modernizing your stack.`,
            `During our latest sector audit, we identified how ${businessName} could significantly accelerate by moving beyond traditional legacy constraints.`,
        ];
    }

    private getCTAs(campaign: any, businessName: string, industry: string) {
        const goal = campaign.targetPainPoints?.includes('demo') ? 'system demonstration' : 'strategic walkthrough';
        return [
            `Would you be open to a 10-minute ${goal} of the HyprLead protocol this week?`,
            `Do you have a small window for a brief ${goal} on how we can advance ${businessName}?`,
            `Are you available for a brief session to explore scaling ${businessName} with our autonomous solutions?`,
        ];
    }

    private getRandomItem<T>(arr: T[]): T {
        return arr[Math.floor(Math.random() * arr.length)]!;
    }

    async generate(campaign: any, businessName: string, industry: string, painPoint: string, recommendedSolution?: string): Promise<string> {
        try {
            logger.info(`[GEMMA-4] Generating personalized outreach for ${businessName}`);
            return await aiService.generatePersonalizedMessage(campaign, businessName, industry, painPoint);
        } catch (error) {
            logger.warn({ error, businessName }, 'AI message generation failed, falling back to template');
            return this.generateFallback(campaign, businessName, industry, painPoint, recommendedSolution);
        }
    }

    private generateFallback(campaign: any, businessName: string, industry: string, painPoint: string, recommendedSolution?: string): string {
        const product = campaign.productName || recommendedSolution || 'HyprLead Core';
        const sender = campaign.senderName || 'Michael';
        const company = campaign.companyName || 'HyprLead';
        const link = campaign.ctaLink || campaign.user?.profile?.website || 'https://hyprlead.com';

        const greeting = this.getRandomItem(this.getOpenings(campaign, businessName));
        const intro = this.getRandomItem(this.getIntros(campaign));
        const interest = this.getRandomItem(this.getHooks(campaign, businessName, industry));

        const pain = `Specifically, my analysis indicates that ${businessName} may be experiencing friction due to ${painPoint.toLowerCase()}. In a high-velocity market, these gaps often lead to invisible revenue leakage.`;
        
        const solution = `This is exactly why we deployed ${product} (${link}). It is a high-performance framework designed to synchronize your operations and eliminate manual drag instantly.`;

        const cta = `${this.getRandomItem(this.getCTAs(campaign, businessName, industry))}

— ${sender}
${company} | Intelligence & Automation
${link}`;

        return `${greeting}\n\n${intro}\n\n${interest}\n\n${pain}\n\n${solution}\n\n${cta}`;
    }

    generateWhatsAppGreeting(campaign: any, businessName: string): string {
        const sender = campaign.senderName || 'Michael';
        const company = campaign.companyName || 'HyprLead';
        const link = campaign.ctaLink || campaign.user?.profile?.website || 'https://hyprlead.com';

        const greetings = [
            `Hi! I'm ${sender} from ${company}. I've identified a growth bottleneck at ${businessName} and wanted to share our optimization protocol (${link}). Interested in a brief brief?`,
            `Hello! ${sender} here. We've mapped out a scaling framework for ${businessName} that eliminates manual friction. Do you have 2 minutes for a voice note?`,
        ];
        return this.getRandomItem(greetings);
    }
}

export const messageGenerator = new MessageGenerator();
