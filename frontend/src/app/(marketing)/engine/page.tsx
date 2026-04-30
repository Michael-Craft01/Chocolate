"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Brain, Cpu, Search, MessageSquare, Zap, Globe, Shield, Activity, Network, Database, Fingerprint, Command, ArrowRight, PlayCircle } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { AuroraBackground } from "@/components/ui/aurora-background";

export default function EnginePage() {
  return (
    <div className="bg-[#050505] min-h-screen">
      <Navbar />

      <section className="relative pt-48 pb-20 overflow-hidden">
        <AuroraBackground className="!h-auto pb-20">
          <div className="max-w-7xl mx-auto px-6 text-center z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
                 <Cpu className="h-4 w-4 text-primary" />
                 <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Neural Architecture v2.4</span>
              </div>
              <h1 className="text-5xl md:text-8xl font-black tracking-tightest text-white uppercase leading-none">
                Autonomous <br /> <span className="text-zinc-600">Discovery Engine.</span>
              </h1>
              <p className="text-zinc-500 max-w-xl mx-auto font-medium">Deep dive into the infrastructure powering the world's most aggressive lead generation system.</p>
            </motion.div>

            {/* Neural Map Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-32 relative max-w-5xl mx-auto h-[500px] glass rounded-sm border border-white/5 overflow-hidden group"
            >
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                     {[...Array(4)].map((_, i) => (
                       <motion.div 
                          key={i}
                          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                          transition={{ duration: 15 + i * 5, repeat: Infinity, ease: "linear" }}
                          className={`absolute -inset-${(i + 1) * 12} rounded-full border border-primary/${5 + i * 10} ${i % 2 === 0 ? 'border-dashed' : ''}`}
                       />
                     ))}
                     <div className="relative h-32 w-32 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center orange-glow">
                        <Brain className="h-12 w-12 text-primary" />
                     </div>
                  </div>
               </div>
               
               {/* Floating Data Points */}
               {[
                 { x: '10%', y: '20%', label: 'SCAN_INIT' },
                 { x: '80%', y: '15%', label: 'NEURAL_EXTRACT' },
                 { x: '75%', y: '75%', label: 'PAIN_IDENTIFY' },
                 { x: '15%', y: '80%', label: 'DISPATCH_SYNC' },
               ].map((point, i) => (
                 <motion.div 
                    key={i}
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
                    className="absolute p-3 glass rounded-sm border-primary/20 space-y-1"
                    style={{ left: point.x, top: point.y }}
                 >
                    <div className="h-1 w-8 bg-primary/40 rounded-full" />
                    <p className="text-[8px] font-black text-white uppercase tracking-widest">{point.label}</p>
                 </motion.div>
               ))}
            </motion.div>
          </div>
        </AuroraBackground>
      </section>

      {/* The 4 Core Protocols */}
      <section className="py-40 max-w-7xl mx-auto px-6">
         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
               { icon: Search, title: "Deep Scrape", desc: "Our engine scans local maps, social signals, and public registries to find active businesses.", color: "text-blue-500" },
               { icon: Brain, title: "Neural Analysis", desc: "AI models analyze business data to detect inefficiencies and specific service needs.", color: "text-primary" },
               { icon: MessageSquare, title: "Smart Outreach", desc: "Context-aware scripts are generated for every lead, tailored to their exact pain points.", color: "text-emerald-500" },
               { icon: Activity, title: "Auto-Cycles", desc: "The engine runs 24/7 in 12-hour intervals, delivering fresh targets to your dashboard.", color: "text-purple-500" },
            ].map((step, i) => (
               <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-10 glass rounded-sm border border-white/5 space-y-6 hover:bg-white/[0.02] transition-all"
               >
                  <div className={`h-12 w-12 rounded-sm bg-white/5 flex items-center justify-center ${step.color}`}>
                     <step.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">{step.title}</h3>
                  <p className="text-zinc-500 text-xs leading-relaxed font-medium">{step.desc}</p>
               </motion.div>
            ))}
         </div>
      </section>

      {/* Extreme Detail: Technical Stack */}
      <section className="py-40 bg-white/[0.01] border-y border-white/5">
         <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-24 items-center">
            <div className="space-y-12">
               <div className="space-y-4">
                  <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tightest">Technical <br /> <span className="text-primary">Infrastucture.</span></h2>
                  <p className="text-zinc-500 font-medium leading-relaxed">Built for speed, reliability, and extreme market coverage. No proxies, no CAPTCHAs, no limits.</p>
               </div>
               
               <div className="space-y-8">
                  {[
                     { title: "Distributed Web-Crawling", val: "High-density scraping across global nodes." },
                     { title: "Gemma-4 Neural Core", val: "Elite business analysis and logic extraction." },
                     { title: "Real-time Telemetry", val: "Instant data sync between engine and UI." },
                  ].map((tech, i) => (
                     <div key={i} className="flex gap-6">
                        <div className="h-1 w-8 bg-primary mt-3 shrink-0" />
                        <div>
                           <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">{tech.title}</p>
                           <p className="text-xs text-zinc-600 font-medium">{tech.val}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               {[Database, Network, Fingerprint, Command, Shield, Globe].map((Icon, i) => (
                  <div key={i} className="aspect-square glass rounded-sm border border-white/5 flex flex-col items-center justify-center gap-4 group hover:bg-primary/5 hover:border-primary/20 transition-all">
                     <Icon className="h-8 w-8 text-zinc-800 group-hover:text-primary transition-colors" />
                     <span className="text-[8px] font-black text-zinc-900 uppercase tracking-widest group-hover:text-zinc-500 transition-colors">Component {i + 101}</span>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 text-center max-w-4xl mx-auto px-6">
         <div className="space-y-10">
            <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tightest leading-none">Ready to deploy <br /> <span className="text-primary">your engine?</span></h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
               <Link href="/login" className="h-16 px-12 rounded-sm bg-primary text-white font-black text-[12px] uppercase tracking-widest hover:bg-primary-hover transition-all flex items-center gap-3">
                  Initialize Mainframe
                  <ArrowRight className="h-5 w-5" />
               </Link>
               <Link href="/pricing" className="h-16 px-12 rounded-sm bg-white/5 border border-white/10 text-white font-black text-[12px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3">
                  View Subscriptions
               </Link>
            </div>
         </div>
      </section>

      <Footer />
    </div>
  );
}
