/**
 * Custom hook for calculating and managing betting history statistics
 * Provides memoized statistics calculations with loading and error states
 */

import { useMemo, useState, useEffect } from 'react';
import { BetRecord, UserStatistics, StatisticsResult } from '@/lib/history-types';
import { StatisticsCalculator } from '@/lib/history-statistics';

interface UseHistoryStatsOptions {
  enableRealTimeUpdates?: boolean;
  recalculateOnDataChange?: boolean;
}

interface UseHistoryStatsReturn {
  statistics: UserStatistics;
  isLoading: boolean;
  error: string | null;
  lastCalculated: Date | null;
  dataCount: number;
  hasErrors: boolean;
  calculationErrors: string[];
  refetch: () => void;
}

/**
 * Hook for calculating comprehensive betting statistics
 * Memoizes expensive calculations and handles loading/error states
 */
export function useHistoryStats(
  bets: BetRecord[] | undefined,
  options: UseHistoryStatsOptions = {}
): UseHistoryStatsReturn {
  const {
    enableRealTimeUpdates = true,
    recalculateOnDataChange = true,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forceRecalculate, setForceRecalculate] = useState(0);

  // Memoized statistics calculation
  const statisticsResult = useMemo<StatisticsResult>(() => {
    if (!bets) {
      return {
        statistics: {
          totalBets: 0,
          totalWagered: '0',
          totalWinnings: '0',
          netProfit: '0',
          winRate: 0,
          averageBet: '0',
          longestWinStreak: 0,
          longestLoseStreak: 0,
          currentStreak: { type: 'none', count: 0 },
        },
        calculatedAt: new Date(),
        dataCount: 0,
        errors: [],
      };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = StatisticsCalculator.calculateUserStats(bets);
      setIsLoading(false);
      
      if (result.errors.length > 0) {
        console.warn('Statistics calculation completed with errors:', result.errors);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during statistics calculation';
      setError(errorMessage);
      setIsLoading(false);
      
      return {
        statistics: {
          totalBets: 0,
          totalWagered: '0',
          totalWinnings: '0',
          netProfit: '0',
          winRate: 0,
          averageBet: '0',
          longestWinStreak: 0,
          longestLoseStreak: 0,
          currentStreak: { type: 'none', count: 0 },
        },
        calculatedAt: new Date(),
        dataCount: bets?.length || 0,
        errors: [errorMessage],
      };
    }
  }, [bets, forceRecalculate]);

  // Handle real-time updates
  useEffect(() => {
    if (!enableRealTimeUpdates || !recalculateOnDataChange) {
      return;
    }

    // Set loading state when data changes
    if (bets && bets.length > 0) {
      setIsLoading(true);
      
      // Use a small delay to batch rapid updates
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [bets, enableRealTimeUpdates, recalculateOnDataChange]);

  // Refetch function to force recalculation
  const refetch = () => {
    setForceRecalculate(prev => prev + 1);
  };

  return {
    statistics: statisticsResult.statistics,
    isLoading,
    error,
    lastCalculated: statisticsResult.calculatedAt,
    dataCount: statisticsResult.dataCount,
    hasErrors: statisticsResult.errors.length > 0,
    calculationErrors: statisticsResult.errors,
    refetch,
  };
}

/**
 * Hook for calculating filtered statistics with comparison to total
 */
export function useFilteredHistoryStats(
  allBets: BetRecord[] | undefined,
  filteredBets: BetRecord[] | undefined,
  options: UseHistoryStatsOptions = {}
): UseHistoryStatsReturn & {
  comparison: {
    percentage: number;
    difference: string;
  };
  totalStats: UserStatistics;
} {
  const filteredStats = useHistoryStats(filteredBets, options);
  const totalStats = useHistoryStats(allBets, { ...options, enableRealTimeUpdates: false });

  // Calculate comparison metrics
  const comparison = useMemo(() => {
    if (!allBets || !filteredBets) {
      return { percentage: 0, difference: '0' };
    }

    const percentage = allBets.length > 0 ? (filteredBets.length / allBets.length) * 100 : 0;
    const filteredProfit = parseFloat(filteredStats.statistics.netProfit);
    const totalProfit = parseFloat(totalStats.statistics.netProfit);
    const difference = (filteredProfit - totalProfit).toFixed(6);

    return {
      percentage: Math.round(percentage * 100) / 100,
      difference,
    };
  }, [allBets, filteredBets, filteredStats.statistics.netProfit, totalStats.statistics.netProfit]);

  return {
    ...filteredStats,
    comparison,
    totalStats: totalStats.statistics,
  };
}

/**
 * Hook for real-time statistics updates with performance optimization
 */
export function useRealTimeHistoryStats(
  bets: BetRecord[] | undefined,
  updateInterval: number = 5000
): UseHistoryStatsReturn & {
  isRealTimeEnabled: boolean;
  toggleRealTime: () => void;
} {
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  const [, setLastUpdateTime] = useState<Date>(new Date());

  const stats = useHistoryStats(bets, {
    enableRealTimeUpdates: isRealTimeEnabled,
    recalculateOnDataChange: true,
  });

  // Periodic updates for real-time mode
  useEffect(() => {
    if (!isRealTimeEnabled) {
      return;
    }

    const interval = setInterval(() => {
      setLastUpdateTime(new Date());
      stats.refetch();
    }, updateInterval);

    return () => clearInterval(interval);
  }, [isRealTimeEnabled, updateInterval, stats.refetch]);

  const toggleRealTime = () => {
    setIsRealTimeEnabled(prev => !prev);
  };

  return {
    ...stats,
    isRealTimeEnabled,
    toggleRealTime,
  };
}