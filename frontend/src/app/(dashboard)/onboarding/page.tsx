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
    ChevronLeft
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        // Identity
        senderName: "",
        senderRole: "",
        companyName: "",
        // Product
        productName: "",
        productDescription: "",
        ctaLink: "",
        // Target
        defaultLocation: "Harare, Zimbabwe",
        defaultIndustry: "",
    });

    const totalSteps = 4;
    const inputBaseClass = "w-full bg-white/5 border border-white/10 rounded-2xl p-4 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/40";

    const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const handleFormUpdate = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const isStepValid = () => {
        if (step === 1) return formData.companyName.length > 2;
        if (step === 2) return formData.senderName.length > 2 && formData.senderRole.length > 2;
        if (step === 3) return formData.productName.length > 2 && formData.productDescription.length > 10;
        return true;
    };

    const finishOnboarding = async () => {
        // In a real app, we would POST to /api/onboarding
        console.log("Onboarding Complete:", formData);
        router.push("/dashboard");
    };

    const currentStepHint = () => {
        if (step === 1) return "Add your company name to personalize your workspace.";
        if (step === 2) return "Set sender identity used in outreach signatures.";
        if (step === 3) return "Describe your offer so AI can match real pain points.";
        return "Final review complete. Launch your dashboard.";
    };

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { 
            opacity: 1, 
            scale: 1,
            transition: { duration: 0.4, ease: "easeOut" }
        },
        exit: { opacity: 0, scale: 1.05, transition: { duration: 0.2 } }
    };

    return (
        <div className="min-h-screen bg-[#070707] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            
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
                    className="w-full max-w-xl bg-white/[0.03] border border-white/10 p-8 md:p-12 rounded-[2rem] backdrop-blur-xl shadow-2xl relative z-10"
                >
                    {/* Header */}
                    <div className="mb-10 text-center">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 text-primary mb-6">
                            {step === 1 && <Briefcase size={28} />}
                            {step === 2 && <User size={28} />}
                            {step === 3 && <Zap size={28} />}
                            {step === 4 && <Target size={28} />}
                        </div>
                        <h1 className="text-3xl font-bold mb-2">
                            {step === 1 && "About Your Company"}
                            {step === 2 && "Who are you?"}
                            {step === 3 && "Your Offer"}
                            {step === 4 && "Target Audience"}
                        </h1>
                        <p className="text-white/40 text-sm">
                            Step {step} of {totalSteps} — {step === 1 ? "Business Foundation" : step === 2 ? "Identity & Tone" : step === 3 ? "Product Intelligence" : "Market Focus"}
                        </p>
                        <p className="mt-2 text-xs text-zinc-500">{currentStepHint()}</p>
                    </div>

                    {/* Step 1: Company */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-semibold text-white/30 uppercase tracking-widest mb-2 ml-1">Company Name</label>
                                <input 
                                    type="text"
                                    placeholder="e.g. LogicHQ"
                                    value={formData.companyName}
                                    onChange={(e) => handleFormUpdate("companyName", e.target.value)}
                                    className={`${inputBaseClass} font-medium`}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-2">
                                    <Globe className="text-primary" size={20} />
                                    <span className="text-xs text-white/40">Global Search Enabled</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-2">
                                    <Zap className="text-primary" size={20} />
                                    <span className="text-xs text-white/40">AI Engine Ready</span>
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
                            <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-blue-200/70 text-sm flex gap-3">
                                <MessageSquare size={20} className="shrink-0" />
                                <p>We use these details to sign off your automated messages professionally.</p>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Product */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-semibold text-white/30 uppercase tracking-widest mb-2 ml-1">Main Product/Service</label>
                                <input 
                                    type="text"
                                    placeholder="e.g. Takada Mobile POS"
                                    value={formData.productName}
                                    onChange={(e) => handleFormUpdate("productName", e.target.value)}
                                    className={`${inputBaseClass} font-medium`}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-white/30 uppercase tracking-widest mb-2 ml-1">The "Solution" (Briefly)</label>
                                <textarea 
                                    rows={3}
                                    placeholder="What problem do you solve? (e.g. We build apps that let SMEs manage inventory from their phone.)"
                                    value={formData.productDescription}
                                    onChange={(e) => handleFormUpdate("productDescription", e.target.value)}
                                    className={`${inputBaseClass} resize-none text-sm leading-relaxed`}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 4: Targets */}
                    {step === 4 && (
                        <div className="space-y-6">
                            <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/20 text-center flex flex-col items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                                    <Check className="text-primary" size={32} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">System Calibrated</h3>
                                    <p className="text-sm text-white/50">Your business identity and product intelligence are now synced with the engine.</p>
                                </div>
                            </div>
                            <p className="text-center text-xs text-white/20">
                                You can customize specific targets for each individual campaign in the dashboard.
                            </p>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="mt-12 flex items-center justify-between">
                        {step > 1 ? (
                            <button 
                                onClick={prevStep}
                                className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-semibold ml-2"
                            >
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
                                flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all
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
                {[1, 2, 3, 4].map((i) => (
                    <div 
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${i === step ? "w-8 bg-primary" : "bg-white/10"}`}
                    />
                ))}
            </div>
        </div>
    );
}
