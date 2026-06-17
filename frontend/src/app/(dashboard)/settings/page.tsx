"use client";

import { useState, useEffect } from "react";
import { 
  Check, 
  Save, 
  Zap, 
  MessageSquare, 
  Loader2,
  Building2,
  ShieldCheck,
  MapPin,
  Target,
  Pencil,
  ExternalLink
} from "lucide-react";
import { authJson } from "@/lib/api";
import { BrandedLoader } from "@/components/BrandedLoader";
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
    // Business Profile
    companyName: "",
    website: "",
    industry: "", // Global primary industry
    defaultSenderName: "",
    defaultSenderRole: "",
    
    // Target Market (Global Defaults)
    targetCountry: "ZW",
    locations: "", // Comma-separated string for questionnaire
    industries: "", // Comma-separated string for questionnaire
    targetPainPoints: "",
    discordWebhook: "",
    automationMode: "MANUAL",
    autoRunFrequency: "MANUAL",
  });

  const [savedData, setSavedData] = useState({ ...formData });

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
          setSavedData(loaded);

          // Auto-launch Setup Assistant if setup parameter is present
          if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            if (params.get("setup") === "true") {
              setIsEditing(true);
            }
          }
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

    const savePromise = authJson("/api/settings", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    toast.promise(savePromise, {
      loading: 'Saving settings...',
      success: 'Settings saved and synced.',
      error: (err) => err.message || 'Failed to save settings.'
    });

    try {
      await savePromise;
      setSavedData(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
      // Revert local changes on error
      setFormData(savedData);
    } finally {
      setSaving(false);
    }
  };

  const updateAutomationSetting = async (key: "automationMode" | "autoRunFrequency", value: string) => {
    const newFormData = { ...formData, [key]: value };
    
    // Auto-align manual settings if manual mode/frequency is picked
    if (key === "automationMode" && value === "MANUAL") {
      newFormData.autoRunFrequency = "MANUAL";
    } else if (key === "autoRunFrequency" && value === "MANUAL") {
      newFormData.automationMode = "MANUAL";
    } else if (key === "automationMode" && (value === "AUTOMATIC" || value === "SMART") && newFormData.autoRunFrequency === "MANUAL") {
      newFormData.autoRunFrequency = "DAILY"; // Default back to Daily if they enable automation
    } else if (key === "autoRunFrequency" && value !== "MANUAL" && newFormData.automationMode === "MANUAL") {
      newFormData.automationMode = "AUTOMATIC"; // Default back to Automatic if they select a frequency
    }

    setFormData({ ...newFormData });

    const payload = {
      companyName: newFormData.companyName,
      website: newFormData.website,
      industry: newFormData.industry,
      defaultSenderName: newFormData.defaultSenderName,
      defaultSenderRole: newFormData.defaultSenderRole,
      targetCountry: newFormData.targetCountry,
      locations: newFormData.locations.split(",").map(l => l.trim()).filter(Boolean),
      industries: newFormData.industries.split(",").map(i => i.trim()).filter(Boolean),
      targetPainPoints: newFormData.targetPainPoints,
      discordWebhook: newFormData.discordWebhook,
      automationMode: newFormData.automationMode,
      autoRunFrequency: newFormData.autoRunFrequency
    };

    const updatePromise = authJson("/api/settings", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    toast.promise(updatePromise, {
      loading: 'Updating automation settings...',
      success: 'Automation configuration synced.',
      error: 'Failed to update automation controls.'
    });

    try {
      await updatePromise;
      setSavedData({ ...newFormData });
    } catch (error) {
      console.error("Failed to update settings:", error);
      // Revert state
      setFormData(savedData);
    }
  };

  const settingsSteps: StepConfig[] = [
    {
      title: "Business Identity Profile",
      description: "Specify your basic company details. These values are used to customize outreach personas.",
      fields: [
        {
          key: "companyName",
          label: "Company Name",
          placeholder: "e.g. HyprLead Solutions",
          type: "text"
        },
        {
          key: "website",
          label: "Business Website",
          placeholder: "https://hyprlead.com",
          type: "text"
        },
        {
          key: "industry",
          label: "Core Profile Industry",
          placeholder: "e.g. Software, Real Estate",
          type: "text",
          aiRefineField: "Industry",
          aiRefineContextKeys: ["companyName"]
        }
      ]
    },
    {
      title: "Sender Identity Settings",
      description: "Configure the default name and position of the persona dispatching outbound search campaigns.",
      fields: [
        {
          key: "defaultSenderName",
          label: "Your Full Name",
          placeholder: "John Doe",
          type: "text"
        },
        {
          key: "defaultSenderRole",
          label: "Your Position",
          placeholder: "e.g. Founder",
          type: "text"
        }
      ]
    },
    {
      title: "Global Targeting Parameters",
      description: "Configure your global default targeting rules. These values serve as initial templates for campaigns.",
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
        {
          key: "locations",
          label: "Target Cities / Locations",
          placeholder: "e.g. Harare, Bulawayo",
          type: "list_upload",
          fileUploadKey: "locations",
          aiRefineField: "Target Locations",
          aiRefineContextKeys: ["targetCountry"]
        },
        {
          key: "industries",
          label: "Target Industries",
          placeholder: "e.g. Retail, Cafes, Tech Services",
          type: "list_upload",
          fileUploadKey: "industries",
          aiRefineField: "Target Industries",
          aiRefineContextKeys: ["companyName", "industry"]
        }
      ]
    },
    {
      title: "Advanced Scraper & Alert Config",
      description: "Define target pain points, real-time alerting webhooks, and default automation rules.",
      fields: [
        {
          key: "targetPainPoints",
          label: "Default Target Pain Points",
          placeholder: "Describe default pain points to focus on...",
          type: "textarea",
          aiRefineField: "Target Pain Points",
          aiRefineContextKeys: ["companyName", "industry"]
        },
        {
          key: "discordWebhook",
          label: "Integration Hook (Discord Webhook)",
          placeholder: "https://discord.com/api/webhooks/...",
          type: "text"
        },
        {
          key: "automationMode",
          label: "Default Automation Mode",
          type: "select",
          options: [
            { value: "MANUAL", label: "Manual Mode" },
            { value: "AUTOMATIC", label: "Automatic Background Sweeps" },
            { value: "SMART", label: "Smart Automatic (Pause on Low Yield)" }
          ]
        },
        {
          key: "autoRunFrequency",
          label: "Auto-Run Frequency",
          type: "select",
          options: [
            { value: "MANUAL", label: "Manual Execution" },
            { value: "WEEKLY", label: "Weekly Run" },
            { value: "EVERY_2_DAYS", label: "Run Every 2 Days" },
            { value: "DAILY", label: "Daily Execution" }
          ]
        }
      ]
    }
  ];

  if (loading) {
    return <BrandedLoader message="Syncing configuration..." />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 font-sans px-4">
      {/* Header Deck */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-10 border-b border-foreground/5 pb-10">
        <div className="space-y-2 text-left">
          <div className="flex items-center gap-2 text-xs font-bold text-primary">
            <ShieldCheck className="h-4 w-4" /> Secure configuration
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="text-sm text-zinc-500">Configure your business identity and campaign preferences for HyprLead AI.</p>
        </div>
        
        <button type="button" onClick={() => setIsEditing(true)}
          disabled={saving}
          className="flex items-center justify-center gap-2.5 h-10 px-4 bg-primary hover:bg-emerald-600 text-white rounded-sm text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : success ? <Check className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
          {saving ? "Saving..." : success ? "Saved" : "Edit Configuration"}
        </button>
      </div>

      {/* Automation Controls */}
      <div className="bg-primary/[0.02] border border-white/5 p-6 rounded-sm space-y-6">
        <div className="flex items-center gap-4 border-b border-white/5 pb-6">
          <div className="w-12 h-12 rounded-sm bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Zap size={22} />
          </div>
          <div className="text-left">
            <h2 className="text-lg font-bold text-foreground">Automation Controls</h2>
            <p className="text-xs text-zinc-500">Control how automatic campaign searches spend your balance.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Automation Mode Dropdown */}
          <div className="rounded-sm border border-white/5 bg-white/[0.02] p-4 text-left flex flex-col justify-between min-h-[96px] relative z-[40]">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Automation Mode</p>
            <NeuralDropdown
              options={[
                { value: "MANUAL", label: "Manual Mode" },
                { value: "AUTOMATIC", label: "Automatic Sweeps" },
                { value: "SMART", label: "Smart Auto (Pause Low Yield)" }
              ]}
              value={formData.automationMode}
              onChange={(val) => updateAutomationSetting("automationMode", val)}
              className="w-full"
            />
          </div>

          {/* Scan Frequency Dropdown */}
          <div className="rounded-sm border border-white/5 bg-white/[0.02] p-4 text-left flex flex-col justify-between min-h-[96px] relative z-[40]">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Scan Frequency</p>
            <NeuralDropdown
              options={[
                { value: "MANUAL", label: "Manual Execution" },
                { value: "WEEKLY", label: "Weekly Run" },
                { value: "EVERY_2_DAYS", label: "Run Every 2 Days" },
                { value: "DAILY", label: "Daily Execution" }
              ]}
              value={formData.autoRunFrequency}
              onChange={(val) => updateAutomationSetting("autoRunFrequency", val)}
              className="w-full"
            />
          </div>

          {/* Searches Left */}
          <div className="rounded-sm border border-white/5 bg-white/[0.02] p-4 text-left flex flex-col justify-between min-h-[96px]">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Searches Left</p>
            <p className="text-lg font-black tracking-tight text-foreground">{stats?.cycles?.remaining ?? 0}</p>
          </div>

          {/* Leads / Search */}
          <div className="rounded-sm border border-white/5 bg-white/[0.02] p-4 text-left flex flex-col justify-between min-h-[96px]">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Leads / Search</p>
            <p className="text-lg font-black tracking-tight text-foreground">{stats?.cycles?.leadsPerCycle ?? 0}</p>
          </div>
        </div>

        {/* Mode Explanations Info Box */}
        <div className="p-5 rounded-sm border border-white/5 bg-white/[0.01] text-left space-y-4">
          <p className="text-xs font-bold text-zinc-400">Understanding automation modes</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-zinc-500 leading-relaxed">
            <div className="space-y-1.5">
              <span className="font-bold text-zinc-300 block">Manual Mode</span>
              <p>Search sweeps are executed exclusively when you click "Run Search" inside a campaign page. This mode guarantees zero background credit spend, letting you test ideas manually without recurring charges.</p>
            </div>
            <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6">
              <span className="font-bold text-zinc-300 block">Automatic Mode</span>
              <p>Automated background scans trigger at your exact chosen frequency (Weekly, Every 2 Days, or Daily). Each automated sweep deducts exactly 1 credit from your remaining monthly cycle balance.</p>
            </div>
            <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6">
              <span className="font-bold text-zinc-300 block">Smart Automatic</span>
              <p>An intelligent credit-saver mode. Sweeps run on your chosen schedule but are automatically paused in the background if the previous sweep failed or yielded less than 20% of its target capacity, preventing credit waste on dry queries.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3 rounded-sm border border-white/5 bg-white/[0.02] p-4">
          <div className="flex-1 text-left">
            <p className="text-xs font-bold text-foreground">Latest Run Performance</p>
            <p className="mt-1 text-xs font-semibold text-zinc-500">
              Yield: {stats?.latestCycle ? `${stats.latestCycle.leadsFound} new leads found out of ${stats.latestCycle.maxLeads} targeted` : "No cycles executed yet."}
              {stats?.latestCycle?.completedAt ? ` (Completed: ${new Date(stats.latestCycle.completedAt).toLocaleString()})` : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Main Settings Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Section 1: Business Profile Card */}
        <div className="bg-primary/[0.02] border border-white/5 p-6 rounded-sm space-y-6">
          <div className="flex items-center gap-4 border-b border-white/5 pb-6">
            <div className="w-12 h-12 rounded-sm bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Building2 size={22} />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-bold text-foreground">Business Identity</h2>
              <p className="text-xs text-zinc-500">Configure your company persona and outreach credentials</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-1 text-left">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Company name</span>
              <p className="text-sm font-semibold text-zinc-300 bg-white/[0.02] border border-white/5 rounded-sm px-4 py-3 leading-none">
                {formData.companyName || "Not configured"}
              </p>
            </div>

            <div className="space-y-1 text-left">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Business website</span>
              <div>
                {formData.website ? (
                  <a 
                    href={formData.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm font-semibold text-primary hover:text-primary/95 bg-primary/10 rounded-sm px-4 py-3 inline-flex items-center gap-2 transition-all leading-none"
                  >
                    {formData.website} <ExternalLink size={12} />
                  </a>
                ) : (
                  <p className="text-sm font-semibold text-zinc-550 bg-white/[0.02] border border-white/5 rounded-sm px-4 py-3 leading-none">
                    Not configured
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 text-left">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Full name</span>
                <p className="text-sm font-semibold text-zinc-300 bg-white/[0.02] border border-white/5 rounded-sm px-4 py-3 leading-none">
                  {formData.defaultSenderName || "Not configured"}
                </p>
              </div>
              <div className="space-y-1 text-left">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Position</span>
                <p className="text-sm font-semibold text-zinc-300 bg-white/[0.02] border border-white/5 rounded-sm px-4 py-3 leading-none">
                  {formData.defaultSenderRole || "Not configured"}
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start p-4 rounded-sm bg-primary/5 border border-primary/10 text-left mt-4">
              <div className="p-2 rounded-full bg-primary/10 text-primary shrink-0">
                <MessageSquare size={16} />
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
                This identity profile is used by HyprLead AI to write highly personalized outbound outreach drafts and verify your credentials.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Default Targeting Bento Card */}
        <div className="bg-primary/[0.02] border border-white/5 p-6 rounded-sm space-y-6">
          <div className="flex items-center gap-4 border-b border-white/5 pb-6">
            <div className="w-12 h-12 rounded-sm bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Target size={22} />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-bold text-foreground">Campaign Targeting</h2>
              <p className="text-xs text-zinc-500">Configure your default search scopes and vertical markets</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-1 text-left">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Core profile industry</span>
              <p className="text-sm font-semibold text-zinc-300 bg-white/[0.02] border border-white/5 rounded-sm px-4 py-3 leading-none">
                {formData.industry || "Not configured"}
              </p>
            </div>

            <div className="space-y-1 text-left">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Target industries</span>
              <div className="flex flex-wrap gap-2 p-3 bg-white/[0.02] border border-white/5 rounded-sm min-h-12">
                {formData.industries && formData.industries.split(",").map(i => i.trim()).filter(Boolean).length > 0 ? (
                  formData.industries.split(",").map(i => i.trim()).filter(Boolean).map((ind, idx) => (
                    <span key={idx} className="px-2.5 py-1 text-xs font-black uppercase tracking-widest bg-primary/15 text-primary rounded-sm border border-primary/25">
                      {ind}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-zinc-650 italic ml-1">None configured</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 text-left">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Default region</span>
                <p className="text-sm font-semibold text-zinc-300 bg-white/[0.02] border border-white/5 rounded-sm px-4 py-3 leading-none">
                  {formData.targetCountry === "ZW" ? "Zimbabwe" :
                   formData.targetCountry === "SA" ? "South Africa" :
                   formData.targetCountry === "UK" ? "United Kingdom" :
                   formData.targetCountry === "US" ? "United States" : formData.targetCountry}
                </p>
              </div>
              <div className="space-y-1 text-left">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Target country code</span>
                <p className="text-sm font-semibold text-zinc-300 bg-white/[0.02] border border-white/5 rounded-sm px-4 py-3 leading-none">
                  {formData.targetCountry || "Not configured"}
                </p>
              </div>
            </div>

            <div className="space-y-1 text-left">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Target cities / locations</span>
              <div className="flex flex-wrap gap-2 p-3 bg-white/[0.02] border border-white/5 rounded-sm min-h-12">
                {formData.locations && formData.locations.split(",").map(l => l.trim()).filter(Boolean).length > 0 ? (
                  formData.locations.split(",").map(l => l.trim()).filter(Boolean).map((loc, idx) => (
                    <span key={idx} className="px-2.5 py-1 text-xs font-black uppercase tracking-widest bg-white/5 border border-white/10 text-zinc-400">
                      {loc}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-zinc-650 italic ml-1">None configured</span>
                )}
              </div>
            </div>

            <div className="space-y-1 text-left">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Target pain points</span>
              <p className="text-sm font-semibold text-zinc-300 bg-white/[0.02] border border-white/5 rounded-sm px-4 py-3 leading-relaxed whitespace-pre-wrap">
                {formData.targetPainPoints || "None configured"}
              </p>
            </div>

            <div className="space-y-1 text-left">
              <div className="flex justify-between items-center pr-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Integration hook (Discord)</span>
                <Link href="/docs/discord" className="text-[10px] text-primary hover:underline font-bold uppercase tracking-widest">
                  Setup Guide
                </Link>
              </div>
              <p className="text-sm font-semibold text-zinc-300 bg-white/[0.02] border border-white/5 rounded-sm px-4 py-3 leading-none tracking-widest font-mono truncate">
                {formData.discordWebhook 
                  ? formData.discordWebhook.replace(/(.{12}).+(.{8})/, "$1••••••••••••••••$2") 
                  : "Not configured"}
              </p>
            </div>

            <div className="flex gap-4 items-start p-4 rounded-sm bg-primary/5 border border-primary/10 text-left mt-4">
              <div className="p-2 rounded-full bg-primary/10 text-primary shrink-0">
                <MapPin size={16} />
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
                These location rules determine the standard search radius for the HyprLead AI search engine during automatic targeting.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-primary/[0.02] border border-white/5 p-6 md:p-8 rounded-sm relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent opacity-50 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full -mr-48 -mt-48 group-hover:bg-primary/15 transition-all duration-700 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="space-y-3 max-w-xl text-left">
            <h3 className="text-2xl font-bold tracking-tight text-foreground">Save global configurations</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Launch the interactive setup assistant to edit these identity values or global location targets.
            </p>
          </div>
          
          <button onClick={() => setIsEditing(true)}
            className="h-12 px-6 bg-primary hover:bg-primary/95 text-white text-xs font-black uppercase tracking-widest rounded-sm transition-all flex items-center gap-2.5 shadow-xl shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] shrink-0 cursor-pointer"
          >
            Launch Setup Assistant <ShieldCheck className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Carousel Questionnaire Modal Portal */}
      <AnimatePresence>
        {isEditing && (
          <QuestionnaireModal
            isOpen={isEditing}
            onClose={() => setIsEditing(false)}
            title="Edit Global Config Settings"
            subtitle="HyprLead setup assistant"
            steps={settingsSteps}
            data={formData}
            onChange={setFormData}
            onSubmit={handleSave}
            submitLabel="SAVE SETTINGS"
            loading={saving}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
