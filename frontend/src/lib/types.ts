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
  senderName: string;
  senderRole: string;
  companyName: string;
  targetCountry: string;
  locations: string[];
  industries: string[];
  productName: string;
  productDescription: string;
  targetPainPoints: string;
  outreachTone: "PROFESSIONAL" | "DIRECT" | "FRIENDLY" | "EDUCATIONAL";
  ctaLink?: string;
  discordWebhook?: string;
  createdAt: string;
  updatedAt: string;
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
