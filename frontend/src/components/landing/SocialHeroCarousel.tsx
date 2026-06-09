"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageSquare, Send, Share2, Sparkles, Users, Award, Zap, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";

interface SocialPost {
  image: string;
  tabLabel: string;
  author: string;
  role: string;
  avatarBg: string;
  postText: string;
  likes: string;
  metrics: string;
  comment: {
    author: string;
    text: string;
    avatarBg: string;
  };
}

const SOCIAL_POSTS: SocialPost[] = [
  {
    image: "/media__1781032543415.jpg",
    tabLabel: "Founder Feature",
    author: "Hailey Bieber",
    role: "Founder & Creative Director",
    avatarBg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    postText: "Honored to be featured on Forbes 30 Under 30! Scaling a brand starts with identifying high-intent partnerships and personalizing every single conversation.",
    likes: "1.2k",
    metrics: "+42% outbound reply rate",
    comment: {
      author: "Elena R.",
      text: "Love this! Automated our Rhode campaigns and reply rates went through the roof. 🚀",
      avatarBg: "bg-blue-500/20 text-blue-400 border-blue-500/30"
    }
  },
  {
    image: "/media__1781032543445.jpg",
    tabLabel: "Engage Panel",
    author: "B2B Engage Summit",
    role: "Official Event Channel",
    avatarBg: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    postText: "Live from the main stage at ENGAGE Business Day! Discussing how autonomous pipelines are unlocking infinite pipeline potential with zero manual friction.",
    likes: "842",
    metrics: "148 leads verified live",
    comment: {
      author: "Jameson Reed",
      text: "Outreach scripts personalized based on panel topics got us 8 qualified meetings today!",
      avatarBg: "bg-amber-500/20 text-amber-400 border-amber-500/30"
    }
  },
  {
    image: "/media__1781033675597.jpg",
    tabLabel: "Creator Summit",
    author: "BBR Creators Summit",
    role: "Creator Network Admin",
    avatarBg: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    postText: "Building relationship-first networks at the Creators Summit. Real social connection combined with high-performance AI outreach is the new standard.",
    likes: "956",
    metrics: "214 creators connected",
    comment: {
      author: "Sarah Chen",
      text: "The localized maps search found all creative agencies attending within minutes.",
      avatarBg: "bg-teal-500/20 text-teal-400 border-teal-500/30"
    }
  },
  {
    image: "/media__1781033982308.jpg",
    tabLabel: "CEO Insights",
    author: "WWD Beauty CEO Summit",
    role: "Executive Roundtable",
    avatarBg: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    postText: "Insights on strategic growth. Modern executive networks don't rely on cold spam—they build curated, automated outreach that respects the prospect.",
    likes: "612",
    metrics: "12 Enterprise deals queued",
    comment: {
      author: "Michael R.",
      text: "Exactly. The self-driving lead engine model turns cold outbound into warm discovery.",
      avatarBg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    }
  }
];

const FLOATING_ACTIVITIES = [
  { id: 1, text: "👥 Sarah shared Rhode campaign with Growth Workspace", delay: 0 },
  { id: 2, text: "🔥 Jameson closed a lead from Engage Summit", delay: 3 },
  { id: 3, text: "⚡ AI enriched 18 leads for Stellar Outbound", delay: 1.5 },
  { id: 4, text: "🎯 84% reply accuracy reported by Beauty CEO hub", delay: 4.5 }
];

