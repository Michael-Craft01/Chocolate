"use client";

import { useState, useEffect } from "react";
import { 
    Loader2,
    ShieldCheck,
    ArrowLeft,
    Settings
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { fetchCampaign } from "@/lib/services/campaigns";
import { CampaignForm } from "@/components/CampaignForm";
import type { Campaign } from "@/lib/types";

export default function EditCampaignPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    
    const [loading, setLoading] = useState(true);
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            loadCampaign();
        }
    }, [id]);

    const loadCampaign = async () => {
        try {
            const data = await fetchCampaign(id);
            setCampaign(data);
        } catch (err: any) {
            setError(err.message || "Failed to load hub intelligence.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center gap-4 bg-[#070707]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-zinc-500 font-medium tracking-widest uppercase text-[10px] font-black">Decrypting Hub Intelligence...</p>
            </div>
        );
    }

    if (error || !campaign) {
        return (
            <div className="h-screen flex flex-col items-center justify-center gap-4 bg-[#070707]">
                <h2 className="text-xl font-bold text-white">Access Denied</h2>
                <p className="text-zinc-500 text-sm">{error || "Hub DNA not found."}</p>
                <button onClick={() => router.back()} className="text-primary font-bold text-sm hover:underline">Return to Command</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#070707] text-white p-6 md:p-12 pb-32 font-sans selection:bg-primary/20">
            <div className="max-w-4xl mx-auto space-y-12">
                <div className="flex items-center justify-between">
                    <button 
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Hubs
                    </button>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                        <Settings className="h-4 w-4 glow-primary" /> Discovery Calibration
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-white">Refine <span className="text-primary">Hub DNA</span></h1>
                    <p className="text-[13px] text-zinc-500 font-medium max-w-xl leading-relaxed">Calibrate your search hub's intelligence parameters and outreach links to optimize discovery performance.</p>
                </div>

                <CampaignForm 
                    initialData={campaign} 
                    isEdit={true} 
                    campaignId={id} 
                />
            </div>
        </div>
    );
}
