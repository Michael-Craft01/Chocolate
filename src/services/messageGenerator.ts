import { logger } from '../lib/logger.js';

export class MessageGenerator {
    generate(businessName: string, industry: string, painPoint: string, recommendedSolution?: string): string {
        const suggestedSolution = recommendedSolution || 'custom digital infrastructure';

        // Greeting
        const greeting = `Hello ${businessName} team,`;

        // Expert Introduction
        const intro = `I'm a Software Engineer & Market Strategist from LogicHQ in Belvedere, Harare (www.logichq.tech). We specialize in building advanced digital infrastructure for ${industry} businesses.`;

        // Interest
        const interest = `I've been analyzing the ${industry} market in your area. You have a solid foundation, but I identified a key operational bottleneck that might be slowing down your scaling.`;

        // Pain Point & Consequence
        const pain = `Specifically, many businesses in your sector struggle with ${painPoint.toLowerCase()}. This operational friction often results in lost revenue, wasted man-hours, and a capped ability to serve more clients efficiently.`;

        // Solution
        const solution = `I build custom solutions to solve exactly this. For your specific case, implementing ${suggestedSolution} would turn this weakness into a major competitive advantage, automating growth and operations.`;

        // Call to Action
        const cta = `I'd love to share a quick demo of how this tech works. Are you open to a brief 10-minute chat this week?
        
— Michael
LogicHQ | www.logichq.tech`;

        const message = `${greeting}\n\n${intro}\n\n${interest}\n\n${pain}\n\n${solution}\n\n${cta}`;

        logger.debug(`Generated message for ${businessName}`);
        return message;
    }

    // Short greeting for WhatsApp pre-fill (under 200 chars)
    generateWhatsAppGreeting(businessName: string): string {
        return `Hi! I'm Michael from LogicHQ. I came across ${businessName} and would love to chat about helping you grow your business. Do you have a few minutes?`;
    }
}

export const messageGenerator = new MessageGenerator();
