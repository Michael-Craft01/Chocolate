"use client";

import React, { useState } from 'react';
import { Sparkles, Loader2, Check } from 'lucide-react';
import { authJson } from '@/lib/api';

interface AIAssistButtonProps {
  field: string;
  currentValue: string;
  context?: any;
  onRefined: (refinedValue: string) => void;
  className?: string;
}

export function AIAssistButton({ field, currentValue, context, onRefined, className }: AIAssistButtonProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRefine = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setLoading(true);
    try {
      const data = await authJson<{ refined: string }>("/api/ai/refine", {
        method: "POST",
        body: JSON.stringify({ field, value: currentValue, context })
      });
      
      if (data.refined) {
        onRefined(data.refined);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      }
    } catch (error) {
      console.error("Refinement failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRefine}
      disabled={loading}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all ${
        success 
          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
          : "bg-primary/5 text-primary border border-primary/10 hover:bg-primary/10 hover:border-primary/20"
      } ${className}`}
      title="Refine with AI"
    >
      {loading ? (
        <Loader2 size={12} className="animate-spin" />
      ) : success ? (
        <Check size={12} />
      ) : (
        <Sparkles size={12} className="glow-primary" />
      )}
      {loading ? "Thinking..." : success ? "Refined" : "Magic Fill"}
    </button>
  );
}
