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
        const user = await authJson<UserContext>("/api/me");
        
        if (isMounted) {
          const allowedStatuses = ["active", "free", "trialing"];
          if (!allowedStatuses.includes(user.paymentStatus) && !pathname.startsWith("/billing")) {
            router.push("/billing");
          } else if (allowedStatuses.includes(user.paymentStatus) && pathname.startsWith("/billing")) {
            // Optional: prevent returning to billing if actively subscribed (or maybe they want to upgrade?)
            // We'll leave it open for upgrades, but redirect to dashboard initially
            if (pathname === "/billing") {
                // If they explicitly clicked billing, let them stay. If they just landed, let them stay.
                // Just don't lock them out.
            }
          }
        }
      } catch (err) {
        // If 401 Unauthorized occurs, the api wrapper might throw. Let's redirect to landing.
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
