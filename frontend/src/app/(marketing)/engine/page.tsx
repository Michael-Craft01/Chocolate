"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Brain, Cpu, Search, MessageSquare, Zap, Globe, Shield, Activity, Network, Database, Fingerprint, Command, ArrowRight, PlayCircle, Layers, Server } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const NeuralDiscoveryHUD = () => {
  const [query, setQuery] = useState("Scraping New York...");
  const [leads, setLeads] = useState<string[]>([]);
  
  useEffect(() => {
    const queries = [
      "Targeting: SaaS Founders in SF",
      "Analyzing: Retailers in London",
      "Scanning: Medical Clinics NYC",
      "Discovery: Law Firms Dubai",
      "Extraction: Real Estate TX"
    ];
    
    const leadNames = ["Stellar Tech", "Apex Dental", "Green Leaf", "Cloud Nine", "River Legal", "Skyline Real Estate"];
    
    let i = 0;
    const interval = setInterval(() => {
      setQuery(queries[i % queries.length]);
      setLeads(prev => [leadNames[Math.floor(Math.random() * leadNames.length)], ...prev.slice(0, 4)]);
      i++;
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center">
       {/* Central Neural Hub */}
       <div className="relative z-10 flex flex-col items-center">
          <motion.div 
            animate={{ 
              boxShadow: ["0 0 20px rgba(16,185,129,0.1)", "0 0 60px rgba(16,185,129,0.3)", "0 0 20px rgba(16,185,129,0.1)"] 
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="h-64 w-64 rounded-full border border-primary/30 flex items-center justify-center relative bg-black/40 backdrop-blur-2xl"
          >
             <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/10 animate-spin-slow" />
             <div className="text-center space-y-2">
                <Search className="h-8 w-8 text-primary mx-auto animate-pulse" />
                <div className="text-2xl font-black text-white tracking-tighter">SEARCH</div>
                <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] animate-pulse">Scanning Web</div>
             </div>
          </motion.div>

          {/* Floating Query Bar */}
          <motion.div 
            key={query}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 px-6 py-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-4 min-w-[300px]"
          >
             <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
             <span className="text-xs font-bold text-zinc-400 font-mono tracking-tight">{query}</span>
          </motion.div>
       </div>

       {/* Lead Extraction Feed */}
       <div className="absolute right-10 top-1/2 -translate-y-1/2 w-48 space-y-3">
          <AnimatePresence mode="popLayout">
            {leads.map((lead, i) => (
              <motion.div
                key={`${lead}-${i}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1 - i * 0.2, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-3 rounded-lg bg-white/5 border border-white/5 flex items-center gap-3"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">{lead}</span>
              </motion.div>
            ))}
          </AnimatePresence>
       </div>

       {/* Satellite Modules */}
       {[
         { icon: Globe, label: "PROXY_MESH", x: '15%', y: '20%' },
         { icon: Shield, label: "STEALTH_LOCK", x: '85%', y: '15%' },
         { icon: Brain, label: "AI_ENRICH", x: '20%', y: '80%' },
         { icon: Activity, label: "LIVE_SYNC", x: '80%', y: '85%' },
       ].map((module, i) => (
         <motion.div
            key={i}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
            className="absolute p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center gap-2 backdrop-blur-md"
            style={{ left: module.x, top: module.y }}
         >
            <module.icon className="h-4 w-4 text-zinc-500" />
            <span className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.2em]">{module.label}</span>
         </motion.div>
       ))}
    </div>
  );
};

export default function EnginePage() {
  return (
    <div className="bg-black min-h-screen selection:bg-primary/30">
      <Navbar />

      {/* Background Depth */}
      <div className="bg-blob bg-blue top-[10%] left-[20%] opacity-10" />
      <div className="bg-blob bg-primary bottom-[20%] right-[10%] opacity-10" />

      <section className="relative pt-48 pb-32 overflow-hidden px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-4">
               <Server className="h-4 w-4 text-primary" />
               <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">System Architecture v2.4</span>
            </div>
            <h1 className="text-display">
              Automated <br /> <span className="text-zinc-700">Discovery Engine.</span>
            </h1>
            <p className="readable max-w-xl mx-auto">The high-performance infrastructure powering every lead you discover. Designed for speed, verification, and absolute market coverage.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-20 relative max-w-5xl mx-auto rounded-[3rem] glass-morphism overflow-hidden border border-white/10 bg-white/[0.01]"
          >
             <div className="absolute inset-0 bg-grid opacity-10" />
             <NeuralDiscoveryHUD />
          </motion.div>
        </div>
      </section>

      {/* The 4 Operational Phases */}
      <section className="py-40 max-w-7xl mx-auto px-6">
         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
               { icon: Search, title: "Deep Scan Discovery", desc: "Engine iterates through Google Maps API with high-frequency pagination to find fresh, active businesses.", color: "text-blue-500" },
               { icon: Brain, title: "Neural Pain Analysis", desc: "Proprietary AI models analyze business websites and categories to pinpoint technical and operational friction.", color: "text-primary" },
               { icon: Shield, title: "Stealth Extraction", desc: "Multi-layered proxy mesh and fingerprint bypasses allow the engine to crawl sites without being detected or blocked.", color: "text-emerald-500" },
               { icon: Zap, title: "Instant Dispatch", desc: "Verified leads are instantly pushed to your dashboard with pre-written, high-conversion outreach scripts.", color: "text-purple-500" },
            ].map((phase, i) => (
               <motion.div 
                  key={i}
                  whileHover={{ y: -5 }}
                  className="p-10 bento-card space-y-6 group"
               >
                  <div className={`h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center transition-all group-hover:scale-110 ${phase.color}`}>
                     <phase.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">{phase.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed font-medium">{phase.desc}</p>
               </motion.div>
            ))}
         </div>
      </section>

      {/* Technical Infrastructure Block */}
      <section className="py-40 border-y border-white/5 bg-white/[0.01] relative overflow-hidden">
         <div className="absolute inset-0 bg-grid opacity-5" />
         <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-24 items-center relative z-10">
            <div className="space-y-12">
               <div className="space-y-4">
                  <h2 className="text-5xl font-bold text-white leading-tight">Operational <br /> <span className="text-primary">Infrastructure.</span></h2>
                  <p className="readable">Industrial-grade stability for global lead discovery. Built to scale from 100 to 100,000+ leads without performance degradation.</p>
               </div>
               
               <div className="space-y-10">
                  {[
                     { title: "Distributed Discovery", val: "High-density scraping across secure global nodes." },
                     { title: "Neural Logic Core", val: "Elite lead analysis using Gemini 1.5 Pro business logic extraction." },
                     { title: "Zero-Latency Sync", val: "Real-time data synchronization between the discovery engine and your UI." },
                  ].map((tech, i) => (
                     <div key={i} className="flex gap-6 group">
                        <div className="h-1.5 w-10 bg-primary mt-2.5 shrink-0 rounded-full group-hover:w-16 transition-all" />
                        <div>
                           <p className="text-[11px] font-bold text-white uppercase tracking-widest mb-1">{tech.title}</p>
                           <p className="text-sm text-zinc-500 font-medium">{tech.val}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
               {[
                 { icon: Database, label: "Lead Vault", tech: "Uptime: 99.99%", log: "> sync: encrypted" },
                 { icon: Network, label: "Proxy Mesh", tech: "Latency: <12ms", log: "> node: global" },
                 { icon: Fingerprint, label: "Bypass Core", tech: "Success: 100%", log: "> auth: stealth" },
                 { icon: Command, label: "Command UI", tech: "Refresh: 24hz", log: "> ui: reactive" },
                 { icon: Shield, label: "Security Layer", tech: "AES-256-GCM", log: "> vault: locked" },
                 { icon: Globe, label: "Geo-Matrix", tech: "Coverage: Global", log: "> region: all" }
               ].map((module, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ scale: 1.02 }}
                    className="aspect-square rounded-[2rem] bg-white/[0.01] border border-white/5 p-8 flex flex-col items-center justify-center gap-6 group hover:border-primary/20 transition-all relative overflow-hidden"
                  >
                     {/* Background Glow */}
                     <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                     
                     <module.icon className="h-10 w-10 text-zinc-800 group-hover:text-primary transition-all duration-500 group-hover:scale-110" />
                     
                     <div className="text-center space-y-1 relative z-10">
                        <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest block group-hover:text-primary transition-colors">Module {i + 101}</span>
                        <span className="text-[9px] font-black text-white uppercase tracking-widest block">{module.label}</span>
                     </div>

                     {/* Technical Specs (Always visible) */}
                     <div className="text-[8px] font-black text-zinc-800 uppercase tracking-[0.2em] mt-2 group-hover:text-zinc-600 transition-colors">
                        {module.tech}
                     </div>

                     {/* Terminal Log (Reveal on hover) */}
                     <div className="absolute bottom-4 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                        <span className="text-[7px] font-mono text-primary/60 font-bold tracking-tighter">
                           {module.log}
                        </span>
                     </div>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* Deployment Section */}
      <section className="py-40 px-6">
         <div className="max-w-4xl mx-auto glass-panel p-20 rounded-[3rem] text-center space-y-12 border-white/5">
            <h2 className="text-display !text-6xl">Ready to <br /> <span className="text-primary">deploy?</span></h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
               <Link href="/signup" className="btn-pill-white h-16 px-12 text-lg">
                  Get Started Now
                  <ArrowRight className="h-5 w-5" />
               </Link>
               <Link href="/pricing" className="btn-pill-glass h-16 px-12 text-lg">
                  View Plans
               </Link>
            </div>
         </div>
      </section>

      <Footer />
    </div>
  );
}
