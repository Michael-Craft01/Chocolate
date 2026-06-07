"use client";

import { useEffect, useState, useMemo } from "react";
import {
  ExternalLink, MessageSquare, Filter, FileDown, Phone, Globe, Calendar, Building2, Check, Trash2, 
  ShieldCheck, Shield, ChevronDown, ChevronUp, Zap, Search, RefreshCw, BarChart3, Users, Mail, MapPin, 
  Brain, Send, Copy, ArrowUpRight, Sparkles, Target, AlertCircle, TrendingUp, Lightbulb, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/skeleton";
import { EmptyState } from "@/components/empty-state";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { NeuralDropdown } from "@/components/NeuralDropdown";
import { authJson, getApiBaseUrl } from "@/lib/api";
import { createClient } from "@/lib/supabase";
import type { Lead, PaginationMeta, Campaign } from "@/lib/types";
import { fetchLeads as fetchLeadList } from "@/lib/services/leads";
import { fetchCampaigns } from "@/lib/services/campaigns";

// Group leads by calendar day, then by discovery cycle within that day
function groupLeadsByDayAndSweep(leads: Lead[]) {
  const dayMap: Record<string, { date: string; sweeps: Record<string, { sweepId: string; time: string; leads: Lead[]; status?: string; maxLeads?: number; triggerType?: string }> }> = {};

  for (const lead of leads) {
    const d = new Date(lead.cycleRun?.startedAt || lead.sweepDate || lead.createdAt);
    const dayKey = d.toISOString().slice(0, 10); // YYYY-MM-DD
    const sweepKey = lead.cycleRunId || lead.sweepId || "legacy";

    if (!dayMap[dayKey]) dayMap[dayKey] = { date: d.toISOString(), sweeps: {} };
    if (!dayMap[dayKey].sweeps[sweepKey]) {
      dayMap[dayKey].sweeps[sweepKey] = {
        sweepId: sweepKey,
        time: d.toISOString(),
        leads: [],
        status: lead.cycleRun?.status,
        maxLeads: lead.cycleRun?.maxLeads,
        triggerType: lead.cycleRun?.triggerType
      };
    }
    dayMap[dayKey].sweeps[sweepKey].leads.push(lead);
  }

  return Object.entries(dayMap)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([dayKey, { date, sweeps }]) => ({
      dayKey,
      date,
      sweeps: Object.values(sweeps).sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()),
      total: Object.values(sweeps).reduce((n, s) => n + s.leads.length, 0),
    }));
}

