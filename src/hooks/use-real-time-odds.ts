'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { getWsClient } from '@/lib/gql-ws-client';

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
const calculateOdds = (
  bearAmount: string,
  bullAmount: string
): Omit<OddsData, 'lastUpdated'> => {
  const bear = parseFloat(bearAmount || '0') / 1e18;
  const bull = parseFloat(bullAmount || '0') / 1e18;
  const total = bear + bull;

  if (total === 0) {
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
 * Visibility detection (uguale alla tua versione, rinominata in “useVisibilityOptimizedPolling”)
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
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold, rootMargin: '50px' }
    );

    observerRef.current.observe(elementRef.current);
    return cleanup;
  }, [enabled, threshold, cleanup]);

  useEffect(() => cleanup, [cleanup]);

  return { isVisible: enabled ? isVisible : true, elementRef };
};

// ===== Sottoscrizione (live query) per il round =====
// NB: openreader supporta live-queries via WS sullo stesso path /graphql
const SUB_ROUND = /* GraphQL */ `
  subscription ($id: BigInt!) {
    rounds(where: { roundId_eq: $id }, limit: 1) {
      roundId
      bearAmount
      bullAmount
      updateTimeStamp
    }
  }
`;

/**
 * Hook realtime via WebSocket (graphql-ws)
 */
export const useRealTimeOdds = (options: UseRealTimeOddsOptions): UseRealTimeOddsReturn => {
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

  const shouldSubscribe = enabled && (enableVisibilityOptimization ? isVisible : true);

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

  // Attacca/detacha la subscription sul round
  useEffect(() => {
    if (!roundId || !shouldSubscribe) {
      // quando non attivo, rimaniamo “idle” senza error
      setIsLoading(false);
      return;
    }

    const client = getWsClient();
    if (!client) {
      setError(new Error('WebSocket client unavailable (SSR or WS not supported).'));
      return;
    }

    setIsLoading(true);
    setError(null);

    let unsub: (() => void) | null = null;
    let cancelled = false;

    unsub = client.subscribe(
      { query: SUB_ROUND, variables: { id: roundId } }, // il server accetta BigInt come string
      {
        next: (ev: any) => {
          if (cancelled) return;
          const row = ev?.data?.rounds?.[0];
          if (!row) return;

          const computed = calculateOdds(row.bearAmount ?? '0', row.bullAmount ?? '0');
          const nextOdds: OddsData = { ...computed, lastUpdated: Date.now() };

          // trigger animazione “update” breve
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
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
        },
        complete: () => {
          // opzionale: potresti settare stato qui
        },
      }
    );

    return () => {
      cancelled = true;
      try {
        unsub?.();
      } catch {}
    };
  }, [roundId, shouldSubscribe, onOddsChange]);

  // odds memo è già stateful, ma manteniamo la signature invariata
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

// (opzionale) export delle query keys se ti servono fuori
export const realTimeOddsQueryKeys = {
  all: ['realTimeOdds'] as const,
  round: (roundId: string) => ['realTimeOdds', roundId] as const,
};
