export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Landing pages usually have distinct navigation */}
      {children}
    </div>
  );
}
