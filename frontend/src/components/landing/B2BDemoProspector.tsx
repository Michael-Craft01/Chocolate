"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Brain, Shield, Mail, CheckCircle2, Play, Users, MapPin, Sparkles, Phone, ArrowRight, RotateCcw, Building2, ShoppingCart, Laptop } from "lucide-react";

interface NicheData {
  industry: string;
  icon: any;
  companyName: string;
  location: string;
  details: string;
  painPoint: string;
  email: string;
  phone: string;
  subject: string;
  body: string;
}

const NICHES: NicheData[] = [
  {
    industry: "Industrial & Wholesale",
    icon: Building2,
    companyName: "Atlas Ironworks LLC",
    location: "Detroit, MI",
    details: "12 local branches. Missing local Google Maps presence. Non-mobile procurement funnel.",
    painPoint: "Losing high-value regional wholesale purchase orders to out-of-state competitors due to zero local digital search visibility and missing direct outreach channels.",
    email: "procurement@atlasironworks.com",
    phone: "+1 (313) 555-0142",
    subject: "Michigan distribution opportunities for Atlas Ironworks",
    body: "Hi Thomas,\n\nI noticed Atlas Ironworks dominates heavy manufacturing in Detroit, but local wholesale buyers searching for 'industrial rigging suppliers' online are landing on out-of-state competitors due to missing map listings and a non-mobile procurement funnel.\n\nWe mapped a qualified pipeline of 24 Michigan distributors looking for local rigging partnerships this quarter. Can I send you their search volume metrics this Thursday at 10 AM?"
  },
  {
    industry: "Gourmet & Retail Grocery",
    icon: ShoppingCart,
    companyName: "Wildwood Organic Roasters",
    location: "Portland, OR",
    details: "Boutique coffee roastery. Strong social presence, but website uses broken Shopify forms. No automated wholesale channel.",
    painPoint: "Losing recurring wholesale revenue from regional supermarkets due to manual PDF ordering paperwork and slow manual retailer verification loops.",
    email: "wholesale@wildwoodroasters.com",
    phone: "+1 (503) 555-0198",
    subject: "Streamlining Wildwood's B2B specialty grocery pipeline",
    body: "Hi Elena,\n\nYour organic roasts have incredible consumer reviews in Portland, but regional grocery procurement buyers are dropping out of your wholesale funnel because of manual B2B order attachments and slow email intake verification.\n\nWe've identified 12 high-end grocery outlets in the Pacific Northwest actively seeking organic beverage partnerships. Can I show you a 5-minute automated setup that handles their ordering and instant CRM syncing?"
  },
  {
    industry: "B2B SaaS & Tech Startups",
    icon: Laptop,
    companyName: "LogiFlow Systems",
    location: "San Francisco, CA",
    details: "Enterprise logistics middleware. Fast product growth, but outbound pipeline is entirely manual with high email bounce rates.",
    painPoint: "SDR teams wasting 14+ hours weekly on manual sales database scraping, cold outreach to stale contact lists, and low inbox delivery rates.",
    email: "marcus@logiflow.io",
    phone: "+1 (415) 555-0165",
    subject: "Automating LogiFlow's outbound lead qualification",
    body: "Hi Marcus,\n\nI saw LogiFlow is scaling its enterprise sales team, but your SDRs are likely spending hours manual-cleaning legacy contact databases and sending generic pitches that hit spam filters due to stale SMTP records.\n\nWe discovered 45 logistics directors who recently updated their tech stack profile and are looking for middleware upgrades. Would you like to review their verified contact cards and AI-customized intro scripts?"
  }
];

