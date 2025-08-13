"use client";

import { useState, useEffect } from "react";
import type { FilterState, SortState } from "@/lib/history-types";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import SortSelector from "./sort-selector";
import ActiveFilters from "./active-filters";
import ExportButton from "./export-button";

interface HistoryControlsProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  sort: SortState;
  onSortChange: (sort: SortState) => void;
  totalResults: number;
  isExporting?: boolean;
  onSearchChange?: (value: string) => void;
  dataForExport?: any[];
}

export default function HistoryControls({ filters, onFiltersChange, sort, onSortChange, totalResults, onSearchChange, dataForExport = [] }: HistoryControlsProps) {
  // Local search state to enable debouncing without re-filtering on each keystroke
  const [localSearch, setLocalSearch] = useState(filters.search);
  const debouncedSearch = useDebounce(localSearch, 300);

  useEffect(() => {
    // Sync external filter search -> local input (e.g., on clear all)
    setLocalSearch(filters.search);
  }, [filters.search]);

  useEffect(() => {
    if (onSearchChange && debouncedSearch !== filters.search) {
      onSearchChange(debouncedSearch);
    }
  }, [debouncedSearch]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <Input
          placeholder="Search round # or tx hash"
          className="bg-gray-900/60 border-gray-700 text-gray-200"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
        />
        <div className="flex items-center gap-3 md:ml-auto">
          <SortSelector sort={sort} onChange={onSortChange} />
          <ExportButton data={dataForExport as any} filters={filters} />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <ActiveFilters
          filters={filters}
          hasActive={Boolean(filters.search) || filters.betType !== "all" || filters.outcome !== "all" || filters.roundStatus !== "all" || filters.dateRange.preset !== "all" || filters.amountRange.min !== undefined || filters.amountRange.max !== undefined}
          onRemove={(key) => {
            const next = { ...filters } as FilterState;
            if (key === "amountRange") next.amountRange = { min: undefined, max: undefined };
            else if (key === "dateRange") next.dateRange = { preset: "all", startDate: undefined, endDate: undefined };
            else if (key === "search") next.search = "";
            else if (key === "roundStatus") next.roundStatus = "all";
            else if (key === "betType") next.betType = "all";
            else if (key === "outcome") next.outcome = "all";
            onFiltersChange(next);
            // Ensure debounced search state also clears when removing search chip
            if (key === "search" && onSearchChange) {
              onSearchChange("");
            }
          }}
          onClearAll={() => {
            onFiltersChange({
              outcome: "all",
              betType: "all",
              roundStatus: "all",
              dateRange: { preset: "all" },
              amountRange: {},
              search: "",
            });
            // Also clear debounced search value so results reset correctly
            if (onSearchChange) onSearchChange("");
          }}
        />
        <div className="text-sm text-gray-400 ml-auto">{totalResults} results</div>
      </div>
    </div>
  );
}
