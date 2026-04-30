"use client";

import { motion } from "framer-motion";
import { Zap, Target, ArrowRight, Brain, Cpu, Shield, Globe, Sparkles, Search, Compass, MessageSquare, CheckCircle2, TrendingUp, Users, Layout, ChevronRight, BarChart3, Clock, MoreVertical, Bell, Plus, LayoutDashboard, SearchCode, Database } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  const activity = [
    { name: "Global Retail", text: "52 New Leads Found", time: "2m", color: "bg-emerald-500" },
    { name: "Tech Services", text: "Analysis Complete", time: "15m", color: "bg-primary" },
    { name: "Marketing Hub", text: "Message Generated", time: "1h", color: "bg-blue-500" },
  ];

  return (
    <section className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center pt-20">
      {/* Dynamic Background Atmosphere */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[140px] animate-pulse-slow" />
      </div>

      <div className="max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          {/* Elite Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 mb-10 shadow-2xl backdrop-blur-xl"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-300">
              Trusted by 500+ High-Performance Teams
            </span>
          </motion.div>

          <h1 className="text-display mb-8">
            Scale your <span className="text-white">revenue</span> <br /> 
            with <span className="text-primary">precision</span> leads.
          </h1>
          
          <p className="max-w-2xl mx-auto readable mb-12 text-lg md:text-xl">
            Autonomous discovery for business owners who value speed. We identify, verify, and analyze high-value prospects so you can focus on closing deals.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/signup" className="button-premium button-primary h-14 px-10 text-base">
              Start Your Free Scan
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="#how-it-works" className="button-premium button-secondary h-14 px-10 text-base">
              Explore the Engine
            </Link>
          </div>
        </motion.div>

        {/* Billion Dollar Mockup Section */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mt-32 relative max-w-6xl mx-auto"
        >
          {/* Outer Glow */}
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-[2.5rem] blur-3xl opacity-50" />
          
          <div className="relative glass-panel rounded-[2rem] overflow-hidden border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)]">
             <div className="flex flex-col md:flex-row h-[600px]">
                {/* Visual Sidebar */}
                <div className="w-full md:w-20 border-b md:border-b-0 md:border-r border-white/5 bg-white/[0.02] flex md:flex-col items-center justify-around md:justify-start md:py-8 gap-8">
                   <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center">
                      <Zap className="h-5 w-5 text-black" />
                   </div>
                   <div className="flex md:flex-col gap-6">
                      {[LayoutDashboard, SearchCode, Users, Database, BarChart3, Bell].map((Icon, i) => (
                        <div key={i} className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${i === 1 ? 'bg-primary/10 text-primary' : 'text-zinc-600 hover:text-white'}`}>
                           <Icon className="h-5 w-5" />
                        </div>
                      ))}
                   </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col bg-black/40">
                   {/* Interface Header */}
                   <div className="h-16 border-b border-white/5 flex items-center px-8 justify-between">
                      <div className="flex items-center gap-4">
                         <h3 className="text-sm font-bold text-white tracking-tight">Active Search Monitor</h3>
                         <div className="px-2 py-1 rounded-md bg-emerald-500/10 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Running</div>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="h-8 w-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center">
                            <Plus className="h-4 w-4 text-zinc-500" />
                         </div>
                         <div className="h-8 w-24 rounded-lg bg-white/10 border border-white/10" />
                      </div>
                   </div>

                   <div className="flex-1 p-8 grid grid-cols-12 gap-8 overflow-hidden">
                      {/* Analytics Column */}
                      <div className="col-span-12 md:col-span-8 space-y-8">
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="glow-card p-6 rounded-2xl space-y-4">
                               <p className="tertiary">Discovery Depth</p>
                               <div className="flex items-end justify-between">
                                  <h4 className="text-4xl font-bold">84%</h4>
                                  <div className="h-10 w-24">
                                     <Sparkline color="#ff6d29" />
                                  </div>
                               </div>
                               <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                  <motion.div initial={{ width: 0 }} animate={{ width: '84%' }} transition={{ duration: 2 }} className="h-full bg-primary shadow-[0_0_10px_rgba(255,109,41,0.5)]" />
                               </div>
                            </div>
                            <div className="glow-card p-6 rounded-2xl space-y-4">
                               <p className="tertiary">Success Rate</p>
                               <div className="flex items-end justify-between">
                                  <h4 className="text-4xl font-bold">92.4%</h4>
                                  <TrendingUp className="h-6 w-6 text-emerald-500" />
                               </div>
                               <p className="text-[10px] text-zinc-500 font-medium">+5.2% from last cycle</p>
                            </div>
                         </div>

                         {/* Main Chart Card */}
                         <div className="glow-card p-8 rounded-[2rem] h-64 relative overflow-hidden group">
                            <div className="relative z-10">
                               <h4 className="tertiary mb-6">Revenue Potential</h4>
                               <div className="flex items-baseline gap-2 mb-8">
                                  <span className="text-5xl font-bold text-white">$2.4M</span>
                                  <span className="text-sm font-bold text-primary">Target Value</span>
                               </div>
                            </div>
                            {/* Decorative Grid */}
                            <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                         </div>
                      </div>

                      {/* Live Feed Column */}
                      <div className="hidden md:block col-span-4 space-y-6">
                         <p className="tertiary">Activity Feed</p>
                         <div className="space-y-4">
                            {activity.map((item, i) => (
                               <motion.div 
                                  key={i}
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.8 + i * 0.1 }}
                                  className="p-4 rounded-xl glass-panel border-white/5 space-y-2 hover:bg-white/[0.04] transition-all cursor-default"
                                >
                                  <div className="flex items-center justify-between">
                                     <div className="flex items-center gap-2">
                                        <div className={`h-1.5 w-1.5 rounded-full ${item.color}`} />
                                        <span className="text-[11px] font-bold text-white">{item.name}</span>
                                     </div>
                                     <span className="text-[9px] text-zinc-600">{item.time}</span>
                                  </div>
                                  <p className="text-xs text-zinc-400 font-medium">{item.text}</p>
                               </motion.div>
                            ))}
                         </div>
                         <div className="pt-6 border-t border-white/5">
                            <button className="w-full h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest hover:bg-primary/20 transition-all">
                               Export All Data
                            </button>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Sparkline({ color }: { color: string }) {
  return (
    <svg className="w-full h-full" viewBox="0 0 100 40">
      <motion.path
        d="M0,30 Q10,10 20,25 T40,15 T60,30 T80,10 T100,20"
        fill="none"
        stroke={color}
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </svg>
  );
}
