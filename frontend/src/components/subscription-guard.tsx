"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authJson, ApiAuthError } from "@/lib/api";

type UserContext = {
  id: string;
  email: string;
  paymentStatus: string;
  tier: string;
};

export function SubscriptionGuard({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;

    async function checkSubscription() {
      try {
        await authJson<UserContext>("/api/me");
        if (isMounted) {
          if (pathname.startsWith("/billing")) {
            router.replace("/dashboard");
          }
        }
      } catch (err) {
        // If 401 Unauthorized occurs, redirect to landing
        if (err instanceof ApiAuthError) {
          router.push("/");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    checkSubscription();

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
