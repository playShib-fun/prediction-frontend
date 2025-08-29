"use client";

import { Clock, TowerControl, ChevronLeft, ChevronRight } from "lucide-react";
import { useRoundTimerStore,useCarouselNavStore } from "@/stores";
import { useMemo } from "react";
import { motion } from "framer-motion";

export default function Subheader() {
  const { progressPct, timeLeftMs } = useRoundTimerStore();
  const { isReady, scrollPrev, scrollNext } = useCarouselNavStore();

  const display = useMemo(() => {
    if (timeLeftMs <= 0) return "Calculating…";
    const minutes = Math.floor(timeLeftMs / 60000);
    const seconds = Math.floor((timeLeftMs % 60000) / 1000)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [timeLeftMs]);

  if (timeLeftMs <= 0) return null;

  return (
    <motion.header
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.15, ease: "easeInOut" }}
      className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-[92%] md:w-auto max-w-[720px]"
    >
      <div className="flex items-center gap-2">
        <button
          aria-label="Previous round"
          className="hidden md:inline-flex items-center justify-center w-9 h-9 rounded-md bg-white/10 hover:bg-white/20 transition cursor-pointer disabled:opacity-40"
          onClick={() => scrollPrev()}
          disabled={!isReady}
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>

      <div className="pointer-events-auto rounded-md border border-white/10 bg-black/40 backdrop-blur-md shadow-lg px-3 py-2 md:px-4 md:py-3 text-white/90">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-sm bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <TowerControl className="w-4 h-4" />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <div className="flex items-center gap-2 text-sm md:text-base font-semibold tracking-wide">
              <span className="truncate">Next Round</span>
              <span className="opacity-70">•</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-4 h-4 opacity-80" />
                {timeLeftMs <= 0 ? "Starting..." : display}
              </span>
            </div>
            <div className="h-1 bg-white/15 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-emerald-400"
                style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <button
          aria-label="Next round"
          className="hidden md:inline-flex items-center justify-center w-9 h-9 rounded-md bg-white/10 hover:bg-white/20 transition cursor-pointer disabled:opacity-40"
          onClick={() => scrollNext()}
          disabled={!isReady}
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>
    </motion.header>
  );
}
