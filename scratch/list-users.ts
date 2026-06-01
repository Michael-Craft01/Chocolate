import prisma from '../src/lib/prisma.js';

async function run() {
    console.log('Fetching users from DB...');
    try {
        const users = await prisma.user.findMany({
            include: { profile: true }
        });
        
        console.log('Total Users:', users.length);
        users.forEach((u, i) => {
            console.log(`\nUser #${i + 1}:`);
            console.log(`ID: ${u.id}`);
            console.log(`Email: ${u.email}`);
            console.log(`Tier: ${u.tier}`);
            console.log(`Profile Onboarding Complete: ${u.profile?.onboardingComplete}`);
            console.log(`Profile Company Name: ${u.profile?.companyName}`);
        });
    } catch (e: any) {
        console.error('Error fetching users:', e.message);
    }
}

run();
