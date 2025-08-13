"use client";

import { useState } from "react";
import type { FilterState } from "@/lib/history-types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { useIsMobile } from "@/hooks/use-mobile";
import { CalendarDays, Filter as FilterIcon } from "lucide-react";

interface FilterPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export default function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState<FilterState>(filters);

  const Body = (
    <div className="p-4 md:p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-sm text-gray-400">Outcome</div>
          <Select value={local.outcome} onValueChange={(v) => setLocal({ ...local, outcome: v as FilterState["outcome"] })}>
            <SelectTrigger className="bg-gray-900/60 border-gray-700 text-gray-200"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-gray-900/95 border-gray-700 text-gray-200">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="won">Won</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="calculating">Calculating</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <div className="text-sm text-gray-400">Bet Type</div>
          <Select value={local.betType} onValueChange={(v) => setLocal({ ...local, betType: v as FilterState["betType"] })}>
            <SelectTrigger className="bg-gray-900/60 border-gray-700 text-gray-200"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-gray-900/95 border-gray-700 text-gray-200">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="bull">Bull</SelectItem>
              <SelectItem value="bear">Bear</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <div className="text-sm text-gray-400">Round Status</div>
          <Select value={local.roundStatus ?? "all"} onValueChange={(v) => setLocal({ ...local, roundStatus: v as any })}>
            <SelectTrigger className="bg-gray-900/60 border-gray-700 text-gray-200"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-gray-900/95 border-gray-700 text-gray-200">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="ended">Ended</SelectItem>
              <SelectItem value="calculating">Calculating</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <div className="text-sm text-gray-400">Amount Range (BONE)</div>
          <div className="px-2">
            <Slider min={0} max={1000} step={1} defaultValue={[local.amountRange.min ?? 0, local.amountRange.max ?? 1000]} onValueChange={([min, max]) => setLocal({ ...local, amountRange: { min, max: max === 1000 ? undefined : max } })} />
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>{local.amountRange.min ?? 0}</span>
              <span>{local.amountRange.max ?? "∞"}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="text-sm text-gray-400 flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Date Range</div>
        <Select value={local.dateRange.preset} onValueChange={(v) => setLocal({ ...local, dateRange: { preset: v as any } })}>
          <SelectTrigger className="bg-gray-900/60 border-gray-700 text-gray-200 w-56"><SelectValue /></SelectTrigger>
          <SelectContent className="bg-gray-900/95 border-gray-700 text-gray-200">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
        {local.dateRange.preset === "custom" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Calendar mode="single" selected={local.dateRange.startDate} onSelect={(d) => setLocal({ ...local, dateRange: { ...local.dateRange, startDate: d ?? undefined } })} className="rounded-md border border-gray-700 bg-gray-900/70" />
            <Calendar mode="single" selected={local.dateRange.endDate} onSelect={(d) => setLocal({ ...local, dateRange: { ...local.dateRange, endDate: d ?? undefined } })} className="rounded-md border border-gray-700 bg-gray-900/70" />
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" className="text-gray-400" onClick={() => setLocal(filters)}>Reset</Button>
        <Button onClick={() => { onChange(local); setOpen(false); }} className="bg-gray-800 text-gray-200 border border-gray-700">Apply</Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(v) => { setOpen(v); if (v) setLocal(filters); }}>
        <DrawerTrigger asChild>
          <Button variant="outline" className="bg-gray-900/60 border-gray-700 text-gray-200"><FilterIcon className="w-4 h-4 mr-2" /> Filters</Button>
        </DrawerTrigger>
        <DrawerContent className="bg-gray-950 border-gray-800">
          <DrawerHeader><DrawerTitle className="text-gray-200">Filters</DrawerTitle></DrawerHeader>
          {Body}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) setLocal(filters); }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-gray-900/60 border-gray-700 text-gray-200"><FilterIcon className="w-4 h-4 mr-2" /> Filters</Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-950 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-gray-200">Filters</DialogTitle>
        </DialogHeader>
        {Body}
      </DialogContent>
    </Dialog>
  );
}
