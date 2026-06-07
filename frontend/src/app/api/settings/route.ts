import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, authError } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return authError();

  try {
    let profile = await prisma.profile.findUnique({ where: { userId: user.id } });
    let campaign = await prisma.campaign.findFirst({ where: { userId: user.id, name: 'Main Engine' } });
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { automationMode: true, autoRunFrequency: true }
    });

    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          userId: user.id,
          companyName: "",
          industry: "",
          website: "",
          defaultSenderName: "",
          defaultSenderRole: "",
          onboardingComplete: false
        }
      });
    }

    if (!campaign) {
      campaign = await prisma.campaign.create({
        data: {
          userId: user.id,
          name: 'Main Engine',
          status: 'PAUSED',
          senderName: profile.defaultSenderName || "",
          senderRole: profile.defaultSenderRole || "",
          companyName: profile.companyName || "",
          targetCountry: "ZW",
          locations: [],
          industries: [],
          productName: "",
          productDescription: "",
          targetPainPoints: "",
          outreachTone: "PROFESSIONAL",
        }
      });
    }

    return NextResponse.json({ profile, campaign, user: dbUser });
  } catch (error: any) {
    console.error('Settings GET failed:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return authError();

  try {
    const data = await req.json();
    const profileData = {
      companyName: data.companyName,
      website: data.website || "",
      industry: data.industry || "",
      defaultSenderName: data.defaultSenderName,
      defaultSenderRole: data.defaultSenderRole,
      onboardingComplete: true
    };

    const campaignData = {
      senderName: data.defaultSenderName,
      senderRole: data.defaultSenderRole,
      companyName: data.companyName,
      targetCountry: data.targetCountry || "ZW",
      locations: data.locations || ["Harare"],
      industries: data.industries || [data.industry || "Business"],
      discordWebhook: data.discordWebhook || null,
    };

    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      create: { ...profileData, userId: user.id },
      update: profileData
    });

    let campaign = await prisma.campaign.findFirst({ where: { userId: user.id, name: 'Main Engine' } });
    if (campaign) {
      campaign = await prisma.campaign.update({ where: { id: campaign.id }, data: campaignData });
    } else {
      campaign = await prisma.campaign.create({
        data: {
          ...campaignData,
          userId: user.id,
          name: 'Main Engine',
          // Start PAUSED - user must create their own campaigns to start searches
          status: 'PAUSED',
          productName: data.productName || data.companyName || "",
          productDescription: data.productDescription || "",
          targetPainPoints: data.targetPainPoints || "",
          outreachTone: "PROFESSIONAL",
        }
      });
    }

    if (data.automationMode || data.autoRunFrequency) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          automationMode: data.automationMode || undefined,
          autoRunFrequency: data.autoRunFrequency || undefined,
        }
      });
    }

    return NextResponse.json({ profile, campaign });
  } catch (error: any) {
    console.error('Settings POST failed:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
