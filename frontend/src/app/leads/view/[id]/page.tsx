"use client";

import { useEffect, useState } from "react";
import { 
  Building2, 
  Target, 
  MessageSquare, 
  Globe, 
  Phone, 
  Zap,
  CheckCircle2,
  Share2,
  Calendar,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";

export default function PublicLeadPage() {
  const params = useParams();
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLead();
  }, [params.id]);

  const fetchLead = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/api/leads/public/${params.id}`);
      if (!res.ok) throw new Error("Lead not found or link expired.");
      const data = await res.json();
      setLead(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getWhatsAppLink = (phone: string) => {
    const clean = phone.replace(/\D/g, "");
    return `https://wa.me/${clean}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070707] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Zap className="h-12 w-12 text-primary animate-bounce" />
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Decoding Intelligence...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#070707] flex items-center justify-center p-6">
        <div className="max-w-md w-full glass p-8 rounded-[2rem] border border-red-500/20 text-center space-y-4">
          <Zap className="h-12 w-12 text-red-500 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Expired Link</h1>
          <p className="text-zinc-400">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-full text-sm font-bold">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070707] text-white selection:bg-primary/30">
      {/* Dynamic Background Blur */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-lg mx-auto p-6 pt-12 pb-32 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-20 w-20 rounded-[2.5rem] bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center shadow-2xl shadow-primary/20 rotate-12">
            <Building2 className="h-10 w-10 text-white -rotate-12" />
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter leading-none">{lead.name}</h1>
            <div className="flex items-center justify-center gap-2 text-zinc-500 text-sm font-medium">
              <Target className="h-4 w-4 text-emerald-400" />
              {lead.industry}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-4">
          {lead.phone && (
            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href={getWhatsAppLink(lead.phone)}
              target="_blank"
              className="flex items-center justify-between p-6 bg-emerald-500 rounded-[2rem] text-white font-black text-xl shadow-xl shadow-emerald-500/20 group"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Phone className="h-6 w-6" />
                </div>
                Chat on WhatsApp
              </div>
              <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </motion.a>
          )}

          {lead.website && (
            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href={lead.website}
              target="_blank"
              className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-[2rem] text-white font-bold group"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Globe className="h-6 w-6" />
                </div>
                Visit Website
              </div>
              <ExternalLink className="text-zinc-500 group-hover:text-white transition-colors" />
            </motion.a>
          )}
        </div>

        {/* Intelligence Card */}
        <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-8 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Business Intel</span>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Target Pain Point</label>
              <p className="text-xl font-bold leading-tight">{lead.painPoint}</p>
            </div>

            <div className="p-6 rounded-[1.5rem] bg-white/[0.03] border border-white/5 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <MessageSquare className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Recommended Pitch</span>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed italic">
                "{lead.message}"
              </p>
            </div>
          </div>
        </div>

        {/* Footer Detail */}
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold">
              {lead.sender[0]}
            </div>
            <div className="text-[10px]">
              <p className="text-zinc-500 font-bold uppercase tracking-tighter">Generated for</p>
              <p className="text-white font-black">{lead.company}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-zinc-500 text-[10px] font-bold">
              <Calendar className="h-3 w-3" />
              {new Date(lead.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
