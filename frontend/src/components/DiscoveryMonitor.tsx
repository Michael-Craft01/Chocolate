"use client";

import { useEffect, useState } from "react";
import { Terminal, Shield, CheckCircle2, Play, Circle, Cpu } from "lucide-react";
import { motion } from "framer-motion";

interface LogEntry {
  timestamp: string;
  type: "info" | "success" | "warning" | "engine";
  message: string;
}

const mockLogs: LogEntry[] = [
  { timestamp: "00:00:01", type: "engine", message: "Discovery Engine core initialized." },
  { timestamp: "00:00:02", type: "info", message: "Connecting to Supabase production cluster..." },
  { timestamp: "00:00:04", type: "success", message: "Supabase connection verified. 0ms latency." },
  { timestamp: "00:00:05", type: "info", message: "Loading target queries and location indexes..." },
  { timestamp: "00:00:07", type: "engine", message: "Playwright stealth extraction agent ready." },
  { timestamp: "06:00:00", type: "engine", message: "Scheduled 6-hour sweep sequence started." },
  { timestamp: "06:00:15", type: "info", message: "Playwright: Querying search locations..." },
  { timestamp: "06:00:45", type: "info", message: "Cheerio: Parsing DOM maps and indexing web nodes..." },
  { timestamp: "06:01:10", type: "success", message: "Scraped 48 business listings in target areas." },
  { timestamp: "06:01:12", type: "info", message: "AI Enrichment: Dispatching context tokens to HyprLead AI..." },
  { timestamp: "06:01:25", type: "success", message: "HyprLead AI: 42 businesses verified and classified successfully." },
  { timestamp: "06:01:28", type: "info", message: "Generating hyper-personalized outreach copywriting..." },
  { timestamp: "06:01:40", type: "success", message: "Outbound copy ready. Deduping entries against lead registry." },
  { timestamp: "06:01:42", type: "success", message: "Dispatched verified leads to Discord channels successfully." },
  { timestamp: "06:01:45", type: "engine", message: "Sweep complete. Next cycle scheduled." }
];

export function DiscoveryMonitor() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Prime the system with initial logs
    setLogs(mockLogs.slice(0, 5));
    setCurrentIndex(5);
  }, []);

  useEffect(() => {
    if (currentIndex >= mockLogs.length) return;

    // Simulate real-time logs coming in
    const interval = setTimeout(() => {
      setLogs((prev) => [...prev.slice(-8), mockLogs[currentIndex]]); // keep last 9 entries
      setCurrentIndex((prev) => prev + 1);
    }, 4000);

    return () => clearTimeout(interval);
  }, [currentIndex]);

  return (
    <div className="relative h-full w-full flex flex-col justify-between overflow-hidden bg-card p-6 font-mono text-zinc-400 select-none">
      {/* Console Header */}
      <div className="flex items-center justify-between border-b border-border-muted pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <Terminal className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">System Telemetry Log</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-[9px] font-bold text-emerald-400 uppercase tracking-widest border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </div>
          <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
            Scan Interval: 12h
          </div>
        </div>
      </div>

      {/* Log Feed */}
      <div className="flex-1 space-y-2 overflow-y-auto scrollbar-neural pr-2 text-[11px] leading-relaxed">
        {logs.map((log, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-start gap-4 hover:bg-foreground/[0.01] py-1 px-2 rounded transition-all"
          >
            <span className="text-zinc-500 shrink-0 select-none font-semibold">[{log.timestamp}]</span>
            <span className="shrink-0 select-none font-bold">
              {log.type === "engine" && <Cpu className="h-3 w-3 text-blue-500" />}
              {log.type === "success" && <CheckCircle2 className="h-3 w-3 text-primary" />}
              {log.type === "info" && <Circle className="h-1.5 w-1.5 mt-1.5 text-zinc-550 fill-zinc-500" />}
              {log.type === "warning" && <Shield className="h-3 w-3 text-orange-500" />}
            </span>
            <span className={`flex-1 font-medium ${
              log.type === "engine" ? "text-blue-500" :
              log.type === "success" ? "text-emerald-500" :
              log.type === "warning" ? "text-amber-500" : "text-zinc-500 dark:text-zinc-300"
            }`}>
              {log.message}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Console Footer Status */}
      <div className="mt-4 pt-4 border-t border-border-muted flex flex-wrap items-center justify-between gap-4 text-[9px] font-bold uppercase tracking-widest text-zinc-500 select-none">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 font-black">Playwright Driver:</span>
          <span className="text-zinc-300">v1.58.0 (Chromium headless)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 font-black">AI Orchestration:</span>
          <span className="text-zinc-300">HyprLead AI</span>
        </div>
      </div>
    </div>
  );
}
