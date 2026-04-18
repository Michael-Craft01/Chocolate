"use client";

import { LucideIcon, SearchX } from "lucide-react";
import { Plus } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({ 
  title, 
  description, 
  icon: Icon = SearchX, 
  actionText, 
  onAction 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center glass rounded-2xl border border-dashed border-white/10">
      <div className="bg-primary/5 p-6 rounded-full mb-6">
        <Icon className="h-12 w-12 text-zinc-600" />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-zinc-500 max-w-sm mb-8 text-sm leading-relaxed">
        {description}
      </p>
      {actionText && (
        <button
          onClick={onAction}
          className="flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" />
          {actionText}
        </button>
      )}
    </div>
  );
}
