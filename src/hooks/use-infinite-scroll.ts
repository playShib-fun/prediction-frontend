/**
 * Custom hook for infinite scroll functionality
 * Provides intersection observer-based scroll detection with configurable options
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useThrottledCallback } from './use-debounce';

interface UseInfiniteScrollOptions {
  threshold?: number; // Distance from bottom to trigger load (in pixels)
  rootMargin?: string; // Root margin for intersection observer
  enabled?: boolean; // Whether infinite scroll is enabled
  hasMore?: boolean; // Whether there are more items to load
  isLoading?: boolean; // Whether currently loading
  loadingDelay?: number; // Minimum delay between load attempts (ms)
  retryDelay?: number; // Delay before retry on error (ms)
  maxRetries?: number; // Maximum number of retry attempts
  throttleMs?: number; // Throttle scroll events (ms)
}

interface UseInfiniteScrollReturn {
  // Refs
  containerRef: React.RefObject<HTMLElement | null>;
  triggerRef: React.RefObject<HTMLElement | null>;
  
  // State
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  retryCount: number;
  
  // Actions
  loadMore: () => void;
  retry: () => void;
  reset: () => void;
  
  // Utilities
  scrollToTop: () => void;
  scrollToBottom: () => void;
  getScrollProgress: () => number;
}

/**
 * Hook for implementing infinite scroll with intersection observer
 */
export function useInfiniteScroll(
  onLoadMore: () => Promise<void> | void,
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollReturn {
  const {
    threshold = 200,
    rootMargin = '0px',
    enabled = true,
    hasMore: hasMoreProp = true,
    isLoading: isLoadingProp = false,
    loadingDelay = 300,
    retryDelay = 2000,
    maxRetries = 3,
    throttleMs = 100,
  } = options;

  // Refs
  const containerRef = useRef<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // State
  const [isLoading, setIsLoading] = useState(isLoadingProp);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(hasMoreProp);
  const [retryCount, setRetryCount] = useState(0);
  const [lastLoadTime, setLastLoadTime] = useState(0);

  // Update state from props
  useEffect(() => {
    setIsLoading(isLoadingProp);
  }, [isLoadingProp]);

  useEffect(() => {
    setHasMore(hasMoreProp);
  }, [hasMoreProp]);

  // Load more function with error handling and retry logic
  const loadMore = useCallback(async () => {
    if (!enabled || isLoading || !hasMore) {
      return;
    }

    // Prevent rapid successive calls
    const now = Date.now();
    if (now - lastLoadTime < loadingDelay) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setLastLoadTime(now);

    try {
      await onLoadMore();
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load more items';
      setError(errorMessage);
      
      // Increment retry count
      setRetryCount(prev => prev + 1);
      
      console.error('Infinite scroll load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, isLoading, hasMore, onLoadMore, lastLoadTime, loadingDelay]);

  // Throttled load more to prevent excessive calls
  const { throttledCallback: throttledLoadMore } = useThrottledCallback(
    loadMore,
    throttleMs
  );

  // Retry function with exponential backoff
  const retry = useCallback(() => {
    if (retryCount >= maxRetries) {
      console.warn('Maximum retry attempts reached');
      return;
    }

    const delay = retryDelay * Math.pow(2, retryCount); // Exponential backoff
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    retryTimeoutRef.current = setTimeout(() => {
      loadMore();
    }, delay);
  }, [retryCount, maxRetries, retryDelay, loadMore]);

  // Reset function
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setRetryCount(0);
    setHasMore(true);
    
    // Clear timeouts
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
  }, []);

  // Intersection observer callback
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    
    if (entry.isIntersecting && enabled && hasMore && !isLoading && !error) {
      throttledLoadMore();
    }
  }, [enabled, hasMore, isLoading, error, throttledLoadMore]);

  // Set up intersection observer
  useEffect(() => {
    if (!enabled || !triggerRef.current) {
      return;
    }

    const trigger = triggerRef.current;
    const container = containerRef.current;

    // Create observer
    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: container,
      rootMargin,
      threshold: 0.1,
    });

    // Start observing
    observerRef.current.observe(trigger);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enabled, handleIntersection, rootMargin]);

  // Alternative scroll-based detection (fallback)
  const handleScroll = useCallback(() => {
    if (!enabled || !containerRef.current || !hasMore || isLoading || error) {
      return;
    }

    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    // Check if we're within threshold of the bottom
    if (scrollHeight - scrollTop - clientHeight <= threshold) {
      throttledLoadMore();
    }
  }, [enabled, hasMore, isLoading, error, threshold, throttledLoadMore]);

  // Set up scroll listener as fallback
  useEffect(() => {
    if (!enabled || !containerRef.current) {
      return;
    }

    const container = containerRef.current;
    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [enabled, handleScroll]);

  // Utility functions
  const scrollToTop = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, []);

  const getScrollProgress = useCallback((): number => {
    if (!containerRef.current) {
      return 0;
    }

    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    if (scrollHeight <= clientHeight) {
      return 1; // Fully scrolled if content fits in container
    }

    return Math.min(scrollTop / (scrollHeight - clientHeight), 1);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Refs
    containerRef,
    triggerRef,
    
    // State
    isLoading,
    error,
    hasMore,
    retryCount,
    
    // Actions
    loadMore,
    retry,
    reset,
    
    // Utilities
    scrollToTop,
    scrollToBottom,
    getScrollProgress,
  };
}

