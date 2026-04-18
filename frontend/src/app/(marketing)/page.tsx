import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Target, ArrowRight, Brain, Cpu, MessageSquare, Discord, Check, ShieldCheck, Globe } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function LandingPage() {
  const [session, setSession] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);
  const features = [
    {
      title: "Stealth Extraction",
      desc: "Engineered to bypass detection and extract clean lead data from dynamic sources without 429 errors.",
      icon: Cpu,
      color: "text-blue-400"
    },
    {
      title: "AI Enrichment",
      desc: "Goes beyond raw data. AI classifies business intent and identifies specific pain points before you even reach out.",
      icon: Brain,
      color: "text-emerald-400"
    },
    {
      title: "Automated Personalization",
      desc: "Generates laser-focused outreach copy tailored to the unique niche of reaching every single business.",
      icon: MessageSquare,
      color: "text-warm"
    }
  ];

  const steps = [
    { title: "Target Context", desc: "Define your ideal industry and global region.", icon: Target },
    { title: "Engine Sweep", desc: "The engine runs a high-speed batch extraction across all channels.", icon: Zap },
    { title: "AI Research", desc: "Every business is scanned for pain points and growth opportunities.", icon: Brain },
    { title: "Headless Dispatch", desc: "Leads land directly in your Discord or CRM automatically.", icon: MessageSquare }
  ];

  const pricing = [
    { name: "Starter", price: "Free", leads: "50 Leads", perks: ["Standard AI Enrichment", "Discord Dispatcher", "Single Campaign"] },
    { name: "Professional", price: "$49", leads: "500 Leads", perks: ["Advanced GPT-4 Research", "Priority Sweep Logic", "Unlimited Campaigns", "Global Targeting"], featured: true },
    { name: "Elite", price: "$149", leads: "2k+ Leads", perks: ["Custom Webhook Export", "Full White-label Engine", "24/7 Dedicated Support", "Whitelisted IPs"] }
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 right-0 h-[800px] bg-gradient-to-b from-primary/5 via-transparent to-transparent -z-10" />
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />
      
      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-2xl">
          <Zap className="h-7 w-7 text-primary fill-primary" />
          <span className="gradient-text">Chocolate</span>
        </Link>
        <div className="flex items-center gap-8">
          <Link href="#features" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">How it works</Link>
          <Link href="#pricing" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Pricing</Link>
          <Link href="/dashboard" className="h-11 px-6 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-sm font-bold hover:bg-white/10 transition-all font-black uppercase tracking-widest">
            {session ? 'Go to Dashboard' : 'Login'}
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-32 text-center">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold uppercase tracking-widest text-primary mb-8">
            <Zap className="h-3 w-3" />
            V2.0 Scaling Update Live
          </span>
          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight">
            The engine for <br />
            <span className="gradient-text">High-Ticket Leads.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-zinc-400 mb-12">
            Chocolate is a headless automate-and-forget lead engine. We find, classify, and research businesses so you only talk to people ready to buy.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/onboarding" className="h-14 px-10 rounded-2xl bg-primary text-white font-bold text-lg hover:bg-primary-hover transition-all flex items-center gap-2 shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-98">
              {session ? 'Open Dashboard' : 'Launch Your Engine'}
              <ArrowRight className="h-5 w-5" />
            </Link>
            <button className="h-14 px-10 rounded-2xl bg-white/5 border border-white/10 font-bold text-lg hover:bg-white/10 transition-all">
              Watch Engine Demo
            </button>
          </div>
        </motion.div>
      </section>

      {/* Stats/Social Proof */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-y border-white/5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {[["1k+", "Global Users"], ["2M+", "Leads Analyzed"], ["98%", "Detection Bypass"], ["0s", "Manual Work"]].map(([val, label]) => (
            <div key={label}>
              <div className="text-3xl font-black mb-1">{val}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-black mb-4">Automation as Art</h2>
          <p className="text-zinc-500">How the Chocolate engine transforms the web into a sales machine.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="relative group">
                {i < 3 && <div className="hidden md:block absolute top-12 right-[-20%] w-[40%] h-[1px] bg-gradient-to-r from-primary/30 to-transparent" />}
                <div className="h-24 w-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:border-primary/50 transition-colors">
                  <Icon className="h-10 w-10 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-zinc-500 text-sm">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-6 py-32 bg-white/[0.01] rounded-[4rem]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="glass rounded-3xl p-10 hover:border-white/20 transition-all">
                <Icon className={`h-12 w-12 mb-8 ${f.color}`} />
                <h3 className="text-2xl font-black mb-4">{f.title}</h3>
                <p className="text-zinc-400 leading-relaxed mb-6">{f.desc}</p>
                <div className="flex gap-2">
                   <span className="px-2 py-1 rounded bg-white/5 text-[10px] uppercase font-bold text-zinc-500">Headless</span>
                   <span className="px-2 py-1 rounded bg-white/5 text-[10px] uppercase font-bold text-zinc-500">AI-Powered</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-black mb-4">Transparent Scale</h2>
          <p className="text-zinc-500">Choose the volume your business needs to grow.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricing.map((p, i) => (
            <div key={i} className={`glass rounded-3xl p-10 relative overflow-hidden ${p.featured ? 'border-primary/50 ring-1 ring-primary/20' : ''}`}>
              {p.featured && <div className="absolute top-0 right-0 px-4 py-1 bg-primary text-[10px] font-black uppercase tracking-widest">Most Popular</div>}
              <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">{p.name}</div>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-black">{p.price}</span>
                {p.price !== 'Free' && <span className="text-zinc-500">/mo</span>}
              </div>
              <div className="flex flex-col gap-4 mb-10">
                {p.perks.map((perk, j) => (
                  <div key={j} className="flex items-center gap-3 text-sm text-zinc-300">
                    <Check className="h-4 w-4 text-primary" />
                    {perk}
                  </div>
                ))}
              </div>
              <Link href="/dashboard" className={`w-full h-12 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${p.featured ? 'bg-primary text-white shadow-xl shadow-primary/20 hover:bg-primary-hover' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                Start with {p.name}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 pt-20 pb-10 border-t border-white/5 flex items-center justify-between">
         <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest">© 2026 Chocolate Engine. Globally Distributed.</div>
         <div className="flex gap-8">
            <Link href="#" className="text-xs text-zinc-500 hover:text-white transition-colors uppercase font-bold tracking-widest">Terms</Link>
            <Link href="#" className="text-xs text-zinc-500 hover:text-white transition-colors uppercase font-bold tracking-widest">Privacy</Link>
         </div>
      </footer>
    </div>
  );
}
