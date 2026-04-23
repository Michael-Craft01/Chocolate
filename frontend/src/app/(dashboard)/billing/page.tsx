"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Zap, Globe, ShieldCheck, CreditCard, Loader2, PartyPopper, AlertCircle, X, History, Sparkles, Lock, Home } from "lucide-react";
import { authJson } from "@/lib/api";
import { motion } from "framer-motion";

const tiers = [
  {
    name: "Starter",
    price: 20,
    leads: "50 Leads / day",
    campaigns: "1 Engine",
    features: ["Magic Link Emails", "Mobile-Ready View", "Standard Search Speed", "CSV Data Export"],
    color: "bg-white/5",
  },
  {
    name: "Professional",
    price: 49,
    leads: "200 Leads / day",
    campaigns: "5 Engines",
    features: ["Discord Webhooks", "Magic Link Emails", "High-Speed Sweeps", "Priority AI Support"],
    color: "bg-primary/10 border-primary/20",
    popular: true,
  },
  {
    name: "Elite",
    price: 300,
    leads: "1,000 Leads / day",
    campaigns: "Unlimited Engines",
    features: ["Instant WhatsApp Alerts", "Discord Webhooks", "Deep-Dive AI Intelligence", "24/7 Priority Support"],
    color: "bg-white/5",
  },
];

interface Transaction {
  id: string;
  amount: number;
  gateway: string;
  status: string;
  type: string;
  createdAt: string;
  gatewayRef?: string;
}

