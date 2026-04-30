"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, ArrowRight, Mail, Lock, Loader2, AlertCircle, Globe, Sparkles, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) throw authError;

      if (data.user) {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
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
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      setSocialLoading(false);
    }
  };

  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const handleResend = async () => {
    setResending(true);
    setResendMessage(null);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setResendMessage("Verification link sent successfully.");
    } catch (err: any) {
      setResendMessage("Send failed: " + err.message);
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 selection:bg-primary/30 relative overflow-hidden">
        <div className="bg-blob bg-primary top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-12 rounded-[2.5rem] glass-morphism border-white/10 text-center space-y-8 relative z-10"
        >
          <div className="h-20 w-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-white tracking-tight">Verify Email</h2>
            <p className="text-zinc-500 font-medium leading-relaxed">We've sent a secure verification link to <span className="text-white font-bold">{email}</span>. Please check your inbox to continue.</p>
          </div>
          
          <div className="space-y-4">
            <button 
              onClick={handleResend}
              disabled={resending}
              className="btn-pill-glass w-full h-14"
            >
              {resending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Resend Link"}
            </button>
            {resendMessage && <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{resendMessage}</p>}
          </div>

          <div className="pt-8 border-t border-white/5">
             <Link href="/login" className="text-sm font-bold text-zinc-500 hover:text-white transition-colors">Return to Sign In</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 selection:bg-primary/30 relative overflow-hidden">
      <div className="bg-blob bg-blue top-0 left-0 opacity-10" />
      <div className="bg-blob bg-primary bottom-0 right-0 opacity-10" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-12 space-y-6">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center group-hover:scale-105 transition-transform">
               <Shield className="h-6 w-6 text-black" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">HyprLead</span>
          </Link>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white tracking-tight">Get Started.</h1>
            <p className="text-zinc-500 font-medium">Join 500+ teams scaling their revenue.</p>
          </div>
        </div>

        <div className="p-10 rounded-[2.5rem] glass-morphism border-white/10 shadow-2xl space-y-8">
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 text-xs font-bold"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </motion.div>
          )}

          <div className="grid grid-cols-1 gap-4">
             <button 
               onClick={() => handleSocialLogin('google')}
               disabled={socialLoading || loading}
               className="btn-pill-glass w-full h-14 gap-3"
             >
                {socialLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Globe className="h-5 w-5" />
                    Sign up with Google
                  </>
                )}
             </button>
          </div>

          <div className="relative">
             <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
             <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-[0.2em]">
                <span className="bg-black/20 backdrop-blur-md px-4 text-zinc-600">Or continue with email</span>
             </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-500 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600" />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl pl-14 pr-6 text-white text-sm focus:border-primary/50 focus:ring-0 transition-all placeholder:text-zinc-700"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-500 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600" />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create secure password"
                  className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl pl-14 pr-6 text-white text-sm focus:border-primary/50 focus:ring-0 transition-all placeholder:text-zinc-700"
                />
              </div>
              <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest ml-1">Min 8 characters. Highly secure.</p>
            </div>

            <button 
              disabled={loading || socialLoading}
              className="btn-pill-white w-full h-14"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="pt-6 text-center border-t border-white/5">
            <p className="text-zinc-600 text-sm font-medium">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-bold hover:underline">Sign In</Link>
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
           <p className="text-[10px] font-bold text-zinc-800 uppercase tracking-[0.4em]">Secure Connection Active</p>
        </div>
      </motion.div>
    </div>
  );
}
