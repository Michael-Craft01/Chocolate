import { logger } from '../lib/logger.js';

export class MessageGenerator {
    // Opening variations
    private openings = [
        `Hello {{name}} team,`,
        `Hi {{name}},`,
        `Good day {{name}} team,`,
        `Greetings from LogicHQ,`,
    ];

    // Intro variations
    private intros = [
        `I'm Michael from LogicHQ — we build PropTech solutions that turn manual operations into automated growth systems.`,
        `Michael here from LogicHQ. We specialize in building high-value technology for real estate leaders.`,
        `I'm a PropTech engineer from LogicHQ. We help property businesses automate operations and close deals faster.`,
    ];

    // Interest hooks
    private hooks = [
        `I've been researching the {{industry}} space in your area and noticed something interesting.`,
        `While analyzing {{industry}} businesses in your market, your team caught my attention.`,
        `I came across {{name}} while studying successful {{industry}} operations in the region.`,
    ];

    // CTA variations
    private ctas = [
        `Would you be open to a quick 10-minute demo this week?`,
        `Do you have 10 minutes this week for a brief walkthrough?`,
        `Are you available for a quick call to explore this?`,
        `Can I show you a quick demo of what this looks like in action?`,
    ];

    private getRandomItem<T>(arr: T[]): T {
        return arr[Math.floor(Math.random() * arr.length)]!;
    }

    generate(businessName: string, industry: string, painPoint: string, recommendedSolution?: string): string {
        const suggestedSolution = recommendedSolution || 'custom PropTech solutions';

        // Dynamic opening
        const greeting = this.getRandomItem(this.openings).replace('{{name}}', businessName);

        // Dynamic intro
        const intro = this.getRandomItem(this.intros);

        // Dynamic hook
        const interest = this.getRandomItem(this.hooks)
            .replace('{{industry}}', industry)
            .replace('{{name}}', businessName);

        // Pain point (from AI - should already be varied)
        const pain = `Specifically, many agencies struggle with ${painPoint.toLowerCase()}. This often leads to lost deals, wasted time, and missed opportunities while competitors move faster.`;

        // Solution
        const solution = `I specialize in building ${suggestedSolution}. This isn't basic software — it's infrastructure that scales with your business and gives you a real edge.`;

        // Dynamic CTA
        const cta = `${this.getRandomItem(this.ctas)}

— Michael
LogicHQ | PropTech Solutions
www.logichq.tech`;

        const message = `${greeting}\n\n${intro}\n\n${interest}\n\n${pain}\n\n${solution}\n\n${cta}`;

        logger.debug(`Generated dynamic message for ${businessName}`);
        return message;
    }

    // Short greeting for WhatsApp (kept simple and universal)
    generateWhatsAppGreeting(businessName: string): string {
        const greetings = [
            `Hi! I'm Michael from LogicHQ. I came across ${businessName} and would love to chat about helping grow your business. Do you have a few minutes?`,
            `Hello! Michael here from LogicHQ. I noticed ${businessName} and had an idea I'd love to share. Quick call?`,
            `Hi there! I'm Michael, a PropTech engineer. I researched ${businessName} and have a proposal. Interested?`,
        ];
        return this.getRandomItem(greetings);
    }
}

export const messageGenerator = new MessageGenerator();
