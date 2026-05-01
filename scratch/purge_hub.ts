import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const id = 'cmoj450in0001vlk034o6z659'; // Targeted ID
    console.log(`🛑 AUTHORITATIVE PURGE START: ${id}`);
    
    try {
        // Break all links
        await prisma.$executeRawUnsafe(`DELETE FROM "Lead" WHERE "campaignId" = '${id}'`);
        await prisma.$executeRawUnsafe(`DELETE FROM "QueryHistory" WHERE "campaignId" = '${id}'`);
        await prisma.$executeRawUnsafe(`DELETE FROM "Campaign" WHERE "id" = '${id}'`);
        
        console.log(`✅ PURGE COMPLETE: Hub ${id} has been erased from existence.`);
    } catch (err) {
        console.error(`❌ PURGE FAILED:`, err.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
