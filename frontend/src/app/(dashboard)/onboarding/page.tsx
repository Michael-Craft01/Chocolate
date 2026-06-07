"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    User, 
    Briefcase, 
    Target, 
    Check, 
    Globe, 
    Zap,
    MessageSquare,
    ChevronRight,
    ChevronLeft,
    Upload
} from "lucide-react";
import { useRouter } from "next/navigation";
import { AIAssistButton } from "@/components/AIAssistButton";
import { authJson } from "@/lib/api";
import { toast } from "sonner";

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [cycleMode, setCycleMode] = useState<"automatic" | "manual" | "smart">("automatic");
    const [formData, setFormData] = useState({
        // Identity
        senderName: "",
        senderRole: "",
        companyName: "",
        // Product
        productName: "",
        productDescription: "",
        ctaLink: "",
        // Target Market Details
        targetCountry: "ZW",
        locations: "Harare",
        industries: "Business",
        targetPainPoints: "",
    });

    const totalSteps = 5;
    const inputBaseClass = "w-full bg-white/5 border border-white/10 rounded-sm p-4 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/40";

    const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const handleFormUpdate = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

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
            setFormData(prev => ({ ...prev, [fieldKey]: joined }));
            toast.success(`Imported ${parsed.length} items from ${file.name}`);
        };
        reader.readAsText(file);
    };

    const isStepValid = () => {
        if (step === 1) return formData.companyName.length > 2;
        if (step === 2) return formData.senderName.length > 2 && formData.senderRole.length > 2;
        if (step === 3) return formData.productName.length > 2 && formData.productDescription.length > 10;
        if (step === 4) return formData.locations.trim().length > 0 && formData.industries.trim().length > 0;
        return true;
    };

    const finishOnboarding = async () => {
        await authJson("/api/settings", {
            method: "POST",
            body: JSON.stringify({
                companyName: formData.companyName,
                website: "",
                industry: formData.industries.split(",")[0]?.trim() || "Business",
                defaultSenderName: formData.senderName,
                defaultSenderRole: formData.senderRole,
                productName: formData.productName,
                productDescription: formData.productDescription,
                targetPainPoints: formData.targetPainPoints || "Campaign-matched operational friction",
                targetCountry: formData.targetCountry,
                locations: formData.locations.split(",").map(l => l.trim()).filter(l => l) || ["Harare"],
                industries: formData.industries.split(",").map(i => i.trim()).filter(i => i) || ["Business"],
                automationMode: cycleMode === "automatic" ? "AUTOMATIC" : cycleMode === "smart" ? "SMART" : "MANUAL",
                autoRunFrequency: cycleMode === "manual" ? "MANUAL" : "WEEKLY",
            }),
        }).catch((err) => console.error("Onboarding save failed:", err));
        router.push("/dashboard");
    };

    const currentStepHint = () => {
        if (step === 1) return "Add your company name to personalize your workspace.";
        if (step === 2) return "Set sender identity used in outreach signatures.";
        if (step === 3) return "Describe your product or service details so the AI agent can craft relevant messages.";
        if (step === 4) return "Define target countries, industries, and customer challenges.";
        return "Choose how your lead searches should run.";
    };

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { 
            opacity: 1, 
            scale: 1,
            transition: { duration: 0.4, ease: "easeOut" as const }
        },
        exit: { opacity: 0, scale: 1.05, transition: { duration: 0.2 } }
    };

    return (
        <div className="min-h-screen bg-transparent text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-sm pointer-events-none" />
            
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(step / totalSteps) * 100}%` }}
                    className="h-full bg-primary shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                />
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="w-full max-w-xl bg-white/[0.03] border border-white/10 p-8 md:p-12 rounded-sm relative z-10"
                >
                    {/* Header */}
                    <div className="mb-10 text-center">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-sm bg-primary/20 border border-primary/30 text-primary mb-6">
                            {step === 1 && <Briefcase size={28} />}
                            {step === 2 && <User size={28} />}
                            {step === 3 && <Zap size={28} />}
                            {step === 4 && <Target size={28} />}
                            {step === 5 && <Check size={28} />}
                        </div>
                        <h1 className="text-3xl font-bold mb-2">
                            {step === 1 && "About Your Company"}
                            {step === 2 && "Who are you?"}
                            {step === 3 && "Your Product"}
                            {step === 4 && "Target Audience & Region"}
                            {step === 5 && "Search Settings"}
                        </h1>
                        <p className="text-white/40 text-sm">
                            Step {step} of {totalSteps} — {step === 1 ? "Business Profile" : step === 2 ? "Your Details" : step === 3 ? "Product Details" : step === 4 ? "Target Market" : "Search Settings"}
                        </p>
                        <p className="mt-2 text-xs text-zinc-500">{currentStepHint()}</p>
                    </div>

                    {/* Step 1: Company */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="block text-xs font-semibold text-white/30 uppercase tracking-widest">Company Name</label>
                                    <AIAssistButton 
                                        field="Company Name" 
                                        currentValue={formData.companyName} 
                                        onRefined={(val) => handleFormUpdate("companyName", val)} 
                                    />
                                </div>
                                <input 
                                    type="text"
                                    placeholder="e.g. LogicHQ"
                                    value={formData.companyName}
                                    onChange={(e) => handleFormUpdate("companyName", e.target.value)}
                                    className={`${inputBaseClass} font-medium`}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-sm bg-white/[0.02] border border-white/5 flex flex-col gap-2">
                                    <Globe className="text-primary" size={20} />
                                    <span className="text-xs text-white/40">Global Search Enabled</span>
                                </div>
                                <div className="p-4 rounded-sm bg-white/[0.02] border border-white/5 flex flex-col gap-2">
                                    <Zap className="text-primary" size={20} />
                                    <span className="text-xs text-white/40">AI Agent Ready</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Identity */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-white/30 uppercase tracking-widest mb-2 ml-1">Your Name</label>
                                    <input 
                                        type="text"
                                        placeholder="e.g. Michael"
                                        value={formData.senderName}
                                        onChange={(e) => handleFormUpdate("senderName", e.target.value)}
                                        className={inputBaseClass}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-white/30 uppercase tracking-widest mb-2 ml-1">Your Role</label>
                                    <input 
                                        type="text"
                                        placeholder="e.g. Founder"
                                        value={formData.senderRole}
                                        onChange={(e) => handleFormUpdate("senderRole", e.target.value)}
                                        className={inputBaseClass}
                                    />
                                </div>
                            </div>
                            <div className="p-4 rounded-sm bg-blue-500/5 border border-blue-500/20 text-blue-200/70 text-sm flex gap-3">
                                <MessageSquare size={20} className="shrink-0" />
                                <p>We use these details to sign off your automated messages professionally.</p>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Product */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="block text-xs font-semibold text-white/30 uppercase tracking-widest">Main Product/Service</label>
                                    <AIAssistButton 
                                        field="Product Name" 
                                        currentValue={formData.productName} 
                                        context={{ companyName: formData.companyName }}
                                        onRefined={(val) => handleFormUpdate("productName", val)} 
                                    />
                                </div>
                                <input 
                                    type="text"
                                    placeholder="e.g. Takada Mobile POS"
                                    value={formData.productName}
                                    onChange={(e) => handleFormUpdate("productName", e.target.value)}
                                    className={`${inputBaseClass} font-medium`}
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="block text-xs font-semibold text-white/30 uppercase tracking-widest">Product Description</label>
                                    <AIAssistButton 
                                        field="Value Proposition" 
                                        currentValue={formData.productDescription} 
                                        context={{ companyName: formData.companyName, productName: formData.productName }}
                                        onRefined={(val) => handleFormUpdate("productDescription", val)} 
                                    />
                                </div>
                                <textarea 
                                    rows={3}
                                    placeholder="Describe what your product does and how it helps customers..."
                                    value={formData.productDescription}
                                    onChange={(e) => handleFormUpdate("productDescription", e.target.value)}
                                    className={`${inputBaseClass} resize-none text-sm leading-relaxed`}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 4: Targets */}
                    {step === 4 && (
                        <div className="space-y-6 text-left">
                            <div className="space-y-2">
                                <label className="block text-xs font-semibold text-white/30 uppercase tracking-widest mb-2">Target Country</label>
                                <select
                                    value={formData.targetCountry}
                                    onChange={(e) => handleFormUpdate("targetCountry", e.target.value)}
                                    className={`${inputBaseClass} bg-[#121214]`}
                                >
                                    <option value="ZW">Zimbabwe</option>
                                    <option value="SA">South Africa</option>
                                    <option value="UK">United Kingdom</option>
                                    <option value="US">United States</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="block text-xs font-semibold text-white/30 uppercase tracking-widest">Target Industries</label>
                                    <div className="flex items-center gap-3">
                                        {/* File Uploader */}
                                        <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all bg-white/5 text-zinc-300 hover:bg-white/10 cursor-pointer">
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
                                            currentValue={formData.industries}
                                            context={{ productName: formData.productName, productDescription: formData.productDescription }}
                                            onRefined={(val) => handleFormUpdate("industries", val)}
                                        />
                                    </div>
                                </div>
                                <input
                                    type="text"
                                    placeholder="e.g. Retail, Cafes, Software"
                                    value={formData.industries}
                                    onChange={(e) => handleFormUpdate("industries", e.target.value)}
                                    className={inputBaseClass}
                                />
                                <p className="text-[9px] text-zinc-500">Enter industries separated by commas, or upload a TXT/CSV file.</p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="block text-xs font-semibold text-white/30 uppercase tracking-widest">Target Cities / Locations</label>
                                    <div className="flex items-center gap-3">
                                        {/* File Uploader */}
                                        <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all bg-white/5 text-zinc-300 hover:bg-white/10 cursor-pointer">
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
                                            currentValue={formData.locations}
                                            context={{ targetCountry: formData.targetCountry }}
                                            onRefined={(val) => handleFormUpdate("locations", val)}
                                        />
                                    </div>
                                </div>
                                <input
                                    type="text"
                                    placeholder="e.g. Harare, Bulawayo"
                                    value={formData.locations}
                                    onChange={(e) => handleFormUpdate("locations", e.target.value)}
                                    className={inputBaseClass}
                                />
                                <p className="text-[9px] text-zinc-500">List specific cities or states to search in, or upload a text file.</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="block text-xs font-semibold text-white/30 uppercase tracking-widest">Customer Challenges</label>
                                    <AIAssistButton
                                        field="Target Pain Points"
                                        currentValue={formData.targetPainPoints}
                                        context={{ productName: formData.productName, productDescription: formData.productDescription }}
                                        onRefined={(val) => handleFormUpdate("targetPainPoints", val)}
                                    />
                                </div>
                                <textarea
                                    rows={2}
                                    placeholder="e.g. High transaction fees, slow settlement times"
                                    value={formData.targetPainPoints}
                                    onChange={(e) => handleFormUpdate("targetPainPoints", e.target.value)}
                                    className={`${inputBaseClass} resize-none`}
                                />
                                <p className="text-[9px] text-zinc-500">Explain what problems the AI agent should address in outreach emails.</p>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Search Settings */}
                    {step === 5 && (
                        <div className="space-y-6">
                            <div className="p-6 rounded-sm bg-primary/5 border border-primary/20 text-center flex flex-col items-center gap-4">
                                <div className="w-16 h-16 rounded-sm bg-primary/20 flex items-center justify-center">
                                    <Check className="text-primary" size={32} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Lead Search Ready</h3>
                                    <p className="text-sm text-white/50">Your business profile and product details are configured and ready to find leads.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    { id: "manual", label: "Manual Mode", desc: "Scan only when triggered manually. Ideal for conserving search credits." },
                                    { id: "automatic", label: "Automatic Mode", desc: "Runs sweeps on schedule in the background, consuming 1 credit per sweep." },
                                    { id: "smart", label: "Smart Automatic", desc: "Runs on schedule, but automatically pauses if the previous search failed or yielded < 20% leads, preventing credit waste on dry queries." },
                                ].map((mode) => (
                                    <button key={mode.id} type="button" onClick={() => setCycleMode(mode.id as typeof cycleMode)}
                                        className={`p-4 rounded-sm border text-left transition-all ${cycleMode === mode.id ? "border-primary bg-primary/10" : "border-white/10 bg-white/[0.02]"}`}
                                    >
                                        <p className="text-sm font-bold">{mode.label}</p>
                                        <p className="text-xs text-white/45 mt-1">{mode.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="mt-12 flex items-center justify-between">
                        {step > 1 ? (
                            <button type="button" onClick={prevStep} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-semibold ml-2" >
                                <ChevronLeft size={20} />
                                Back
                            </button>
                        ) : <div />}

                        <motion.button
                            whileHover={{ scale: isStepValid() ? 1.02 : 1 }}
                            whileTap={{ scale: isStepValid() ? 0.98 : 1 }}
                            onClick={step === totalSteps ? finishOnboarding : nextStep}
                            disabled={!isStepValid()}
                            className={`
                                flex items-center gap-2 px-8 py-4 rounded-sm font-bold transition-all
                                ${isStepValid() 
                                    ? "bg-primary text-white shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:bg-primary-hover" 
                                    : "bg-white/5 text-white/20 cursor-not-allowed"}
                            `}
                        >
                            {step === totalSteps ? "Launch Dashboard" : "Continue"}
                            {step < totalSteps && <ChevronRight size={20} />}
                        </motion.button>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Step Indicators */}
            <div className="mt-12 flex gap-3 z-10">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div 
                        key={i}
                        className={`w-2 h-2 rounded-sm transition-all duration-300 ${i === step ? "w-8 bg-primary" : "bg-white/10"}`}
                    />
                ))}
            </div>
        </div>
    );
}
