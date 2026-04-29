import prisma from '../src/lib/prisma.js';

async function main() {
    const leads = await prisma.lead.findMany({
        take: 5,
        include: { business: true, campaign: { select: { name: true, userId: true } } }
    });
    console.log('Leads in DB:', leads.length);
    leads.forEach(l => console.log(` - ${l.business.name} | Campaign: ${l.campaign.name} | userId: ${l.campaign.userId}`));

    const users = await prisma.user.findMany();
    console.log('\nUsers in DB:');
    users.forEach(u => console.log(` - id: ${u.id} | email: ${u.email}`));

    const campaigns = await prisma.campaign.findMany({ select: { id: true, name: true, userId: true } });
    console.log('\nCampaigns:');
    campaigns.forEach(c => console.log(` - ${c.name} owned by userId: ${c.userId}`));
}

main();
