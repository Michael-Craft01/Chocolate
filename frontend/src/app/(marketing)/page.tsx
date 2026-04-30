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

      {/* Social Proof Bar (Image 3 Style) */}
      <section className="py-20 border-y border-white/5 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-12 md:gap-24 opacity-30">
          {logos.map((logo, i) => (
            <span key={i} className="text-sm font-black tracking-widest text-white uppercase">{logo}</span>
          ))}
        </div>
      </section>

      {/* The Bento Grid Feature Section (Image 3 Inspiration) */}
      <section id="features" className="py-40 max-w-7xl mx-auto px-6">
        <div className="text-center mb-24 space-y-4">
           <h2 className="text-5xl md:text-7xl font-bold tracking-tightest text-white">Access to the <span className="text-primary">future of sales</span></h2>
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
             <h4 className="text-7xl font-bold text-white tracking-tightest">90%</h4>
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
      <section className="py-40 relative">
        <div className="bg-blob bg-blue top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20" />
        <div className="max-w-4xl mx-auto px-6 text-center space-y-12 relative z-10">
           <h2 className="text-6xl md:text-8xl font-bold tracking-tightest text-white leading-none">Ready to <span className="text-primary">grow?</span></h2>
           <p className="readable max-w-xl mx-auto">Join the high-performance revenue teams using HyprLead to automate their pipeline discovery.</p>
           <div className="flex justify-center">
              <Link href="/signup" className="btn-pill-white h-16 px-12 text-lg">
                 Get Started Today
              </Link>
           </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
