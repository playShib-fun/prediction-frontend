"use client";

import { useState, useEffect, useRef } from 'react';

interface OddsAnimationState {
  isAnimating: boolean;
  direction: 'up' | 'down' | 'none';
  previousValue: number;
  hasChanged: boolean;
}

interface UseOddsAnimationOptions {
  threshold?: number; // Minimum change to trigger animation
  animationDuration?: number; // Duration to keep animation state active
}

function useOddsAnimation(
  currentValue: number,
  options: UseOddsAnimationOptions = {}
) {
  const { threshold = 0.01, animationDuration = 1500 } = options;
  
  const [animationState, setAnimationState] = useState<OddsAnimationState>({
    isAnimating: false,
    direction: 'none',
    previousValue: currentValue,
    hasChanged: false
  });
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip animation on first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setAnimationState(prev => ({
        ...prev,
        previousValue: currentValue
      }));
      return;
    }

    const difference = currentValue - animationState.previousValue;
    const shouldAnimate = Math.abs(difference) >= threshold;

    if (shouldAnimate) {
      const direction = difference > 0 ? 'up' : 'down';
      
      setAnimationState({
        isAnimating: true,
        direction,
        previousValue: animationState.previousValue,
        hasChanged: true
      });

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set timeout to stop animation
      timeoutRef.current = setTimeout(() => {
        setAnimationState(prev => ({
          ...prev,
          isAnimating: false,
          direction: 'none',
          previousValue: currentValue
        }));
      }, animationDuration);
    }
  }, [currentValue, threshold, animationDuration, animationState.previousValue]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isAnimating: animationState.isAnimating,
    direction: animationState.direction,
    hasChanged: animationState.hasChanged,
    previousValue: animationState.previousValue
  };
}

export { useOddsAnimation };
export default useOddsAnimation;