/**
 * Hook for paginated infinite scroll with page management
 */
export function usePaginatedInfiniteScroll<T>(
  fetchPage: (page: number) => Promise<{ data: T[]; hasMore: boolean; total?: number }>,
  options: UseInfiniteScrollOptions & {
    pageSize?: number;
    initialPage?: number;
  } = {}
): UseInfiniteScrollReturn & {
  data: T[];
  currentPage: number;
  totalItems: number | null;
  loadedItems: number;
  resetData: () => void;
  refreshData: () => void;
} {
  const { pageSize = 20, initialPage = 1, ...scrollOptions } = options;

  // State
  const [data, setData] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalItems, setTotalItems] = useState<number | null>(null);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Load more function
  const handleLoadMore = useCallback(async () => {
    if (isLoadingData || !hasMoreData) {
      return;
    }

    setIsLoadingData(true);

    try {
      const result = await fetchPage(currentPage);
      
      setData(prev => [...prev, ...result.data]);
      setCurrentPage(prev => prev + 1);
      setHasMoreData(result.hasMore);
      
      if (result.total !== undefined) {
        setTotalItems(result.total);
      }
    } catch (error) {
      console.error('Failed to fetch page:', error);
      throw error; // Re-throw to be handled by infinite scroll hook
    } finally {
      setIsLoadingData(false);
    }
  }, [currentPage, fetchPage, isLoadingData, hasMoreData]);

  // Infinite scroll hook
  const infiniteScroll = useInfiniteScroll(handleLoadMore, {
    ...scrollOptions,
    hasMore: hasMoreData,
    isLoading: isLoadingData,
  });

  // Reset data
  const resetData = useCallback(() => {
    setData([]);
    setCurrentPage(initialPage);
    setTotalItems(null);
    setHasMoreData(true);
    setIsLoadingData(false);
    infiniteScroll.reset();
  }, [initialPage, infiniteScroll]);

  // Refresh data (reload from first page)
  const refreshData = useCallback(async () => {
    resetData();
    
    // Load first page
    try {
      setIsLoadingData(true);
      const result = await fetchPage(initialPage);
      
      setData(result.data);
      setCurrentPage(initialPage + 1);
      setHasMoreData(result.hasMore);
      
      if (result.total !== undefined) {
        setTotalItems(result.total);
      }
    } catch (error) {
      console.error('Failed to refresh data:', error);
      infiniteScroll.reset();
    } finally {
      setIsLoadingData(false);
    }
  }, [fetchPage, initialPage, resetData, infiniteScroll]);

  // Load initial data
  useEffect(() => {
    if (data.length === 0 && !isLoadingData) {
      refreshData();
    }
  }, []);

  return {
    ...infiniteScroll,
    
    // Data state
    data,
    currentPage,
    totalItems,
    loadedItems: data.length,
    
    // Data actions
    resetData,
    refreshData,
    
    // Override state with paginated values
    isLoading: isLoadingData || infiniteScroll.isLoading,
    hasMore: hasMoreData,
  };
}

/**
 * Hook for virtual infinite scroll with windowing
 */
export function useVirtualInfiniteScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  onLoadMore: () => Promise<void> | void,
  options: UseInfiniteScrollOptions & {
    overscan?: number;
    estimatedItemHeight?: number;
  } = {}
): UseInfiniteScrollReturn & {
  visibleItems: Array<{ item: T; index: number; style: React.CSSProperties }>;
  totalHeight: number;
  scrollOffset: number;
  visibleRange: { start: number; end: number };
} {
  const { overscan = 5, estimatedItemHeight = itemHeight, ...scrollOptions } = options;

  const [scrollOffset] = useState(0);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollOffset / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(items.length, start + visibleCount + overscan * 2);

    return { start, end };
  }, [scrollOffset, itemHeight, containerHeight, overscan, items.length]);

  // Calculate visible items with styles
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => {
      const actualIndex = visibleRange.start + index;
      return {
        item,
        index: actualIndex,
        style: {
          position: 'absolute' as const,
          top: actualIndex * itemHeight,
          height: itemHeight,
          width: '100%',
        },
      };
    });
  }, [items, visibleRange, itemHeight]);

  // Total height for scrollbar
  const totalHeight = items.length * itemHeight;

  // Infinite scroll hook
  const infiniteScroll = useInfiniteScroll(onLoadMore, scrollOptions);

  // Override container ref to handle scroll events
  const originalContainerRef = infiniteScroll.containerRef;
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Assign to original ref which is a forwarded ref
      (originalContainerRef as unknown as { current: HTMLElement | null }).current = containerRef.current;
    }
  }, [originalContainerRef]);

  return {
    ...infiniteScroll,
    containerRef,
    
    // Virtual scroll data
    visibleItems,
    totalHeight,
    scrollOffset,
    visibleRange,
  };
}