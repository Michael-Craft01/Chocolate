import prisma from '../src/lib/prisma.js';
import { cleanupStaleCycles } from '../src/services/databaseCleanup.js';

async function runTest() {
    console.log('🏁 [TEST START] Verifying resilient queue worker and heartbeat logic...');

    // 1. Get an existing user
    const user = await prisma.user.findFirst();

    if (!user) {
        console.error('❌ Test prerequisite failed: No user found in database.');
        return;
    }

    console.log(`Using User: ${user.email} (ID: ${user.id})`);

    let campaign = await prisma.campaign.findFirst({ where: { userId: user.id } });
    let createdCampaign = false;

    if (!campaign) {
        campaign = await prisma.campaign.create({
            data: {
                userId: user.id,
                name: 'Test Temp Campaign',
                status: 'ACTIVE',
                senderName: 'Test Sender',
                senderRole: 'CEO',
                companyName: 'Test Company',
                targetCountry: 'US',
                locations: ['New York'],
                industries: ['SaaS'],
                productName: 'LeadGen',
                productDescription: 'We help you find high-quality business leads dynamically and fast.',
                targetPainPoints: 'Finding customers and growing sales leads.',
                outreachTone: 'PROFESSIONAL'
            }
        });
        createdCampaign = true;
        console.log(`Created temporary campaign: ${campaign.id}`);
    } else {
        console.log(`Using existing Campaign: ${campaign.name} (ID: ${campaign.id})`);
    }

    // Store original env and user credits
    const originalNodeEnv = process.env.NODE_ENV;
    const originalCredits = user.cyclesRemaining;

    try {
        // ==========================================
        // TEST 1: Development Startup Auto-Resume
        // ==========================================
        console.log('\n--- TEST 1: Development Startup Auto-Resume ---');
        process.env.NODE_ENV = 'development';

        // Create a running cycle
        const devCycle = await prisma.cycleRun.create({
            data: {
                userId: user.id,
                campaignId: campaign.id,
                status: 'RUNNING',
                maxLeads: 15,
                leadsFound: 5,
                maxRuntimeMs: 900000
            }
        });

        console.log(`Created running dev cycle: ${devCycle.id}`);

        // Run startup cleanup
        await cleanupStaleCycles(true);

        // Verify status changed to QUEUED (indicating it was re-queued for resume)
        const updatedDevCycle = await prisma.cycleRun.findUnique({ where: { id: devCycle.id } });
        if (updatedDevCycle?.status === 'QUEUED') {
            console.log('✅ Success: Running dev cycle was correctly reset to QUEUED for auto-resume.');
        } else {
            console.error(`❌ Failure: Dev cycle status is ${updatedDevCycle?.status} (expected QUEUED).`);
        }

        // Cleanup dev cycle
        await prisma.cycleRun.delete({ where: { id: devCycle.id } });

        // ==========================================
        // TEST 2: Production Startup (Recent Heartbeat - Ignored)
        // ==========================================
        console.log('\n--- TEST 2: Production Startup (Recent Heartbeat) ---');
        process.env.NODE_ENV = 'production';

        const prodRecentCycle = await prisma.cycleRun.create({
            data: {
                userId: user.id,
                campaignId: campaign.id,
                status: 'RUNNING',
                maxLeads: 15,
                leadsFound: 2,
                maxRuntimeMs: 900000,
                updatedAt: new Date() // recent heartbeat
            }
        });

        console.log(`Created recent running prod cycle: ${prodRecentCycle.id}`);

        // Run startup cleanup
        await cleanupStaleCycles(true);

        // Verify it remains RUNNING (ignored, active on other instance)
        const updatedRecentCycle = await prisma.cycleRun.findUnique({ where: { id: prodRecentCycle.id } });
        if (updatedRecentCycle?.status === 'RUNNING') {
            console.log('✅ Success: Active prod cycle with recent heartbeat was NOT killed on startup.');
        } else {
            console.error(`❌ Failure: Active prod cycle was incorrectly modified to ${updatedRecentCycle?.status}.`);
        }

        // Cleanup
        await prisma.cycleRun.delete({ where: { id: prodRecentCycle.id } });

        // ==========================================
        // TEST 3: Production Startup (Stale Heartbeat - Terminated & Refunded)
        // ==========================================
        console.log('\n--- TEST 3: Production Startup (Stale Heartbeat) ---');
        
        // Reset user credits for test
        await prisma.user.update({
            where: { id: user.id },
            data: { cyclesRemaining: 10 }
        });

        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        
        const prodStaleCycle = await prisma.cycleRun.create({
            data: {
                userId: user.id,
                campaignId: campaign.id,
                status: 'RUNNING',
                maxLeads: 15,
                leadsFound: 3,
                maxRuntimeMs: 900000
            }
        });

        await prisma.$executeRaw`UPDATE "CycleRun" SET "updatedAt" = ${tenMinutesAgo} WHERE id = ${prodStaleCycle.id}`;
        console.log(`Created stale running prod cycle: ${prodStaleCycle.id} (updatedAt forced to 10 mins ago)`);

        // Run startup cleanup
        await cleanupStaleCycles(true);

        // Verify it was marked as FAILED and user was refunded
        const updatedStaleCycle = await prisma.cycleRun.findUnique({ where: { id: prodStaleCycle.id } });
        const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });

        if (updatedStaleCycle?.status === 'FAILED' && updatedStaleCycle.failureReason === 'Server restarted / crashed') {
            console.log('✅ Success: Stale prod cycle was correctly marked as FAILED.');
        } else {
            console.error(`❌ Failure: Stale prod cycle status is ${updatedStaleCycle?.status} (expected FAILED).`);
        }

        if (updatedUser && updatedUser.cyclesRemaining === 11) {
            console.log('✅ Success: User cycle credit was correctly refunded (10 -> 11).');
        } else {
            console.error(`❌ Failure: User credits is ${updatedUser?.cyclesRemaining} (expected 11).`);
        }

        // Cleanup
        await prisma.cycleRun.delete({ where: { id: prodStaleCycle.id } });

    } catch (error: any) {
        console.error('❌ Test execution encountered an error:', error);
    } finally {
        // Restore environment variables and user credits
        process.env.NODE_ENV = originalNodeEnv;
        await prisma.user.update({
            where: { id: user.id },
            data: { cyclesRemaining: originalCredits }
        });

        if (createdCampaign && campaign) {
            await prisma.campaign.delete({ where: { id: campaign.id } });
            console.log('🧹 Cleaned up temporary campaign.');
        }

        console.log('\n🧹 Restored original environment and user credits.');
        console.log('🏁 [TEST END] Resilient queue verification complete.');
    }
}

runTest().catch(console.error).finally(() => prisma.$disconnect());
