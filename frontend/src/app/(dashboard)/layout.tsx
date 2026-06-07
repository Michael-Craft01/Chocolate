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
      <div className="flex h-screen bg-transparent text-white selection:bg-primary/30 font-sans">
        <CommandPalette />
        
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar relative">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </SubscriptionGuard>
  );
}

