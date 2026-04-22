"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { Zap, Mail, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
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
    <div className="min-h-screen bg-[#070707] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-10">
          <Link href="/" className="flex items-center gap-2 font-bold text-3xl mb-4 group">
            <Zap className="h-8 w-8 text-primary fill-primary group-hover:scale-110 transition-transform" />
            <span className="gradient-text">Chocolate</span>
          </Link>
          <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest">SaaS Lead Engine</p>
        </div>

        <div className="glass border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            {!sent ? (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold">Welcome Back</h1>
                  <p className="text-zinc-400 text-sm">Enter your email for a secure magic link login.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                      <input 
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/40 text-sm"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-red-400 text-xs font-medium ml-1 bg-red-400/5 p-3 rounded-lg border border-red-400/10">
                      {error}
                    </p>
                  )}

                  <button 
                    disabled={loading}
                    className="w-full h-14 bg-primary text-white rounded-2xl font-bold hover:bg-primary-hover transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/20 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send Magic Link"}
                    {!loading && <ArrowRight className="h-5 w-5" />}
                  </button>
                </form>

                <p className="text-center text-[10px] text-zinc-500 uppercase tracking-widest leading-relaxed">
                  By signing in, you agree to our <br />
                  <span className="text-zinc-400 hover:text-white cursor-pointer transition-colors">Terms of Service</span> and <span className="text-zinc-400 hover:text-white cursor-pointer transition-colors">Privacy Policy</span>.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="success-message"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 py-4"
              >
                <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white">Check your inbox</h2>
                  <p className="text-zinc-400 text-sm px-4">
                    We've sent a magic login link to <span className="text-white font-bold">{email}</span>. Click it to access your dashboard.
                  </p>
                </div>
                <button 
                  onClick={() => setSent(false)}
                  className="text-primary text-sm font-bold hover:underline"
                >
                  Enter different email
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Footer Info */}
      <div className="mt-12 text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-4">
        <span>Stealth Protection Active</span>
        <div className="w-1 h-1 rounded-full bg-zinc-800" />
        <span>Secure JWT Handshake</span>
      </div>
    </div>
  );
}
