"use client";

import { useState, useEffect } from "react";
import { 
  Mail, Crown, Calendar, ShieldCheck, CreditCard, History, ArrowRight, 
  Zap, AlertCircle, Shield, Building, Award, Target, Activity
} from "lucide-react";
import { authJson } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { BrandedLoader } from "@/components/BrandedLoader";

interface UserProfile {
  id: string;
  email: string;
  tier: string;
  paymentStatus: string;
  createdAt: string;
}

interface Transaction {
  id: string;
  amount: number;
  gateway: string;
  status: string;
  type: string;
  createdAt: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [userData, txData, statsData] = await Promise.all([
        authJson<UserProfile>("/api/me"),
        authJson<Transaction[]>("/api/billing/transactions").catch(() => []),
        authJson<any>("/api/stats").catch(() => null)
      ]);

      setProfile(userData);
      setTransactions(txData);
      setStats(statsData);
    } catch (err: any) {
      console.error("Profile fetch error:", err);
      setError(err.message || "Failed to load profile details. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <BrandedLoader message="Loading account details..." />;
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center px-6">
        <div className="h-20 w-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
           <AlertCircle className="h-10 w-10 text-red-550" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Access Error</h2>
          <p className="text-foreground/60 max-w-sm mx-auto font-semibold">{error || "Your account profile could not be retrieved. Try signing in again."}</p>
        </div>
        <button onClick={fetchData} className="btn-pill-white !bg-primary !text-white hover:!bg-primary-hover h-12 px-8 cursor-pointer" >
          Try Again
        </button>
      </div>
    );
  }

  const initial = profile.email ? profile.email.charAt(0).toUpperCase() : "A";
  const memberSince = profile.createdAt 
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) 
    : 'April 2024';

  const cycleLimit = stats?.cycles?.monthlyLimit || 0;
  const cyclesRemaining = stats?.cycles?.remaining || 0;
  const cyclesUsed = stats?.cycles?.usedThisPeriod || Math.max(0, cycleLimit - cyclesRemaining);
  const quotaPercent = cycleLimit ? Math.min(100, Math.max(0, (cyclesUsed / cycleLimit) * 100)) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24 font-sans selection:bg-primary/20">
      
      {/* Sales Agent Dossier Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-6 border-b border-card-border pb-6">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center text-primary font-black text-2xl shadow-sm shadow-primary/20 select-none animate-pulse shrink-0">
            {initial}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-primary/15 border border-primary/20 text-primary text-[8px] font-black uppercase tracking-widest">
                Growth Agent
              </span>
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{profile.email.split('@')[0]}</h1>
            <p className="text-[10px] font-black text-foreground/50 uppercase tracking-widest">Sales Account Details</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-full border flex items-center gap-2 shadow-sm ${
            profile.paymentStatus === 'active' 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
              : "bg-amber-500/10 border-amber-500/20 text-amber-500"
          }`}>
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {profile.paymentStatus === 'active' ? 'Active Enterprise' : 'Basic Account'}
            </span>
          </div>
        </div>
      </div>

      {/* Grid Dashboard Options */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Agent Credentials (4 columns) */}
        <div className="lg:col-span-4 bento-card flex flex-col justify-between p-8 border border-card-border">
          <div className="space-y-6">
            <div className="flex items-center gap-2.5 text-foreground/80 border-b border-card-border pb-3">
              <Award className="h-4.5 w-4.5 text-primary" />
              <h2 className="text-[10px] font-black uppercase tracking-widest">Credentials Profile</h2>
            </div>
            
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-background border border-card-border flex items-center gap-3.5 shadow-sm">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <div className="overflow-hidden">
                  <p className="text-[8px] font-black text-foreground/50 uppercase tracking-widest">Corporate Mail</p>
                  <p className="text-xs font-bold text-foreground truncate">{profile.email}</p>
                </div>
              </div>
              
              <div className="p-4 rounded-2xl bg-background border border-card-border flex items-center gap-3.5 shadow-sm">
                <Crown className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="text-[8px] font-black text-foreground/50 uppercase tracking-widest">Active Tier</p>
                  <p className="text-xs font-black text-primary tracking-widest uppercase">{profile.tier} Plan</p>
                </div>
              </div>
              
              <div className="p-4 rounded-2xl bg-background border border-card-border flex items-center gap-3.5 shadow-sm">
                <Calendar className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="text-[8px] font-black text-foreground/50 uppercase tracking-widest">Enrollment</p>
                  <p className="text-xs font-bold text-foreground">{memberSince}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 text-center text-[9px] font-black text-foreground/40 uppercase tracking-widest">
            Profile secure · ID: {profile.id.substring(0, 8)}
          </div>
        </div>

        {/* Right Side: Quota & Performance Command Deck (8 columns) */}
        <div className="lg:col-span-8 bento-card p-8 bg-primary/5 border border-primary/10 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
          
          <div className="relative space-y-6 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-primary/10 pb-3 mb-6">
                <div className="flex items-center gap-2.5 text-foreground">
                  <Target className="h-4.5 w-4.5 text-primary" />
                  <h2 className="text-[10px] font-black uppercase tracking-widest">Quota Performance</h2>
                </div>
                <span className="px-3 py-1 rounded-full bg-primary text-white text-[8px] font-black uppercase tracking-[0.25em] shadow-md shadow-primary/20">
                  {profile.tier === 'FREE' ? 'STARTER LIMIT' : 'ENTERPRISE CAP'}
                </span>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-3xl font-extrabold tracking-tight text-foreground">
                    {profile.tier === 'FREE' ? 'Standard Tier Outbounds' : `Professional ${profile.tier} Operations`}
                  </p>
                  <p className="text-xs text-foreground/75 font-semibold mt-2 leading-relaxed max-w-xl">
                    {profile.tier === 'FREE' 
                      ? "Your account is active on our basic tier. Upgrade your professional sales membership to unlock automatic lead searches." 
                      : "Your sales agent seat is active and optimized. Searches run automatically from your monthly credit balance."}
                  </p>
                </div>

                {/* Quota Progress Meter */}
                <div className="space-y-2 p-5 rounded-2xl bg-background border border-card-border shadow-sm">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[9px] font-black text-foreground/50 uppercase tracking-widest">Monthly Search Runs</span>
                    <span className="text-foreground">
                      <span className="text-primary font-bold">{cyclesRemaining}</span> / <span className="font-bold">{cycleLimit} Remaining</span>
                    </span>
                  </div>
                  <div className="w-full bg-card-border h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full transition-all duration-500 rounded-full" style={{ width: `${quotaPercent}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-background border border-card-border flex items-center gap-3.5 shadow-sm">
                    <div className="h-8 w-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                      <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-foreground/50 uppercase tracking-widest">Verification Status</p>
                      <p className="text-xs font-extrabold text-emerald-500 uppercase tracking-wider">Secured Mappings</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-background border border-card-border flex items-center gap-3.5 shadow-sm">
                    <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                      <Activity className="h-4.5 w-4.5 text-primary animate-pulse" />
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-foreground/50 uppercase tracking-widest">Outbound Velocity</p>
                      <p className="text-xs font-extrabold text-foreground uppercase tracking-wider">Scheduled Searches</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-primary/10 pt-4 flex items-center justify-between">
              <button onClick={() => window.location.href = '/billing'}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary-hover transition-colors group cursor-pointer"
              >
                <CreditCard className="h-4 w-4" /> Manage Subscriptions <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Transaction History Ledger */}
      <div className="space-y-4 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-foreground/75">
            <History className="h-4.5 w-4.5 text-primary" />
            <h2 className="text-[10px] font-black uppercase tracking-widest">Billing & Invoices Ledger</h2>
          </div>
          <button onClick={fetchData} className="text-[9px] font-black text-foreground/50 hover:text-primary uppercase tracking-widest transition-colors cursor-pointer" >
            Sync Ledger
          </button>
        </div>

        <div className="bg-card border border-card-border rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-card-border bg-background text-[9px] font-black text-foreground/50 uppercase tracking-[0.2em]">
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">Auth Status</th>
                  <th className="px-6 py-4">Gateway</th>
                  <th className="px-6 py-4">Invoiced Amount</th>
                  <th className="px-6 py-4 text-right">Settlement Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border text-xs font-semibold">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-foreground/45">
                      <div className="flex flex-col items-center gap-3 opacity-40">
                        <CreditCard className="h-7 w-7 text-primary" />
                        <p className="text-[9px] font-black uppercase tracking-widest">No invoice history found on this seat.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-card-border/30 transition-colors group">
                      <td className="px-6 py-3.5">
                        <span className="font-mono text-[10px] text-foreground/55 group-hover:text-primary transition-colors">
                          {tx.id.substring(0, 8)}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                          tx.status === 'SUCCESS' 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                            : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                        }`}>
                          {tx.status}
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="text-[9px] font-black text-foreground/60 uppercase tracking-widest">{tx.gateway}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="font-black text-foreground">${tx.amount}</span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <span className="text-foreground/75 font-semibold">
                          {new Date(tx.createdAt).toLocaleDateString()}
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
