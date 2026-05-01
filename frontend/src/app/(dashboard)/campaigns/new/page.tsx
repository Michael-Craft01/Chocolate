"use client";

import { useState, useEffect } from "react";
import { 
    Briefcase,
    Compass,
    Loader2,
    CheckCircle2,
    Shield,
    Home,
    MapPin,
    Zap,
    ShieldCheck,
    ArrowLeft,
    Save,
    User,
    Link,
    MessageSquare,
    Target
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { authJson, ApiAuthError, ApiRequestError } from "@/lib/api";
import { createCampaign } from "@/lib/services/campaigns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AIAssistButton } from "@/components/AIAssistButton";

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

    const [stats, setStats] = useState<{count: number, limit: number} | null>(null);

    useEffect(() => {
        loadProfileDefaults();
        fetchCapacity();
    }, []);

    const fetchCapacity = async () => {
        try {
            const [campaigns, user] = await Promise.all([
                authJson<any[]>("/api/campaigns"),
                authJson<any>("/api/me")
            ]);
            // Find user max campaigns from their tier data
            const max = user.tier === 'ELITE' ? 10 : user.tier === 'PROFESSIONAL' ? 5 : 1;
            setStats({ count: campaigns.length, limit: max });
        } catch (err) {
            console.error("Failed to fetch capacity:", err);
        }
    };

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
                    locations: "Harare"
                }));
            }
        } catch (err) {
            console.error("Failed to load profile defaults:", err);
        } finally {
            setFetchingProfile(false);
        }
    };

    const handleSave = async () => {
        if (stats && stats.count >= stats.limit) {
            toast.error("Hub quota reached", {
                description: `Your ${stats.limit === 1 ? 'Starter' : stats.limit === 5 ? 'Professional' : 'Elite'} plan allows for ${stats.limit} search hub.`
            });
            return;
        }

        // --- PRE-FLIGHT VALIDATION ---
        if (!campaign.productName.trim()) {
            toast.error("Offer Title required", { description: "Please define what you are offering." });
            return;
        }

        if (!campaign.senderName.trim() || !campaign.senderRole.trim() || !campaign.companyName.trim()) {
            toast.error("Identity incomplete", { description: "Please provide your name, role, and company to personalize outreach." });
            return;
        }

        const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
        if (campaign.ctaLink.trim() && !urlRegex.test(campaign.ctaLink.trim())) {
            toast.error("Invalid Call-to-Action Link", { description: "Please enter a valid URL." });
            return;
        }

        if (campaign.discordWebhook.trim() && !urlRegex.test(campaign.discordWebhook.trim())) {
            toast.error("Invalid Discord Webhook", { description: "Please enter a valid URL." });
            return;
        }

        setLoading(true);
        setError(null);
        
        const savePromise = (async () => {
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
        })();

        toast.promise(savePromise, {
            loading: 'Initializing Search Hub...',
            success: 'Search Hub Active. AI is now hunting for leads.',
            error: (err: any) => {
                if (err instanceof ApiRequestError && err.details) {
                    return `Validation: ${err.details.map(d => `${d.path.join('.')}: ${d.message}`).join(', ')}`;
                }
                return err.message || 'Failed to initialize hub.';
            }
        });

        try {
            await savePromise;
        } catch (err: any) {
            let errorMsg = err.message || "Failed to launch campaign.";
            if (err instanceof ApiRequestError && err.details) {
                errorMsg = `Validation failed: ${err.details.map(d => `${d.path.join('.')}: ${d.message}`).join(', ')}`;
            }
            setError(errorMsg);
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

                {error && (
                    <div className="rounded-[2px] border border-red-500/30 bg-red-500/10 px-6 py-4 text-sm text-red-200 flex items-center gap-3">
                        <Zap className="h-5 w-5 text-red-500" /> {error}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-10">
                    {/* MARKET OFFERING SECTION */}
                    <section className="bg-primary/[0.03] p-8 md:p-10 rounded-[2px] border border-primary/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
                        
                        <div className="relative space-y-8">
                            <button
                                type="submit"
                                onClick={handleSave}
                                disabled={loading || isLimitReached}
                                className={cn(
                                    "w-full h-16 rounded-[2px] font-black text-[12px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl",
                                    isLimitReached 
                                        ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" 
                                        : "bg-primary text-white hover:bg-primary/90 active:scale-[0.98] shadow-primary/20"
                                )}
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                    <>
                                        <Zap className={cn("h-5 w-5", !isLimitReached && "text-white")} />
                                        {isLimitReached ? "HUB QUOTA REACHED" : "INITIALIZE SEARCH HUB"}
                                    </>
                                )}
                            </button> 
                            
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-[2px] bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                    <Shield className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white tracking-tight">Market Offering</h2>
                                    <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest mt-1">Define your market identity and value.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between ml-1">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Offer Title</label>
                                        <AIAssistButton 
                                            field="Product Name" 
                                            currentValue={campaign.productName} 
                                            onRefined={(val) => setCampaign(prev => ({...prev, productName: val}))} 
                                        />
                                    </div>
                                    <input 
                                        type="text"
                                        placeholder="e.g. Enterprise Solar Solutions"
                                        value={campaign.productName}
                                        onChange={(e) => setCampaign({...campaign, productName: e.target.value})}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-[2px] p-4 transition-all focus:outline-none focus:border-primary/40 text-lg font-bold text-white placeholder:text-zinc-700"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between ml-1">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Value Proposition</label>
                                        <AIAssistButton 
                                            field="Value Proposition" 
                                            currentValue={campaign.productDescription} 
                                            context={{ productName: campaign.productName }}
                                            onRefined={(val) => setCampaign(prev => ({...prev, productDescription: val}))} 
                                        />
                                    </div>
                                    <textarea 
                                        rows={4}
                                        placeholder="Explain the core benefit of your offer. Our AI will use this to qualify and pitch leads."
                                        value={campaign.productDescription}
                                        onChange={(e) => setCampaign({...campaign, productDescription: e.target.value})}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-[2px] p-4 transition-all focus:outline-none focus:border-primary/40 text-sm leading-relaxed text-zinc-300 placeholder:text-zinc-700 resize-none"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between ml-1">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Customer Pain Points</label>
                                        <AIAssistButton 
                                            field="Customer Pain Points" 
                                            currentValue={campaign.targetPainPoints} 
                                            context={{ productName: campaign.productName, productDescription: campaign.productDescription }}
                                            onRefined={(val) => setCampaign(prev => ({...prev, targetPainPoints: val}))} 
                                        />
                                    </div>
                                    <input 
                                        type="text"
                                        placeholder="e.g. Energy instability, high operational costs"
                                        value={campaign.targetPainPoints}
                                        onChange={(e) => setCampaign({...campaign, targetPainPoints: e.target.value})}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-[2px] p-4 transition-all focus:outline-none focus:border-primary/40 text-sm text-zinc-300 placeholder:text-zinc-700"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* TARGETING & CONTEXT */}
                    <section className="bg-white/[0.01] p-8 md:p-10 rounded-[2px] border border-white/5 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-[2px] bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400">
                                <Compass className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-tight">Discovery Context</h2>
                                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">Configure your search parameters.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Hub Nickname</label>
                                    <AIAssistButton 
                                        field="Campaign Name" 
                                        currentValue={campaign.name} 
                                        context={{ productName: campaign.productName }}
                                        onRefined={(val) => setCampaign(prev => ({...prev, name: val}))} 
                                    />
                                </div>
                                <input 
                                    type="text"
                                    placeholder="e.g. Solar Phase 1"
                                    value={campaign.name}
                                    onChange={(e) => setCampaign({...campaign, name: e.target.value})}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-[2px] p-4 transition-all focus:outline-none focus:border-primary/40 text-sm text-white placeholder:text-zinc-700"
                                />
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Target Industries</label>
                                    <AIAssistButton 
                                        field="Target Industries" 
                                        currentValue={campaign.industries} 
                                        context={{ productName: campaign.productName, productDescription: campaign.productDescription }}
                                        onRefined={(val) => setCampaign(prev => ({...prev, industries: val}))} 
                                    />
                                </div>
                                <input 
                                    type="text"
                                    placeholder="e.g. Retail, Manufacturing"
                                    value={campaign.industries}
                                    onChange={(e) => setCampaign({...campaign, industries: e.target.value})}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-[2px] p-4 transition-all focus:outline-none focus:border-primary/40 text-sm text-white placeholder:text-zinc-700"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 ml-1">Specific Cities / Areas (Comma separated)</label>
                                <input 
                                    type="text"
                                    placeholder="e.g. Harare, Mutare"
                                    value={campaign.locations}
                                    onChange={(e) => setCampaign({...campaign, locations: e.target.value})}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-[2px] p-4 transition-all focus:outline-none focus:border-primary/40 text-sm text-white placeholder:text-zinc-700"
                                />
                            </div>
                        </div>
                    </section>

                    {/* SYNCED SENDER IDENTITY */}
                    <section className="bg-white/[0.01] p-8 md:p-10 rounded-[2px] border border-white/5 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-[2px] bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400">
                                <User className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-tight">Verified Identity</h2>
                                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">Synced from your company profile.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 ml-1">Sender Name</label>
                                <input 
                                    value={campaign.senderName} 
                                    onChange={(e) => setCampaign({...campaign, senderName: e.target.value})}
                                    placeholder="Your Name"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-[2px] p-4 text-sm text-white outline-none focus:border-primary/40 transition-all" 
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 ml-1">Role</label>
                                <input 
                                    value={campaign.senderRole} 
                                    onChange={(e) => setCampaign({...campaign, senderRole: e.target.value})}
                                    placeholder="e.g. Founder"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-[2px] p-4 text-sm text-white outline-none focus:border-primary/40 transition-all" 
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 ml-1">Company</label>
                                <input 
                                    value={campaign.companyName} 
                                    onChange={(e) => setCampaign({...campaign, companyName: e.target.value})}
                                    placeholder="Business Name"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-[2px] p-4 text-sm text-white outline-none focus:border-primary/40 transition-all" 
                                />
                            </div>
                        </div>
                    </section>
                </div>

                <div className="flex items-center justify-center pt-10">
                    <motion.button
                        whileHover={!isLimitReached ? { scale: 1.02 } : {}}
                        whileTap={!isLimitReached ? { scale: 0.98 } : {}}
                        onClick={handleSave}
                        disabled={loading || isLimitReached}
                        className={cn(
                            "px-14 py-6 rounded-[2px] font-black text-xl flex items-center gap-4 transition-all shadow-2xl",
                            isLimitReached 
                                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5" 
                                : "bg-primary text-white hover:bg-primary/90 shadow-primary/20"
                        )}
                    >
                        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ShieldCheck size={24} />}
                        {loading ? "INITIALIZING..." : isLimitReached ? "CAPACITY REACHED" : "DEPLOY DISCOVERY HUB"}
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
