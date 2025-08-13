"use client";

import { memo, useMemo } from "react";
import StatCard from "./stat-card";
import type { UserStatistics, BetRecord } from "@/lib/history-types";
import { Trophy, TrendingUp, DollarSign, PiggyBank, Percent, Flame, Snowflake } from "lucide-react";

export interface StatisticsDashboardProps {
  statistics: UserStatistics;
  isLoading: boolean;
  filteredData?: BetRecord[];
}

function StatisticsDashboard({ statistics, isLoading, filteredData }: StatisticsDashboardProps) {
  const totalWins = useMemo(() => filteredData?.filter(b => b.status === "won").length ?? 0, [filteredData]);
  const totalLosses = useMemo(() => filteredData?.filter(b => b.status === "lost").length ?? 0, [filteredData]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3 md:gap-4">
      <StatCard title="Total Bets" value={statistics.totalBets} subtitle="All time" color="blue" isLoading={isLoading} icon={<Trophy className="w-5 h-5" />} />
      <StatCard title="Total Wagered" value={`${statistics.totalWagered} BONE`} color="purple" isLoading={isLoading} icon={<DollarSign className="w-5 h-5" />} />
      <StatCard title="Total Winnings" value={`${statistics.totalWinnings} BONE`} color="green" isLoading={isLoading} icon={<PiggyBank className="w-5 h-5" />} />
      <StatCard title="Net P/L" value={`${statistics.netProfit} BONE`} color={Number(statistics.netProfit) >= 0 ? "green" : "red"} isLoading={isLoading} icon={<TrendingUp className="w-5 h-5" />} />
      <StatCard title="Win Rate" value={`${statistics.winRate}%`} color="yellow" isLoading={isLoading} icon={<Percent className="w-5 h-5" />} />
      <StatCard title="Avg Bet" value={`${statistics.averageBet} BONE`} color="purple" isLoading={isLoading} icon={<DollarSign className="w-5 h-5" />} />
      <StatCard title="Longest Win" value={statistics.longestWinStreak} subtitle={`${totalWins} wins`} color="green" isLoading={isLoading} icon={<Flame className="w-5 h-5" />} />
      <StatCard title="Longest Lose" value={statistics.longestLoseStreak} subtitle={`${totalLosses} losses`} color="red" isLoading={isLoading} icon={<Snowflake className="w-5 h-5" />} />
    </div>
  );
}

export default memo(StatisticsDashboard);
