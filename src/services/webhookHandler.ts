import prisma from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

export class WebhookHandler {
    static async handleSubscriptionSuccess(userId: string, tier: string, gatewayRef: string, gateway: 'STRIPE' | 'PAYNOW') {
        logger.info({ userId, tier, gateway }, 'Processing successful subscription');

        const dailyLimit = tier === 'STARTER' ? 50 : tier === 'PROFESSIONAL' ? 200 : 1000;
        const maxCampaigns = tier === 'ELITE' ? 999 : tier === 'PROFESSIONAL' ? 5 : 1;

        await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: {
                    tier: tier as any,
                    dailyLimit,
                    maxCampaigns,
                    paymentStatus: 'active',
                }
            }),
            prisma.transaction.create({
                data: {
                    userId,
                    amount: tier === 'STARTER' ? 20 : tier === 'PROFESSIONAL' ? 49 : 300,
                    gateway,
                    type: 'SUBSCRIPTION',
                    status: 'SUCCESS',
                    gatewayRef,
                }
            })
        ]);
    }

    static async handleCreditTopup(userId: string, amount: number, gatewayRef: string, gateway: 'STRIPE' | 'PAYNOW') {
        logger.info({ userId, amount, gateway }, 'Processing credit topup');

        // Assuming 1 USD = 10 Credits for now
        const credits = amount * 10;

        await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: {
                    creditBalance: { increment: credits }
                }
            }),
            prisma.transaction.create({
                data: {
                    userId,
                    amount,
                    gateway,
                    type: 'CREDIT_TOPUP',
                    status: 'SUCCESS',
                    gatewayRef,
                }
            })
        ]);
    }
}
