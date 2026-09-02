"use client";

import { useState, useEffect } from "react";
import { 
    Loader2,
    Shield,
    CheckCircle2,
    ShieldCheck,
    ArrowLeft,
    Zap,
    Settings,
    ArrowRight,
    ChevronRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authJson } from "@/lib/api";
import { CampaignForm } from "@/components/CampaignForm";
import { cn } from "@/lib/utils";

export default function NewCampaignPage() {
    const router = useRouter();
    const [fetchingProfile, setFetchingProfile] = useState(true);
    const [profileConfigured, setProfileConfigured] = useState(true);
    const [stats, setStats] = useState<{count: number, limit: number} | null>(null);
    const [initialData, setInitialData] = useState<any>(null);

    useEffect(() => {
        loadInitialData();
        fetchCapacity();
    }, []);

    const fetchCapacity = async () => {
        try {
            const [campaigns, user] = await Promise.all([
                authJson<any[]>("/api/campaigns"),
                authJson<any>("/api/me")
            ]);
            const max = user.tier === 'ELITE' ? 10 : user.tier === 'PROFESSIONAL' ? 5 : 1;
            setStats({ count: campaigns.length, limit: max });
        } catch (err) {
            console.error("Failed to fetch capacity:", err);
        }
    };

    const loadInitialData = async () => {
        try {
            const data = await authJson<any>("/api/settings");
            if (data.profile) {
                setProfileConfigured(data.profile.onboardingComplete);
                setInitialData({
                    senderName: data.profile.defaultSenderName || "",
                    senderRole: data.profile.defaultSenderRole || "",
                    companyName: data.profile.companyName || "",
                    industries: data.profile.industry || "",
                    locations: "Harare"
                });
            }
        } catch (err) {
            console.error("Failed to load profile defaults:", err);
        } finally {
            setFetchingProfile(false);
        }
    };

    if (fetchingProfile) {
        return (
            <div className="h-screen flex flex-col items-center justify-center gap-4 bg-transparent">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-zinc-500 font-medium">Syncing with Company Profile...</p>
            </div>
        );
    }

    if (!profileConfigured) {
        return (
            <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 font-sans select-none">
                <div className="max-w-md w-full bg-card border border-card-border p-8 rounded-3xl space-y-6 relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.05),transparent_50%)] pointer-events-none" />
                    
                    <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto shadow-inner">
                        <Settings size={28} className="animate-pulse" />
                    </div>
                    
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-foreground tracking-tight">Business Profile Required</h2>
                        <p className="text-zinc-550 text-xs leading-relaxed max-w-sm mx-auto">
                            Configure your Business Identity Profile in settings before you can start searching for leads.
                        </p>
                    </div>
                    
                    <div className="pt-2">
                        <Link
                            href="/settings?setup=true"
                            className="inline-flex h-11 px-6 rounded-full bg-primary hover:brightness-110 active:scale-98 text-white font-bold text-xs transition-all items-center justify-center gap-2 shadow-lg shadow-primary/10 cursor-pointer"
                        >
                            Configure Settings
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent text-white p-6 md:p-12 pb-32 font-sans selection:bg-primary/20">
            <div className="max-w-4xl mx-auto space-y-12">
                <div className="flex items-center justify-between">
                    <button onClick={() => router.back()}
                        className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        Back
                    </button>
                    
                    <div className="flex items-center gap-4">
                        {stats && (
                            <div className="flex items-center gap-3 px-4 py-1.5 rounded-[2px] border text-[10px] font-black uppercase tracking-widest bg-white/5 border-white/10 text-zinc-400">
                                <Shield className="h-3.5 w-3.5" /> Total Campaigns: {stats.count}
                            </div>
                        )}
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-[2px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Profile Synced
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                        <ShieldCheck className="h-4 w-4 glow-primary" /> Secure Lead Search
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-white">Start a New <span className="text-primary">Lead Search</span></h1>
                    <p className="text-[13px] text-zinc-500 font-medium max-w-xl leading-relaxed">Create a new search configuration to find sales leads. The AI agent will automatically search business networks and directories.</p>
                </div>

                <CampaignForm initialData={initialData} />
            </div>
        </div>
    );
}
