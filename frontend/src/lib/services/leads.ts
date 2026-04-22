import { authJson } from "@/lib/api";
import type { Lead, PaginationMeta } from "@/lib/types";

export interface LeadsResponse {
  leads: Lead[];
  pagination: PaginationMeta;
}

export async function fetchLeads(page: number = 1, limit: number = 20, campaignId?: string) {
  const url = `/api/leads?page=${page}&limit=${limit}${campaignId ? `&campaignId=${campaignId}` : ''}`;
  const leads = await authJson<Lead[]>(url);
  
  // Return in the expected format for the frontend
  return {
    leads: leads || [],
    pagination: {
      page,
      totalPages: 1, // Simplified for now
      totalLeads: leads?.length || 0
    }
  };
}

export async function updateLeadStatus(id: string, status: Lead["status"]) {
  return authJson<Lead>(`/api/leads/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