function formatDay(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function cleanOutreachMessage(text: string) {
  let cleaned = (text || "")
    .replace(/<thought>[\s\S]*?<\/thought>/gi, "")
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, "")
    .replace(/```[\w-]*\n?/g, "")
    .replace(/<\/?email>/gi, "")
    .replace(/\*\*(Opening|The Hook\/Pain Point|The Solution|Call to Action|CTA|Subject):\*\*:?/gi, "")
    .replace(/^\s*[-*]\s+\*\*[^*\n]+:\*\*\s*/gm, "")
    .replace(/^\s*[-*]\s*(Opening|The Hook\/Pain Point|The Solution|Call to Action|CTA|Subject):\s*/gim, "")
    .replace(/^\s*`+\s*/gm, "")
    .replace(/\s*`+\s*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const firstGreeting = cleaned.search(/\b(hi|hello|good day|hey|greetings)\b/i);
  if (firstGreeting > 0) cleaned = cleaned.slice(firstGreeting).trim();

  return cleaned;
}

function contactStatusLabel(status?: Lead["business"]["contactStatus"]) {
  switch (status) {
    case "sales_ready":
      return "Sales Ready";
    case "contactable":
      return "Contactable";
    case "needs_person":
      return "Needs Person";
    case "weak_contact":
      return "Weak Contact";
    default:
      return "Contact Route";
  }
}

function contactStatusClass(status?: Lead["business"]["contactStatus"]) {
  switch (status) {
    case "sales_ready":
      return "text-green-600 bg-green-500/10";
    case "contactable":
      return "text-primary bg-primary/10";
    case "needs_person":
      return "text-amber-600 bg-amber-500/10";
    case "weak_contact":
      return "text-orange-600 bg-orange-500/10";
    default:
      return "text-muted-foreground bg-muted";
  }
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, totalPages: 1, totalLeads: 0 });
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [activeTab, setActiveTab] = useState<"timeline" | "all">("timeline");
  const [stats, setStats] = useState<any>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailResult, setEmailResult] = useState<'sent' | 'failed' | null>(null);

  // Sales intelligence state
  type SalesIntel = {
    summary: string;
    opportunityScore: number;
    whyThisLead: string;
    salesApproach: string;
    talkingPoints: string[];
    likelyObjection: string;
    objectionResponse: string;
    nextBestAction: string;
    urgencySignal: string;
  };
  const [intel, setIntel] = useState<SalesIntel | null>(null);
  const [loadingIntel, setLoadingIntel] = useState(false);
  const [intelError, setIntelError] = useState<string | null>(null);
  const [showIntelModal, setShowIntelModal] = useState(false);

  // Suggested email local editor state when a lead is clicked
  const [editedMessage, setEditedMessage] = useState("");

  const fetchData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      setError(null);
      const campaignFilter = selectedCampaignId === "ALL" ? undefined : selectedCampaignId;
      const [leadsData, campaignsData, statsData] = await Promise.all([
        fetchLeadList(page, 250, campaignFilter),
        fetchCampaigns(),
        authJson<any>("/api/stats")
      ]);
      const fetchedLeads = leadsData.leads || [];
      setLeads(fetchedLeads);
      setCampaigns(campaignsData || []);
      setStats(statsData);
      setPagination(leadsData.pagination || { page: 1, totalPages: 1, totalLeads: 0 });
      
      // Auto-expand the most recent day
      const groups = groupLeadsByDayAndSweep(fetchedLeads);
      if (groups.length > 0) setExpandedDays(new Set([groups[0].dayKey]));

      // Auto-select the first lead to populate the intelligence panel instantly
      if (fetchedLeads.length > 0 && !selectedLeadId) {
        setSelectedLeadId(fetchedLeads[0].id);
        setEditedMessage(cleanOutreachMessage(fetchedLeads[0].suggestedMessage || ""));
      }
    } catch (err: any) {
      setError(err.message || "Unable to connect to your collection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [page, selectedCampaignId]);

  const filteredLeads = useMemo(() => {
    if (!searchQuery) return leads;
    const q = searchQuery.toLowerCase();
    return leads.filter(l =>
      l.business.name.toLowerCase().includes(q) ||
      l.industry?.toLowerCase().includes(q) ||
      l.painPoint?.toLowerCase().includes(q)
    );
  }, [leads, searchQuery]);

  const dayGroups = useMemo(() => groupLeadsByDayAndSweep(filteredLeads), [filteredLeads]);

  // Find currently active lead object
  const activeLead = useMemo(() => {
    const found = leads.find(l => l.id === selectedLeadId);
    if (found && !editedMessage && found.suggestedMessage) {
      setEditedMessage(cleanOutreachMessage(found.suggestedMessage));
    }
    return found;
  }, [leads, selectedLeadId]);

  const activeCampaign = useMemo(() => {
    if (!activeLead) return null;
    return activeLead.campaign || campaigns.find(c => c.id === activeLead.campaignId) || null;
  }, [activeLead, campaigns]);

  const selectLead = (lead: Lead) => {
    setSelectedLeadId(lead.id);
    setEditedMessage(cleanOutreachMessage(lead.suggestedMessage || ""));
    // Clear previous intel; analysis runs only when the user opens the explainer.
    setIntel(null);
    setIntelError(null);
    setShowIntelModal(false);
  };

  const openIntelModal = (lead: Lead) => {
    setShowIntelModal(true);
    if (!intel && !loadingIntel) {
      fetchIntel(lead.id);
    }
  };

  const fetchIntel = async (leadId: string) => {
    setLoadingIntel(true);
    setIntelError(null);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Authentication required");

      const response = await fetch(`/api/leads/${leadId}/analyze`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || data?.message || `Request failed (${response.status})`);
      setIntel(data);
    } catch (err: any) {
      setIntelError(err.message || 'Analysis failed');
    } finally {
      setLoadingIntel(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this lead from your collection?")) return;
    try {
      await authJson(`/api/leads/${id}`, { method: "DELETE" });
      setLeads(prev => prev.filter(l => l.id !== id));
      if (selectedLeadId === id) {
        setSelectedLeadId(null);
        setEditedMessage("");
      }
    } catch { alert("Failed to remove lead."); }
  };

  const handleDispatch = async (id: string, markContacted = false) => {
    try {
      const result = await authJson<{ emailSent: boolean, whatsappUrl: string | null, mailtoUrl: string | null, contactUrl: string | null, status: Lead["status"] }>(`/api/leads/${id}/dispatch`, { 
        method: "POST",
        body: JSON.stringify({ customMessage: editedMessage, markContacted })
      });
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status: result.status } : l));
      if (result.whatsappUrl) window.open(result.whatsappUrl, '_blank');
      else if (result.mailtoUrl) window.open(result.mailtoUrl, '_blank');
      else if (result.contactUrl) window.open(result.contactUrl, '_blank');
    } catch (err: any) {
      alert("Failed to dispatch: " + (err.message || "Unknown error"));
    }
  };

  const handleEmailDispatch = async (id: string) => {
    if (sendingEmail) return;
    setSendingEmail(true);
    setEmailResult(null);
    try {
      const result = await authJson<{ emailSent: boolean, status: Lead["status"] }>(`/api/leads/${id}/dispatch`, {
        method: "POST",
        body: JSON.stringify({ customMessage: editedMessage })
      });
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status: result.status } : l));
      setEmailResult(result.emailSent ? 'sent' : 'failed');
      setTimeout(() => setEmailResult(null), 3000);
    } catch {
      setEmailResult('failed');
      setTimeout(() => setEmailResult(null), 3000);
    } finally {
      setSendingEmail(false);
    }
  };

  const copyField = async (key: string, value: string) => {
    await navigator.clipboard.writeText(value).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyAll = async () => {
    if (!activeLead) return;
    const lines = [
      `Company:   ${activeLead.business.name}`,
      `Industry:  ${activeLead.industry || '—'}`,
      `Phone:     ${activeLead.business.phone || '—'}`,
      `Email:     ${activeLead.business.email || '—'}`,
      `Website:   ${activeLead.business.website || '—'}`,
      `Pain Point: ${activeLead.painPoint || '—'}`,
      ``,
      `Message:`,
      editedMessage,
    ].join('\n');
    await navigator.clipboard.writeText(lines).catch(() => {});
    setCopied('all');
    setTimeout(() => setCopied(null), 2000);
  };

  const exportLeads = async (format: string) => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    if (!token) {
      alert("Session expired. Please log in again.");
      return;
    }

    const filter = selectedCampaignId === "ALL" ? "" : `?campaignId=${selectedCampaignId}`;
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/api/leads/export${filter}${filter ? "&" : "?"}token=${encodeURIComponent(token)}&format=${format}`;
    
    window.open(url, "_blank");
    setShowExportOptions(false);
  };

  const toggleDay = (key: string) => {
    setExpandedDays(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const totalSweeps = dayGroups.reduce((n, d) => n + d.sweeps.length, 0);

  return (
    <div className="min-h-screen pb-24 font-sans selection:bg-primary/20">
      <div className="max-w-7xl mx-auto space-y-6 relative">

        {/* Clean, Simple Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-3 border-b border-card-border pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <ShieldCheck className="h-4 w-4" /> Dedicated Outreach Intelligence
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Outbound Command Center</h1>
            <p className="text-xs text-muted-foreground font-medium">
              {pagination.totalLeads} total active opportunities · grouped by search runs
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Refresh */}
            <button onClick={() => fetchData(true)}
              className="h-9 w-9 rounded-lg bg-card border border-card-border flex items-center justify-center hover:border-card-hover-border hover:text-primary text-foreground transition-all cursor-pointer shadow-sm"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-primary" : ""}`} />
            </button>

            {/* Campaign filter */}
            <NeuralDropdown
              icon={<Filter className="h-3.5 w-3.5" />}
              options={[
                { value: "ALL", label: "All Campaigns" },
                ...campaigns.map(c => ({ value: c.id, label: c.name }))
              ]}
              value={selectedCampaignId}
              onChange={val => { setSelectedCampaignId(val); setPage(1); }}
            />

            {/* Export */}
            <div className="relative">
              <button onClick={() => setShowExportOptions(!showExportOptions)}
                className="h-9 px-4 rounded-lg bg-primary text-white font-semibold text-xs hover:bg-primary-hover active:scale-[0.98] transition-all flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <FileDown className="h-3.5 w-3.5" /> Export
              </button>
              <AnimatePresence>
                {showExportOptions && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                    className="absolute right-0 mt-2 w-44 bg-card border border-card-border rounded-lg overflow-hidden z-50 shadow-lg"
                  >
                    {["CSV", "Excel", "JSON"].map(f => (
                      <button key={f} onClick={() => exportLeads(f.toLowerCase())}
                        className="w-full px-4 py-2.5 text-left text-xs font-medium text-foreground hover:bg-foreground/5 transition-colors border-b border-card-border last:border-0 cursor-pointer"
                      >Export as {f}</button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mini Stats Grid (Clean and simple) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Leads", value: pagination.totalLeads, icon: Users },
            { label: "Today", value: stats?.leadsToday || 0, icon: Zap },
            { label: "Search Runs", value: totalSweeps, icon: RefreshCw },
            { label: "Days Active", value: dayGroups.length, icon: Calendar },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-card border border-card-border rounded-xl p-4 flex items-center gap-4 shadow-sm">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">{label}</p>
                <p className="text-xl font-bold text-foreground tracking-tight">
                  <AnimatedNumber value={value} />
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Dedicated B2B Leads Master-Detail Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Master Leads Panel */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            
            {/* Search and Filters Hub */}
            <div className="bg-card border border-card-border p-4 rounded-xl space-y-3 shadow-sm">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full h-9 bg-background border border-card-border rounded-lg pl-10 pr-4 text-xs font-medium outline-none transition-all text-foreground placeholder:text-muted-foreground/60"
                />
              </div>

              {/* Layout view tabs */}
              <div className="flex gap-1 p-1 bg-background border border-card-border rounded-lg w-full">
                {[
                  { id: "timeline", label: "Cycle Timeline", icon: Calendar },
                  { id: "all", label: "Raw Intelligence", icon: BarChart3 },
                ].map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => setActiveTab(id as any)}
                    className={`flex-1 h-7 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      activeTab === id ? "bg-primary text-white shadow-sm" : "text-foreground hover:bg-card-border"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" /> {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Leads List scroll view - Dense and Compact */}
            <div className="bg-card border border-card-border rounded-xl p-3 shadow-sm h-[580px] overflow-y-auto scrollbar-neural">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  <div className="space-y-2 p-2">
                    {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-10 rounded-lg bg-background" />)}
                  </div>
                ) : dayGroups.length === 0 ? (
                  <EmptyState title="No Search Runs Logged" description="Run a campaign search to capture targeted prospects." />
                ) : activeTab === "timeline" ? (
                  // Dense Cycle groups timeline
                  dayGroups.map((day, di) => (
                    <div key={day.dayKey} className="space-y-2 mb-4">
                      {/* Day Separator */}
                      <button onClick={() => toggleDay(day.dayKey)}
                        className="w-full flex items-center gap-2 group py-1"
                      >
                        <span className="text-xs font-semibold text-primary shrink-0">{formatDay(day.date)}</span>
                        <div className="h-[1px] flex-1 bg-card-border group-hover:bg-primary/25 transition-colors" />
                        <span className="text-xs text-muted-foreground font-medium shrink-0">
                          {day.total} leads
                        </span>
                        {expandedDays.has(day.dayKey) ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground/80" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/80" />}
                      </button>

                      {expandedDays.has(day.dayKey) && day.sweeps.map((sweep, si) => (
                        <div key={sweep.sweepId} className="space-y-2 ml-2 pl-2 border-l border-card-border">
                          {/* Cycle Marker */}
                          <div className="flex items-center gap-1.5 py-1 text-xs text-muted-foreground font-medium">
                            <Zap className="h-3 w-3 text-primary" /> Cycle {sweep.leads.length} · {formatTime(sweep.time)}
                          </div>

                          {/* Dense Rows */}
                          {sweep.leads.map((lead) => (
                            <ThinLeadRow
                              key={lead.id}
                              lead={lead}
                              isSelected={selectedLeadId === lead.id}
                              onSelect={() => selectLead(lead)}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  // Flat dense leads feed
                  <div className="space-y-2 p-1">
                    {filteredLeads.map((lead) => (
                      <ThinLeadRow
                        key={lead.id}
                        lead={lead}
                        isSelected={selectedLeadId === lead.id}
                        onSelect={() => selectLead(lead)}
                      />
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-2 pt-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 px-4 rounded-lg bg-card border border-card-border text-xs font-semibold text-foreground hover:border-card-hover-border disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
                >
                  Prev
                </button>
                <span className="text-xs text-muted-foreground font-medium">
                  {page} / {pagination.totalPages}
                </span>
                <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="h-8 px-4 rounded-lg bg-card border border-card-border text-xs font-semibold text-foreground hover:border-card-hover-border disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Right Detail Panel — Form-Table Layout */}
          <div className="lg:col-span-7">
            <div className="sticky top-28 self-start bg-card border border-card-border rounded-xl shadow-sm min-h-[580px] flex flex-col overflow-hidden">

              <AnimatePresence mode="wait">
                {activeLead ? (
                  <motion.div
                    key={activeLead.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col flex-1"
                  >
                    {/* Panel Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-card-border">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h2 className="text-base font-bold text-foreground tracking-tight truncate">{activeLead.business.name}</h2>
                            <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold shrink-0">{activeLead.industry}</span>
                          </div>
                          <p className="text-xs text-muted-foreground font-medium">
                            {activeLead.status === 'CONTACTED' ? 'Contacted' : activeLead.status === 'CONTACT_ROUTE_OPENED' ? 'Route opened' : 'Active'} - Discovered {new Date(activeLead.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={copyAll}
                          className="h-8 px-3 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {copied === 'all' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                          {copied === 'all' ? 'Copied!' : 'Copy All'}
                        </button>
                        <button onClick={() => handleDelete(activeLead.id)}
                          className="h-8 w-8 rounded-lg bg-red-500/5 hover:bg-red-500/10 text-red-500 border border-red-500/10 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Scrollable form-table body */}
                    <div className="flex-1 overflow-y-auto scrollbar-neural">

                      {/* ── Section: Contact Information ── */}
                      <div className="px-5 pt-4 pb-2">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Contact Information</p>
                        <div className="border border-card-border rounded-lg overflow-hidden">
                          {[
                            {
                              key: 'name',
                              label: 'Company Name',
                              icon: Building2,
                              value: activeLead.business.name,
                              mono: false,
                            },
                            {
                              key: 'phone',
                              label: 'Phone Number',
                              icon: Phone,
                              value: activeLead.business.phone || '',
                              mono: true,
                              badge: activeLead.business.phone ? { text: 'VERIFIED', color: 'text-green-600 bg-green-500/10' } : { text: 'MISSING', color: 'text-muted-foreground bg-muted' },
                            },
                            {
                              key: 'email',
                              label: 'Email Address',
                              icon: Mail,
                              value: activeLead.business.email || '',
                              mono: true,
                              badge: activeLead.business.email ? { text: 'Email Verified', color: 'text-green-600 bg-green-500/10' } : { text: 'MISSING', color: 'text-muted-foreground bg-muted' },
                            },
                            {
                              key: 'website',
                              label: 'Website',
                              icon: Globe,
                              value: activeLead.business.website || '',
                              mono: true,
                              link: activeLead.business.website || undefined,
                            },
                            {
                              key: 'contactStatus',
                              label: 'Contact Quality',
                              icon: ShieldCheck,
                              value: `${contactStatusLabel(activeLead.business.contactStatus)}${activeLead.business.contactConfidence ? ` (${activeLead.business.contactConfidence}%)` : ''}`,
                              mono: false,
                              badge: { text: activeLead.business.bestContactChannel || 'route', color: contactStatusClass(activeLead.business.contactStatus) },
                            },
                          ].map((field, idx, arr) => (
                            <div
                              key={field.key}
                              className={`flex items-center gap-3 px-4 py-3 bg-background ${
                                idx < arr.length - 1 ? 'border-b border-card-border' : ''
                              }`}
                            >
                              {/* Icon */}
                              <field.icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />

                              {/* Label */}
                              <div className="w-28 shrink-0">
                                <p className="text-[11px] font-semibold text-muted-foreground">{field.label}</p>
                              </div>

                              {/* Value */}
                              <div className="flex-1 min-w-0">
                                {field.value ? (
                                  field.link ? (
                                    <a
                                      href={field.link}
                                      target="_blank"
                                      className="text-xs font-medium text-primary hover:underline flex items-center gap-1 truncate"
                                    >
                                      {field.value.replace(/https?:\/\/(www\.)?/, '')}
                                      <ArrowUpRight className="h-2.5 w-2.5 shrink-0" />
                                    </a>
                                  ) : (
                                    <p className={`text-xs font-medium text-foreground truncate ${field.mono ? 'font-mono' : ''}`}>
                                      {field.value}
                                    </p>
                                  )
                                ) : (
                                  <p className="text-xs text-muted-foreground/50 italic">Not available</p>
                                )}
                              </div>

                              {/* Badge */}
                              {field.badge && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${field.badge.color}`}>
                                  {field.badge.text}
                                </span>
                              )}

                              {/* Copy button */}
                              <button
                                onClick={() => field.value && copyField(field.key, field.value)}
                                disabled={!field.value}
                                className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shrink-0"
                                title={`Copy ${field.label}`}
                              >
                                {copied === field.key
                                  ? <Check className="h-3 w-3 text-green-500" />
                                  : <Copy className="h-3 w-3" />
                                }
                              </button>
                            </div>
                          ))}
                        </div>
                        {((activeLead.business.contactPages?.length || 0) > 0 || (activeLead.business.socialProfiles?.length || 0) > 0 || (activeLead.business.decisionMakers?.length || 0) > 0) && (
                          <div className="mt-3 border border-card-border rounded-lg overflow-hidden">
                            {(activeLead.business.contactPages?.length || 0) > 0 && (
                              <div className="px-4 py-3 bg-background border-b border-card-border">
                                <p className="text-[11px] font-semibold text-muted-foreground mb-2">Contact Pages</p>
                                <div className="flex flex-wrap gap-2">
                                  {activeLead.business.contactPages?.slice(0, 4).map((url) => (
                                    <a key={url} href={url} target="_blank" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline max-w-full">
                                      <span className="truncate">{url.replace(/https?:\/\/(www\.)?/, '')}</span>
                                      <ArrowUpRight className="h-3 w-3 shrink-0" />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                            {(activeLead.business.socialProfiles?.length || 0) > 0 && (
                              <div className="px-4 py-3 bg-background border-b border-card-border">
                                <p className="text-[11px] font-semibold text-muted-foreground mb-2">Social Routes</p>
                                <div className="flex flex-wrap gap-2">
                                  {activeLead.business.socialProfiles?.slice(0, 4).map((url) => (
                                    <a key={url} href={url} target="_blank" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline max-w-full">
                                      <span className="truncate">{url.replace(/https?:\/\/(www\.)?/, '')}</span>
                                      <ArrowUpRight className="h-3 w-3 shrink-0" />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                            {(activeLead.business.decisionMakers?.length || 0) > 0 && (
                              <div className="px-4 py-3 bg-background">
                                <p className="text-[11px] font-semibold text-muted-foreground mb-2">People To Contact</p>
                                <div className="space-y-2">
                                  {activeLead.business.decisionMakers?.slice(0, 4).map((person) => (
                                    <div key={`${person.name}-${person.profileUrl || person.role || ''}`} className="flex items-center justify-between gap-3">
                                      <div className="min-w-0">
                                        <p className="text-xs font-bold text-foreground truncate">{person.name}</p>
                                        <p className="text-[11px] text-muted-foreground truncate">{person.role || 'Relevant contact'}{person.confidence ? ` · ${person.confidence}%` : ''}</p>
                                      </div>
                                      {person.profileUrl && (
                                        <a href={person.profileUrl} target="_blank" className="h-7 w-7 rounded-md flex items-center justify-center text-primary hover:bg-primary/10 shrink-0" title="Open profile">
                                          <ArrowUpRight className="h-3.5 w-3.5" />
                                        </a>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* ── Section: AI Intelligence ── */}
                      <div className="px-5 pt-3 pb-2">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">AI Intelligence</p>
                        <div className="border border-card-border rounded-lg overflow-hidden">
                          {/* Industry row */}
                          <div className="flex items-center gap-3 px-4 py-3 bg-background border-b border-card-border">
                            <Brain className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <div className="w-28 shrink-0">
                              <p className="text-[11px] font-semibold text-muted-foreground">Industry</p>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground">{activeLead.industry || '—'}</p>
                            </div>
                            <button
                              onClick={() => activeLead.industry && copyField('industry', activeLead.industry)}
                              disabled={!activeLead.industry}
                              className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shrink-0"
                            >
                              {copied === 'industry' ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                            </button>
                          </div>

                          {/* Pain Point row */}
                          <div className="flex items-start gap-3 px-4 py-3 bg-background">
                            <Zap className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                            <div className="w-28 shrink-0 pt-0.5">
                              <p className="text-[11px] font-semibold text-muted-foreground">Pain Point</p>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground leading-relaxed">{activeLead.painPoint || '—'}</p>
                            </div>
                            <button
                              onClick={() => activeLead.painPoint && copyField('painPoint', activeLead.painPoint)}
                              disabled={!activeLead.painPoint}
                              className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shrink-0"
                            >
                              {copied === 'painPoint' ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* ── Section: Sales Intelligence ── */}
                      <div className="px-5 pt-3 pb-2">
                        <div className="rounded-lg bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
                              <Sparkles className="h-3.5 w-3.5" /> AI Sales Explainer
                            </p>
                            <p className="text-xs text-foreground/70 font-medium mt-1">
                              Open a focused sale-path brief for this lead, based on campaign context and findings.
                            </p>
                          </div>
                          <button
                            onClick={() => activeLead && openIntelModal(activeLead)}
                            className="h-10 px-4 rounded-lg bg-primary text-white text-xs font-bold flex items-center justify-center gap-2 shrink-0 hover:bg-primary-hover transition-colors"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            Explain Sale Path
                          </button>
                        </div>
                      </div>

                      <div className="hidden">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                              <Sparkles className="h-3 w-3 text-primary" /> AI Sales Path
                            </p>
                            <p className="text-[11px] text-muted-foreground font-medium mt-1">
                              {activeCampaign?.name || "Campaign"} {activeCampaign?.productName ? `-> ${activeCampaign.productName}` : ""} {activeCampaign?.outreachTone ? `-> ${activeCampaign.outreachTone.toLowerCase()} tone` : ""}
                            </p>
                          </div>
                          {intelError && (
                            <button
                              onClick={() => activeLead && fetchIntel(activeLead.id)}
                              className="text-[11px] text-primary font-semibold hover:underline cursor-pointer flex items-center gap-1"
                            >
                              <RefreshCw className="h-3 w-3" /> Retry
                            </button>
                          )}
                        </div>

                        <div className="border border-card-border rounded-lg overflow-hidden shadow-sm">
                          {loadingIntel ? (
                            /* Loading shimmer */
                            <div className="p-4 space-y-3 bg-background">
                              <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-primary/10 animate-pulse shrink-0" />
                                <div className="flex-1 space-y-2">
                                  <div className="h-2.5 bg-muted rounded-full animate-pulse w-3/4" />
                                  <div className="h-2.5 bg-muted rounded-full animate-pulse w-1/2" />
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                {[1,2,3].map(i => (
                                  <div key={i} className="h-2.5 bg-muted rounded-full animate-pulse" style={{ width: `${90 - i * 10}%` }} />
                                ))}
                              </div>
                              <p className="text-[10px] text-muted-foreground text-center pt-1 font-medium">
                                AI is analyzing this lead...
                              </p>
                            </div>
                          ) : intelError ? (
                            <div className="p-4 bg-background flex items-center gap-2 text-red-500">
                              <AlertCircle className="h-4 w-4 shrink-0" />
                              <p className="text-xs font-medium">{intelError}</p>
                            </div>
                          ) : intel ? (
                            <div className="bg-background divide-y divide-card-border">

                              {/* Score + Summary row */}
                              <div className="p-4 flex items-start gap-4">
                                {/* Opportunity Score ring */}
                                <div className="shrink-0 flex flex-col items-center gap-1">
                                  <div className="relative h-14 w-14">
                                    <svg className="h-14 w-14 -rotate-90" viewBox="0 0 56 56">
                                      <circle cx="28" cy="28" r="22" fill="none" stroke="currentColor" strokeWidth="5" className="text-card-border" />
                                      <circle
                                        cx="28" cy="28" r="22" fill="none" strokeWidth="5"
                                        strokeDasharray={`${2 * Math.PI * 22}`}
                                        strokeDashoffset={`${2 * Math.PI * 22 * (1 - intel.opportunityScore / 10)}`}
                                        strokeLinecap="round"
                                        className={intel.opportunityScore >= 8 ? "text-green-500" : intel.opportunityScore >= 5 ? "text-primary" : "text-orange-400"}
                                        stroke="currentColor"
                                      />
                                    </svg>
                                    <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-foreground">
                                      {intel.opportunityScore}
                                    </span>
                                  </div>
                                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Score</p>
                                </div>

                                {/* Summary */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">What this lead is</p>
                                  <p className="text-xs font-medium text-foreground leading-relaxed">{intel.summary}</p>
                                  {intel.urgencySignal && (
                                    <div className="mt-2 flex items-start gap-1.5">
                                      <Zap className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                                      <p className="text-[11px] text-amber-600 font-semibold leading-snug">{intel.urgencySignal}</p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Approach + Why row */}
                              <div className="px-4 py-3 flex items-center gap-3">
                                <Target className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                                    Why it matches this campaign
                                  </p>
                                  <p className="text-xs text-foreground font-medium leading-snug">{intel.whyThisLead}</p>
                                </div>
                              </div>

                              <div className="px-4 py-3 flex items-start gap-3 bg-primary/5">
                                <Send className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                  <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-0.5">How to make it a sale</p>
                                  <p className="text-xs text-foreground font-semibold leading-snug">{intel.salesApproach}</p>
                                </div>
                              </div>

                              {/* Talking Points */}
                              {intel.talkingPoints.length > 0 && (
                                <div className="px-4 py-3">
                                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" /> Talking Points
                                  </p>
                                  <ul className="space-y-1.5">
                                    {intel.talkingPoints.map((pt, i) => (
                                      <li key={i} className="flex items-start gap-2">
                                        <span className="h-4 w-4 rounded bg-primary/10 text-primary text-[9px] font-black flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                                        <p className="text-xs text-foreground leading-snug">{pt}</p>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Objection handling */}
                              {intel.likelyObjection && (
                                <div className="px-4 py-3 space-y-2">
                                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" /> Likely Objection
                                  </p>
                                  <div className="bg-orange-500/5 border border-orange-500/15 rounded-lg p-2.5">
                                    <p className="text-[11px] text-orange-700 dark:text-orange-400 font-medium italic">"{intel.likelyObjection}"</p>
                                  </div>
                                  {intel.objectionResponse && (
                                    <div className="bg-green-500/5 border border-green-500/15 rounded-lg p-2.5">
                                      <p className="text-[11px] text-green-700 dark:text-green-400 font-medium">↳ {intel.objectionResponse}</p>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Next Best Action */}
                              {intel.nextBestAction && (
                                <div className="px-4 py-3 flex items-start gap-2 bg-primary/5">
                                  <Lightbulb className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-0.5">Next Best Action</p>
                                    <p className="text-xs text-foreground font-semibold leading-snug">{intel.nextBestAction}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {/* ── Section: Outreach Message ── */}
                      <div className="px-5 pt-3 pb-5">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Outreach Message</p>
                          <button
                            onClick={() => copyField('message', editedMessage)}
                            disabled={!editedMessage}
                            className="text-[11px] font-semibold text-primary flex items-center gap-1 hover:underline disabled:opacity-40 cursor-pointer"
                          >
                            {copied === 'message' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            {copied === 'message' ? 'Copied!' : 'Copy Message'}
                          </button>
                        </div>
                        <div className="border border-card-border rounded-lg overflow-hidden">
                          <textarea
                            value={editedMessage}
                            onChange={e => setEditedMessage(e.target.value)}
                            className="w-full h-36 p-4 bg-background text-xs font-mono leading-relaxed outline-none focus:ring-1 focus:ring-primary text-foreground resize-none"
                            placeholder="AI-generated outreach message appears here..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-5 py-4 border-t border-card-border bg-card">
                      <div className="flex flex-wrap items-center gap-2">

                        {/* WhatsApp */}
                        {activeLead.business.phone && (
                          <a
                            href={`https://wa.me/${activeLead.business.phone.replace(/\D/g, '')}?text=${encodeURIComponent(editedMessage)}`}
                            target="_blank"
                            onClick={() => handleDispatch(activeLead.id)}
                            className="h-8 px-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2 text-xs font-semibold text-green-600 hover:bg-green-500/20 transition-all cursor-pointer"
                          >
                            <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
                          </a>
                        )}

                        {/* Send Email via Resend */}
                        {activeLead.business.email && (
                          <button
                            onClick={() => handleEmailDispatch(activeLead.id)}
                            disabled={sendingEmail}
                            className={`h-8 px-3 rounded-lg border flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                              emailResult === 'sent'
                                ? 'bg-green-500/10 border-green-500/20 text-green-600'
                                : emailResult === 'failed'
                                ? 'bg-red-500/10 border-red-500/20 text-red-500'
                                : 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20'
                            }`}
                          >
                            {sendingEmail ? (
                              <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Sending...</>
                            ) : emailResult === 'sent' ? (
                              <><Check className="h-3.5 w-3.5" /> Email Sent!</>
                            ) : emailResult === 'failed' ? (
                              <><Mail className="h-3.5 w-3.5" /> Send Failed</>  
                            ) : (
                              <><Send className="h-3.5 w-3.5" /> Send Email
                              <span className="px-1 py-0.5 rounded text-[9px] font-bold bg-primary/20">via Resend</span></>
                            )}
                          </button>
                        )}

                        {/* mailto fallback */}
                        {activeLead.business.email && (
                          <a
                            href={`mailto:${activeLead.business.email}?subject=${encodeURIComponent('Quick question')}&body=${encodeURIComponent(editedMessage)}`}
                            target="_blank"
                            className="h-8 px-3 rounded-lg bg-background border border-card-border flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-card-hover-border transition-all cursor-pointer"
                            title="Open in your local email client"
                          >
                            <ExternalLink className="h-3.5 w-3.5" /> Open in Mail
                          </a>
                        )}

                        {/* Mark dispatched */}
                        {activeLead.status !== 'CONTACTED' && (
                          <button onClick={() => handleDispatch(activeLead.id, true)}
                            className="ml-auto h-8 px-4 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-hover shadow-sm transition-all cursor-pointer"
                          >
                            Confirm Contacted
                          </button>
                        )}
                        {activeLead.status === 'CONTACTED' && (
                          <span className="ml-auto px-3 py-1.5 rounded-lg bg-green-500/10 text-green-600 text-xs font-bold flex items-center gap-1">
                            <Check className="h-3 w-3" /> Contacted
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center my-auto space-y-4 py-16 px-6">
                    <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-primary" />
                    </div>
                    <div className="space-y-2 max-w-xs">
                      <h4 className="text-sm font-bold text-foreground">Select a lead to view details</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Click any lead on the left to see all contact info, AI intelligence, and the outreach message — with one-click copy on every field.
                      </p>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>

      </div>

      <AnimatePresence>
        {showIntelModal && activeLead && (
          <motion.div
            className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowIntelModal(false)}
          >
            <motion.div
              className="w-full max-w-3xl max-h-[86vh] overflow-hidden rounded-2xl bg-card shadow-2xl flex flex-col"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="px-6 py-5 border-b border-card-border flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5" /> AI Sales Explainer
                  </p>
                  <h3 className="text-xl font-bold text-foreground tracking-tight truncate mt-1">{activeLead.business.name}</h3>
                  <p className="text-xs text-muted-foreground font-medium mt-1">
                    {activeCampaign?.name || "Campaign"} {activeCampaign?.productName ? `-> ${activeCampaign.productName}` : ""} {activeCampaign?.outreachTone ? `-> ${activeCampaign.outreachTone.toLowerCase()} tone` : ""}
                  </p>
                </div>
                <button
                  onClick={() => setShowIntelModal(false)}
                  className="h-9 w-9 rounded-lg bg-background hover:bg-foreground/5 text-muted-foreground hover:text-foreground flex items-center justify-center shrink-0"
                  aria-label="Close AI sales explainer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="overflow-y-auto scrollbar-neural p-6">
                {loadingIntel ? (
                  <div className="space-y-4">
                    <div className="h-24 rounded-xl bg-background animate-pulse" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="h-28 rounded-xl bg-background animate-pulse" />
                      <div className="h-28 rounded-xl bg-background animate-pulse" />
                    </div>
                    <p className="text-xs text-muted-foreground font-medium text-center">AI is building the sale path...</p>
                  </div>
                ) : intelError ? (
                  <div className="rounded-xl bg-red-500/10 p-5 flex items-start gap-3 text-red-500">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <div>
                      <p className="text-sm font-bold">Analysis failed</p>
                      <p className="text-xs font-medium mt-1">{intelError}</p>
                      <button
                        onClick={() => fetchIntel(activeLead.id)}
                        className="mt-4 h-9 px-4 rounded-lg bg-red-500 text-white text-xs font-bold inline-flex items-center gap-2"
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> Retry
                      </button>
                    </div>
                  </div>
                ) : intel ? (
                  <div className="space-y-4">
                    <div className="rounded-xl bg-background p-5 flex items-start gap-4">
                      <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <span className="text-lg font-black">{intel.opportunityScore}</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest">What this lead is</p>
                        <p className="text-sm text-foreground/90 font-medium leading-relaxed mt-1">{intel.summary}</p>
                        {intel.urgencySignal && (
                          <p className="text-xs text-amber-500 font-semibold leading-relaxed mt-3 flex gap-2">
                            <Zap className="h-3.5 w-3.5 shrink-0 mt-0.5" /> {intel.urgencySignal}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-xl bg-background p-5">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                          <Target className="h-3.5 w-3.5" /> Why it matches
                        </p>
                        <p className="text-sm text-foreground/85 font-medium leading-relaxed mt-2">{intel.whyThisLead}</p>
                      </div>
                      <div className="rounded-xl bg-primary/5 p-5">
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                          <Send className="h-3.5 w-3.5" /> How to make it a sale
                        </p>
                        <p className="text-sm text-foreground font-semibold leading-relaxed mt-2">{intel.salesApproach}</p>
                      </div>
                    </div>

                    {intel.talkingPoints.length > 0 && (
                      <div className="rounded-xl bg-background p-5">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-3">
                          <TrendingUp className="h-3.5 w-3.5" /> Talking points
                        </p>
                        <div className="space-y-2">
                          {intel.talkingPoints.map((point, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <span className="h-5 w-5 rounded bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">{index + 1}</span>
                              <p className="text-sm text-foreground/85 leading-relaxed">{point}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(intel.likelyObjection || intel.nextBestAction) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {intel.likelyObjection && (
                          <div className="rounded-xl bg-orange-500/5 p-5">
                            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-2">
                              <AlertCircle className="h-3.5 w-3.5" /> Likely objection
                            </p>
                            <p className="text-sm text-foreground/85 italic leading-relaxed mt-2">"{intel.likelyObjection}"</p>
                            {intel.objectionResponse && (
                              <p className="text-xs text-green-500 font-semibold leading-relaxed mt-3">{intel.objectionResponse}</p>
                            )}
                          </div>
                        )}
                        {intel.nextBestAction && (
                          <div className="rounded-xl bg-primary/5 p-5">
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                              <Lightbulb className="h-3.5 w-3.5" /> Next best action
                            </p>
                            <p className="text-sm text-foreground font-semibold leading-relaxed mt-2">{intel.nextBestAction}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---- Clean Ultra-Thin Master Row ----
interface ThinLeadRowProps {
  lead: Lead;
  isSelected: boolean;
  onSelect: () => void;
}

function ThinLeadRow({ lead, isSelected, onSelect }: ThinLeadRowProps) {
  const isContacted = lead.status === 'CONTACTED';
  const isRouteOpened = lead.status === 'CONTACT_ROUTE_OPENED';
  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer rounded-lg p-3 border text-left transition-all duration-200 flex items-center justify-between gap-3 ${
        isSelected 
          ? "bg-primary/10 border-primary shadow-sm" 
          : "bg-background border-card-border hover:border-card-hover-border hover:bg-card/50"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Tiny industry icon */}
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border ${
          isSelected ? "bg-primary/20 border-primary/30" : "bg-card border-card-border"
        }`}>
          <Building2 className={`h-4 w-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
        </div>
        <div className="min-w-0">
          <p className={`text-sm font-semibold leading-tight truncate ${isSelected ? "text-primary font-bold" : "text-foreground"}`}>
            {lead.business.name}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {lead.industry}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {lead.business.phone && (
          <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-semibold shrink-0">
            CELL
          </span>
        )}
        {lead.business.email && (
          <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-semibold shrink-0">
            SMTP
          </span>
        )}
        {!lead.business.phone && !lead.business.email && lead.business.contactStatus && (
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0 ${contactStatusClass(lead.business.contactStatus)}`}>
            {lead.business.bestContactChannel === 'social_profile' ? 'SOCIAL' : lead.business.bestContactChannel === 'contact_page' ? 'PAGE' : 'WEB'}
          </span>
        )}
        {isContacted && (
          <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-600 text-[10px] font-semibold shrink-0">
            SENT
          </span>
        )}
        {isRouteOpened && (
          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 text-[10px] font-semibold shrink-0">
            OPENED
          </span>
        )}
      </div>
    </div>
  );
}
