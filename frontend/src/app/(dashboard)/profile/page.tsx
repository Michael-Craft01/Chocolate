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
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-10">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-white/5 flex items-center justify-center shadow-2xl">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-2xl font-black tracking-tighter gradient-text">Neural Identity</h1>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Manage core account telemetry and access protocols.</p>
          </div>
        </div>
        
        <div className={`px-4 py-1.5 rounded-full border flex items-center gap-2 ${
          profile?.paymentStatus === 'active' 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
            : "bg-amber-500/10 border-amber-500/20 text-amber-400"
        }`}>
          <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${
            profile?.paymentStatus === 'active' ? "bg-emerald-500" : "bg-amber-500"
          }`} />
          <span className="text-[9px] font-black uppercase tracking-widest">
            {profile?.paymentStatus === 'active' ? 'Operational' : 'Restricted Access'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Info Card */}
        <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center gap-2 text-zinc-300 mb-2">
            <Shield className="h-4 w-4 text-primary" />
            <h2 className="text-[10px] font-black uppercase tracking-widest">Auth Telemetry</h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.01] border border-white/5">
              <Mail className="h-3.5 w-3.5 text-zinc-600" />
              <div className="overflow-hidden">
                <p className="text-[8px] uppercase text-zinc-500 font-black tracking-widest">Primary UID</p>
                <p className="text-xs font-bold text-zinc-400 truncate">{profile?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.01] border border-white/5">
              <Crown className="h-3.5 w-3.5 text-primary/70" />
              <div>
                <p className="text-[8px] uppercase text-zinc-500 font-black tracking-widest">Access Node</p>
                <p className="text-xs font-black text-primary tracking-widest">
                  {profile?.tier || 'FREE'} MODE
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.01] border border-white/5">
              <Calendar className="h-3.5 w-3.5 text-zinc-600" />
              <div>
                <p className="text-[8px] uppercase text-zinc-500 font-black tracking-widest">Initialization</p>
                <p className="text-xs font-bold text-zinc-400">APR 2024</p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Subscription Card */}
        <div className="md:col-span-2 glass p-6 rounded-2xl border border-white/5 bg-primary/5 relative overflow-hidden group interactive-card">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32" />
          
          <div className="relative flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-zinc-100">
                <Zap className="h-4 w-4 text-primary" />
                <h2 className="text-[10px] font-black uppercase tracking-widest">Active Cluster</h2>
              </div>
              <span className="text-[8px] font-black bg-primary px-2 py-0.5 rounded-full text-white uppercase tracking-[0.2em]">
                {profile?.tier === 'FREE' ? 'RESTRICTED' : 'FULL ACCESS'}
              </span>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <p className="text-2xl font-black tracking-tighter">
                  {profile?.tier === 'FREE' ? 'Hibernating Node' : `${profile?.tier} Protocol`}
                </p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide mt-1">
                  {profile?.tier === 'FREE' 
                    ? "Initialize a paid node to unlock high-priority sweep cycles." 
                    : "Your neural engine is running at peak extraction efficiency."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-black/10 border border-white/5">
                  <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Daily Quota</p>
                  <p className="text-lg font-black tracking-tight text-zinc-400">
                    {profile?.tier === 'FREE' ? '10' : profile?.tier === 'STARTER' ? '50' : '200'} Cycles
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-black/10 border border-white/5">
                  <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Enrichment</p>
                  <p className="text-lg font-black tracking-tight text-emerald-500/70 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Neural
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button 
                onClick={() => window.location.href = '/billing'}
                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors group"
              >
                Access Scaling Dashboard <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-400">
            <History className="h-4 w-4 text-primary" />
            <h2 className="text-[10px] font-black uppercase tracking-widest">Transaction Telemetry</h2>
          </div>
          <button 
            onClick={fetchData}
            className="text-[9px] font-black text-zinc-600 hover:text-white uppercase tracking-widest transition-colors"
          >
            Refetch Log
          </button>
        </div>

        <div className="glass rounded-xl border border-white/5 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/[0.02] border-b border-white/5">
              <tr className="text-[9px] uppercase font-black text-zinc-600 tracking-[0.2em]">
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Node</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center text-zinc-500">
                    <div className="flex flex-col items-center gap-2 opacity-30">
                      <CreditCard className="h-6 w-6" />
                      <p className="text-[10px] font-black uppercase tracking-widest">No telemetry found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-mono text-[10px] text-zinc-600 group-hover:text-zinc-400 transition-colors">
                        {tx.id.substring(0, 8)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${
                        tx.status === 'SUCCESS' ? 'bg-emerald-500/5 text-emerald-500/70' : 'bg-amber-500/5 text-amber-500/70'
                      }`}>
                        {tx.status}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">{tx.gateway}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-black text-zinc-400">${tx.amount}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-[10px] text-zinc-600 font-medium">
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
  );
}
