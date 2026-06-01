"use client";

import { useEffect, useState, useMemo } from "react";
import {
  ExternalLink, MessageSquare, Filter, FileDown, Phone, Globe, Calendar, Building2, Check, Trash2, 
  ShieldCheck, Shield, ChevronDown, ChevronUp, Zap, Search, RefreshCw, BarChart3, Users, Mail, MapPin, 
  Brain, Send, Copy, ArrowUpRight
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

// Group leads by calendar day, then by sweep within that day
function groupLeadsByDayAndSweep(leads: Lead[]) {
  const dayMap: Record<string, { date: string; sweeps: Record<string, { sweepId: string; time: string; leads: Lead[] }> }> = {};

  for (const lead of leads) {
    const d = new Date(lead.sweepDate || lead.createdAt);
    const dayKey = d.toISOString().slice(0, 10); // YYYY-MM-DD
    const sweepKey = lead.sweepId || "legacy";

    if (!dayMap[dayKey]) dayMap[dayKey] = { date: d.toISOString(), sweeps: {} };
    if (!dayMap[dayKey].sweeps[sweepKey]) {
      dayMap[dayKey].sweeps[sweepKey] = { sweepId: sweepKey, time: d.toISOString(), leads: [] };
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

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, totalPages: 1, totalLeads: 0 });
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [activeTab, setActiveTab] = useState<"timeline" | "all">("timeline");
  const [stats, setStats] = useState<any>(null);

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
        setEditedMessage(fetchedLeads[0].suggestedMessage || "");
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
      setEditedMessage(found.suggestedMessage);
    }
    return found;
  }, [leads, selectedLeadId]);

  const selectLead = (lead: Lead) => {
    setSelectedLeadId(lead.id);
    setEditedMessage(lead.suggestedMessage || "");
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

  const handleDispatch = async (id: string) => {
    try {
      const result = await authJson<{ emailSent: boolean, whatsappUrl: string, mailtoUrl: string }>(`/api/leads/${id}/dispatch`, { 
        method: "POST",
        body: JSON.stringify({ customMessage: editedMessage })
      });
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status: 'CONTACTED' as any } : l));
      if (result.whatsappUrl) window.open(result.whatsappUrl, '_blank');
      else if (result.mailtoUrl) window.open(result.mailtoUrl, '_blank');
    } catch (err: any) {
      alert("Failed to dispatch: " + (err.message || "Unknown error"));
    }
  };

  const copyIntel = async () => {
    if (!activeLead) return;
    const text = `Business: ${activeLead.business.name}\nIndustry: ${activeLead.industry}\nOpportunity: ${activeLead.painPoint}\n\nSuggested Message:\n${editedMessage}`;
    await navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

        {/* Dense Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-3 border-b border-card-border pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
              <ShieldCheck className="h-4 w-4" /> Dedicated Outreach Intelligence
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Outbound Command Center</h1>
            <p className="text-[10px] font-black text-foreground/50 uppercase tracking-widest">
              {pagination.totalLeads} total active opportunities · grouped by dynamic sweep cycles
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Refresh */}
            <button
              onClick={() => fetchData(true)}
              className="h-9 w-9 rounded-full bg-card border border-card-border flex items-center justify-center hover:border-primary/20 hover:text-primary text-foreground transition-all cursor-pointer shadow-sm"
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
              <button
                onClick={() => setShowExportOptions(!showExportOptions)}
                className="h-9 px-4 rounded-full bg-primary text-white font-black text-[10px] uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 shadow-md cursor-pointer border border-primary/10"
              >
                <FileDown className="h-3.5 w-3.5" /> Export
              </button>
              <AnimatePresence>
                {showExportOptions && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                    className="absolute right-0 mt-2 w-44 bg-card border border-card-border rounded-2xl overflow-hidden z-50 shadow-lg"
                  >
                    {["CSV", "Excel", "JSON"].map(f => (
                      <button key={f} onClick={() => exportLeads(f.toLowerCase())}
                        className="w-full px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-foreground hover:bg-card-border transition-colors border-b border-card-border last:border-0 cursor-pointer"
                      >Export as {f}</button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mini Stats Grid (Compact) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Leads", value: pagination.totalLeads, icon: Users },
            { label: "Today", value: stats?.leadsToday || 0, icon: Zap },
            { label: "Sweep Cycles", value: totalSweeps, icon: RefreshCw },
            { label: "Days Active", value: dayGroups.length, icon: Calendar },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-card border border-card-border rounded-2xl p-4 flex items-center gap-4 shadow-sm">
              <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-[9px] font-black text-foreground/50 uppercase tracking-widest">{label}</p>
                <p className="text-xl font-extrabold text-foreground tracking-tight">
                  <AnimatedNumber value={value} />
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Dedicated B2B Leads Master-Detail Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Master Leads Panel (Scrollable ultra-thin cards) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            
            {/* Search and Filters Hub */}
            <div className="bg-card border border-card-border p-4 rounded-2xl space-y-3 shadow-sm">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground opacity-40 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Scrape search filter..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full h-9 bg-background border border-card-border rounded-full pl-10 pr-4 text-xs font-medium outline-none transition-all text-foreground placeholder:text-foreground/40"
                />
              </div>

              {/* Layout view tabs */}
              <div className="flex gap-1 p-0.5 bg-background border border-card-border rounded-full w-full">
                {[
                  { id: "timeline", label: "Cycle Timeline", icon: Calendar },
                  { id: "all", label: "Raw Intelligence", icon: BarChart3 },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as any)}
                    className={`flex-1 h-7 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      activeTab === id ? "bg-primary text-white shadow-sm border border-primary/20" : "text-foreground hover:bg-card-border"
                    }`}
                  >
                    <Icon className="h-3 w-3" /> {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Leads List scroll view - Dense and Compact */}
            <div className="bg-card border border-card-border rounded-3xl p-3 shadow-sm h-[580px] overflow-y-auto scrollbar-neural">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  <div className="space-y-2 p-2">
                    {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-10 rounded-full bg-background" />)}
                  </div>
                ) : dayGroups.length === 0 ? (
                  <EmptyState title="No Scrapes Logged" description="Initiate geographical sweep sweeps to capture targets." />
                ) : activeTab === "timeline" ? (
                  // Dense Cycle groups timeline
                  dayGroups.map((day, di) => (
                    <div key={day.dayKey} className="space-y-2 mb-4">
                      {/* Tight Day Separator */}
                      <button
                        onClick={() => toggleDay(day.dayKey)}
                        className="w-full flex items-center gap-2 group py-1"
                      >
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary shrink-0">{formatDay(day.date)}</span>
                        <div className="h-[1px] flex-1 bg-card-border group-hover:bg-primary/20 transition-colors" />
                        <span className="text-[8px] font-black text-foreground/40 shrink-0">
                          {day.total} leads
                        </span>
                        {expandedDays.has(day.dayKey) ? <ChevronUp className="h-3 w-3 text-foreground/45" /> : <ChevronDown className="h-3 w-3 text-foreground/45" />}
                      </button>

                      {expandedDays.has(day.dayKey) && day.sweeps.map((sweep, si) => (
                        <div key={sweep.sweepId} className="space-y-1.5 ml-2 pl-2 border-l border-card-border">
                          {/* Mini Cycle Marker */}
                          <div className="flex items-center gap-1.5 py-0.5 opacity-55 text-[8px] font-black uppercase tracking-wider text-foreground">
                            <Zap className="h-2.5 w-2.5 text-primary" /> Cycle {sweep.leads.length} · {formatTime(sweep.time)}
                          </div>

                          {/* Dense Capsule Rows */}
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
                  <div className="space-y-1 p-1">
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
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 px-4 rounded-full bg-card border border-card-border text-[9px] font-black uppercase tracking-widest text-foreground hover:border-primary/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
                >
                  Prev
                </button>
                <span className="text-[9px] font-black text-foreground/45 uppercase tracking-widest">
                  {page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="h-8 px-4 rounded-full bg-card border border-card-border text-[9px] font-black uppercase tracking-widest text-foreground hover:border-primary/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Right Detail Leads Panel (Dossier detail page) */}
          <div className="lg:col-span-7">
            <div className="sticky top-28 self-start bg-card border border-card-border rounded-3xl p-6 shadow-md min-h-[580px] flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[60px] pointer-events-none" />

              <AnimatePresence mode="wait">
                {activeLead ? (
                  <motion.div
                    key={activeLead.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6 flex-1 flex flex-col justify-between"
                  >
                    {/* Header profile details */}
                    <div className="space-y-4">
                      <div className="flex items-start justify-between border-b border-card-border pb-4">
                        <div className="space-y-1 min-w-0 pr-4">
                          <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[8px] font-black uppercase tracking-widest">
                            {activeLead.industry}
                          </span>
                          <h2 className="text-xl font-extrabold text-foreground tracking-tight truncate mt-1.5">{activeLead.business.name}</h2>
                          {activeLead.business.website ? (
                            <a 
                              href={activeLead.business.website} 
                              target="_blank" 
                              className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:underline w-fit"
                            >
                              <Globe className="h-3 w-3" /> {activeLead.business.website.replace(/https?:\/\/(www\.)?/, "")} <ArrowUpRight className="h-2.5 w-2.5" />
                            </a>
                          ) : (
                            <span className="text-[9px] font-black text-foreground/40 uppercase tracking-widest flex items-center gap-1">
                              <Globe className="h-3 w-3" /> No website mapped
                            </span>
                          )}
                        </div>

                        {/* Top action: delete lead */}
                        <button
                          onClick={() => handleDelete(activeLead.id)}
                          className="h-8 w-8 rounded-full bg-red-500/5 hover:bg-red-500/20 text-red-550 border border-red-500/10 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </button>
                      </div>

                      {/* Location and Campaign info */}
                      <div className="grid grid-cols-2 gap-4 bg-background/50 border border-card-border p-3.5 rounded-2xl text-xs font-semibold">
                        <div className="space-y-1">
                          <p className="text-[8px] font-black text-foreground/50 uppercase tracking-widest flex items-center gap-1"><MapPin className="h-3 w-3" /> Geo Location</p>
                          <p className="text-foreground truncate">{activeLead.business.email || activeLead.business.website || "Verified Hub Profile"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[8px] font-black text-foreground/50 uppercase tracking-widest flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Capture Status</p>
                          <p className="text-foreground truncate uppercase text-[9px] tracking-wider font-extrabold">
                            {activeLead.status === "CONTACTED" ? "✓ Contacted Dispatch" : "● Discovery Active"}
                          </p>
                        </div>
                      </div>

                      {/* Pain Point Matrix */}
                      <div className="space-y-2">
                        <span className="text-[9px] font-black text-foreground/60 uppercase tracking-widest flex items-center gap-1">
                          <Brain className="h-3.5 w-3.5 text-primary" /> HyprLead AI Pain-Point Vector
                        </span>
                        <p className="text-xs text-foreground/90 leading-relaxed bg-primary/5 border border-primary/10 p-4 rounded-2xl shadow-sm">
                          {activeLead.painPoint}
                        </p>
                      </div>

                      {/* Contact Channel verification logs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div className="p-3 bg-background border border-card-border rounded-xl flex items-center justify-between gap-2 shadow-sm">
                          <div className="flex items-center gap-2 min-w-0">
                            <Mail className="h-4 w-4 text-primary shrink-0" />
                            <div className="min-w-0">
                              <p className="text-[8px] font-black text-foreground/50 uppercase tracking-widest">Business Email</p>
                              <p className="text-[10px] font-bold text-foreground font-mono truncate">{activeLead.business.email || "Missing"}</p>
                            </div>
                          </div>
                          {activeLead.business.email ? (
                            <span className="px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-[8px] font-black uppercase tracking-widest shrink-0 animate-pulse">SMTP OK</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-card-border text-foreground/40 text-[8px] font-black uppercase tracking-widest shrink-0">NONE</span>
                          )}
                        </div>

                        <div className="p-3 bg-background border border-card-border rounded-xl flex items-center justify-between gap-2 shadow-sm">
                          <div className="flex items-center gap-2 min-w-0">
                            <Phone className="h-4 w-4 text-primary shrink-0" />
                            <div className="min-w-0">
                              <p className="text-[8px] font-black text-foreground/50 uppercase tracking-widest">Phone Mapped</p>
                              <p className="text-[10px] font-bold text-foreground font-mono truncate">{activeLead.business.phone || "Missing"}</p>
                            </div>
                          </div>
                          {activeLead.business.phone ? (
                            <span className="px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-[8px] font-black uppercase tracking-widest shrink-0">CELL OK</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-card-border text-foreground/40 text-[8px] font-black uppercase tracking-widest shrink-0">NONE</span>
                          )}
                        </div>
                      </div>

                      {/* Interactive Outreach Editor */}
                      <div className="space-y-2 pt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-foreground/60 uppercase tracking-widest flex items-center gap-1">
                            <Send className="h-3 w-3 text-primary" /> Active Outreach Dispatch Editor
                          </span>
                          <button
                            onClick={copyIntel}
                            className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            {copied ? "Copied" : "Copy Dossier"}
                          </button>
                        </div>
                        <textarea
                          value={editedMessage}
                          onChange={e => setEditedMessage(e.target.value)}
                          className="w-full h-32 p-4 bg-background border border-card-border rounded-2xl text-xs font-mono leading-relaxed outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground resize-none"
                          placeholder="Suggested message goes here..."
                        />
                      </div>
                    </div>

                    {/* Footer dispatches */}
                    <div className="pt-4 border-t border-card-border flex flex-wrap items-center justify-between gap-4 mt-6">
                      <div className="flex items-center gap-2">
                        {activeLead.business.phone && (
                          <a
                            href={`https://wa.me/${activeLead.business.phone.replace(/\D/g, '')}?text=${encodeURIComponent(editedMessage)}`}
                            target="_blank"
                            onClick={() => handleDispatch(activeLead.id)}
                            className="h-9 px-4 rounded-full bg-green-500/10 border border-green-500/20 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-green-500 hover:bg-green-500/20 transition-all cursor-pointer"
                          >
                            <MessageSquare className="h-3.5 w-3.5" /> WhatsApp Dispatch
                          </a>
                        )}
                        {activeLead.business.email && (
                          <a
                            href={`mailto:${activeLead.business.email}?subject=${encodeURIComponent('Strategic Growth Opportunity')}&body=${encodeURIComponent(editedMessage)}`}
                            target="_blank"
                            onClick={() => handleDispatch(activeLead.id)}
                            className="h-9 px-4 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-blue-500 hover:bg-blue-500/20 transition-all cursor-pointer"
                          >
                            <Mail className="h-3.5 w-3.5" /> Email Dispatch
                          </a>
                        )}
                      </div>

                      {activeLead.status !== "CONTACTED" && (
                        <button
                          onClick={() => handleDispatch(activeLead.id)}
                          className="h-9 px-6 rounded-full bg-primary text-white text-[9px] font-black uppercase tracking-widest hover:brightness-110 shadow-md shadow-primary/10 transition-all cursor-pointer border border-primary/20"
                        >
                          Mark as Dispatched
                        </button>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  // Default Radar showcase when no lead is selected
                  <div className="h-full flex flex-col items-center justify-center text-center my-auto space-y-6 py-12">
                    <div className="h-20 w-20 rounded-full border border-dashed border-primary/30 flex items-center justify-center relative animate-pulse">
                      <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/10 animate-spin-slow" />
                      <Building2 className="h-8 w-8 text-primary" />
                    </div>
                    <div className="space-y-2 max-w-sm">
                      <h4 className="text-md font-extrabold text-foreground">Outreach Dossier Active</h4>
                      <p className="text-xs text-foreground/60 leading-relaxed font-semibold">
                        Select an ultra-thin pipeline lead on the left to extract their HyprLead AI pain-point vector, view verified MX records, and trigger outbound communications.
                      </p>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

// ---- Dense Ultra-Thin Master Row ----
interface ThinLeadRowProps {
  lead: Lead;
  isSelected: boolean;
  onSelect: () => void;
}

function ThinLeadRow({ lead, isSelected, onSelect }: ThinLeadRowProps) {
  const isContacted = lead.status === 'CONTACTED';
  return (
    <motion.div
      onClick={onSelect}
      className={`cursor-pointer rounded-full p-2.5 px-4 border text-left transition-all duration-200 flex items-center justify-between gap-3 ${
        isSelected 
          ? "bg-primary/10 border-primary shadow-sm" 
          : "bg-background border-card-border hover:border-primary/20 hover:bg-card-border/30"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Tiny industry icon */}
        <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 border ${
          isSelected ? "bg-primary/20 border-primary/35" : "bg-card border-card-border"
        }`}>
          <Building2 className={`h-3.5 w-3.5 ${isSelected ? "text-primary" : "text-foreground opacity-60"}`} />
        </div>
        <div className="min-w-0">
          <p className={`text-xs font-bold leading-tight truncate ${isSelected ? "text-primary font-extrabold" : "text-foreground"}`}>
            {lead.business.name}
          </p>
          <p className="text-[8px] text-foreground/45 font-black uppercase tracking-wider truncate">
            {lead.industry}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {lead.business.phone && (
          <span className="px-1.5 py-0.5 rounded-full bg-primary/15 border border-primary/20 text-primary text-[7px] font-black uppercase tracking-widest shrink-0 animate-pulse">
            CELL
          </span>
        )}
        {lead.business.email && (
          <span className="px-1.5 py-0.5 rounded-full bg-primary/15 border border-primary/20 text-primary text-[7px] font-black uppercase tracking-widest shrink-0">
            SMTP
          </span>
        )}
        {isContacted && (
          <span className="px-1.5 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-[7px] font-black uppercase tracking-widest shrink-0">
            SENT
          </span>
        )}
      </div>
    </motion.div>
  );
}
