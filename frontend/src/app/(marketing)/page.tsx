"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, ArrowRight, Brain, Cpu, MessageSquare, Check, Sparkles, Search, Heart, Compass, Shield, Home } from "lucide-react";
import { createClient } from "@/lib/supabase";

import Hero from "@/components/landing/Hero";

export default function LandingPage() {
  const [session, setSession] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

const features = [
    {
      title: "Find Local Business",
      desc: "We scan the web to find local businesses that are active and growing in your city.",
      icon: Compass,
      color: "text-primary"
    },
    {
      title: "Smart Insights",
      desc: "We analyze their business data to show you how you can help them grow.",
      icon: Shield,
      color: "text-primary"
    },
    {
      title: "Direct Contact",
      desc: "Get their direct contact info and a simple message to start the conversation.",
      icon: Home,
      color: "text-primary"
    }
  ];

  const steps = [
    { title: "Choose Your Market", desc: "Select the industry and city you want to target.", icon: Compass },
    { title: "Start Search", desc: "We find local businesses for you instantly.", icon: Shield },
    { title: "Get Information", desc: "See their phone, email, and how you can help.", icon: Check },
    { title: "Start Growing", desc: "Reach out and turn leads into happy customers.", icon: Sparkles }
  ];

  const people = [
    { name: "Sarah J.", role: "Agency Founder", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&auto=format&fit=crop" },
    { name: "Michael K.", role: "Sales Director", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&auto=format&fit=crop" },
    { name: "Elena R.", role: "Marketing Lead", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&h=200&auto=format&fit=crop" },
    { name: "David L.", role: "Business Owner", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&h=200&auto=format&fit=crop" },
    { name: "Marcus T.", role: "Entrepreneur", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&h=200&auto=format&fit=crop" },
    { name: "Aisha B.", role: "Creative Director", img: "https://images.unsplash.com/photo-1531123897727-8f129e16fd3c?q=80&w=200&h=200&auto=format&fit=crop" },
    { name: "James W.", role: "Tech Recruiter", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&h=200&auto=format&fit=crop" },
    { name: "Sofia G.", role: "Startup Founder", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&h=200&auto=format&fit=crop" },
  ];

  const pricing = [
    { 
      name: "Starter", 
      price: "$20", 
      leads: "50 Leads / day", 
      perks: ["Business Search", "Email Alerts", "1 Search Area", "CSV Data Export"] 
    },
    { 
      name: "Professional", 
      price: "$49", 
      leads: "200 Leads / day", 
      perks: ["Smart Insights", "Fast Search", "5 Search Areas", "Email Support"], 
      featured: true 
    },
    { 
      name: "Elite", 
      price: "$300", 
      leads: "1,000 Leads / day", 
      perks: ["WhatsApp Alerts", "Full White-label", "Unlimited Searches", "Dedicated Support"] 
    }
  ];

  return (
    <div className="relative min-h-screen selection:bg-primary/30 font-sans">
      {/* Navbar */}
      <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl mx-auto px-8 py-4 flex items-center justify-between rounded-sm glass border-white/5 shadow-2xl backdrop-blur-3xl">
        <Link href="/" className="flex items-center gap-3 font-black text-xl tracking-tighter">
          <div className="h-10 w-10 rounded-sm bg-primary flex items-center justify-center border border-primary/20 orange-glow">
             <Compass className="h-5 w-5 text-white" />
          </div>
          <span className="text-white">HyprLead</span>
        </Link>
        <div className="hidden md:flex items-center gap-12 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">
          <Link href="#features" className="hover:text-primary transition-colors">How it works</Link>
          <Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link>
          <Link href="#community" className="hover:text-primary transition-colors">Community</Link>
        </div>
        <Link href={session ? "/dashboard" : "/login"} className="h-12 px-8 rounded-sm bg-primary text-white text-[11px] font-black uppercase tracking-widest hover:bg-primary-hover active:scale-[0.98] transition-all flex items-center justify-center shadow-xl shadow-primary/20 orange-glow">
          {session ? 'Dashboard' : 'Sign In'}
        </Link>
      </nav>

      <Hero />

      {/* Office Lifestyle Section */}
      <section id="workspace" className="max-w-7xl mx-auto px-6 py-32 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-20">
          <img src="/images/office.png" className="w-full h-full object-cover" alt="Office Workspace" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <h2 className="text-5xl md:text-7xl font-black tracking-tightest leading-none">
              A workspace <br />
              <span className="text-primary">built for clarity.</span>
            </h2>
            <p className="text-zinc-500 text-lg font-medium leading-relaxed max-w-lg">
              HyprLead is a professional search center designed to help you focus on what matters: building real relationships with the right businesses.
            </p>
            <div className="flex items-center gap-10 pt-6">
              <div>
                <div className="text-4xl font-black text-white tracking-tighter">1,000+</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mt-1">Users</div>
              </div>
              <div className="h-12 w-px bg-white/10" />
              <div>
                <div className="text-4xl font-black text-white tracking-tighter">50k+</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mt-1">Leads Found</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="glass-card rounded-sm border border-white/10 overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700">
               <img src="/images/entrepreneur.png" className="w-full h-auto object-cover" alt="Entrepreneur working" />
            </div>
            <div className="absolute -bottom-10 -left-10 h-32 w-32 bg-primary/20 rounded-full blur-3xl" />
          </div>
        </div>
      </section>

      {/* Features Grid with Background */}
      <section id="features" className="relative py-40 overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-10">
          <img src="/images/entrepreneur.png" className="w-full h-full object-cover" alt="Entrepreneur Lifestyle" />
        </div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="glass-card rounded-sm p-14 relative overflow-hidden group hover:border-primary/20 transition-all border-white/5">
                  <div className="absolute -top-24 -right-24 h-48 w-48 bg-primary/5 rounded-sm group-hover:bg-primary/10 transition-colors" />
                  <div className="h-16 w-16 rounded-sm bg-primary/5 border border-primary/10 flex items-center justify-center mb-10 group-hover:glow-primary transition-all">
                    <Icon className={`h-8 w-8 ${f.color}`} />
                  </div>
                  <h3 className="text-3xl font-black mb-6 tracking-tight text-white">{f.title}</h3>
                  <p className="text-zinc-400 leading-relaxed mb-8 text-lg font-medium">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Workflow Steps */}
      <section className="max-w-7xl mx-auto px-6 py-32 relative">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">4 Simple Steps to Success</h2>
          <p className="text-zinc-500 max-w-xl mx-auto text-lg font-medium leading-relaxed">It only takes a few minutes to start finding high-value leads.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div 
                key={i} 
                whileHover={{ y: -5 }}
                className="relative group glass-card rounded-sm p-10 border border-white/5"
              >
                <div className="h-16 w-16 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
                  <Icon className="h-8 w-8 text-zinc-500 group-hover:text-primary transition-colors" />
                </div>
                <h3 className="font-black text-xl mb-4 tracking-tight text-white">{step.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed font-medium">{step.desc}</p>
                <div className="absolute top-10 right-10 text-5xl font-black text-white/[0.03] select-none">{i + 1}</div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-40">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Simple Pricing.</h2>
          <p className="text-zinc-500 text-lg font-medium leading-relaxed">Choose the plan that fits your growth goals.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {pricing.map((p, i) => (
            <div key={i} className={`glass-card rounded-sm p-12 relative overflow-hidden flex flex-col ${p.featured ? 'border-primary/30 shadow-[0_0_80px_-12px_rgba(255,109,41,0.2)]' : 'border-white/5'}`}>
              {p.featured && (
                <div className="absolute top-0 right-0 px-6 py-2 bg-primary text-[10px] font-black uppercase tracking-[0.25em] text-white orange-glow">
                  Most Popular
                </div>
              )}
              <div className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-8">{p.name}</div>
              <div className="flex items-baseline gap-2 mb-12">
                <span className="text-6xl font-black tracking-tight text-white">{p.price}</span>
                <span className="text-zinc-600 text-sm font-black uppercase tracking-widest">/mo</span>
              </div>
              <div className="flex flex-col gap-6 mb-14 flex-grow">
                {p.perks.map((perk, j) => (
                  <div key={j} className="flex items-center gap-4 text-[13px] text-zinc-400 font-bold uppercase tracking-tight">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {perk}
                  </div>
                ))}
              </div>
              <Link href="/dashboard" className={`w-full h-16 rounded-sm flex items-center justify-center font-black text-[12px] uppercase tracking-widest transition-all ${p.featured ? 'bg-primary text-white glow-primary hover:scale-[1.02] shadow-xl shadow-primary/20' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'}`}>
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 pt-40 pb-20">
        <div className="border-t border-white/5 pt-20 flex flex-col md:flex-row items-center justify-between gap-10">
           <div className="flex items-center gap-3 font-black text-2xl tracking-tighter text-white">
             <Zap className="h-6 w-6 text-primary fill-primary" />
             <span>HyprLead</span>
           </div>
           <div className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em]">© 2026 HyprLead. All Rights Reserved.</div>
           <div className="flex gap-12">
              <Link href="#" className="text-[10px] text-zinc-600 hover:text-white transition-colors uppercase font-black tracking-[0.3em]">Terms</Link>
              <Link href="#" className="text-[10px] text-zinc-600 hover:text-white transition-colors uppercase font-black tracking-[0.3em]">Privacy</Link>
           </div>
        </div>
      </footer>
    </div>
  );
}