export default function SocialHeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeActivities, setActiveActivities] = useState<typeof FLOATING_ACTIVITIES>([]);

  // Automatic looping every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SOCIAL_POSTS.length);
    }, 5500);
    return () => clearInterval(interval);
  }, []);

  // Float visual highlights
  useEffect(() => {
    setActiveActivities(FLOATING_ACTIVITIES);
  }, []);

  const currentPost = SOCIAL_POSTS[activeIndex];

  return (
    <div className="w-full flex flex-col items-center gap-8 relative z-20">
      {/* Floating social activities to show active workspace collaboration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-30 hidden lg:block">
        {activeActivities.map((act) => (
          <motion.div
            key={act.id}
            initial={{ opacity: 0, x: act.id % 2 === 0 ? 50 : -50, y: 40 * act.id }}
            animate={{
              opacity: [0, 0.9, 0.9, 0],
              y: [40 * act.id + 10, 40 * act.id - 30],
              x: act.id % 2 === 0 ? [50, 30] : [-50, -30]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              delay: act.delay,
              ease: "easeInOut"
            }}
            className="absolute p-3 rounded-2xl bg-card/75 border border-card-border backdrop-blur-md flex items-center gap-2.5 shadow-lg shadow-black/10"
            style={{
              right: act.id % 2 === 0 ? "2%" : "auto",
              left: act.id % 2 !== 0 ? "2%" : "auto",
              top: `${15 + act.id * 18}%`
            }}
          >
            <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
            <span className="text-[11px] font-bold text-foreground/80 tracking-wide">{act.text}</span>
          </motion.div>
        ))}
      </div>

      {/* Main Glassmorphic Showcase Container */}
      <div className="w-full max-w-4xl mx-auto rounded-[32px] bg-card/30 border border-card-border backdrop-blur-xl p-4 md:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle decorative mesh inside card */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />

        {/* Carousel Headers/Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6 border-b border-card-border pb-4 relative z-10">
          {SOCIAL_POSTS.map((post, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                idx === activeIndex
                  ? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.04]"
                  : "bg-white/5 text-foreground/60 hover:bg-white/10 hover:text-foreground"
              }`}
            >
              {idx === 0 && <Award className="h-3.5 w-3.5" />}
              {idx === 1 && <Users className="h-3.5 w-3.5" />}
              {idx === 2 && <Zap className="h-3.5 w-3.5" />}
              {idx === 3 && <CheckCircle2 className="h-3.5 w-3.5" />}
              {post.tabLabel}
            </button>
          ))}
        </div>

        {/* Main Display Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative z-10">
          
          {/* Left Side: Custom Social Post Component */}
          <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl bg-card/60 border border-card-border p-5 md:p-6 shadow-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="space-y-5 flex flex-col justify-between h-full"
              >
                {/* Author Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full border flex items-center justify-center font-bold text-sm shrink-0 ${currentPost.avatarBg}`}>
                      {currentPost.author[0]}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-foreground flex items-center gap-1.5">
                        {currentPost.author}
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary fill-primary/10" />
                      </h4>
                      <p className="text-[10px] text-foreground/50 font-bold">{currentPost.role}</p>
                    </div>
                  </div>
                  
                  {/* Performance metric badge */}
                  <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-wider">
                    {currentPost.metrics}
                  </div>
                </div>

                {/* Social Post Content */}
                <p className="text-xs md:text-sm font-semibold text-foreground/85 leading-relaxed italic">
                  "{currentPost.postText}"
                </p>

                {/* Quick Social Actions Bar */}
                <div className="flex items-center justify-between border-y border-card-border py-3 text-foreground/60 text-xs font-bold">
                  <span className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer select-none">
                    <Heart className="h-4 w-4 text-rose-500 fill-rose-500" /> {currentPost.likes}
                  </span>
                  <span className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer select-none">
                    <MessageSquare className="h-4 w-4" /> Comment
                  </span>
                  <span className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer select-none">
                    <Send className="h-4 w-4" /> Outreach
                  </span>
                  <span className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer select-none">
                    <Share2 className="h-4 w-4" /> Share
                  </span>
                </div>

                {/* Comment Section (Social proof / Collaborative feed) */}
                <div className="p-3.5 rounded-xl bg-foreground/[0.02] border border-card-border/60 space-y-1.5 mt-2">
                  <div className="flex items-center gap-2">
                    <div className={`h-6 w-6 rounded-full border flex items-center justify-center font-extrabold text-[9px] shrink-0 ${currentPost.comment.avatarBg}`}>
                      {currentPost.comment.author[0]}
                    </div>
                    <span className="text-[10px] font-black text-foreground">{currentPost.comment.author}</span>
                    <span className="text-[9px] text-foreground/40 font-bold">• Team Member</span>
                  </div>
                  <p className="text-[11px] text-foreground/75 font-semibold pl-8 leading-relaxed">
                    {currentPost.comment.text}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Side: Visual display of the Image inside a premium crop */}
          <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-full rounded-2xl overflow-hidden border border-card-border bg-black/10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.04 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="absolute inset-0 w-full h-full"
              >
                <img
                  src={currentPost.image}
                  alt={currentPost.tabLabel}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                
                {/* Visual indicator of events/social summit validation */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 p-2 rounded-xl bg-black/50 border border-white/10 backdrop-blur-md">
                  <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 shrink-0">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-wider text-primary">Live Lead Opportunity</p>
                    <p className="text-[10px] font-bold text-white truncate">{currentPost.author} Outreach</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
