"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Brain, Cpu, Search, MessageSquare, Zap, Globe, Shield, Activity, Network, Database, Fingerprint, Command, ArrowRight, PlayCircle, Layers, Server } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

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

          {/* Interactive Interface Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-32 relative max-w-5xl mx-auto h-[600px] rounded-[2rem] glass-morphism overflow-hidden group border-white/10"
          >
             <div className="absolute inset-0 bg-grid opacity-20" />
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                   {[...Array(4)].map((_, i) => (
                     <motion.div 
                        key={i}
                        animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                        transition={{ duration: 20 + i * 5, repeat: Infinity, ease: "linear" }}
                        className={`absolute -inset-${(i + 1) * 16} rounded-full border border-primary/${10 + i * 10} ${i % 2 === 0 ? 'border-dashed' : ''}`}
                     />
                   ))}
                   <div className="relative h-48 w-48 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center orange-glow">
                      <div className="text-center">
                         <div className="text-3xl font-bold text-white mb-1">SCAN</div>
                         <div className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Processing</div>
                      </div>
                   </div>
                </div>
             </div>
             
             {/* Dynamic Status Tags */}
             {[
               { x: '10%', y: '15%', label: 'ENGINE_START' },
               { x: '85%', y: '20%', label: 'DATA_EXTRACT' },
               { x: '80%', y: '80%', label: 'VALIDATION_SYNC' },
               { x: '15%', y: '85%', label: 'LEAD_ENRICH' },
             ].map((point, i) => (
               <motion.div 
                  key={i}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
                  className="absolute p-4 glass-panel rounded-2xl border-white/10 space-y-2 backdrop-blur-3xl"
                  style={{ left: point.x, top: point.y }}
               >
                  <div className="h-1 w-10 bg-primary/60 rounded-full" />
                  <p className="text-[10px] font-bold text-white uppercase tracking-widest">{point.label}</p>
               </motion.div>
             ))}
          </motion.div>
        </div>
      </section>

      {/* The 4 Operational Phases */}
      <section className="py-40 max-w-7xl mx-auto px-6">
         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
               { icon: Search, title: "Discovery", desc: "Our engine scans local maps, social signals, and public registries to find active businesses.", color: "text-blue-500" },
               { icon: Brain, title: "Analysis", desc: "AI models analyze business data to detect inefficiencies and specific service needs.", color: "text-primary" },
               { icon: MessageSquare, title: "Generation", desc: "Professional, context-aware scripts are generated for every lead, tailored to their needs.", color: "text-emerald-500" },
               { icon: Activity, title: "Persistence", desc: "The engine runs continuously in 12-hour cycles, delivering fresh targets to your dashboard.", color: "text-purple-500" },
            ].map((phase, i) => (
               <motion.div 
                  key={i}
                  whileHover={{ y: -5 }}
                  className="p-10 bento-card space-y-6"
               >
                  <div className={`h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center ${phase.color}`}>
                     <phase.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">{phase.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed font-medium">{phase.desc}</p>
               </motion.div>
            ))}
         </div>
      </section>

      {/* Technical Infrastructure Block */}
      <section className="py-40 border-y border-white/5 bg-white/[0.01]">
         <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-24 items-center">
            <div className="space-y-12">
               <div className="space-y-4">
                  <h2 className="text-5xl font-bold text-white leading-tight">Operational <br /> <span className="text-primary">Infrastructure.</span></h2>
                  <p className="readable">Built for speed, reliability, and absolute market coverage. No proxies, no limits, just direct access to opportunities.</p>
               </div>
               
               <div className="space-y-10">
                  {[
                     { title: "Distributed Discovery", val: "High-density scraping across secure global nodes." },
                     { title: "Advanced AI Core", val: "Elite lead analysis and business logic extraction." },
                     { title: "Real-time Dashboard", val: "Instant data synchronization between the engine and your UI." },
                  ].map((tech, i) => (
                     <div key={i} className="flex gap-6">
                        <div className="h-1.5 w-10 bg-primary mt-2.5 shrink-0 rounded-full" />
                        <div>
                           <p className="text-[11px] font-bold text-white uppercase tracking-widest mb-1">{tech.title}</p>
                           <p className="text-sm text-zinc-500 font-medium">{tech.val}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
               {[Database, Network, Fingerprint, Command, Shield, Globe].map((Icon, i) => (
                  <div key={i} className="aspect-square bento-card flex flex-col items-center justify-center gap-6 group hover:border-primary/20">
                     <Icon className="h-10 w-10 text-zinc-800 group-hover:text-primary transition-colors" />
                     <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest group-hover:text-zinc-400">Module {i + 101}</span>
                  </div>
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
