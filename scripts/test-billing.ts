import prisma from '../src/lib/prisma.js';
import { WebhookHandler } from '../src/services/webhookHandler.js';
import { logger } from '../src/lib/logger.js';

async function testBillingLogic() {
    logger.info("🧪 Testing Billing & Provisioning Logic...");
    
    const testUserId = `billing_test_${Date.now()}`;
    const gatewayRef = `ref_${Date.now()}`;

    try {
        // 1. Setup Test User
        await prisma.user.create({
            data: {
                id: testUserId,
                email: "billing@test.com",
                dailyLimit: 0,
                tier: 'STARTER'
            }
        });

        // 2. Test Subscription Success (Upgrade to ELITE)
        logger.info("Testing Subscription Update...");
        await WebhookHandler.handleSubscriptionSuccess(testUserId, 'ELITE', gatewayRef, 'STRIPE');
        
        const user = await prisma.user.findUnique({ where: { id: testUserId } });
        if (user?.tier === 'ELITE' && user?.dailyLimit === 1000) {
            logger.info("✅ Subscription Upgrade Successful");
        } else {
            throw new Error("Subscription Upgrade Failed");
        }

        // 3. Test Idempotency (Repeat same ref)
        logger.info("Testing Idempotency (Prevention of double-processing)...");
        await WebhookHandler.handleCreditTopup(testUserId, 100, gatewayRef, 'STRIPE'); // Same ref as sub
        
        const userAfterRepeat = await prisma.user.findUnique({ where: { id: testUserId } });
        if (userAfterRepeat?.creditBalance === 0) {
            logger.info("✅ Idempotency Check Successful (Duplicate Ref Rejected)");
        } else {
            throw new Error("Idempotency Check Failed (Credits were added for duplicate ref)");
        }

        // 4. Test Credit Topup (New Ref)
        logger.info("Testing Credit Topup...");
        const newRef = `ref_new_${Date.now()}`;
        await WebhookHandler.handleCreditTopup(testUserId, 50, newRef, 'STRIPE');
        
        const finalUser = await prisma.user.findUnique({ where: { id: testUserId } });
        if (finalUser?.creditBalance === 500) { // 50 USD * 10
            logger.info("✅ Credit Topup Successful");
        } else {
            throw new Error(`Credit Topup Failed: Expected 500, got ${finalUser?.creditBalance}`);
        }

        logger.info("🎉 ALL BILLING LOGIC TESTS PASSED!");
    } catch (error) {
        logger.error({ err: error }, "❌ Billing Logic Test Failed");
        process.exit(1);
    } finally {
        await prisma.transaction.deleteMany({ where: { userId: testUserId } }).catch(() => {});
        await prisma.user.delete({ where: { id: testUserId } }).catch(() => {});
    }
}

testBillingLogic();
