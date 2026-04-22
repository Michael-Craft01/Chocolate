import prisma from '../src/lib/prisma.js';

async function releaseHandbrake() {
    console.log('🔓 Releasing quota handbrake...');
    try {
        const users = await prisma.user.findMany();
        for (const user of users) {
            await prisma.user.update({
                where: { id: user.id },
                data: { 
                    dailyLimit: 1000,
                    leadsFoundToday: 0 // Reset for the fresh hunt
                }
            });
            console.log(`✅ User ${user.email} quota boosted to 1000!`);
        }
    } catch (e) {
        console.error('❌ Error releasing handbrake:', e);
    } finally {
        await prisma.$disconnect();
    }
}

releaseHandbrake();
