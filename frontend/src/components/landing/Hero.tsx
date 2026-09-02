"use client";

import Link from "next/link";
import { ArrowRight, Compass, Shield, Zap } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-6 max-w-5xl mx-auto text-center space-y-8 font-sans">
      {/* Announcement Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/50 text-xs font-medium text-foreground">
        <span>Autonomous Discovery Engine</span>
        <span className="text-muted-foreground">•</span>
        <span className="font-semibold">Open Platform Edition</span>
      </div>

      {/* Main Headline & One Sentence Subtitle */}
      <div className="space-y-4 max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground">
          Automated Lead Discovery & Personalized Outreach
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          Extract verified B2B prospects, generate AI-tailored messages, and dispatch multi-channel outreach without paywalls.
        </p>
      </div>

      {/* CTA Button Group */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link
          href="/signup"
          className="h-10 px-5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <span>Start Finding Leads</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/dashboard"
          className="h-10 px-5 rounded-md border border-border bg-background hover:bg-muted text-sm font-medium text-foreground flex items-center transition-colors"
        >
          View Dashboard
        </Link>
      </div>

      {/* 3 Core Value Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left">
        <div className="rounded-lg border border-border bg-card p-6 space-y-2">
          <div className="h-8 w-8 rounded-md border border-border flex items-center justify-center text-foreground mb-3">
            <Compass className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">Multi-Source Discovery</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Crawls local directories and search maps to locate active regional businesses in any industry.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 space-y-2">
          <div className="h-8 w-8 rounded-md border border-border flex items-center justify-center text-foreground mb-3">
            <Shield className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">Visual AI Qualification</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Audits prospect websites to extract pain points and verify real decision-maker contacts.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 space-y-2">
          <div className="h-8 w-8 rounded-md border border-border flex items-center justify-center text-foreground mb-3">
            <Zap className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">Automated Outreach</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Generates personalized email pitches and dispatches directly via email, WhatsApp, or Discord webhooks.
          </p>
        </div>
      </div>
    </section>
  );
}
