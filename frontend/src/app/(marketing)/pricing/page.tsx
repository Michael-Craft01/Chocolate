"use client";

import { motion } from "framer-motion";
import { Check, Zap, Shield, Cpu, ZapOff, HelpCircle, ArrowRight } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { AuroraBackground } from "@/components/ui/aurora-background";

export default function PricingPage() {
  const plans = [
    {
      name: "Node",
      price: "$0",
      description: "For individual builders and side projects.",
      features: [
        "10 Autonomous Leads / Day",
        "Standard Neural Analysis",
        "Google Maps Integration",
        "Email Summaries",
        "CSV Data Export",
      ],
      cta: "Initialize Node",
      popular: false,
    },
    {
      name: "Cluster",
      price: "$49",
      description: "For scaling teams and revenue leaders.",
      features: [
        "200 Autonomous Leads / Day",
        "Deep Pain Point Extraction",
        "WhatsApp Deep-Linking",
        "Custom Outreach Scripts",
        "5 Search Regions",
        "Priority Engine Access",
      ],
      cta: "Initialize Cluster",
      popular: true,
    },
    {
      name: "Mainframe",
      price: "$299",
      description: "For total market domination and agencies.",
      features: [
        "1,000+ Autonomous Leads / Day",
        "Unlimited Search Regions",
        "Custom AI Personas",
        "White-label Reports",
        "Dedicated Manager",
        "Early API Access",
      ],
      cta: "Initialize Mainframe",
      popular: false,
    }
  ];

  const comparison = [
    { feature: "Daily Lead Limit", node: "10", cluster: "200", mainframe: "1,000+" },
    { feature: "Neural Analysis", node: "Basic", cluster: "Deep", mainframe: "Custom" },
    { feature: "Outreach Channels", node: "Email", cluster: "WA + Email", mainframe: "Omni-channel" },
    { feature: "Search Depth", node: "1 Page", cluster: "5 Pages", mainframe: "Infinite" },
    { feature: "Support", node: "Community", cluster: "Priority", mainframe: "Dedicated" },
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
                Scalable <br /> <span className="text-primary">Intelligence.</span>
              </h1>
              <p className="text-zinc-500 max-w-xl mx-auto font-medium">Choose a model that fits your growth trajectory. Transparent pricing with zero hidden protocols.</p>
            </motion.div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-8 mt-24">
              {plans.map((plan, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-12 rounded-sm border transition-all flex flex-col text-left ${
                    plan.popular 
                    ? 'bg-primary border-primary shadow-[0_0_80px_rgba(255,109,41,0.2)]' 
                    : 'bg-white/[0.01] border-white/5'
                  }`}
                >
                  <h3 className={`text-[10px] font-black uppercase tracking-[0.4em] mb-4 ${plan.popular ? 'text-white' : 'text-zinc-600'}`}>{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-6xl font-black tracking-tighter text-white">{plan.price}</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${plan.popular ? 'text-white/60' : 'text-zinc-700'}`}>/mo</span>
                  </div>
                  <p className={`text-[11px] font-medium leading-relaxed mb-12 ${plan.popular ? 'text-white/80' : 'text-zinc-500'}`}>{plan.description}</p>
                  
                  <div className="space-y-5 mb-16 flex-grow">
                    {plan.features.map((f, j) => (
                      <div key={j} className="flex items-center gap-4">
                        <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${plan.popular ? 'bg-white/20' : 'bg-primary/10'}`}>
                           <Check className={`h-3 w-3 ${plan.popular ? 'text-white' : 'text-primary'}`} />
                        </div>
                        <span className={`text-[11px] font-bold uppercase tracking-tight ${plan.popular ? 'text-white' : 'text-zinc-400'}`}>{f}</span>
                      </div>
                    ))}
                  </div>

                  <button className={`h-14 w-full rounded-sm font-black text-[11px] uppercase tracking-widest transition-all ${
                    plan.popular 
                    ? 'bg-white text-black hover:bg-zinc-100' 
                    : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                  }`}>
                    {plan.cta}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </AuroraBackground>
      </section>

      {/* Feature Comparison */}
      <section className="py-40 max-w-5xl mx-auto px-6">
         <div className="text-center mb-24">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Protocol Comparison</h2>
            <p className="text-zinc-600 text-xs mt-4 font-black uppercase tracking-widest">Deep dive into technical specifications</p>
         </div>

         <div className="rounded-sm border border-white/5 overflow-hidden shadow-2xl">
            <table className="w-full border-collapse">
               <thead>
                  <tr className="bg-white/[0.02] text-left border-b border-white/5">
                     <th className="p-8 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Capabilities</th>
                     <th className="p-8 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">Node</th>
                     <th className="p-8 text-[10px] font-black text-primary uppercase tracking-widest text-center">Cluster</th>
                     <th className="p-8 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">Mainframe</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5 text-[11px] font-bold uppercase tracking-tight text-zinc-400">
                  {comparison.map((row, i) => (
                    <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                       <td className="p-8 text-white">{row.feature}</td>
                       <td className="p-8 text-center">{row.node}</td>
                       <td className="p-8 text-center text-primary">{row.cluster}</td>
                       <td className="p-8 text-center">{row.mainframe}</td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </section>

      {/* Trust & Security */}
      <section className="py-40 border-y border-white/5">
         <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12 text-center">
            {[
               { title: "Secure Protocol", desc: "Military-grade encryption for all discovery cycles.", icon: Shield },
               { title: "Neural Accuracy", desc: "98.4% success rate in pain point identification.", icon: Cpu },
               { title: "Zero Lock-in", desc: "Upgrade or terminate protocols at any time.", icon: ZapOff },
            ].map((item, i) => (
               <div key={i} className="space-y-6">
                  <div className="h-16 w-16 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                     <item.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">{item.title}</h3>
                  <p className="text-zinc-600 text-sm leading-relaxed">{item.desc}</p>
               </div>
            ))}
         </div>
      </section>

      {/* FAQ */}
      <section className="py-40 max-w-4xl mx-auto px-6">
         <div className="flex flex-col items-center mb-24">
            <div className="h-12 w-12 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center mb-8">
               <HelpCircle className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-4xl font-black text-white uppercase tracking-tight">Technical FAQ</h2>
         </div>

         <div className="space-y-4">
            {[
               { q: "How are the autonomous cycles scheduled?", a: "The engine runs in two 12-hour sweeps daily, ensuring your dashboard is constantly populated with fresh intelligence without manual triggers." },
               { q: "Can I target specific niches or regions?", a: "Absolutely. Depending on your plan, you can configure the discovery engine to focus on any business industry and geographic region worldwide." },
               { q: "Is the outreach content customizable?", a: "Yes. Our neural analysis generates a pre-filled draft, but you have full control to edit and polish before dispatching via WhatsApp or Email." },
            ].map((faq, i) => (
               <div key={i} className="p-10 rounded-sm bg-white/[0.01] border border-white/5 hover:border-white/10 transition-all">
                  <h4 className="text-sm font-black text-white uppercase tracking-widest mb-4">{faq.q}</h4>
                  <p className="text-zinc-500 text-sm leading-relaxed font-medium">{faq.a}</p>
               </div>
            ))}
         </div>
      </section>

      <Footer />
    </div>
  );
}
