"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Target, ArrowRight, Brain, Cpu, MessageSquare, Check, Sparkles, Search, Heart } from "lucide-react";
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
      title: "We find the leads",
      desc: "Our engine scans the web to find businesses in your area and industry that actually need your services today.",
      icon: Search,
      color: "text-blue-400"
    },
    {
      title: "We understand them",
      desc: "Our AI reads their business profiles to figure out their biggest problems, so you know exactly what to offer.",
      icon: Heart,
      color: "text-emerald-400"
    },
    {
      title: "You connect and grow",
      desc: "We give you their direct contact info and a perfect script to start a conversation and close the deal.",
      icon: Zap,
      color: "text-primary"
    }
  ];

  const steps = [
    { title: "Choose Your Market", desc: "Tell us the industry and city you want to target.", icon: Target },
    { title: "Run the Search", desc: "We scan thousands of local business listings instantly.", icon: Search },
    { title: "Get the Details", desc: "See their phone, email, and why they need your help.", icon: Check },
    { title: "Start Growing", desc: "Reach out and turn leads into happy paying customers.", icon: Sparkles }
  ];

  const people = [
    { name: "Sarah J.", role: "Agency Founder", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&auto=format&fit=crop" },
    { name: "Michael K.", role: "Sales Director", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&auto=format&fit=crop" },
    { name: "Elena R.", role: "Marketing Lead", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&h=200&auto=format&fit=crop" },
    { name: "David L.", role: "Business Owner", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&h=200&auto=format&fit=crop" },
  ];

  const pricing = [
    { 
      name: "Starter", 
      price: "$20", 
      leads: "50 Leads / day", 
      perks: ["Business Discovery", "Discord Alerts", "1 Discovery Hub", "CSV Data Export"] 
    },
    { 
      name: "Professional", 
      price: "$49", 
      leads: "200 Leads / day", 
      perks: ["AI Problem Analysis", "Priority Discovery", "5 Discovery Hubs", "Email Support"], 
      featured: true 
    },
    { 
      name: "Elite", 
      price: "$300", 
      leads: "1,000 Leads / day", 
      perks: ["WhatsApp Notifications", "Full White-label", "Unlimited Hubs", "Dedicated Strategist"] 
    }
  ];

  return (
    <div className="relative min-h-screen selection:bg-primary/30 font-sans">
      {/* Navbar */}
      <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl mx-auto px-8 py-4 flex items-center justify-between rounded-sm glass-card border-white/10 shadow-2xl backdrop-blur-2xl">
        <Link href="/" className="flex items-center gap-3 font-black text-xl tracking-tighter">
          <div className="h-10 w-10 rounded-sm bg-primary flex items-center justify-center glow-primary">
            <Zap className="h-5 w-5 text-white fill-white" />
          </div>
          <span>HyprLead</span>
        </Link>
        <div className="hidden md:flex items-center gap-12 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">
          <Link href="#features" className="hover:text-white transition-colors">How it works</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="#community" className="hover:text-white transition-colors">Community</Link>
        </div>
        <Link href={session ? "/dashboard" : "/login"} className="h-12 px-8 rounded-sm bg-white text-black text-[11px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center shadow-xl shadow-white/5">
          {session ? 'Dashboard' : 'Sign In'}
        </Link>
      </nav>

      <Hero />

      {/* Social Proof Section */}
      <section id="community" className="max-w-7xl mx-auto px-6 py-32 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-20">
          <img src="/images/office.png" className="w-full h-full object-cover" alt="Office Workspace" />
        </div>
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Built for Growth.</h2>
          <p className="text-zinc-500 max-w-xl mx-auto text-lg font-medium leading-relaxed">Join thousands of entrepreneurs who are already using HyprLead to scale their business.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {people.map((p, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="glass-card p-6 rounded-sm border border-white/5 text-center group"
            >
              <img src={p.img} alt={p.name} className="h-24 w-24 rounded-full mx-auto mb-6 object-cover border-2 border-primary/20 group-hover:border-primary transition-colors" />
              <h4 className="font-black text-white text-lg tracking-tight">{p.name}</h4>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mt-1">{p.role}</p>
            </motion.div>
          ))}
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
            <div key={i} className={`glass-card rounded-sm p-12 relative overflow-hidden flex flex-col ${p.featured ? 'border-primary/30 shadow-[0_0_80px_-12px_rgba(59,130,246,0.3)]' : 'border-white/5'}`}>
              {p.featured && (
                <div className="absolute top-0 right-0 px-6 py-2 bg-primary text-[10px] font-black uppercase tracking-[0.25em] text-white">
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
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    {perk}
                  </div>
                ))}
              </div>
              <Link href="/dashboard" className={`w-full h-16 rounded-sm flex items-center justify-center font-black text-[12px] uppercase tracking-widest transition-all ${p.featured ? 'bg-primary text-white glow-primary hover:scale-[1.02]' : 'bg-white text-black hover:bg-zinc-200 shadow-xl shadow-white/5'}`}>
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
           <div className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em]">© 2026 HyprLead Growth Engine. All Rights Reserved.</div>
           <div className="flex gap-12">
              <Link href="#" className="text-[10px] text-zinc-600 hover:text-white transition-colors uppercase font-black tracking-[0.3em]">Terms</Link>
              <Link href="#" className="text-[10px] text-zinc-600 hover:text-white transition-colors uppercase font-black tracking-[0.3em]">Privacy</Link>
           </div>
        </div>
      </footer>
    </div>
  );
}
