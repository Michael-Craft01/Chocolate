"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight, Shield, Network, Fingerprint, Database, Zap, Compass, ShieldCheck, Sparkles } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import Link from "next/link";

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "For individuals starting to explore the platform.",
      features: [
        "1 Campaign",
        "Up to 15 Leads / Search",
        "Standard AI analysis",
        "Google Maps integration",
        "CSV Data Export"
      ],
      cta: "Choose Plan",
      color: "bg-white/[0.01] border-zinc-800 hover:border-zinc-700/60 shadow-sm",
      badge: "Free trial",
      icon: Compass,
      accent: "text-zinc-400"
    },
    {
      name: "Starter",
      price: isYearly ? "$15" : "$20",
      description: "For freelancers and small teams needing more freedom.",
      features: [
        "1 Campaign",
        "Up to 150 Leads / Search",
        "Weekly Automated Searches",
        "Standard search speed",
        "CSV Data Export"
      ],
      cta: "Choose Plan",
      color: "bg-white/[0.02] border-white/5 hover:border-white/10 hover:shadow-emerald-950/5 hover:scale-[1.01] transition-all",
      badge: "Growth",
      icon: Zap,
      accent: "text-emerald-400"
    },
    {
      name: "Professional",
      price: isYearly ? "$39" : "$49",
      description: "For scaling teams and professional creators.",
      features: [
        "5 Campaigns",
        "Up to 400 Leads / Search",
        "Searches every 2 days",
        "High-speed search priority",
        "Discord Integration"
      ],
      cta: "Choose Plan",
      popular: true,
      color: "bg-white/[0.06] border-primary/60 shadow-[0_0_30px_-5px_rgba(16,185,129,0.25)] hover:scale-[1.03] transition-all ring-1 ring-primary/30",
      badge: "Best Value",
      icon: Sparkles,
      accent: "text-primary"
    },
    {
      name: "Elite",
      price: isYearly ? "$240" : "$300",
      description: "For agencies and large teams requiring high volume.",
      features: [
        "10 Campaigns",
        "Up to 800 Leads / Search",
        "Daily Automated Searches",
        "Maximum search speed",
        "24/7 Priority Support"
      ],
      cta: "Choose Plan",
      color: "bg-white/[0.02] border-white/5 hover:border-white/10 hover:shadow-indigo-950/5 hover:scale-[1.01] transition-all",
      badge: "Enterprise",
      icon: ShieldCheck,
      accent: "text-indigo-400"
    }
  ];

  return (
    <div className="bg-background text-foreground min-h-screen selection:bg-primary/30 transition-colors duration-500 relative overflow-hidden">
      <Navbar />
      
      {/* Background Blobs */}
      <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-blue/10 dark:bg-blue/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse-slow" />
      <div className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] bg-primary/10 dark:bg-primary/5 rounded-full blur-[150px] pointer-events-none -z-10 animate-pulse-slow" />

      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 space-y-6">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-display tracking-tight font-black leading-none text-foreground text-4xl md:text-7xl"
            >
              Pricing
            </motion.h1>
            
            {/* Toggle */}
            <div className="flex items-center justify-center gap-4 mt-8">
               <span className={`text-sm font-bold ${!isYearly ? 'text-foreground' : 'text-foreground/50'}`}>Monthly</span>
               <button onClick={() => setIsYearly(!isYearly)}
                className={`w-14 h-7 rounded-full border p-1 flex items-center transition-all cursor-pointer ${
                  isYearly ? 'bg-primary/20 border-primary/30' : 'bg-foreground/10 border-card-border'
                }`}
               >
                  <motion.div 
                    animate={{ x: isYearly ? 28 : 0 }}
                    className={`h-5 w-5 rounded-full shadow-lg ${isYearly ? 'bg-primary' : 'bg-foreground'}`}
                  />
               </button>
               <span className={`text-sm font-bold ${isYearly ? 'text-foreground' : 'text-foreground/50'}`}>Yearly</span>
            </div>
          </div>
 
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {plans.map((plan, i) => {
              const TierIcon = plan.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`bento-card p-6 md:p-8 flex flex-col ${plan.color} relative overflow-hidden group rounded-3xl`}
                >
                  {plan.popular ? (
                    <div className="absolute top-0 right-0 p-6">
                       <div className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold border border-primary/20 flex items-center gap-1">
                         <Sparkles className="h-3 w-3 animate-pulse" /> {plan.badge}
                       </div>
                    </div>
                  ) : (
                    <div className="absolute top-0 right-0 p-6">
                       <div className="px-2.5 py-0.5 rounded-full bg-foreground/5 text-foreground/50 text-xs font-bold border border-foreground/10">
                         {plan.badge}
                       </div>
                    </div>
                  )}
 
                  <div className="space-y-2 mb-6 text-left pt-4">
                     <div className="flex items-center gap-2">
                       <TierIcon className={`h-4.5 w-4.5 ${plan.accent}`} />
                       <h3 className="text-sm font-bold text-foreground/80 leading-none">{plan.name}</h3>
                     </div>
                     <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-none">{plan.price}</span>
                        <span className="text-foreground/50 font-bold text-xs ml-2">/ month</span>
                     </div>
                     <p className="text-foreground/60 text-xs font-semibold leading-relaxed min-h-[32px]">{plan.description}</p>
                  </div>
 
                  <div className="space-y-4 mb-6 flex-grow text-left">
                     {plan.features.map((feature, j) => (
                       <div key={j} className="flex items-start gap-3 text-xs font-semibold text-foreground/75 leading-relaxed min-h-[20px]">
                          <Check className={`h-4 w-4 ${plan.accent} shrink-0 mt-0.5`} />
                          <span>{feature}</span>
                       </div>
                     ))}
                  </div>
 
                  <Link 
                    href="/signup" 
                    className={`w-full h-11 flex items-center justify-center rounded-full text-xs font-bold transition-all mt-auto ${
                      plan.popular
                        ? "bg-primary text-white hover:bg-primary/95 hover:scale-[1.02] shadow-md shadow-primary/25"
                        : "bg-transparent border border-foreground/15 hover:border-foreground/30 hover:bg-foreground/5 text-foreground active:scale-98"
                    }`}
                  >
                     {plan.cta}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
 
      {/* Trust Section */}
      <section className="py-20 border-t border-card-border relative bg-card/25 backdrop-blur-md text-left">
         <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
               {[
                 { icon: Shield, title: "Secure Storage", desc: "Secure storage for all your search results." },
                 { icon: Network, title: "Reliable Systems", desc: "Fast, reliable searches running in the background." },
                 { icon: Fingerprint, title: "Smart Search", desc: "Smart searches that run smoothly." },
                 { icon: Database, title: "Verified Data", desc: "Verified email and phone contact details." },
               ].map((item, i) => (
                 <div key={i} className="space-y-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                       <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="text-sm font-bold text-foreground">{item.title}</h4>
                    <p className="text-xs text-foreground/60 leading-relaxed font-semibold">{item.desc}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      <Footer />
    </div>
  );
}
