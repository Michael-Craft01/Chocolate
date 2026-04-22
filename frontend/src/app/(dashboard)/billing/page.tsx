"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Zap, Globe, ShieldCheck, CreditCard, Loader2, PartyPopper, AlertCircle, X } from "lucide-react";
import { authJson } from "@/lib/api";

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

function BillingContent() {
  const searchParams = useSearchParams();
  const [gateway, setGateway] = useState<"STRIPE" | "PAYNOW">("STRIPE");
  const [loading, setLoading] = useState<string | null>(null);
  const [showStatus, setShowStatus] = useState(true);

  const success = searchParams.get("success") === "true";
  const canceled = searchParams.get("canceled") === "true";

  const handleSubscribe = async (tierName: string) => {
    try {
      setLoading(tierName);
      const { url } = await authJson<{ url: string }>("/api/billing/create-checkout", {
        method: "POST",
        body: JSON.stringify({
          method: gateway,
          tier: tierName.toUpperCase(),
        }),
      });

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Subscription error:", error);
      alert("Failed to start checkout. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const handleBuyCredits = async () => {
    try {
      setLoading("CREDITS");
      const { url } = await authJson<{ url: string }>("/api/billing/create-checkout", {
        method: "POST",
        body: JSON.stringify({
          method: gateway,
          tier: "CREDIT",
          amount: 10,
        }),
      });

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Credit purchase error:", error);
      alert("Failed to start checkout. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Status Notifications */}
      {showStatus && (success || canceled) && (
        <div className={`glass border p-4 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500 ${
          success ? "border-emerald-500/50 bg-emerald-500/5 text-emerald-400" : "border-amber-500/50 bg-amber-500/5 text-amber-400"
        }`}>
          <div className="flex items-center gap-3">
            {success ? <PartyPopper className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <div>
              <p className="font-bold text-sm">
                {success ? "Payment Successful!" : "Payment Canceled"}
              </p>
              <p className="text-xs opacity-80">
                {success 
                  ? "Your account is being provisioned. Your new limits will be active shortly." 
                  : "No charges were made. You can try again whenever you're ready."}
              </p>
            </div>
          </div>
          <button onClick={() => setShowStatus(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

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
            className={`glass rounded-2xl p-8 border flex flex-col relative interactive-card ${
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

            <button 
              onClick={() => handleSubscribe(tier.name)}
              disabled={!!loading}
              className={`w-full h-12 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 ${
                tier.popular ? "bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20" : "bg-white/5 hover:bg-white/10 text-white"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading === tier.name && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading === tier.name ? "Redirecting..." : `Subscribe with ${gateway === 'STRIPE' ? 'Stripe' : 'Paynow'}`}
            </button>
          </div>
        ))}
      </div>

      {/* Credits Section */}
      <div className="glass rounded-2xl p-10 mt-20 border border-white/5 relative overflow-hidden group interactive-card">
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
            <button 
              onClick={handleBuyCredits}
              disabled={!!loading}
              className="w-full h-12 px-8 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 transition-colors shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading === "CREDITS" && <Loader2 className="h-4 w-4 animate-spin text-black" />}
              {loading === "CREDITS" ? "Redirecting..." : "Buy Credits"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BillingContent />
    </Suspense>
  );
}


