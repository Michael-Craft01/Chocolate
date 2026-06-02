import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkLeads() {
    try {
        const leads = await prisma.lead.findMany({
            include: {
                business: true
            }
        });
        console.log(`Checking ${leads.length} leads...`);
        let count = 0;
        for (const lead of leads) {
            const hasChinese = /[\u4e00-\u9fa5]/.test(lead.suggestedMessage);
            if (hasChinese || lead.business.name.includes('Caterwise') || lead.suggestedMessage.includes('Caterwise')) {
                count++;
                console.log(`\n================= MATCH ${count} =================`);
                console.log(`Lead ID: ${lead.id}`);
                console.log(`Business Name: ${lead.business.name}`);
                console.log(`Website: ${lead.business.website}`);
                console.log(`Phone: ${lead.business.phone}`);
                console.log(`Email: ${lead.business.email}`);
                console.log(`Industry: ${lead.industry}`);
                console.log(`Pain Point: ${lead.painPoint}`);
                console.log(`Suggested Message:\n${lead.suggestedMessage}\n`);
            }
        }
        if (count === 0) {
            console.log("No leads with Chinese text or Caterwise found in DB!");
        }
    } catch (e: any) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

checkLeads();
