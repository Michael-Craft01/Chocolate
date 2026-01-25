import { logger } from '../lib/logger.js';

export class MessageGenerator {
    generate(businessName: string, industry: string, painPoint: string, recommendedSolution?: string): string {
        const solution = recommendedSolution || 'smart digital marketing';

        const message = `Hey there! 👋

I just came across ${businessName} and I have to say — I love what you're doing in the ${industry} space! Seriously impressive.

I'm Michael from LogicHQ, and I've been helping businesses just like yours grow for years. It's what I'm passionate about.

While checking out your business, I noticed something that might be holding you back: ${painPoint.toLowerCase()}.

The good news? This is exactly what we specialize in fixing. Here's what I'd recommend: **${solution}**

I'd genuinely love to chat and share some ideas — no pressure, just a friendly conversation about how we can help you grow.

Got a few minutes? I'm easy to reach!

— Michael
LogicHQ | www.logichq.tech`;

        logger.debug(`Generated message for ${businessName}`);
        return message;
    }

    // Short greeting for WhatsApp pre-fill (under 200 chars)
    generateWhatsAppGreeting(businessName: string): string {
        return `Hi! I'm Michael from LogicHQ. I came across ${businessName} and would love to chat about helping you grow your business. Do you have a few minutes?`;
    }
}

export const messageGenerator = new MessageGenerator();
