"use client";

import { Sparkles } from "lucide-react";

interface MarqueeItem {
  image: string;
  label: string;
}

const ITEMS: MarqueeItem[] = [
  {
    image: "/media__1781032543415.jpg",
    label: "Forbes 30 Under 30"
  },
  {
    image: "/media__1781032543445.jpg",
    label: "B2B Engage Summit"
  },
  {
    image: "/media__1781033675597.jpg",
    label: "Creators Summit & Panel"
  },
  {
    image: "/media__1781033982308.jpg",
    label: "WWD Beauty CEO Roundtable"
  }
];

export default function SocialImageMarquee() {
  // Duplicate items array to make the loop seamless
  const duplicatedItems = [...ITEMS, ...ITEMS, ...ITEMS];

  return (
    <div className="w-full relative z-20 overflow-hidden py-10 select-none">
      {/* CSS Styles injection for self-contained infinite scroll */}
      <style jsx global>{`
        @keyframes marquee-horizontal {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-100% / 3));
          }
        }
        .marquee-container {
          display: flex;
          width: max-content;
          animation: marquee-horizontal 35s linear infinite;
        }
        .marquee-container:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Premium Screen Edge Fading Gradients (Left and Right glass fade) */}
      <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-[#030504] to-transparent z-30 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-[#030504] to-transparent z-30 pointer-events-none" />

      {/* Marquee Row */}
      <div className="marquee-container gap-6 flex">
        {duplicatedItems.map((item, idx) => (
          <div 
            key={idx}
            className="w-[280px] md:w-[380px] aspect-[16/10] shrink-0 rounded-3xl overflow-hidden border border-white/10 relative group shadow-2xl cursor-pointer bg-card/10"
          >
            {/* Image */}
            <img 
              src={item.image} 
              alt={item.label}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            
            {/* Bottom Dark Gradient Shadow */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

            {/* Premium tag label */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 p-2 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md">
              <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 shrink-0">
                <Sparkles className="h-3 w-3 text-primary" />
              </div>
              <p className="text-[10px] md:text-xs font-black uppercase tracking-wider text-primary truncate">
                {item.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
