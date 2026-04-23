"use client";

import { motion } from "framer-motion";

export function Sparkline({ color = "#3b82f6" }: { color?: string }) {
  // Mock data points
  const points = [10, 40, 30, 70, 50, 90, 80, 100];
  const step = 100 / (points.length - 1);
  const pathData = points.map((p, i) => `${i * step},${100 - p}`).join(" L ");

  return (
    <div className="h-10 w-24">
      <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
        <motion.path
          d={`M ${pathData}`}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        {/* Glow effect */}
        <motion.path
          d={`M ${pathData}`}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="blur-sm opacity-30"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}
