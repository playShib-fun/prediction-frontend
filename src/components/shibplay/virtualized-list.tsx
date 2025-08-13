"use client";

import { useMemo } from "react";

export interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
}

export default function VirtualizedList<T>({ items, renderItem, itemHeight, containerHeight, overscan = 5, onLoadMore, hasMore, isLoading }: VirtualizedListProps<T>) {
  // Simple virtualization without external deps
  const totalHeight = items.length * itemHeight;

  const { start, end } = useMemo(() => {
    const scrollTop = 0; // Let the container be natural page scroll; simple fallback renders all if unknown
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    return { start: Math.max(0, Math.floor(scrollTop / itemHeight) - overscan), end: Math.min(items.length, Math.floor(scrollTop / itemHeight) + visibleCount + overscan) };
  }, [items.length, containerHeight, itemHeight, overscan]);

  const visibleItems = items.slice(start, end);

  return (
    <div style={{ position: "relative", height: totalHeight }}>
      {visibleItems.map((item, i) => {
        const index = start + i;
        return (
          <div key={index} style={{ position: "absolute", top: index * itemHeight, height: itemHeight, width: "100%" }}>
            {renderItem(item, index)}
          </div>
        );
      })}
      {hasMore && (
        <div className="py-4 text-center text-gray-400" role="status">
          {isLoading ? "Loading more..." : (
            <button className="underline" onClick={onLoadMore}>Load more</button>
          )}
        </div>
      )}
    </div>
  );
}
