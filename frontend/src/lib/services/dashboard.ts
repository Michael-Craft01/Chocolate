import { authJson } from "@/lib/api";
import type { Stats } from "@/lib/types";

export async function fetchDashboardStats() {
  return authJson<Stats>("/api/stats");
}