export default function B2BDemoProspector() {
  const [activeNicheIndex, setActiveNicheIndex] = useState(0);
  const [phase, setPhase] = useState<"idle" | "sweeping" | "analyzing" | "verifying" | "drafting" | "completed">("idle");
  const [progress, setProgress] = useState(0);
  const [typedBody, setTypedBody] = useState("");
  const activeNiche = NICHES[activeNicheIndex];

  // Handle phase transitions
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (phase === "sweeping") {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setPhase("analyzing");
            return 100;
          }
          return prev + 5;
        });
      }, 100);
      return () => clearInterval(interval);
    } else if (phase === "analyzing") {
      timer = setTimeout(() => setPhase("verifying"), 2000);
    } else if (phase === "verifying") {
      timer = setTimeout(() => {
        setPhase("drafting");
        setTypedBody("");
      }, 2000);
    } else if (phase === "drafting") {
      const fullText = activeNiche.body;
      let currentIndex = 0;
      const typeInterval = setInterval(() => {
        if (currentIndex < fullText.length) {
          setTypedBody(fullText.substring(0, currentIndex + 4));
          currentIndex += 4;
        } else {
          clearInterval(typeInterval);
          setPhase("completed");
        }
      }, 25);
      return () => clearInterval(typeInterval);
    }
    return () => clearTimeout(timer);
  }, [phase, activeNicheIndex]);

  const startSweep = () => {
    setPhase("sweeping");
    setTypedBody("");
    setProgress(0);
  };

  const resetSweep = () => {
    setPhase("idle");
    setTypedBody("");
    setProgress(0);
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-[32px] bg-card border border-card-border p-6 sm:p-10 shadow-lg relative overflow-hidden text-left">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -z-10 pointer-events-none" />
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-2">
            <Sparkles className="h-3 w-3 animate-pulse" /> Live Pipeline Discovery Demo
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">See How AI Discovers Your Target Market</h3>
        </div>
        
        {phase !== "idle" && (
          <button onClick={resetSweep} className="h-9 px-4 rounded-full bg-white/5 flex items-center gap-2 hover:bg-white/10 text-foreground cursor-pointer text-xs font-bold transition-all active:scale-98" >
            <RotateCcw className="h-3 w-3" /> Reset Demo
          </button>
        )}
      </div>

      {/* Step Tabs: Industry Select */}
      {phase === "idle" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {NICHES.map((niche, idx) => (
            <button key={idx} onClick={() => setActiveNicheIndex(idx)}
              className={`p-4 rounded-2xl border text-left transition-all duration-300 flex items-center gap-3 cursor-pointer ${
                activeNicheIndex === idx 
                  ? "bg-primary/10 border-primary text-foreground" 
                  : "bg-background border-card-border hover:border-primary/30 text-foreground"
              }`}
            >
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 text-primary">
                <niche.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-primary">Target Vertical</p>
                <p className="text-sm font-bold text-foreground truncate">{niche.industry}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Simulator Interface Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Control / Status Panel */}
        <div className="lg:col-span-5 flex flex-col justify-between p-6 rounded-2xl bg-background border border-card-border min-h-[360px] relative overflow-hidden">
          {phase === "idle" ? (
            <div className="space-y-6 my-auto text-center py-6">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-bold text-foreground">Target Segment Active</h4>
                <p className="text-xs text-foreground font-medium max-w-xs mx-auto leading-relaxed">
                  Click below to watch the autonomous scraper crawl geographical hubs, extract deep business pain-points, verify credentials, and write outreach drafts.
                </p>
              </div>
              <button onClick={startSweep} className="btn-pill-white !bg-primary !text-white hover:!bg-primary-hover !h-12 w-full max-w-[240px] mx-auto text-xs uppercase tracking-widest font-black flex items-center justify-center gap-2 cursor-pointer shadow-md" >
                <Play className="h-4 w-4 fill-white" /> Start Sweep Cycle
              </button>
            </div>
          ) : (
            <div className="space-y-6 h-full flex flex-col justify-between">
              {/* Progress Flow */}
              <div className="space-y-5">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-foreground border-b border-card-border pb-2 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary animate-ping" /> Scraper Pipeline Logs
                </h4>
                
                {/* Step 1: Mapping & Scrape */}
                <div className="flex gap-3 items-start">
                  <div className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black ${
                    phase === "sweeping" ? "bg-primary text-white animate-spin" : "bg-primary/20 text-primary"
                  }`}>
                    {phase === "sweeping" ? "↻" : "✓"}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">1. Hub Sweep Discovery</p>
                    {phase === "sweeping" ? (
                      <p className="text-[10px] text-primary font-mono mt-1">Sweeping coordinate systems... {progress}%</p>
                    ) : (
                      <p className="text-[10px] text-foreground/75 font-mono mt-0.5">Found: {activeNiche.companyName} ({activeNiche.location})</p>
                    )}
                  </div>
                </div>

                {/* Step 2: AI Pain Point Excavation */}
                <div className="flex gap-3 items-start">
                  <div className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black ${
                    phase === "sweeping" ? "bg-card-border text-foreground/40" :
                    phase === "analyzing" ? "bg-primary text-white animate-pulse" : "bg-primary/20 text-primary"
                  }`}>
                    {phase === "sweeping" ? "2" : phase === "analyzing" ? "★" : "✓"}
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${phase === "sweeping" ? "text-foreground/45" : "text-foreground"}`}>2. Pain-Point Excavation</p>
                    {phase === "analyzing" && (
                      <p className="text-[10px] text-primary font-mono mt-1 animate-pulse">AI extracting website friction...</p>
                    )}
                    {phase !== "sweeping" && phase !== "analyzing" && (
                      <p className="text-[10px] text-foreground/75 font-mono mt-0.5">AI Pinpoint: Outdated funnel & low reach</p>
                    )}
                  </div>
                </div>

                {/* Step 3: SMTP Validation */}
                <div className="flex gap-3 items-start">
                  <div className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black ${
                    phase === "sweeping" || phase === "analyzing" ? "bg-card-border text-foreground/40" :
                    phase === "verifying" ? "bg-primary text-white animate-pulse" : "bg-primary/20 text-primary"
                  }`}>
                    {phase === "sweeping" || phase === "analyzing" ? "3" : phase === "verifying" ? "⚙" : "✓"}
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${phase === "sweeping" || phase === "analyzing" ? "text-foreground/45" : "text-foreground"}`}>3. Credentials Verification</p>
                    {phase === "verifying" && (
                      <p className="text-[10px] text-primary font-mono mt-1">SMTP handshake and domain DNS lookup...</p>
                    )}
                    {phase !== "sweeping" && phase !== "analyzing" && phase !== "verifying" && (
                      <p className="text-[10px] text-emerald-500 font-mono mt-0.5">100% Verified Inbox Handshake</p>
                    )}
                  </div>
                </div>

                {/* Step 4: Outbound Drafting */}
                <div className="flex gap-3 items-start">
                  <div className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black ${
                    phase !== "drafting" && phase !== "completed" ? "bg-card-border text-foreground/40" :
                    phase === "drafting" ? "bg-primary text-white animate-bounce" : "bg-primary/20 text-primary"
                  }`}>
                    {phase !== "drafting" && phase !== "completed" ? "4" : "✓"}
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${phase !== "drafting" && phase !== "completed" ? "text-foreground/45" : "text-foreground"}`}>4. Hyper-Personalized Outbound</p>
                    {phase === "drafting" && (
                      <p className="text-[10px] text-primary font-mono mt-1">Copywriting draft rendering...</p>
                    )}
                    {phase === "completed" && (
                      <p className="text-[10px] text-foreground/75 font-mono mt-0.5">Custom draft prepared</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Dynamic Status */}
              <div className="pt-4 border-t border-card-border">
                {phase === "sweeping" && (
                  <div className="w-full bg-card-border h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full transition-all duration-100" style={{ width: `${progress}%` }} />
                  </div>
                )}
                {phase === "analyzing" && (
                  <div className="flex items-center gap-2 text-xs font-bold text-primary">
                    <Brain className="h-4 w-4 animate-bounce text-primary" /> Analyzing business web layout...
                  </div>
                )}
                {phase === "verifying" && (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-500">
                    <Shield className="h-4 w-4 text-emerald-500 animate-pulse" /> Validating contact credentials...
                  </div>
                )}
                {phase === "drafting" && (
                  <div className="flex items-center gap-2 text-xs font-bold text-primary">
                    <Mail className="h-4 w-4 text-primary animate-pulse" /> Writing customized outbound draft...
                  </div>
                )}
                {phase === "completed" && (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-500">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Pipeline Target Ready
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Output / Result Console */}
        <div className="lg:col-span-7 rounded-2xl bg-background border border-card-border p-6 flex flex-col justify-between min-h-[360px] shadow-sm">
          <AnimatePresence mode="wait">
            {phase === "idle" ? (
              <motion.div 
                key="idle-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col justify-between"
              >
                <div className="space-y-5">
                  <div className="flex justify-between items-center border-b border-card-border pb-3">
                    <span className="text-xs font-black uppercase tracking-wider text-foreground">Interactive Simulator Console</span>
                    <span className="px-2 py-0.5 rounded-full bg-card-border text-foreground text-[10px] font-bold">READY</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Company Profile</p>
                      <p className="text-lg font-bold text-foreground">{activeNiche.companyName}</p>
                      <p className="text-xs text-foreground/60 flex items-center gap-1 font-medium mt-1">
                        <MapPin className="h-3.5 w-3.5 text-primary" /> {activeNiche.location}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Target Web Assets</p>
                      <p className="text-xs font-medium text-foreground/80 leading-relaxed bg-card p-3 rounded-xl border border-card-border">{activeNiche.details}</p>
                    </div>

                      <div className="flex items-center gap-2 mt-1">
                        <activeNiche.icon className="h-4 w-4 text-primary" />
                        <span className="text-sm font-bold text-foreground">{activeNiche.industry}</span>
                      </div>
                  </div>
                </div>

                <div className="text-[10px] font-bold text-foreground/45 uppercase tracking-widest text-center mt-6">
                  Select an industry above and sweep to uncover leads
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="active-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col justify-between space-y-6"
              >
                {/* Sweeping state */}
                {phase === "sweeping" && (
                  <div className="h-full flex flex-col items-center justify-center text-center my-auto space-y-4 py-12">
                    <div className="h-12 w-12 rounded-full border-2 border-dashed border-primary animate-spin" />
                    <div>
                      <p className="text-sm font-bold text-foreground">Scraper Nodes Executing...</p>
                      <p className="text-[10px] text-foreground/60 font-mono mt-1">Iterating coordinates around {activeNiche.location}...</p>
                    </div>
                  </div>
                )}

                {/* Analyzing state */}
                {phase === "analyzing" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-card-border pb-3">
                      <span className="text-xs font-black uppercase tracking-wider text-primary">Uncovering Target Pain Points</span>
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black">AI CRAWLING</span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-black text-foreground/60 uppercase tracking-widest mb-1">Entity Identified</p>
                        <p className="text-md font-bold text-foreground">{activeNiche.companyName}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1">
                          <Brain className="h-3.5 w-3.5 text-primary" /> HyprLead AI Extracted Business Pain Matrix:
                        </p>
                        <p className="text-xs font-semibold leading-relaxed text-foreground">{activeNiche.painPoint}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Verifying credentials state */}
                {phase === "verifying" && (
                  <div className="space-y-5">
                    <div className="flex justify-between items-center border-b border-card-border pb-3">
                      <span className="text-xs font-black uppercase tracking-wider text-emerald-500">Contact Credentials Authentication</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black">SMTP ACTIVE</span>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-card border border-card-border flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-primary" />
                          <div>
                            <p className="text-[9px] font-black text-foreground/50 uppercase tracking-widest">Target Corporate Email</p>
                            <p className="text-xs font-bold text-foreground font-mono">{activeNiche.email}</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest animate-pulse border border-emerald-500/20">
                          SMTP Handshake OK
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-card border border-card-border flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-primary" />
                          <div>
                            <p className="text-[9px] font-black text-foreground/50 uppercase tracking-widest">Verified Direct Line</p>
                            <p className="text-xs font-bold text-foreground font-mono">{activeNiche.phone}</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                          CELL PHONE MATCH
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Drafting / Completed Outreach state */}
                {(phase === "drafting" || phase === "completed") && (
                  <div className="space-y-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-center border-b border-card-border pb-3 shrink-0">
                      <span className="text-xs font-black uppercase tracking-wider text-foreground">AI Personalized Outbound Email Draft</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        phase === "completed" ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary animate-pulse"
                      }`}>
                        {phase === "completed" ? "DRAFT GENERATED" : "WRITING DRAFT"}
                      </span>
                    </div>

                    <div className="flex-1 rounded-xl bg-card border border-card-border p-4 flex flex-col justify-between min-h-[220px]">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 border-b border-card-border/50 pb-2 text-xs">
                          <span className="font-bold text-foreground/50 w-16 uppercase text-[9px] tracking-wider">Subject:</span>
                          <span className="font-bold text-foreground">{activeNiche.subject}</span>
                        </div>
                        <div className="text-xs leading-relaxed text-foreground/90 font-mono whitespace-pre-wrap">
                          {typedBody}
                          {phase === "drafting" && <span className="inline-block w-1.5 h-3.5 bg-primary animate-pulse ml-0.5" />}
                        </div>
                      </div>
                      
                      {phase === "completed" && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="pt-4 border-t border-card-border/50 flex flex-col sm:flex-row gap-4 items-center justify-between"
                        >
                          <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider flex items-center gap-1">
                            🚀 Ready to Sync with CRM and Trigger Dispatch
                          </span>
                          <button onClick={startSweep} className="btn-pill-white !bg-primary !text-white hover:!bg-primary-hover !h-8 !px-4 text-[10px] uppercase tracking-wider font-black flex items-center gap-1.5 cursor-pointer" >
                            Re-run Sweep <ArrowRight className="h-3 w-3" />
                          </button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
