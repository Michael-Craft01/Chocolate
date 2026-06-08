"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Joyride, Step, EventData, STATUS } from "react-joyride";

export default function DashboardTour() {
  const pathname = usePathname();
  const [run, setRun] = useState(false);
  const [currentSteps, setCurrentSteps] = useState<Step[]>([]);
  const [hasMounted, setHasMounted] = useState(false);

  // Avoid SSR hydration mismatch
  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;

    // Define steps dynamically based on the current pathname
    if (pathname === "/dashboard") {
      const hasSeen = localStorage.getItem("has_seen_dashboard_tour");
      if (!hasSeen) {
        setCurrentSteps([
          {
            target: "body",
            content: "Welcome to your HyprLead workspace! Let's take a quick 1-minute tour of your outbound pipeline controls.",
            placement: "center",
          },
          {
            target: "#tour-dashboard-hub",
            content: "This is your main automation center. Here you can see how HyprLead runs automated searches, extracts pain-points, and verifies contacts.",
            placement: "bottom",
          },
          {
            target: "#tour-dashboard-stats",
            content: "Track your outreach pipeline value and verified target leads. These counts update in real-time as background searches run.",
            placement: "left",
          },
          {
            target: "#tour-dashboard-credits",
            content: "Your search credits limit. Background searches automatically deduct credits, keeping outreach delivery clean and secure.",
            placement: "top",
          },
          {
            target: "#tour-nav-search",
            content: "Ready to launch a search? Next, let's explore creating a search campaign here.",
            placement: "right",
          }
        ]);
        setRun(true);
      } else {
        setRun(false);
      }
    } else if (pathname === "/campaigns") {
      const hasSeen = localStorage.getItem("has_seen_campaigns_tour");
      if (!hasSeen) {
        setCurrentSteps([
          {
            target: "body",
            content: "This is the Campaigns panel. Here you manage search targets, regions, and search triggers.",
            placement: "center",
          },
          {
            target: "#tour-campaigns-create",
            content: "Click here to set up a new target audience campaign. You define product name, regions, and target business sectors.",
            placement: "left",
          },
          {
            target: "#tour-campaigns-search",
            content: "Quickly filter your campaigns list by status (Active vs. Paused) or search campaign names directly.",
            placement: "bottom",
          },
          {
            target: "#tour-campaigns-list",
            content: "Your active campaigns list. From here, you can trigger a live search cycle, edit strategy, or view strategy insights.",
            placement: "top",
          }
        ]);
        setRun(true);
      } else {
        setRun(false);
      }
    } else if (pathname === "/leads") {
      const hasSeen = localStorage.getItem("has_seen_leads_tour");
      if (!hasSeen) {
        setCurrentSteps([
          {
            target: "#tour-leads-feed",
            content: "The Leads feed. All verified business prospects are grouped by calendar day and the search cycles that discovered them.",
            placement: "right",
          },
          {
            target: "#tour-leads-details",
            content: "Select a lead to review contact emails, verified phones, AI need analysis, and direct outreach draft scripts.",
            placement: "left",
          },
          {
            target: "#tour-leads-export",
            content: "Export your verified leads lists instantly as CSV, Excel, or JSON to sync with your external sales CRM.",
            placement: "bottom",
          }
        ]);
        setRun(true);
      } else {
        setRun(false);
      }
    } else {
      setRun(false);
    }
  }, [pathname, hasMounted]);

  const handleJoyrideCallback = (data: EventData) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      if (pathname === "/dashboard") {
        localStorage.setItem("has_seen_dashboard_tour", "true");
      } else if (pathname === "/campaigns") {
        localStorage.setItem("has_seen_campaigns_tour", "true");
      } else if (pathname === "/leads") {
        localStorage.setItem("has_seen_leads_tour", "true");
      }
      setRun(false);
    }
  };

  if (!hasMounted) return null;

  return (
    <Joyride
      onEvent={handleJoyrideCallback}
      steps={currentSteps}
      run={run}
      continuous
      options={{
        arrowColor: "#0f0f12",
        backgroundColor: "#0f0f12",
        overlayColor: "rgba(0, 0, 0, 0.75)",
        primaryColor: "#10b981",
        textColor: "#f8fafc",
        zIndex: 10000,
        showProgress: true,
        buttons: ["back", "close", "primary", "skip"],
      }}
      styles={{
        tooltip: {
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "16px",
          padding: "20px",
          boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.5)",
        },
        tooltipContainer: {
          textAlign: "left",
        },
        buttonBack: {
          color: "#94a3b8",
          marginRight: 12,
          fontSize: "12px",
          fontWeight: "bold",
        },
        buttonPrimary: {
          borderRadius: "9999px",
          backgroundColor: "#10b981",
          padding: "8px 16px",
          fontSize: "12px",
          fontWeight: "bold",
          color: "#ffffff",
          boxShadow: "0 4px 10px rgba(16, 185, 129, 0.2)",
        },
        buttonSkip: {
          color: "#94a3b8",
          fontSize: "12px",
          fontWeight: "bold",
        }
      }}
    />
  );
}
