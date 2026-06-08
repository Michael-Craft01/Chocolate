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
    title: "Define Target & Niche",
    icon: Compass,
    badge: "Define target",
    desc: "Input your search parameters: target locations, industries, and company size. Describe your company's product, landing page, and target customer needs to guide the outreach system.",
    details: [
      "Select custom industries (e.g., logistics, retail, software).",
      "Specify precise location parameters (Detroit, Portland, London, etc.).",
      "Set your product profile to guide the personalization system."
    ]
  },
  {
    number: "02",
    title: "Scheduled Automated Search",
    icon: Search,
    badge: "Automated search",
    desc: "Our search engine scans Google Maps, local business directories, and industry portals in the background. Searches run safely and reliably to find fresh local business listings.",
    details: [
      "Real-time geographic mapping of local businesses.",
      "Reliable search requests across regional markets.",
      "Automatic filtering of duplicates and irrelevant listings."
    ]
  },
  {
    number: "03",
    title: "AI Challenge Analysis",
    icon: Brain,
    badge: "AI analysis",
    desc: "HyprLead AI analyzes each target's online presence. It reads their website structure, user reviews, loading speed, and finds actual operational hurdles.",
    details: [
      "Smart analysis of target company challenges and operational blocks.",
      "Creation of an authentic challenge overview.",
      "Finding verified owner names and sender roles."
    ]
  },
  {
    number: "04",
    title: "Zero-Bounce Email Checks",
    icon: ShieldCheck,
    badge: "Email validation",
    desc: "Our verification system tests direct connections with the target's email domain. This checks if the mailbox actually exists without ever sending an email.",
    details: [
      "Zero-bounce email verification keeping bounce rates below 0.2%.",
      "Direct domain status and mail server health verification.",
      "Protection for your domain sender reputation."
    ]
  },
  {
    number: "05",
    title: "Personalized Email Drafts",
    icon: Mail,
    badge: "Personalized outreach",
    desc: "Your dashboard instantly fills with verified contact information. Next-generation AI models write highly personalized outreach emails addressing their specific business challenges.",
    details: [
      "Hyper-personalized emails referencing specific website challenges.",
      "One-click email dispatch capabilities.",
      "Real-time CRM logging and search tracking."
    ]
  }
];

