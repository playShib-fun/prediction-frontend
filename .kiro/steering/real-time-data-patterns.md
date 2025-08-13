---
inclusion: fileMatch
fileMatchPattern: '*real-time*|*polling*|*odds*'
---

# Real-Time Data Patterns

## React Query Polling Standards
When implementing real-time data features, follow these React Query patterns:

```typescript
// Standard polling configuration
const useRealTimeData = (options: RealTimeOptions) => {
  return useQuery({
    queryKey: ['realTime', options.identifier],
    queryFn: () => fetchData(options.identifier),
    refetchInterval: options.enabled ? 15000 : false,
    refetchIntervalInBackground: false,
    staleTime: 10000, // Data is fresh for 10 seconds
    enabled: options.enabled,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
```

## Visibility-Based Optimization
Always implement intersection observer for performance:

```typescript
const useVisibilityOptimizedPolling = (enabled: boolean) => {
  const [isVisible, setIsVisible] = useState(true);
  const elementRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!elementRef.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    
    observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, []);
  
  return { isVisible: enabled && isVisible, elementRef };
};
```

## Animation State Management
Use this pattern for smooth value transitions:

```typescript
interface AnimationState {
  isAnimating: boolean;
  direction: 'increase' | 'decrease' | 'none';
  previousValue: number;
  currentValue: number;
}

const useValueAnimation = (value: number) => {
  const [animationState, setAnimationState] = useState<AnimationState>({
    isAnimating: false,
    direction: 'none',
    previousValue: value,
    currentValue: value,
  });
  
  useEffect(() => {
    if (value !== animationState.currentValue) {
      setAnimationState({
        isAnimating: true,
        direction: value > animationState.currentValue ? 'increase' : 'decrease',
        previousValue: animationState.currentValue,
        currentValue: value,
      });
      
      const timer = setTimeout(() => {
        setAnimationState(prev => ({ ...prev, isAnimating: false }));
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [value]);
  
  return animationState;
};
```

## Error Handling for Real-Time Features
Implement graceful degradation:

```typescript
const useRealTimeWithFallback = (options: RealTimeOptions) => {
  const { data, error, isLoading } = useRealTimeData(options);
  const [fallbackData, setFallbackData] = useState(null);
  
  useEffect(() => {
    if (data && !error) {
      setFallbackData(data);
    }
  }, [data, error]);
  
  return {
    data: error ? fallbackData : data,
    error,
    isLoading,
    isUsingFallback: !!error && !!fallbackData,
  };
};
```

## Performance Monitoring
Track real-time feature performance:

```typescript
const usePerformanceMonitoring = (featureName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (duration > 100) {
        console.warn(`${featureName} took ${duration}ms to render`);
      }
    };
  }, [featureName]);
};
```

## Conditional Real-Time Updates
Only enable real-time features when appropriate:

```typescript
const shouldEnableRealTime = (state: GameState): boolean => {
  switch (state) {
    case "upcoming":
      return true; // Enable for upcoming rounds
    case "live":
    case "ended":
      return false; // Use static data for live/ended rounds
    default:
      return false;
  }
};
```

## Memory Leak Prevention
Always clean up resources:

```typescript
useEffect(() => {
  const cleanup = [];
  
  // Store cleanup functions
  if (intervalId) cleanup.push(() => clearInterval(intervalId));
  if (observer) cleanup.push(() => observer.disconnect());
  if (subscription) cleanup.push(() => subscription.unsubscribe());
  
  return () => {
    cleanup.forEach(fn => fn());
  };
}, []);
```

## Testing Real-Time Features
Use these testing patterns:

```typescript
// Mock React Query for testing
const mockUseQuery = jest.fn();
jest.mock('@tanstack/react-query', () => ({
  useQuery: mockUseQuery,
}));

// Test polling behavior
test('should poll every 15 seconds when enabled', () => {
  mockUseQuery.mockReturnValue({
    data: mockData,
    isLoading: false,
    error: null,
  });
  
  render(<ComponentWithRealTime enabled={true} />);
  
  expect(mockUseQuery).toHaveBeenCalledWith(
    expect.objectContaining({
      refetchInterval: 15000,
    })
  );
});
```

## Bundle Size Considerations
- Import only necessary React Query features
- Use dynamic imports for heavy animation libraries
- Implement code splitting for real-time features
- Monitor bundle impact with webpack-bundle-analyzer

## Browser Compatibility
- Provide IntersectionObserver polyfill for older browsers
- Gracefully degrade animations on low-performance devices
- Test on mobile devices with limited resources
- Implement fallbacks for unsupported features