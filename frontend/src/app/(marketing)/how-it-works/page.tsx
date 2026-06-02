"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  Compass, Brain, ShieldCheck, Mail, ArrowRight, PlayCircle, Check, 
  Sparkles, Layers, Search, Cpu, Database, ChevronRight 
} from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const STEPS = [
  {
    number: "01",
    title: "Define Target Area & Niche",
    icon: Compass,
    badge: "TARGET DEFINE",
    desc: "Input your search coordinates: target locations, industries, and company size. Define your company's product, landing link, and target pain points to seed the outreach engine.",
    details: [
      "Select custom industries (e.g., heavy logistics, boutique retail, B2B SaaS).",
      "Specify precise geographic parameters (Detroit, Portland, London, etc.).",
      "Set your product identity to guide the personalization core."
    ]
  },
  {
    number: "02",
    title: "Scheduled Scout Cycles",
    icon: Search,
    badge: "AUTONOMOUS SWEEP",
    desc: "High-speed scouting nodes crawl Google Maps, local business registries, and industry portals in parallel. Scrapers run safely behind high-density proxy rotation to safely map fresh listings.",
    details: [
      "Real-time geographical mapping of localized business footprints.",
      "Proxy-rotated extraction inside bounded discovery cycles.",
      "Auto-filtering of duplicates and irrelevant listings."
    ]
  },
  {
    number: "03",
    title: "AI Website Pain Excavation",
    icon: Brain,
    badge: "NEURAL EXTRACTION",
    desc: "HyprLead AI parses each target's digital presence. It crawls their website structure, reads user reviews, analyzes loading performance, and discovers actual technical and operational hurdles.",
    details: [
      "Semantic parsing of targets' visibility, web structure, and operational blocks.",
      "Generation of an authentic 'Business Pain-Point Matrix'.",
      "Extraction of verified owner names and corporate sender roles."
    ]
  },
  {
    number: "04",
    title: "Zero-Bounce SMTP Handshakes",
    icon: ShieldCheck,
    badge: "CREDENTIALS VERIFICATION",
    desc: "Our validation server performs direct connection handshakes with the target's email exchange servers. This validates actual mailbox status and MX health without ever sending an email.",
    details: [
      "Zero-bounce email verification keeping bounce rates below 0.2%.",
      "Direct MX record checks and DNS health verification.",
      "Sender reputation protection for your domain."
    ]
  },
  {
    number: "05",
    title: "Instant Opener Dispatch",
    icon: Mail,
    badge: "HIGH-CONVERSION COPY",
    desc: "Your command center instantly populates with verified contact dossiers. Next-generation AI models write highly personalized outbound opener scripts addressing their specific business blocks.",
    details: [
      "Hyper-personalized cold emails referencing exact website deficiencies.",
      "One-click WhatsApp and SMTP email dispatch capabilities.",
      "Real-time CRM logging and cycle syncing."
    ]
  }
];

