"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Target, CreditCard, Settings, LogOut, Zap, MessageSquare, User } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Campaigns", href: "/campaigns", icon: Target },
  { name: "Leads", href: "/leads", icon: MessageSquare },
  { name: "Billing", href: "/billing", icon: CreditCard },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r border-card-border bg-card">
      <div className="flex h-20 items-center px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
          <Zap className="h-6 w-6 text-primary fill-primary" />
          <span className="gradient-text">Chocolate</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-lg border px-3 py-2 text-sm font-medium transition-all",
                isActive 
                  ? "border-primary/30 bg-primary/10 text-primary shadow-[0_0_0_1px_rgba(59,130,246,0.2)]"
                  : "border-transparent text-zinc-400 hover:border-white/10 hover:bg-zinc-800/50 hover:text-zinc-200"
              )}
            >
              <Icon className={cn("h-4 w-4 transition-transform", isActive ? "scale-105" : "group-hover:scale-105")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-card-border p-4">
        <button className="flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm font-medium text-zinc-400 transition-all hover:border-white/10 hover:bg-zinc-800/50 hover:text-zinc-200">
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
