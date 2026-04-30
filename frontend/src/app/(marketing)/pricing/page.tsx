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
      color: "border-white/10"
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
      color: "border-white/20"
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
    <div className="bg-black min-h-screen selection:bg-primary/30">
      <Navbar />
      
      {/* Background Blobs (Reference Image 2) */}
      <div className="bg-blob bg-blue top-[10%] left-[20%] opacity-10" />
      <div className="bg-blob bg-primary bottom-[20%] right-[10%] opacity-10" />

      <section className="relative pt-48 pb-32 overflow-hidden px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-6">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-7xl md:text-9xl font-bold tracking-tightest text-white leading-none"
            >
              Pricing
            </motion.h1>
            
            {/* Toggle (Reference Image 2) */}
            <div className="flex items-center justify-center gap-4 mt-12">
               <span className={`text-sm font-bold ${!isYearly ? 'text-white' : 'text-zinc-500'}`}>Monthly</span>
               <button 
                onClick={() => setIsYearly(!isYearly)}
                className="w-14 h-7 rounded-full bg-white/10 border border-white/10 p-1 flex items-center transition-all"
               >
                  <motion.div 
                    animate={{ x: isYearly ? 28 : 0 }}
                    className="h-5 w-5 rounded-full bg-white shadow-lg"
                  />
               </button>
               <span className={`text-sm font-bold ${isYearly ? 'text-white' : 'text-zinc-500'}`}>Yearly</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`glass-morphism p-10 rounded-[32px] flex flex-col ${plan.color} relative overflow-hidden group`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 p-8">
                     <div className="px-3 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">Popular</div>
                  </div>
                )}

                <div className="space-y-2 mb-10">
                   <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                   <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold text-white tracking-tighter">{plan.price}</span>
                      <span className="text-zinc-500 font-bold text-sm">/m</span>
                   </div>
                   <p className="text-zinc-500 text-sm font-medium leading-relaxed">{plan.description}</p>
                </div>

                <div className="space-y-5 mb-12 flex-grow">
                   {plan.features.map((feature, j) => (
                     <div key={j} className="flex items-start gap-3">
                        <div className="h-5 w-5 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                           <Check className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-sm font-medium text-zinc-300">{feature}</span>
                     </div>
                   ))}
                </div>

                <Link href="/signup" className="btn-pill-white w-full">
                   {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-32 border-t border-white/5 relative bg-black/50 backdrop-blur-md">
         <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-12">
               {[
                 { icon: Shield, title: "Vault Security", desc: "Enterprise-grade encryption for all client data." },
                 { icon: Network, title: "Cloud Network", desc: "Distributed engine for 100% uptime." },
                 { icon: Fingerprint, title: "Secure Bypass", desc: "Intelligent discovery that avoids site blocks." },
                 { icon: Database, title: "Data Integrity", desc: "Verified business contact information only." },
               ].map((item, i) => (
                 <div key={i} className="space-y-4">
                    <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                       <item.icon className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-widest">{item.title}</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed font-medium">{item.desc}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      <Footer />
    </div>
  );
}
