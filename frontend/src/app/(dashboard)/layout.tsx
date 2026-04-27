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
        
        <main className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar relative">
          {/* Logo Watermark */}
          <div className="fixed inset-0 -z-10 pointer-events-none flex items-center justify-center overflow-hidden"
               style={{ left: 'var(--sidebar-width, 256px)' }}>
            <img
              src="/logo.png"
              alt=""
              aria-hidden="true"
              className="w-[120vw] h-[120vw] max-w-[1400px] max-h-[1400px] object-contain select-none"
              style={{ opacity: 0.5, filter: 'invert(1)' }}
            />
          </div>

          {/* Subtle Ambient Glow */}
          <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-sm -z-10 pointer-events-none opacity-50" />
          
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </SubscriptionGuard>
  );
}
