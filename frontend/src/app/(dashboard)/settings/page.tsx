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
  ExternalLink,
  Upload
} from "lucide-react";
import { authJson } from "@/lib/api";
import { AIAssistButton } from "@/components/AIAssistButton";
import { BrandedLoader } from "@/components/BrandedLoader";
import { toast } from "sonner";
import type { Stats } from "@/lib/types";

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
    locations: ["Harare"],
    industries: [""],
    targetPainPoints: "",
    discordWebhook: "",
    automationMode: "MANUAL",
    autoRunFrequency: "MANUAL",
  });

  const [savedData, setSavedData] = useState({ ...formData });

  const [industriesInput, setIndustriesInput] = useState("");
  const [locationsInput, setLocationsInput] = useState("");
  const [targetPainPoints, setTargetPainPoints] = useState("");

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
            locations: data.campaign?.locations || ["Harare"],
            industries: data.campaign?.industries || [""],
            targetPainPoints: data.campaign?.targetPainPoints || "",
            discordWebhook: data.campaign?.discordWebhook || "",
            automationMode: data.user?.automationMode || "MANUAL",
            autoRunFrequency: data.user?.autoRunFrequency || "MANUAL",
          };
          setFormData(loaded);
          setSavedData(loaded);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    if (isEditing) {
      setIndustriesInput(formData.industries.join(", "));
      setLocationsInput(formData.locations.join(", "));
      setTargetPainPoints(formData.targetPainPoints || "");
    }
  }, [isEditing, formData]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldKey: "locations" | "industries") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const parsed = text
        .split(/[\n\r,;\t]+/)
        .map(item => item.trim())
        .filter(item => item.length > 0 && !item.startsWith('"') && !item.endsWith('"'));

      const joined = parsed.join(", ");
      if (fieldKey === "locations") {
        setLocationsInput(joined);
      } else {
        setIndustriesInput(joined);
      }
      toast.success(`Imported ${parsed.length} items from ${file.name}`);
    };
    reader.readAsText(file);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSuccess(false);

    const updatedFormData = {
      ...formData,
      industries: industriesInput.split(",").map(i => i.trim()).filter(i => i),
      locations: locationsInput.split(",").map(l => l.trim()).filter(l => l),
      targetPainPoints: targetPainPoints,
    };

    const savePromise = authJson("/api/settings", {
      method: "POST",
      body: JSON.stringify(updatedFormData),
    });

    toast.promise(savePromise, {
      loading: 'Saving settings...',
      success: 'Settings saved and synced.',
      error: (err) => err.message || 'Failed to save settings.'
    });

    try {
      await savePromise;
      setFormData(updatedFormData);
      setSavedData(updatedFormData);
      setSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-foreground/[0.03] hover:bg-foreground/[0.05] focus:bg-background border border-foreground/10 focus:border-primary rounded-lg px-4 py-2.5 transition-all text-sm font-medium text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary";
  const labelClass = "text-xs font-bold text-foreground/80 block mb-2 ml-1";

  if (loading) {
    return <BrandedLoader message="Syncing configuration..." />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 font-sans px-4">
      {/* Header Deck */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-10 border-b border-foreground/5 pb-10">
        <div className="space-y-2 text-left">
          <div className="flex items-center gap-2 text-xs font-bold text-primary">
            <ShieldCheck className="h-4 w-4" /> {isEditing ? "Modifying identity" : "Secure configuration"}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="text-sm text-foreground/60">Configure your business identity and campaign preferences for HyprLead AI.</p>
        </div>
        
        {!isEditing ? (
          <button type="button" onClick={() => setIsEditing(true)}
            className="flex items-center justify-center gap-2.5 h-10 px-4 bg-primary hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] cursor-pointer"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit Settings
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => {
                setFormData(savedData);
                setIsEditing(false);
              }}
              className="flex items-center justify-center h-10 px-4 bg-foreground/5 hover:bg-foreground/10 text-foreground border border-card-border rounded-lg text-xs font-bold transition-all active:scale-[0.98] cursor-pointer"
            >
              Cancel
            </button>
            <button onClick={() => handleSave()}
              disabled={saving}
              className="flex items-center justify-center gap-2.5 h-10 px-5 bg-primary hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-50 min-w-[140px] shrink-0 cursor-pointer"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : success ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
              {saving ? "Saving..." : success ? "Changes Saved" : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      {/* Automation Controls */}
      <div className="bento-card p-6 space-y-6">
        <div className="flex items-center gap-4 border-b border-foreground/5 pb-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Zap size={22} />
          </div>
          <div className="text-left">
            <h2 className="text-lg font-bold text-foreground">Automation Controls</h2>
            <p className="text-xs text-foreground/60">Control how automatic campaign searches spend your balance.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Mode", value: formData.automationMode },
            { label: "Searches Left", value: stats?.cycles?.remaining ?? 0 },
            { label: "Leads / Search", value: stats?.cycles?.leadsPerCycle ?? 0 },
            { label: "Latest Result", value: stats?.latestCycle ? `${stats.latestCycle.leadsFound}/${stats.latestCycle.maxLeads}` : "None" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-card-border bg-foreground/[0.02] p-4 text-left">
              <p className="text-[10px] font-bold text-foreground/45">{item.label}</p>
              <p className="mt-1.5 text-lg font-black tracking-tight text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { value: "MANUAL", label: "Manual Mode", desc: "Scan only when triggered manually. Ideal for conserving search credits." },
            { value: "AUTOMATIC", label: "Automatic Mode", desc: "Runs sweeps on schedule in the background, consuming 1 credit per sweep." },
            { value: "SMART", label: "Smart Automatic", desc: "Runs on schedule, but pauses if yield drops below 20% to save credit balance." },
          ].map((mode) => (
            <button key={mode.value} type="button" onClick={() => setFormData(prev => ({
                ...prev,
                automationMode: mode.value,
                autoRunFrequency: mode.value === "MANUAL" ? "MANUAL" : (prev.autoRunFrequency === "MANUAL" ? "WEEKLY" : prev.autoRunFrequency)
              }))}
              className={`rounded-xl border px-4 py-3 text-left transition-all ${formData.automationMode === mode.value ? "border-primary/40 bg-primary/10" : "border-card-border bg-foreground/[0.02]"}`}
            >
              <p className="text-xs font-bold text-foreground">{mode.label}</p>
              <p className="mt-1 text-xs font-semibold text-foreground/55 leading-relaxed">{mode.desc}</p>
            </button>
          ))}
        </div>

        {/* Mode Explanations Info Box */}
        <div className="p-5 rounded-xl border border-card-border bg-foreground/[0.01] text-left space-y-4">
          <p className="text-xs font-bold text-foreground/80">Understanding automation modes</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-foreground/70 leading-relaxed">
            <div className="space-y-1.5">
              <span className="font-bold text-foreground block">Manual Mode</span>
              <p>Search sweeps are executed exclusively when you click "Run Search" inside a campaign page. This mode guarantees zero background credit spend, letting you test ideas manually without recurring charges.</p>
            </div>
            <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-card-border pt-4 md:pt-0 md:pl-6">
              <span className="font-bold text-foreground block">Automatic Mode</span>
              <p>Automated background scans trigger at your exact chosen frequency (Weekly, Every 2 Days, or Daily). Each automated sweep deducts exactly 1 credit from your remaining monthly cycle balance.</p>
            </div>
            <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-card-border pt-4 md:pt-0 md:pl-6">
              <span className="font-bold text-foreground block">Smart Automatic</span>
              <p>An intelligent credit-saver mode. Sweeps run on your chosen schedule but are automatically paused in the background if the previous sweep failed or yielded less than 20% of its target capacity, preventing credit waste on dry queries.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3 rounded-xl border border-card-border bg-foreground/[0.02] p-4">
          <div className="flex-1 text-left">
            <p className="text-xs font-bold text-foreground">Cycle schedule</p>
            <p className="mt-1 text-xs font-semibold text-foreground/55">Used only when mode is Automatic or Smart.</p>
          </div>
          <select
            value={formData.autoRunFrequency}
            onChange={(e) => setFormData(prev => ({ ...prev, autoRunFrequency: e.target.value }))}
            disabled={formData.automationMode === "MANUAL"}
            className="h-10 rounded-lg border border-card-border bg-background px-3.5 text-xs font-semibold text-foreground disabled:opacity-40"
          >
            <option value="MANUAL">Manual</option>
            <option value="WEEKLY">Weekly</option>
            <option value="EVERY_2_DAYS">Every 2 Days</option>
            <option value="DAILY">Daily</option>
          </select>
        </div>
      </div>

      {/* Main Settings Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Section 1: Business Profile Card */}
        <div className="bento-card p-6 space-y-6">
          <div className="flex items-center gap-4 border-b border-foreground/5 pb-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Building2 size={22} />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-bold text-foreground">Business Identity</h2>
              <p className="text-xs text-foreground/60">Configure your company persona and outreach credentials</p>
            </div>
          </div>
          
          {!isEditing ? (
            // View Mode
            <div className="space-y-6">
              <div className="space-y-1 text-left">
                <span className="text-[10px] font-bold text-foreground/40 ml-1">Company name</span>
                <p className="text-sm font-medium text-foreground bg-foreground/[0.02] border border-foreground/5 rounded-lg px-4 py-2.5 leading-none">
                  {formData.companyName || "Not configured"}
                </p>
              </div>

              <div className="space-y-1 text-left">
                <span className="text-[10px] font-bold text-foreground/40 ml-1">Business website</span>
                <div>
                  {formData.website ? (
                    <a 
                      href={formData.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                        className="text-sm font-medium text-primary hover:text-primary-hover bg-primary/5 hover:bg-primary/10 rounded-lg px-4 py-2.5 inline-flex items-center gap-2 transition-all"
                    >
                      {formData.website} <ExternalLink size={12} />
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-foreground/40 bg-foreground/[0.02] border border-foreground/5 rounded-lg px-4 py-2.5 leading-none">
                      Not configured
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <span className="text-[10px] font-bold text-foreground/40 ml-1">Full name</span>
                  <p className="text-sm font-medium text-foreground bg-foreground/[0.02] border border-foreground/5 rounded-lg px-4 py-2.5 leading-none">
                    {formData.defaultSenderName || "Not configured"}
                  </p>
                </div>
                <div className="space-y-1 text-left">
                  <span className="text-[10px] font-bold text-foreground/40 ml-1">Position</span>
                  <p className="text-sm font-medium text-foreground bg-foreground/[0.02] border border-foreground/5 rounded-lg px-4 py-2.5 leading-none">
                    {formData.defaultSenderRole || "Not configured"}
                  </p>
                </div>
              </div>

              {/* Premium Callout Info Box */}
              <div className="flex gap-4 items-start p-4 rounded-xl bg-primary/5 border border-primary/10 text-left mt-4">
                <div className="p-2 rounded-full bg-primary/10 text-primary shrink-0">
                  <MessageSquare size={16} />
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed font-semibold">
                  This identity profile is used by HyprLead AI to write highly personalized outbound outreach drafts and verify your credentials.
                </p>
              </div>
            </div>
          ) : (
            // Edit Mode
            <div className="space-y-5">
              <div className="space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <label className={labelClass}>Company Name</label>
                  <AIAssistButton 
                    field="Company Name" 
                    currentValue={formData.companyName} 
                    onRefined={(val) => setFormData(prev => ({...prev, companyName: val}))} 
                    className="rounded-lg"
                  />
                </div>
                <input 
                  type="text" 
                  value={formData.companyName}
                  onChange={e => setFormData({...formData, companyName: e.target.value})}
                  placeholder="e.g. HyprLead Solutions"
                  className={inputClass}
                  required
                />
              </div>

              <div className="space-y-2 text-left">
                <label className={labelClass}>Business Website</label>
                <input 
                  type="url" 
                  value={formData.website}
                  onChange={e => setFormData({...formData, website: e.target.value})}
                  placeholder="https://hyprlead.com"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 text-left">
                  <label className={labelClass}>Your Full Name</label>
                  <input 
                    type="text" 
                    value={formData.defaultSenderName}
                    onChange={e => setFormData({...formData, defaultSenderName: e.target.value})}
                    placeholder="John Doe"
                    className={inputClass}
                    required
                  />
                </div>
                <div className="space-y-2 text-left">
                  <label className={labelClass}>Your Position</label>
                  <input 
                    type="text" 
                    value={formData.defaultSenderRole}
                    onChange={e => setFormData({...formData, defaultSenderRole: e.target.value})}
                    placeholder="e.g. Founder"
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              {/* Premium Callout Info Box */}
              <div className="flex gap-4 items-start p-4 rounded-xl bg-primary/5 border border-primary/10 text-left mt-4">
                <div className="p-2 rounded-full bg-primary/10 text-primary shrink-0">
                  <MessageSquare size={16} />
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed font-semibold">
                  This identity profile is used by HyprLead AI to write highly personalized outbound outreach drafts and verify your credentials.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Default Targeting Bento Card */}
        <div className="bento-card p-6 space-y-6">
          <div className="flex items-center gap-4 border-b border-foreground/5 pb-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Target size={22} />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-bold text-foreground">Campaign Targeting</h2>
              <p className="text-xs text-foreground/60">Configure your default search scopes and vertical markets</p>
            </div>
          </div>

          {!isEditing ? (
            // View Mode
            <div className="space-y-6">
              <div className="space-y-1 text-left">
                <span className="text-[10px] font-bold text-foreground/40 ml-1">Core profile industry</span>
                <p className="text-sm font-medium text-foreground bg-foreground/[0.02] border border-foreground/5 rounded-lg px-4 py-2.5 leading-none">
                  {formData.industry || "Not configured"}
                </p>
              </div>

              <div className="space-y-1 text-left">
                <span className="text-[10px] font-bold text-foreground/40 ml-1">Target industries</span>
                <div className="flex flex-wrap gap-2 p-3 bg-foreground/[0.02] border border-foreground/5 rounded-lg">
                  {formData.industries && formData.industries.filter(i => i.trim()).length > 0 ? (
                    formData.industries.filter(i => i.trim()).map((ind, idx) => (
                      <span key={idx} className="px-2.5 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full border border-primary/20">
                        {ind}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-foreground/45 italic ml-1">None configured</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <span className="text-[10px] font-bold text-foreground/40 ml-1">Default region</span>
                  <p className="text-sm font-medium text-foreground bg-foreground/[0.02] border border-foreground/5 rounded-lg px-4 py-2.5 leading-none">
                    {formData.targetCountry === "ZW" ? "Zimbabwe" :
                     formData.targetCountry === "SA" ? "South Africa" :
                     formData.targetCountry === "UK" ? "United Kingdom" :
                     formData.targetCountry === "US" ? "United States" : formData.targetCountry}
                  </p>
                </div>
                <div className="space-y-1 text-left">
                  <span className="text-[10px] font-bold text-foreground/40 ml-1">Target country code</span>
                  <p className="text-sm font-medium text-foreground bg-foreground/[0.02] border border-foreground/5 rounded-lg px-4 py-2.5 leading-none">
                    {formData.targetCountry || "Not configured"}
                  </p>
                </div>
              </div>

              <div className="space-y-1 text-left">
                <span className="text-[10px] font-bold text-foreground/40 ml-1">Target cities / locations</span>
                <div className="flex flex-wrap gap-2 p-3 bg-foreground/[0.02] border border-foreground/5 rounded-lg">
                  {formData.locations && formData.locations.filter(l => l.trim()).length > 0 ? (
                    formData.locations.filter(l => l.trim()).map((loc, idx) => (
                      <span key={idx} className="px-2.5 py-1 text-xs font-semibold bg-foreground/10 text-foreground/80 rounded-full border border-foreground/10">
                        {loc}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-foreground/45 italic ml-1">None configured</span>
                  )}
                </div>
              </div>

              <div className="space-y-1 text-left">
                <span className="text-[10px] font-bold text-foreground/40 ml-1">Target pain points</span>
                <p className="text-sm font-medium text-foreground bg-foreground/[0.02] border border-foreground/5 rounded-lg px-4 py-2.5 leading-relaxed whitespace-pre-wrap">
                  {formData.targetPainPoints || "None configured"}
                </p>
              </div>

              <div className="space-y-1 text-left">
                <span className="text-[10px] font-bold text-foreground/40 ml-1">Integration hook (Discord)</span>
                <p className="text-sm font-medium text-foreground bg-foreground/[0.02] border border-foreground/5 rounded-lg px-4 py-2.5 leading-none tracking-widest font-mono truncate">
                  {formData.discordWebhook 
                    ? formData.discordWebhook.replace(/(.{12}).+(.{8})/, "$1••••••••••••••••$2") 
                    : "Not configured"}
                </p>
              </div>

              {/* Premium Callout Info Box */}
              <div className="flex gap-4 items-start p-4 rounded-xl bg-primary/5 border border-primary/10 text-left mt-4">
                <div className="p-2 rounded-full bg-primary/10 text-primary shrink-0">
                  <MapPin size={16} />
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed font-semibold">
                  These location rules determine the standard search radius for the HyprLead AI search engine during automatic targeting.
                </p>
              </div>
            </div>
          ) : (
            // Edit Mode
            <div className="space-y-5">
              <div className="space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <label className={labelClass}>Core Profile Industry</label>
                  <AIAssistButton 
                    field="Industry" 
                    currentValue={formData.industry} 
                    onRefined={(val) => setFormData(prev => ({...prev, industry: val}))} 
                    className="rounded-lg"
                  />
                </div>
                <input 
                  type="text" 
                  value={formData.industry}
                  onChange={e => setFormData({...formData, industry: e.target.value})}
                  placeholder="e.g. Software, Real Estate"
                  className={inputClass}
                  required
                />
              </div>

              <div className="space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <label className={labelClass}>Target Industries</label>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all bg-foreground/5 hover:bg-foreground/10 text-foreground/70 cursor-pointer">
                      <Upload size={10} />
                      <span>Upload list</span>
                      <input
                        type="file"
                        accept=".txt,.csv"
                        onChange={(e) => handleFileUpload(e, "industries")}
                        className="hidden"
                      />
                    </label>
                    <AIAssistButton 
                      field="Target Industries" 
                      currentValue={industriesInput} 
                      context={{ companyName: formData.companyName, industry: formData.industry }}
                      onRefined={(val) => setIndustriesInput(val)} 
                      className="rounded-lg"
                    />
                  </div>
                </div>
                <input 
                  type="text" 
                  value={industriesInput}
                  onChange={e => setIndustriesInput(e.target.value)}
                  placeholder="e.g. Retail, Cafes, Software"
                  className={inputClass}
                  required
                />
                <p className="text-[10px] text-foreground/45">Enter comma-separated values, or upload a TXT/CSV list file.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 text-left">
                  <label className={labelClass}>Default Region</label>
                  <select 
                    value={formData.targetCountry}
                    onChange={e => setFormData({...formData, targetCountry: e.target.value})}
                    className={`${inputClass} appearance-none`}
                  >
                    <option value="ZW">Zimbabwe</option>
                    <option value="SA">South Africa</option>
                    <option value="UK">United Kingdom</option>
                    <option value="US">United States</option>
                  </select>
                </div>
                <div className="space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <label className={labelClass}>Target Cities / Locations</label>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all bg-foreground/5 hover:bg-foreground/10 text-foreground/70 cursor-pointer">
                        <Upload size={10} />
                        <span>Upload list</span>
                        <input
                          type="file"
                          accept=".txt,.csv"
                          onChange={(e) => handleFileUpload(e, "locations")}
                          className="hidden"
                        />
                      </label>
                      <AIAssistButton 
                        field="Target Locations" 
                        currentValue={locationsInput} 
                        context={{ targetCountry: formData.targetCountry }}
                        onRefined={(val) => setLocationsInput(val)} 
                        className="rounded-lg"
                      />
                    </div>
                  </div>
                  <input 
                    type="text" 
                    value={locationsInput}
                    onChange={e => setLocationsInput(e.target.value)}
                    placeholder="e.g. Harare, Cape Town"
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <label className={labelClass}>Target Pain Points</label>
                  <AIAssistButton 
                    field="Target Pain Points" 
                    currentValue={targetPainPoints} 
                    context={{ companyName: formData.companyName, industry: formData.industry }}
                    onRefined={(val) => setTargetPainPoints(val)} 
                    className="rounded-lg"
                  />
                </div>
                <textarea 
                  rows={3}
                  value={targetPainPoints}
                  onChange={e => setTargetPainPoints(e.target.value)}
                  placeholder="Describe default pain points to focus on..."
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div className="space-y-2 text-left">
                <label className={labelClass}>Integration Hook (Discord)</label>
                <input 
                  type="url" 
                  value={formData.discordWebhook}
                  onChange={e => setFormData({...formData, discordWebhook: e.target.value})}
                  placeholder="https://discord.com/api/webhooks/..."
                  className={inputClass}
                />
              </div>

              {/* Premium Callout Info Box */}
              <div className="flex gap-4 items-start p-4 rounded-xl bg-primary/5 border border-primary/10 text-left mt-4">
                <div className="p-2 rounded-full bg-primary/10 text-primary shrink-0">
                  <MapPin size={16} />
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed font-semibold">
                  These location rules determine the standard search radius for the HyprLead AI search engine during automatic targeting.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bento-card p-6 md:p-8 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent opacity-50 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full -mr-48 -mt-48 group-hover:bg-primary/15 transition-all duration-700 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="space-y-3 max-w-xl text-left">
            <div className="flex items-center gap-2 text-primary font-bold text-xs">
              <Zap className="h-4 w-4 animate-pulse" /> Account settings
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-foreground">Save campaign settings</h3>
            <p className="text-sm text-foreground/75 leading-relaxed">
              Saving these settings immediately updates your business profile and location preferences.
            </p>
          </div>
          
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)}
              className="h-10 px-5 bg-foreground text-background hover:bg-foreground/90 text-xs font-bold rounded-lg transition-all flex items-center gap-2.5 shadow-xl shadow-foreground/5 hover:scale-[1.02] active:scale-[0.98] shrink-0 cursor-pointer"
            >
              Edit settings <ShieldCheck className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button onClick={() => handleSave()}
              disabled={saving}
              className="h-10 px-5 bg-primary hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2.5 shadow-xl shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] shrink-0 cursor-pointer"
            >
              Save settings <ShieldCheck className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
