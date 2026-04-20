import { PrismaClient } from '@prisma/client';
import { logger } from '../src/lib/logger.js';

const prisma = new PrismaClient();

async function testConnection() {
    logger.info("🚀 Testing Supabase Connection...");
    
    try {
        // 1. Test Read
        const userCount = await prisma.user.count();
        logger.info(`✅ Read success: Found ${userCount} users in database.`);

        // 2. Test Write (Dynamic temporary user)
        const testId = `test_${Date.now()}`;
        const testUser = await prisma.user.create({
            data: {
                id: testId,
                email: `test_${testId}@chocolate.app`,
                dailyLimit: 100,
                tier: 'ELITE'
            }
        });
        logger.info(`✅ Write success: Created test user ${testUser.email}`);

        // 3. Test Delete
        await prisma.user.delete({ where: { id: testId } });
        logger.info(`✅ Cleanup success: Removed test user.`);

        logger.info('🎉 DATABASE CONNECTION IS FULLY OPERATIONAL!');
    } catch (error) {
        logger.error({ err: error }, '❌ Database connection test failed!');
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();
