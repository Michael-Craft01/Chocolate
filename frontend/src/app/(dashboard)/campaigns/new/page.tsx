"use client";

import { useState } from "react";
import { 
    Target, 
    ArrowLeft, 
    Save, 
    Zap, 
    MapPin, 
    Briefcase, 
    User, 
    Hash,
    Link,
    MessageSquare,
    AlertCircle,
    Info
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function NewCampaignPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    // Campaign State (Robust)
    const [campaign, setCampaign] = useState({
        name: "",
        senderName: "",
        senderRole: "",
        companyName: "",
        productName: "",
        productDescription: "",
        targetPainPoints: "",
        industries: "", // Will split to array
        locations: "", // Will split to array
        outreachTone: "PROFESSIONAL",
        ctaLink: "",
        discordWebhook: "",
    });

    const handleSave = async () => {
        setLoading(true);
        try {
            // Process industries and locations into arrays
            const payload = {
                ...campaign,
                industries: campaign.industries.split(",").map(i => i.trim()).filter(i => i),
                locations: campaign.locations.split(",").map(l => l.trim()).filter(l => l),
            };

            // In real app, POST to /api/campaigns
            console.log("Creating Campaign:", payload);
            
            // Artificial delay for premium feel
            await new Promise(r => setTimeout(r, 1500));
            router.push("/campaigns");
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const SectionHeader = ({ icon: Icon, title, desc }: any) => (
        <div className="flex items-start gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-500 shrink-0">
                <Icon size={24} />
            </div>
            <div>
                <h2 className="text-xl font-bold">{title}</h2>
                <p className="text-white/40 text-sm">{desc}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#070707] text-white p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-12 group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Campaigns
                </button>

                <div className="flex items-center justify-between mb-12">
                    <h1 className="text-4xl font-extrabold tracking-tight">New Campaign Console</h1>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.2)] disabled:opacity-50"
                    >
                        {loading ? "Initializing..." : <>
                            <Save size={20} />
                            Save Campaign
                        </>}
                    </motion.button>
                </div>

                <div className="grid grid-cols-1 gap-12">
                    {/* General Settings */}
                    <section className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl backdrop-blur-sm">
                        <SectionHeader 
                            icon={Zap} 
                            title="Campaign Essentials" 
                            desc="Core settings for engine tracking and identification."
                        />
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-xs font-semibold text-white/30 uppercase tracking-widest mb-2 ml-1">Internal Campaign Name</label>
                                <input 
                                    type="text"
                                    placeholder="e.g. Zimbabwe Retail Q2"
                                    value={campaign.name}
                                    onChange={(e) => setCampaign({...campaign, name: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Identity Settings */}
                    <section className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl">
                        <SectionHeader 
                            icon={User} 
                            title="Sender Identity" 
                            desc="Who is the AI pretending to be for this specific campaign?"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-semibold text-white/30 uppercase tracking-widest mb-2 ml-1">Sender Name</label>
                                <input 
                                    type="text"
                                    placeholder="e.g. Michael"
                                    value={campaign.senderName}
                                    onChange={(e) => setCampaign({...campaign, senderName: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-white/30 uppercase tracking-widest mb-2 ml-1">Sender Role</label>
                                <input 
                                    type="text"
                                    placeholder="e.g. Founder & CEO"
                                    value={campaign.senderRole}
                                    onChange={(e) => setCampaign({...campaign, senderRole: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-white/30 uppercase tracking-widest mb-2 ml-1">Company Entity</label>
                                <input 
                                    type="text"
                                    placeholder="e.g. LogicHQ Automation"
                                    value={campaign.companyName}
                                    onChange={(e) => setCampaign({...campaign, companyName: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Target Logic */}
                    <section className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl">
                        <SectionHeader 
                            icon={MapPin} 
                            title="Target Parameters" 
                            desc="Define where and what industries the engine should scrape."
                        />
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-xs font-semibold text-white/30 uppercase tracking-widest mb-2 ml-1">Target Industries (Comma-separated)</label>
                                <input 
                                    type="text"
                                    placeholder="Retail, Wholesale, Hardware Store"
                                    value={campaign.industries}
                                    onChange={(e) => setCampaign({...campaign, industries: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all font-medium"
                                />
                                <p className="text-[10px] text-white/20 mt-2 ml-1">LEAVE EMPTY TO USE SYSTEM DEFAULTS (ZIMBABWE SME LIST)</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-white/30 uppercase tracking-widest mb-2 ml-1">Target Locations (Comma-separated)</label>
                                <input 
                                    type="text"
                                    placeholder="Harare CBD, Bulawayo CBD, Gweru"
                                    value={campaign.locations}
                                    onChange={(e) => setCampaign({...campaign, locations: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all font-medium"
                                />
                                <p className="text-[10px] text-white/20 mt-2 ml-1">LEAVE EMPTY TO USE SYSTEM DEFAULTS (500+ HARARE ZONES)</p>
                            </div>
                        </div>
                    </section>
                    
                    {/* Intelligence Section */}
                    <section className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl">
                        <SectionHeader 
                            icon={Zap} 
                            title="AI Intelligence" 
                            desc="The core 'Knowledge' used to identify pain points and build trust."
                        />
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-xs font-semibold text-white/30 uppercase tracking-widest mb-2 ml-1">Product Name</label>
                                <input 
                                    type="text"
                                    placeholder="e.g. Takada POS"
                                    value={campaign.productName}
                                    onChange={(e) => setCampaign({...campaign, productName: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-white/30 uppercase tracking-widest mb-2 ml-1">Product Value Prop (AI Prompt Context)</label>
                                <textarea 
                                    rows={4}
                                    placeholder="Explain exactly what problem your product solves. The AI will use this to find matching pain points in the leads it finds."
                                    value={campaign.productDescription}
                                    onChange={(e) => setCampaign({...campaign, productDescription: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all resize-none text-sm leading-relaxed"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-white/30 uppercase tracking-widest mb-2 ml-1">Outreach Tone</label>
                                <select 
                                    value={campaign.outreachTone}
                                    onChange={(e) => setCampaign({...campaign, outreachTone: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all"
                                >
                                    <option value="PROFESSIONAL">Professional & Institutional</option>
                                    <option value="DIRECT">Direct & Bold</option>
                                    <option value="FRIENDLY">Friendly & Social</option>
                                    <option value="EDUCATIONAL">Educational & Helpful</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Delivery & CTA */}
                    <section className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl mb-12">
                        <SectionHeader 
                            icon={Link} 
                            title="CTA & Delivery" 
                            desc="Where should the results go and where should the lead click?"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-semibold text-white/30 uppercase tracking-widest mb-2 ml-1">Campaign Website / CTA Link</label>
                                <input 
                                    type="url"
                                    placeholder="https://yourproduct.com/demo"
                                    value={campaign.ctaLink}
                                    onChange={(e) => setCampaign({...campaign, ctaLink: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-white/30 uppercase tracking-widest mb-2 ml-1">Discord Webhook (Optional Notification)</label>
                                <input 
                                    type="text"
                                    placeholder="Paste Discord Webhook URL"
                                    value={campaign.discordWebhook}
                                    onChange={(e) => setCampaign({...campaign, discordWebhook: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all text-xs"
                                />
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