function BillingContent() {
  const searchParams = useSearchParams();
  const [gateway, setGateway] = useState<"STRIPE" | "PAYNOW">("STRIPE");
  const [loading, setLoading] = useState<string | null>(null);
  const [showStatus, setShowStatus] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  const success = searchParams.get("success") === "true";
  const canceled = searchParams.get("canceled") === "true";

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoadingTransactions(true);
      const data = await authJson<Transaction[]>("/api/billing/transactions");
      setTransactions(data);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoadingTransactions(false);
    }
  };

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
    <div className="space-y-12 pb-20 font-sans">
      {/* Status Notifications */}
      {showStatus && (success || canceled) && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`glass-card border p-6 rounded-sm flex items-center justify-between  ${
            success ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400" : "border-amber-500/30 bg-amber-500/5 text-amber-400"
          }`}
        >
          <div className="flex items-center gap-5">
            <div className={`p-4 rounded-sm ${success ? "bg-emerald-500/10 glow-primary" : "bg-amber-500/10"}`}>
              {success ? <Check className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
            </div>
            <div>
              <p className="font-black text-xl tracking-tight">
                {success ? "Handshake Successful" : "Access Canceled"}
              </p>
              <p className="text-[13px] font-medium opacity-70 max-w-md leading-relaxed">
                {success 
                  ? "Your account is being updated. Your new capacity will be active in just a few moments." 
                  : "The process was canceled. No changes were made to your account."}
              </p>
            </div>
          </div>
          <button onClick={() => setShowStatus(false)} className="p-3 hover:bg-white/5 rounded-sm transition-all">
            <X className="h-5 w-5" />
          </button>
        </motion.div>
      )}

      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-primary text-[10px] font-black uppercase tracking-[0.3em]">
          <ShieldCheck className="h-4 w-4 glow-primary" /> Growth Selection
        </div>
        <h1 className="text-4xl font-black gradient-text tracking-tightest">Your Growth Plan</h1>
        <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-[0.15em] max-w-xl mx-auto">
          Choose the right path for your business discovery needs.
        </p>
      </div>

      {/* Gateway Toggle */}
      <div className="flex justify-center">
        <div className="glass-card p-1.5 rounded-sm flex gap-1.5 border border-white/5 ">
          <button 
            onClick={() => setGateway("STRIPE")}
            className={`flex items-center gap-3 px-8 py-3 rounded-sm text-[11px] font-black uppercase tracking-widest transition-all ${
              gateway === "STRIPE" ? "bg-primary text-white glow-primary" : "text-zinc-500 hover:text-white hover:bg-white/5"
            }`}
          >
            <Globe className="h-4 w-4" /> Global Trust (Credit Card)
          </button>
          <button 
            onClick={() => setGateway("PAYNOW")}
            className={`flex items-center gap-3 px-8 py-3 rounded-sm text-[11px] font-black uppercase tracking-widest transition-all ${
              gateway === "PAYNOW" ? "bg-primary text-white glow-primary" : "text-zinc-500 hover:text-white hover:bg-white/5"
            }`}
          >
            <Lock className="h-4 w-4" /> Local Safety (Paynow)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {tiers.map((tier) => (
          <div 
            key={tier.name} 
            className={`glass-card rounded-sm p-10 border flex flex-col relative group transition-all duration-500 ${
              tier.popular ? "border-primary/40 shadow-[0_0_50px_-12px_rgba(59,130,246,0.15)]" : "border-white/5"
            }`}
          >
            {tier.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary px-4 py-1.5 rounded-sm text-[9px] font-black uppercase tracking-[0.2em] glow-primary">
                Best Value
              </div>
            )}
            <div className="mb-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-6">{tier.name}</h3>
              <div className="flex items-baseline gap-1.5">
                <span className="text-5xl font-black tracking-tightest text-white">${tier.price}</span>
                <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest">/month</span>
              </div>
            </div>

            <div className="space-y-4 mb-10 flex-1">
              <div className="flex items-center gap-3 p-3 rounded-sm bg-white/[0.02] border border-white/5">
                <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
                <span className="text-[11px] text-zinc-300 font-bold uppercase tracking-widest">{tier.leads}</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-sm bg-white/[0.02] border border-white/5">
                <Home className="h-5 w-5 text-primary shrink-0 glow-primary" />
                <span className="text-[11px] text-zinc-300 font-bold uppercase tracking-widest">{tier.campaigns.replace('Engine', 'Discovery Hub')}</span>
              </div>
              <div className="pt-6 space-y-3">
                {tier.features.map((f) => (
                  <div key={f} className="flex items-start gap-3 text-[11px] text-zinc-500 font-medium leading-relaxed">
                    <Check className="h-3 w-3 mt-0.5 text-primary" />
                    {f}
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => handleSubscribe(tier.name)}
              disabled={!!loading}
              className={`w-full h-14 rounded-sm text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 flex flex-col items-center justify-center gap-0.5 ${
                tier.popular ? "bg-primary text-white hover:scale-[1.02] glow-primary" : "bg-white/5 hover:bg-white/10 text-white"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading === tier.name ? (
                <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Securing...</div>
              ) : (
                <>
                  <span>Choose {tier.name}</span>
                  <span className="text-[8px] tracking-[0.2em] opacity-70 normal-case font-bold flex items-center gap-1.5">
                    <Lock className="h-2 w-2" />
                    Secured by {gateway === "STRIPE" ? "Stripe" : "Paynow"}
                  </span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Credits Section */}
      <div className="glass-card rounded-sm p-12 mt-12 border border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-sm  -mr-64 -mt-64 group-hover:bg-primary/10 transition-colors" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
          <div className="space-y-4 max-w-lg text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 text-primary text-[10px] font-black uppercase tracking-[0.3em]">
              <CreditCard className="h-4 w-4 glow-primary" /> Quick Boost
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white">Extra Growth Credits</h2>
            <p className="text-[13px] text-zinc-500 leading-relaxed font-medium">
              Need to find more businesses today? Add a quick boost of discovery credits to your account.
              Available instantly, no expiration.
            </p>
          </div>
          <div className="flex flex-col items-center gap-6 min-w-[240px]">
            <div className="text-center">
              <span className="text-5xl font-black tracking-tightest text-white">$10</span>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em] mt-2">100 DISCOVERIES</p>
            </div>
            <button 
              onClick={handleBuyCredits}
              disabled={!!loading}
              className="w-full h-14 px-10 rounded-sm bg-white text-black text-[11px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all hover:scale-[1.02] flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading === "CREDITS" && <Loader2 className="h-4 w-4 animate-spin text-black" />}
              {loading === "CREDITS" ? "Processing..." : "Add Credits"}
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 text-zinc-300">
          <div className="h-8 w-8 rounded-sm bg-white/5 flex items-center justify-center">
            <History className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-xs font-black uppercase tracking-[0.2em]">Billing History</h2>
        </div>
        
        <div className="glass-card rounded-sm border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.03] text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  <th className="px-8 py-5 font-black">Record ID</th>
                  <th className="px-8 py-5 font-black">Date</th>
                  <th className="px-8 py-5 font-black">Service</th>
                  <th className="px-8 py-5 font-black text-center">Amount</th>
                  <th className="px-8 py-5 font-black text-center">Gateway</th>
                  <th className="px-8 py-5 font-black text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loadingTransactions ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center text-zinc-600">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-4" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Loading Records...</span>
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em]">
                      No billing records found.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="text-[12px] hover:bg-white/[0.01] transition-all group">
                      <td className="px-8 py-4 font-mono text-zinc-500 group-hover:text-primary transition-colors">
                        {tx.id.substring(0, 12)}
                      </td>
                      <td className="px-8 py-4 text-zinc-500 font-medium">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-4">
                        <span className="px-2 py-1 rounded-sm bg-white/5 text-[9px] font-black uppercase tracking-[0.1em] text-zinc-400">
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-8 py-4 font-black text-white text-center">
                        ${tx.amount}
                      </td>
                      <td className="px-8 py-4 text-center">
                        <span className={`px-2 py-1 rounded-sm text-[9px] font-black uppercase tracking-[0.1em] ${
                          tx.gateway === 'PAYNOW' ? 'bg-amber-500/10 text-amber-500/80' : 'bg-blue-500/10 text-blue-500/80'
                        }`}>
                          {tx.gateway}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <span className={`px-3 py-1 rounded-sm text-[9px] font-black uppercase tracking-[0.2em] ${
                          tx.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' : 
                          tx.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>}>
      <BillingContent />
    </Suspense>
  );
}
