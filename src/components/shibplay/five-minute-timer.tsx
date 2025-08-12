"use client";

import { useEffect, useRef, useState } from "react";
import { RiTimeFill } from "@remixicon/react";

function formatSecondsToMMSS(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function FiveMinuteTimer() {
  const DURATION_SECONDS = 5 * 60; // 5 minutes
  const [secondsLeft, setSecondsLeft] = useState<number>(DURATION_SECONDS);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          return DURATION_SECONDS; // reset
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div
      className="flex items-center gap-2 text-blue-500 drop-shadow-[0_0_12px_rgba(59,130,246,0.85)]"
      aria-label="5 minute timer"
      title="5 minute timer"
    >
      <RiTimeFill className="w-5 h-5" />
      <span className="tabular-nums font-semibold tracking-wide">{formatSecondsToMMSS(secondsLeft)}</span>
    </div>
  );
}


