import { Sidebar } from "@/components/sidebar";
import { SubscriptionGuard } from "@/components/subscription-guard";
import { CommandPalette } from "@/components/CommandPalette";
import DashboardTour from "@/components/dashboard/DashboardTour";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SubscriptionGuard>
      <DashboardTour />
      <div className="flex h-screen bg-transparent text-white selection:bg-primary/30 font-sans">
        <CommandPalette />
        
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto bg-background pt-24 pb-6 px-6 md:p-10 custom-scrollbar relative">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </SubscriptionGuard>
  );
}

