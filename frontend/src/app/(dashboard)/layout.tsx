import { Sidebar } from "@/components/sidebar";
import { UsageBar } from "@/components/usage-bar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen bg-background">
      <div className="flex flex-col border-r border-card-border bg-card overflow-hidden">
        <Sidebar />
        <div className="mt-auto border-t border-card-border bg-black/20">
          <UsageBar />
        </div>
      </div>
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}
