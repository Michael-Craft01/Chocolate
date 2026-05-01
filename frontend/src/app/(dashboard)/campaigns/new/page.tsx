"use client";

import { useState, useEffect } from "react";
import { 
    Loader2,
    Shield,
    CheckCircle2,
    ShieldCheck,
    ArrowLeft,
    Zap
} from "lucide-react";
import { useRouter } from "next/navigation";
import { authJson } from "@/lib/api";
import { CampaignForm } from "@/components/CampaignForm";
import { cn } from "@/lib/utils";

export default function NewCampaignPage() {
    const router = useRouter();
    const [fetchingProfile, setFetchingProfile] = useState(true);
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
            const data = await authJson<any>("/api/me");
            if (data.profile) {
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
            <div className="h-screen flex flex-col items-center justify-center gap-4 bg-[#070707]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-zinc-500 font-medium">Syncing with Company Profile...</p>
            </div>
        );
    }

    const isLimitReached = stats && stats.count >= stats.limit;

    return (
        <div className="min-h-screen bg-[#070707] text-white p-6 md:p-12 pb-32 font-sans selection:bg-primary/20">
            <div className="max-w-4xl mx-auto space-y-12">
                <div className="flex items-center justify-between">
                    <button 
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        Back
                    </button>
                    
                    <div className="flex items-center gap-4">
                        {stats && (
                            <div className={cn(
                                "flex items-center gap-3 px-4 py-1.5 rounded-[2px] border text-[10px] font-black uppercase tracking-widest",
                                isLimitReached ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-white/5 border-white/10 text-zinc-400"
                            )}>
                                <Shield className="h-3.5 w-3.5" /> Hub Capacity: {stats.count} / {stats.limit}
                            </div>
                        )}
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-[2px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Identity Synced
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                        <ShieldCheck className="h-4 w-4 glow-primary" /> Secure Data Discovery
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-white">Initialize <span className="text-primary">Search Hub</span></h1>
                    <p className="text-[13px] text-zinc-500 font-medium max-w-xl leading-relaxed">Set up a new search to find business leads. Your search will run autonomously across multiple data layers.</p>
                </div>

                {isLimitReached ? (
                    <div className="rounded-[2px] border border-red-500/30 bg-red-500/10 px-8 py-10 text-center space-y-4">
                        <Zap className="h-12 w-12 text-red-500 mx-auto" />
                        <h2 className="text-xl font-bold text-white">Hub Capacity Reached</h2>
                        <p className="text-zinc-500 text-sm max-w-md mx-auto">Your current plan allows for a maximum of {stats.limit} discovery hub. Upgrade your plan to expand your search capability.</p>
                    </div>
                ) : (
                    <CampaignForm initialData={initialData} />
                )}
            </div>
        </div>
    );
}
