"use client";

import { useState, useEffect } from "react";
import { 
  Briefcase, 
  User, 
  Target, 
  Check, 
  Save, 
  Globe, 
  Zap, 
  MessageSquare, 
  Loader2,
  Building2,
  ShieldCheck,
  Webhook,
  MapPin
} from "lucide-react";
import { authJson } from "@/lib/api";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
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
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await authJson<any>("/api/settings");
        if (data.profile || data.campaign) {
          setFormData({
            companyName: data.profile?.companyName || "",
            website: data.profile?.website || "",
            industry: data.profile?.industry || "",
            defaultSenderName: data.profile?.defaultSenderName || "",
            defaultSenderRole: data.profile?.defaultSenderRole || "",
            targetCountry: data.campaign?.targetCountry || "ZW",
            locations: data.campaign?.locations || ["Harare"],
            industries: data.campaign?.industries || [""],
            discordWebhook: data.campaign?.discordWebhook || "",
          });
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await authJson("/api/settings", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings. Please check your inputs.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-white/[0.02] border border-white/5 rounded-sm px-5 py-3 transition-all focus:outline-none focus:border-primary/50 text-xs font-bold text-white placeholder:text-zinc-700";
  const labelClass = "block text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-3 ml-1";

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 animate-pulse">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-10 border-b border-white/5 pb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-[0.3em]">
            <ShieldCheck className="h-4 w-4 glow-primary" /> Secure Configuration
          </div>
          <h1 className="text-4xl font-black tracking-tightest gradient-text">Settings</h1>
          <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-[0.15em]">Configure your business identity and discovery preferences.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-3 h-14 px-10 bg-primary text-white rounded-sm text-[11px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all glow-primary shadow-primary/20 disabled:opacity-50 min-w-[180px]"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : success ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : success ? "Changes Saved" : "Save Settings"}
        </button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Section 1: Business Profile */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-primary/5 border border-primary/10 flex items-center justify-center text-primary glow-primary">
              <Building2 size={20} />
            </div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white">Business Profile</h2>
          </div>
          
          <div className="glass-card p-8 rounded-sm border border-white/5 space-y-6">
            <div>
              <label className={labelClass}>Company Name</label>
              <input 
                type="text" 
                value={formData.companyName}
                onChange={e => setFormData({...formData, companyName: e.target.value})}
                placeholder="e.g. HyprLead Solutions"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Business Website</label>
              <input 
                type="url" 
                value={formData.website}
                onChange={e => setFormData({...formData, website: e.target.value})}
                placeholder="https://hyprlead.com"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
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
              <div>
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

            <div className="p-4 rounded-sm bg-primary/5 border border-primary/10 flex gap-3 items-start">
              <MessageSquare size={16} className="text-primary mt-0.5 shrink-0" />
              <p className="text-[10px] text-zinc-500 leading-relaxed font-bold uppercase tracking-tight">
                This information is used to personalize discovery reports and verify your business identity.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Global Market Target */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Globe size={20} />
            </div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white">Default Targeting</h2>
          </div>

          <div className="glass-card p-8 rounded-sm border border-white/5 space-y-6">
            <div>
              <label className={labelClass}>Core Industry</label>
              <input 
                type="text" 
                value={formData.industry}
                onChange={e => setFormData({...formData, industry: e.target.value})}
                placeholder="e.g. Software, Real Estate"
                className={inputClass}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Default Region</label>
                <select 
                  value={formData.targetCountry}
                  onChange={e => setFormData({...formData, targetCountry: e.target.value})}
                  className={inputClass}
                >
                  <option value="ZW">Zimbabwe</option>
                  <option value="SA">South Africa</option>
                  <option value="UK">United Kingdom</option>
                  <option value="US">United States</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Default City</label>
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

            <div>
              <label className={labelClass}>Integration Hook (Discord)</label>
              <input 
                type="url" 
                value={formData.discordWebhook}
                onChange={e => setFormData({...formData, discordWebhook: e.target.value})}
                placeholder="https://discord.com/api/webhooks/..."
                className={inputClass}
              />
            </div>

            <div className="p-4 rounded-sm bg-emerald-500/5 border border-emerald-500/10 flex gap-3 items-start">
              <MapPin size={16} className="text-emerald-400 mt-0.5 shrink-0" />
              <p className="text-[10px] text-zinc-500 leading-relaxed font-bold uppercase tracking-tight">
                These location settings help our discovery engine find leads in your target area by default.
              </p>
            </div>
          </div>
        </div>
      </form>

      {/* Sync Card */}
      <div className="glass-card rounded-sm p-10 border border-white/5 relative overflow-hidden group interactive-card">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full -mr-64 -mt-64 group-hover:bg-primary/10 transition-colors blur-3xl" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
          <div className="space-y-2 max-w-lg">
            <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em]">
              <Zap className="h-4 w-4 glow-primary" /> Account Synchronization
            </div>
            <h3 className="text-2xl font-black tracking-tight text-white">Update Your Global Identity</h3>
            <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">
              Applying these updates ensures all future discovery cycles use the correct branding and target hubs.
            </p>
          </div>
          <button 
            onClick={handleSave}
            className="h-14 px-10 bg-white text-black text-[11px] font-black uppercase tracking-widest rounded-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 shadow-xl shadow-white/5"
          >
            Deploy Settings <ShieldCheck className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
