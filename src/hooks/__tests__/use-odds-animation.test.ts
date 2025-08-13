import { renderHook, act } from '@testing-library/react';
import { useOddsAnimation } from '../use-odds-animation';

// Mock timers
jest.useFakeTimers();

describe('useOddsAnimation', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should not animate on initial render', () => {
    const { result } = renderHook(() => useOddsAnimation(1.5));

    expect(result.current.isAnimating).toBe(false);
    expect(result.current.direction).toBe('none');
    expect(result.current.hasChanged).toBe(false);
  });

  it('should animate when value increases above threshold', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useOddsAnimation(value, { threshold: 0.1 }),
      { initialProps: { value: 1.5 } }
    );

    // Initial state
    expect(result.current.isAnimating).toBe(false);

    // Update value above threshold
    rerender({ value: 1.7 });

    expect(result.current.isAnimating).toBe(true);
    expect(result.current.direction).toBe('up');
    expect(result.current.hasChanged).toBe(true);
  });

  it('should animate when value decreases above threshold', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useOddsAnimation(value, { threshold: 0.1 }),
      { initialProps: { value: 2.0 } }
    );

    // Update value below threshold
    rerender({ value: 1.8 });

    expect(result.current.isAnimating).toBe(true);
    expect(result.current.direction).toBe('down');
    expect(result.current.hasChanged).toBe(true);
  });

  it('should not animate when value change is below threshold', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useOddsAnimation(value, { threshold: 0.1 }),
      { initialProps: { value: 1.5 } }
    );

    // Update value below threshold
    rerender({ value: 1.55 });

    expect(result.current.isAnimating).toBe(false);
    expect(result.current.direction).toBe('none');
  });

  it('should stop animating after duration', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useOddsAnimation(value, { threshold: 0.1, animationDuration: 1000 }),
      { initialProps: { value: 1.5 } }
    );

    // Trigger animation
    rerender({ value: 1.8 });
    expect(result.current.isAnimating).toBe(true);

    // Fast forward time
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.isAnimating).toBe(false);
    expect(result.current.direction).toBe('none');
  });

  it('should use custom threshold', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useOddsAnimation(value, { threshold: 0.5 }),
      { initialProps: { value: 1.5 } }
    );

    // Change below custom threshold
    rerender({ value: 1.8 });
    expect(result.current.isAnimating).toBe(false);

    // Change above custom threshold
    rerender({ value: 2.1 });
    expect(result.current.isAnimating).toBe(true);
  });
});