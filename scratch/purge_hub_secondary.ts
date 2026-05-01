import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const id = 'cmomgx15l00phvld8o27byzuw'; // Targeted Secondary ID
    console.log(`🛑 AUTHORITATIVE PURGE START (SECONDARY): ${id}`);
    
    try {
        await prisma.$executeRawUnsafe(`DELETE FROM "Lead" WHERE "campaignId" = '${id}'`);
        await prisma.$executeRawUnsafe(`DELETE FROM "QueryHistory" WHERE "campaignId" = '${id}'`);
        await prisma.$executeRawUnsafe(`DELETE FROM "Campaign" WHERE "id" = '${id}'`);
        
        console.log(`✅ PURGE COMPLETE: Hub ${id} has been erased.`);
    } catch (err) {
        console.error(`❌ PURGE FAILED:`, err.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
