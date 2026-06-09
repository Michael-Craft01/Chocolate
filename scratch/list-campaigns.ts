import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function listCampaigns() {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: {
        _count: { select: { leads: true } }
      }
    });
    console.log(`Found ${campaigns.length} campaigns:`);
    for (const c of campaigns) {
      console.log(`-----------------------------------`);
      console.log(`ID: ${c.id}`);
      console.log(`Name: ${c.name}`);
      console.log(`User ID: ${c.userId}`);
      console.log(`Sender: ${c.senderName} (${c.senderRole}) at ${c.companyName}`);
      console.log(`Product: ${c.productName}`);
      console.log(`Description: ${c.productDescription}`);
      console.log(`Tone: ${c.outreachTone}`);
      console.log(`Status: ${c.status}`);
      console.log(`CTA: ${c.ctaLink}`);
      console.log(`Discord Webhook: ${c.discordWebhook}`);
    }
  } catch (error) {
    console.error('Error listing campaigns:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listCampaigns();
