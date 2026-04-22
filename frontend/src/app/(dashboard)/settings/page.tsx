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
    loadSettings();
  }, []);

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

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl p-3 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/40 text-sm";
  const labelClass = "block text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2 ml-1";

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Company Settings</h1>
          <p className="text-zinc-400 text-sm mt-1">Configure your business identity and global market targeting.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 disabled:opacity-50 min-w-[140px]"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : success ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : success ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section 1: Business Profile */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Building2 size={20} />
            </div>
            <h2 className="text-xl font-bold">Business Profile</h2>
          </div>
          
          <div className="glass p-6 rounded-2xl border border-white/5 space-y-5">
            <div>
              <label className={labelClass}>Company Name</label>
              <input 
                type="text" 
                value={formData.companyName}
                onChange={e => setFormData({...formData, companyName: e.target.value})}
                placeholder="e.g. Chocolate Tech"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Company Website</label>
              <input 
                type="url" 
                value={formData.website}
                onChange={e => setFormData({...formData, website: e.target.value})}
                placeholder="https://example.com"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Default Sender</label>
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
                <label className={labelClass}>Sender Role</label>
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

            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex gap-3 items-start">
              <MessageSquare size={18} className="text-primary mt-1 shrink-0" />
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Your sender name and role appear in outreach messages. Use a professional role that builds trust with your target industry.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Global Market Target */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Globe size={20} />
            </div>
            <h2 className="text-xl font-bold">Market Intelligence</h2>
          </div>

          <div className="glass p-6 rounded-2xl border border-white/5 space-y-5">
            <div>
              <label className={labelClass}>Primary Industry</label>
              <input 
                type="text" 
                value={formData.industry}
                onChange={e => setFormData({...formData, industry: e.target.value})}
                placeholder="e.g. Real Estate, SaaS, Manufacturing"
                className={inputClass}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Target Country</label>
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
                <label className={labelClass}>Primary City</label>
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
              <label className={labelClass}>Discord Notifications (Webhook URL)</label>
              <input 
                type="url" 
                value={formData.discordWebhook}
                onChange={e => setFormData({...formData, discordWebhook: e.target.value})}
                placeholder="https://discord.com/api/webhooks/..."
                className={inputClass}
              />
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex gap-3 items-start">
              <MapPin size={18} className="text-emerald-400 mt-1 shrink-0" />
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Setting your primary industry and city helps the AI calibrate its initial search sweeps. You can override these in specific campaigns.
              </p>
            </div>
          </div>
        </div>
      </form>

      {/* Calibration Card */}
      <div className="glass rounded-[2rem] p-8 border border-primary/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em]">
              <Zap className="h-4 w-4" /> Global Alignment
            </div>
            <h3 className="text-2xl font-bold">Sync Company Profile</h3>
            <p className="text-zinc-400 text-sm max-w-md">
              Updating your profile will ensure all future campaigns use your correct branding and target the right global market.
            </p>
          </div>
          <button 
            onClick={handleSave}
            className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-all shadow-2xl flex items-center gap-3"
          >
            Update Profile <ShieldCheck className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
