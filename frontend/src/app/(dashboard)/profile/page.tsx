"use client";

import { useState, useEffect } from "react";
import { 
  User, Mail, Crown, Calendar, Shield, 
  CreditCard, History, Loader2, ArrowRight, 
  Zap, CheckCircle2, AlertCircle 
} from "lucide-react";
import { authJson } from "@/lib/api";

interface UserProfile {
  id: string;
  email: string;
  tier: string;
  paymentStatus: string;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [userData, txData] = await Promise.all([
        authJson<UserProfile>("/api/me"),
        authJson<Transaction[]>("/api/billing/transactions").catch(() => [])
      ]);

      setProfile(userData);
      setTransactions(txData);
    } catch (err: any) {
      console.error("Profile fetch error:", err);
      setError("Failed to load profile details. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-zinc-500 animate-pulse">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shadow-2xl">
            <User className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
            <p className="text-zinc-400">Manage your subscription and billing history.</p>
          </div>
        </div>
        
        <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${
          profile?.paymentStatus === 'active' 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
            : "bg-amber-500/10 border-amber-500/20 text-amber-400"
        }`}>
          <div className={`h-2 w-2 rounded-full animate-pulse ${
            profile?.paymentStatus === 'active' ? "bg-emerald-500" : "bg-amber-500"
          }`} />
          <span className="text-xs font-bold uppercase tracking-wider">
            Status: {profile?.paymentStatus || 'Free'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* User Info Card */}
        <div className="glass p-8 rounded-2xl border border-white/5 space-y-6">
          <div className="flex items-center gap-2 text-zinc-300 font-bold mb-2">
            <Shield className="h-5 w-5 text-primary" />
            <h2>User Details</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
              <Mail className="h-4 w-4 text-zinc-500" />
              <div className="overflow-hidden">
                <p className="text-[10px] uppercase text-zinc-500 font-bold">Email Address</p>
                <p className="text-sm font-medium truncate">{profile?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
              <Crown className="h-4 w-4 text-primary" />
              <div>
                <p className="text-[10px] uppercase text-zinc-500 font-bold">Current Tier</p>
                <p className="text-sm font-bold text-primary tracking-wide">
                  {profile?.tier || 'FREE'} PLAN
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
              <Calendar className="h-4 w-4 text-zinc-500" />
              <div>
                <p className="text-[10px] uppercase text-zinc-500 font-bold">Member Since</p>
                <p className="text-sm font-medium">April 2024</p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Subscription Card */}
        <div className="md:col-span-2 glass p-8 rounded-2xl border border-primary/20 bg-primary/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32" />
          
          <div className="relative flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-zinc-100 font-bold">
                <Zap className="h-5 w-5 text-primary" />
                <h2>Active Subscription</h2>
              </div>
              <span className="text-[10px] font-bold bg-primary px-3 py-1 rounded-full text-white uppercase tracking-widest">
                {profile?.tier === 'free' ? 'Basic Access' : 'Full Access'}
              </span>
            </div>

            <div className="flex-1 space-y-6">
              <div>
                <p className="text-4xl font-black tracking-tighter">
                  {profile?.tier === 'free' ? 'No Active Plan' : `${profile?.tier} Plan`}
                </p>
                <p className="text-zinc-400 mt-2">
                  {profile?.tier === 'free' 
                    ? "Upgrade to start running automated lead generation campaigns." 
                    : "Your professional lead engine is fully operational and syncing."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase">Daily Limit</p>
                  <p className="text-xl font-bold">
                    {profile?.tier === 'free' ? '0' : profile?.tier === 'STARTER' ? '50' : '200'} Leads
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase">Enrichment</p>
                  <p className="text-xl font-bold text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Enabled
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button 
                onClick={() => window.location.href = '/billing'}
                className="flex items-center gap-2 text-sm font-bold text-white hover:text-primary transition-colors group"
              >
                Go to Billing Dashboard <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-300 font-bold">
            <History className="h-5 w-5 text-primary" />
            <h2>Payment History</h2>
          </div>
          <button 
            onClick={fetchData}
            className="text-xs font-bold text-zinc-500 hover:text-white transition-colors"
          >
            Refresh Data
          </button>
        </div>

        <div className="glass rounded-2xl border border-white/5 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-white/5">
              <tr className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                <th className="px-8 py-4">Transaction ID</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Method</th>
                <th className="px-8 py-4">Amount</th>
                <th className="px-8 py-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center gap-2 opacity-50">
                      <CreditCard className="h-8 w-8" />
                      <p className="text-sm">No transaction history found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-5">
                      <span className="font-mono text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors">
                        {tx.id.substring(0, 12)}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-md text-[10px] font-bold ${
                        tx.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {tx.status === 'SUCCESS' ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        {tx.status}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-medium text-zinc-400">{tx.gateway}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-bold text-white">${tx.amount}</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className="text-xs text-zinc-500">
                        {new Date(tx.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
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
