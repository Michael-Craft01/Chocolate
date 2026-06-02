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
            locations: data.campaign?.locations || ["Harare"],
            industries: data.campaign?.industries || [""],
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

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSuccess(false);

    const savePromise = authJson("/api/settings", {
      method: "POST",
      body: JSON.stringify(formData),
    });

    toast.promise(savePromise, {
      loading: 'Deploying global settings...',
      success: 'Configuration active. Identity and targeting synced.',
      error: (err) => err.message || 'Failed to save settings.'
    });

    try {
      await savePromise;
      setSavedData(formData);
      setSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-foreground/[0.03] hover:bg-foreground/[0.05] focus:bg-background border border-foreground/10 focus:border-primary rounded-full px-6 py-3.5 transition-all text-sm font-medium text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary";
  const labelClass = "text-xs font-bold uppercase tracking-wider text-foreground/80 block mb-2 ml-1";

  if (loading) {
    return <BrandedLoader message="Syncing configuration..." />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 font-sans px-4">
      {/* Header Deck */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-10 border-b border-foreground/5 pb-10">
        <div className="space-y-2 text-left">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
            <ShieldCheck className="h-4 w-4" /> {isEditing ? "Modifying Identity" : "Secure Configuration"}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="text-sm text-foreground/60">Configure your business identity and discovery preferences for HyprLead AI.</p>
        </div>
        
        {!isEditing ? (
          <button type="button" onClick={() => setIsEditing(true)}
            className="flex items-center justify-center gap-3 h-12 px-8 bg-primary hover:bg-emerald-600 text-white rounded-full text-xs font-bold transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] cursor-pointer"
          >
            <Pencil className="h-4 w-4" />
            Edit Settings
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => {
                setFormData(savedData);
                setIsEditing(false);
              }}
              className="flex items-center justify-center h-12 px-6 bg-foreground/5 hover:bg-foreground/10 text-foreground border border-card-border rounded-full text-xs font-bold transition-all active:scale-[0.98] cursor-pointer"
            >
              Cancel
            </button>
            <button onClick={() => handleSave()}
              disabled={saving}
              className="flex items-center justify-center gap-3 h-12 px-8 bg-primary hover:bg-emerald-600 text-white rounded-full text-xs font-bold transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-50 min-w-[160px] shrink-0 cursor-pointer"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : success ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving..." : success ? "Changes Saved" : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      {/* Automation Controls */}
      <div className="bento-card p-8 space-y-6">
        <div className="flex items-center gap-4 border-b border-foreground/5 pb-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Zap size={22} />
          </div>
          <div className="text-left">
            <h2 className="text-lg font-bold text-foreground">Automation Controls</h2>
            <p className="text-xs text-foreground/60">Control how automatic discovery cycles spend your balance.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Mode", value: formData.automationMode },
            { label: "Cycles Left", value: stats?.cycles?.remaining ?? 0 },
            { label: "Leads / Cycle", value: stats?.cycles?.leadsPerCycle ?? 0 },
            { label: "Latest Result", value: stats?.latestCycle ? `${stats.latestCycle.leadsFound}/${stats.latestCycle.maxLeads}` : "None" },
          ].map((item) => (
            <div key={item.label} className="rounded-[20px] border border-card-border bg-foreground/[0.02] p-5 text-left">
              <p className="text-[9px] font-black uppercase tracking-widest text-foreground/45">{item.label}</p>
              <p className="mt-2 text-xl font-black tracking-tight text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { value: "MANUAL", label: "Manual", desc: "Only spend cycles when you press Run Cycle." },
            { value: "AUTOMATIC", label: "Automatic", desc: "Spend cycles on the plan schedule." },
            { value: "SMART", label: "Smart", desc: "Run automatically only when campaign yield looks healthy." },
          ].map((mode) => (
            <button key={mode.value} type="button" onClick={() => setFormData(prev => ({
                ...prev,
                automationMode: mode.value,
                autoRunFrequency: mode.value === "MANUAL" ? "MANUAL" : (prev.autoRunFrequency === "MANUAL" ? "WEEKLY" : prev.autoRunFrequency)
              }))}
              className={`rounded-[20px] border px-5 py-4 text-left transition-all ${formData.automationMode === mode.value ? "border-primary/40 bg-primary/10" : "border-card-border bg-foreground/[0.02]"}`}
            >
              <p className="text-xs font-black uppercase tracking-widest text-foreground">{mode.label}</p>
              <p className="mt-1 text-xs font-semibold text-foreground/55 leading-relaxed">{mode.desc}</p>
            </button>
          ))}
        </div>

        {/* Mode Explanations Info Box */}
        <div className="p-6 rounded-[20px] border border-card-border bg-foreground/[0.01] text-left space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-foreground/80">Understanding Automation Modes</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-foreground/70 leading-relaxed">
            <div className="space-y-1.5">
              <span className="font-bold text-foreground block">Manual Mode</span>
              <p>Scans are triggered only when you click "Run Cycle" manually. No background sweeps will occur, conserving your cycle balance indefinitely.</p>
            </div>
            <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-card-border pt-4 md:pt-0 md:pl-6">
              <span className="font-bold text-foreground block">Automatic Mode</span>
              <p>Scans run automatically in the background at your selected schedule (Weekly, Every 2 Days, or Daily), consuming 1 cycle balance per sweep.</p>
            </div>
            <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-card-border pt-4 md:pt-0 md:pl-6">
              <span className="font-bold text-foreground block">Smart Mode</span>
              <p>Scans run on your schedule, but only when targeting signals predict high qualified lead yields, saving your balance during dry periods.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3 rounded-[20px] border border-card-border bg-foreground/[0.02] p-5">
          <div className="flex-1 text-left">
            <p className="text-xs font-black uppercase tracking-widest text-foreground">Cycle Schedule</p>
            <p className="mt-1 text-xs font-semibold text-foreground/55">Used only when mode is Automatic or Smart.</p>
          </div>
          <select
            value={formData.autoRunFrequency}
            onChange={(e) => setFormData(prev => ({ ...prev, autoRunFrequency: e.target.value }))}
            disabled={formData.automationMode === "MANUAL"}
            className="h-11 rounded-full border border-card-border bg-background px-5 text-xs font-bold uppercase tracking-widest text-foreground disabled:opacity-40"
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
        <div className="bento-card space-y-6">
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
                <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.15em] ml-1">Company Name</span>
                <p className="text-sm font-bold text-foreground bg-foreground/[0.02] border border-foreground/5 rounded-full px-6 py-3.5 leading-none">
                  {formData.companyName || "Not configured"}
                </p>
              </div>

              <div className="space-y-1 text-left">
                <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.15em] ml-1">Business Website</span>
                <div>
                  {formData.website ? (
                    <a 
                      href={formData.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                        className="text-sm font-bold text-primary hover:text-primary-hover bg-primary/5 hover:bg-primary/10 rounded-full px-6 py-3.5 inline-flex items-center gap-2 transition-all"
                    >
                      {formData.website} <ExternalLink size={12} />
                    </a>
                  ) : (
                    <p className="text-sm font-bold text-foreground/40 bg-foreground/[0.02] border border-foreground/5 rounded-full px-6 py-3.5 leading-none">
                      Not configured
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.15em] ml-1">Full Name</span>
                  <p className="text-sm font-bold text-foreground bg-foreground/[0.02] border border-foreground/5 rounded-full px-6 py-3.5 leading-none">
                    {formData.defaultSenderName || "Not configured"}
                  </p>
                </div>
                <div className="space-y-1 text-left">
                  <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.15em] ml-1">Position</span>
                  <p className="text-sm font-bold text-foreground bg-foreground/[0.02] border border-foreground/5 rounded-full px-6 py-3.5 leading-none">
                    {formData.defaultSenderRole || "Not configured"}
                  </p>
                </div>
              </div>

              {/* Premium Callout Info Box */}
              <div className="flex gap-4 items-start p-5 rounded-[24px] bg-primary/5 border border-primary/10 text-left mt-4">
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
                    className="rounded-full"
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
              <div className="flex gap-4 items-start p-5 rounded-[24px] bg-primary/5 border border-primary/10 text-left mt-4">
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
        <div className="bento-card space-y-6">
          <div className="flex items-center gap-4 border-b border-foreground/5 pb-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Target size={22} />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-bold text-foreground">Discovery Targeting</h2>
              <p className="text-xs text-foreground/60">Configure your default search scopes and vertical markets</p>
            </div>
          </div>

          {!isEditing ? (
            // View Mode
            <div className="space-y-6">
              <div className="space-y-1 text-left">
                <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.15em] ml-1">Core Industry</span>
                <p className="text-sm font-bold text-foreground bg-foreground/[0.02] border border-foreground/5 rounded-full px-6 py-3.5 leading-none">
                  {formData.industry || "Not configured"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.15em] ml-1">Default Region</span>
                  <p className="text-sm font-bold text-foreground bg-foreground/[0.02] border border-foreground/5 rounded-full px-6 py-3.5 leading-none">
                    {formData.targetCountry === "ZW" ? "Zimbabwe" :
                     formData.targetCountry === "SA" ? "South Africa" :
                     formData.targetCountry === "UK" ? "United Kingdom" :
                     formData.targetCountry === "US" ? "United States" : formData.targetCountry}
                  </p>
                </div>
                <div className="space-y-1 text-left">
                  <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.15em] ml-1">Default City</span>
                  <p className="text-sm font-bold text-foreground bg-foreground/[0.02] border border-foreground/5 rounded-full px-6 py-3.5 leading-none">
                    {formData.locations[0] || "Not configured"}
                  </p>
                </div>
              </div>

              <div className="space-y-1 text-left">
                <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.15em] ml-1">Integration Hook (Discord)</span>
                <p className="text-sm font-bold text-foreground bg-foreground/[0.02] border border-foreground/5 rounded-full px-6 py-3.5 leading-none tracking-widest font-mono truncate">
                  {formData.discordWebhook 
                    ? formData.discordWebhook.replace(/(.{12}).+(.{8})/, "$1••••••••••••••••$2") 
                    : "Not configured"}
                </p>
              </div>

              {/* Premium Callout Info Box */}
              <div className="flex gap-4 items-start p-5 rounded-[24px] bg-primary/5 border border-primary/10 text-left mt-4">
                <div className="p-2 rounded-full bg-primary/10 text-primary shrink-0">
                  <MapPin size={16} />
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed font-semibold">
                  These location rules determine the standard sweep radius for the HyprLead AI discovery engine during automatic targeting.
                </p>
              </div>
            </div>
          ) : (
            // Edit Mode
            <div className="space-y-5">
              <div className="space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <label className={labelClass}>Core Industry</label>
                  <AIAssistButton 
                    field="Industry" 
                    currentValue={formData.industry} 
                    onRefined={(val) => setFormData(prev => ({...prev, industry: val}))} 
                    className="rounded-full"
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
                    <label className={labelClass}>Default City</label>
                    <AIAssistButton 
                      field="Target City" 
                      currentValue={formData.locations[0]} 
                      context={{ targetCountry: formData.targetCountry }}
                      onRefined={(val) => setFormData(prev => ({...prev, locations: [val]}))} 
                      className="rounded-full"
                    />
                  </div>
                  <input 
                    type="text" 
                    value={formData.locations[0]}
                    onChange={e => setFormData({...formData, locations: [e.target.value]})}
                    placeholder="e.g. Harare"
                    className={inputClass}
                    required
                  />
                </div>
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
              <div className="flex gap-4 items-start p-5 rounded-[24px] bg-primary/5 border border-primary/10 text-left mt-4">
                <div className="p-2 rounded-full bg-primary/10 text-primary shrink-0">
                  <MapPin size={16} />
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed font-semibold">
                  These location rules determine the standard sweep radius for the HyprLead AI discovery engine during automatic targeting.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sync Card */}
      <div className="bento-card p-10 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent opacity-50 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full -mr-48 -mt-48 group-hover:bg-primary/15 transition-all duration-700 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="space-y-3 max-w-xl text-left">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
              <Zap className="h-4 w-4 animate-pulse" /> Account Synchronization
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-foreground">Sync Campaign Identity</h3>
            <p className="text-sm text-foreground/75 leading-relaxed">
              Syncing these settings immediately propagates your core industry profile and region targets to the HyprLead AI discovery engine.
            </p>
          </div>
          
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)}
              className="h-12 px-8 bg-foreground text-background hover:bg-foreground/90 text-xs font-bold uppercase tracking-wider rounded-full transition-all flex items-center gap-2 shadow-xl shadow-foreground/5 hover:scale-[1.02] active:scale-[0.98] shrink-0 cursor-pointer"
            >
              Modify Identity <ShieldCheck className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={() => handleSave()}
              disabled={saving}
              className="h-12 px-8 bg-primary hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all flex items-center gap-2 shadow-xl shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] shrink-0 cursor-pointer"
            >
              Sync & Deploy <ShieldCheck className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
