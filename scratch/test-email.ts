import prisma from '../src/lib/prisma.js';
import { dispatchService } from '../src/services/dispatchService.js';

async function test() {
    console.log('Resolving active test user from database...');
    const user = await prisma.user.findFirst({
        where: { email: 'ragumichael88@gmail.com' }
    });

    if (!user) {
        console.error('❌ Active test user "ragumichael88@gmail.com" not found in the database. Please sign up first.');
        return;
    }

    console.log(`✅ User resolved: ${user.email} (ID: ${user.id})`);

    console.log('\n--- 1. Testing Resend Cycle Summary Email ---');
    await dispatchService.sendUserCycleSummary(
        user.id, 
        [
            { campaignName: 'Autonomous Sweep Alpha', count: 18 },
            { campaignName: 'Targeting Matrix Beta', count: 7 }
        ]
    );

    console.log('\n--- 2. Testing Resend Onboarding Welcome Email ---');
    await dispatchService.sendUserWelcomeEmail(user.id);

    console.log('\n🎉 Active tests complete! Check your inbox (ragumichael88@gmail.com) for both emails!');
}

test().catch(console.error);
