import { logger } from '../lib/logger';

export class MessageGenerator {
    generate(businessName: string, industry: string, painPoint: string): string {
        const templates = [
            `Hi ${businessName}, we noticed that many businesses in ${industry} struggle with ${painPoint.toLowerCase()}. We specialize in solving this. Would you be open to a quick chat?`,
            `Hello! I saw ${businessName} online and realized that ${painPoint} might be holding you back. Our team helps ${industry} firms overcome exactly this.`,
        ];

        const message = templates[Math.floor(Math.random() * templates.length)];
        logger.debug(`Generated message for ${businessName}`);
        return message;
    }
}

export const messageGenerator = new MessageGenerator();
