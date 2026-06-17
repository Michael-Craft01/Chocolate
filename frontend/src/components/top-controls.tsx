"use client";

import { useState, useEffect } from "react";
import { Sparkles, Sun, Moon } from "lucide-react";

export function TopControls() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const activeTheme = document.documentElement.classList.contains("dark") ? "dark" : "light";
    setTheme(activeTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const restartTour = () => {
    localStorage.removeItem("has_seen_dashboard_tour");
    localStorage.removeItem("has_seen_campaigns_tour");
    localStorage.removeItem("has_seen_leads_tour");
    window.location.reload();
  };

  return (
    <div className="absolute top-6 right-6 md:right-10 flex items-center gap-2 z-50">
      <button 
        onClick={restartTour} 
        className="h-10 px-4 rounded-full bg-card hover:bg-card/85 border border-card-border flex items-center gap-2 text-xs font-semibold text-foreground transition-all cursor-pointer shadow-sm active:scale-95"
        title="Restart Tour"
      >
        <Sparkles className="h-4 w-4 text-primary animate-pulse" />
        <span className="hidden sm:inline">Restart Tour</span>
      </button>

      <button 
        onClick={toggleTheme}
        className="h-10 w-10 rounded-full bg-card hover:bg-card/85 border border-card-border flex items-center justify-center text-foreground transition-all cursor-pointer shadow-sm active:scale-95"
        title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {theme === "dark" ? (
          <Sun className="h-4 w-4 text-amber-500" />
        ) : (
          <Moon className="h-4 w-4 text-blue-500" />
        )}
      </button>
    </div>
  );
}
