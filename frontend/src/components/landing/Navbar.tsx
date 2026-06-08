"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [session, setSession] = useState<Session | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? 'h-20 bg-background/80 border-b border-card-border shadow-sm' : 'h-24 bg-transparent'
    } backdrop-blur-md`}>
      <div className="max-w-7xl mx-auto h-full px-5 sm:px-8 flex items-center justify-between gap-4">
        <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3 group">
          <div className="h-12 w-12 sm:h-14 sm:w-14 relative shrink-0">
             <img 
               src="/logo.png" 
               alt="HyprLead Oracle" 
               className="h-full w-full object-contain animate-neural drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]"
             />
          </div>
          <span className="text-foreground font-extrabold text-xl tracking-tight truncate">HyprLead</span>
        </Link>
        
        <div className="hidden lg:flex items-center gap-10 text-sm font-bold tracking-wide text-foreground/75">
          <Link href="/pricing" className="hover:text-primary transition-all relative group/link">
            Pricing
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary group-hover/link:w-full transition-all duration-300" />
          </Link>
          <Link href="/#features" className="hover:text-primary transition-all relative group/link">
            Features
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary group-hover/link:w-full transition-all duration-300" />
          </Link>
          <Link href="/how-it-works" className="hover:text-primary transition-all relative group/link">
            How it works
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary group-hover/link:w-full transition-all duration-300" />
          </Link>
          <Link href="/engine" className="hover:text-primary transition-all relative group/link">
            Engine
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary group-hover/link:w-full transition-all duration-300" />
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-4 sm:gap-8">
          <Link href="/login" className="hidden sm:inline text-sm font-bold tracking-wide text-foreground/75 hover:text-primary transition-colors">Sign In</Link>
          <Link href={session ? "/dashboard" : "/signup"} className="btn-pill-white !bg-primary hover:!bg-primary-hover !text-white shadow-sm !h-10 !px-5 sm:!px-6 text-xs font-bold tracking-wide cursor-pointer flex items-center justify-center">
            {session ? 'Dashboard' : 'Get Started'}
          </Link>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 -mr-2 text-foreground hover:bg-card/50 rounded-full transition-colors active:scale-95 cursor-pointer"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background/95 backdrop-blur-lg border-b border-card-border overflow-hidden absolute top-full left-0 right-0 z-40"
          >
            <div className="px-6 py-8 flex flex-col gap-6 text-sm font-bold tracking-wide text-foreground/85">
              <Link href="/pricing" onClick={() => setIsOpen(false)} className="hover:text-primary transition-colors py-2 border-b border-card-border/50">
                Pricing
              </Link>
              <Link href="/#features" onClick={() => setIsOpen(false)} className="hover:text-primary transition-colors py-2 border-b border-card-border/50">
                Features
              </Link>
              <Link href="/how-it-works" onClick={() => setIsOpen(false)} className="hover:text-primary transition-colors py-2 border-b border-card-border/50">
                How it works
              </Link>
              <Link href="/engine" onClick={() => setIsOpen(false)} className="hover:text-primary transition-colors py-2 border-b border-card-border/50">
                Engine
              </Link>
              <Link href="/login" onClick={() => setIsOpen(false)} className="sm:hidden hover:text-primary transition-colors py-2">
                Sign In
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
