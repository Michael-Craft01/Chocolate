"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Cpu, Zap, ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";

interface FeatureCard {
  title: string;
  explanation: string;
  evidence: string;
  icon: any;
  metric: string;
}

const FEATURES: FeatureCard[] = [
  {
    title: "Autonomous Query Generation",
    explanation: "Translates your target market profile into search prompts and rotates queries every 6 hours, preventing repeat scrapes and mimicking human search behaviors.",
    evidence: "Rotates 24 unique local queries daily, maintaining active lead discovery 24/7 without duplicate entries.",
    icon: Compass,
    metric: "6h Query Rotation"
  },
  {
    title: "AI Pain-Point Extraction",
    explanation: "Gemini parses prospect website content, reviews, and metadata to classify the industry, score target intent, and identify operational friction points.",
    evidence: "Uncovers structural problems and automatically tags leads with a live opportunity score.",
    icon: Cpu,
    metric: "Gemini Intelligence"
  },
  {
    title: "Tailored Message Drafting",
    explanation: "Crafts highly personalized outreach templates aligned to the prospect's verified pain points and your custom sender identity tone.",
    evidence: "Generates ready-to-dispatch cold drafts with localized references, driving up to a 42% reply rate.",
    icon: Zap,
    metric: "+42% Reply Rate"
  }
];

export default function FeaturesCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % FEATURES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 relative z-20 px-4">
      {/* Desktop View: Side-by-side Bento Cards (Always dark glassmorphic to match dark landing page) */}
      <div className="hidden md:grid grid-cols-3 gap-6">
        {FEATURES.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div 
              key={idx}
              className="p-6 md:p-8 flex flex-col justify-between min-h-[350px] lg:min-h-[380px] h-auto rounded-3xl relative overflow-hidden group border border-white/10 bg-[#0a0a0c]/60 backdrop-blur-md hover:border-primary/35 transition-all duration-350 shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="space-y-4 text-left relative z-10">
                <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base md:text-lg font-black text-white tracking-tight">{item.title}</h3>
                <p className="text-zinc-400 text-xs md:text-[13px] leading-relaxed font-semibold">
                  {item.explanation}
                </p>
              </div>

              <div className="pt-5 border-t border-white/10 mt-6 relative z-10 text-left">
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-primary mb-2">
                  <ShieldCheck size={11} /> evidence & outcome
                </div>
                <p className="text-xs font-bold text-white leading-relaxed">
                  {item.evidence}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile View: Swipeable/Carousel Slider */}
      <div className="md:hidden flex flex-col items-center gap-6">
        <div className="w-full min-h-[330px] p-6 rounded-3xl border border-white/10 bg-[#0a0a0c]/60 backdrop-blur-md flex flex-col justify-between relative overflow-hidden text-left shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 flex flex-col justify-between h-full"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    {(() => {
                      const Icon = FEATURES[currentIndex].icon;
                      return <Icon className="h-5 w-5" />;
                    })()}
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-wider">
                    {FEATURES[currentIndex].metric}
                  </span>
                </div>
                <h3 className="text-lg font-black text-white tracking-tight">{FEATURES[currentIndex].title}</h3>
                <p className="text-zinc-400 text-xs leading-relaxed font-semibold">
                  {FEATURES[currentIndex].explanation}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 mt-4">
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-primary mb-1">
                  <ShieldCheck size={10} /> evidence & outcome
                </div>
                <p className="text-xs font-bold text-white leading-relaxed">
                  {FEATURES[currentIndex].evidence}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Indicator Controls */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setCurrentIndex((prev) => (prev - 1 + FEATURES.length) % FEATURES.length)}
            className="h-8 w-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:text-primary transition-colors cursor-pointer text-white"
          >
            <ArrowLeft size={14} />
          </button>
          
          <div className="flex gap-1.5">
            {FEATURES.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? "w-4 bg-primary" : "bg-white/20"
                }`}
              />
            ))}
          </div>

          <button 
            onClick={() => setCurrentIndex((prev) => (prev + 1) % FEATURES.length)}
            className="h-8 w-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:text-primary transition-colors cursor-pointer text-white"
          >
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
