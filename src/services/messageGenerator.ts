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
        `I'm Michael from LogicHQ — we build smart systems that turn manual operations into automated growth engines.`,
        `Michael here from LogicHQ. We specialize in building high-value software for growing local businesses.`,
        `I'm a software engineer from LogicHQ. We help businesses automate operations and scale faster.`,
        `I'm Michael, a software engineer who's passionate about helping local teams reclaim their time through smart automation.`,
        `Michael here from LogicHQ. I spend my days building tools that help business owners focus on growth, rather than paperwork.`,
        `I'm Michael, and I've dedicated my work at LogicHQ to solving the technical headaches that slow down ambitious firms.`,
        `I'm Michael from LogicHQ. I love seeing how the right technology can completely transform a local business's workflow.`,
        `Michael here. At LogicHQ, we're on a mission to give local leaders the high-end tech they need to outpace the market.`,
    ];

    // Interest hooks
    private hooks = [
        `I've been tracking the evolution of ${process.env.TARGET_INDUSTRY || 'SMEs'} in Harare, and {{name}}'s trajectory stands out as particularly impressive.`,
        `While auditing the current tech landscape for {{industry}} firms, I noticed {{name}} is positioned for significant scale, provided the right infrastructure is in place.`,
        `I've been analyzing how top-tier {{industry}} players are adapting to market shifts, and I'd like to share some specific insights I've gathered regarding {{name}}'s current positioning.`,
        `My research into the local {{industry}} market suggests that {{name}} is at a critical inflection point where legacy systems often become a bottleneck.`,
        `I've been deep-diving into the operational models of high-growth {{industry}} firms, and {{name}} consistently comes up as a leader in the space.`,
    ];

    // CTA variations
    private ctas = [
        `Would you be open to a quick 10-minute demo of Takada's POS system this week?`,
        `Do you have 10 minutes this week for a brief walkthrough of how Takada's POS can advance your operations?`,
        `Are you available for a quick call to explore how Takada can scale your business with smart POS & inventory?`,
        `Can I show you a quick demo of the Takada POS in action?`,
    ];

    private getRandomItem<T>(arr: T[]): T {
        return arr[Math.floor(Math.random() * arr.length)]!;
    }

    generate(businessName: string, industry: string, painPoint: string, recommendedSolution?: string): string {
        const suggestedSolution = recommendedSolution || 'Takada (POS & Inventory Management System)';

        // Dynamic opening
        const greeting = this.getRandomItem(this.openings).replace('{{name}}', businessName);

        // Dynamic intro
        const intro = this.getRandomItem(this.intros);

        // Dynamic hook
        const interest = this.getRandomItem(this.hooks)
            .replace('{{industry}}', industry)
            .replace('{{name}}', businessName);

        // Pain point (from AI - should already be varied)
        const pain = `Specifically, I've noticed many businesses in your space struggle with ${painPoint.toLowerCase()}. This often leads to stockouts, manual errors, and missed profit opportunities while operations become more complex.`;

        // Solution
        const solution = `This is exactly why we built ${suggestedSolution} (https://takada.logichq.tech). It's a high-performance system designed to advance your business by automating stock tracking and providing real-time POS analytics.`;

        // Dynamic CTA
        const cta = `${this.getRandomItem(this.ctas)}

— Michael
LogicHQ | Automation Solutions
https://takada.logichq.tech`;

        const message = `${greeting}\n\n${intro}\n\n${interest}\n\n${pain}\n\n${solution}\n\n${cta}`;

        logger.debug(`Generated dynamic message for ${businessName}`);
        return message;
    }

    // Short greeting for WhatsApp (kept simple and universal)
    generateWhatsAppGreeting(businessName: string): string {
        const greetings = [
            `Hi! I'm Michael from LogicHQ. I came across ${businessName} and would love to chat about Takada POS (https://takada.logichq.tech) for your business. Quick call?`,
            `Hello! Michael here from LogicHQ. I noticed ${businessName} and wanted to share how our Takada POS system can advance your stock management. Interested?`,
            `Hi there! I'm Michael, a software engineer. I researched ${businessName} and have a proposal for a smart POS that scales your inventory. Interested?`,
        ];
        return this.getRandomItem(greetings);
    }
}

export const messageGenerator = new MessageGenerator();
