"use client";

import { Suspense } from "react";
import Link from "next/link";
import { ShieldCheck, Compass, ArrowRight, Activity, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

function BillingContent() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-32 font-sans selection:bg-primary/20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-card-border pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Platform Access
          </h1>
          <p className="text-sm text-foreground/60">
            HyprLead is completely open. Subscriptions and paywalls have been decommissioned.
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bento-card p-8 md:p-12 rounded-3xl space-y-6 relative overflow-hidden bg-card border border-card-border"
      >
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Open Edition Active</h2>
            <p className="text-xs text-primary font-bold">Unmetered Access For All Users</p>
          </div>
        </div>

        <div className="space-y-3 text-sm text-foreground/75 leading-relaxed max-w-2xl">
          <p>
            We have disabled all payment gateways, subscription tiers, and search credit meters.
            The entire lead generation pipeline is completely open:
          </p>
          <ul className="space-y-2 pt-2 text-xs font-semibold text-foreground/80">
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span><strong>Unlimited Campaigns:</strong> Create and organize target audience searches with zero artificial limits.</span>
            </li>
            <li className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <span><strong>Unmetered Discovery Sweeps:</strong> Trigger background scraping across Google Maps & web directories whenever you want.</span>
            </li>
            <li className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-primary" />
              <span><strong>AI Enrichment & Instant Dispatch:</strong> Auto-extract emails, phone numbers, infer pain points, draft copy, and dispatch directly to Discord or CSV.</span>
            </li>
          </ul>
        </div>

        <div className="pt-4 flex flex-wrap gap-4">
          <Link
            href="/campaigns"
            className="h-11 px-6 rounded-full bg-primary text-white font-bold text-xs hover:brightness-110 active:scale-98 transition-all flex items-center gap-2 shadow-md shadow-primary/10"
          >
            Start Finding Leads <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/dashboard"
            className="h-11 px-6 rounded-full bg-card border border-card-border text-foreground font-bold text-xs hover:bg-card-border/30 transition-all flex items-center"
          >
            Go to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-foreground/50">Loading...</div>}>
      <BillingContent />
    </Suspense>
  );
}
