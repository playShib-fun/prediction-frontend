"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SortState } from "@/lib/history-types";

interface SortSelectorProps {
  sort: SortState;
  onChange: (sort: SortState) => void;
}

export default function SortSelector({ sort, onChange }: SortSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Select
        value={`${sort.field}:${sort.direction}`}
        onValueChange={(val) => {
          const [field, direction] = val.split(":") as [SortState["field"], SortState["direction"]];
          onChange({ field, direction });
        }}
      >
        <SelectTrigger className="w-56 bg-gray-900/60 border-gray-700 text-gray-200">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent className="bg-gray-900/95 border-gray-700 text-gray-200">
          <SelectItem value="date:desc">Date (newest)</SelectItem>
          <SelectItem value="date:asc">Date (oldest)</SelectItem>
          <SelectItem value="amount:desc">Amount (highest)</SelectItem>
          <SelectItem value="amount:asc">Amount (lowest)</SelectItem>
          <SelectItem value="round:desc">Round (highest)</SelectItem>
          <SelectItem value="round:asc">Round (lowest)</SelectItem>
          <SelectItem value="profit:desc">Profit (highest)</SelectItem>
          <SelectItem value="profit:asc">Loss (highest)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
