"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CycleRun {
  id: string;
  status: "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED" | "PARTIAL";
  leadsFound: number;
  maxLeads: number;
  campaign?: {
    name: string;
  };
}

interface Lead {
  id: string;
  createdAt: string;
  business: {
    name: string;
    category?: string | null;
    address?: string | null;
  };
  campaign?: {
    name: string;
  };
}

export function ActiveCycleListener() {
  const router = useRouter();
  const [activeCycle, setActiveCycle] = useState<CycleRun | null>(null);
  
  // Track seen leads and cycles to prevent duplicate toasts
  const seenLeadsRef = useRef<Set<string>>(new Set());
  const cyclesStateRef = useRef<Map<string, { status: string; leadsFound: number }>>(new Map());
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let isMounted = true;

    // Fast polling when active cycle is running (6s), slow polling when idle (15s)
    const pollInterval = activeCycle ? 6000 : 15000;

    async function checkSourcingUpdates() {
      try {
        // 1. Fetch latest campaigns / cycle runs
        const cyclesRes = await fetch("/api/cycles?limit=5");
        if (!cyclesRes.ok) return;
        const cycles: CycleRun[] = await cyclesRes.json();

        if (!isMounted) return;

        // Find if there is any active (running/queued) cycle
        const runningOrQueued = cycles.find(
          (c) => c.status === "RUNNING" || c.status === "QUEUED"
        );
        setActiveCycle(runningOrQueued || null);

        // Process status transitions
        cycles.forEach((cycle) => {
          const prevState = cyclesStateRef.current.get(cycle.id);
          const campaignName = cycle.campaign?.name || "Lead Campaign";

          if (prevState) {
            // Check status transitions
            if (prevState.status !== cycle.status) {
              if (cycle.status === "RUNNING") {
                toast.info("Discovery Agent Online", {
                  description: `Campaign "${campaignName}" is actively sweeping search surfaces...`,
                });
              } else if (cycle.status === "COMPLETED") {
                toast.success("Discovery Complete!", {
                  description: `Sourced ${cycle.leadsFound} qualified prospects for "${campaignName}".`,
                  action: {
                    label: "View Leads",
                    onClick: () => router.push("/leads"),
                  },
                  duration: 8000,
                });
              } else if (cycle.status === "FAILED" || cycle.status === "PARTIAL") {
                toast.warning("Discovery Cycle Complete", {
                  description: `Sourced ${cycle.leadsFound} prospects for "${campaignName}" before completion/pause.`,
                  action: {
                    label: "View Leads",
                    onClick: () => router.push("/leads"),
                  },
                });
              }
            }
          } else if (!isInitialLoadRef.current) {
            // New cycle run detected (wasn't in state ref)
            if (cycle.status === "QUEUED") {
              toast.info("Discovery Cycle Queued", {
                description: `Initializing AI sourcing runner for "${campaignName}"...`,
              });
            } else if (cycle.status === "RUNNING") {
              toast.info("Discovery Sweep Triggered", {
                description: `Campaign "${campaignName}" search agent is now online.`,
              });
            }
          }

          // Update cycle run state cache
          cyclesStateRef.current.set(cycle.id, {
            status: cycle.status,
            leadsFound: cycle.leadsFound,
          });
        });

        // 2. Fetch latest leads to toast newly discovered ones in real-time
        if (runningOrQueued) {
          const leadsRes = await fetch("/api/leads?limit=10");
          if (leadsRes.ok) {
            const data = await leadsRes.json();
            const leads: Lead[] = data.leads || [];

            if (!isMounted) return;

            leads.forEach((lead) => {
              const isNew = !seenLeadsRef.current.has(lead.id);
              
              // Add to seen ref
              seenLeadsRef.current.add(lead.id);

              // Only toast if it's not the initial component boot up
              if (isNew && !isInitialLoadRef.current) {
                const name = lead.business.name;
                const category = lead.business.category || "B2B Prospect";
                const location = lead.business.address?.split(",")[0] || "Target Region";
                const campaignName = lead.campaign?.name || "Launch";

                toast.success("Lead Sourced!", {
                  description: `Found ${name} (${category}) matching "${campaignName}" in ${location}.`,
                  action: {
                    label: "View",
                    onClick: () => router.push("/leads"),
                  },
                  duration: 6000,
                });
              }
            });
          }
        } else {
          // If no active cycle, we still fetch leads once to initialize seenLeadsRef
          if (isInitialLoadRef.current) {
            const leadsRes = await fetch("/api/leads?limit=20");
            if (leadsRes.ok) {
              const data = await leadsRes.json();
              const leads: Lead[] = data.leads || [];
              leads.forEach((l) => seenLeadsRef.current.add(l.id));
            }
          }
        }

        // Complete initialization phase
        if (isInitialLoadRef.current) {
          isInitialLoadRef.current = false;
        }

      } catch (err) {
        console.error("[ActiveCycleListener] Polling failed:", err);
      }

      // Schedule next execution
      if (isMounted) {
        timer = setTimeout(checkSourcingUpdates, pollInterval);
      }
    }

    // Trigger initial check
    checkSourcingUpdates();

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [activeCycle, router]);

  return null; // Side-effect only component
}