export default function HowItWorksPage() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="bg-background text-foreground min-h-screen selection:bg-primary/30 transition-colors duration-500 font-sans">
      <Navbar />
 
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden px-6 text-center" id="how-it-works-hero">
        <div className="bg-animated-mesh" />
        <div className="bg-grid absolute inset-0 opacity-10 -z-10" />
        <div className="hero-glow" />
 
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-card border border-card-border mb-2 shadow-sm">
             <Cpu className="h-4 w-4 text-primary animate-pulse" />
             <span className="text-xs font-bold text-foreground/75">Automated Outreach Systems</span>
          </div>
          <h1 className="text-4xl md:text-display leading-tight" id="main-heading">
            How The Lead <br />
            <span className="animate-text-shimmer bg-clip-text text-transparent bg-gradient-to-r from-primary via-emerald-400 to-primary">Engine Works.</span>
          </h1>
          <p className="max-w-xl mx-auto text-foreground/80 text-sm font-semibold leading-relaxed px-4">
            Discover our automated lead search process. We search the web, identify key website challenges, verify email address status, and write personalized outreach drafts.
          </p>
        </div>
      </section>
 
      {/* Five-Step Visual Interface System */}
      <section className="py-16 max-w-7xl mx-auto px-6 relative z-10" id="pipeline-section">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Step Navigator */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-xs font-bold text-primary flex items-center gap-2 mb-4">
              <Layers className="h-4 w-4 text-primary" /> Step-by-step pipeline
            </h2>
            <div className="flex flex-col gap-3">
              {STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isActive = activeStep === idx;
                return (
                  <button key={step.number} onClick={() => setActiveStep(idx)}
                    id={`step-btn-${idx}`}
                    className={`w-full p-4 rounded-2xl border text-left transition-all duration-300 flex items-center justify-between gap-4 cursor-pointer hover:scale-[1.01] ${
                      isActive 
                        ? "bg-primary/10 border-primary shadow-sm" 
                        : "bg-card border-card-border hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className={`text-xs font-bold shrink-0 ${isActive ? "text-primary" : "text-foreground/40"}`}>
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
            <div className="bg-card border border-card-border rounded-[32px] p-6 md:p-8 shadow-md relative overflow-hidden min-h-[440px] flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6 flex-1 flex flex-col justify-between"
                  id={`step-detail-${activeStep}`}
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-card-border pb-4">
                      <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-2">
                          <Sparkles className="h-3 w-3 animate-pulse" /> {STEPS[activeStep].badge}
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">{STEPS[activeStep].title}</h3>
                      </div>
                      <span className="text-3xl font-bold text-primary/20 select-none">{STEPS[activeStep].number}</span>
                    </div>
 
                    <p className="text-xs text-foreground/80 leading-relaxed font-semibold">
                      {STEPS[activeStep].desc}
                    </p>
 
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-primary">Key capabilities</p>
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
 
                  <div className="pt-4 border-t border-card-border flex items-center justify-between mt-6">
                    <span className="text-xs font-bold text-foreground/40">
                      Automated search process
                    </span>
                    <button onClick={() => setActiveStep(prev => (prev + 1) % STEPS.length)}
                      id="next-step-btn"
                      className="h-9 px-4 rounded-full bg-primary text-white font-bold text-xs hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 shadow-md cursor-pointer border border-primary/10"
                    >
                      Next step <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

        </div>
      </section>

      {/* Value & ROI Section (Market It!) */}
      <section className="py-20 border-y border-card-border bg-card/10 relative overflow-hidden" id="roi-section">
         <div className="absolute inset-0 bg-grid opacity-10" />
         <div className="max-w-7xl mx-auto px-6 relative z-10">
            
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
               <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">The Value of <span className="text-primary">Automated Lead Generation</span></h2>
               <p className="text-foreground/75 text-xs font-semibold leading-relaxed">
                 By automating directory searches and email verification checks, HyprLead simplifies lead generation completely.
               </p>
            </div>
 
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                 {
                   icon: Database,
                   title: "Free Lead Exports",
                   desc: "Stop buying outdated contacts. Our automated searches scan local registries and directories to find fresh business leads.",
                   saving: "Save on expensive databases"
                 },
                 {
                   icon: Cpu,
                   title: "14+ Hours Saved Weekly",
                   desc: "Say goodbye to hours spent manually qualifying companies and formatting lists. Receive personalized outreach drafts addressing actual client needs.",
                   saving: "Save 2 days of manual work"
                 },
                 {
                   icon: ShieldCheck,
                   title: "Domain Reputation Protection",
                   desc: "Generic outreach cold spam damages your email domain reputation. Our highly personalized drafts achieve high response rates and keep bounce rates low.",
                   saving: "Protect your sender reputation"
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
                     <div className="mt-8 pt-4 border-t border-card-border/50 text-xs font-bold text-primary animate-pulse">
                       {item.saving}
                     </div>
                   </motion.div>
                 );
               })}
            </div>
         </div>
      </section>
 
      {/* Quick Interactive Video Placeholder section */}
      <section className="py-16 px-6 text-center relative overflow-hidden" id="interactive-demo-preview">
        <div className="max-w-4xl mx-auto glass-morphism p-8 sm:p-16 rounded-[32px] space-y-6 border border-card-border relative z-10">
          <PlayCircle className="h-14 w-14 text-primary mx-auto animate-pulse" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">Start Automating Your Lead Search</h2>
          <p className="text-xs text-foreground/75 font-semibold max-w-md mx-auto leading-relaxed px-4">
            Ready to grow your business? Start your first automated lead search today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
             <Link href="/signup" id="cta-signup" className="h-12 w-full sm:w-auto px-8 rounded-full bg-primary hover:bg-primary-hover text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md">
                Start Free Search
                <ArrowRight className="h-4 w-4" />
             </Link>
             <Link href="/pricing" id="cta-pricing" className="h-12 w-full sm:w-auto px-8 rounded-full bg-foreground/[0.03] hover:bg-foreground/[0.06] text-foreground font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all">
                View Pricing
             </Link>
          </div>
        </div>
      </section>
 
      <Footer />
    </div>
  );
}
