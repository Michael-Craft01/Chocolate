import { Sidebar } from "@/components/sidebar";
import { SubscriptionGuard } from "@/components/subscription-guard";
import { CommandPalette } from "@/components/CommandPalette";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SubscriptionGuard>
      <div className="flex h-screen bg-[#020203] text-white selection:bg-primary/30 font-sans">
        <CommandPalette />
        
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto p-10 custom-scrollbar relative">
          {/* Subtle Ambient Glow */}
          <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none opacity-50" />
          
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </SubscriptionGuard>
  );
}
