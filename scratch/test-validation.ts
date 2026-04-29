import { z } from 'zod';

// Current Campaign Creation Schema (copied from validation.ts)
const currentCampaignSchema = z.object({
  name: z.string().min(3).max(100),
  senderName: z.string().min(2),
  senderRole: z.string().min(2),
  companyName: z.string().min(2),
  productName: z.string().min(2),
  productDescription: z.string().min(10),
  targetPainPoints: z.string().min(10),
  targetCountry: z.string().length(2).default('ZW'),
  locations: z.array(z.string()).min(1),
  industries: z.array(z.string()).min(1),
  outreachTone: z.enum(['PROFESSIONAL', 'DIRECT', 'FRIENDLY', 'EDUCATIONAL']).default('PROFESSIONAL'),
  ctaLink: z.string().url().or(z.literal('')).optional().nullable(),
  discordWebhook: z.string().url().or(z.literal('')).optional().nullable(),
});

const testPayload = {
    name: "Premium Artisanal Chocolate Distribution for Retailers in Zimbabwe Launch", // 72 chars
    senderName: "Michael",
    senderRole: "Founder",
    companyName: "Chocolate Co",
    productName: "Premium Artisanal Chocolate Distribution for Retailers in Zimbabwe",
    productDescription: "We provide high quality chocolate to local retailers with fast delivery.",
    targetPainPoints: "Slow supply chain, low quality stock",
    industries: ["Retail", "Food"],
    locations: ["Harare", "Bulawayo"],
    outreachTone: "PROFESSIONAL",
    ctaLink: "https://chocolate.co",
    discordWebhook: undefined,
    targetCountry: "ZW",
};

console.log("Testing current schema with long name...");
try {
    currentCampaignSchema.parse(testPayload);
    console.log("✅ Success (unexpected)");
} catch (error) {
    if (error instanceof z.ZodError) {
        console.log("❌ Failed as expected:");
        error.issues.forEach(issue => {
            console.log(`  - ${issue.path.join('.')}: ${issue.message}`);
        });
    } else {
        console.error("Unknown error", error);
    }
}
