"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles, Activity, Compass } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="bg-background text-foreground min-h-screen selection:bg-primary/30 transition-colors duration-500 relative overflow-hidden flex flex-col justify-between">
      <Navbar />

      <section className="relative pt-36 pb-24 px-6 flex-1 flex items-center">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest"
          >
            <Sparkles className="h-3.5 w-3.5" /> 100% Open Access Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black tracking-tight text-foreground"
          >
            Zero Paywalls. <span className="text-primary">Unmetered Leads.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-lg text-foreground/70 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            HyprLead is open for everyone. We have disabled subscription tiers, credit limits, and payment gateways so you can freely discover prospects, generate personalized outreach messages with visual AI, and dispatch to Discord or CSV.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-left"
          >
            <div className="bento-card p-6 rounded-3xl space-y-2">
              <Compass className="h-6 w-6 text-primary" />
              <h3 className="text-base font-bold text-foreground">Create Campaigns</h3>
              <p className="text-xs text-foreground/60 leading-relaxed">Organize target industries and geographic coordinates without campaign count caps.</p>
            </div>
            <div className="bento-card p-6 rounded-3xl space-y-2">
              <Activity className="h-6 w-6 text-primary" />
              <h3 className="text-base font-bold text-foreground">Multi-Source Scrapes</h3>
              <p className="text-xs text-foreground/60 leading-relaxed">Stealth browser scraping extracting direct emails, phone numbers, and websites.</p>
            </div>
            <div className="bento-card p-6 rounded-3xl space-y-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <h3 className="text-base font-bold text-foreground">Instant Dispatch</h3>
              <p className="text-xs text-foreground/60 leading-relaxed">Real-time webhook streaming to Discord and instant CSV data export.</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="pt-6"
          >
            <Link
              href="/signup"
              className="inline-flex h-12 px-8 rounded-full bg-primary hover:bg-primary-hover text-white font-bold text-sm items-center gap-2 shadow-lg shadow-primary/20 transition-all cursor-pointer"
            >
              Get Started Now — It's Free <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
