"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Brain, Search, Shield, Zap, Globe, Activity, Server, ArrowRight } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const NeuralDiscoveryHUD = () => {
  const [query, setQuery] = useState("Searching Denver listings...");
  const [leads, setLeads] = useState<string[]>([]);
  
  useEffect(() => {
    const queries = [
      "Searching SaaS Founders in SF",
      "Analyzing Retailers in London",
      "Scanning Medical Clinics in NYC",
      "Searching Law Firms in Dubai",
      "Analyzing Real Estate in Texas"
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
    <div className="relative w-full h-[360px] md:h-[540px] flex items-center justify-center bg-card overflow-hidden">
       {/* Central Neural Hub */}
       <div className="relative z-10 flex flex-col items-center">
          <motion.div 
            animate={{ 
              boxShadow: ["0 0 20px rgba(16,185,129,0.1)", "0 0 60px rgba(16,185,129,0.25)", "0 0 20px rgba(16,185,129,0.1)"] 
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="h-40 w-40 md:h-56 md:w-56 rounded-full border border-primary/30 flex items-center justify-center relative bg-background/50 backdrop-blur-2xl"
          >
             <div className="absolute inset-0 rounded-full border border-dashed border-primary/20 animate-spin-slow" />
             <div className="text-center space-y-2">
                <Search className="h-6 w-6 md:h-8 md:w-8 text-primary mx-auto animate-pulse" />
                <div className="text-base md:text-xl font-extrabold text-foreground tracking-tight">Searching</div>
                <div className="text-[10px] font-bold text-primary animate-pulse">Search network active</div>
             </div>
          </motion.div>
 
          {/* Floating Query Bar */}
          <motion.div 
            key={query}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 md:mt-10 px-4 md:px-5 py-2 md:py-2.5 rounded-full bg-card border border-card-border backdrop-blur-md flex items-center gap-3 min-w-[240px] md:min-w-[280px] shadow-sm"
          >
             <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
             <span className="text-[10px] font-bold text-foreground/80 font-mono tracking-tight">{query}</span>
          </motion.div>
       </div>
 
       {/* Lead Extraction Feed */}
       <div className="absolute right-6 top-1/2 -translate-y-1/2 w-44 space-y-3 hidden lg:block">
          <AnimatePresence mode="popLayout">
            {leads.map((lead, i) => (
              <motion.div
                key={`${lead}-${i}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1 - i * 0.2, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-3 rounded-full bg-card border border-card-border flex items-center gap-3 shadow-sm"
              >
                <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                <span className="text-[10px] font-bold text-foreground truncate">{lead}</span>
              </motion.div>
            ))}
          </AnimatePresence>
       </div>
 
       {/* Satellite Modules */}
       {[
         { icon: Globe, label: "Search Nodes", x: '10%', y: '15%' },
         { icon: Shield, label: "Secure Check", x: '82%', y: '12%' },
         { icon: Brain, label: "AI Analysis", x: '10%', y: '75%' },
         { icon: Activity, label: "Live Sync", x: '78%', y: '78%' },
       ].map((module, i) => (
          <motion.div
             key={i}
             animate={{ y: [0, -8, 0] }}
             transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
             className="absolute p-2.5 rounded-full bg-card border border-card-border flex items-center gap-2 backdrop-blur-md shadow-sm scale-90 md:scale-100"
             style={{ left: module.x, top: module.y }}
          >
             <module.icon className="h-3.5 w-3.5 text-primary" />
             <span className="text-[10px] font-bold text-foreground/60">{module.label}</span>
          </motion.div>
       ))}
    </div>
  );
};

export default function EnginePage() {
  return (
    <div className="bg-background text-foreground min-h-screen selection:bg-primary/30 transition-colors duration-500">
      <Navbar />
 
      <section className="relative pt-32 pb-20 overflow-hidden px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-card border border-card-border mb-2 shadow-sm">
               <Server className="h-4 w-4 text-primary animate-pulse" />
               <span className="text-xs font-bold text-foreground/75">System status: active</span>
            </div>
            <h1 className="text-4xl md:text-display leading-tight">
              Automated <br /> <span className="text-primary">Search Engine.</span>
            </h1>
            <p className="max-w-xl mx-auto text-foreground/80 text-sm font-semibold leading-relaxed px-4">Our background search systems compile fresh local leads. Built for reliability, email verification, and complete regional market coverage.</p>
          </motion.div>
 
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-12 relative max-w-5xl mx-auto rounded-[32px] glass-morphism overflow-hidden border border-card-border"
          >
              <div className="absolute inset-0 bg-grid opacity-10" />
              <NeuralDiscoveryHUD />
          </motion.div>
        </div>
      </section>
 
      {/* The 4 Operational Phases */}
      <section className="py-16 max-w-7xl mx-auto px-6">
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
               { icon: Search, title: "Deep Search Discovery", desc: "Our engine scans registration directories, Google Maps hubs, and websites in parallel to locate fresh businesses.", color: "text-primary" },
               { icon: Brain, title: "AI Challenge Analysis", desc: "Built-in AI model cores analyze target web presence to discover current challenges and operational blocks.", color: "text-primary" },
               { icon: Shield, title: "Email Validation Checks", desc: "Direct connections verify mail server health and email availability to guarantee low bounce rates.", color: "text-primary" },
               { icon: Zap, title: "Personalized Outreach Drafts", desc: "Outreach email drafts addressing actual business challenges are instantly saved to your workspace dashboard.", color: "text-primary" },
            ].map((phase, i) => (
               <motion.div 
                  key={i}
                  whileHover={{ y: -5 }}
                  className="p-8 bento-card space-y-6 group border border-card-border rounded-3xl"
               >
                  <div className={`h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center transition-all group-hover:scale-110 border border-primary/20`}>
                     <phase.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground tracking-tight">{phase.title}</h3>
                  <p className="text-foreground/75 text-xs font-semibold leading-relaxed">{phase.desc}</p>
               </motion.div>
            ))}
         </div>
      </section>
 
      {/* Technical Infrastructure Block */}
      <section className="py-20 border-y border-card-border bg-card/10 relative overflow-hidden">
         <div className="absolute inset-0 bg-grid opacity-10" />
         <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10">
            <div className="space-y-8">
               <div className="space-y-4">
                  <h2 className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight">Operational <br /> <span className="text-primary">Infrastructure.</span></h2>
                  <p className="text-foreground/75 text-xs font-semibold leading-relaxed">High reliability for global lead searches. Built around scheduled search periods that manage resources and protect results.</p>
               </div>
               
               <div className="space-y-8">
                  {[
                     { title: "Smart Lead Searching", val: "Safe search queries running securely through distributed residential networks." },
                     { title: "AI Analysis Core", val: "Advanced semantic processing logic maps target needs precisely." },
                     { title: "Real-Time Dashboard Sync", val: "Search progress and leads sync instantly to your workspace." },
                  ].map((tech, i) => (
                     <div key={i} className="flex gap-6 group">
                        <div className="h-1.5 w-10 bg-primary mt-2 shrink-0 rounded-full group-hover:w-16 transition-all" />
                        <div>
                           <p className="text-xs font-bold text-foreground mb-1">{tech.title}</p>
                           <p className="text-xs text-foreground/75 font-semibold leading-relaxed">{tech.val}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </section>
 
      {/* Deployment Section */}
      <section className="py-20 px-6">
         <div className="max-w-4xl mx-auto glass-morphism p-8 sm:p-16 rounded-[32px] text-center space-y-8 border border-card-border shadow-md">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">Ready to get started?</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
               <Link href="/signup" className="btn-pill-white !bg-primary hover:!bg-primary-hover !text-white h-12 w-full sm:w-auto px-8 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
               </Link>
               <Link href="/pricing" className="h-12 w-full sm:w-auto px-8 rounded-full bg-white/5 flex items-center justify-center gap-2 hover:bg-white/10 text-foreground cursor-pointer text-xs font-bold transition-all active:scale-98">
                  View Plans
               </Link>
            </div>
         </div>
      </section>
 
      <Footer />
    </div>
  );
}
