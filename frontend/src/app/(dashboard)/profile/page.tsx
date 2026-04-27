"use client";

import { useState, useEffect } from "react";
import { 
  User, Mail, Crown, Calendar, Shield, ShieldCheck,
  CreditCard, History, Loader2, ArrowRight, 
  Zap, CheckCircle2, AlertCircle, Home, Compass
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

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-zinc-500 animate-pulse font-black uppercase tracking-[0.2em] text-[10px]">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-10">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-sm border border-white/5 flex items-center justify-center bg-primary/5">
            <Home className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-2xl font-black tracking-tighter gradient-text">Your Profile</h1>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Manage your account and settings here.</p>
          </div>
        </div>
        
        <div className={`px-4 py-1.5 rounded-sm border flex items-center gap-2 ${
          profile?.paymentStatus === 'active' 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
            : "bg-amber-500/10 border-amber-500/20 text-amber-400"
        }`}>
          <div className={`h-1.5 w-1.5 rounded-sm animate-pulse ${
            profile?.paymentStatus === 'active' ? "bg-emerald-500" : "bg-amber-500"
          }`} />
          <span className="text-[9px] font-black uppercase tracking-widest">
            {profile?.paymentStatus === 'active' ? 'Active Plan' : 'Basic Account'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Account Info Card */}
        <div className="glass-card p-8 rounded-sm border border-white/5 space-y-6">
          <div className="flex items-center gap-2 text-zinc-300">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <h2 className="text-[10px] font-black uppercase tracking-widest">Account Details</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-sm bg-white/[0.01] border border-white/5">
              <Mail className="h-4 w-4 text-zinc-600" />
              <div className="overflow-hidden">
                <p className="text-[8px] uppercase text-zinc-500 font-black tracking-widest">Email Address</p>
                <p className="text-xs font-bold text-zinc-300 truncate">{profile?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-sm bg-white/[0.01] border border-white/5">
              <Shield className="h-4 w-4 text-primary/70" />
              <div>
                <p className="text-[8px] uppercase text-zinc-500 font-black tracking-widest">Current Plan</p>
                <p className="text-xs font-black text-primary tracking-widest">
                  {profile?.tier || 'FREE'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-sm bg-white/[0.01] border border-white/5">
              <Calendar className="h-4 w-4 text-zinc-600" />
              <div>
                <p className="text-[8px] uppercase text-zinc-500 font-black tracking-widest">Member Since</p>
                <p className="text-xs font-bold text-zinc-300">April 2024</p>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Overview Card */}
        <div className="md:col-span-2 glass-card p-8 rounded-sm border border-white/5 bg-primary/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full -mr-40 -mt-40 blur-3xl" />
          
          <div className="relative flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2 text-zinc-100">
                <Home className="h-4 w-4 text-primary" />
                <h2 className="text-[10px] font-black uppercase tracking-widest">Active Plan</h2>
              </div>
              <span className="text-[8px] font-black bg-primary px-3 py-1 rounded-sm text-white uppercase tracking-[0.2em] shadow-lg shadow-primary/20">
                {profile?.tier === 'FREE' ? 'RESTRICTED' : 'FULL ACCESS'}
              </span>
            </div>

            <div className="flex-1 space-y-6">
              <div>
                <p className="text-3xl font-black tracking-tighter">
                  {profile?.tier === 'FREE' ? 'Free Plan' : `${profile?.tier} Plan`}
                </p>
                <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wide mt-2 leading-relaxed max-w-md">
                  {profile?.tier === 'FREE' 
                    ? "Upgrade to a professional plan to unlock more leads and tools." 
                    : "Your account is active and ready to find new leads."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-sm bg-black/20 border border-white/5">
                  <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mb-1">Daily Limit</p>
                  <p className="text-xl font-black tracking-tight text-white">
                    {profile?.tier === 'FREE' ? '10' : profile?.tier === 'STARTER' ? '50' : '200'} Discoveries
                  </p>
                </div>
                <div className="p-4 rounded-sm bg-black/20 border border-white/5">
                  <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mb-1">Safe</p>
                  <p className="text-xl font-black tracking-tight text-emerald-400/80 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Yes
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <button 
                onClick={() => window.location.href = '/billing'}
                className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all group"
              >
                <Compass className="h-4 w-4" /> Billing Settings <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-zinc-400">
            <History className="h-4 w-4 text-primary" />
            <h2 className="text-[10px] font-black uppercase tracking-widest">Past Payments</h2>
          </div>
          <button 
            onClick={fetchData}
            className="text-[9px] font-black text-zinc-600 hover:text-white uppercase tracking-widest transition-colors"
          >
            Refresh
          </button>
        </div>

        <div className="glass-card rounded-sm border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/[0.03] border-b border-white/5">
                <tr className="text-[10px] uppercase font-black text-zinc-600 tracking-[0.2em]">
                  <th className="px-8 py-5">ID</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5">Method</th>
                  <th className="px-8 py-5">Amount</th>
                  <th className="px-8 py-5 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-zinc-500">
                      <div className="flex flex-col items-center gap-4 opacity-40">
                        <CreditCard className="h-8 w-8" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No transaction history found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-8 py-4">
                        <span className="font-mono text-[10px] text-zinc-600 group-hover:text-primary transition-colors">
                          {tx.id.substring(0, 8)}
                        </span>
                      </td>
                      <td className="px-8 py-4">
                        <div className={`inline-flex items-center gap-2 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${
                          tx.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {tx.status}
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{tx.gateway}</span>
                      </td>
                      <td className="px-8 py-4">
                        <span className="text-sm font-black text-white">${tx.amount}</span>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <span className="text-[11px] text-zinc-500 font-medium">
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
