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

        // ── Authoritative tier configuration table ──
        // leadsPerCycle: what the engine targets per cycle run
        // dailyLimit:    hard cap on total leads written per calendar day
        // Both derived from engine throughput analysis (scroll-based scraper, tiered runtimeMs)
        const dailyLimit         = tier === 'FREE' ? 25    : tier === 'STARTER' ? 200  : tier === 'PROFESSIONAL' ? 500  : 1000;
        const monthlyCycleLimit  = tier === 'FREE' ? 1     : tier === 'STARTER' ? 4    : tier === 'PROFESSIONAL' ? 15   : 40;
        const leadsPerCycle      = tier === 'FREE' ? 15    : tier === 'STARTER' ? 150  : tier === 'PROFESSIONAL' ? 400  : 800;
        const autoRunFrequency   = tier === 'FREE' ? 'MANUAL' : tier === 'STARTER' ? 'WEEKLY' : tier === 'PROFESSIONAL' ? 'EVERY_2_DAYS' : 'DAILY';
        const maxCampaigns       = tier === 'FREE' ? 1     : tier === 'STARTER' ? 1    : tier === 'PROFESSIONAL' ? 5    : 10;
        const price = tier === 'FREE' ? 0 : tier === 'STARTER' ? 20 : tier === 'PROFESSIONAL' ? 49 : 300;
        const paymentStatus = tier === 'FREE' ? 'free' : 'active';
        const automationMode = tier === 'FREE' ? 'MANUAL' : 'AUTOMATIC';
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
                    automationMode,
                    autoRunFrequency: autoRunFrequency as any,
                    currentPeriodStart: now,
                    currentPeriodEnd: periodEnd,
                    maxCampaigns,
                    paymentStatus,
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
