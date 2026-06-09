"use client";

import React, { useState } from 'react';
import { Wand2, Loader2, Check, AlertCircle } from 'lucide-react';
import { authJson } from '@/lib/api';
import { toast } from 'sonner';

interface ElaborateButtonProps {
  field: string;
  currentValue: string;
  context?: Record<string, unknown>;
  onElaborated: (elaboratedValue: string) => void;
  className?: string;
  /** Minimum character count before Elaborate is allowed. Defaults to 2. */
  minLength?: number;
}

export function ElaborateButton({
  field,
  currentValue,
  context,
  onElaborated,
  className,
  minLength = 2,
}: ElaborateButtonProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleElaborate = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const trimmed = (currentValue || '').trim();

    if (trimmed.length < minLength) {
      toast.info(`Type at least ${minLength} characters for Elaborate to work.`);
      return;
    }

    // Sanitise context — strip any key that looks sensitive before sending
    const safeContext: Record<string, unknown> = {};
    if (context) {
      const BLOCKED_KEYS = /webhook|password|secret|token|key|api|bearer|auth|credential/i;
      for (const [k, v] of Object.entries(context)) {
        if (!BLOCKED_KEYS.test(k)) {
          safeContext[k] = v;
        }
      }
    }

    setLoading(true);
    setFailed(false);

    try {
      const data = await authJson<{ refined: string }>("/api/ai/refine", {
        method: "POST",
        body: JSON.stringify({
          field,
          value: trimmed.slice(0, 2000), // hard cap to prevent oversized payloads
          context: safeContext,
        }),
      });

      if (data.refined && typeof data.refined === 'string') {
        onElaborated(data.refined.trim());
        setSuccess(true);
        toast.success('Elaborated successfully!');
        setTimeout(() => setSuccess(false), 2500);
      } else {
        throw new Error('Empty response from AI');
      }
    } catch (error: unknown) {
      console.error('[Elaborate] Failed:', error);
      setFailed(true);
      const msg = error instanceof Error ? error.message : 'Elaborate failed';
      toast.error(msg.includes('401') ? 'Session expired — please log in again.' : 'Elaborate failed. Please try again.');
      setTimeout(() => setFailed(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const label = loading ? 'Elaborating...' : success ? 'Done!' : failed ? 'Failed' : 'Elaborate';
  const Icon = loading ? Loader2 : success ? Check : failed ? AlertCircle : Wand2;

  return (
    <button
      type="button"
      onClick={handleElaborate}
      disabled={loading}
      title={`Elaborate this field with AI — type something first to get the best result.`}
      aria-label={`Elaborate ${field} with AI`}
      className={[
        'flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all select-none',
        success
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          : failed
          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
          : 'bg-primary/5 text-primary hover:bg-primary/15 border border-primary/10 hover:border-primary/25',
        loading ? 'cursor-wait opacity-70' : 'cursor-pointer',
        className ?? '',
      ].join(' ')}
    >
      <Icon
        size={11}
        className={loading ? 'animate-spin' : success ? 'text-emerald-400' : ''}
      />
      {label}
    </button>
  );
}
