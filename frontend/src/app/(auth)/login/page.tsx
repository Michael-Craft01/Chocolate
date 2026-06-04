"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, ArrowRight, Mail, Lock, Loader2, AlertCircle, Globe, Zap, Check } from "lucide-react";
import { createClient } from "@/lib/supabase";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const googleAuthEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";

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
          throw new Error("Account not verified. Please check your inbox for the verification link.");
        }
        throw signInError;
      }

      if (data.session) {
        router.push(next);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Check your account credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google") => {
    setSocialLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${next}`,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      if (!data?.url) {
        throw new Error("Google sign-in could not start. Check the Supabase OAuth redirect settings.");
      }

      window.location.assign(data.url);
    } catch (err: any) {
      setError(err.message);
      setSocialLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-black tracking-tight text-slate-950">Sign in</h2>
        <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
          Continue to your campaigns and discovery cycles.
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </motion.div>
      )}

      {googleAuthEnabled && (
        <>
          <button
            type="button"
            onClick={() => handleSocialLogin("google")}
            disabled={socialLoading || loading}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {socialLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Globe className="h-5 w-5 text-emerald-600" />
                Sign in with Google
              </>
            )}
          </button>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">or</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
        </>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </div>
        </div>

        <button
          disabled={loading || socialLoading}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 text-sm font-black text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              Sign in
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm font-semibold text-slate-500">
        New to HyprLead?{" "}
        <Link href="/signup" className="text-emerald-600 hover:text-emerald-700">
          Create account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-950 selection:bg-emerald-200/70">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 items-center gap-10 px-6 py-10 lg:grid-cols-[1fr_460px]"
      >
        <section className="hidden lg:block">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm">
              <Zap className="h-5 w-5 fill-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-950">HyprLead</span>
          </Link>

          <div className="mt-16 max-w-xl space-y-6">
            <h1 className="text-5xl font-black leading-[1.02] tracking-tight text-slate-950">
              Welcome back to your lead engine.
            </h1>
            <p className="max-w-lg text-lg font-medium leading-8 text-slate-600">
              Review campaigns, manage cycles, and turn qualified contacts into sales conversations.
            </p>
          </div>

          <div className="mt-12 grid max-w-xl gap-4">
            {["Campaign workspace", "Cycle balance and automation controls", "AI sales path for each lead"].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="w-full">
          <div className="mb-8 text-center lg:hidden">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white">
                <Zap className="h-5 w-5 fill-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-950">HyprLead</span>
            </Link>
          </div>

          <Suspense
            fallback={
              <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white">
                <Loader2 className="h-7 w-7 animate-spin text-emerald-500" />
                <p className="text-sm font-bold text-slate-500">Loading sign in...</p>
              </div>
            }
          >
            <LoginForm />
          </Suspense>

          <p className="mt-5 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
            <Shield className="h-3.5 w-3.5" /> Secure authentication by Supabase
          </p>
        </section>
      </motion.div>
    </div>
  );
}
