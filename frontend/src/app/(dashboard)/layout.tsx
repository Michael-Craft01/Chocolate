import { Sidebar } from "@/components/sidebar";
import { SubscriptionGuard } from "@/components/subscription-guard";
import { CommandPalette } from "@/components/CommandPalette";
import DashboardTour from "@/components/dashboard/DashboardTour";
import { ActiveCycleListener } from "@/components/dashboard/ActiveCycleListener";
import { TopControls } from "@/components/top-controls";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SubscriptionGuard>
      <DashboardTour />
      <ActiveCycleListener />
      <div className="flex h-screen bg-transparent text-foreground selection:bg-primary/30 font-sans">
        <CommandPalette />
        
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto bg-background pt-24 pb-6 px-6 md:pt-24 md:pb-10 md:px-10 custom-scrollbar relative">
          <TopControls />
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </SubscriptionGuard>
  );
}

