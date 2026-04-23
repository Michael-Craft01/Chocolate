"use client";

import { useState, useEffect } from "react";
import { 
    ArrowLeft, 
    Save, 
    Zap, 
    MapPin, 
    User, 
    Link,
    Briefcase,
    Target,
    Loader2,
    CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { authJson, ApiAuthError, ApiRequestError } from "@/lib/api";
import { createCampaign } from "@/lib/services/campaigns";

export default function NewCampaignPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetchingProfile, setFetchingProfile] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const inputClass = "w-full bg-white/5 border border-white/10 rounded-sm p-4 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/40 text-sm";
    
    const [campaign, setCampaign] = useState({
        name: "",
        senderName: "",
        senderRole: "",
        companyName: "",
        productName: "",
        productDescription: "",
        targetPainPoints: "",
        industries: "", 
        locations: "", 
        outreachTone: "PROFESSIONAL",
        ctaLink: "",
        discordWebhook: "",
    });

    useEffect(() => {
        loadProfileDefaults();
    }, []);

    const loadProfileDefaults = async () => {
        try {
            const data = await authJson<any>("/api/me");
            if (data.profile) {
                setCampaign(prev => ({
                    ...prev,
                    senderName: data.profile.defaultSenderName || "",
                    senderRole: data.profile.defaultSenderRole || "",
                    companyName: data.profile.companyName || "",
                    industries: data.profile.industry || "",
                    locations: "Harare" // Default city
                }));
            }
        } catch (err) {
            console.error("Failed to load profile defaults:", err);
        } finally {
            setFetchingProfile(false);
        }
    };

    const handleSave = async () => {
        if (!campaign.productName.trim() || !campaign.productDescription.trim()) {
            setError("Please provide at least a Product Name and Description.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const industries = campaign.industries.split(",").map(i => i.trim()).filter(i => i);
            const locations = campaign.locations.split(",").map(l => l.trim()).filter(l => l);

            const payload = {
                name: campaign.name.trim() || `${campaign.productName} Launch`,
                senderName: campaign.senderName.trim(),
                senderRole: campaign.senderRole.trim(),
                companyName: campaign.companyName.trim(),
                productName: campaign.productName.trim(),
                productDescription: campaign.productDescription.trim(),
                targetPainPoints: campaign.targetPainPoints.trim() || "General industry efficiency",
                industries: industries.length ? industries : ["Business"],
                locations: locations.length ? locations : ["Harare"],
                outreachTone: campaign.outreachTone as "PROFESSIONAL" | "DIRECT" | "FRIENDLY" | "EDUCATIONAL",
                ctaLink: campaign.ctaLink.trim() || undefined,
                discordWebhook: campaign.discordWebhook.trim() || undefined,
                targetCountry: "ZW",
            };

            await createCampaign(payload);
            router.push("/campaigns");
        } catch (error) {
            setError(error instanceof Error ? error.message : "Failed to launch campaign.");
        } finally {
            setLoading(false);
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

    return (
        <div className="min-h-screen bg-[#070707] text-white p-6 md:p-12 pb-32">
            <div className="max-w-4xl mx-auto space-y-12">
                <div className="flex items-center justify-between">
                    <button 
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        Back
                    </button>
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Identity Synced
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-5xl font-black tracking-tighter">Launch New Engine</h1>
                    <p className="text-zinc-400 text-lg">Define your product and let the AI find your future customers.</p>
                </div>

                {error && (
                    <div className="rounded-sm border border-red-500/30 bg-red-500/10 px-6 py-4 text-sm text-red-200 flex items-center gap-3">
                        <Zap className="h-5 w-5 text-red-500" /> {error}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-10">
                    {/* PRODUCT SECTION - HIGHLIGHTED */}
                    <section className="glass p-8 md:p-10 rounded-sm border border-primary/30 bg-primary/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-sm  -mr-32 -mt-32" />
                        
                        <div className="relative space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-sm bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                    <Target className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">The Product Offer</h2>
                                    <p className="text-zinc-400 text-sm">Tell the AI exactly what you are selling.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-3 ml-1">Product or Service Name</label>
                                    <input 
                                        type="text"
                                        placeholder="e.g. Solar Power Installation Kit"
                                        value={campaign.productName}
                                        onChange={(e) => setCampaign({...campaign, productName: e.target.value})}
                                        className={`${inputClass} !text-lg !font-bold !bg-white/10`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-3 ml-1">Value Proposition (What do you do?)</label>
                                    <textarea 
                                        rows={4}
                                        placeholder="Explain the core benefit of your offer. The AI will use this to pitch your leads."
                                        value={campaign.productDescription}
                                        onChange={(e) => setCampaign({...campaign, productDescription: e.target.value})}
                                        className={`${inputClass} resize-none leading-relaxed`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-3 ml-1">Customer Pain Points</label>
                                    <input 
                                        type="text"
                                        placeholder="e.g. High electricity bills, frequent power cuts"
                                        value={campaign.targetPainPoints}
                                        onChange={(e) => setCampaign({...campaign, targetPainPoints: e.target.value})}
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* MARKET & TARGETING */}
                    <section className="glass p-8 md:p-10 rounded-sm border border-white/5 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400">
                                <MapPin className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Target Market</h2>
                                <p className="text-zinc-400 text-sm">Where should the AI hunt for these specific customers?</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-3 ml-1">Campaign Nickname</label>
                                <input 
                                    type="text"
                                    placeholder="e.g. Winter Promo 2024"
                                    value={campaign.name}
                                    onChange={(e) => setCampaign({...campaign, name: e.target.value})}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-3 ml-1">Target Industries</label>
                                <input 
                                    type="text"
                                    placeholder="e.g. Homeowners, Factories"
                                    value={campaign.industries}
                                    onChange={(e) => setCampaign({...campaign, industries: e.target.value})}
                                    className={inputClass}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-3 ml-1">Specific Cities / Areas</label>
                                <input 
                                    type="text"
                                    placeholder="e.g. Harare, Bulawayo, Mutare"
                                    value={campaign.locations}
                                    onChange={(e) => setCampaign({...campaign, locations: e.target.value})}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </section>

                    {/* SENDER IDENTITY (SYCED) */}
                    <section className="glass p-8 md:p-10 rounded-sm border border-white/5 bg-white/[0.01] space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400">
                                    <User className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">Sender Identity</h2>
                                    <p className="text-zinc-400 text-sm">Synchronized with your Company Profile.</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-80">
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-3 ml-1">Sender Name</label>
                                <input 
                                    type="text"
                                    value={campaign.senderName}
                                    onChange={(e) => setCampaign({...campaign, senderName: e.target.value})}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-3 ml-1">Role</label>
                                <input 
                                    type="text"
                                    value={campaign.senderRole}
                                    onChange={(e) => setCampaign({...campaign, senderRole: e.target.value})}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-3 ml-1">Company</label>
                                <input 
                                    type="text"
                                    value={campaign.companyName}
                                    onChange={(e) => setCampaign({...campaign, companyName: e.target.value})}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </section>
                </div>

                <div className="flex items-center justify-center pt-10">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-primary hover:bg-primary-hover text-white px-12 py-5 rounded-sm font-black text-xl flex items-center gap-4  shadow-primary/40 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Zap size={24} className="fill-white" />}
                        {loading ? "INITIALIZING ENGINE..." : "DEPLOY CAMPAIGN"}
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
