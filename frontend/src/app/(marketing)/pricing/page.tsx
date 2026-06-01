"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight, Shield, Network, Fingerprint, Database } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import Link from "next/link";

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "For individual builders exploring the platform.",
      features: [
        "10 Verified Leads / Day",
        "Standard AI Analysis",
        "Google Maps Integration",
        "Email Summaries",
        "CSV Data Export",
      ],
      cta: "Choose Plan",
      color: ""
    },
    {
      name: "Standard",
      price: isYearly ? "$15" : "$20",
      description: "For freelancers and small teams who need more freedom.",
      features: [
        "50 Verified Leads / Day",
        "Detailed Pain Point Detection",
        "WhatsApp Deep-Linking",
        "1 Search Region",
        "Priority Support",
      ],
      cta: "Choose Plan",
      color: ""
    },
    {
      name: "Pro",
      price: isYearly ? "$39" : "$49",
      description: "For scaling revenue leaders and professional creators.",
      features: [
        "200 Verified Leads / Day",
        "Advanced AI Modeling",
        "Custom Outreach Scripts",
        "5 Search Regions",
        "Real-time Dashboard",
        "Brand Customization"
      ],
      cta: "Choose Plan",
      popular: true,
      color: "glow-border-green"
    }
  ];

  return (
    <div className="bg-background text-foreground min-h-screen selection:bg-primary/30 transition-colors duration-500 relative overflow-hidden">
      <Navbar />
      
      {/* Background Blobs */}
      <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-blue/10 dark:bg-blue/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse-slow" />
      <div className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] bg-primary/10 dark:bg-primary/5 rounded-full blur-[150px] pointer-events-none -z-10 animate-pulse-slow" />

      <section className="relative pt-48 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-6">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-display tracking-tight font-black leading-none text-foreground text-7xl md:text-9xl"
            >
              Pricing
            </motion.h1>
            
            {/* Toggle */}
            <div className="flex items-center justify-center gap-4 mt-12">
               <span className={`text-sm font-bold ${!isYearly ? 'text-foreground' : 'text-foreground/50'}`}>Monthly</span>
               <button 
                onClick={() => setIsYearly(!isYearly)}
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

          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`bento-card p-10 flex flex-col ${plan.color} relative overflow-hidden group`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 p-8">
                     <div className="px-3 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">Popular</div>
                  </div>
                )}

                <div className="space-y-2 mb-10 text-left">
                   <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                   <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold text-foreground tracking-tighter">{plan.price}</span>
                      <span className="text-foreground/50 font-bold text-sm">/m</span>
                   </div>
                   <p className="text-foreground/60 text-xs font-semibold leading-relaxed">{plan.description}</p>
                </div>

                <div className="space-y-5 mb-12 flex-grow text-left">
                   {plan.features.map((feature, j) => (
                     <div key={j} className="flex items-start gap-3 text-xs font-semibold text-foreground/80 leading-relaxed">
                        <div className="h-5 w-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5 text-primary">
                           <Check className="h-3 w-3 text-primary" />
                        </div>
                        <span>{feature}</span>
                     </div>
                   ))}
                </div>

                <Link 
                  href="/signup" 
                  className={`w-full h-12 flex items-center justify-center rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                    plan.popular
                      ? "btn-pill-white !bg-primary hover:!bg-primary-hover !text-white !border-primary hover:!border-primary-hover"
                      : "btn-pill-glass !bg-foreground/5 hover:!bg-foreground/10 !text-foreground !border-card-border"
                  }`}
                >
                   {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-32 border-t border-card-border relative bg-card/25 backdrop-blur-md text-left">
         <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-12">
               {[
                 { icon: Shield, title: "Vault Security", desc: "Enterprise-grade encryption for all client data." },
                 { icon: Network, title: "Cloud Network", desc: "Distributed engine for 100% uptime." },
                 { icon: Fingerprint, title: "Secure Bypass", desc: "Intelligent discovery that avoids site blocks." },
                 { icon: Database, title: "Data Integrity", desc: "Verified business contact information only." },
               ].map((item, i) => (
                 <div key={i} className="space-y-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                       <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="text-xs font-black text-foreground uppercase tracking-widest">{item.title}</h4>
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
