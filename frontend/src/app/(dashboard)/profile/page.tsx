"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, Calendar, Settings, Compass, RefreshCw, Loader2 } from "lucide-react";
import { authJson } from "@/lib/api";

interface UserProfile {
  id: string;
  email: string;
  tier: string;
  paymentStatus: string;
  createdAt: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [userData, statsData] = await Promise.all([
        authJson<UserProfile>("/api/me"),
        authJson<any>("/api/stats").catch(() => null)
      ]);

      setProfile(userData);
      setStats(statsData);
    } catch (err: any) {
      console.error("Profile fetch error:", err);
      setError(err.message || "Failed to load profile details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-foreground" />
        <p className="text-xs text-muted-foreground">Loading account details...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="py-20 text-center space-y-3">
        <p className="text-sm font-semibold text-foreground">Access Error</p>
        <p className="text-xs text-muted-foreground">{error || "Could not retrieve account details."}</p>
        <button 
          onClick={fetchData} 
          className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const memberSince = profile.createdAt 
    ? new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) 
    : 'Active';

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Account</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your authentication identity and user preferences.
          </p>
        </div>

        <button 
          onClick={fetchData}
          className="h-9 px-3 rounded-md border border-border bg-background hover:bg-muted text-xs font-medium text-foreground flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Sync</span>
        </button>
      </div>

      {/* Profile Details Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <div className="border-b border-border pb-3">
            <h2 className="text-base font-semibold text-foreground">User Credentials</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Primary account authentication and registration timestamp.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="font-medium text-muted-foreground">Email:</span>
              <span className="font-medium text-foreground">{profile.email}</span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="font-medium text-muted-foreground">Member Since:</span>
              <span className="font-medium text-foreground">{memberSince}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium text-muted-foreground">Platform Access:</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium border border-border bg-muted text-foreground">
                Open Edition
              </span>
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <div className="border-b border-border pb-3">
            <h2 className="text-base font-semibold text-foreground">Platform Navigation</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Quick shortcuts to core discovery and system settings.
            </p>
          </div>

          <div className="space-y-2">
            <Link
              href="/settings"
              className="flex items-center justify-between p-3 rounded-md border border-border hover:bg-muted/50 transition-colors text-xs font-medium text-foreground"
            >
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span>Configure Business Identity & Settings</span>
              </div>
              <span className="text-muted-foreground">&rarr;</span>
            </Link>

            <Link
              href="/campaigns"
              className="flex items-center justify-between p-3 rounded-md border border-border hover:bg-muted/50 transition-colors text-xs font-medium text-foreground"
            >
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-muted-foreground" />
                <span>Manage Search Campaigns</span>
              </div>
              <span className="text-muted-foreground">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
