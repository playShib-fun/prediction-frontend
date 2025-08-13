/**
 * Statistics calculation utilities for betting history
 * Provides comprehensive statistics calculation with proper error handling
 */

import { BetRecord, UserStatistics, StatisticsResult } from './history-types';

export class StatisticsCalculator {
  /**
   * Calculate comprehensive user statistics from betting data
   */
  static calculateUserStats(bets: BetRecord[]): StatisticsResult {
    const errors: string[] = [];
    const calculatedAt = new Date();
    
    try {
      // Validate input data
      if (!Array.isArray(bets)) {
        throw new Error('Bets data must be an array');
      }

      if (bets.length === 0) {
        return {
          statistics: this.getEmptyStatistics(),
          calculatedAt,
          dataCount: 0,
          errors: [],
        };
      }

      // Filter out invalid bets and collect errors
      const validBets = bets.filter(bet => {
        if (!bet.amount || !bet.timestamp || !bet.type) {
          errors.push(`Invalid bet data for bet ID: ${bet.id || 'unknown'}`);
          return false;
        }
        return true;
      });

      if (validBets.length === 0) {
        errors.push('No valid bets found in data');
        return {
          statistics: this.getEmptyStatistics(),
          calculatedAt,
          dataCount: bets.length,
          errors,
        };
      }

      // Calculate basic metrics
      const totalBets = validBets.length;
      const { totalWagered, totalWinnings, netProfit } = this.calculateProfitLoss(validBets);
      const winRate = this.calculateWinRate(validBets);
      const averageBet = this.calculateAverageBet(validBets);
      const streaks = this.calculateStreaks(validBets);

      const statistics: UserStatistics = {
        totalBets,
        totalWagered,
        totalWinnings,
        netProfit,
        winRate,
        averageBet,
        longestWinStreak: streaks.longestWin,
        longestLoseStreak: streaks.longestLose,
        currentStreak: streaks.current,
      };

      return {
        statistics,
        calculatedAt,
        dataCount: bets.length,
        errors,
      };

    } catch (error) {
      errors.push(`Statistics calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      return {
        statistics: this.getEmptyStatistics(),
        calculatedAt,
        dataCount: bets.length,
        errors,
      };
    }
  }

  /**
   * Calculate profit/loss metrics with precision handling
   */
  static calculateProfitLoss(bets: BetRecord[]): {
    totalWagered: string;
    totalWinnings: string;
    netProfit: string;
  } {
    try {
      let totalWageredBN = BigInt(0);
      let totalWinningsBN = BigInt(0);

      for (const bet of bets) {
        try {
          // Convert amount to BigInt for precision (assuming 18 decimals)
          const amountBN = BigInt(Math.floor(parseFloat(bet.amount) * 1e18));
          totalWageredBN += amountBN;

          // Add winnings if bet was won and claimed
          if (bet.status === 'won' && bet.claimedAmount) {
            const claimedBN = BigInt(Math.floor(parseFloat(bet.claimedAmount) * 1e18));
            totalWinningsBN += claimedBN;
          }
        } catch (error) {
          // Skip invalid amounts but continue processing
          console.warn(`Invalid amount for bet ${bet.id}:`, error);
        }
      }

      const netProfitBN = totalWinningsBN - totalWageredBN;

      return {
        totalWagered: this.formatBigIntToString(totalWageredBN),
        totalWinnings: this.formatBigIntToString(totalWinningsBN),
        netProfit: this.formatBigIntToString(netProfitBN),
      };
    } catch (error) {
      console.error('Error calculating profit/loss:', error);
      return {
        totalWagered: '0',
        totalWinnings: '0',
        netProfit: '0',
      };
    }
  }

  /**
   * Calculate win rate percentage
   */
  static calculateWinRate(bets: BetRecord[]): number {
    try {
      const settledBets = bets.filter(bet => bet.status === 'won' || bet.status === 'lost');
      
      if (settledBets.length === 0) {
        return 0;
      }

      const wonBets = settledBets.filter(bet => bet.status === 'won').length;
      return Math.round((wonBets / settledBets.length) * 100 * 100) / 100; // Round to 2 decimal places
    } catch (error) {
      console.error('Error calculating win rate:', error);
      return 0;
    }
  }

  /**
   * Calculate average bet amount
   */
  static calculateAverageBet(bets: BetRecord[]): string {
    try {
      if (bets.length === 0) {
        return '0';
      }

      let totalAmountBN = BigInt(0);
      let validBetsCount = 0;

      for (const bet of bets) {
        try {
          const amountBN = BigInt(Math.floor(parseFloat(bet.amount) * 1e18));
          totalAmountBN += amountBN;
          validBetsCount++;
        } catch (error) {
          // Skip invalid amounts
          continue;
        }
      }

      if (validBetsCount === 0) {
        return '0';
      }

      const averageBN = totalAmountBN / BigInt(validBetsCount);
      return this.formatBigIntToString(averageBN);
    } catch (error) {
      console.error('Error calculating average bet:', error);
      return '0';
    }
  }

  /**
   * Calculate win/lose streaks
   */
  static calculateStreaks(bets: BetRecord[]): {
    longestWin: number;
    longestLose: number;
    current: { type: 'win' | 'lose' | 'none'; count: number };
  } {
    try {
      // Sort bets by timestamp (oldest first for streak calculation)
      const sortedBets = [...bets]
        .filter(bet => bet.status === 'won' || bet.status === 'lost')
        .sort((a, b) => parseInt(a.timestamp) - parseInt(b.timestamp));

      if (sortedBets.length === 0) {
        return {
          longestWin: 0,
          longestLose: 0,
          current: { type: 'none', count: 0 },
        };
      }

      let longestWin = 0;
      let longestLose = 0;
      let currentWinStreak = 0;
      let currentLoseStreak = 0;
      let lastResult: 'win' | 'lose' | null = null;

      for (const bet of sortedBets) {
        const isWin = bet.status === 'won';

        if (isWin) {
          if (lastResult === 'win') {
            currentWinStreak++;
          } else {
            currentWinStreak = 1;
            currentLoseStreak = 0;
          }
          longestWin = Math.max(longestWin, currentWinStreak);
          lastResult = 'win';
        } else {
          if (lastResult === 'lose') {
            currentLoseStreak++;
          } else {
            currentLoseStreak = 1;
            currentWinStreak = 0;
          }
          longestLose = Math.max(longestLose, currentLoseStreak);
          lastResult = 'lose';
        }
      }

      // Determine current streak
      const current = lastResult === 'win' 
        ? { type: 'win' as const, count: currentWinStreak }
        : lastResult === 'lose'
        ? { type: 'lose' as const, count: currentLoseStreak }
        : { type: 'none' as const, count: 0 };

      return {
        longestWin,
        longestLose,
        current,
      };
    } catch (error) {
      console.error('Error calculating streaks:', error);
      return {
        longestWin: 0,
        longestLose: 0,
        current: { type: 'none', count: 0 },
      };
    }
  }

  /**
   * Calculate profit for individual bet
   */
  static calculateBetProfit(bet: BetRecord): { profit: string; profitPercentage: number } {
    try {
      if (bet.status !== 'won' || !bet.claimedAmount) {
        const lossAmount = `-${bet.amount}`;
        const lossPercentage = -100;
        return { profit: lossAmount, profitPercentage: lossPercentage };
      }

      const wagered = parseFloat(bet.amount);
      const claimed = parseFloat(bet.claimedAmount);
      const profit = claimed - wagered;
      const profitPercentage = wagered > 0 ? Math.round((profit / wagered) * 100 * 100) / 100 : 0;

      return {
        profit: profit.toFixed(6),
        profitPercentage,
      };
    } catch (error) {
      console.error(`Error calculating profit for bet ${bet.id}:`, error);
      return { profit: '0', profitPercentage: 0 };
    }
  }

  /**
   * Get empty statistics object
   */
  private static getEmptyStatistics(): UserStatistics {
    return {
      totalBets: 0,
      totalWagered: '0',
      totalWinnings: '0',
      netProfit: '0',
      winRate: 0,
      averageBet: '0',
      longestWinStreak: 0,
      longestLoseStreak: 0,
      currentStreak: { type: 'none', count: 0 },
    };
  }

  /**
   * Format BigInt to string with proper decimal places
   */
  private static formatBigIntToString(value: bigint): string {
    try {
      // Convert from wei (18 decimals) to readable format
      const divisor = 1e18;
      const floatValue = Number(value) / divisor;
      
      // Format to 6 decimal places and remove trailing zeros
      return parseFloat(floatValue.toFixed(6)).toString();
    } catch (error) {
      console.error('Error formatting BigInt:', error);
      return '0';
    }
  }

  /**
   * Validate bet data for statistics calculation
   */
  static validateBetData(bet: BetRecord): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!bet.id) {
      errors.push('Missing bet ID');
    }

    if (!bet.amount || isNaN(parseFloat(bet.amount))) {
      errors.push('Invalid or missing bet amount');
    }

    if (!bet.timestamp || isNaN(parseInt(bet.timestamp))) {
      errors.push('Invalid or missing timestamp');
    }

    if (!bet.type || !['bull', 'bear'].includes(bet.type)) {
      errors.push('Invalid or missing bet type');
    }

    if (!bet.status || !['won', 'lost', 'pending', 'calculating'].includes(bet.status)) {
      errors.push('Invalid or missing bet status');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate statistics for filtered data subset
   */
  static calculateFilteredStats(
    allBets: BetRecord[],
    filteredBets: BetRecord[]
  ): { filtered: StatisticsResult; comparison: { percentage: number; difference: string } } {
    const filteredStats = this.calculateUserStats(filteredBets);
    const allStats = this.calculateUserStats(allBets);

    // Calculate comparison metrics
    const filteredProfit = parseFloat(filteredStats.statistics.netProfit);
    const allProfit = parseFloat(allStats.statistics.netProfit);
    
    const percentage = allBets.length > 0 ? (filteredBets.length / allBets.length) * 100 : 0;
    const difference = (filteredProfit - allProfit).toFixed(6);

    return {
      filtered: filteredStats,
      comparison: {
        percentage: Math.round(percentage * 100) / 100,
        difference,
      },
    };
  }
}