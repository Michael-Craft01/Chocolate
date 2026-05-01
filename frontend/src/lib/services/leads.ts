import { authJson } from "@/lib/api";
import type { Lead, PaginationMeta } from "@/lib/types";

export interface LeadsResponse {
  leads: Lead[];
  pagination: PaginationMeta;
}

export async function fetchLeads(page: number = 1, limit: number = 20, campaignId?: string) {
  const url = `/api/leads?page=${page}&limit=${limit}${campaignId ? `&campaignId=${campaignId}` : ''}`;
  const response = await authJson<LeadsResponse>(url);
  
  return {
    leads: response.leads || [],
    pagination: response.pagination || {
      page,
      totalPages: 1,
      totalLeads: response.leads?.length || 0
    }
  };
}

export async function updateLeadStatus(id: string, status: Lead["status"]) {
  return authJson<Lead>(`/api/leads/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
