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
        `I've noticed that while many {{industry}} firms are held back by expensive desktop-only POS systems, {{name}} is perfectly positioned to lead with a more agile, mobile-first approach.`,
        `While auditing the current tech landscape, I saw how {{name}} could significantly advance by moving beyond bulky traditional infrastructure to a sleek, mobile-app based operation.`,
        `My research into the local {{industry}} market suggests that {{name}} would benefit immensely from a POS that requires zero setup or server costs, running entirely from your team's phones.`,
        `I've been deep-diving into how top-tier {{industry}} players are scaling without heavy tech overhead, and {{name}} came up as a prime candidate for a zero-infrastructure POS solution.`,
    ];

    // CTA variations
    private ctas = [
        `Would you be open to a quick 10-minute demo of the Takada mobile POS this week?`,
        `Do you have 10 minutes for a brief walkthrough of how Takada's app can advance your business without needing any desktop or servers?`,
        `Are you available for a quick call to explore scaling {{name}} with a smart POS that runs entirely from your phone?`,
        `Can I show you a quick demo of how Takada eliminates infrastructure costs for {{industry}} businesses?`,
    ];

    private getRandomItem<T>(arr: T[]): T {
        return arr[Math.floor(Math.random() * arr.length)]!;
    }

    generate(businessName: string, industry: string, painPoint: string, recommendedSolution?: string): string {
        const suggestedSolution = recommendedSolution || 'Takada (Mobile-First POS & Inventory System)';

        // Dynamic opening
        const greeting = this.getRandomItem(this.openings).replace('{{name}}', businessName);

        // Dynamic intro
        const intro = this.getRandomItem(this.intros);

        // Dynamic hook
        const interest = this.getRandomItem(this.hooks)
            .replace('{{industry}}', industry)
            .replace('{{name}}', businessName);

        // Pain point (from AI - should already be varied)
        const pain = `Specifically, I've noticed many businesses in your space struggle with ${painPoint.toLowerCase()}. This often leads to stockouts and manual errors, especially when tied down to traditional desktop-only systems.`;

        // Solution
        const solution = `This is exactly why we built ${suggestedSolution} (https://takada.logichq.tech). It's a high-performance system that requires zero infrastructure and no desktop setup — you can run your entire business directly from a mobile app. It's designed to advance your operations instantly.`;

        // Dynamic CTA
        const cta = `${this.getRandomItem(this.ctas).replace('{{name}}', businessName).replace('{{industry}}', industry)}

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
            `Hi! I'm Michael from LogicHQ. I noticed ${businessName} and wanted to share how you can run your entire POS from your phone with Takada (https://takada.logichq.tech). No desktop needed. Interested?`,
            `Hello! Michael here. I have a proposal for a smart POS for ${businessName} that scales your business with zero infrastructure. Just an app on your phone. Quick call?`,
            `Hi there! I'm Michael. I researched your business and noticed you could advance operations significantly with a mobile-first POS (no servers/setup needed). Interested?`,
        ];
        return this.getRandomItem(greetings);
    }
}

export const messageGenerator = new MessageGenerator();
