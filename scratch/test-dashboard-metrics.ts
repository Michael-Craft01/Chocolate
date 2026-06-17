import prisma from '../src/lib/prisma.js';

async function testDashboardMetrics() {
    console.log('🏁 [TEST START] Verifying dashboard database metrics and 7-day trend...');

    // 1. Get an existing user
    const user = await prisma.user.findFirst();
    if (!user) {
        console.error('❌ Test prerequisite failed: No user found in database.');
        return;
    }
    console.log(`Using User: ${user.email} (ID: ${user.id})`);

    // 2. Ensure user has a campaign
    let campaign = await prisma.campaign.findFirst({ where: { userId: user.id } });
    let createdCampaign = false;
    if (!campaign) {
        campaign = await prisma.campaign.create({
            data: {
                userId: user.id,
                name: 'Test Stats Campaign',
                status: 'ACTIVE',
                senderName: 'Test Sender',
                senderRole: 'CEO',
                companyName: 'Test Company',
                targetCountry: 'US',
                locations: ['New York'],
                industries: ['SaaS'],
                productName: 'LeadGen',
                productDescription: 'Testing dashboard stats endpoint.',
                targetPainPoints: 'Finding customers and growing sales leads.',
                outreachTone: 'PROFESSIONAL'
            }
        });
        createdCampaign = true;
        console.log(`Created temporary campaign: ${campaign.id}`);
    } else {
        console.log(`Using existing Campaign: ${campaign.name} (ID: ${campaign.id})`);
    }

    const seededLeads: string[] = [];
    const seededBusinesses: string[] = [];

    try {
        // 3. Create three distinct temporary businesses to satisfy (campaignId, businessId) unique constraint
        const bizToday = await prisma.business.create({
            data: { name: 'Biz Today', category: 'SaaS', website: 'https://biztoday.com', phone: '111111', email: 'today@test.com', contactStatus: 'contactable' }
        });
        seededBusinesses.push(bizToday.id);

        const bizYesterday = await prisma.business.create({
            data: { name: 'Biz Yesterday', category: 'SaaS', website: 'https://bizyesterday.com', phone: '222222', email: 'yesterday@test.com', contactStatus: 'contactable' }
        });
        seededBusinesses.push(bizYesterday.id);

        const biz3DaysAgo = await prisma.business.create({
            data: { name: 'Biz 3 Days Ago', category: 'SaaS', website: 'https://biz3days.com', phone: '333333', email: 'three@test.com', contactStatus: 'contactable' }
        });
        seededBusinesses.push(biz3DaysAgo.id);

        console.log(`Created 3 distinct temporary businesses.`);

        // 4. Seed leads spread over the last 3 days
        const now = new Date();
        
        // Lead 1: Today
        const leadToday = await prisma.lead.create({
            data: {
                campaignId: campaign.id,
                businessId: bizToday.id,
                industry: 'SaaS',
                painPoint: 'Leads',
                suggestedMessage: 'Hey let\'s chat.',
                createdAt: now
            }
        });
        seededLeads.push(leadToday.id);

        // Lead 2: Yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const leadYesterday = await prisma.lead.create({
            data: {
                campaignId: campaign.id,
                businessId: bizYesterday.id,
                industry: 'SaaS',
                painPoint: 'Leads',
                suggestedMessage: 'Hey let\'s chat.',
                createdAt: yesterday
            }
        });
        seededLeads.push(leadYesterday.id);

        // Lead 3: 3 days ago
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        const lead3DaysAgo = await prisma.lead.create({
            data: {
                campaignId: campaign.id,
                businessId: biz3DaysAgo.id,
                industry: 'SaaS',
                painPoint: 'Leads',
                suggestedMessage: 'Hey let\'s chat.',
                createdAt: threeDaysAgo
            }
        });
        seededLeads.push(lead3DaysAgo.id);

        console.log(`Successfully seeded ${seededLeads.length} test leads.`);

        // ==========================================
        // 5. Query /api/stats Logic
        // ==========================================
        const totalBusinesses = await prisma.business.count();
        const totalLeads = await prisma.lead.count({ where: { campaign: { userId: user.id } } });

        const startOfToday = new Date();
        startOfToday.setHours(0,0,0,0);
        const leadsToday = await prisma.lead.count({
            where: { createdAt: { gte: startOfToday }, campaign: { userId: user.id } }
        });

        // Calculate the last 7 days daily trend of leads
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const leadsList = await prisma.lead.findMany({
            where: {
                campaign: { userId: user.id },
                createdAt: { gte: sevenDaysAgo }
            },
            select: { createdAt: true }
        });

        // Initialize counts map for the last 7 days
        const dailyCounts: Record<string, number> = {};
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            dailyCounts[key] = 0;
        }

        // Aggregate leads count by day
        leadsList.forEach(l => {
            const key = l.createdAt.toISOString().split('T')[0];
            if (dailyCounts[key] !== undefined) {
                dailyCounts[key]++;
            }
        });

        // Map counts to chronological order (oldest to newest)
        const dailyTrend = Object.keys(dailyCounts)
            .sort()
            .map(key => dailyCounts[key]);

        console.log('\n📊 OUTPUT METRICS:');
        console.log('----------------------------------------');
        console.log(`Total Businesses in System: ${totalBusinesses}`);
        console.log(`User Total Leads: ${totalLeads}`);
        console.log(`User Leads Today: ${leadsToday}`);
        console.log(`7-Day Trend Keys:`, Object.keys(dailyCounts).sort());
        console.log(`7-Day Daily Trend Array (oldest to newest):`, dailyTrend);

        // Verification checks
        if (totalLeads >= 3) {
            console.log('✅ Success: totalLeads counts are correct.');
        } else {
            console.error(`❌ Failure: expected totalLeads >= 3, got ${totalLeads}`);
        }

        if (leadsToday >= 1) {
            console.log('✅ Success: leadsToday count is correct.');
        } else {
            console.error(`❌ Failure: expected leadsToday >= 1, got ${leadsToday}`);
        }

        if (dailyTrend.length === 7) {
            console.log('✅ Success: dailyTrend contains exactly 7 chronological buckets.');
        } else {
            console.error(`❌ Failure: expected dailyTrend length 7, got ${dailyTrend.length}`);
        }

        // Verify values inside trend
        const todayKey = now.toISOString().split('T')[0];
        const yesterdayKey = yesterday.toISOString().split('T')[0];
        const threeDaysAgoKey = threeDaysAgo.toISOString().split('T')[0];
        
        const sortedKeys = Object.keys(dailyCounts).sort();
        const idxToday = sortedKeys.indexOf(todayKey);
        const idxYesterday = sortedKeys.indexOf(yesterdayKey);
        const idx3DaysAgo = sortedKeys.indexOf(threeDaysAgoKey);

        if (idxToday !== -1 && dailyTrend[idxToday] >= 1) {
            console.log(`✅ Success: Today's trend bucket correctly holds >= 1 leads.`);
        } else {
            console.error(`❌ Failure: Today's trend bucket should be >= 1.`);
        }

        if (idxYesterday !== -1 && dailyTrend[idxYesterday] >= 1) {
            console.log(`✅ Success: Yesterday's trend bucket correctly holds >= 1 leads.`);
        } else {
            console.error(`❌ Failure: Yesterday's trend bucket should be >= 1.`);
        }

        if (idx3DaysAgo !== -1 && dailyTrend[idx3DaysAgo] >= 1) {
            console.log(`✅ Success: 3 days ago trend bucket correctly holds >= 1 leads.`);
        } else {
            console.error(`❌ Failure: 3 days ago trend bucket should be >= 1.`);
        }

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        // Cleanup seeded leads
        for (const id of seededLeads) {
            await prisma.lead.delete({ where: { id } }).catch(() => {});
        }
        console.log('\n🧹 Cleaned up temporary test leads.');

        // Cleanup temporary businesses
        for (const id of seededBusinesses) {
            await prisma.business.delete({ where: { id } }).catch(() => {});
        }
        console.log('🧹 Cleaned up temporary test businesses.');

        if (createdCampaign && campaign) {
            await prisma.campaign.delete({ where: { id: campaign.id } }).catch(() => {});
            console.log('🧹 Cleaned up temporary campaign.');
        }

        console.log('🏁 [TEST END] Dashboard metrics verification complete.');
    }
}

testDashboardMetrics().catch(console.error).finally(() => prisma.$disconnect());
