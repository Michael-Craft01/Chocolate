import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Locating campaign jfjnwf...');
    const campaign = await prisma.campaign.findFirst({
        where: { name: 'jfjnwf' }
    });

    if (!campaign) {
        console.error('❌ Campaign not found!');
        return;
    }

    console.log('✅ Found! Updating search terms...');
    await prisma.campaign.update({
        where: { id: campaign.id },
        data: {
            industries: ['Medical Supplies', 'Pharmaceutical Wholesalers', 'Pharmacies', 'Chemists'],
            locations: ['Harare', 'Bulawayo', 'Mutare']
        }
    });

    console.log('🚀 Campaign UPDATED with professional terms and locations.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
