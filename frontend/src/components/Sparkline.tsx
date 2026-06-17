"use client";

import { motion } from "framer-motion";

export function Sparkline({ color = "#3b82f6", points }: { color?: string; points?: number[] }) {
  let pointsToUse = points || [10, 40, 30, 70, 50, 90, 80, 100];
  if (pointsToUse.length < 2) {
    pointsToUse = [pointsToUse[0] || 0, pointsToUse[0] || 0];
  }
  const max = Math.max(...pointsToUse);
  const min = Math.min(...pointsToUse);
  const range = max - min;

  const step = 100 / (pointsToUse.length - 1);
  const pathData = pointsToUse.map((p, i) => {
    const x = i * step;
    let y;
    if (range === 0) {
      y = p === 0 ? 90 : 50;
    } else {
      y = 90 - ((p - min) / range) * 80;
    }
    return `${x},${y}`;
  }).join(" L ");

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
