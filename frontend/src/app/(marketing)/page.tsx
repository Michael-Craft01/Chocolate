"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, ArrowRight, Brain, Cpu, MessageSquare, Check, Sparkles, Search, Heart, Shield, PlayCircle, Star } from "lucide-react";
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

  return (
    <div className="relative min-h-screen selection:bg-primary/30 font-sans bg-background text-foreground transition-colors duration-500">
      <Navbar />

      <Hero />

      {/* Social Proof Metric Section */}
      <section className="py-20 border-y border-card-border bg-card/25 backdrop-blur-md relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">4.2x</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-foreground/60">Reply Rate Increase</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">99.8%</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-foreground/60">SMTP Verification</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">10+ Hrs</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-foreground/60">Saved Weekly Per Rep</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">$0.00</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-foreground/60">Database Extract Cost</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section (High-Fidelity Social Proof) */}
      <section className="py-32 border-b border-card-border bg-card/40 backdrop-blur-md relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                <Heart className="h-3.5 w-3.5 text-primary" />
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">User Sentiment</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">Loved by <span className="text-primary">revenue leaders</span></h2>
            </div>
            <p className="text-foreground/75 text-xs font-semibold max-w-xs text-left md:text-right">Join high-growth outbound teams automating qualified pipeline discovery cycles.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                text: "HyprLead turned our manual 4-hour lead research process into a 10-minute automated sweep. The quality of pain-point personalization is unmatched.",
                author: "Sarah Chen",
                role: "Head of Growth",
                company: "ScaleFlow AI"
              },
              {
                text: "The 'Mission Control' dashboard gives us total visibility into our pipeline value. We identified 300+ highly qualified leads in our first week.",
                author: "Jameson Reed",
                role: "VP of Sales",
                company: "NexGen Systems"
              },
              {
                text: "Finally, a sales intelligence engine that actually uncovers real business pain points. The outreach scripts it generates feel human, not robotic.",
                author: "Elena Rodriguez",
                role: "Founder",
                company: "Stellar Outbound"
              }
            ].map((t, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="p-8 rounded-[32px] bg-card border border-card-border flex flex-col justify-between group hover:border-primary/20 transition-all duration-300 shadow-sm"
              >
                <div className="space-y-6">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-foreground text-xs leading-relaxed font-semibold italic">"{t.text}"</p>
                </div>
                <div className="mt-8 pt-6 border-t border-card-border flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs border border-primary/20">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-foreground">{t.author}</p>
                    <p className="text-[9px] text-foreground/50 font-black uppercase tracking-widest">{t.role} @ {t.company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Bento Grid Feature Section */}
      <section id="features" className="py-40 max-w-7xl mx-auto px-6">
        <div className="text-center mb-24 space-y-4">
           <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">Complete Sales <span className="text-primary">Pipeline Automation</span></h2>
           <p className="max-w-2xl mx-auto text-foreground/75 text-xs font-semibold">Experience AI-driven B2B lead discovery: scheduled market cycles, deep operational pain-point matrices, and seamless validation built for high-performance sales forces.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto">
          {/* Card 1: Scalability (Green Background) */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-7 bg-primary rounded-[32px] p-10 flex flex-col justify-between group overflow-hidden relative min-h-[300px]"
          >
             <div className="relative z-10 space-y-6">
                <div className="px-3 py-1 rounded-full bg-white/20 text-[10px] font-black text-white uppercase tracking-widest w-fit">Automatic Discovery Cycles</div>
                <h3 className="text-3xl font-extrabold text-white leading-tight">Bounded B2B Cycles <br /> Scouting Mapped Geographies</h3>
                <p className="text-white/80 text-xs max-w-sm font-semibold">Our discovery engine wakes on schedule, scans local business registrations, maps listings, and directories, then stops when the cycle is complete.</p>
             </div>
             
             {/* Abstract Grid Decor */}
             <div className="absolute right-[-10%] bottom-[-10%] w-80 h-80 opacity-20">
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,white,transparent_70%)]" />
             </div>
          </motion.div>

          {/* Card 2: Visual Analysis */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-5 rounded-[32px] overflow-hidden relative group min-h-[300px]"
          >
             <img 
               src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800" 
               alt="Business Analytics" 
               className="absolute inset-0 w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
             <div className="absolute bottom-0 left-0 p-10">
                <div className="h-12 w-12 rounded-full bg-primary/20 backdrop-blur-md flex items-center justify-center border border-primary/30">
                   <PlayCircle className="h-6 w-6 text-primary" />
                </div>
             </div>
          </motion.div>

          {/* Card 3: Real-Time SMTP */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-4 bento-card flex flex-col justify-between min-h-[280px]"
          >
             <div className="space-y-6">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                   <Check className="h-6 w-6 text-primary" />
                </div>
                <h4 className="text-lg font-bold text-foreground uppercase tracking-tight">Zero-Bounce SMTP Handshakes</h4>
                <p className="text-foreground/75 text-xs font-semibold">Every business email and phone number passes direct server connection handshakes, maintaining 99.8% verification accuracy and preserving your domain sender reputation.</p>
             </div>
             <div className="p-4 rounded-xl bg-primary/5 border border-primary/15 flex items-center gap-3">
                <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Active Verification Engine</span>
             </div>
          </motion.div>

          {/* Card 4: 4.2x Reply Increase */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-4 bento-card flex flex-col justify-center items-center text-center space-y-4 min-h-[280px]"
          >
             <div className="h-20 w-full flex items-end justify-center gap-2">
                {[...Array(10)].map((_, i) => (
                  <motion.div 
                    key={i} 
                    animate={{ height: [10, Math.random() * 50 + 10, 10] }} 
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                    className="w-3 bg-primary/20 rounded-t-lg" 
                  />
                ))}
             </div>
             <h4 className="text-6xl font-extrabold text-foreground tracking-tight">+4.2x</h4>
             <p className="text-foreground/50 text-[10px] font-black uppercase tracking-[0.2em]">Outbound Opener Conversion</p>
          </motion.div>

          {/* Card 5: Pain Point Matrix */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-4 rounded-[32px] bg-primary/5 border border-primary/10 p-10 flex flex-col justify-between relative overflow-hidden min-h-[280px]"
          >
             <div className="relative z-10 space-y-6">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                   <Brain className="h-6 w-6 text-primary" />
                </div>
                <h4 className="text-lg font-bold text-foreground">AI Pain-Point Matrix</h4>
                <p className="text-foreground/75 text-xs font-semibold">HyprLead AI parses targets' digital visibility, web structure, and operational blocks, equipping SDRs with hyper-personalized scripts addressing actual business problems.</p>
             </div>
             <div className="absolute right-[-20%] bottom-[-20%] w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-44 relative overflow-hidden bg-card/25 border-t border-card-border">
        {/* Immersive Neural Aura */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] animate-pulse pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 text-center space-y-12 relative z-10">
           <div className="space-y-6">
              <h2 className="text-6xl md:text-8xl font-bold tracking-tight text-foreground leading-none">
                Ready to <span className="animate-text-shimmer bg-clip-text text-transparent bg-gradient-to-r from-primary via-emerald-400 to-primary">grow?</span>
              </h2>
              <p className="text-foreground/75 text-base md:text-lg font-semibold max-w-xl mx-auto leading-relaxed">
                Join the high-performance revenue teams using HyprLead to automate their verified B2B sales pipeline.
              </p>
           </div>

           <div className="flex flex-col items-center gap-8">
              <Link href="/signup" className="btn-pill-white !bg-primary !text-white hover:!bg-primary-hover h-20 px-16 text-xl relative group overflow-hidden cursor-pointer shadow-lg">
                 <span className="relative z-10 flex items-center gap-3">
                    Launch Autonomous Agent <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                 </span>
              </Link>
           </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
