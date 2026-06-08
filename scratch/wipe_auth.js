import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('🧹 Wiping auth.users schema...');
    try {
        await prisma.$executeRawUnsafe('TRUNCATE TABLE auth.users CASCADE;');
        console.log('✅ auth.users wiped successfully.');
    } catch (error) {
        console.error('❌ Failed to wipe auth.users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
