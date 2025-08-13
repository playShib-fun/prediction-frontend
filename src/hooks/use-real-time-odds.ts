import { useQuery } from "@tanstack/react-query";
import { predictionApi } from "@/lib/graphql-queries";
import { useMemo, useRef, useEffect, useState, useCallback } from "react";

// Types for the hook
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

// Odds calculation function
const calculateOdds = (bearAmount: string, bullAmount: string): Omit<OddsData, 'lastUpdated'> => {
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

// Static odds calculation fallback using existing round data
const calculateStaticOdds = (): OddsData => {
  // This is a fallback that returns default odds when real-time polling fails
  // In a real implementation, this could fetch from a cache or use existing round data
  return {
    bullOdds: 1.0,
    bearOdds: 1.0,
    totalPool: 0,
    lastUpdated: Date.now(),
  };
};

/**
 * Hook for visibility-based polling optimization using Intersection Observer
 * Detects when the component is visible in the viewport
 */
export const useVisibilityOptimizedPolling = (
  options: UseVisibilityOptimizedPollingOptions
): UseVisibilityOptimizedPollingReturn => {
  const { enabled, threshold = 0.1 } = options;
  const [isVisible, setIsVisible] = useState(true); // Default to visible for SSR
  const elementRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, []);

  useEffect(() => {
    // If not enabled, always consider visible
    if (!enabled) {
      setIsVisible(true);
      return;
    }

    // If no element to observe, consider visible
    if (!elementRef.current) {
      setIsVisible(true);
      return;
    }

    // Check if IntersectionObserver is supported
    if (typeof IntersectionObserver === 'undefined') {
      // Fallback for browsers without IntersectionObserver support
      setIsVisible(true);
      return;
    }

    // Create intersection observer
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold,
        // Add some margin to start loading slightly before element is visible
        rootMargin: '50px',
      }
    );

    // Start observing
    observerRef.current.observe(elementRef.current);

    // Cleanup on unmount or dependency change
    return cleanup;
  }, [enabled, threshold, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    isVisible: enabled ? isVisible : true,
    elementRef,
  };
};

// Query key factory
const realTimeOddsQueryKeys = {
  all: ["realTimeOdds"] as const,
  round: (roundId: string) => [...realTimeOddsQueryKeys.all, roundId] as const,
};

/**
 * Hook for real-time odds calculation with 15-second polling
 * Only polls when enabled (for upcoming rounds) and optionally when visible
 */
export const useRealTimeOdds = (options: UseRealTimeOddsOptions): UseRealTimeOddsReturn => {
  const { 
    roundId, 
    enabled, 
    onOddsChange,
    enableVisibilityOptimization = true,
    visibilityThreshold = 0.1
  } = options;

  // Use visibility optimization hook
  const { isVisible, elementRef } = useVisibilityOptimizedPolling({
    enabled: enableVisibilityOptimization && enabled,
    threshold: visibilityThreshold,
  });

  // Determine if polling should be active
  const shouldPoll = enabled && (enableVisibilityOptimization ? isVisible : true);

  // Query for real-time round data with polling
  const {
    data: roundsData,
    isLoading,
    error,
    isRefetching,
  } = useQuery({
    queryKey: realTimeOddsQueryKeys.round(roundId),
    queryFn: predictionApi.getAllRounds,
    select: (data) => {
      // Find the specific round we're interested in
      const targetRound = data.find(round => round.roundId === roundId);
      return targetRound;
    },
    refetchInterval: shouldPoll ? 15000 : false, // 15-second polling when should poll
    refetchIntervalInBackground: false,
    staleTime: 10000, // Consider data stale after 10 seconds
    enabled: shouldPoll && !!roundId,
    retry: (failureCount) => {
      // Retry up to 3 times with exponential backoff
      if (failureCount >= 3) return false;
      return true;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Calculate odds from the round data
  const odds = useMemo((): OddsData => {
    if (!roundsData) {
      // Fallback to static calculation when no data is available
      return calculateStaticOdds();
    }

    const calculatedOdds = calculateOdds(
      roundsData.bearAmount || '0',
      roundsData.bullAmount || '0'
    );

    return {
      ...calculatedOdds,
      lastUpdated: Date.now(),
    };
  }, [roundsData, roundId]);

  // Track previous odds for change detection
  const previousOddsRef = useRef<OddsData>(odds);
  
  // Call onChange callback when odds change
  useEffect(() => {
    const previousOdds = previousOddsRef.current;
    const hasChanged = 
      previousOdds.bullOdds !== odds.bullOdds ||
      previousOdds.bearOdds !== odds.bearOdds ||
      previousOdds.totalPool !== odds.totalPool;

    if (onOddsChange && hasChanged) {
      onOddsChange(odds, previousOdds);
    }

    // Update the ref with current odds
    previousOddsRef.current = odds;
  }, [odds, onOddsChange]);

  return {
    odds,
    isLoading: isLoading && shouldPoll,
    error: error as Error | null,
    isAnimating: isRefetching && shouldPoll,
    elementRef,
    isVisible,
  };
};

// Export query keys for external use
export { realTimeOddsQueryKeys };