"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Zap, Globe, ShieldCheck, CreditCard, Loader2, PartyPopper, AlertCircle, X, History, ExternalLink } from "lucide-react";
import { authJson } from "@/lib/api";

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
    <div className="space-y-10 pb-20">
      {/* Status Notifications */}
      {showStatus && (success || canceled) && (
        <div className={`glass border p-6 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500 shadow-2xl ${
          success ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400" : "border-amber-500/50 bg-amber-500/10 text-amber-400"
        }`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${success ? "bg-emerald-500/20" : "bg-amber-500/20"}`}>
              {success ? <PartyPopper className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
            </div>
            <div>
              <p className="font-bold text-lg">
                {success ? "Payment Successful!" : "Payment Canceled"}
              </p>
              <p className="text-sm opacity-80 max-w-md">
                {success 
                  ? "Your account is being provisioned. We are syncing with the payment gateway—your new limits will be active in a few seconds." 
                  : "No charges were made. You can try again whenever you're ready."}
              </p>
            </div>
          </div>
          <button onClick={() => setShowStatus(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black gradient-text tracking-tighter">Account Scaling</h1>
        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">
          Manage infrastructure resources and engine processing limits.
        </p>
      </div>

      {/* Gateway Toggle */}
      <div className="flex justify-center">
        <div className="glass p-1 rounded-xl flex gap-1 border border-white/5 shadow-xl">
          <button 
            onClick={() => setGateway("STRIPE")}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
              gateway === "STRIPE" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-zinc-500 hover:text-white"
            }`}
          >
            <Globe className="h-3 w-3" /> Global (Stripe)
          </button>
          <button 
            onClick={() => setGateway("PAYNOW")}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
              gateway === "PAYNOW" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-zinc-500 hover:text-white"
            }`}
          >
            <Zap className="h-3 w-3" /> Local (Paynow)
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
            )            <div className="mb-6">
              <h3 className="text-sm font-black uppercase tracking-widest mb-1">{tier.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black tracking-tighter">${tier.price}</span>
                <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">/month</span>
              </div>
            </div>

            <div className="space-y-3 mb-8 flex-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="text-xs text-zinc-400 font-bold uppercase tracking-tighter">{tier.leads}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs text-zinc-400 font-bold uppercase tracking-tighter">{tier.campaigns}</span>
              </div>
              <div className="pt-3 space-y-2">
                {tier.features.map((f) => (
                  <div key={f} className="flex items-start gap-2 text-[10px] text-zinc-500 font-medium">
                    <Check className="h-2.5 w-2.5 mt-0.5 text-zinc-600" />
                    {f}
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => handleSubscribe(tier.name)}
              disabled={!!loading}
              className={`w-full h-10 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 ${
                tier.popular ? "bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20" : "bg-white/5 hover:bg-white/10 text-white"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading === tier.name && <Loader2 className="h-3 w-3 animate-spin" />}
              {loading === tier.name ? "Redirecting..." : `Select ${tier.name}`}
            </button>
          </div>
        ))}
      </div>

      {/* Credits Section */}
      <div className="glass rounded-2xl p-8 mt-10 border border-white/5 relative overflow-hidden group interactive-card">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 max-w-md">
            <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
              <CreditCard className="h-3.5 w-3.5" /> Overage Credits
            </div>
            <h2 className="text-xl font-black tracking-tight">Expand Quota Instantly</h2>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              Top up your engine with credits to keep searching after your 
              daily limit is reached. Non-expiring high-priority capacity.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 min-w-[200px]">
            <div className="text-center">
              <span className="text-2xl font-black tracking-tight">$10</span>
              <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest"> / 100 Leads</span>
            </div>
            <button 
              onClick={handleBuyCredits}
              disabled={!!loading}
              className="w-full h-10 px-8 rounded-lg bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading === "CREDITS" && <Loader2 className="h-3 w-3 animate-spin text-black" />}
              {loading === "CREDITS" ? "Redirecting..." : "Acquire Credits"}
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-zinc-300">
          <History className="h-4 w-4 text-primary" />
          <h2 className="text-xs font-black uppercase tracking-widest">Telemetry Log</h2>
        </div>
        
        <div className="glass rounded-xl border border-white/5 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] text-[10px] uppercase tracking-[0.15em] text-zinc-500">
                <th className="px-6 py-3 font-black">ID</th>
                <th className="px-6 py-3 font-black">Timestamp</th>
                <th className="px-6 py-3 font-black">Type</th>
                <th className="px-6 py-3 font-black">Amount</th>
                <th className="px-6 py-3 font-black text-center">Node</th>
                <th className="px-6 py-3 font-black text-right">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loadingTransactions ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-zinc-500">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Fetching telemetry...</span>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                    No records found.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="text-[11px] hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-3 font-mono text-zinc-500 group-hover:text-zinc-300">
                      {tx.id.substring(0, 8)}
                    </td>
                    <td className="px-6 py-3 text-zinc-500 font-medium">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3">
                      <span className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] font-black uppercase tracking-tighter text-zinc-400">
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-black text-zinc-300">
                      ${tx.amount}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-black tracking-tighter ${
                        tx.gateway === 'PAYNOW' ? 'bg-amber-500/10 text-amber-500/70' : 'bg-blue-500/10 text-blue-500/70'
                      }`}>
                        {tx.gateway}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
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
      </div>v>
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
