"use client";

import Link from "next/link";
import { ArrowRight, Compass, Shield, Zap, Sparkles } from "lucide-react";
import Hero from "@/components/landing/Hero";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans bg-background text-foreground">
      <Navbar />

      <main className="space-y-24 pb-20">
        <Hero />

        {/* Feature Grid Section */}
        <section id="features" className="max-w-6xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Platform Capabilities</h2>
            <p className="text-sm text-muted-foreground">
              Built for founders and sales teams searching for high-intent B2B prospects.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-lg border border-border bg-card p-6 space-y-2">
              <Compass className="h-5 w-5 text-foreground mb-2" />
              <h3 className="text-sm font-semibold text-foreground">Autonomous Sweeps</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Sweeps regional business directories and map listings across targeted cities.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 space-y-2">
              <Shield className="h-5 w-5 text-foreground mb-2" />
              <h3 className="text-sm font-semibold text-foreground">Contact Extraction</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Extracts verified email addresses, phone contacts, and social endpoints.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 space-y-2">
              <Sparkles className="h-5 w-5 text-foreground mb-2" />
              <h3 className="text-sm font-semibold text-foreground">AI Personalization</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Audits prospect websites to draft contextually relevant email pitches.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 space-y-2">
              <Zap className="h-5 w-5 text-foreground mb-2" />
              <h3 className="text-sm font-semibold text-foreground">Instant Dispatch</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Transfers qualified prospects directly to mail, WhatsApp, or Discord webhooks.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="max-w-4xl mx-auto px-6">
          <div className="rounded-lg border border-border bg-card p-8 md:p-12 text-center space-y-6">
            <div className="space-y-2 max-w-xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                Start Finding Qualified Leads Today
              </h2>
              <p className="text-sm text-muted-foreground">
                Experience unmetered lead generation with our open discovery pipeline.
              </p>
            </div>

            <div>
              <Link
                href="/signup"
                className="inline-flex h-10 px-6 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium items-center gap-2 transition-colors"
              >
                <span>Get Started Now</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
