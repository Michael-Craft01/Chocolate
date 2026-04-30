"use client";

import { motion } from "framer-motion";
import { Zap, Target, ArrowRight, Brain, Cpu, Shield, Globe, Sparkles, Search, Compass, MessageSquare, CheckCircle2, TrendingUp, Users, Layout, ChevronRight, BarChart3, Clock, MoreVertical, Bell, Plus } from "lucide-react";
import Link from "next/link";
import { AuroraBackground } from "@/components/ui/aurora-background";

export default function Hero() {
  const messages = [
    { name: "Sarah J.", text: "Needs local SEO audit", time: "2m", color: "bg-emerald-500" },
    { name: "Michael K.", text: "Revenue leakage detected", time: "15m", color: "bg-primary" },
    { name: "Elena R.", text: "New campaign target", time: "1h", color: "bg-blue-500" },
  ];

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#050505]">
      <AuroraBackground className="!h-auto pt-48 pb-32">
        <div className="max-w-7xl mx-auto px-6 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            {/* Pill Badge with Pulse */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 mb-10 shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-xl"
            >
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-300">
                System Status: <span className="text-primary">Operational v2.4.1</span>
              </span>
            </motion.div>

            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tightest leading-[0.8] text-white max-w-5xl mb-8 uppercase">
              The <span className="gradient-text">Infinite</span> <br />
              <span className="text-zinc-600">Lead Engine</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-base md:text-lg text-zinc-500 leading-relaxed font-medium mb-12">
              Autonomous discovery meet neural analysis. We scan the web, identify pain points, <br className="hidden md:block" />
              and generate the perfect outreach. Scale your revenue without lifting a finger.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <Link href="/dashboard" className="h-14 px-10 rounded-sm bg-primary text-white font-black text-[11px] uppercase tracking-[0.2em] hover:bg-primary-hover active:scale-[0.98] transition-all flex items-center gap-3 shadow-[0_10px_40px_rgba(255,109,41,0.3)] orange-glow">
                Initialize Discovery
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="#demo" className="h-14 px-10 rounded-sm bg-white/[0.03] border border-white/5 font-black text-[11px] uppercase tracking-[0.2em] transition-all inline-flex items-center hover:bg-white/10 text-white gap-2 backdrop-blur-md">
                Watch Neural Scan
              </Link>
            </div>
          </motion.div>

          {/* High Fidelity Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 100, rotateX: 10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: "circOut" }}
            className="mt-28 relative max-w-6xl mx-auto group [perspective:1000px]"
          >
            {/* The Aurora Glow */}
            <div className="absolute -inset-2 bg-gradient-to-r from-primary via-orange-400 to-primary rounded-sm blur-3xl opacity-20 group-hover:opacity-50 transition-opacity duration-1000" />
            
            <div className="relative glass rounded-sm border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9)] overflow-hidden bg-black/60 backdrop-blur-3xl">
               <div className="flex h-[600px]">
                  {/* Sidebar */}
                  <div className="w-20 border-r border-white/5 bg-white/[0.01] flex flex-col items-center py-8 gap-8">
                    <div className="h-10 w-10 rounded-sm bg-primary/20 border border-primary/30 flex items-center justify-center orange-glow">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex flex-col gap-6 mt-8">
                      {[Layout, Users, Target, Search, MessageSquare, BarChart3, Settings2].map((Icon, i) => (
                        <div key={i} className={`h-10 w-10 rounded-sm flex items-center justify-center transition-all ${i === 0 ? 'bg-white/5 text-primary border border-white/5' : 'text-zinc-600 hover:text-white hover:bg-white/5'}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Main Panel */}
                  <div className="flex-1 flex flex-col">
                     {/* Window Header */}
                     <div className="h-14 border-b border-white/5 bg-white/[0.02] flex items-center px-8 justify-between">
                        <div className="flex items-center gap-6">
                           <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Ongoing Analysis</h3>
                           <div className="h-4 w-px bg-white/10" />
                           <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-emerald-500" />
                              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">8 Active Cycles</span>
                           </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="h-8 w-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center">
                              <Bell className="h-4 w-4 text-zinc-500" />
                           </div>
                           <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/20 flex items-center justify-center">
                              <Plus className="h-4 w-4 text-primary" />
                           </div>
                        </div>
                     </div>

                     <div className="flex-1 p-8 grid grid-cols-12 gap-6 overflow-hidden">
                        {/* Center Column */}
                        <div className="col-span-8 space-y-6">
                           <div className="grid grid-cols-2 gap-6">
                              <div className="p-6 rounded-sm bg-white/[0.02] border border-white/5 space-y-4">
                                 <div className="flex justify-between items-center">
                                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Discovery Progress</p>
                                    <span className="text-[9px] font-black text-primary">72%</span>
                                 </div>
                                 <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: '72%' }} transition={{ duration: 2 }} className="h-full bg-primary" />
                                 </div>
                                 <div className="flex gap-2">
                                    <div className="h-8 w-24 rounded-sm bg-white/5 border border-white/5" />
                                    <div className="h-8 w-24 rounded-sm bg-white/5 border border-white/5" />
                                 </div>
                              </div>
                              <div className="p-6 rounded-sm bg-white/[0.02] border border-white/5 space-y-4">
                                 <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Market Density</p>
                                 <div className="flex items-end gap-1 h-12">
                                    {[...Array(20)].map((_, i) => (
                                       <motion.div key={i} animate={{ height: [10, Math.random() * 40 + 10, 10] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.05 }} className="flex-1 bg-primary/20 rounded-t-sm" />
                                    ))}
                                 </div>
                              </div>
                           </div>

                           <div className="p-8 rounded-sm bg-[#050505] border border-white/5 relative overflow-hidden group/card">
                              <div className="absolute top-0 right-0 p-4">
                                 <BarChart3 className="h-5 w-5 text-primary opacity-20" />
                              </div>
                              <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-6">Revenue Projections</h4>
                              <div className="flex items-baseline gap-2 mb-8">
                                 <span className="text-4xl font-black text-white tracking-tighter">$1.2M</span>
                                 <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">+12.4%</span>
                              </div>
                              <div className="h-32 w-full">
                                 <svg className="w-full h-full" viewBox="0 0 500 100">
                                    <motion.path 
                                      d="M0,80 Q50,60 100,70 T200,40 T300,50 T400,20 T500,10" 
                                      fill="none" 
                                      stroke="#ff6d29" 
                                      strokeWidth="3"
                                      initial={{ pathLength: 0 }}
                                      animate={{ pathLength: 1 }}
                                      transition={{ duration: 4, repeat: Infinity }}
                                    />
                                    <path d="M0,80 Q50,60 100,70 T200,40 T300,50 T400,20 T500,10" fill="url(#area-gradient)" opacity="0.1" />
                                    <defs>
                                       <linearGradient id="area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                          <stop offset="0%" stopColor="#ff6d29" />
                                          <stop offset="100%" stopColor="transparent" />
                                       </linearGradient>
                                    </defs>
                                 </svg>
                              </div>
                           </div>
                        </div>

                        {/* Right Column: Feed/Messages */}
                        <div className="col-span-4 border-l border-white/5 pl-6 space-y-6">
                           <div className="flex items-center justify-between">
                              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Neural Feed</p>
                              <MoreVertical className="h-4 w-4 text-zinc-700" />
                           </div>
                           <div className="space-y-4">
                              {messages.map((m, i) => (
                                 <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 1.2 + i * 0.1 }}
                                    className="p-4 rounded-sm bg-white/[0.02] border border-white/5 space-y-2 group/msg hover:bg-white/[0.04] transition-all"
                                 >
                                    <div className="flex items-center justify-between">
                                       <div className="flex items-center gap-2">
                                          <div className={`h-2 w-2 rounded-full ${m.color}`} />
                                          <span className="text-[10px] font-black text-white uppercase tracking-tight">{m.name}</span>
                                       </div>
                                       <span className="text-[8px] font-bold text-zinc-600">{m.time} ago</span>
                                    </div>
                                    <p className="text-[11px] text-zinc-400 leading-relaxed">{m.text}</p>
                                 </motion.div>
                              ))}
                           </div>
                           
                           <div className="pt-6 border-t border-white/5">
                              <div className="flex items-center justify-between mb-4">
                                 <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Quick Actions</p>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                 <div className="h-10 rounded-sm bg-white/5 border border-white/5 flex items-center justify-center text-[8px] font-black text-zinc-500 uppercase tracking-widest hover:text-white hover:bg-primary/10 transition-all cursor-pointer">Dispatch</div>
                                 <div className="h-10 rounded-sm bg-white/5 border border-white/5 flex items-center justify-center text-[8px] font-black text-zinc-500 uppercase tracking-widest hover:text-white hover:bg-primary/10 transition-all cursor-pointer">Analyze</div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Decorative Floating Elements */}
            <div className="absolute -top-12 -right-12 h-64 w-64 bg-primary/10 rounded-full blur-[100px] -z-10" />
            <div className="absolute -bottom-24 -left-24 h-96 w-96 bg-blue-500/5 rounded-full blur-[120px] -z-10" />
          </motion.div>
        </div>
      </AuroraBackground>
    </section>
  );
}

function Settings2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
