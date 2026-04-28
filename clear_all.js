import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('🧹 Starting total database wipe...');
    try {
        await prisma.$executeRawUnsafe('TRUNCATE TABLE "Lead", "Business", "QueryHistory", "Campaign", "Profile", "User", "Transaction" CASCADE;');
        console.log('✅ Database is now 100% EMPTY.');
    } catch (error) {
        console.error('❌ Wipe failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
