"use client";

import { useEffect } from "react";
import { useMotionValue, useSpring, motion, useTransform, animate } from "framer-motion";

interface CounterProps {
  value: number;
  className?: string;
}

export function AnimatedNumber({ value, className }: CounterProps) {
  const count = useMotionValue(value);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString());

  useEffect(() => {
    console.log(`[AnimatedNumber] Target Value Update: ${value}`);
    const controls = animate(count, value, {
      duration: 1, // 1 second rolling animation
      ease: "easeOut"
    });
    return controls.stop;
  }, [value, count]);

  return (
    <motion.span className={className}>
      {rounded}
    </motion.span>
  );
}
