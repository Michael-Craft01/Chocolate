"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    X, 
    ArrowRight, 
    ArrowLeft, 
    Upload, 
    CheckCircle2, 
    Sparkles, 
    Loader2
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ElaborateButton } from "@/components/ElaborateButton";
import { NeuralDropdown } from "@/components/NeuralDropdown";

export interface FieldConfig {
    key: string;
    label: string;
    placeholder?: string;
    type: 'text' | 'textarea' | 'select' | 'list_upload';
    options?: { value: string; label: string }[];
    aiRefineField?: string;
    aiRefineContextKeys?: string[];
    fileUploadKey?: 'locations' | 'industries';
    helperText?: string;
}

export interface StepConfig {
    title: string;
    description: string;
    fields: FieldConfig[];
}

interface QuestionnaireModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    steps: StepConfig[];
    data: any;
    onChange: (updater: (prev: any) => any) => void;
    onSubmit: () => void;
    submitLabel?: string;
    loading?: boolean;
}

export function QuestionnaireModal({
    isOpen,
    onClose,
    title,
    subtitle,
    steps,
    data,
    onChange,
    onSubmit,
    submitLabel = "Submit",
    loading = false
}: QuestionnaireModalProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [direction, setDirection] = useState(0); // -1 for back, 1 for forward

    if (!isOpen) return null;

    const currentStepConfig = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;
    const progressPercent = Math.round(((currentStep + 1) / steps.length) * 100);

    const handleNext = () => {
        // Validate required fields in the current step before proceeding
        const currentFields = currentStepConfig?.fields || [];
        for (const field of currentFields) {
            // Check key values
            const val = data[field.key];
            if (field.key === "productName" && (!val || !val.trim())) {
                toast.error("Offer Title is required");
                return;
            }
            if ((field.key === "senderName" || field.key === "senderRole" || field.key === "companyName") && (!val || !val.trim())) {
                toast.error(`${field.label} is required`);
                return;
            }
        }

        if (isLastStep) {
            onSubmit();
        } else {
            setDirection(1);
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setDirection(-1);
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldKey: string) => {
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
            onChange(prev => ({ ...prev, [fieldKey]: joined }));
            toast.success(`Imported ${parsed.length} items from ${file.name}`);
        };
        reader.readAsText(file);
    };

    // Slide variants for animation
    const slideVariants = {
        enter: (dir: number) => ({
            x: dir > 0 ? 100 : -100,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (dir: number) => ({
            x: dir > 0 ? -100 : 100,
            opacity: 0
        })
    };

    // Build context object dynamically for AI Assist buttons
    const buildAiContext = (keys?: string[]) => {
        if (!keys) return undefined;
        const ctx: any = {};
        for (const k of keys) {
            ctx[k] = data[k];
        }
        return ctx;
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            {/* Backdrop Overlay */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />

            {/* Modal Container */}
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="relative bg-card border border-card-border rounded-[2px] w-full max-w-2xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-6 border-b border-card-border flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-foreground tracking-tight">{title}</h2>
                        {subtitle && <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">{subtitle}</p>}
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-1 rounded-sm text-zinc-500 hover:text-foreground hover:bg-white/5 transition-all cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-white/5 h-1">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.3 }}
                        className="bg-primary h-full"
                    />
                </div>

                {/* Question Area Container */}
                <div className="p-8 md:p-10 flex-1 overflow-y-auto">
                    <AnimatePresence initial={false} mode="wait" custom={direction}>
                        <motion.div
                            key={currentStep}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="space-y-8"
                        >
                            {/* Step Info */}
                            <div className="space-y-2">
                                <span className="text-[10px] font-black tracking-widest text-primary uppercase">
                                    Step {currentStep + 1} of {steps.length}
                                </span>
                                <h3 className="text-2xl font-black text-foreground leading-tight">{currentStepConfig.title}</h3>
                                <p className="text-sm text-zinc-400 leading-relaxed">{currentStepConfig.description}</p>
                            </div>

                            {/* Render Fields */}
                            <div className="space-y-6 pt-4">
                                {currentStepConfig.fields.map((field) => {
                                    const value = data[field.key] || "";

                                    return (
                                        <div key={field.key} className="space-y-2">
                                            <div className="flex items-center justify-between ml-1">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                                    {field.label}
                                                </label>
                                                {(field.aiRefineField || (
                                                    (field.type === 'text' || field.type === 'textarea' || field.type === 'list_upload') &&
                                                    !/webhook|password|secret|token|key|api|link|url|website/i.test(field.key)
                                                )) && (
                                                    <ElaborateButton
                                                        field={field.aiRefineField || field.label}
                                                        currentValue={value}
                                                        context={buildAiContext(
                                                            field.aiRefineContextKeys || 
                                                            Object.keys(data).filter(k => k !== field.key && !/webhook|password|secret|token|key|api|link|url|website/i.test(k))
                                                        )}
                                                        onElaborated={(val) => onChange(prev => ({ ...prev, [field.key]: val }))}
                                                    />
                                                )}
                                            </div>

                                            {/* Text input */}
                                            {field.type === 'text' && (
                                                <input
                                                    type="text"
                                                    placeholder={field.placeholder}
                                                    value={value}
                                                    onChange={(e) => onChange(prev => ({ ...prev, [field.key]: e.target.value }))}
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-[2px] p-4 text-sm text-foreground placeholder:text-zinc-500 transition-all focus:outline-none focus:border-primary/40"
                                                />
                                            )}

                                            {/* Textarea */}
                                            {field.type === 'textarea' && (
                                                <textarea
                                                    rows={4}
                                                    placeholder={field.placeholder}
                                                    value={value}
                                                    onChange={(e) => onChange(prev => ({ ...prev, [field.key]: e.target.value }))}
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-[2px] p-4 text-sm leading-relaxed text-zinc-300 placeholder:text-zinc-500 resize-none transition-all focus:outline-none focus:border-primary/40"
                                                />
                                            )}

                                            {/* Select Dropdown */}
                                            {field.type === 'select' && field.options && (
                                                <div className="w-full">
                                                    <NeuralDropdown
                                                        options={field.options}
                                                        value={value}
                                                        onChange={(val) => onChange(prev => ({ ...prev, [field.key]: val }))}
                                                        className="w-full"
                                                    />
                                                </div>
                                            )}

                                            {/* List Upload Input */}
                                            {field.type === 'list_upload' && (
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            placeholder={field.placeholder}
                                                            value={value}
                                                            onChange={(e) => onChange(prev => ({ ...prev, [field.key]: e.target.value }))}
                                                            className="flex-1 bg-white/[0.03] border border-white/10 rounded-[2px] p-4 text-sm text-foreground placeholder:text-zinc-500 transition-all focus:outline-none focus:border-primary/40"
                                                        />
                                                        {field.fileUploadKey && (
                                                            <label className="flex items-center gap-2 px-4 bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 rounded-[2px] text-xs font-black uppercase tracking-widest cursor-pointer transition-all shrink-0">
                                                                <Upload size={14} />
                                                                <span>Import File</span>
                                                                <input
                                                                    type="file"
                                                                    accept=".txt,.csv"
                                                                    onChange={(e) => handleFileUpload(e, field.key)}
                                                                    className="hidden"
                                                                />
                                                            </label>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {field.helperText && (
                                                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider ml-1 italic">
                                                    {field.helperText}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
							</div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer Controls */}
                <div className="p-6 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
                    <button
                        type="button"
                        onClick={handlePrev}
                        disabled={currentStep === 0}
                        className={cn(
                            "flex items-center gap-2 px-5 py-3 rounded-sm text-xs font-black uppercase tracking-widest border transition-all cursor-pointer",
                            currentStep === 0 
                                ? "opacity-30 border-transparent text-zinc-600 cursor-not-allowed" 
                                : "border-white/10 text-zinc-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <ArrowLeft size={14} />
                        Back
                    </button>

                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 rounded-sm bg-primary hover:bg-primary/95 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/10 transition-all active:scale-[0.98] cursor-pointer"
                    >
                        {loading ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : isLastStep ? (
                            <CheckCircle2 size={14} />
                        ) : (
                            <ArrowRight size={14} />
                        )}
                        {loading ? "PROCESSING..." : isLastStep ? submitLabel : "Continue"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
