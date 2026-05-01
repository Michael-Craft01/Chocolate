"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const SheetContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);

export function Sheet({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  );
}

export function SheetTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
  const { setOpen } = React.useContext(SheetContext)!;
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: (e: React.MouseEvent) => {
        if (children.props.onClick) children.props.onClick(e);
        setOpen(true);
      }
    });
  }

  return (
    <button onClick={() => setOpen(true)}>
      {children}
    </button>
  );
}

export function SheetContent({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  const { open, setOpen } = React.useContext(SheetContext)!;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "fixed right-0 top-0 h-screen w-full max-w-xl bg-[#0A0A0A] border-l border-white/5 z-[101] shadow-2xl overflow-y-auto p-8 font-sans selection:bg-primary/20",
              className
            )}
          >
            <button 
              onClick={() => setOpen(false)}
              className="absolute top-6 right-6 h-10 w-10 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="relative h-full">
              {children}
            </div>
            
            {/* Iridescent Accent */}
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary/50 via-emerald-500/50 to-primary/50" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function SheetHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("space-y-4 mb-10", className)}>{children}</div>;
}

export function SheetTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn("text-3xl font-black tracking-tight text-white", className)}>{children}</h2>;
}

export function SheetDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("text-zinc-500 text-sm leading-relaxed", className)}>{children}</div>;
}
