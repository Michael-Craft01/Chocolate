import { authJson } from "@/lib/api";
import type { Campaign } from "@/lib/types";

export interface CreateCampaignPayload {
  name: string;
  senderName: string;
  senderRole: string;
  companyName: string;
  productName: string;
  productDescription: string;
  targetPainPoints: string;
  industries: string[];
  locations: string[];
  outreachTone: "PROFESSIONAL" | "DIRECT" | "FRIENDLY" | "EDUCATIONAL";
  ctaLink?: string;
  discordWebhook?: string;
  targetCountry: string;
}

export async function fetchCampaigns() {
  return authJson<Campaign[]>("/api/campaigns");
}

export async function createCampaign(payload: CreateCampaignPayload) {
  return authJson<Campaign>("/api/campaigns", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCampaignStatus(id: string, status: "ACTIVE" | "PAUSED" | "EXHAUSTED") {
  return authJson<Campaign>(`/api/campaigns/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
