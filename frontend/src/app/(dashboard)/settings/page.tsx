"use client";

import { useState, useEffect } from "react";
import { 
  Check, 
  Loader2,
  Building2,
  Target,
  Pencil,
  Zap,
  ExternalLink
} from "lucide-react";
import { authJson } from "@/lib/api";
import { toast } from "sonner";
import { QuestionnaireModal, type StepConfig } from "@/components/QuestionnaireModal";
import { NeuralDropdown } from "@/components/NeuralDropdown";
import { AnimatePresence } from "framer-motion";
import type { Stats } from "@/lib/types";
import Link from "next/link";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  
  const [formData, setFormData] = useState({
    companyName: "",
    website: "",
    industry: "",
    defaultSenderName: "",
    defaultSenderRole: "",
    targetCountry: "ZW",
    locations: "",
    industries: "",
    targetPainPoints: "",
    discordWebhook: "",
    automationMode: "MANUAL",
    autoRunFrequency: "MANUAL",
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await authJson<any>("/api/settings");
        setStats(await authJson<Stats>("/api/stats").catch(() => null));
        if (data.profile || data.campaign) {
          const loaded = {
            companyName: data.profile?.companyName || "",
            website: data.profile?.website || "",
            industry: data.profile?.industry || "",
            defaultSenderName: data.profile?.defaultSenderName || "",
            defaultSenderRole: data.profile?.defaultSenderRole || "",
            targetCountry: data.campaign?.targetCountry || "ZW",
            locations: Array.isArray(data.campaign?.locations) ? data.campaign.locations.join(", ") : (data.campaign?.locations || ""),
            industries: Array.isArray(data.campaign?.industries) ? data.campaign.industries.join(", ") : (data.campaign?.industries || ""),
            targetPainPoints: data.campaign?.targetPainPoints || "",
            discordWebhook: data.campaign?.discordWebhook || "",
            automationMode: data.user?.automationMode || "MANUAL",
            autoRunFrequency: data.user?.autoRunFrequency || "MANUAL",
          };
          setFormData(loaded);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    setIsEditing(false);

    const payload = {
      ...formData,
      industries: formData.industries.split(",").map(i => i.trim()).filter(Boolean),
      locations: formData.locations.split(",").map(l => l.trim()).filter(Boolean),
    };

    try {
      await authJson("/api/settings", {
        method: "PUT",
        body: JSON.stringify(payload)
      });
      setSuccess(true);
      toast.success("Settings saved successfully.");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const updateAutomationSetting = async (key: "automationMode" | "autoRunFrequency", value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    try {
      await authJson("/api/settings", {
        method: "PUT",
        body: JSON.stringify({ [key]: value })
      });
      toast.success("Automation setting updated.");
    } catch {
      toast.error("Failed to update automation setting.");
    }
  };

  const settingsSteps: StepConfig[] = [
    {
      title: "Business Identity",
      description: "Define company credentials used to sign personalized outreach emails.",
      fields: [
        { key: "companyName", label: "Company Name", placeholder: "Acme Corp", type: "text" },
        { key: "website", label: "Website URL", placeholder: "https://acme.com", type: "text" },
        { key: "industry", label: "Primary Industry", placeholder: "Software, Consulting", type: "text" },
        { key: "defaultSenderName", label: "Sender Full Name", placeholder: "Jane Doe", type: "text" },
        { key: "defaultSenderRole", label: "Sender Title", placeholder: "Founder", type: "text" }
      ]
    },
    {
      title: "Targeting Defaults",
      description: "Default search criteria applied to newly created campaigns.",
      fields: [
        {
          key: "targetCountry",
          label: "Default Region",
          type: "select",
          options: [
            { value: "ZW", label: "Zimbabwe" },
            { value: "SA", label: "South Africa" },
            { value: "UK", label: "United Kingdom" },
            { value: "US", label: "United States" }
          ]
        },
        { key: "locations", label: "Target Locations", placeholder: "Harare, Bulawayo", type: "text" },
        { key: "industries", label: "Target Industries", placeholder: "Retail, Technology", type: "text" },
        { key: "discordWebhook", label: "Discord Webhook", placeholder: "https://discord.com/api/webhooks/...", type: "text" }
      ]
    }
  ];

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-foreground" />
        <p className="text-xs text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure automation intervals, webhook destinations, and account preferences.
          </p>
        </div>
        
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          disabled={saving}
          className="h-9 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : success ? <Check className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
          <span>{saving ? "Saving..." : success ? "Saved" : "Edit Settings"}</span>
        </button>
      </div>

      {/* Section 1: Automation */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-5">
        <div className="border-b border-border pb-3">
          <h2 className="text-base font-semibold text-foreground">Automation Schedule</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure background scraper execution mode and run intervals.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-md border border-border bg-background p-3.5 space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Automation Mode</span>
            <NeuralDropdown
              options={[
                { value: "MANUAL", label: "Manual Mode" },
                { value: "AUTOMATIC", label: "Automatic Sweeps" },
                { value: "SMART", label: "Smart Auto" }
              ]}
              value={formData.automationMode}
              onChange={(val) => updateAutomationSetting("automationMode", val)}
              className="w-full"
            />
          </div>

          <div className="rounded-md border border-border bg-background p-3.5 space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Scan Frequency</span>
            <NeuralDropdown
              options={[
                { value: "MANUAL", label: "Manual Execution" },
                { value: "DAILY", label: "Daily Run" },
                { value: "EVERY_2_DAYS", label: "Every 2 Days" },
                { value: "WEEKLY", label: "Weekly Run" }
              ]}
              value={formData.autoRunFrequency}
              onChange={(val) => updateAutomationSetting("autoRunFrequency", val)}
              className="w-full"
            />
          </div>

          <div className="rounded-md border border-border bg-background p-3.5 space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Search Engine</span>
            <p className="text-lg font-bold text-foreground">Unmetered</p>
            <p className="text-[11px] text-muted-foreground">Open platform edition</p>
          </div>

          <div className="rounded-md border border-border bg-background p-3.5 space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Batch Capacity</span>
            <p className="text-lg font-bold text-foreground">50 leads / run</p>
            <p className="text-[11px] text-muted-foreground">Visual AI scraping enabled</p>
          </div>
        </div>
      </div>

      {/* Section 2 & 3: Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Business Identity */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <div className="border-b border-border pb-3">
            <h2 className="text-base font-semibold text-foreground">Business Identity</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Company profile and signature used for personalized outbound outreach.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="font-medium text-muted-foreground">Company Name:</span>
              <p className="font-medium text-foreground mt-0.5">{formData.companyName || "Not configured"}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Website:</span>
              <p className="font-medium text-foreground mt-0.5">{formData.website || "Not configured"}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Sender Persona:</span>
              <p className="font-medium text-foreground mt-0.5">
                {formData.defaultSenderName 
                  ? `${formData.defaultSenderName} (${formData.defaultSenderRole || 'Representative'})` 
                  : "Not configured"}
              </p>
            </div>
          </div>
        </div>

        {/* Global Targeting */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <div className="border-b border-border pb-3">
            <h2 className="text-base font-semibold text-foreground">Default Targeting</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Default geographic regions, industries, and alert destinations.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="font-medium text-muted-foreground">Default Region:</span>
              <p className="font-medium text-foreground mt-0.5">{formData.targetCountry || "ZW"}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Default Locations:</span>
              <p className="font-medium text-foreground mt-0.5">{formData.locations || "Harare"}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Default Industries:</span>
              <p className="font-medium text-foreground mt-0.5">{formData.industries || "Business Services"}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Discord Webhook:</span>
              <p className="font-mono text-muted-foreground mt-0.5 truncate">
                {formData.discordWebhook ? "••••••••••••••••" : "Not configured"}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Questionnaire Modal Portal */}
      <AnimatePresence>
        {isEditing && (
          <QuestionnaireModal
            isOpen={isEditing}
            onClose={() => setIsEditing(false)}
            title="Edit Platform Settings"
            subtitle="Configure profile and defaults"
            steps={settingsSteps}
            data={formData}
            onChange={setFormData}
            onSubmit={handleSave}
            submitLabel="Save Changes"
            loading={saving}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
