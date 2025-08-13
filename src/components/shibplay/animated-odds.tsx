"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedOddsProps {
  value: number;
  isAnimating: boolean;
  direction: 'up' | 'down' | 'none';
  className?: string;
  position?: 'bull' | 'bear';
}

export default function AnimatedOdds({
  value,
  isAnimating,
  direction,
  className,
  position = 'bull'
}: AnimatedOddsProps) {
  // Get color classes based on animation state and position
  const getColorClasses = () => {
    const baseClasses = position === 'bull' 
      ? "bg-green-700/25 text-green-500" 
      : "bg-red-700/25 text-red-500";
    
    if (!isAnimating || direction === 'none') {
      return baseClasses;
    }

    // Highlight colors during animation
    if (direction === 'up') {
      return position === 'bull' 
        ? "bg-green-500/40 text-green-300 shadow-lg shadow-green-500/20" 
        : "bg-red-500/40 text-red-300 shadow-lg shadow-red-500/20";
    } else {
      return position === 'bull' 
        ? "bg-green-800/30 text-green-600" 
        : "bg-red-800/30 text-red-600";
    }
  };

  return (
    <motion.div
      className={cn(
        "px-2 py-1 w-full flex-1 flex items-center justify-center transition-all duration-300",
        position === 'bull' ? "rounded-l-xs" : "rounded-r-xs",
        getColorClasses(),
        className
      )}
      animate={{
        scale: isAnimating ? (direction === 'up' ? 1.05 : 0.98) : 1,
      }}
      transition={{
        duration: 0.3,
        ease: "easeOut"
      }}
    >
      <motion.p 
        className="text-lg font-bold font-mono"
        animate={{
          y: isAnimating ? (direction === 'up' ? -2 : 2) : 0,
        }}
        transition={{
          duration: 0.3,
          ease: "easeOut"
        }}
      >
        {value.toFixed(2)}x
      </motion.p>
      
      {/* Pulse effect for significant changes */}
      {isAnimating && (
        <motion.div
          className={cn(
            "absolute inset-0 rounded-inherit",
            position === 'bull' ? "bg-green-400/20" : "bg-red-400/20"
          )}
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: [0, 0.6, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      )}
    </motion.div>
  );
}