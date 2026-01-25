import { logger } from '../lib/logger.js';

export class MessageGenerator {
    generate(businessName: string, industry: string, painPoint: string): string {
        // Greeting
        const greeting = `Hello ${businessName} team,`;

        // Expert Introduction
        const intro = `I'm a Digital Growth Expert from LogicHQ in Belvedere, Harare (www.logichq.tech), specializing in helping ${industry} businesses scale their operations and increase revenue.`;

        // Interest
        const interest = `I've been following the ${industry} space in your area and noticed your business standing out, but I also see an opportunity for growth that isn't being fully tapped.`;

        // Pain Point & Consequence
        const pain = `Specifically, many businesses in your sector struggle with ${painPoint.toLowerCase()}. If not addressed, this often leads to missed customer opportunities and stagnating growth while competitors get ahead.`;

        // Solution
        const solution = `I help businesses solve exactly this by implementing targeted strategies that turn this weakness into a competitive advantage.`;

        // Call to Action
        const cta = `I'd love to share a few ideas on how we can fix this for you. Are you open to a brief 10-minute chat this week?`;

        const message = `${greeting}\n\n${intro}\n\n${interest}\n\n${pain}\n\n${solution}\n\n${cta}`;

        logger.debug(`Generated message for ${businessName}`);
        return message;
    }
}

export const messageGenerator = new MessageGenerator();
