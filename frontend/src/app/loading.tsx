"use client";

import { BrandedLoader } from "@/components/BrandedLoader";

export default function RootLoading() {
  return (
    <BrandedLoader 
      fullscreen={true} 
      message="Compiling Outbound Intelligence..." 
      size="lg" 
    />
  );
}
