"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Compass, Shield, Zap, User, Settings, Home, X, ChevronRight, SearchX } from "lucide-react";
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
        ...(data.campaigns || []).filter((c: any) => c.name !== 'Main Engine').map((c: any) => ({ ...c, type: 'Campaign', icon: Compass })),
        ...(data.leads || []).map((l: any) => ({ ...l, name: l.business?.name, type: 'Lead', icon: Shield }))
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
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              className="relative w-full max-w-xl bg-card border border-border rounded-lg overflow-hidden shadow-xl"
            >
              <div className="flex items-center px-4 h-12 border-b border-border gap-3">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  autoFocus
                  placeholder="Type a command or search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
                />
                <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border text-muted-foreground bg-muted">
                  ESC
                </kbd>
                <button onClick={() => setOpen(false)} className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-[50vh] overflow-y-auto p-2 custom-scrollbar">
                {!query && (
                  <div className="p-2 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground px-2">Navigation</p>
                    <div className="space-y-1">
                      {[
                        { name: "Dashboard", href: "/dashboard", icon: Home },
                        { name: "Campaigns", href: "/campaigns", icon: Compass },
                        { name: "Leads", href: "/leads", icon: Shield },
                        { name: "New Campaign", href: "/campaigns/new", icon: Zap },
                        { name: "Profile", href: "/profile", icon: User },
                        { name: "Settings", href: "/settings", icon: Settings },
                      ].map((item) => (
                        <button 
                          key={item.href} 
                          onClick={() => navigate(item.href)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-sm font-medium text-foreground transition-colors cursor-pointer"
                        >
                          <item.icon className="h-4 w-4 text-muted-foreground" />
                          <span>{item.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {query && results.length > 0 && (
                  <div className="space-y-1 p-2">
                    {results.map((res) => (
                      <button 
                        key={res.id} 
                        onClick={() => navigate(res.type === 'Campaign' ? `/campaigns` : `/leads`)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted text-sm transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <res.icon className="h-4 w-4 text-muted-foreground" />
                          <div className="text-left">
                            <p className="font-medium text-foreground">{res.name}</p>
                            <p className="text-xs text-muted-foreground">{res.type}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                )}

                {query && results.length === 0 && !loading && (
                  <div className="py-12 text-center space-y-2">
                    <SearchX className="h-6 w-6 text-muted-foreground mx-auto" />
                    <p className="text-sm font-medium text-foreground">No results found</p>
                    <p className="text-xs text-muted-foreground">Try a different search term.</p>
                  </div>
                )}
              </div>

              <div className="px-4 py-2 border-t border-border bg-muted/40 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Navigate with arrow keys</span>
                <span>Select with Enter</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
