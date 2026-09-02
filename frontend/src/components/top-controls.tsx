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
        className="h-9 px-3 rounded-md border border-border bg-background hover:bg-muted text-xs font-medium text-foreground flex items-center gap-2 transition-colors cursor-pointer"
        title="Restart Tour"
      >
        <Sparkles className="h-3.5 w-3.5 text-foreground" />
        <span className="hidden sm:inline">Tour</span>
      </button>

      <button 
        onClick={toggleTheme}
        className="h-9 w-9 rounded-md border border-border bg-background hover:bg-muted text-foreground flex items-center justify-center transition-colors cursor-pointer"
        title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {theme === "dark" ? (
          <Sun className="h-4 w-4 text-foreground" />
        ) : (
          <Moon className="h-4 w-4 text-foreground" />
        )}
      </button>
    </div>
  );
}
