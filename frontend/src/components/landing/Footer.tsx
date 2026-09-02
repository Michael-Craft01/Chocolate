"use client";
 
import Link from "next/link";
 
export default function Footer() {
  return (
    <footer className="border-t border-border bg-background py-10 text-xs text-muted-foreground font-sans">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">HyprLead</span>
          <span>•</span>
          <span>Open Lead Intelligence Platform</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
          <Link href="/campaigns" className="hover:text-foreground transition-colors">Campaigns</Link>
          <Link href="/leads" className="hover:text-foreground transition-colors">Leads</Link>
          <Link href="/settings" className="hover:text-foreground transition-colors">Settings</Link>
        </div>

        <div>
          <span>© {new Date().getFullYear()} HyprLead. Unmetered access.</span>
        </div>
      </div>
    </footer>
  );
}
