"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, CheckCircle2, TrendingUp, BarChart3, Users, Zap, Search, Globe, Shield } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-screen w-full flex flex-col items-center pt-32 pb-20 overflow-hidden">
      {/* Background System */}
      <div className="absolute inset-0 bg-grid -z-10" />
      <div className="bg-blob bg-orange top-1/4 left-1/4" />
      <div className="bg-blob bg-primary bottom-1/4 right-1/4 opacity-20" />

      <div className="max-w-5xl mx-auto px-6 text-center space-y-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">v2.0 Infrastructure Live</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tightest leading-[1.05] mb-8">
            Build your <span className="text-primary">revenue pipeline</span> <br />
            regardless of market conditions
          </h1>
          
          <p className="max-w-2xl mx-auto text-zinc-400 text-base md:text-lg font-medium mb-12">
            Automated lead discovery platform, finding qualified prospects <br className="hidden md:block" />
            to reduce risk and grow your business steadily.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="btn-pill-white">
              Get Started
            </Link>
            <Link href="#features" className="btn-pill-glass">
              Learn More
            </Link>
          </div>
        </motion.div>

        {/* Dashboard Mockup (Image 1 Style) */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-32 relative max-w-6xl mx-auto px-4"
        >
          {/* Dual Glows behind dashboard */}
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-orange/40 rounded-full blur-[100px] opacity-30" />
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/40 rounded-full blur-[100px] opacity-30" />
          
          <div className="relative glass-morphism rounded-[24px] overflow-hidden border-white/20">
            {/* Top Bar Glows */}
            <div className="absolute top-0 left-0 right-0 h-1 flex">
              <div className="flex-1 bg-gradient-to-r from-orange to-transparent opacity-50" />
              <div className="flex-1 bg-gradient-to-l from-primary to-transparent opacity-50" />
            </div>

            <div className="flex flex-col md:flex-row h-[500px]">
              {/* Sidebar */}
              <div className="w-64 border-r border-white/5 bg-black/20 p-6 hidden md:block">
                 <div className="flex items-center gap-2 mb-10">
                   <Zap className="h-5 w-5 text-white" />
                   <span className="font-bold text-sm tracking-tight">HyprLead</span>
                 </div>
                 <div className="space-y-6">
                    <div className="space-y-1">
                       <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4">Menu</p>
                       {[
                         { icon: Globe, label: "Dashboard", active: true },
                         { icon: BarChart3, label: "Analytics" },
                         { icon: TrendingUp, label: "Revenue" },
                         { icon: Users, label: "Leads" },
                         { icon: Shield, label: "Settings" }
                       ].map((item, i) => (
                         <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${item.active ? 'bg-white/5 text-white' : 'text-zinc-500 hover:text-white hover:bg-white/[0.02]'}`}>
                            <item.icon className="h-4 w-4" />
                            <span className="text-xs font-bold">{item.label}</span>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 p-8 text-left space-y-10">
                 <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-zinc-400">Operations Overview</h3>
                    <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                       <Search className="h-4 w-4 text-zinc-500" />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                       <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Pipeline Value</p>
                       <h4 className="text-4xl font-bold tracking-tightest">$84,503<span className="text-zinc-600">.00</span></h4>
                       <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-bold">
                          <TrendingUp className="h-3 w-3" /> +12.4% vs last month
                       </div>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active Verification</p>
                       <h4 className="text-4xl font-bold tracking-tightest">98.2%</h4>
                       <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Real-time validation</p>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Daily Scans</p>
                       <div className="flex items-end gap-1 h-10">
                          {[...Array(12)].map((_, i) => (
                             <motion.div key={i} animate={{ height: [10, Math.random() * 30 + 10, 10] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }} className="flex-1 bg-primary/40 rounded-t-sm" />
                          ))}
                       </div>
                    </div>
                 </div>

                 <div className="pt-10 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                      { label: "Direct Contacts", value: "2.4k" },
                      { label: "Verified Emails", value: "1.8k" },
                      { label: "Market Fit", value: "High" },
                      { label: "System Uptime", value: "99.9%" }
                    ].map((stat, i) => (
                      <div key={i} className="space-y-1">
                        <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em]">{stat.label}</p>
                        <p className="text-lg font-bold text-white">{stat.value}</p>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
