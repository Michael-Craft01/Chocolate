"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { Zap, Mail, Loader2, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[140px] animate-pulse-slow opacity-50" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md z-10"
      >
        <div className="flex flex-col items-center mb-12">
          <Link href="/" className="flex items-center gap-3 font-black text-4xl mb-4 group tracking-tightest">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center glow-primary group-hover:scale-110 transition-transform duration-500">
              <Zap className="h-5 w-5 text-white fill-white" />
            </div>
            <span>HyprLead</span>
          </Link>
          <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">
            <Sparkles className="h-3 w-3" /> Autonomous Lead Engine
          </div>
        </div>

        <div className="glass-card rounded-[2.5rem] p-10 border border-white/5 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {!sent ? (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-10"
              >
                <div className="space-y-3">
                  <h1 className="text-3xl font-black tracking-tight text-white">System Access</h1>
                  <p className="text-zinc-500 text-[13px] font-medium leading-relaxed">Enter your email to receive a secure neural handshake link.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Terminal ID (Email)</label>
                    <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
                      <input 
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 pl-14 transition-all focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/30 text-sm placeholder:text-zinc-700"
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-red-400 text-[11px] font-bold ml-1 bg-red-400/5 p-4 rounded-xl border border-red-400/10 tracking-tight"
                    >
                      {error}
                    </motion.p>
                  )}

                  <button 
                    disabled={loading}
                    className="w-full h-14 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 glow-primary disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Authorize Access"}
                    {!loading && <ArrowRight className="h-4 w-4" />}
                  </button>
                </form>

                <div className="text-center">
                  <p className="text-[9px] text-zinc-600 uppercase font-black tracking-[0.2em] leading-relaxed">
                    By accessing the engine, you agree to the <br />
                    <span className="text-zinc-500 hover:text-white cursor-pointer transition-colors">Neural Protocols</span> & <span className="text-zinc-500 hover:text-white cursor-pointer transition-colors">Safety Guidelines</span>.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success-message"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8 py-4"
              >
                <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto glow-primary shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 className="h-12 w-12 text-emerald-400" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-3xl font-black tracking-tight text-white">Handshake Sent</h2>
                  <p className="text-zinc-500 text-sm px-4 leading-relaxed">
                    A secure magic link has been dispatched to <br />
                    <span className="text-white font-bold">{email}</span>.
                  </p>
                </div>
                <button 
                  onClick={() => setSent(false)}
                  className="text-primary text-[10px] font-black uppercase tracking-widest hover:text-primary-hover transition-colors"
                >
                  Authorize Different ID
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Footer Info */}
      <div className="mt-16 text-zinc-700 text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-6 z-10">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 glow-primary animate-pulse" />
          Stealth Shield Active
        </div>
        <div className="w-[1px] h-3 bg-zinc-800" />
        <div className="flex items-center gap-2">
          <Zap className="h-3 w-3 text-primary fill-primary" />
          Encrypted Handshake
        </div>
      </div>
    </div>
  );
}

