"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, ArrowRight, Brain, Cpu, MessageSquare, Check, Sparkles, Search, Heart, Compass, Shield, Home, Layout, Mic, BarChart3, ChevronRight, Globe, Layers, Command, Code2, Database, Network, Fingerprint, ZapOff, Activity, Sliders, PlayCircle, TrendingUp, Users } from "lucide-react";
import { createClient } from "@/lib/supabase";

import Hero from "@/components/landing/Hero";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  const [session, setSession] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  const logos = [
    "LOGOS", "LOOO", "LOGO", "LOGO IPSUM", "LINEAR", "VERCEL", "SUPABASE", "NEXTJS", "PRISMA"
  ];

  return (
    <div className="relative min-h-screen selection:bg-primary/30 font-sans bg-black">
      <Navbar />

      <Hero />

      {/* Testimonials Section (High-Fidelity Social Proof) */}
      <section className="py-32 border-y border-white/5 bg-black/50 backdrop-blur-md relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                <Heart className="h-3 w-3 text-primary" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">User Sentiment</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">Loved by <span className="text-primary">revenue leaders</span></h2>
            </div>
            <p className="text-zinc-500 text-sm font-medium max-w-xs text-left md:text-right">Join 500+ high-growth teams automating their outbound pipeline discovery.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                text: "HyprLead turned our manual 4-hour lead research process into a 10-minute automated sweep. The quality of personalization is unmatched.",
                author: "Sarah Chen",
                role: "Head of Growth",
                company: "ScaleFlow AI"
              },
              {
                text: "The 'Mission Control' dashboard gives us total visibility into our pipeline value. We found 300+ qualified leads in our first week.",
                author: "Jameson Reed",
                role: "VP of Sales",
                company: "NexGen Systems"
              },
              {
                text: "Finally, a lead engine that actually understands business pain points. The outreach it generates feels human, not robotic.",
                author: "Elena Rodriguez",
                role: "Founder",
                company: "Stellar Outbound"
              }
            ].map((t, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="p-8 rounded-[24px] bg-white/[0.02] border border-white/5 flex flex-col justify-between group hover:border-primary/20 transition-all duration-500"
              >
                <div className="space-y-6">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-zinc-300 text-sm leading-relaxed font-medium italic">"{t.text}"</p>
                </div>
                <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-zinc-800 border border-white/10" />
                  <div>
                    <p className="text-xs font-bold text-white">{t.author}</p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{t.role} @ {t.company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Bento Grid Feature Section (Image 3 Inspiration) */}
      <section id="features" className="py-40 max-w-7xl mx-auto px-6">
        <div className="text-center mb-24 space-y-4">
           <h2 className="text-5xl md:text-7xl font-bold tracking-[-0.06em] text-white">Access to the <span className="text-primary">future of sales</span></h2>
           <p className="max-w-2xl mx-auto text-zinc-500 font-medium">Experience AI-driven lead discovery: intelligent automation, seamless verification, and real-time revenue insights for high-performance teams.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[900px]">
          {/* Card 1: Scalability (Green Background) */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-7 bg-primary rounded-[32px] p-10 flex flex-col justify-between group overflow-hidden relative"
          >
             <div className="relative z-10 space-y-6">
                <div className="px-3 py-1 rounded-full bg-white/20 text-[10px] font-bold text-white uppercase tracking-widest w-fit">Scalability</div>
                <h3 className="text-4xl font-bold text-white leading-tight">Build scalable pipelines <br /> with the help of our AI</h3>
                <p className="text-white/80 text-sm max-w-xs font-medium">Easily scale your lead discovery up or down based on business needs without manual overhead.</p>
             </div>
             
             {/* Abstract Grid Decor */}
             <div className="absolute right-[-10%] bottom-[-10%] w-80 h-80 opacity-20">
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,white,transparent_70%)]" />
             </div>
          </motion.div>

          {/* Card 2: Visual Analysis (Real Person / Photo) */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-5 rounded-[32px] overflow-hidden relative group"
          >
             <img 
               src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800" 
               alt="Business Analytics" 
               className="absolute inset-0 w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
             <div className="absolute bottom-0 left-0 p-10">
                <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                   <PlayCircle className="h-6 w-6 text-white" />
                </div>
             </div>
          </motion.div>

          {/* Card 3: Subscription Status (Small Card) */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-4 bento-card flex flex-col justify-between"
          >
             <div className="space-y-6">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                   <Check className="h-6 w-6 text-primary" />
                </div>
                <h4 className="text-lg font-bold text-white uppercase tracking-tight">Lead Verified</h4>
                <p className="text-zinc-500 text-xs font-medium">Instant validation across 50+ data points for 100% accuracy.</p>
             </div>
             <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Verification Successful</span>
             </div>
          </motion.div>

          {/* Card 4: 90% Stat (Medium Card) */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-4 bento-card flex flex-col justify-center items-center text-center space-y-4"
          >
             <div className="h-24 w-full flex items-end justify-center gap-2">
                {[...Array(10)].map((_, i) => (
                  <motion.div 
                    key={i} 
                    animate={{ height: [10, Math.random() * 60 + 10, 10] }} 
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                    className="w-3 bg-primary/20 rounded-t-lg" 
                  />
                ))}
             </div>
             <h4 className="text-7xl font-bold text-white tracking-[-0.06em]">90%</h4>
             <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">Discovery Efficiency</p>
          </motion.div>

          {/* Card 5: Analytics & Insights (Emerald Theme) */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-4 rounded-[32px] bg-emerald-950/20 border border-emerald-500/10 p-10 flex flex-col justify-between relative overflow-hidden"
          >
             <div className="relative z-10 space-y-6">
                <div className="flex -space-x-3">
                   {[1, 2, 3, 4].map(i => (
                     <div key={i} className="h-8 w-8 rounded-full border-2 border-black bg-zinc-800" />
                   ))}
                </div>
                <h4 className="text-xl font-bold text-white">Analytics and Insights</h4>
                <p className="text-zinc-500 text-xs font-medium">Gain valuable insights through built-in analytics tools, allowing for data-driven decisions.</p>
             </div>
             <div className="absolute right-[-20%] bottom-[-20%] w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-60 relative overflow-hidden">
        {/* Immersive Neural Aura */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        
        {/* Floating Mission Assets */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
           <motion.div 
             animate={{ y: [0, -20, 0], opacity: [0.1, 0.3, 0.1] }} 
             transition={{ duration: 5, repeat: Infinity }}
             className="absolute top-20 left-[15%] p-4 glass-panel border-white/10 rounded-2xl"
           >
              <div className="h-2 w-12 bg-primary/40 rounded-full mb-2" />
              <div className="h-2 w-20 bg-zinc-800 rounded-full" />
           </motion.div>
           <motion.div 
             animate={{ y: [0, 20, 0], opacity: [0.1, 0.3, 0.1] }} 
             transition={{ duration: 7, repeat: Infinity, delay: 1 }}
             className="absolute bottom-20 right-[15%] p-4 glass-panel border-white/10 rounded-2xl"
           >
              <div className="h-2 w-20 bg-primary/40 rounded-full mb-2" />
              <div className="h-2 w-12 bg-zinc-800 rounded-full" />
           </motion.div>
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center space-y-12 relative z-10">
           <div className="space-y-6">
              <h2 className="text-7xl md:text-9xl font-bold tracking-[-0.06em] text-white leading-none">
                Ready to <span className="animate-text-shimmer bg-clip-text text-transparent bg-gradient-to-r from-primary via-emerald-400 to-primary">grow?</span>
              </h2>
              <p className="text-zinc-500 text-lg md:text-xl font-medium max-w-xl mx-auto leading-relaxed">
                Join the high-performance revenue teams using HyprLead to automate their pipeline discovery.
              </p>
           </div>

           <div className="flex flex-col items-center gap-8">
              <Link href="/signup" className="btn-pill-white h-20 px-16 text-xl relative group overflow-hidden">
                 <div className="absolute inset-0 bg-primary/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                 <span className="relative z-10 flex items-center gap-3">
                    Launch Mission <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                 </span>
              </Link>
              
              <div className="flex items-center gap-8">
                 <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Next Sweep: 04:12:00</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Verified Leads: 12.8k</span>
                 </div>
              </div>
           </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
