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
  cycles: {
    remaining: number;
    monthlyLimit: number;
    usedThisPeriod: number;
    leadsPerCycle: number;
    automationMode: "MANUAL" | "AUTOMATIC" | "SMART";
    autoRunFrequency: "MANUAL" | "WEEKLY" | "EVERY_2_DAYS" | "DAILY";
    currentPeriodStart?: string;
    currentPeriodEnd?: string;
  };
  latestCycle?: CycleRun | null;
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
  cycleRuns?: CycleRun[];
}

export interface Lead {
  id: string;
  campaignId?: string;
  campaign?: {
    id?: string;
    name: string;
    status?: Campaign["status"];
    companyName?: string;
    senderName?: string;
    senderRole?: string;
    targetCountry?: string;
    locations?: string[];
    industries?: string[];
    productName?: string;
    productDescription?: string;
    targetPainPoints?: string;
    outreachTone?: Campaign["outreachTone"];
    ctaLink?: string;
  };
  cycleRunId?: string;
  cycleRun?: CycleRun;
  sweepId?: string;
  sweepDate?: string;
  industry: string;
  painPoint: string;
  suggestedMessage: string;
  status: "NEW" | "CONTACT_ROUTE_OPENED" | "CONTACTED" | "CONVERTED" | "REJECTED";
  createdAt: string;
  business: {
    name: string;
    website?: string;
    phone?: string;
    email?: string;
    contactStatus?: "sales_ready" | "contactable" | "needs_person" | "weak_contact" | "missing";
    contactPages?: string[];
    socialProfiles?: string[];
    decisionMakers?: Array<{
      name: string;
      role?: string;
      profileUrl?: string;
      sourceUrl?: string;
      confidence?: number;
    }>;
    bestContactChannel?: string;
    contactConfidence?: number;
    contactEvidence?: string[];
  };
}

export interface CycleRun {
  id: string;
  userId: string;
  campaignId: string;
  status: "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED" | "PARTIAL";
  triggerType: "AUTO" | "MANUAL" | "SYSTEM";
  maxLeads: number;
  leadsFound: number;
  maxRuntimeMs: number;
  startedAt?: string;
  completedAt?: string;
  failureReason?: string;
  costEstimate?: number;
  createdAt: string;
  updatedAt: string;
  campaign?: {
    id: string;
    name: string;
    status: Campaign["status"];
  };
}

export interface PaginationMeta {
  page: number;
  totalPages: number;
  totalLeads: number;
}
