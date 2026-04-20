import { authJson } from "@/lib/api";
import type { Lead, PaginationMeta } from "@/lib/types";

interface LeadsResponse {
  leads: Lead[];
  pagination: PaginationMeta;
}

export async function fetchLeads(page = 1, limit = 20) {
  return authJson<LeadsResponse>(`/api/leads?page=${page}&limit=${limit}`);
}

export async function updateLeadStatus(id: string, status: Lead["status"]) {
  return authJson<Lead>(`/api/leads/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
