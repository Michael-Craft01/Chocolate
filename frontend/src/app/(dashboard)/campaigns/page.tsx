"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, Play, Pause, Trash2, Zap, Loader2, 
  Settings, RefreshCw, Search, ArrowRight, Info
} from "lucide-react";
import { useRouter } from "next/navigation";
import { authJson } from "@/lib/api";
import { fetchCampaigns as fetchCampaignList, updateCampaignStatus, deleteCampaign } from "@/lib/services/campaigns";
import { runCampaignCycle } from "@/lib/services/cycles";
import type { Campaign } from "@/lib/types";
import { toast } from "sonner";
import { 
  Sheet, 
  SheetTrigger, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyCampaignId, setBusyCampaignId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | Campaign["status"]>("ALL");
  const [triggering, setTriggering] = useState<string | null>(null);
  const [briefs, setBriefs] = useState<Record<string, string>>({});
  const [loadingBrief, setLoadingBrief] = useState<string | null>(null);

  const fetchBrief = async (id: string) => {
    if (briefs[id] || loadingBrief === id) return;
    setLoadingBrief(id);
    try {
      const { brief } = await authJson<{ brief: string }>(`/api/campaigns/${id}/brief`);
      setBriefs(prev => ({ ...prev, [id]: brief }));
    } catch (err) {
      console.error("Failed to fetch brief:", err);
    } finally {
      setLoadingBrief(null);
    }
  };

  const fetchCampaigns = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await fetchCampaignList();
      setCampaigns(data || []);
    } catch (err: any) {
      console.error("Failed to fetch campaigns", err);
      toast.error("Failed to retrieve campaigns.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const toggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    setBusyCampaignId(id);
    try {
      await updateCampaignStatus(id, nextStatus as any);
      toast.success(`Campaign ${nextStatus === 'PAUSED' ? 'paused' : 'resumed'}.`);
      fetchCampaigns(true);
    } catch (err: any) {
      toast.error("Failed to update status.");
    } finally {
      setBusyCampaignId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete campaign "${name}" and all associated data?`)) return;
    setBusyCampaignId(id);
    try {
      await deleteCampaign(id);
      toast.success("Campaign deleted.");
      fetchCampaigns(true);
    } catch (err: any) {
      toast.error("Failed to delete campaign.");
    } finally {
      setBusyCampaignId(null);
    }
  };

  const handleRunCycle = async (id: string) => {
    setTriggering(id);
    try {
      await runCampaignCycle(id);
      toast.success("Discovery sweep queued.");
      fetchCampaigns(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to trigger search.");
    } finally {
      setTriggering(null);
    }
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    const query = searchQuery.toLowerCase().trim();
    const searchMatch = !query || campaign.name.toLowerCase().includes(query);
    const statusMatch = statusFilter === "ALL" || campaign.status === statusFilter;
    return searchMatch && statusMatch;
  });

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Campaigns</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage search parameters, target locations, and lead discovery cycles.
          </p>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={() => fetchCampaigns(false)}
            disabled={loading}
            className="h-9 px-3 rounded-md border border-border bg-background hover:bg-muted text-xs font-medium text-foreground flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/campaigns/new"
            className="h-9 px-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Campaign</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-md border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="flex items-center gap-1 self-start sm:self-auto border border-border rounded-md p-0.5 bg-muted/40">
          {(["ALL", "ACTIVE", "PAUSED"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`h-7 px-3 rounded text-xs font-medium transition-colors ${
                statusFilter === filter 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {filter.charAt(0) + filter.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-lg border border-border bg-card animate-pulse" />
            ))}
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="py-12 text-center rounded-lg border border-dashed border-border bg-card/50 space-y-3">
            <p className="text-sm font-medium text-foreground">No campaigns found.</p>
            <p className="text-xs text-muted-foreground">Create a campaign to define target industries and locations.</p>
            <div>
              <Link
                href="/campaigns/new"
                className="inline-flex h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium items-center gap-1.5 hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> New Campaign
              </Link>
            </div>
          </div>
        ) : (
          filteredCampaigns.map((c) => (
            <div 
              key={c.id}
              className="rounded-lg border border-border bg-card p-5 space-y-4 hover:border-foreground/40 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-foreground truncate">{c.name}</h2>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${
                      c.status === 'ACTIVE' 
                        ? 'border-border bg-muted text-foreground' 
                        : 'border-border text-muted-foreground'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {c.industries.join(", ") || "General"} • {c.locations.join(", ") || "All Locations"}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleRunCycle(c.id)}
                    disabled={triggering === c.id || c.status !== 'ACTIVE'}
                    className="h-8 px-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {triggering === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
                    <span>Run Search</span>
                  </button>

                  <button
                    onClick={() => toggleStatus(c.id, c.status)}
                    disabled={busyCampaignId === c.id}
                    className="h-8 w-8 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                    title={c.status === 'ACTIVE' ? "Pause campaign" : "Resume campaign"}
                  >
                    {c.status === 'ACTIVE' ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  </button>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => router.push(`/campaigns/${c.id}/edit`)}
                    className="h-8 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    <Settings className="h-3.5 w-3.5" />
                  </Button>

                  <Sheet>
                    <SheetTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => fetchBrief(c.id)}
                        className="h-8 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                        title="View Strategy"
                      >
                        <Info className="h-3.5 w-3.5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="w-full sm:max-w-md border-l border-border bg-background p-6">
                      <SheetHeader className="border-b border-border pb-4">
                        <SheetTitle className="text-base font-semibold">{c.name}</SheetTitle>
                        <SheetDescription className="text-xs text-muted-foreground">
                          Target parameters and AI discovery profile.
                        </SheetDescription>
                      </SheetHeader>
                      <ScrollArea className="py-4 space-y-4">
                        <div className="space-y-3 text-xs">
                          <div>
                            <span className="font-medium text-foreground">Target Sectors:</span>
                            <p className="text-muted-foreground mt-0.5">{c.industries.join(", ") || "General"}</p>
                          </div>
                          <div>
                            <span className="font-medium text-foreground">Target Geography:</span>
                            <p className="text-muted-foreground mt-0.5">{c.locations.join(", ") || "Worldwide"}</p>
                          </div>
                          {briefs[c.id] && (
                            <div>
                              <span className="font-medium text-foreground">AI Strategy Brief:</span>
                              <p className="text-muted-foreground mt-0.5 leading-relaxed">{briefs[c.id]}</p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </SheetContent>
                  </Sheet>

                  <button
                    onClick={() => handleDelete(c.id, c.name)}
                    disabled={busyCampaignId === c.id}
                    className="h-8 w-8 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                    title="Delete Campaign"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
                <span>Leads Discovered: <strong className="text-foreground font-semibold">{c._count?.leads || 0}</strong></span>
                <Link 
                  href={`/leads?campaignId=${c.id}`}
                  className="hover:text-foreground flex items-center gap-1 font-medium transition-colors"
                >
                  View leads <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
