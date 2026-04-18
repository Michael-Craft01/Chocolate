"use client";

import { useState } from "react";
import { Check, Zap, Globe, ShieldCheck, CreditCard } from "lucide-react";

const tiers = [
  {
    name: "Starter",
    price: 20,
    leads: "50 Leads / day",
    campaigns: "1 Campaign",
    features: ["Standard Priority", "Email Support", "CSV Export"],
    color: "bg-white/5",
  },
  {
    name: "Professional",
    price: 49,
    leads: "200 Leads / day",
    campaigns: "5 Campaigns",
    features: ["High Priority", "Priority Email", "API Access"],
    color: "bg-primary/10 border-primary/20",
    popular: true,
  },
  {
    name: "Elite",
    price: 300,
    leads: "1,000 Leads / day",
    campaigns: "Unlimited",
    features: ["Real-time Processing", "WhatsApp Support", "Custom AI Models"],
    color: "bg-white/5",
  },
];

export default function BillingPage() {
  const [gateway, setGateway] = useState<"STRIPE" | "PAYNOW">("STRIPE");

  return (
    <div className="space-y-10 pb-20">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text">Choose Your Plan</h1>
        <p className="text-zinc-400 max-w-lg mx-auto">
          Scale your lead generation with our tiered plans. All plans include 
          AI enrichment and real-time Discord notifications.
        </p>
      </div>

      {/* Gateway Toggle */}
      <div className="flex justify-center">
        <div className="glass p-1 rounded-xl flex gap-1">
          <button 
            onClick={() => setGateway("STRIPE")}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              gateway === "STRIPE" ? "bg-primary text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Globe className="h-4 w-4" /> Global (Stripe)
          </button>
          <button 
            onClick={() => setGateway("PAYNOW")}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              gateway === "PAYNOW" ? "bg-primary text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Zap className="h-4 w-4" /> Local (Paynow)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {tiers.map((tier) => (
          <div 
            key={tier.name} 
            className={`glass rounded-2xl p-8 border flex flex-col relative ${
              tier.popular ? "border-primary/50 shadow-2xl shadow-primary/10" : "border-white/5"
            }`}
          >
            {tier.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Most Popular
              </div>
            )}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">${tier.price}</span>
                <span className="text-zinc-500 text-sm">/month</span>
              </div>
            </div>

            <div className="space-y-4 mb-10 flex-1">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
                <span className="text-sm text-zinc-300 font-medium">{tier.leads}</span>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm text-zinc-300 font-medium">{tier.campaigns}</span>
              </div>
              <div className="pt-4 space-y-3">
                {tier.features.map((f) => (
                  <div key={f} className="flex items-start gap-3 text-xs text-zinc-400">
                    <Check className="h-3 w-3 mt-0.5 text-zinc-500" />
                    {f}
                  </div>
                ))}
              </div>
            </div>

            <button className={`w-full h-12 rounded-xl font-bold transition-all active:scale-95 ${
              tier.popular ? "bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20" : "bg-white/5 hover:bg-white/10 text-white"
            }`}>
              Subscribe with {gateway === 'STRIPE' ? 'Stripe' : 'Paynow'}
            </button>
          </div>
        ))}
      </div>

      {/* Credits Section */}
      <div className="glass rounded-2xl p-10 mt-20 border border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-md">
            <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest">
              <CreditCard className="h-4 w-4" /> Overage Credits
            </div>
            <h2 className="text-3xl font-bold">Need more leads?</h2>
            <p className="text-zinc-400 text-sm">
              Top up your account with credits to keep the engine running after your 
              daily quota is hit. Credits never expire.
            </p>
          </div>
          <div className="flex flex-col items-center gap-4 min-w-[200px]">
            <div className="text-center">
              <span className="text-3xl font-bold">$10</span>
              <span className="text-zinc-500 text-sm"> / 100 Credits</span>
            </div>
            <button className="w-full h-12 px-8 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 transition-colors shadow-xl">
              Buy Credits
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
