import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function simulatePatch() {
  try {
    const id = 'cmq54fbi30001la04lqxrh9cl';
    const campaign = await prisma.campaign.findUnique({
      where: { id }
    });

    if (!campaign) {
      console.log('Campaign not found!');
      return;
    }

    console.log('Found campaign. Simulating patch update...');

    // Replicate payload builder from CampaignForm.tsx
    const industries = Array.isArray(campaign.industries) ? campaign.industries : [];
    const locations = Array.isArray(campaign.locations) ? campaign.locations : [];

    const payload: any = {
      name: campaign.name.trim(),
      senderName: campaign.senderName.trim(),
      senderRole: campaign.senderRole.trim(),
      companyName: campaign.companyName.trim(),
      productName: campaign.productName.trim(),
      productDescription: campaign.productDescription.trim(),
      targetPainPoints: campaign.targetPainPoints.trim(),
      industries: industries.length ? industries : ["Business"],
      locations: locations.length ? locations : ["Harare"],
      outreachTone: campaign.outreachTone,
      ctaLink: campaign.ctaLink?.trim() || undefined,
      discordWebhook: campaign.discordWebhook?.trim() || undefined,
      targetCountry: campaign.targetCountry,
      targetMarket: campaign.targetMarket?.trim() || undefined,
      targetBusinessSize: campaign.targetBusinessSize,
    };

    console.log('Payload:', payload);

    const updated = await prisma.campaign.update({
      where: { id },
      data: payload
    });

    console.log('✅ Update successful! Updated name:', updated.name);
  } catch (error) {
    console.error('❌ Error during update simulation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

simulatePatch();
