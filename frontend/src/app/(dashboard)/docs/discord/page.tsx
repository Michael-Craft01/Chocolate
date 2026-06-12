"use client";

import { motion } from "framer-motion";
import { 
  Compass, ArrowRight, MessageSquare, ShieldCheck, Copy, 
  ExternalLink, Server, Settings, Zap, Check, AlertCircle 
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

export default function DiscordGuidePage() {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const steps = [
    {
      icon: Server,
      title: "1. Create or Select a Discord Server",
      desc: "Open your Discord client, click the '+' sign in the left sidebar to add a server, or choose an existing server where you have Administrator permissions.",
    },
    {
      icon: Settings,
      title: "2. Configure a Webhook Integration",
      desc: "Open your Discord server settings or right-click the specific text channel where you want leads to be forwarded. Select 'Edit Channel' -> 'Integrations' -> 'Webhooks' and click 'Create Webhook' or 'New Webhook'.",
    },
    {
      icon: Copy,
      title: "3. Copy the Webhook URL",
      desc: "Name your webhook bot (e.g., 'HyprLead Agent') and assign it to the target text channel. Click the 'Copy Webhook URL' button to secure your webhook link.",
    },
    {
      icon: Zap,
      title: "4. Link Webhook to HyprLead",
      desc: "Navigate to your Settings page on HyprLead, locate the 'Integration hook (Discord)' section, paste your webhook URL, and click 'Save Configuration'.",
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-5xl mx-auto space-y-12 pb-20 font-sans px-4 pt-10"
    >
      {/* Header Deck */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-card-border pb-8 text-left">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-primary">
            <ShieldCheck className="h-4 w-4" /> Real-time Telemetry Setup
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">Discord Setup Guide</h1>
          <p className="text-sm md:text-base text-foreground/70">Configure Discord integrations to receive newly extracted B2B leads in real-time with automated outreach shortcuts.</p>
        </div>
        
        <Link href="/settings" className="btn-pill-glass h-10 px-5 flex items-center gap-2 hover:bg-card border border-card-border rounded-full shrink-0">
          <Settings className="h-3.5 w-3.5 text-foreground" />
          <span className="text-xs font-bold text-foreground">Paste Webhook URL</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        
        {/* Step List Card */}
        <div className="lg:col-span-7 space-y-6">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Compass className="h-5 w-5 text-primary" /> How to Setup Webhook Integration
          </h2>
          
          <div className="space-y-4">
            {steps.map((step, idx) => (
              <div key={idx} className="bento-card p-6 flex gap-4 items-start rounded-2xl relative overflow-hidden group">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                  <step.icon size={18} />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-foreground">{step.title}</h3>
                  <p className="text-xs text-foreground opacity-60 leading-relaxed font-semibold">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-sm bg-blue-500/5 border border-blue-500/10 text-blue-700 dark:text-blue-200/80 text-xs flex gap-3">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">
              Keep your Discord Webhook URL private. Anyone with access to the link can send messages to your server.
            </p>
          </div>
        </div>

        {/* Live Client Demonstration Mockup */}
        <div className="lg:col-span-5 space-y-6">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" /> Visual Demonstration
          </h2>

          <div className="rounded-2xl border border-card-border bg-card p-6 shadow-xl space-y-6">
            <div className="flex items-center gap-2 border-b border-card-border pb-4">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold text-foreground opacity-40 uppercase tracking-widest ml-2">Discord Channel Preview</span>
            </div>

            {/* Chat Bubble Container representing Discord client */}
            <div className="bg-zinc-950 text-zinc-300 p-5 rounded-xl font-sans text-xs space-y-4 border border-zinc-900 shadow-inner">
              
              {/* Bot Header */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-white shrink-0">
                  HL
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white">HyprLead Agent</span>
                    <span className="bg-[#5865F2] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide">BOT</span>
                    <span className="text-zinc-500 text-[9px] font-medium">Just Now</span>
                  </div>
                  <p className="text-zinc-300 leading-normal">**Acme Solutions** has been prioritized for extraction. Telemetry follows:</p>
                </div>
              </div>

              {/* Discord Embed Panel */}
              <div className="border-l-4 border-[#8b5cf6] bg-[#2f3136]/30 p-4 rounded-r-md space-y-3 ml-11">
                <p className="font-bold text-[#8b5cf6] text-xs">🟣 INTEL CAPTURE</p>
                <p className="font-bold text-white text-sm">Acme Solutions</p>
                
                <div className="grid grid-cols-2 gap-3 text-[11px] text-zinc-400">
                  <div>
                    <span className="text-zinc-500 block font-bold">Entity</span>
                    <strong className="text-zinc-200">Acme Solutions</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block font-bold">Grid Location</span>
                    <strong className="text-zinc-200">Harare, ZW</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block font-bold">Sector</span>
                    <strong className="text-zinc-200">Retail</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block font-bold">Frequency</span>
                    <strong className="text-zinc-200">+263 77 000 0000</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800 text-[11px] text-zinc-400">
                  <span className="text-zinc-500 block font-bold">Pain Vector</span>
                  <p className="text-zinc-300 italic leading-relaxed">"Manual client scheduling is causing operational delays and lost revenue opportunities."</p>
                </div>

                <div className="text-[11px] text-zinc-400">
                  <span className="text-zinc-500 block font-bold">Registry</span>
                  <strong className="text-zinc-200">sales@acme.com</strong>
                </div>
              </div>

              {/* Bot Suggested Message Embed */}
              <div className="border-l-4 border-[#8b5cf6] bg-[#2f3136]/30 p-4 rounded-r-md ml-11 space-y-1">
                <span className="text-zinc-500 block text-[10px] font-bold uppercase">Suggested Attack Plan</span>
                <pre className="text-[10px] text-zinc-300 bg-zinc-950 p-2.5 rounded-md border border-zinc-900 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {`Hi Team Acme,

Notice you have manual scheduling friction. Hyprlead solves Pos Scheduling autonomously.

Let me know your thoughts.`}
                </pre>
              </div>

              {/* Discord Interactive Button Components row */}
              <div className="flex flex-wrap gap-2 pt-2 ml-11">
                <div className="px-3 py-2 bg-[#248046] hover:bg-[#1a6535] text-white rounded-sm font-semibold text-[11px] flex items-center gap-1.5 cursor-pointer select-none">
                  Contact on WhatsApp
                </div>
                <div className="px-3 py-2 bg-[#4f545c] hover:bg-[#686d73] text-white rounded-sm font-semibold text-[11px] flex items-center gap-1.5 cursor-pointer select-none">
                  Contact via Email
                </div>
                <div className="px-3 py-2 bg-[#4f545c] hover:bg-[#686d73] text-white rounded-sm font-semibold text-[11px] flex items-center gap-1.5 cursor-pointer select-none">
                  Website <ExternalLink size={10} />
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
