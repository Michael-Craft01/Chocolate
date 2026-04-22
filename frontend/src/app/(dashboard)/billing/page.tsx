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

      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text">Subscription & Billing</h1>
        <p className="text-zinc-400 max-w-lg mx-auto">
          Manage your subscription, top up credits, and view your transaction history.
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
      <div className="glass rounded-2xl p-10 mt-10 border border-white/5 relative overflow-hidden group interactive-card">
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

      {/* Transaction History Table */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-zinc-300 font-bold">
          <History className="h-5 w-5 text-primary" />
          <h2>Billing History</h2>
        </div>
        
        <div className="glass rounded-2xl border border-white/5 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-xs uppercase tracking-wider text-zinc-500">
                <th className="px-6 py-4 font-bold">Transaction ID</th>
                <th className="px-6 py-4 font-bold">Date</th>
                <th className="px-6 py-4 font-bold">Type</th>
                <th className="px-6 py-4 font-bold">Amount</th>
                <th className="px-6 py-4 font-bold text-center">Gateway</th>
                <th className="px-6 py-4 font-bold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loadingTransactions ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-zinc-500">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                    Loading history...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-zinc-500">
                    No transactions found yet.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="text-sm hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs text-zinc-500 group-hover:text-zinc-300">
                      {tx.id.substring(0, 12)}...
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-md bg-white/5 text-[10px] font-bold uppercase">
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold">
                      ${tx.amount}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                        tx.gateway === 'PAYNOW' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {tx.gateway}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
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
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BillingContent />
    </Suspense>
  );
}
