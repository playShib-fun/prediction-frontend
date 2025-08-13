"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export type StatCardColor = "green" | "red" | "blue" | "purple" | "yellow";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  color?: StatCardColor;
  isLoading?: boolean;
}

const colorMap: Record<StatCardColor, { bg: string; text: string; border: string }> = {
  green: { bg: "from-green-500/10 to-emerald-500/10", text: "text-green-400", border: "border-green-500/20" },
  red: { bg: "from-red-500/10 to-pink-500/10", text: "text-red-400", border: "border-red-500/20" },
  blue: { bg: "from-blue-500/10 to-purple-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  purple: { bg: "from-purple-500/10 to-fuchsia-500/10", text: "text-purple-400", border: "border-purple-500/20" },
  yellow: { bg: "from-yellow-500/10 to-orange-500/10", text: "text-yellow-400", border: "border-yellow-500/20" },
};

export default function StatCard({ title, value, subtitle, trend, icon, color = "blue", isLoading }: StatCardProps) {
  const c = colorMap[color];

  return (
    <Card className={`overflow-hidden bg-gradient-to-br from-gray-900/70 to-black/70 backdrop-blur-xl border ${c.border}`}>
      <CardContent className="p-4 md:p-5">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-28 bg-gray-700/50" />
            <Skeleton className="h-8 w-36 bg-gray-700/50" />
            <Skeleton className="h-3 w-24 bg-gray-700/50" />
          </div>
        ) : (
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-wide text-gray-400">{title}</div>
              <AnimatePresence mode="popLayout">
                <motion.div key={String(value)} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className={`text-2xl md:text-3xl font-semibold ${c.text}`}>
                  {typeof value === "number" ? value.toLocaleString() : value}
                </motion.div>
              </AnimatePresence>
              {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
            </div>
            {icon && (
              <div className={`p-2 rounded-lg bg-gradient-to-br ${c.bg} ${c.border} border`}>{icon}</div>
            )}
          </div>
        )}
        {!isLoading && trend && (
          <div className={`mt-3 text-xs ${trend.isPositive ? "text-green-400" : "text-red-400"}`}>
            {trend.isPositive ? "+" : ""}
            {trend.value}% vs total
          </div>
        )}
      </CardContent>
    </Card>
  );
}
