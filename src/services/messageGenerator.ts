import { logger } from '../lib/logger.js';

export class MessageGenerator {
    generate(businessName: string, industry: string, painPoint: string): string {
        const message = `Hey there! 👋

I'm Michael from LogicHQ — we help ${industry} businesses like yours get more customers through smart digital marketing.

I came across ${businessName} and honestly, you've got something great going. But here's the thing — I noticed a gap that's costing you leads right now: ${painPoint.toLowerCase()}.

Most businesses in your space are leaving money on the table because of this. We've helped dozens of companies fix exactly that — and the results speak for themselves.

I'm not here to sell you a dream. I'm here because I genuinely think we can make a difference for your business.

Got 10 minutes this week? I'll show you exactly what's holding you back and how we can turn it around.

Let's chat! 🚀

— Michael
LogicHQ | www.logichq.tech`;

        logger.debug(`Generated message for ${businessName}`);
        return message;
    }
}

export const messageGenerator = new MessageGenerator();
