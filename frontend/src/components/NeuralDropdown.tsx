"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropdownOption {
  value: string;
  label: string;
}

interface NeuralDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
}

export function NeuralDropdown({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select Option",
  className,
  icon
}: NeuralDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(opt => opt.value === value);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative inline-block", className)} ref={dropdownRef}>
      {/* TRIGGER */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-10 px-4 rounded-sm bg-white/[0.03] border border-white/10 flex items-center gap-3 hover:border-primary/40 transition-all group",
          isOpen && "border-primary/60 bg-white/[0.05]"
        )}
      >
        {icon && <span className="text-zinc-500 group-hover:text-primary transition-colors">{icon}</span>}
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          className={cn(
            "h-3.5 w-3.5 text-zinc-600 group-hover:text-primary transition-all duration-300",
            isOpen && "rotate-180 text-primary"
          )} 
        />
      </button>

      {/* DROPDOWN MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 mt-2 min-w-[200px] bg-[#0A0A0B] border border-white/10 rounded-sm overflow-hidden z-[100] shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          >
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full px-5 py-3.5 text-left flex items-center justify-between group/item transition-all",
                    value === option.value ? "bg-primary/10" : "hover:bg-white/5"
                  )}
                >
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest transition-colors",
                    value === option.value ? "text-primary" : "text-zinc-400 group-hover/item:text-white"
                  )}>
                    {option.label}
                  </span>
                  
                  {value === option.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="h-4 w-4 rounded-full bg-primary flex items-center justify-center"
                    >
                      <Check className="h-2.5 w-2.5 text-white" strokeWidth={4} />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
            
            {/* Neural Accent Line */}
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-50" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
