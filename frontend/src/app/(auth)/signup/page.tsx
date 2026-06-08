"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  ArrowRight, 
  Mail, 
  Lock, 
  Loader2, 
  AlertCircle, 
  Globe, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";
import { createClient } from "@/lib/supabase";

const slides = [
  {
    title: "Automatic Lead Searches",
    tagline: "Scheduled geographical search",
    details: "We run regular background searches matching your target profile. The system finds relevant business listings and directories to extract high-intent sales leads, stopping automatically once your limits are reached.",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    badge: "AI Search"
  },
  {
    title: "Email Verification",
    tagline: "Real-time email address check",
    details: "No more sending messages to dead inboxes. Our search agent verifies email addresses in real time so you don't hit bounce limits or damage your email domain reputation.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    badge: "Verification"
  },
  {
    title: "AI Message Customization",
    tagline: "Tailored business insights",
    details: "We analyze each company's online profile and website. The system then drafts customized outreach messages addressing their specific challenges and matching them to your product.",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    badge: "AI Insights"
  },
  {
    title: "Instant Lead Notifications",
    tagline: "Send leads straight to Discord or Slack",
    details: "Connect Discord or Slack webhooks to send new leads directly to your chat channel. You can also export clean CSV files containing verified lead details whenever you need them.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    badge: "Easy Sync"
  }
];

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false); // true when Supabase requires email confirmation
  
  const [activeSlide, setActiveSlide] = useState(0);

  const googleAuthEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  const handleDotClick = (index: number) => {
    setActiveSlide(index);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // Case 1: Email confirmation required (Supabase default)
      // data.session is null, but data.user exists with identities
      const needsConfirmation = !data.session && data.user;
      if (needsConfirmation) {
        setEmailSent(true);
        return;
      }

      // Case 2: Email confirmation disabled — session is immediately available
      if (data.session) {
        setTimeout(() => {
          router.refresh();
          router.push("/dashboard");
        }, 500);
      }
    } catch (err: any) {
      const msg = err.message || '';
      if (
        msg.toLowerCase().includes('email not confirmed') ||
        msg.toLowerCase().includes('email_not_confirmed') ||
        msg.toLowerCase().includes('check your email')
      ) {
        // Supabase sent the confirmation email — show the success state
        setEmailSent(true);
      } else {
        setError(msg || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google') => {
    setSocialLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      if (!data?.url) {
        throw new Error("Google sign-up could not start. Check the Supabase OAuth redirect settings.");
      }

      window.location.assign(data.url);
    } catch (err: any) {
      setError(err.message);
      setSocialLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-emerald-500/30 flex items-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 items-center gap-10 px-6 py-10 lg:grid-cols-[1.2fr_440px]"
      >
        {/* Left Side: Product Information and Carousel */}
        <section className="space-y-8 flex flex-col justify-center">
          <Link href="/" className="inline-flex items-center gap-3 w-fit group">
            <div className="h-11 w-11 relative shrink-0">
              <img 
                src="/logo.png" 
                alt="HyprLead Logo" 
                className="h-full w-full object-contain drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">HyprLead</span>
          </Link>

          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-xs font-black text-emerald-400 uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
              Welcome to the future of sales
            </div>
            <h1 className="text-4xl sm:text-5xl font-black leading-[1.08] tracking-tight text-white">
              Let's launch your <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">automated lead searches</span>
            </h1>
            <p className="max-w-lg text-[15px] font-medium leading-relaxed text-zinc-400">
              Create your account to start running local market searches, verifying business contacts, and finding sales leads automatically.
            </p>
          </div>

          {/* Automatic Carousel */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f11] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
            {/* Visual Panel */}
            <div className="relative h-44 sm:h-52 w-full overflow-hidden rounded-xl bg-background">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeSlide}
                  src={slides[activeSlide].image}
                  alt={slides[activeSlide].title}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="h-full w-full object-cover opacity-90"
                />
              </AnimatePresence>
              
              {/* Blur gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              
              {/* Badge overlay */}
              <div className="absolute top-4 left-4 rounded-full bg-emerald-500/90 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-sm border border-emerald-400/20">
                {slides[activeSlide].badge}
              </div>

              {/* Title Overlay */}
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-xs font-black uppercase tracking-wider text-emerald-400">
                  Slide {activeSlide + 1} of {slides.length}
                </p>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {slides[activeSlide].title}
                </h3>
              </div>
            </div>

            {/* Details Panel */}
            <div className="mt-4 min-h-[110px] flex flex-col justify-between">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-1.5"
                >
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-500">
                    {slides[activeSlide].tagline}
                  </p>
                  <p className="text-sm font-medium leading-relaxed text-zinc-400">
                    {slides[activeSlide].details}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Controls */}
              <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                <div className="flex items-center gap-1.5">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleDotClick(index)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        activeSlide === index 
                          ? "w-5 bg-emerald-500" 
                          : "w-1.5 bg-zinc-800 hover:bg-zinc-700"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handlePrevSlide}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-[#0f0f11] text-zinc-400 transition hover:bg-white/5 hover:text-white cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={handleNextSlide}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-[#0f0f11] text-zinc-400 transition hover:bg-white/5 hover:text-white cursor-pointer"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Side: Account Registration Form */}
        <section className="w-full">
          <div className="mb-8 text-center lg:hidden">
            <Link href="/" className="inline-flex items-center gap-3 justify-center">
              <div className="h-10 w-10 relative shrink-0">
                <img 
                  src="/logo.png" 
                  alt="HyprLead Logo" 
                  className="h-full w-full object-contain drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">HyprLead</span>
            </Link>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0f0f11] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.6)] sm:p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-black tracking-tight text-white">Create account</h2>
              <p className="mt-2 text-sm font-medium leading-6 text-zinc-400">
                Start with email or continue with Google.
              </p>
            </div>
          
            {emailSent && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm"
              >
                <p className="font-black text-emerald-400 mb-1">Check your inbox ✉️</p>
                <p className="font-medium text-emerald-300/80">
                  We sent a confirmation link to <strong className="text-white">{email}</strong>.
                  Click it to activate your account, then come back and{" "}
                  <Link href="/login" className="underline hover:text-white">sign in</Link>.
                </p>
              </motion.div>
            )}

            {!emailSent && error && (
              <motion.div 
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm font-semibold text-red-400"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </motion.div>
            )}

            {googleAuthEnabled && (
              <>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  disabled={socialLoading || loading}
                  className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] text-sm font-bold text-white transition hover:bg-white/[0.06] hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                  {socialLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Globe className="h-5 w-5 text-emerald-400" />
                      Sign up with Google
                    </>
                  )}
                </button>

                <div className="my-6 flex items-center gap-4">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-600">or</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>
              </>
            )}

            <form onSubmit={handleSignup} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-300">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="h-12 w-full rounded-lg border border-white/10 bg-white/[0.02] pl-11 pr-4 text-sm font-semibold text-white outline-none transition placeholder:text-zinc-700 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input 
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="h-12 w-full rounded-lg border border-white/10 bg-white/[0.02] pl-11 pr-4 text-sm font-semibold text-white outline-none transition placeholder:text-zinc-700 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>
              </div>

              <button
                disabled={loading || socialLoading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 text-sm font-black text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Create account
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm font-semibold text-zinc-400">
              Already have an account?{" "}
              <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-bold">Sign in</Link>
            </p>
          </div>
          <p className="mt-5 flex items-center justify-center gap-2 text-xs font-semibold text-zinc-600">
            <Shield className="h-3.5 w-3.5 text-zinc-500" /> Secure signup by Supabase
          </p>
        </section>
      </motion.div>
    </div>
  );
}
