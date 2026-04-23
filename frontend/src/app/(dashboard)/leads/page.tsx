"use client";

import { useEffect, useState } from "react";
import { 
  Search, 
  ExternalLink, 
  MessageSquare, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Target,
  Loader2,
  FileDown,
  Phone,
  Globe,
  Zap,
  Calendar,
  Building2,
  MapPin,
  CheckCircle2,
  Copy,
  Trash2,
  Pencil,
  Check,
  X,
  AlertCircle,
  Clock,
  ArrowRight,
  BrainCircuit,
  Sparkles,
  Command,
  Activity,
  Home,
  UserCheck,
  Heart,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/skeleton";
import { EmptyState } from "@/components/empty-state";
import { authJson } from "@/lib/api";
import type { Lead, PaginationMeta, Campaign } from "@/lib/types";
import { fetchLeads as fetchLeadList, updateLeadStatus } from "@/lib/services/leads";
import { fetchCampaigns } from "@/lib/services/campaigns";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, totalPages: 1, totalLeads: 0 });
  const [showExportOptions, setShowExportOptions] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const campaignFilter = selectedCampaignId === "ALL" ? undefined : selectedCampaignId;
        const [leadsData, campaignsData] = await Promise.all([
          fetchLeadList(page, 100, campaignFilter),
          fetchCampaigns()
        ]);
        setLeads(leadsData.leads || []);
        setCampaigns(campaignsData || []);
        setPagination(leadsData.pagination || { page: 1, totalPages: 1, totalLeads: 0 });
      } catch (err) {
        setError("Unable to connect to your collection. Please check your network.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, selectedCampaignId]);

  const groupedLeads = leads.reduce((acc: any, lead) => {
    const sweepKey = lead.sweepId || "legacy";
    if (!acc[sweepKey]) {
      acc[sweepKey] = {
        id: sweepKey,
        date: lead.sweepDate || lead.createdAt,
        leads: []
      };
    }
    acc[sweepKey].leads.push(lead);
    return acc;
  }, {});

  const sortedGroups = Object.values(groupedLeads).sort((a: any, b: any) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this lead from your collection?")) return;
    try {
      await authJson(`/api/leads/${id}`, { method: 'DELETE' });
      setLeads(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      alert("Failed to remove lead.");
    }
  };

  const copyFullIntel = async (lead: Lead) => {
    const text = `Business: ${lead.business.name}\nIndustry: ${lead.industry}\nOpportunity: ${lead.painPoint}\n\nSuggested Message: ${lead.suggestedMessage}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(lead.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {}
  };

  const exportLeads = (format: string) => {
    const token = localStorage.getItem("token");
    const filter = selectedCampaignId === "ALL" ? "" : `?campaignId=${selectedCampaignId}`;
    const formatParam = `&format=${format}`;
    window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/api/leads/export${filter}${filter ? '&' : '?'}token=${token}${formatParam}`, "_blank");
    setShowExportOptions(false);
  };

  return (
    <div className="min-h-screen pb-40 font-sans">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-sm -translate-y-1/2 translate-x-1/4 animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-violet-500/5 rounded-sm translate-y-1/2 -translate-x-1/4" />
      </div>

      <div className="max-w-6xl mx-auto space-y-10 relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-6 border-b border-white/5 pb-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-[0.3em]">
              <ShieldCheck className="h-4 w-4 glow-primary" /> Security Verified
            </div>
            <h1 className="text-4xl font-black tracking-tightest gradient-text">Lead Collection</h1>
            <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-[0.15em]">A safe place for your high-value business discoveries.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <button 
                onClick={() => setShowExportOptions(!showExportOptions)}
                className="h-12 px-8 rounded-sm bg-white text-black font-black text-[11px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 shadow-white/5"
              >
                <FileDown className="h-4 w-4" /> Export Collection
              </button>
              
              <AnimatePresence>
                {showExportOptions && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 bg-[#0a0a0b] border border-white/10 rounded-sm overflow-hidden z-50 shadow-2xl"
                  >
                    {['CSV', 'Excel', 'JSON'].map((format) => (
                      <button
                        key={format}
                        onClick={() => exportLeads(format.toLowerCase())}
                        className="w-full px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                      >
                        Export as {format}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative group">
              <div className="h-12 px-6 rounded-sm bg-white/[0.03] border border-white/5 flex items-center gap-3 group-hover:border-white/10 transition-all">
                <Filter className="h-4 w-4 text-zinc-500" />
                <select
                  value={selectedCampaignId}
                  onChange={(e) => setSelectedCampaignId(e.target.value)}
                  className="bg-transparent text-[11px] font-black uppercase tracking-widest outline-none cursor-pointer pr-6 appearance-none text-zinc-400 group-hover:text-white transition-colors"
                >
                  <option value="ALL">All Discovery Zones</option>
                  {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronRight className="h-3.5 w-3.5 text-zinc-600 rotate-90" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative group max-w-2xl">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search your collection..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-16 bg-white/[0.03] border border-white/5 rounded-sm pl-16 pr-8 text-sm font-bold uppercase tracking-widest outline-none focus:bg-white/[0.05] focus:border-primary/30 transition-all text-white placeholder:text-zinc-700"
          />
        </div>

        <div className="relative space-y-16 pt-10">
          <div className="absolute left-0 md:left-8 top-0 bottom-0 w-[1px] bg-gradient-to-b from-primary/20 via-white/5 to-transparent" />

          <AnimatePresence mode="popLayout">
            {loading ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-sm ml-0 md:ml-20 bg-white/[0.02]" />)
            ) : sortedGroups.length === 0 ? (
              <EmptyState title="Collection Empty" description="Start a discovery sweep to populate your collection." />
            ) : sortedGroups.map((group: any) => (
              <div key={group.id} className="relative">
                <div className="sticky top-28 z-10 flex items-center gap-6 mb-8 -ml-2 md:-ml-0">
                  <div className="h-12 w-12 rounded-sm bg-background border border-white/5 flex items-center justify-center relative group/node">
                    <div className="absolute inset-0 bg-primary/5 rounded-sm" />
                    <Home className="h-5 w-5 text-primary glow-primary relative z-10" />
                  </div>
                  <div className="glass-card px-5 py-2 rounded-sm border border-white/5 flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">
                      {new Date(group.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <div className="h-3 w-[1px] bg-white/10" />
                    <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                      <span className="text-primary">{group.leads.length}</span> DISCOVERIES
                    </div>
                  </div>
                </div>

                <div className="space-y-3 ml-0 md:ml-20">
                  {group.leads.map((lead: any, idx: number) => (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.03 }}
                      className="group"
                    >
                      <div className={`glass-card rounded-sm border transition-all duration-300 ${expandedId === lead.id ? 'border-primary/30 ring-1 ring-primary/10' : 'border-white/5 hover:border-white/10'}`}>
                        {/* Row Header */}
                        <div 
                          onClick={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
                          className="flex items-center justify-between p-6 cursor-pointer"
                        >
                          <div className="flex items-center gap-6 flex-1">
                            <div className="h-10 w-10 rounded-sm bg-white/[0.02] border border-white/5 flex items-center justify-center group-hover:border-primary/20 transition-colors">
                              <UserCheck className="h-4 w-4 text-zinc-500 group-hover:text-primary transition-colors" />
                            </div>
                            <div className="space-y-1">
                              <h3 className="text-sm font-black tracking-tight text-white group-hover:text-primary transition-colors">{lead.business.name}</h3>
                              <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                                {lead.industry}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-8">
                            <div className="hidden md:flex flex-col items-end gap-1">
                              <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Match Score</span>
                              <div className="flex items-center gap-2">
                                <div className="h-1 w-20 bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-primary" style={{ width: '85%' }} />
                                </div>
                                <span className="text-[10px] font-black text-primary">8.5</span>
                              </div>
                            </div>
                            <div className={`transition-transform duration-300 ${expandedId === lead.id ? 'rotate-180' : ''}`}>
                              <ChevronRight className="h-4 w-4 text-zinc-600 rotate-90" />
                            </div>
                          </div>
                        </div>

                        {/* Expanded Content */}
                        <AnimatePresence>
                          {expandedId === lead.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 pb-8 pt-2 border-t border-white/5 space-y-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                  <div className="space-y-6">
                                    <div className="space-y-2">
                                      <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                                        <Heart className="h-3.5 w-3.5 text-primary" /> The Opportunity
                                      </label>
                                      <p className="text-sm text-zinc-300 leading-relaxed font-medium">{lead.painPoint}</p>
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                                        <MessageSquare className="h-3.5 w-3.5 text-primary" /> Personalized Approach
                                      </label>
                                      <p className="text-sm text-zinc-400 italic leading-relaxed font-medium border-l-2 border-primary/20 pl-4">"{lead.suggestedMessage}"</p>
                                    </div>
                                  </div>

                                  <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="p-4 rounded-sm bg-white/[0.01] border border-white/5">
                                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">Direct Line</p>
                                        <p className="text-xs font-bold text-zinc-300">{lead.business.phone || 'Not available'}</p>
                                      </div>
                                      <div className="p-4 rounded-sm bg-white/[0.01] border border-white/5">
                                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">Digital Home</p>
                                        <p className="text-xs font-bold text-zinc-300 truncate">{lead.business.website?.replace(/https?:\/\//, '') || 'Not available'}</p>
                                      </div>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                      <button 
                                        onClick={() => copyFullIntel(lead)}
                                        className={`flex-1 h-12 rounded-sm font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                                          copiedId === lead.id ? "bg-emerald-500 text-white" : "bg-white text-black hover:bg-zinc-200"
                                        }`}
                                      >
                                        {copiedId === lead.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} 
                                        {copiedId === lead.id ? "Details Saved" : "Save Details"}
                                      </button>
                                      {lead.business.website && (
                                        <a 
                                          href={lead.business.website}
                                          target="_blank"
                                          className="h-12 w-12 rounded-sm bg-white/[0.03] border border-white/5 text-zinc-500 flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all"
                                        >
                                          <Globe className="h-4 w-4" />
                                        </a>
                                      )}
                                      <button 
                                        onClick={() => handleDelete(lead.id)}
                                        className="h-12 w-12 rounded-sm bg-white/[0.03] border border-white/5 text-zinc-600 flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 transition-all"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
