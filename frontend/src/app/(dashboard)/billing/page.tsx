"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, Check, Zap, Compass, ShieldCheck, CreditCard, Loader2, X, History, Sparkles } from "lucide-react";
import { authJson } from "@/lib/api";
import type { Stats } from "@/lib/types";
import { motion } from "framer-motion";
import { BrandedLoader } from "@/components/BrandedLoader";
import { toast } from "sonner";

const tiers = [
  {
    name: "Starter",
    price: 20,
    leads: "4 cycles / month",
    campaigns: "25 leads / cycle",
    features: ["Automatic weekly cycles", "Mobile-ready view", "Standard search speed", "CSV data export"],
    color: "bg-white/5",
  },
  {
    name: "Professional",
    price: 49,
    leads: "15 cycles / month",
    campaigns: "40 leads / cycle",
    features: ["Automatic cycles every 2 days", "Discord webhooks", "High-speed sweeps", "Priority AI support"],
    color: "bg-primary/10 border-primary/20",
    popular: true,
  },
  {
    name: "Elite",
    price: 300,
    leads: "40 cycles / month",
    campaigns: "75 leads / cycle",
    features: ["Automatic daily cycles", "Discord webhooks", "Deep-dive AI intelligence", "24/7 priority support"],
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
  const [userTier, setUserTier] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const success = searchParams.get("success") === "true";
  const canceled = searchParams.get("canceled") === "true";

  useEffect(() => {
    fetchTransactions();
    fetchUserStatus();
  }, []);

  const fetchUserStatus = async () => {
    try {
      const data = await authJson<{ tier: string }>("/api/me");
      setUserTier(data.tier);
      setStats(await authJson<Stats>("/api/stats"));
    } catch (err: any) {
      console.error("Profile status error:", err);
      setError("Unable to sync account status.");
    }
  };

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
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const handleBuyCycles = async () => {
    try {
      setLoading("CYCLE_PACK");
      const { url } = await authJson<{ url: string }>("/api/billing/create-checkout", {
        method: "POST",
        body: JSON.stringify({
          method: gateway,
          tier: "CYCLE_PACK",
          amount: 10,
        }),
      });

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Credit purchase error:", error);
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20 font-sans px-4">
      {/* Status Notifications */}
      {showStatus && (success || canceled) && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center justify-between p-6 rounded-[24px] border text-left ${
            success 
              ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-600" 
              : "border-amber-500/20 bg-amber-500/5 text-amber-600"
          }`}
        >
          <div className="flex items-center gap-5">
            <div className={`p-3.5 rounded-full ${success ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}`}>
              {success ? <Check className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
            </div>
            <div>
              <p className="font-bold text-lg tracking-tight">
                {success ? "Payment Securely Received" : "Payment Canceled"}
              </p>
              <p className="text-sm opacity-80 leading-relaxed font-semibold">
                {success 
                  ? "Your transaction has completed successfully. Your new plan is now active." 
                  : "The checkout process was canceled. No charges were billed to your card."}
              </p>
            </div>
          </div>
          <button onClick={() => setShowStatus(false)} className="p-2 hover:bg-foreground/5 rounded-full transition-all cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </motion.div>
      )}

      {/* Header Deck */}
      <div className="text-center space-y-4 pt-10 border-b border-foreground/5 pb-10">
        <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
          <ShieldCheck className="h-4 w-4" /> Plans & Pricing
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">Billing Dashboard</h1>
        <p className="text-sm text-foreground/60 max-w-xl mx-auto">
          Select a pipeline growth tier or buy extra automatic discovery cycles for HyprLead AI.
        </p>
        {userTier === null && (
          <div className="p-3 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 mt-4">
            <Loader2 className="h-3 w-3 animate-spin" /> Account Sync Delayed - Reconnecting...
          </div>
        )}
        <div className="pt-2">
            <button onClick={async () => {
                try {
                  setLoading('SYNC');
                  await authJson('/api/payments/stripe/sync', { method: 'POST' });
                  await fetchUserStatus();
                  toast.success("Account status updated successfully!");
                } catch (e) {
                  toast.error("Sync failed. If you just paid, please wait 30 seconds and try again.");
                } finally {
                  setLoading(null);
                }
              }}
              disabled={loading === 'SYNC'}
              className="px-6 py-2.5 rounded-full bg-foreground/[0.03] hover:bg-foreground/[0.06] border border-foreground/10 text-xs font-bold uppercase tracking-wider text-foreground hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 mx-auto cursor-pointer"
            >
              {loading === 'SYNC' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 text-primary" />}
              {loading === 'SYNC' ? "Verifying..." : "Update Account Status"}
            </button>
        </div>
      </div>

      {/* Gateway Toggle */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Cycles Left", value: stats?.cycles?.remaining ?? 0 },
          { label: "Monthly Allowance", value: stats?.cycles?.monthlyLimit ?? 0 },
          { label: "Leads / Cycle", value: stats?.cycles?.leadsPerCycle ?? 0 },
          { label: "Mode", value: stats?.cycles?.automationMode || "MANUAL" },
        ].map((item) => (
          <div key={item.label} className="bento-card !p-5 text-left">
            <p className="text-[9px] font-black uppercase tracking-widest text-foreground/45">{item.label}</p>
            <p className="mt-2 text-2xl font-black tracking-tight text-foreground">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Gateway Toggle */}
      <div className="flex justify-center">
        <div className="bg-foreground/[0.03] p-1.5 rounded-full flex gap-1.5 border border-foreground/5 max-w-sm w-full">
          <button type="button" onClick={() => setGateway("STRIPE")}
            className={`flex-1 flex items-center justify-center gap-3 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              gateway === "STRIPE" 
                ? "bg-primary text-white shadow-md shadow-primary/20" 
                : "text-foreground/50 hover:text-foreground hover:bg-foreground/[0.03]"
            }`}
          >
            <CreditCard className="h-4 w-4" /> Card (Stripe)
          </button>
          <button type="button" onClick={() => setGateway("PAYNOW")}
            className={`flex-1 flex items-center justify-center gap-3 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              gateway === "PAYNOW" 
                ? "bg-primary text-white shadow-md shadow-primary/20" 
                : "text-foreground/50 hover:text-foreground hover:bg-foreground/[0.03]"
            }`}
          >
            <ShieldCheck className="h-4 w-4" /> Local (Paynow)
          </button>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {tiers.map((tier) => (
          <div 
            key={tier.name} 
            className={`bento-card relative flex flex-col transition-all duration-300 ${
              tier.popular ? "ring-2 ring-primary/40 shadow-xl" : ""
            }`}
          >
            {tier.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-primary/30">
                Best Value
              </div>
            )}
            
            <div className="mb-6 relative text-left">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/50">{tier.name}</h3>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-foreground/[0.03] border border-foreground/5">
                  {gateway === "STRIPE" ? <Compass className="h-3.5 w-3.5 text-blue-400" /> : <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />}
                  <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/70">{gateway}</span>
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl md:text-5xl font-black text-foreground">$</span>
                <span className="text-5xl md:text-6xl font-black text-foreground tracking-tight">{tier.price}</span>
                <span className="text-xs font-bold uppercase tracking-wider text-foreground/50 ml-2">/ month</span>
              </div>
            </div>

            <div className="space-y-4 mb-8 flex-1 text-left">
              <div className="flex items-center gap-3 p-3.5 rounded-full bg-foreground/[0.02] border border-foreground/5">
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs text-foreground/80 font-bold uppercase tracking-wider">{tier.leads}</span>
              </div>
              <div className="flex items-center gap-3 p-3.5 rounded-full bg-foreground/[0.02] border border-foreground/5">
                <Compass className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs text-foreground/80 font-bold uppercase tracking-wider">{tier.campaigns.replace('Discovery Hub', 'Search Area')}</span>
              </div>
              <div className="pt-6 space-y-3">
                {tier.features.map((f) => (
                  <div key={f} className="flex items-start gap-3 text-xs text-foreground/60 font-semibold leading-relaxed">
                    <Check className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => handleSubscribe(tier.name)}
              disabled={!!loading || userTier === tier.name.toUpperCase()}
              className={`w-full h-12 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                userTier === tier.name.toUpperCase() 
                  ? "bg-primary/10 text-primary border border-primary/20" 
                  : tier.popular ? "bg-primary text-white hover:scale-[1.02] shadow-md shadow-primary/25" : "bg-foreground/[0.03] hover:bg-foreground/[0.06] text-foreground border border-foreground/5"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading === tier.name ? (
                <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Securing...</div>
              ) : userTier === tier.name.toUpperCase() ? (
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider"><Check className="h-4 w-4" /> Current Plan</div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="font-bold">Select {tier.name}</span>
                </div>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Extra Cycles Section */}
      <div className="bento-card p-10 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent opacity-50 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full -mr-48 -mt-48 group-hover:bg-primary/15 transition-all duration-700 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="space-y-3 max-w-xl text-left">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
              <CreditCard className="h-4 w-4 animate-pulse" /> Cycle Packs
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Extra Cycles</h2>
            <p className="text-sm text-foreground/75 leading-relaxed">
              Need to sweep more local markets this month? Purchase extra discovery cycles instantly. Cycle packs add to your current balance.
            </p>
          </div>
          <div className="flex flex-col items-center sm:flex-row gap-6 min-w-[280px] shrink-0">
            <div className="text-center sm:text-right shrink-0">
              <div className="flex items-baseline justify-center sm:justify-end gap-1">
                <span className="text-3xl font-black text-foreground">$</span>
                <span className="text-5xl font-black text-foreground tracking-tight">10</span>
              </div>
              <p className="text-[10px] text-foreground/50 font-bold uppercase tracking-wider mt-1">5 Discovery Cycles</p>
            </div>
            <button onClick={handleBuyCycles} disabled={!!loading} className="w-full sm:w-auto h-12 px-8 rounded-full bg-foreground text-background hover:bg-foreground/90 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl shadow-foreground/5 hover:scale-[1.02] active:scale-[0.98] cursor-pointer" >
              {loading === "CYCLE_PACK" && <Loader2 className="h-4 w-4 animate-spin text-background" />}
              {loading === "CYCLE_PACK" ? "Processing..." : "Add Cycles"}
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="space-y-6 text-left">
        <div className="flex items-center gap-3 text-foreground">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <History className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Transaction Log</h2>
            <p className="text-xs text-foreground/60">Review your past cycle packs and subscriptions straight from the database</p>
          </div>
        </div>
        
        <div className="bento-card overflow-hidden !p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-foreground/[0.02] text-xs uppercase tracking-wider text-foreground/60 border-b border-foreground/5">
                  <th className="px-8 py-5 font-bold">Record ID</th>
                  <th className="px-8 py-5 font-bold">Date</th>
                  <th className="px-8 py-5 font-bold">Service</th>
                  <th className="px-8 py-5 font-bold text-center">Amount</th>
                  <th className="px-8 py-5 font-bold text-center">Gateway</th>
                  <th className="px-8 py-5 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5 text-sm">
                {loadingTransactions ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center text-foreground/50">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-4 text-primary" />
                      <span className="text-xs font-bold uppercase tracking-wider">Syncing Secure Records...</span>
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center text-foreground/50 text-xs font-bold uppercase tracking-wider">
                      No billing records found.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-foreground/[0.01] transition-all group">
                      <td className="px-8 py-4 font-mono text-xs text-foreground/60 group-hover:text-primary transition-colors">
                        {tx.id.substring(0, 12).toUpperCase()}
                      </td>
                      <td className="px-8 py-4 text-foreground/70 font-semibold">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-4">
                        <span className="px-3 py-1 rounded-full bg-foreground/[0.04] text-[10px] font-bold uppercase tracking-wider text-foreground/80 border border-foreground/5">
                          {tx.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-8 py-4 font-bold text-foreground text-center">
                        ${tx.amount.toFixed(2)}
                      </td>
                      <td className="px-8 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          tx.gateway === 'PAYNOW' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                        }`}>
                          {tx.gateway}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                          tx.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 
                          tx.status === 'PENDING' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'
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
    <Suspense fallback={<BrandedLoader message="Connecting to secure gateway..." />}>
      <BillingContent />
    </Suspense>
  );
}
