---
inclusion: fileMatch
fileMatchPattern: '*animation*|*motion*|*animated*|*transition*'
---

# Animation and Motion Patterns

## Framer Motion Standards
Use consistent animation patterns across the application:

```typescript
// Standard animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: "easeOut" }
};

const scaleOnHover = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { type: "spring", stiffness: 400, damping: 17 }
};
```

## Value Animation Patterns
For animating numeric values (like odds, prices, counters):

```typescript
const AnimatedValue: React.FC<AnimatedValueProps> = ({ 
  value, 
  duration = 0.5,
  formatFn = (v) => v.toFixed(2),
  className 
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  
  useEffect(() => {
    const animation = animate(displayValue, value, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => setDisplayValue(latest),
    });
    
    return () => animation.stop();
  }, [value, duration]);
  
  return (
    <span className={className}>
      {formatFn(displayValue)}
    </span>
  );
};
```

## Color Transition Patterns
For highlighting value changes:

```typescript
const useColorTransition = (value: number, duration = 1000) => {
  const [colorState, setColorState] = useState<'neutral' | 'increase' | 'decrease'>('neutral');
  const previousValue = useRef(value);
  
  useEffect(() => {
    if (value !== previousValue.current) {
      const direction = value > previousValue.current ? 'increase' : 'decrease';
      setColorState(direction);
      previousValue.current = value;
      
      const timer = setTimeout(() => {
        setColorState('neutral');
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [value, duration]);
  
  return colorState;
};

// Usage in component
const colorClass = {
  'neutral': 'text-foreground',
  'increase': 'text-green-400',
  'decrease': 'text-red-400'
}[colorState];
```

## Loading State Animations
Consistent loading animations:

```typescript
const LoadingSpinner = () => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
  />
);

const PulseLoader = () => (
  <motion.div
    animate={{ opacity: [0.5, 1, 0.5] }}
    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    className="w-full h-4 bg-muted rounded"
  />
);
```

## Stagger Animation Patterns
For animating lists or multiple elements:

```typescript
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Usage
<motion.div variants={containerVariants} initial="hidden" animate="visible">
  {items.map((item, index) => (
    <motion.div key={index} variants={itemVariants}>
      {item}
    </motion.div>
  ))}
</motion.div>
```

## Accessibility Considerations
Respect user motion preferences:

```typescript
const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  return prefersReducedMotion;
};

// Usage in animations
const AnimatedComponent = () => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.div
      animate={{ x: prefersReducedMotion ? 0 : 100 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
    >
      Content
    </motion.div>
  );
};
```

## Performance Optimization
Optimize animations for 60fps:

```typescript
// Use transform properties for better performance
const optimizedAnimation = {
  x: [0, 100, 0],
  scale: [1, 1.1, 1],
  // Avoid animating: width, height, top, left, margin, padding
};

// Use will-change CSS property sparingly
const MotionComponent = () => (
  <motion.div
    style={{ willChange: 'transform' }}
    animate={{ x: 100 }}
    onAnimationComplete={() => {
      // Remove will-change after animation
      element.style.willChange = 'auto';
    }}
  />
);
```

## Animation Testing Patterns
Test animations effectively:

```typescript
// Mock framer-motion for testing
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
  },
  animate: jest.fn(),
  AnimatePresence: ({ children }) => children,
}));

// Test animation triggers
test('should trigger animation on value change', () => {
  const { rerender } = render(<AnimatedValue value={10} />);
  
  rerender(<AnimatedValue value={20} />);
  
  expect(mockAnimate).toHaveBeenCalledWith(
    10, 20, expect.objectContaining({ duration: 0.5 })
  );
});
```

## Common Animation Mistakes to Avoid
- ❌ Animating layout properties (width, height, margin, padding)
- ❌ Not cleaning up animation timers and intervals
- ❌ Ignoring user motion preferences
- ❌ Over-animating (too many simultaneous animations)
- ❌ Not providing fallbacks for older browsers
- ❌ Animating on every render without memoization

## Animation Best Practices
- ✅ Use transform properties (translateX, scale, rotate)
- ✅ Implement proper cleanup in useEffect
- ✅ Respect prefers-reduced-motion
- ✅ Keep animations under 500ms for UI feedback
- ✅ Use easing functions for natural motion
- ✅ Test on low-performance devices
- ✅ Provide loading states during animations

## Debugging Animation Issues
Use these tools and techniques:

```typescript
// Animation debugging utility
const useAnimationDebug = (name: string) => {
  useEffect(() => {
    console.log(`Animation ${name} started`);
    return () => console.log(`Animation ${name} ended`);
  }, [name]);
};

// Performance monitoring
const useAnimationPerformance = () => {
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 16.67) { // > 60fps
          console.warn(`Slow animation frame: ${entry.duration}ms`);
        }
      });
    });
    
    observer.observe({ entryTypes: ['measure'] });
    return () => observer.disconnect();
  }, []);
};
```