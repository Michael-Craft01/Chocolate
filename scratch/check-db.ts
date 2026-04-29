import prisma from '../src/lib/prisma.js';

async function check() {
    const leadCount = await prisma.lead.count();
    const businessCount = await prisma.business.count();
    const user = await prisma.user.findFirst();
    const campaigns = await prisma.campaign.findMany({
        include: {
            _count: {
                select: { leads: true }
            }
        }
    });

    console.log(`Leads in DB: ${leadCount}`);
    console.log(`Businesses in DB: ${businessCount}`);
    if (user) {
        console.log(`User leadsFoundToday: ${user.leadsFoundToday}`);
    }
    console.log('Campaigns:');
    campaigns.forEach(c => {
        console.log(`- ${c.name}: ${c._count.leads} leads (Status: ${c.status})`);
    });
}

check();
