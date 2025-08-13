/**
 * Custom debounce hooks for performance optimization
 * Provides generic debouncing with configurable delay and cleanup logic
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Generic debounce hook that delays updating a value until after a specified delay
 * Prevents memory leaks with proper cleanup
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up the timeout to update the debounced value
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function to clear the timeout
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Debounced callback hook that delays function execution
 * Useful for expensive operations like API calls or complex calculations
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): {
  debouncedCallback: (...args: Parameters<T>) => void;
  cancel: () => void;
  flush: () => void;
  isPending: boolean;
} {
  const [isPending, setIsPending] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);
  const argsRef = useRef<Parameters<T> | null>(null);

  // Update callback ref when dependencies change
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback, ...deps]);

  // Cancel pending execution
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      setIsPending(false);
      argsRef.current = null;
    }
  }, []);

  // Execute immediately (flush pending execution)
  const flush = useCallback(() => {
    if (timeoutRef.current && argsRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      setIsPending(false);
      callbackRef.current(...argsRef.current);
      argsRef.current = null;
    }
  }, []);

  // Debounced callback function
  const debouncedCallback = useCallback((...args: Parameters<T>) => {
    // Cancel any pending execution
    cancel();
    
    // Store the arguments for potential flush
    argsRef.current = args;
    setIsPending(true);

    // Set up new timeout
    timeoutRef.current = setTimeout(() => {
      setIsPending(false);
      callbackRef.current(...args);
      argsRef.current = null;
      timeoutRef.current = null;
    }, delay);
  }, [delay, cancel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    debouncedCallback,
    cancel,
    flush,
    isPending,
  };
}

/**
 * Debounced state hook that combines state management with debouncing
 * Useful for form inputs and search fields
 */
export function useDebouncedState<T>(
  initialValue: T,
  delay: number
): {
  value: T;
  debouncedValue: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  setValueImmediate: (value: T | ((prev: T) => T)) => void;
  isPending: boolean;
  cancel: () => void;
  flush: () => void;
} {
  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);
  const [isPending, setIsPending] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cancel pending update
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      setIsPending(false);
    }
  }, []);

  // Flush pending update immediately
  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      setIsPending(false);
      setDebouncedValue(value);
    }
  }, [value]);

  // Set value immediately (bypasses debouncing)
  const setValueImmediate = useCallback((newValue: T | ((prev: T) => T)) => {
    cancel();
    const resolvedValue = typeof newValue === 'function' 
      ? (newValue as (prev: T) => T)(value)
      : newValue;
    setValue(resolvedValue);
    setDebouncedValue(resolvedValue);
  }, [value, cancel]);

  // Update debounced value when value changes
  useEffect(() => {
    cancel();
    setIsPending(true);

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
      setIsPending(false);
      timeoutRef.current = null;
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, cancel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    value,
    debouncedValue,
    setValue,
    setValueImmediate,
    isPending,
    cancel,
    flush,
  };
}

/**
 * Debounced effect hook that delays effect execution
 * Useful for expensive side effects that should only run after user stops interacting
 */
export function useDebouncedEffect(
  effect: () => void | (() => void),
  deps: React.DependencyList,
  delay: number
): {
  cancel: () => void;
  flush: () => void;
  isPending: boolean;
} {
  const [isPending, setIsPending] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupRef = useRef<(() => void) | void>(undefined);

  // Cancel pending effect
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      setIsPending(false);
    }
    
    // Run cleanup if exists
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = undefined;
    }
  }, []);

  // Execute effect immediately
  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      setIsPending(false);
      
      // Run cleanup first
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      
      // Execute effect
      cleanupRef.current = effect();
    }
  }, [effect]);

  // Set up debounced effect
  useEffect(() => {
    cancel();
    setIsPending(true);

    timeoutRef.current = setTimeout(() => {
      setIsPending(false);
      cleanupRef.current = effect();
      timeoutRef.current = null;
    }, delay);

    return () => {
      cancel();
    };
  }, [...deps, delay]);

  return {
    cancel,
    flush,
    isPending,
  };
}

/**
 * Throttled callback hook that limits function execution frequency
 * Useful for scroll events and rapid user interactions
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  limit: number,
  deps: React.DependencyList = []
): {
  throttledCallback: (...args: Parameters<T>) => void;
  cancel: () => void;
  flush: () => void;
  isThrottled: boolean;
} {
  const [isThrottled, setIsThrottled] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);
  const lastArgsRef = useRef<Parameters<T> | null>(null);
  const lastCallTimeRef = useRef<number>(0);

  // Update callback ref when dependencies change
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback, ...deps]);

  // Cancel throttling
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      setIsThrottled(false);
      lastArgsRef.current = null;
    }
  }, []);

  // Execute immediately with last arguments
  const flush = useCallback(() => {
    if (lastArgsRef.current) {
      callbackRef.current(...lastArgsRef.current);
      lastCallTimeRef.current = Date.now();
      lastArgsRef.current = null;
    }
    cancel();
  }, [cancel]);

  // Throttled callback function
  const throttledCallback = useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTimeRef.current;

    lastArgsRef.current = args;

    if (timeSinceLastCall >= limit) {
      // Execute immediately if enough time has passed
      callbackRef.current(...args);
      lastCallTimeRef.current = now;
      lastArgsRef.current = null;
    } else if (!isThrottled) {
      // Schedule execution for the remaining time
      setIsThrottled(true);
      const remainingTime = limit - timeSinceLastCall;
      
      timeoutRef.current = setTimeout(() => {
        if (lastArgsRef.current) {
          callbackRef.current(...lastArgsRef.current);
          lastCallTimeRef.current = Date.now();
          lastArgsRef.current = null;
        }
        setIsThrottled(false);
        timeoutRef.current = null;
      }, remainingTime);
    }
  }, [limit, isThrottled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    throttledCallback,
    cancel,
    flush,
    isThrottled,
  };
}

/**
 * Combined debounce and throttle hook for complex scenarios
 * Provides both debouncing and throttling with independent controls
 */
export function useDebouncedThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  debounceDelay: number,
  throttleLimit: number,
  deps: React.DependencyList = []
): {
  debouncedCallback: (...args: Parameters<T>) => void;
  throttledCallback: (...args: Parameters<T>) => void;
  combinedCallback: (...args: Parameters<T>) => void;
  cancelAll: () => void;
  flushAll: () => void;
  isPending: boolean;
  isThrottled: boolean;
} {
  const debounced = useDebouncedCallback(callback, debounceDelay, deps);
  const throttled = useThrottledCallback(callback, throttleLimit, deps);

  // Combined callback that uses debouncing primarily but falls back to throttling
  const combinedCallback = useCallback((...args: Parameters<T>) => {
    // Use throttled callback if debouncing is taking too long
    if (debounced.isPending) {
      throttled.throttledCallback(...args);
    } else {
      debounced.debouncedCallback(...args);
    }
  }, [debounced, throttled]);

  const cancelAll = useCallback(() => {
    debounced.cancel();
    throttled.cancel();
  }, [debounced, throttled]);

  const flushAll = useCallback(() => {
    debounced.flush();
    throttled.flush();
  }, [debounced, throttled]);

  return {
    debouncedCallback: debounced.debouncedCallback,
    throttledCallback: throttled.throttledCallback,
    combinedCallback,
    cancelAll,
    flushAll,
    isPending: debounced.isPending,
    isThrottled: throttled.isThrottled,
  };
}