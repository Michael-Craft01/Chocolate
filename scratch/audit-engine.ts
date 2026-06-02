import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const users = await prisma.user.findMany({
  select: { id: true, email: true, tier: true, dailyLimit: true, leadsFoundToday: true, creditBalance: true, lastQuotaReset: true, paymentStatus: true, maxCampaigns: true }
});
const campaigns = await prisma.campaign.findMany({
  where: { status: 'ACTIVE' },
  select: { id: true, userId: true, name: true, locations: true, industries: true, productDescription: true, targetPainPoints: true }
});

console.log('\n=== USERS ===');
for (const u of users) {
  const tierLimit = u.tier === 'ELITE' ? 2500 : u.tier === 'PROFESSIONAL' ? 500 : u.tier === 'STARTER' ? 100 : 10;
  const limitMismatch = u.dailyLimit !== tierLimit;
  const quotaReset = u.lastQuotaReset;
  const hoursSinceReset = Math.round((Date.now() - new Date(quotaReset).getTime()) / 3600000);
  console.log(JSON.stringify({ 
    email: u.email, tier: u.tier, 
    dailyLimit: u.dailyLimit, expectedLimit: tierLimit, LIMIT_MISMATCH: limitMismatch,
    leadsFoundToday: u.leadsFoundToday, creditBalance: u.creditBalance,
    paymentStatus: u.paymentStatus, maxCampaigns: u.maxCampaigns,
    hoursSinceLastReset: hoursSinceReset
  }, null, 2));
}

console.log('\n=== ACTIVE CAMPAIGNS (Identity Check) ===');
for (const c of campaigns) {
  const hasProductDesc = (c.productDescription?.length ?? 0) > 10;
  const hasPainPoints = (c.targetPainPoints?.length ?? 0) > 5;
  const hasLocations = c.locations.length > 0;
  const hasIndustries = c.industries.length > 0;
  const identityOK = hasProductDesc && hasPainPoints && hasLocations && hasIndustries;
  console.log(JSON.stringify({ 
    name: c.name, userId: c.userId,
    identityComplete: identityOK,
    checks: { hasProductDesc, hasPainPoints, hasLocations, hasIndustries },
    locations: c.locations, industries: c.industries
  }, null, 2));
}

console.log('\n=== ENGINE PROJECTION ===');
for (const u of users) {
  const activeCampaignsForUser = campaigns.filter(c => c.userId === u.id);
  if (activeCampaignsForUser.length === 0) continue;
  const dailyRemaining = u.dailyLimit - u.leadsFoundToday;
  const totalCycleTarget = Math.ceil(u.dailyLimit * 0.5); // 50% per cycle
  const cycleTarget = Math.min(totalCycleTarget, dailyRemaining);
  const perCampaignTarget = Math.max(1, Math.floor(cycleTarget / activeCampaignsForUser.length));
  const maxRounds = 10;
  const queriesPerRound = 20;
  const leadsPerQuery = 10;
  const theoreticalMax = maxRounds * queriesPerRound * leadsPerQuery; // max possible per campaign

  console.log(`\n--- ${u.email} [${u.tier}] ---`);
  console.log(`  Daily Limit: ${u.dailyLimit} | Leads Found Today: ${u.leadsFoundToday} | Remaining: ${dailyRemaining}`);
  console.log(`  Cycle Target (50% of limit): ${totalCycleTarget}`);
  console.log(`  Active Campaigns: ${activeCampaignsForUser.length}`);
  console.log(`  Per-Campaign Target This Cycle: ${perCampaignTarget}`);
  console.log(`  Theoretical max per campaign (10 rounds x 20 queries x 10 leads): ${theoreticalMax}`);
  console.log(`  BOTTLENECK? ${perCampaignTarget > theoreticalMax ? '⚠️ YES - Target exceeds engine capacity per cycle!' : '✅ No - Engine should reach target'}`);
}

await prisma.$disconnect();
