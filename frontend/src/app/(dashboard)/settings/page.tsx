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

  const inputClass = "w-full bg-white/[0.02] border border-white/5 rounded-sm px-4 py-2.5 transition-all focus:outline-none focus:border-primary/50 text-xs font-bold";
  const labelClass = "block text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2 ml-1";

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-10">
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tighter gradient-text">Neural Calibration</h1>
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">Configure global identity parameters and market targeting nodes.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-sm text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all  shadow-primary/10 disabled:opacity-50 min-w-[140px]"
        >
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : success ? <Check className="h-3 w-3" /> : <Save className="h-3 w-3" />}
          {saving ? "Syncing..." : success ? "Synced" : "Sync Profile"}
        </button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Business Profile */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center text-primary">
              <Building2 size={16} />
            </div>
            <h2 className="text-sm font-black uppercase tracking-widest">Entity Profile</h2>
          </div>
          
          <div className="glass p-6 rounded-sm border border-white/5 space-y-4">
            <div>
              <label className={labelClass}>Company Identity</label>
              <input 
                type="text" 
                value={formData.companyName}
                onChange={e => setFormData({...formData, companyName: e.target.value})}
                placeholder="e.g. HyprLead Tech"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Neural Node (URL)</label>
              <input 
                type="url" 
                value={formData.website}
                onChange={e => setFormData({...formData, website: e.target.value})}
                placeholder="https://example.com"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Sender UID</label>
                <input 
                  type="text" 
                  value={formData.defaultSenderName}
                  onChange={e => setFormData({...formData, defaultSenderName: e.target.value})}
                  placeholder="Your Name"
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Protocol Role</label>
                <input 
                  type="text" 
                  value={formData.defaultSenderRole}
                  onChange={e => setFormData({...formData, defaultSenderRole: e.target.value})}
                  placeholder="e.g. Director"
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div className="p-3 rounded-sm bg-primary/5 border border-primary/10 flex gap-2 items-start">
              <MessageSquare size={14} className="text-primary mt-0.5 shrink-0" />
              <p className="text-[9px] text-zinc-500 leading-relaxed font-bold uppercase tracking-tighter">
                IDENTITY METADATA IS INJECTED INTO ALL OUTREACH CYCLES TO ENSURE NEURAL ALIGNMENT AND TRUST SCALING.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Global Market Target */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-sm bg-emerald-500/10 flex items-center justify-center text-emerald-500/70">
              <Globe size={16} />
            </div>
            <h2 className="text-sm font-black uppercase tracking-widest">Market Targeting</h2>
          </div>

          <div className="glass p-6 rounded-sm border border-white/5 space-y-4">
            <div>
              <label className={labelClass}>Core Sector</label>
              <input 
                type="text" 
                value={formData.industry}
                onChange={e => setFormData({...formData, industry: e.target.value})}
                placeholder="e.g. Real Estate, SaaS"
                className={inputClass}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Region</label>
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
                <label className={labelClass}>Local Hub</label>
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
              <label className={labelClass}>Telemetry Webhook (Discord)</label>
              <input 
                type="url" 
                value={formData.discordWebhook}
                onChange={e => setFormData({...formData, discordWebhook: e.target.value})}
                placeholder="https://discord.com/api/webhooks/..."
                className={inputClass}
              />
            </div>

            <div className="p-3 rounded-sm bg-emerald-500/5 border border-emerald-500/10 flex gap-2 items-start">
              <MapPin size={14} className="text-emerald-500/70 mt-0.5 shrink-0" />
              <p className="text-[9px] text-zinc-500 leading-relaxed font-bold uppercase tracking-tighter">
                SPATIAL FILTERS HELP THE AI CALIBRATE INITIAL SEARCH VECTORS. THESE CAN BE OVERRIDDEN AT THE NODE LEVEL.
              </p>
            </div>
          </div>
        </div>
      </form>

      {/* Calibration Card */}
      <div className="glass rounded-sm p-8 border border-white/5 relative overflow-hidden group interactive-card">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-sm  -mr-32 -mt-32" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.2em]">
              <Zap className="h-3.5 w-3.5" /> Global Sync
            </div>
            <h3 className="text-xl font-black tracking-tight">Synchronize Identity</h3>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest max-w-sm">
              Applying these updates ensures all future autonomous cycles use the correct branding and target hubs.
            </p>
          </div>
          <button 
            onClick={handleSave}
            className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-sm hover:brightness-90 transition-all  flex items-center gap-2"
          >
            Deploy Sync <ShieldCheck className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
