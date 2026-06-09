"use client";

import { useState } from "react";
import { 
    Briefcase,
    Compass,
    Shield,
    Zap,
    User,
    Link as LinkIcon,
    Globe,
    Settings,
    Edit,
    CheckCircle2,
    Play
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { authJson, ApiRequestError } from "@/lib/api";
import { createCampaign, updateCampaign } from "@/lib/services/campaigns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { QuestionnaireModal, type StepConfig } from "@/components/QuestionnaireModal";

interface CampaignFormProps {
    initialData?: any;
    isEdit?: boolean;
    campaignId?: string;
}

export function CampaignForm({ initialData, isEdit, campaignId }: CampaignFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
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
        targetMarket: initialData?.targetMarket || "",
        targetBusinessSize: initialData?.targetBusinessSize || "ANY",
        assignedSources: initialData?.assignedSources || [],
    });

    const campaignSteps: StepConfig[] = [
        {
            title: "Value Proposition & Offer",
            description: "Define your product identity and link. This helps the AI qualify high-converting outreach opportunities.",
            fields: [
                {
                    key: "productName",
                    label: "Product/Service Name",
                    placeholder: "e.g. Takada POS Suite",
                    type: "text",
                    helperText: "The name of your main product or service offering."
                },
                {
                    key: "ctaLink",
                    label: "Product Website URL",
                    placeholder: "https://yourproduct.com",
                    type: "text",
                    helperText: "The landing page URL. This will be injected into email outreach templates as the main call-to-action."
                },
                {
                    key: "productDescription",
                    label: "Value Proposition",
                    placeholder: "Explain the core benefit. Our AI uses this to qualify leads.",
                    type: "textarea",
                    aiRefineField: "Value Proposition",
                    aiRefineContextKeys: ["productName"],
                    helperText: "Describe your product's key features, benefits, and how it solves customer problems in 2-3 sentences."
                }
            ]
        },
        {
            title: "Target Market Profile",
            description: "Describe the companies you want to find. The AI agent automatically parses this description to generate queries and route sourcing platforms.",
            fields: [
                {
                    key: "targetMarket",
                    label: "Ideal Customer Profile (AI Search Prompt)",
                    placeholder: "Describe your ideal target customer in detail (e.g. Specialty coffee shops and artisan bakeries in Harare)...",
                    type: "textarea",
                    helperText: "Explain your customer profile. The AI will automatically select search channels and generate local search queries."
                },
                {
                    key: "targetBusinessSize",
                    label: "Target Business Size",
                    type: "select",
                    options: [
                        { value: "ANY", label: "Any Size (No Filter)" },
                        { value: "SMALL", label: "Small (1-10 employees)" },
                        { value: "MEDIUM", label: "Medium (11-50 employees)" },
                        { value: "LARGE", label: "Large (50+ employees)" }
                    ],
                    helperText: "Filter prospects based on their employee count."
                }
            ]
        },
        {
            title: "Target Sourcing Filters",
            description: "Configure search keywords, locations, and lead pain points to refine the discovery scraper target scope.",
            fields: [
                {
                    key: "locations",
                    label: "Target Cities / Locations",
                    placeholder: "e.g. Harare, Mutare, Bulawayo",
                    type: "list_upload",
                    fileUploadKey: "locations",
                    aiRefineField: "Target Locations",
                    aiRefineContextKeys: ["targetCountry"],
                    helperText: "List specific cities or states to search in, or upload a .txt/.csv list."
                },
                {
                    key: "industries",
                    label: "Target Industries",
                    placeholder: "e.g. Retail, Cafes, Tech Services",
                    type: "list_upload",
                    fileUploadKey: "industries",
                    aiRefineField: "Target Industries",
                    aiRefineContextKeys: ["productName", "productDescription"],
                    helperText: "List target industries separated by commas, or upload a .txt/.csv list."
                },
                {
                    key: "targetPainPoints",
                    label: "Customer Pain Points",
                    placeholder: "Describe the specific pain points AI should look for in target prospects...",
                    type: "textarea",
                    aiRefineField: "Target Pain Points",
                    aiRefineContextKeys: ["productName", "productDescription"],
                    helperText: "Core customer struggles your product solves. The AI agent will search for these pain points on target web pages."
                }
            ]
        },
        {
            title: "Sender Identity & Outreach Settings",
            description: "Synchronize your identity details. These parameters are used to personalize the outreach signatures and webhooks.",
            fields: [
                {
                    key: "senderName",
                    label: "Sender Name",
                    placeholder: "Your Name",
                    type: "text",
                    helperText: "The full name of the sender, used in outreach email signatures."
                },
                {
                    key: "senderRole",
                    label: "Sender Position / Job Title",
                    placeholder: "e.g. Founder",
                    type: "text",
                    helperText: "Your role or job title."
                },
                {
                    key: "companyName",
                    label: "Company Name",
                    placeholder: "Business Name",
                    type: "text",
                    helperText: "The name of your business or company."
                },
                {
                    key: "outreachTone",
                    label: "Outreach Tone",
                    type: "select",
                    options: [
                        { value: "PROFESSIONAL", label: "Professional & Polished" },
                        { value: "DIRECT", label: "Direct & Concise" },
                        { value: "FRIENDLY", label: "Friendly & Warm" },
                        { value: "EDUCATIONAL", label: "Educational & Insightful" }
                    ],
                    helperText: "Governs how the AI crafts outreach messages."
                },
                {
                    key: "discordWebhook",
                    label: "Discord Webhook Integration (Optional)",
                    placeholder: "https://discord.com/api/webhooks/...",
                    type: "text",
                    helperText: "Receive instant alerts in your Discord channel whenever new qualified leads are found."
                }
            ]
        }
    ];
 
    const handleSave = async () => {
        // --- PRE-FLIGHT VALIDATION ---
        if (!campaign.productName.trim()) {
            toast.error("Product/Service Name required", { description: "Please define what you are offering." });
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

        let cleanCtaLink = campaign.ctaLink.trim();
        if (cleanCtaLink) {
            if (!/^https?:\/\//i.test(cleanCtaLink)) {
                cleanCtaLink = 'https://' + cleanCtaLink;
            }
        }
 
        setLoading(true);
        setIsModalOpen(false);
        
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
                ctaLink: cleanCtaLink || undefined,
                discordWebhook: campaign.discordWebhook.trim() || undefined,
                targetCountry: campaign.targetCountry,
                targetMarket: campaign.targetMarket.trim() || undefined,
                targetBusinessSize: campaign.targetBusinessSize,
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
            console.error("Save campaign error:", err);
        } finally {
            setLoading(false);
        }
    };
 
    // Helper to count configured fields
    const getSetupProgress = () => {
        let count = 0;
        const total = 7; // key fields: productName, senderName, senderRole, companyName, productDescription, targetMarket, targetBusinessSize
        if (campaign.productName.trim()) count++;
        if (campaign.senderName.trim()) count++;
        if (campaign.senderRole.trim()) count++;
        if (campaign.companyName.trim()) count++;
        if (campaign.productDescription.trim()) count++;
        if (campaign.targetMarket.trim()) count++;
        if (campaign.targetBusinessSize !== "ANY") count++;
        return { count, total };
    };
 
    const progress = getSetupProgress();
 
    return (
        <div className="max-w-3xl mx-auto">
            {/* Setup Preview Dashboard Card */}
            <div className="bg-primary/[0.02] border border-white/10 rounded-[2px] p-8 md:p-10 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5 relative">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                            <Settings size={12} /> setup console
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">
                            {isEdit ? "Update Search Settings" : "Configure AI Lead Search"}
                        </h2>
                        <p className="text-zinc-500 text-xs font-semibold">
                            Setup Completion: {progress.count} of {progress.total} Core Parameters
                        </p>
                    </div>
 
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center gap-2.5 h-12 px-6 bg-primary hover:bg-primary/90 text-white rounded-sm text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg shadow-primary/15 cursor-pointer"
                    >
                        <Play size={12} className="fill-white" />
                        {progress.count > 0 ? "Resume Setup Assistant" : "Launch Setup Assistant"}
                    </button>
                </div>
 
                {/* Configuration Preview Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2 relative">
                    <div className="space-y-4">
                        <div>
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Product/Service Name</span>
                            <p className="text-sm font-bold text-white">
                                {campaign.productName ? campaign.productName : <span className="text-zinc-800 italic">Not defined yet</span>}
                            </p>
                        </div>
                        <div>
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Target Market</span>
                            <p className="text-xs text-zinc-300 leading-relaxed max-w-sm line-clamp-3">
                                {campaign.targetMarket ? campaign.targetMarket : <span className="text-zinc-800 italic">Not defined yet</span>}
                            </p>
                        </div>
                        <div>
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Target Business Size</span>
                            <span className="px-2 py-0.5 rounded-[2px] text-[9px] font-black uppercase tracking-widest bg-white/5 border border-white/10 text-zinc-400">
                                {campaign.targetBusinessSize}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Sender Profile</span>
                            <p className="text-xs text-zinc-300 leading-relaxed font-semibold">
                                {campaign.senderName ? (
                                    `${campaign.senderName} (${campaign.senderRole}) at ${campaign.companyName}`
                                ) : (
                                    <span className="text-zinc-800 italic">Not defined yet</span>
                                )}
                            </p>
                        </div>
                        <div>
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Sourcing Filters</span>
                            <div className="flex flex-wrap gap-2 text-xs text-zinc-400">
                                <div>
                                    <span className="text-zinc-600 font-bold uppercase tracking-wider block text-[8px]">Locations</span>
                                    <span>{campaign.locations || "Harare"}</span>
                                </div>
                                <div className="border-l border-white/5 pl-3">
                                    <span className="text-zinc-600 font-bold uppercase tracking-wider block text-[8px]">Industries</span>
                                    <span>{campaign.industries || "Business"}</span>
                                </div>
                            </div>
                        </div>
                        {campaign.assignedSources && campaign.assignedSources.length > 0 && (
                            <div>
                                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">AI-Assigned Channels</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {campaign.assignedSources.map((source: string) => (
                                        <span 
                                            key={source} 
                                            className="px-2 py-0.5 rounded-[2px] text-[8px] font-black uppercase tracking-widest bg-primary/15 text-primary border border-primary/25"
                                        >
                                            {source.replace('_', ' ')}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Carousel Questionnaire Modal Portal */}
            <AnimatePresence>
                {isModalOpen && (
                    <QuestionnaireModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        title={isEdit ? "Edit Search Configuration" : "Configure AI Lead Campaign"}
                        subtitle="HyprLead setup assistant"
                        steps={campaignSteps}
                        data={campaign}
                        onChange={setCampaign}
                        onSubmit={handleSave}
                        submitLabel={isEdit ? "SAVE CHANGES" : "LAUNCH CAMPAIGN"}
                        loading={loading}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
