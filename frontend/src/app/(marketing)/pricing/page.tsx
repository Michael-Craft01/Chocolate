"use client";

import { motion } from "framer-motion";
import { Check, Zap, Shield, Cpu, ZapOff, HelpCircle, ArrowRight, Layers, Database, Network, Fingerprint } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { AuroraBackground } from "@/components/ui/aurora-background";

export default function PricingPage() {
  const plans = [
    {
      name: "FREE",
      price: "$0",
      description: "For individual builders exploring the platform.",
      features: [
        "10 Verified Leads / Day",
        "Standard AI Analysis",
        "Google Maps Integration",
        "Email Summaries",
        "CSV Data Export",
      ],
      cta: "Get Started Free",
      popular: false,
      tier: "FREE"
    },
    {
      name: "STARTER",
      price: "$20",
      description: "For small teams starting their lead pipeline.",
      features: [
        "50 Verified Leads / Day",
        "Detailed Pain Point Detection",
        "WhatsApp Deep-Linking",
        "1 Search Region",
        "Priority Support",
      ],
      cta: "Get Started Starter",
      popular: false,
      tier: "STARTER"
    },
    {
      name: "PROFESSIONAL",
      price: "$49",
      description: "For scaling revenue leaders and high-performance teams.",
      features: [
        "200 Verified Leads / Day",
        "Advanced AI Modeling",
        "Custom Outreach Scripts",
        "5 Search Regions",
        "Real-time Dashboard",
        "Priority Engine Access",
      ],
      cta: "Get Started Professional",
      popular: true,
      tier: "PROFESSIONAL"
    },
    {
      name: "ELITE",
      price: "$300",
      description: "For agencies and total market domination.",
      features: [
        "1,000+ Verified Leads / Day",
        "Unlimited Search Regions",
        "Custom AI Personas",
        "White-label Reports",
        "Dedicated Manager",
        "Full API Access",
      ],
      cta: "Get Started Elite",
      popular: false,
      tier: "ELITE"
    }
  ];

  const comparison = [
    { feature: "Daily Lead Limit", free: "10", starter: "50", professional: "200", elite: "1,000+" },
    { feature: "AI Analysis", free: "Standard", starter: "Standard", professional: "Deep", elite: "Custom" },
    { feature: "Search Regions", free: "1", starter: "1", professional: "5", elite: "Unlimited" },
    { feature: "Outreach Channels", free: "Email", starter: "Email", professional: "WA + Email", elite: "Omni-channel" },
    { feature: "White-labeling", free: "No", starter: "No", professional: "No", elite: "Yes" },
  ];

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
              <h1 className="text-5xl md:text-8xl font-black tracking-tightest text-white uppercase leading-none">
                Subscription <br /> <span className="text-primary">Plans.</span>
              </h1>
              <p className="readable max-w-xl mx-auto md:text-base">Align your lead generation with your growth trajectory. Four professional plans designed for every stage of business growth.</p>
            </motion.div>

            {/* Pricing Cards - 4 Column Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-24">
              {plans.map((plan, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-10 rounded-sm border transition-all flex flex-col text-left ${
                    plan.popular 
                    ? 'bg-primary border-primary shadow-[0_0_80px_rgba(255,109,41,0.2)]' 
                    : 'bg-white/[0.01] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-[9px] font-black uppercase tracking-[0.4em] ${plan.popular ? 'text-white' : 'text-zinc-600'}`}>{plan.name}</h3>
                    {plan.popular && (
                      <div className="px-2 py-0.5 rounded-sm bg-white/20 text-[7px] font-black text-white uppercase tracking-widest">Recommended</div>
                    )}
                  </div>
                  
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-5xl font-black tracking-tighter text-white">{plan.price}</span>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${plan.popular ? 'text-white/60' : 'text-zinc-700'}`}>/mo</span>
                  </div>
                  
                  <p className={`readable mb-10 ${plan.popular ? 'text-white/80' : ''}`}>{plan.description}</p>
                  
                  <div className="space-y-4 mb-12 flex-grow">
                    {plan.features.map((f, j) => (
                      <div key={j} className="flex items-center gap-3">
                        <Check className={`h-3 w-3 shrink-0 ${plan.popular ? 'text-white' : 'text-primary'}`} />
                        <span className={`text-[10px] font-black uppercase tracking-tight ${plan.popular ? 'text-white' : 'text-zinc-400'}`}>{f}</span>
                      </div>
                    ))}
                  </div>

                  <Link href="/signup" className={`h-12 w-full rounded-sm font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center ${
                    plan.popular 
                    ? 'bg-white text-black hover:bg-zinc-100 shadow-xl' 
                    : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                  }`}>
                    {plan.cta}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </AuroraBackground>
      </section>

      {/* Deep Comparison Table - 4 Tiers */}
      <section className="py-40 max-w-7xl mx-auto px-6">
         <div className="text-center mb-24">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Feature Comparison</h2>
            <p className="tertiary mt-4">Complete feature details</p>
         </div>

         <div className="rounded-sm border border-white/5 overflow-hidden shadow-2xl bg-white/[0.01]">
            <table className="w-full border-collapse">
               <thead>
                  <tr className="bg-white/[0.02] text-left border-b border-white/5 text-center">
                     <th className="p-8 text-[9px] font-black text-zinc-500 uppercase tracking-widest text-left">Feature</th>
                     <th className="p-8 text-[9px] font-black text-zinc-500 uppercase tracking-widest">Free</th>
                     <th className="p-8 text-[9px] font-black text-zinc-500 uppercase tracking-widest">Starter</th>
                     <th className="p-8 text-[9px] font-black text-primary uppercase tracking-widest">Professional</th>
                     <th className="p-8 text-[9px] font-black text-zinc-500 uppercase tracking-widest">Elite</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5 text-[10px] font-bold uppercase tracking-tight text-zinc-400 text-center">
                  {comparison.map((row, i) => (
                    <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                       <td className="p-8 text-white text-left font-black tracking-widest">{row.feature}</td>
                       <td className="p-8">{row.free}</td>
                       <td className="p-8">{row.starter}</td>
                       <td className="p-8 text-primary">{row.professional}</td>
                       <td className="p-8">{row.elite}</td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </section>

      {/* Security & Reliability Section */}
      <section className="py-40 border-t border-white/5 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: "Vault Security", desc: "Enterprise-grade encryption for all client data." },
              { icon: Network, title: "Cloud Network", desc: "Distributed discovery engine for 100% uptime." },
              { icon: Fingerprint, title: "Bypass Security", desc: "Intelligent discovery that bypasses site security." },
              { icon: Database, title: "Data Integrity", desc: "Verified business contact information only." },
            ].map((item, i) => (
              <div key={i} className="space-y-6 p-8 rounded-sm bg-white/[0.01] border border-white/5">
                <div className="h-10 w-10 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h4 className="text-[11px] font-black text-white uppercase tracking-widest">{item.title}</h4>
                <p className="readable">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
