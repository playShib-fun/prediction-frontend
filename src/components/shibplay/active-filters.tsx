"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FilterState } from "@/lib/history-types";
import { X } from "lucide-react";

interface ActiveFiltersProps {
  filters: FilterState;
  onRemove: (key: keyof FilterState) => void;
  onClearAll: () => void;
  hasActive: boolean;
}

export default function ActiveFilters({ filters, onRemove, onClearAll, hasActive }: ActiveFiltersProps) {
  if (!hasActive) return null;

  const chips: Array<{ key: keyof FilterState; label: string }> = [];
  if (filters.outcome !== "all") chips.push({ key: "outcome", label: `Outcome: ${filters.outcome}` });
  if (filters.betType !== "all") chips.push({ key: "betType", label: `Type: ${filters.betType}` });
  if (filters.roundStatus && filters.roundStatus !== "all") chips.push({ key: "roundStatus", label: `Round: ${filters.roundStatus}` });
  if (filters.dateRange.preset !== "all") chips.push({ key: "dateRange", label: `Date: ${filters.dateRange.preset}` });
  if (filters.amountRange.min !== undefined || filters.amountRange.max !== undefined) chips.push({ key: "amountRange", label: `Amount: ${filters.amountRange.min ?? 0}-${filters.amountRange.max ?? "∞"}` });
  if (filters.search.trim()) chips.push({ key: "search", label: `Search: ${filters.search}` });

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map(({ key, label }) => (
        <Badge key={String(key)} variant="secondary" className="bg-gray-800/60 border border-gray-700 text-gray-200">
          <span className="mr-2">{label}</span>
          <button className="inline-flex" onClick={() => onRemove(key)} aria-label={`Remove ${label}`}>
            <X className="w-3 h-3" />
          </button>
        </Badge>
      ))}
      <Button size="sm" variant="ghost" className="text-gray-400 hover:text-gray-200" onClick={onClearAll}>Clear all</Button>
    </div>
  );
}
