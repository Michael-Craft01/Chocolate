import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target, MapPin, Trash2, Phone, Globe, BrainCircuit,
  CheckCircle2, Copy, ChevronDown, ChevronUp, MessageCircle, ExternalLink, Zap
} from "lucide-react";

export function LeadRow({ lead, idx, handleDelete, copyFullIntel, copiedId }: any) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.05 }}
      className="glass-card rounded-sm border border-white/5 transition-all duration-300 bg-background hover:border-primary/20"
    >
      {/* Compact Row View */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-6 flex-1">
          <div className="flex flex-col gap-1 w-1/4">
            <span className="text-[10px] font-black uppercase text-primary tracking-widest">{lead.campaign?.name || 'Legacy Sweep'}</span>
            <h3 className="text-sm font-bold text-white truncate">{lead.business.name}</h3>
          </div>

          <div className="flex items-center gap-2 w-1/4 text-zinc-500 text-[11px] font-black uppercase tracking-widest">
             <MapPin className="h-3 w-3" /> {lead.industry || 'Unknown'}
          </div>

          <div className="flex items-center gap-4 w-1/4">
            {lead.business.phone && (
              <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-bold">
                <Phone className="h-3 w-3 text-primary/50" /> {lead.business.phone}
              </div>
            )}
            {lead.business.website && (
              <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-bold">
                <Globe className="h-3 w-3 text-primary/50" /> {lead.business.website.replace(/https?:\/\//, '').split('/')[0]}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
           <button
             onClick={(e) => { e.stopPropagation(); handleDelete(lead.id); }}
             className="h-8 w-8 rounded-sm bg-white/5 hover:bg-red-500/10 flex items-center justify-center text-zinc-600 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
           >
             <Trash2 className="h-4 w-4" />
           </button>
           <div className="h-8 w-8 flex items-center justify-center text-zinc-500">
             {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
           </div>
        </div>
      </div>

      {/* Expanded Accordion Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/5"
          >
            <div className="p-6 flex flex-col lg:flex-row gap-8 bg-black/20">

              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Target Pain Point</label>
                  <p className="text-[13px] font-bold leading-snug text-zinc-300">{lead.painPoint}</p>
                </div>

                <div className="space-y-2 group">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Suggested Outreach Message</label>
                    <span className="text-[9px] font-black text-primary/40 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">AI Generated</span>
                  </div>
                  <div className="relative">
                    <p className="text-[12px] text-zinc-400 leading-relaxed font-medium italic p-5 bg-white/[0.02] border border-white/5 rounded-sm shadow-inner">
                      "{lead.suggestedMessage}"
                    </p>
                    <div className="absolute -left-1 top-4 h-8 w-1 bg-primary/20 rounded-full" />
                  </div>
                </div>
              </div>

              <div className="flex-1 lg:max-w-xs space-y-4">
                 <div className="p-4 rounded-sm bg-primary/5 border border-primary/10 relative overflow-hidden group/score">
                   <div className="flex items-center justify-between mb-4">
                     <div className="flex flex-col gap-0.5">
                       <label className="text-[10px] font-black text-primary uppercase tracking-widest">Match Confidence</label>
                       <span className="text-[9px] text-primary/40 font-black uppercase tracking-tighter">AI Verification Logic</span>
                     </div>
                     <div className="flex flex-col items-end">
                        <span className="text-xl font-black text-primary leading-none tracking-tighter">{(lead.score || 8.5).toFixed(1)}</span>
                        <span className="text-[8px] font-black text-primary/30 uppercase tracking-widest">Score</span>
                     </div>
                   </div>
                   <div className="h-1.5 w-full bg-primary/10 rounded-sm overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(lead.score || 8.5) * 10}%` }}
                        className="h-full bg-primary" 
                      />
                   </div>
                   <div className="absolute -right-2 -bottom-2 opacity-[0.03] text-primary group-hover/score:scale-110 transition-transform">
                      <Zap size={48} />
                   </div>
                 </div>

                  <div className="flex flex-col gap-2">
                    {lead.business.phone && (
                      <a
                        href={`https://wa.me/${lead.business.phone.replace(/\D/g, '')}?text=${encodeURIComponent(lead.suggestedMessage)}`}
                        target="_blank"
                        className="h-10 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center justify-center hover:bg-emerald-500/20 transition-all gap-2 group/wa"
                      >
                         <MessageCircle className="h-3.5 w-3.5 transition-transform group-hover/wa:scale-110" />
                         Chat on WhatsApp
                      </a>
                    )}
                    <button
                      onClick={() => copyFullIntel(lead)}
                      className={`h-10 rounded-sm font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                        copiedId === lead.id ? "bg-emerald-500 text-white" : "bg-white text-black hover:bg-zinc-200"
                      }`}
                    >
                      {copiedId === lead.id ? <CheckCircle2 className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copiedId === lead.id ? "Copied" : "Copy Insights"}
                    </button>
                    {lead.business.website && (
                      <a
                        href={lead.business.website}
                        target="_blank"
                        className="h-10 rounded-sm bg-white/[0.03] border border-white/5 text-zinc-400 text-[10px] font-black uppercase tracking-widest flex items-center justify-center hover:bg-white/10 hover:text-white transition-all gap-2"
                      >
                         Visit Website
                         <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                 </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
