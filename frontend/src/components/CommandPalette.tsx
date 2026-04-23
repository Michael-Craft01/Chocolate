"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Command, Target, MessageSquare, Settings, Zap, History, X, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { authJson } from "@/lib/api";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const search = useCallback(async (val: string) => {
    if (!val) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      // Mocking or fetching quick results
      const data = await authJson<any>(`/api/search?q=${val}`).catch(() => ({ leads: [], campaigns: [] }));
      const formatted = [
        ...(data.campaigns || []).map((c: any) => ({ ...c, type: 'engine', icon: Target })),
        ...(data.leads || []).map((l: any) => ({ ...l, name: l.business?.name, type: 'intelligence', icon: MessageSquare }))
      ];
      setResults(formatted.slice(0, 8));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  const navigate = (href: string) => {
    router.push(href);
    setOpen(false);
    setQuery("");
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-2xl glass border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-primary/20"
            >
              <div className="flex items-center px-6 h-16 border-b border-white/5 gap-4">
                <Search className="h-5 w-5 text-zinc-500" />
                <input
                  autoFocus
                  placeholder="Execute neural command or search telemetry..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-white placeholder:text-zinc-600"
                />
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 bg-white/5 px-2 py-1 rounded-md">ESC</span>
                  <button onClick={() => setOpen(false)}>
                    <X className="h-4 w-4 text-zinc-600 hover:text-white transition-colors" />
                  </button>
                </div>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
                {!query && (
                  <div className="p-4 space-y-4">
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] px-2">Navigation Nodes</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { name: "Control Center", href: "/dashboard", icon: LayoutDashboard },
                        { name: "Engine Clusters", href: "/campaigns", icon: Target },
                        { name: "Intelligence Feed", href: "/leads", icon: MessageSquare },
                        { name: "Neural Scaling", href: "/billing", icon: Zap },
                        { name: "Calibration", href: "/settings", icon: Settings },
                      ].map((item) => (
                        <button
                          key={item.href}
                          onClick={() => navigate(item.href)}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all text-zinc-400 hover:text-white group"
                        >
                          <item.icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                          <span className="text-[11px] font-bold uppercase tracking-widest">{item.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {query && results.length > 0 && (
                  <div className="p-2 space-y-1">
                    {results.map((res) => (
                      <button
                        key={res.id}
                        onClick={() => navigate(res.type === 'engine' ? `/campaigns` : `/leads`)}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-primary/10 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <res.icon className="h-4 w-4 text-zinc-500 group-hover:text-primary" />
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-bold text-white tracking-tight">{res.name}</p>
                            <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">{res.type}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-3 w-3 text-zinc-700 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                )}

                {query && results.length === 0 && !loading && (
                  <div className="p-12 text-center space-y-2 opacity-50">
                    <Radar className="h-8 w-8 mx-auto text-zinc-600 animate-pulse" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Zero matches in current neural sector</p>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5 text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                    <Command className="h-3 w-3" /> Execute
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                    <History className="h-3 w-3" /> History
                  </div>
                </div>
                <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Neural Link v4.6.0</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// Helper icons that were missing in import
import { LayoutDashboard, ChevronRight, Radar } from "lucide-react";
