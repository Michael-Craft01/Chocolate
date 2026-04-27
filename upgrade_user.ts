import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// The user ID from the backend logs
const USER_ID = 'b1bbc92a-33c9-4543-ba2b-1c048f90b33d';

try {
    // First check current state
    const user = await prisma.user.findUnique({
        where: { id: USER_ID },
        select: { id: true, email: true, tier: true, dailyLimit: true, leadsFoundToday: true, paymentStatus: true, creditBalance: true }
    });
    
    console.log('--- CURRENT USER STATE ---');
    console.log(JSON.stringify(user, null, 2));

    // Upgrade to PROFESSIONAL tier
    const updated = await prisma.user.update({
        where: { id: USER_ID },
        data: {
            tier: 'PROFESSIONAL',
            dailyLimit: 500,
            paymentStatus: 'active',
            leadsFoundToday: 0,  // Reset counter
        },
        select: { id: true, email: true, tier: true, dailyLimit: true, leadsFoundToday: true, paymentStatus: true }
    });

    console.log('\n--- UPDATED USER STATE ---');
    console.log(JSON.stringify(updated, null, 2));
    console.log('\n✅ User upgraded to PROFESSIONAL. Daily limit: 500 leads.');
} catch (e: any) {
    console.error('Error:', e.message);
} finally {
    await prisma.$disconnect();
}
