import { logger } from '../lib/logger.js';

export class MessageGenerator {
    private getOpenings(campaign: any, businessName: string) {
        const company = campaign.companyName || 'our team';
        return [
            `Hello ${businessName} team,`,
            `Hi ${businessName},`,
            `Good day ${businessName} team,`,
            `Greetings from ${company},`,
        ];
    }

    private getIntros(campaign: any) {
        const name = campaign.senderName || 'Michael';
        const company = campaign.companyName || 'LogicHQ';
        const role = campaign.senderRole || 'Software Engineer';
        const description = campaign.productDescription || 'we build smart systems that turn manual operations into automated growth engines.';

        return [
            `I'm ${name} from ${company} — ${description}`,
            `${name} here from ${company}. We specialize in ${campaign.productName || 'building high-value software'} for growing local businesses.`,
            `I'm a ${role} from ${company}. We help businesses automate operations and scale faster.`,
            `I'm ${name}, a ${role} who's passionate about helping local teams reclaim their time through smart automation.`,
        ];
    }

    private getHooks(campaign: any, businessName: string, industry: string) {
        const location = campaign.locations?.[0] || 'your area';
        return [
            `I've been tracking the evolution of businesses in ${location}, and ${businessName}'s trajectory stands out as particularly impressive.`,
            `I've noticed that while many ${industry} firms are held back by traditional systems, ${businessName} is perfectly positioned to lead with a more agile approach.`,
            `While auditing the current tech landscape, I saw how ${businessName} could significantly advance by moving beyond bulky traditional infrastructure.`,
        ];
    }

    private getCTAs(campaign: any, businessName: string, industry: string) {
        const goal = campaign.targetPainPoints?.includes('demo') ? 'demo' : 'walkthrough';
        return [
            `Would you be open to a quick 10-minute ${goal} of ${campaign.productName} this week?`,
            `Do you have 10 minutes for a brief ${goal} of how our system can advance your business?`,
            `Are you available for a quick call to explore scaling ${businessName} with our smart solutions?`,
        ];
    }

    private getRandomItem<T>(arr: T[]): T {
        return arr[Math.floor(Math.random() * arr.length)]!;
    }

    generate(campaign: any, businessName: string, industry: string, painPoint: string, recommendedSolution?: string): string {
        const product = campaign.productName || recommendedSolution || 'our solution';
        const sender = campaign.senderName || 'Michael';
        const company = campaign.companyName || 'LogicHQ';
        const link = campaign.ctaLink || 'https://logichq.tech';

        const greeting = this.getRandomItem(this.getOpenings(campaign, businessName));
        const intro = this.getRandomItem(this.getIntros(campaign));
        const interest = this.getRandomItem(this.getHooks(campaign, businessName, industry));

        const pain = `Specifically, I've noticed many businesses in your space struggle with ${painPoint.toLowerCase()}. This often leads to inefficiencies and lost opportunities.`;
        
        const solution = `This is exactly why we built ${product} (${link}). It's a high-performance system designed to advance your operations instantly.`;

        const cta = `${this.getRandomItem(this.getCTAs(campaign, businessName, industry))}

— ${sender}
${company} | Automation Solutions
${link}`;

        const message = `${greeting}\n\n${intro}\n\n${interest}\n\n${pain}\n\n${solution}\n\n${cta}`;

        logger.debug(`Generated dynamic message for ${businessName} via Campaign: ${campaign.name}`);
        return message;
    }

    generateWhatsAppGreeting(campaign: any, businessName: string): string {
        const sender = campaign.senderName || 'Michael';
        const company = campaign.companyName || 'LogicHQ';
        const link = campaign.ctaLink || 'https://logichq.tech';

        const greetings = [
            `Hi! I'm ${sender} from ${company}. I noticed ${businessName} and wanted to share how you can scale operations with our tools (${link}). Interested?`,
            `Hello! ${sender} here. I have a proposal for a smart system for ${businessName} that scales your business with zero infrastructure. Quick call?`,
        ];
        return this.getRandomItem(greetings);
    }
}

export const messageGenerator = new MessageGenerator();
