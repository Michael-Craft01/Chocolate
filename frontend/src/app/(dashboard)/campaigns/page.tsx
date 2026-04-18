"use client";

import { useState, useEffect } from "react";
import { Plus, Target, MapPin, Briefcase, Play, Pause, Trash2 } from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { Skeleton, CardSkeleton } from "@/components/skeleton";
import { EmptyState } from "@/components/empty-state";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchCampaigns = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      const res = await fetch("http://localhost:3000/api/campaigns", {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      const data = await res.json();
      setCampaigns(data || []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch campaigns", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const toggleStatus = async (id: string, currentStatus: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const nextStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    await fetch(`http://localhost:3000/api/campaigns/${id}/status`, {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ status: nextStatus })
    });
    fetchCampaigns();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Campaign Manager</h1>
          <p className="text-zinc-400 text-sm">Orchestrate and monitor your automated lead engines.</p>
        </div>
        <button 
          onClick={() => router.push("/campaigns/new")}
          className="flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Create Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : campaigns.length === 0 ? (
          <div className="lg:col-span-2">
            <EmptyState 
              title="No campaigns yet"
              description="Your specialized lead generation engines will appear here. Start by creating your first campaign to begin capturing high-value leads."
              actionText="Create Campaign"
              onAction={() => router.push("/campaigns/new")}
            />
          </div>
        ) : campaigns.map((c) => (
          <div key={c.id} className="glass rounded-2xl p-6 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all">
            <div className={`absolute top-0 right-0 h-1.5 w-24 ${c.status === 'ACTIVE' ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-zinc-700'}`} />
            
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">{c.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`h-1.5 w-1.5 rounded-full ${c.status === 'ACTIVE' ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{c.status}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => toggleStatus(c.id, c.status)}
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-all active:scale-90"
                >
                  {c.status === 'ACTIVE' ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </button>
                <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/[0.03] hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-all active:scale-90">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-8">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5">
                <Briefcase className="h-4 w-4 text-zinc-500" />
                <span className="text-zinc-300 font-medium truncate">{c.industries.join(", ")}</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5">
                <MapPin className="h-4 w-4 text-zinc-500" />
                <span className="text-zinc-300 font-medium truncate">{c.locations.join(", ")}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-white/5">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Intelligence Found</span>
                <span className="text-2xl font-black text-white">{c._count?.leads || 0}</span>
              </div>
              <button className="h-9 px-4 rounded-lg bg-zinc-800 text-[11px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">
                Campaign Settings
              </button>
            </div>
          </div>
        ))}
      </div>

    </motion.div>
  );
}
