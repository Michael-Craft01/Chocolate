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
      <button onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-10 px-4 rounded-lg bg-card border border-card-border flex items-center gap-3 hover:border-card-hover-border transition-all group",
          isOpen && "border-primary/60 bg-card"
        )}
      >
        {icon && <span className="text-zinc-500 group-hover:text-primary transition-colors">{icon}</span>}
        <span className="text-xs font-semibold text-foreground/80 transition-colors">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          className={cn(
            "h-3.5 w-3.5 text-zinc-550 group-hover:text-primary transition-all duration-300",
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
            className="absolute left-0 mt-2 min-w-[200px] bg-card border border-card-border rounded-lg overflow-hidden z-[100] shadow-lg"
          >
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              {options.map((option) => (
                <button key={option.value} onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full px-5 py-3 text-left flex items-center justify-between group/item transition-all",
                    value === option.value ? "bg-primary/10" : "hover:bg-foreground/5"
                  )}
                >
                  <span className={cn(
                    "text-xs font-medium transition-colors",
                    value === option.value ? "text-primary font-semibold" : "text-foreground/80 group-hover/item:text-foreground"
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
