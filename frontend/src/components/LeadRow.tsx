import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target, MapPin, Trash2, Phone, Globe, BrainCircuit,
  CheckCircle2, Copy, ChevronDown, ChevronUp
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
            <span className="text-xs font-semibold uppercase text-primary tracking-normal">{lead.campaign?.name || 'Legacy Sweep'}</span>
            <h3 className="text-sm font-semibold text-white truncate">{lead.business.name}</h3>
          </div>

          <div className="flex items-center gap-2 w-1/4 text-zinc-500 text-sm font-semibold uppercase tracking-normal">
             <MapPin className="h-3 w-3" /> {lead.industry || 'Unknown'}
          </div>

          <div className="flex items-center gap-4 w-1/4">
            {lead.business.phone && (
              <div className="flex items-center gap-1.5 text-zinc-400 text-sm font-semibold">
                <Phone className="h-3 w-3 text-primary" /> {lead.business.phone}
              </div>
            )}
            {lead.business.website && (
              <div className="flex items-center gap-1.5 text-zinc-400 text-sm font-semibold">
                <Globe className="h-3 w-3 text-primary" /> {lead.business.website.replace(/https?:\/\//, '').split('/')[0]}
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
                  <label className="text-sm font-semibold text-zinc-600 uppercase tracking-normal">Target Pain Point</label>
                  <p className="text-sm font-semibold leading-snug text-zinc-300">{lead.painPoint}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-600 uppercase tracking-normal">Suggested Outreach Message</label>
                  <p className="text-sm text-zinc-400 leading-relaxed font-medium italic p-4 bg-white/[0.02] border border-white/5 rounded-sm">&quot;{lead.suggestedMessage}&quot;</p>
                </div>
              </div>

              <div className="flex-1 lg:max-w-xs space-y-4">
                 <div className="p-4 rounded-sm bg-primary/5 border border-primary/10">
                   <div className="flex items-center justify-between mb-4">
                     <label className="text-sm font-semibold text-primary uppercase tracking-normal">Match Confidence</label>
                     <span className="text-sm font-semibold text-primary">High</span>
                   </div>
                   <div className="h-1.5 w-full bg-primary/10 rounded-sm overflow-hidden">
                      <div className="h-full bg-primary w-[84%]" />
                   </div>
                 </div>

                 <div className="flex flex-col gap-2">
                    <button
                      onClick={() => copyFullIntel(lead)}
                      className={`h-10 rounded-sm font-semibold text-sm uppercase tracking-normal transition-all flex items-center justify-center gap-2 ${
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
                        className="h-10 rounded-sm bg-white/[0.03] border border-white/5 text-zinc-400 text-sm font-semibold uppercase tracking-normal flex items-center justify-center hover:bg-white/10 hover:text-white transition-all"
                      >
                         Visit Website
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