export default function HowItWorksPage() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="bg-background text-foreground min-h-screen selection:bg-primary/30 transition-colors duration-500 font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-44 pb-20 overflow-hidden px-6 text-center" id="how-it-works-hero">
        <div className="bg-animated-mesh" />
        <div className="bg-grid absolute inset-0 opacity-10 -z-10" />
        <div className="hero-glow" />

        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-card border border-card-border mb-4 shadow-sm">
             <Cpu className="h-4 w-4 text-primary animate-pulse" />
             <span className="text-xs font-black uppercase tracking-[0.2em] text-foreground/75">Automated Revenue Architecture</span>
          </div>
          <h1 className="text-display" id="main-heading">
            How The Lead <br />
            <span className="animate-text-shimmer bg-clip-text text-transparent bg-gradient-to-r from-primary via-emerald-400 to-primary">Engine Works.</span>
          </h1>
          <p className="max-w-xl mx-auto text-foreground/80 text-xs font-semibold leading-relaxed">
            Discover the high-performance pipeline scouting architecture. We crawl the web, identify actual technical friction points, verify SMTP mailboxes, and write hyper-personalized cold outreach.
          </p>
        </div>
      </section>

      {/* Five-Step Visual Interface System */}
      <section className="py-24 max-w-7xl mx-auto px-6 relative z-10" id="pipeline-section">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Step Navigator */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2 mb-6">
              <Layers className="h-4 w-4 text-primary" /> Step-by-Step Pipeline
            </h2>
            <div className="flex flex-col gap-3">
              {STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isActive = activeStep === idx;
                return (
                  <button key={step.number} onClick={() => setActiveStep(idx)}
                    id={`step-btn-${idx}`}
                    className={`w-full p-5 rounded-[24px] border text-left transition-all duration-300 flex items-center justify-between gap-4 cursor-pointer hover:scale-[1.01] ${
                      isActive 
                        ? "bg-primary/10 border-primary shadow-sm" 
                        : "bg-card border-card-border hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className={`text-xs font-black uppercase tracking-wider shrink-0 ${isActive ? "text-primary" : "text-foreground/40"}`}>
                        {step.number}
                      </span>
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                        isActive ? "bg-primary/20 border-primary/40 text-primary" : "bg-background border-card-border text-foreground/60"
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className={`text-sm font-bold truncate ${isActive ? "text-foreground" : "text-foreground/75"}`}>
                        {step.title}
                      </span>
                    </div>
                    <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${isActive ? "text-primary translate-x-1" : "text-foreground/40"}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Detailed Dossier Panel */}
          <div className="lg:col-span-7">
            <div className="bg-card border border-card-border rounded-[32px] p-8 shadow-md relative overflow-hidden min-h-[480px] flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-8 flex-1 flex flex-col justify-between"
                  id={`step-detail-${activeStep}`}
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-card-border pb-4">
                      <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[8px] font-black uppercase tracking-widest mb-2">
                          <Sparkles className="h-3 w-3 animate-pulse" /> {STEPS[activeStep].badge}
                        </div>
                        <h3 className="text-2xl font-bold tracking-tight text-foreground">{STEPS[activeStep].title}</h3>
                      </div>
                      <span className="text-4xl font-black text-primary/20 select-none">{STEPS[activeStep].number}</span>
                    </div>

                    <p className="text-xs text-foreground/80 leading-relaxed font-semibold">
                      {STEPS[activeStep].desc}
                    </p>

                    <div className="space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary">Key Capabilities</p>
                      <div className="space-y-2.5">
                        {STEPS[activeStep].details.map((detail, idx) => (
                          <div key={idx} className="flex items-start gap-3 text-xs font-semibold text-foreground/70 leading-relaxed">
                            <Check className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                            {detail}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-card-border flex items-center justify-between mt-8">
                    <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">
                      Automated Sales Loop System
                    </span>
                    <button onClick={() => setActiveStep(prev => (prev + 1) % STEPS.length)}
                      id="next-step-btn"
                      className="h-9 px-5 rounded-full bg-primary text-white font-black text-[10px] uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 shadow-md cursor-pointer border border-primary/10"
                    >
                      Next Phase <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

        </div>
      </section>

      {/* Value & ROI Section (Market It!) */}
      <section className="py-32 border-y border-card-border bg-card/10 relative overflow-hidden" id="roi-section">
         <div className="absolute inset-0 bg-grid opacity-10" />
         <div className="max-w-7xl mx-auto px-6 relative z-10">
           
           <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
              <h2 className="text-4xl font-extrabold text-foreground tracking-tight">The Value of <span className="text-primary">Autonomous Prospecting</span></h2>
              <p className="text-foreground/75 text-xs font-semibold leading-relaxed">
                By taking humans out of manual databases, CRM logging, and SMTP check loops, HyprLead eliminates prospecting drag completely.
              </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Database,
                  title: "$0.00 Scrape Extract Cost",
                  desc: "Stop buying stale contacts. Our scheduled discovery cycles scan directories and active search listings to compile fully qualified, fresh leads from scratch.",
                  saving: "Saves $400+/mo on databases"
                },
                {
                  icon: Cpu,
                  title: "14+ Hours Saved Weekly",
                  desc: "Say goodbye to hours spent manually qualifying companies and formatting CSV cards. Your SDRs receive ready-made openers referencing verified web operational deficiencies.",
                  saving: "Saves 2 days of manual labor"
                },
                {
                  icon: ShieldCheck,
                  title: "100% Reputation Preservation",
                  desc: "Generic outbound cold spam damages your domain sender reputation. Our hyper-personalized openers achieve high reply ratios and keep bounce rates below 0.2%.",
                  saving: "Prevents domain blacklist risk"
                }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -5 }}
                    className="p-8 rounded-[32px] bg-card border border-card-border flex flex-col justify-between group hover:border-primary/20 transition-all duration-300 shadow-sm text-left"
                  >
                    <div className="space-y-6">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary transition-transform group-hover:scale-110">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground tracking-tight">{item.title}</h3>
                      <p className="text-xs text-foreground/75 leading-relaxed font-semibold">{item.desc}</p>
                    </div>
                    <div className="mt-8 pt-4 border-t border-card-border/50 text-[10px] font-black text-primary uppercase tracking-widest animate-pulse">
                      {item.saving}
                    </div>
                  </motion.div>
                );
              })}
           </div>
         </div>
      </section>

      {/* Quick Interactive Video Placeholder section */}
      <section className="py-24 px-6 text-center relative overflow-hidden" id="interactive-demo-preview">
        <div className="max-w-4xl mx-auto glass-morphism p-12 sm:p-16 rounded-[32px] space-y-6 border border-card-border relative z-10">
          <PlayCircle className="h-14 w-14 text-primary mx-auto animate-pulse" />
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Deploy Your Automated Agent</h2>
          <p className="text-xs text-foreground/75 font-semibold max-w-md mx-auto leading-relaxed">
            Ready to experience zero-friction pipeline growth? Turn on the Autonomous Lead Generation engine and let it sweep your regional markets tonight.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
             <Link href="/signup" id="cta-signup" className="h-12 px-8 rounded-full bg-primary hover:bg-primary-hover text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md">
                Launch Outbound Engine
                <ArrowRight className="h-4 w-4" />
             </Link>
             <Link href="/pricing" id="cta-pricing" className="h-12 px-8 rounded-full bg-foreground/[0.03] hover:bg-foreground/[0.06] text-foreground font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all">
                View Pricing
             </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
