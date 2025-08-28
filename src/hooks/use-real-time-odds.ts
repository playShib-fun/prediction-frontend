"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { getWsClient } from "@/lib/gql-ws-client";

// ===== Tipi che già esporti =====
export interface OddsData {
  bullOdds: number;
  bearOdds: number;
  totalPool: number;
  lastUpdated: number;
}

export interface UseRealTimeOddsOptions {
  roundId: string;
  enabled: boolean; // Only for upcoming rounds
  onOddsChange?: (newOdds: OddsData, previousOdds: OddsData) => void;
  enableVisibilityOptimization?: boolean; // Enable visibility-based polling optimization
  visibilityThreshold?: number; // Intersection observer threshold
}

export interface UseVisibilityOptimizedPollingOptions {
  enabled: boolean;
  threshold?: number;
}

export interface UseVisibilityOptimizedPollingReturn {
  isVisible: boolean;
  elementRef: React.RefObject<HTMLElement | null>;
}

export interface UseRealTimeOddsReturn {
  odds: OddsData;
  isLoading: boolean;
  error: Error | null;
  isAnimating: boolean;
  elementRef: React.RefObject<HTMLElement | null>; // Ref for visibility detection
  isVisible: boolean; // Current visibility state
}

// ===== Util =====
const fromWei = (val?: string | number | bigint) => {
  if (val === undefined || val === null) return 0;
  if (typeof val === "bigint") return Number(val) / 1e18; // wei -> BONE
  if (typeof val === "number") return val / 1e18;
  const s = String(val).trim();
  if (s === "") return 0;
  if (/^\d+$/.test(s)) return Number(BigInt(s)) / 1e18; // wei -> BONE
  // fallback
  return parseFloat(s) || 0;
};

const calculateOdds = (
  bearAmount: string,
  bullAmount: string,
  pricePool?: string
): Omit<OddsData, "lastUpdated"> => {
  const bear = fromWei(bearAmount);
  const bull = fromWei(bullAmount);
  const total = pricePool != null ? fromWei(pricePool) : bear + bull;

  if (total <= 0) {
    return { bullOdds: 1.0, bearOdds: 1.0, totalPool: 0 };
  }

  const bullOdds = bull === 0 ? 1.0 : total / bull;
  const bearOdds = bear === 0 ? 1.0 : total / bear;

  return { bullOdds, bearOdds, totalPool: total };
};

const calculateStaticOdds = (): OddsData => ({
  bullOdds: 1.0,
  bearOdds: 1.0,
  totalPool: 0,
  lastUpdated: Date.now(),
});

/**
 * Visibility detection
 */
export const useVisibilityOptimizedPolling = (
  options: UseVisibilityOptimizedPollingOptions
): UseVisibilityOptimizedPollingReturn => {
  const { enabled, threshold = 0.1 } = options;
  const [isVisible, setIsVisible] = useState(true); // default visible per SSR
  const elementRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const cleanup = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setIsVisible(true);
      return;
    }
    if (!elementRef.current) {
      setIsVisible(true);
      return;
    }
    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold, rootMargin: "50px" }
    );

    observerRef.current.observe(elementRef.current);
    return cleanup;
  }, [enabled, threshold, cleanup]);

  useEffect(() => cleanup, [cleanup]);

  return { isVisible: enabled ? isVisible : true, elementRef };
};

// ===== Subscription (live query) per round =====
const SUB_ROUND = /* GraphQL */ `
  subscription ($id: BigInt!) {
    rounds(where: { roundId_eq: $id }, limit: 1) {
      roundId
      bearAmount
      bullAmount
      pricePool
      updateTimeStamp
    }
  }
`;

/**
 * Hook realtime via WebSocket (graphql-ws)
 */
export const useRealTimeOdds = (
  options: UseRealTimeOddsOptions
): UseRealTimeOddsReturn => {
  const {
    roundId,
    enabled,
    onOddsChange,
    enableVisibilityOptimization = true,
    visibilityThreshold = 0.1,
  } = options;

  // vis-based “pause”
  const { isVisible, elementRef } = useVisibilityOptimizedPolling({
    enabled: enableVisibilityOptimization && enabled,
    threshold: visibilityThreshold,
  });

  const shouldSubscribe =
    enabled && (enableVisibilityOptimization ? isVisible : true);

  const [odds, setOdds] = useState<OddsData>(calculateStaticOdds());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const previousOddsRef = useRef<OddsData>(odds);
  const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // cleanup anim
  useEffect(() => {
    return () => {
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
    };
  }, []);

  // Attach/detach the subscription for the round
  useEffect(() => {
    if (!roundId || !shouldSubscribe) {
      setIsLoading(false);
      return;
    }

    const client = getWsClient();
    if (!client) {
      setError(
        new Error("WebSocket client unavailable (SSR or WS not supported).")
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    let unsub: (() => void) | null = null;
    let cancelled = false;

    unsub = client.subscribe(
      { query: SUB_ROUND, variables: { id: roundId } },
      {
        next: (ev: any) => {
          if (cancelled) return;
          const row = ev?.data?.rounds?.[0];
          console.log("RT raw:", row);
          console.log("RT parsed total:", fromWei(row?.pricePool));

          if (!row) return;

          const computed = calculateOdds(
            row.bearAmount ?? "0",
            row.bullAmount ?? "0",
            row.pricePool ?? undefined
          );

          const nextOdds: OddsData = { ...computed, lastUpdated: Date.now() };

          setIsAnimating(true);
          if (animTimerRef.current) clearTimeout(animTimerRef.current);
          animTimerRef.current = setTimeout(() => setIsAnimating(false), 400);

          setOdds(nextOdds);
          setIsLoading(false);

          const prev = previousOddsRef.current;
          const changed =
            prev.bullOdds !== nextOdds.bullOdds ||
            prev.bearOdds !== nextOdds.bearOdds ||
            prev.totalPool !== nextOdds.totalPool;

          if (onOddsChange && changed) {
            onOddsChange(nextOdds, prev);
          }
          previousOddsRef.current = nextOdds;
        },
        error: (err) => {
          if (cancelled) return;
          console.error("Real-time odds error:", err);
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
        },
        complete: () => {
          // optional
        },
      }
    );

    return () => {
      cancelled = true;
      try {
        unsub?.();
      } catch {}
    };
  }, [roundId, shouldSubscribe]);

  // odds memo is already stateful, but we keep the signature unchanged
  const stableOdds = useMemo(() => odds, [odds]);

  return {
    odds: stableOdds,
    isLoading,
    error,
    isAnimating,
    elementRef,
    isVisible,
  };
};

// (optional) Query keys for react-query or similar
export const realTimeOddsQueryKeys = {
  all: ["realTimeOdds"] as const,
  round: (roundId: string) => ["realTimeOdds", roundId] as const,
};
