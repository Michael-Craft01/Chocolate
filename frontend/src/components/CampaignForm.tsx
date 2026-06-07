"use client";

import { useState, useEffect } from "react";
import { 
    Briefcase,
    Compass,
    Loader2,
    CheckCircle2,
    Shield,
    Zap,
    ShieldCheck,
    User,
    Link as LinkIcon,
    Globe,
    Upload
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { authJson, ApiRequestError } from "@/lib/api";
import { createCampaign, updateCampaign, type CreateCampaignPayload } from "@/lib/services/campaigns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AIAssistButton } from "@/components/AIAssistButton";
import { NeuralDropdown } from "@/components/NeuralDropdown";

interface CampaignFormProps {
    initialData?: any;
    isEdit?: boolean;
    campaignId?: string;
}

export function CampaignForm({ initialData, isEdit, campaignId }: CampaignFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [campaign, setCampaign] = useState({
        name: initialData?.name || "",
        senderName: initialData?.senderName || "",
        senderRole: initialData?.senderRole || "",
        companyName: initialData?.companyName || "",
        productName: initialData?.productName || "",
        productDescription: initialData?.productDescription || "",
        targetPainPoints: initialData?.targetPainPoints || "",
        industries: Array.isArray(initialData?.industries) ? initialData.industries.join(", ") : (initialData?.industries || ""),
        locations: Array.isArray(initialData?.locations) ? initialData.locations.join(", ") : (initialData?.locations || ""), 
        outreachTone: initialData?.outreachTone || "PROFESSIONAL",
        ctaLink: initialData?.ctaLink || "",
        discordWebhook: initialData?.discordWebhook || "",
        targetCountry: initialData?.targetCountry || "ZW",
    });

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldKey: "locations" | "industries") => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            if (!text) return;

            const parsed = text
                .split(/[\n\r,;\t]+/)
                .map(item => item.trim())
                .filter(item => item.length > 0 && !item.startsWith('"') && !item.endsWith('"'));

            const joined = parsed.join(", ");
            setCampaign(prev => ({ ...prev, [fieldKey]: joined }));
            toast.success(`Imported ${parsed.length} items from ${file.name}`);
        };
        reader.readAsText(file);
    };

    const handleSave = async () => {
        // --- PRE-FLIGHT VALIDATION ---
        if (!campaign.productName.trim()) {
            toast.error("Offer Title required", { description: "Please define what you are offering." });
            return;
        }

        if (!campaign.senderName.trim() || !campaign.senderRole.trim() || !campaign.companyName.trim()) {
            toast.error("Identity incomplete", { description: "Please provide your name, role, and company." });
            return;
        }

        const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
        if (campaign.ctaLink.trim() && !urlRegex.test(campaign.ctaLink.trim())) {
            toast.error("Invalid Product URL", { description: "Please enter a valid link (e.g. https://yourproduct.com)" });
            return;
        }

        setLoading(true);
        setError(null);
        
        const savePromise = (async () => {
            const industries = campaign.industries.split(",").map((i: string) => i.trim()).filter((i: string) => i);
            const locations = campaign.locations.split(",").map((l: string) => l.trim()).filter((l: string) => l);

            const payload: any = {
                name: campaign.name.trim() || `${campaign.productName} Launch`,
                senderName: campaign.senderName.trim(),
                senderRole: campaign.senderRole.trim(),
                companyName: campaign.companyName.trim(),
                productName: campaign.productName.trim(),
                productDescription: campaign.productDescription.trim(),
                targetPainPoints: campaign.targetPainPoints.trim() || "General industry efficiency",
                industries: industries.length ? industries : ["Business"],
                locations: locations.length ? locations : ["Harare"],
                outreachTone: campaign.outreachTone,
                ctaLink: campaign.ctaLink.trim() || undefined,
                discordWebhook: campaign.discordWebhook.trim() || undefined,
                targetCountry: campaign.targetCountry,
            };

            if (isEdit && campaignId) {
                await updateCampaign(campaignId, payload);
            } else {
                await createCampaign(payload);
            }
            router.push("/campaigns");
        })();

        toast.promise(savePromise, {
            loading: isEdit ? 'Saving Campaign Settings...' : 'Initializing Lead Campaign...',
            success: isEdit ? 'Campaign Settings Updated.' : 'Campaign Active. AI search started.',
            error: (err: any) => {
                if (err instanceof ApiRequestError && err.details) {
                    return `Validation: ${err.details.map(d => `${d.path.join('.')}: ${d.message}`).join(', ')}`;
                }
                return err.message || 'Failed to process campaign request.';
            }
        });

        try {
            await savePromise;
        } catch (err: any) {
            setError(err.message || "Operation failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 gap-10">
            {/* MARKET OFFERING SECTION */}
            <section className="bg-primary/[0.03] p-8 md:p-10 rounded-[2px] border border-primary/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
                
                <div className="relative space-y-10">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-[2px] bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                            <Shield className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white tracking-tight">Market Offering</h2>
                            <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest mt-1">Define your product identity and link.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
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
                                placeholder="e.g. Takada POS Suite"
                                value={campaign.productName}
                                onChange={(e) => setCampaign({...campaign, productName: e.target.value})}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-[2px] p-4 transition-all focus:outline-none focus:border-primary/40 text-lg font-bold text-white placeholder:text-zinc-800"
                            />
                        </div>

                        {/* NEW: PRODUCT WEB URL FIELD */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Globe size={10} className="text-zinc-500" />
                                Product Web URL (High Trust Link)
                            </label>
                            <input 
                                type="url"
                                placeholder="https://yourproduct.com"
                                value={campaign.ctaLink}
                                onChange={(e) => setCampaign({...campaign, ctaLink: e.target.value})}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-[2px] p-4 transition-all focus:outline-none focus:border-primary/40 text-sm text-white placeholder:text-zinc-800"
                            />
                            <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider ml-1 italic">This link will be injected into all AI outreach as the primary destination.</p>
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
                                placeholder="Explain the core benefit. Our AI will use this to qualify leads."
                                value={campaign.productDescription}
                                onChange={(e) => setCampaign({...campaign, productDescription: e.target.value})}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-[2px] p-4 transition-all focus:outline-none focus:border-primary/40 text-sm leading-relaxed text-zinc-300 placeholder:text-zinc-800 resize-none"
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
                        <h2 className="text-xl font-bold text-white tracking-tight">Search Targets</h2>
                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">Configure your campaign search parameters.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Campaign Name</label>
                        <input 
                            type="text"
                            placeholder="e.g. Retail Launch"
                            value={campaign.name}
                            onChange={(e) => setCampaign({...campaign, name: e.target.value})}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-[2px] p-4 transition-all focus:outline-none focus:border-primary/40 text-sm text-white placeholder:text-zinc-800"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Target Country</label>
                        <select 
                            value={campaign.targetCountry}
                            onChange={e => setCampaign({...campaign, targetCountry: e.target.value})}
                            className="w-full bg-[#121214] border border-white/10 rounded-[2px] p-4 transition-all focus:outline-none focus:border-primary/40 text-sm text-white"
                        >
                            <option value="ZW">Zimbabwe</option>
                            <option value="SA">South Africa</option>
                            <option value="UK">United Kingdom</option>
                            <option value="US">United States</option>
                        </select>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between ml-1">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Target Industries</label>
                            <div className="flex items-center gap-2">
                                <label className="flex items-center gap-1 px-2.5 py-1 rounded-[2px] text-[9px] font-black uppercase tracking-widest transition-all bg-white/5 hover:bg-white/10 text-zinc-300 cursor-pointer">
                                    <Upload size={10} />
                                    <span>Upload List</span>
                                    <input
                                        type="file"
                                        accept=".txt,.csv"
                                        onChange={(e) => handleFileUpload(e, "industries")}
                                        className="hidden"
                                    />
                                </label>
                                <AIAssistButton 
                                    field="Target Industries" 
                                    currentValue={campaign.industries} 
                                    context={{ productName: campaign.productName, productDescription: campaign.productDescription }}
                                    onRefined={(val) => setCampaign(prev => ({...prev, industries: val}))} 
                                />
                            </div>
                        </div>
                        <input 
                            type="text"
                            placeholder="e.g. Retail, Cafes, Tech Services"
                            value={campaign.industries}
                            onChange={(e) => setCampaign({...campaign, industries: e.target.value})}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-[2px] p-4 transition-all focus:outline-none focus:border-primary/40 text-sm text-white placeholder:text-zinc-800"
                        />
                        <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider ml-1 italic mt-1.5">
                            Enter target business categories separated by commas, or upload a .txt/.csv list of industries.
                        </p>
                    </div>
                    <div className="space-y-3 md:col-span-2">
                        <div className="flex items-center justify-between ml-1">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Specific Cities / Areas</label>
                            <div className="flex items-center gap-2">
                                <label className="flex items-center gap-1 px-2.5 py-1 rounded-[2px] text-[9px] font-black uppercase tracking-widest transition-all bg-white/5 hover:bg-white/10 text-zinc-300 cursor-pointer">
                                    <Upload size={10} />
                                    <span>Upload List</span>
                                    <input
                                        type="file"
                                        accept=".txt,.csv"
                                        onChange={(e) => handleFileUpload(e, "locations")}
                                        className="hidden"
                                    />
                                </label>
                                <AIAssistButton 
                                    field="Target Locations" 
                                    currentValue={campaign.locations} 
                                    context={{ targetCountry: campaign.targetCountry }}
                                    onRefined={(val) => setCampaign(prev => ({...prev, locations: val}))} 
                                />
                            </div>
                        </div>
                        <input 
                            type="text"
                            placeholder="e.g. Harare, Mutare, Bulawayo"
                            value={campaign.locations}
                            onChange={(e) => setCampaign({...campaign, locations: e.target.value})}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-[2px] p-4 transition-all focus:outline-none focus:border-primary/40 text-sm text-white placeholder:text-zinc-800"
                        />
                        <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider ml-1 italic mt-1.5">
                            Enter specific cities/regions separated by commas, or upload a .txt/.csv list of locations.
                        </p>
                    </div>
                    <div className="space-y-3 md:col-span-2">
                        <div className="flex items-center justify-between ml-1">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Target Pain Points</label>
                            <AIAssistButton 
                                field="Target Pain Points" 
                                currentValue={campaign.targetPainPoints} 
                                context={{ productName: campaign.productName, productDescription: campaign.productDescription }}
                                onRefined={(val) => setCampaign(prev => ({...prev, targetPainPoints: val}))} 
                            />
                        </div>
                        <textarea 
                            rows={3}
                            placeholder="Describe the specific pain points AI should look for in target prospects..."
                            value={campaign.targetPainPoints}
                            onChange={(e) => setCampaign({...campaign, targetPainPoints: e.target.value})}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-[2px] p-4 transition-all focus:outline-none focus:border-primary/40 text-sm leading-relaxed text-zinc-300 placeholder:text-zinc-800 resize-none"
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
                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">Sender details for personalization.</p>
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

            {/* OUTREACH INTELLIGENCE */}
            <section className="bg-white/[0.01] p-8 md:p-10 rounded-[2px] border border-white/5 space-y-8">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-[2px] bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400">
                        <Zap className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Outreach Intelligence</h2>
                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">Configure AI engagement parameters.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Outreach Tone</label>
                        <NeuralDropdown 
                            options={[
                                { value: "PROFESSIONAL", label: "Professional & Polished" },
                                { value: "DIRECT", label: "Direct & Concise" },
                                { value: "FRIENDLY", label: "Friendly & Warm" },
                                { value: "EDUCATIONAL", label: "Educational & Insightful" }
                            ]}
                            value={campaign.outreachTone}
                            onChange={(val) => setCampaign({...campaign, outreachTone: val as any})}
                            className="w-full"
                        />
                        <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider ml-1">This governs how the AI crafts the outreach messages.</p>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Discord Webhook (Optional)</label>
                        <input 
                            value={campaign.discordWebhook} 
                            onChange={(e) => setCampaign({...campaign, discordWebhook: e.target.value})}
                            placeholder="https://discord.com/api/webhooks/..."
                            className="w-full bg-white/[0.03] border border-white/10 rounded-[2px] p-4 text-sm text-white outline-none focus:border-primary/40 transition-all" 
                        />
                        <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider ml-1">Real-time alerts for newly discovered leads.</p>
                    </div>
                </div>
            </section>

            <div className="flex items-center justify-center pt-10">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={loading}
                    className="px-14 py-6 rounded-[2px] bg-primary text-white font-black text-xl flex items-center gap-4 transition-all shadow-2xl shadow-primary/20 hover:bg-primary/90"
                >
                    {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ShieldCheck size={24} />}
                    {loading ? "PROCESSING..." : isEdit ? "SAVE CAMPAIGN CHANGES" : "CREATE LEAD CAMPAIGN"}
                </motion.button>
            </div>
        </div>
    );
}
