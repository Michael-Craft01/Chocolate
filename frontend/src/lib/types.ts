export interface Stats {
  totalLeads: number;
  leadsToday: number;
  totalBusinesses: number;
  tier: string;
  quota: {
    used: number;
    limit: number;
    credits: number;
  };
}

export interface Campaign {
  id: string;
  name: string;
  status: "ACTIVE" | "PAUSED" | "EXHAUSTED";
  industries: string[];
  locations: string[];
  _count?: {
    leads: number;
  };
}

export interface Lead {
  id: string;
  sweepId?: string;
  sweepDate?: string;
  industry: string;
  painPoint: string;
  suggestedMessage: string;
  status: "NEW" | "CONTACTED" | "CONVERTED" | "REJECTED";
  createdAt: string;
  business: {
    name: string;
    website?: string;
    phone?: string;
    email?: string;
  };
}

export interface PaginationMeta {
  page: number;
  totalPages: number;
  totalLeads: number;
}
