"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, ArrowRight, Mail, Lock, Loader2, AlertCircle, Globe } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const next = searchParams.get("next") || "/dashboard";
  const authError = searchParams.get("error");

  useEffect(() => {
    if (authError) setError(authError);
  }, [authError]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (signInError.message.includes("Email not confirmed")) {
          throw new Error("Terminal not verified. Please check your inbox for the initialization link.");
        }
        throw signInError;
      }

      if (data.session) {
        router.push(next);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Check your terminal credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google') => {
    setSocialLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${next}`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      setSocialLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 selection:bg-primary/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,109,41,0.05),transparent_70%)]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <div className="text-center mb-12 space-y-4">
          <Link href="/" className="inline-flex items-center gap-2 group mb-6">
            <div className="h-10 w-10 rounded-sm bg-primary flex items-center justify-center group-hover:scale-105 transition-transform">
               <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black text-white tracking-tightest uppercase">HyprLead</span>
          </Link>
          <h1 className="text-4xl font-black text-white uppercase tracking-tightest">Control <span className="text-primary">Center.</span></h1>
          <p className="tertiary">Secure Account Login</p>
        </div>

        <div className="p-8 rounded-sm border border-white/5 bg-white/[0.02] shadow-2xl space-y-8">
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 rounded-sm bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 text-[11px] font-bold uppercase"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </motion.div>
          )}

          {/* Social Auth Section */}
          <div className="grid grid-cols-1 gap-4">
             <button 
               onClick={() => handleSocialLogin('google')}
               disabled={socialLoading || loading}
               className="h-14 w-full rounded-sm border border-white/10 bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-4 group disabled:opacity-50"
             >
                {socialLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                ) : (
                  <>
                    <Globe className="h-5 w-5 text-zinc-400 group-hover:text-white transition-colors" />
                    Authenticate with Google
                  </>
                )}
             </button>
          </div>

          <div className="relative">
             <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
             <div className="relative flex justify-center text-[8px] font-black uppercase tracking-widest">
                <span className="bg-[#050505] px-4 text-zinc-700">Or use terminal ID</span>
             </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@hyprlead.com"
                  className="w-full h-14 bg-[#0a0a0a] border border-white/5 rounded-sm pl-12 pr-4 text-white text-sm focus:border-primary/50 focus:ring-0 transition-all placeholder:text-zinc-800"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Password</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-14 bg-[#0a0a0a] border border-white/5 rounded-sm pl-12 pr-4 text-white text-sm focus:border-primary/50 focus:ring-0 transition-all placeholder:text-zinc-800"
                />
              </div>
            </div>

            <button 
              disabled={loading || socialLoading}
              className="w-full h-14 bg-primary hover:bg-primary-hover text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-sm transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="pt-6 text-center border-t border-white/5">
            <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
              New to the platform?{" "}
              <Link href="/signup" className="text-primary hover:underline underline-offset-4">Create Account</Link>
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
           <p className="text-[9px] font-black text-zinc-800 uppercase tracking-[0.4em]">Encrypted Session Endpoint: 0xHYPR_AUTH_V4</p>
        </div>
      </motion.div>
    </div>
  );
}
