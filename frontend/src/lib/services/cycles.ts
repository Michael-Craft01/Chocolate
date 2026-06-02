import { authJson } from "@/lib/api";
import type { CycleRun } from "@/lib/types";

export async function fetchCycles(limit: number = 20) {
  return authJson<CycleRun[]>(`/api/cycles?limit=${limit}`);
}

export async function fetchCampaignCycles(campaignId: string, limit: number = 10) {
  return authJson<CycleRun[]>(`/api/campaigns/${campaignId}/cycles?limit=${limit}`);
}

export async function runCampaignCycle(campaignId: string) {
  return authJson<{ message: string; cycle: CycleRun }>(`/api/campaigns/${campaignId}/cycles`, {
    method: "POST",
  });
}
