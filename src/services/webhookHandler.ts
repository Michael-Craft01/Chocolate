import prisma from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

export class WebhookHandler {
    static async handleSubscriptionSuccess(userId: string, tier: string, gatewayRef: string, gateway: 'STRIPE' | 'PAYNOW') {
        logger.info({ userId, tier, gateway, gatewayRef }, 'Processing subscription success');

        // Idempotency check: Don't process the same transaction twice
        const existing = await prisma.transaction.findUnique({
            where: { gatewayRef }
        });

        if (existing && existing.status === 'SUCCESS') {
            logger.warn({ gatewayRef }, 'Transaction already processed successfully. Skipping.');
            return;
        }

        // --- IDENTITY RESILIENCE ---
        let targetUserId = userId;
        const userExists = await prisma.user.findUnique({ where: { id: userId } });
        
        if (!userExists) {
            logger.warn({ userId }, '⚠️ Webhook received for non-existent ID. Attempting recovery.');
            
            // 1. Try to find user by email (most robust)
            const emailFromMetadata = (event.data.object as any).metadata?.email;
            if (emailFromMetadata) {
                const userByEmail = await prisma.user.findUnique({ where: { email: emailFromMetadata } });
                if (userByEmail) {
                    logger.info({ oldId: userId, newId: userByEmail.id, email: emailFromMetadata }, '🛡️ Identity recovery successful via email.');
                    targetUserId = userByEmail.id;
                }
            }
        }

        const dailyLimit = tier === 'STARTER' ? 100 : tier === 'PROFESSIONAL' ? 500 : 2500;
        const maxCampaigns = tier === 'ELITE' ? 10 : tier === 'PROFESSIONAL' ? 5 : 1;
        const price = tier === 'STARTER' ? 20 : tier === 'PROFESSIONAL' ? 49 : 300;

        await prisma.$transaction([
            // Update User
            prisma.user.update({
                where: { id: targetUserId },
                data: {
                    tier: tier as any,
                    dailyLimit,
                    maxCampaigns,
                    paymentStatus: 'active',
                }
            }),
            // Upsert Transaction
            prisma.transaction.upsert({
                where: { gatewayRef },
                update: { status: 'SUCCESS', userId: targetUserId },
                create: {
                    userId: targetUserId,
                    amount: price,
                    gateway,
                    type: 'SUBSCRIPTION',
                    status: 'SUCCESS',
                    gatewayRef,
                }
            })
        ]);

        logger.info({ userId: targetUserId, tier }, 'Subscription provisioned successfully');
    }

    static async handleCreditTopup(userId: string, amount: number, gatewayRef: string, gateway: 'STRIPE' | 'PAYNOW') {
        logger.info({ userId, amount, gateway, gatewayRef }, 'Processing credit topup');

        const existing = await prisma.transaction.findUnique({
            where: { gatewayRef }
        });

        if (existing && existing.status === 'SUCCESS') {
            logger.warn({ gatewayRef }, 'Credit topup already processed. Skipping.');
            return;
        }

        // 1 USD = 10 Credits
        const credits = amount * 10;

        await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: {
                    creditBalance: { increment: credits }
                }
            }),
            prisma.transaction.upsert({
                where: { gatewayRef },
                update: { status: 'SUCCESS' },
                create: {
                    userId,
                    amount,
                    gateway,
                    type: 'CREDIT_TOPUP',
                    status: 'SUCCESS',
                    gatewayRef,
                }
            })
        ]);

        logger.info({ userId, credits }, 'Credits provisioned successfully');
    }
}
