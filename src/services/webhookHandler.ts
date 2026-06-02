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
            logger.warn({ userId }, '⚠️ Webhook received for non-existent ID. No recovery path available without event context.');
        }

        const dailyLimit = tier === 'STARTER' ? 100 : tier === 'PROFESSIONAL' ? 500 : 2500;
        const monthlyCycleLimit = tier === 'STARTER' ? 4 : tier === 'PROFESSIONAL' ? 15 : 40;
        const leadsPerCycle = tier === 'STARTER' ? 25 : tier === 'PROFESSIONAL' ? 40 : 75;
        const autoRunFrequency = tier === 'STARTER' ? 'WEEKLY' : tier === 'PROFESSIONAL' ? 'EVERY_2_DAYS' : 'DAILY';
        const maxCampaigns = tier === 'ELITE' ? 10 : tier === 'PROFESSIONAL' ? 5 : 1;
        const price = tier === 'STARTER' ? 20 : tier === 'PROFESSIONAL' ? 49 : 300;
        const now = new Date();
        const periodEnd = new Date(now);
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        await prisma.$transaction([
            // Update User
            prisma.user.update({
                where: { id: targetUserId },
                data: {
                    tier: tier as any,
                    dailyLimit,
                    monthlyCycleLimit,
                    cyclesRemaining: monthlyCycleLimit,
                    leadsPerCycle,
                    automationMode: 'AUTOMATIC',
                    autoRunFrequency: autoRunFrequency as any,
                    currentPeriodStart: now,
                    currentPeriodEnd: periodEnd,
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
        logger.info({ userId, amount, gateway, gatewayRef }, 'Processing cycle pack topup');

        const existing = await prisma.transaction.findUnique({
            where: { gatewayRef }
        });

        if (existing && existing.status === 'SUCCESS') {
            logger.warn({ gatewayRef }, 'Credit topup already processed. Skipping.');
            return;
        }

        const cycles = Math.max(1, Math.floor(amount / 2));

        await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: {
                    cyclesRemaining: { increment: cycles }
                }
            }),
            prisma.transaction.upsert({
                where: { gatewayRef },
                update: { status: 'SUCCESS' },
                create: {
                    userId,
                    amount,
                    gateway,
                    type: 'CYCLE_PACK',
                    status: 'SUCCESS',
                    gatewayRef,
                }
            })
        ]);

        logger.info({ userId, cycles }, 'Cycle pack provisioned successfully');
    }
}
