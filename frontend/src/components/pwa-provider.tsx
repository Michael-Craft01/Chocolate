"use client";

import { useEffect } from "react";
import { toast } from "sonner";

const SERVICE_WORKER_PATH = "/sw.js";

export function PwaProvider() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) {
      return;
    }

    let refreshing = false;

    const handleControllerChange = () => {
      if (refreshing) {
        return;
      }

      refreshing = true;
      window.location.reload();
    };

    const handleOffline = () => {
      toast.warning("Offline mode", {
        description: "HyprLead will keep the app shell available until the connection returns.",
      });
    };

    const handleOnline = () => {
      toast.success("Back online", {
        description: "Live campaign data can sync again.",
      });
    };

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register(SERVICE_WORKER_PATH, {
          scope: "/",
          updateViaCache: "none",
        });

        if (!navigator.serviceWorker.controller) {
          return;
        }

        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;

          worker?.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              toast("Update ready", {
                description: "Reload to activate the latest HyprLead build.",
                action: {
                  label: "Reload",
                  onClick: () => worker.postMessage({ type: "SKIP_WAITING" }),
                },
              });
            }
          });
        });
      } catch (error) {
        console.warn("HyprLead PWA registration failed", error);
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

    registerServiceWorker();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
    };
  }, []);

  return null;
}
