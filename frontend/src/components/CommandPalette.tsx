"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Command, Target, MessageSquare, Settings, Zap, History, X, User, LayoutDashboard, ChevronRight, SearchX, Heart, Home, Compass, Shield } from "lucide-react";
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
      const data = await authJson<any>(`/api/search?q=${val}`).catch(() => ({ leads: [], campaigns: [] }));
      const formatted = [
        ...(data.campaigns || []).map((c: any) => ({ ...c, type: 'Discovery Hub', icon: Compass })),
        ...(data.leads || []).map((l: any) => ({ ...l, name: l.business?.name, type: 'Lead Collection', icon: Shield }))
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
              className="absolute inset-0 bg-black/40 backdrop-blur-xl"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              className="relative w-full max-w-2xl bg-[#0a0a0b]/80 border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_50px_-12px_rgba(59,130,246,0.25)] backdrop-blur-2xl"
            >
              <div className="flex items-center px-6 h-16 border-b border-white/5 gap-4">
                <Search className="h-5 w-5 text-primary" />
                <input
                  autoFocus
                  placeholder="Search for discovery hubs, leads, or settings..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-[13px] font-medium text-white placeholder:text-zinc-500"
                />
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-sm bg-white/5 border border-white/5">
                    <span className="text-[9px] font-black text-zinc-500">ESC</span>
                  </div>
                  <button onClick={() => setOpen(false)} className="p-2 hover:bg-white/5 rounded-sm transition-colors text-zinc-500 hover:text-white">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-3 custom-scrollbar">
                {!query && (
                  <div className="p-3 space-y-4">
                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] px-2">Quick Navigation</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { name: "Home Dashboard", href: "/dashboard", icon: Home },
                        { name: "Discovery Hubs", href: "/campaigns", icon: Compass },
                        { name: "Lead Collection", href: "/leads", icon: Shield },
                        { name: "Growth Plan", href: "/billing", icon: Zap },
                        { name: "My Profile", href: "/profile", icon: User },
                        { name: "Settings", href: "/settings", icon: Settings },
                      ].map((item) => (
                        <button
                          key={item.href}
                          onClick={() => navigate(item.href)}
                          className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-white/5 transition-all text-zinc-400 hover:text-white group"
                        >
                          <item.icon className="h-4 w-4 text-zinc-500 group-hover:text-primary transition-colors" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{item.name}</span>
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
                        onClick={() => navigate(res.type === 'Discovery Hub' ? `/campaigns` : `/leads`)}
                        className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-primary/5 border border-transparent hover:border-primary/10 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <res.icon className="h-4 w-4 text-zinc-500 group-hover:text-primary" />
                          </div>
                          <div className="text-left">
                            <p className="text-[13px] font-bold text-white tracking-tight">{res.name}</p>
                            <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.15em] mt-0.5">{res.type}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-zinc-700 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                )}

                {query && results.length === 0 && !loading && (
                  <div className="py-20 text-center space-y-3 opacity-60">
                    <div className="h-12 w-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                      <SearchX className="h-6 w-6 text-zinc-500" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">No results found for your search</p>
                    <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Try searching for a hub name or business category</p>
                  </div>
                )}
              </div>

              <div className="p-5 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
                <div className="flex gap-6">
                  <div className="flex items-center gap-2 text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                    <div className="h-4 w-4 rounded-sm bg-white/5 flex items-center justify-center text-[8px] font-mono">↵</div> Open
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                    <div className="h-4 w-4 rounded-sm bg-white/5 flex items-center justify-center text-[8px] font-mono">↑↓</div> Navigate
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">HyprLead Assist</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
