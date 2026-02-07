import { logger } from '../lib/logger.js';

export class MessageGenerator {
    generate(businessName: string, industry: string, painPoint: string, recommendedSolution?: string): string {
        const suggestedSolution = recommendedSolution || 'custom PropTech solutions';

        // Greeting
        const greeting = `Hello ${businessName} team,`;

        // Expert Introduction - PropTech positioning
        const intro = `I'm Michael from LogicHQ, a PropTech company that builds high-value technology for real estate leaders. We turn manual operations into automated growth machines.`;

        // Interest - Real estate focused
        const interest = `I've been researching the ${industry} market in your area. You have a solid foundation, but I noticed an opportunity to automate a key part of your operations that's likely costing you deals.`;

        // Pain Point & Consequence
        const pain = `Specifically, many agencies in your sector struggle with ${painPoint.toLowerCase()}. This operational friction often results in lost deals, wasted man-hours, and missed opportunities while competitors move faster.`;

        // Solution - Tech superpowers
        const solution = `I specialize in building ${suggestedSolution} for real estate businesses. This isn't basic software — it's infrastructure that scales with your business and gives you a major competitive edge.`;

        // Call to Action
        const cta = `I'd love to show you what we've built for other agencies. Are you open to a quick 10-minute demo this week?
        
— Michael
LogicHQ | PropTech Solutions | www.logichq.tech`;

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
