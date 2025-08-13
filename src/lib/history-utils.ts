/**
 * Utility functions for processing and transforming betting history data
 * Provides data processing, validation, and transformation utilities
 */

import { 
  BetRecord, 
  ProcessedBetData, 
  RawBetData, 
  ProcessingOptions, 
  ExportData,
  HistoryError 
} from './history-types';
import { 
  BetBull, 
  BetBear, 
  Claim, 
  LockRound, 
  EndRound 
} from './graphql-client';
import { StatisticsCalculator } from './history-statistics';

export class HistoryDataProcessor {
  /**
   * Process raw betting data into enhanced BetRecord format
   */
  static processRawData(
    rawData: RawBetData, 
    userAddress: string,
    options: ProcessingOptions = {
      includeCalculations: true,
      includePriceMovement: true,
      includeRoundInfo: true,
      validateData: true,
    }
  ): { data: ProcessedBetData[]; errors: HistoryError[] } {
    const errors: HistoryError[] = [];
    const processedData: ProcessedBetData[] = [];

    try {
      // Filter bets for the specific user
      const userBullBets = rawData.bullBets.filter(bet => 
        bet.sender.toLowerCase() === userAddress.toLowerCase()
      );
      const userBearBets = rawData.bearBets.filter(bet => 
        bet.sender.toLowerCase() === userAddress.toLowerCase()
      );

      // Process bull bets
      for (const bullBet of userBullBets) {
        try {
          const processed = this.processSingleBet(
            bullBet, 
            'bull', 
            rawData, 
            options
          );
          if (processed) {
            processedData.push(processed);
          }
        } catch (error) {
          errors.push({
            type: 'parsing',
            message: `Failed to process bull bet ${bullBet.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            retryable: false,
          });
        }
      }

      // Process bear bets
      for (const bearBet of userBearBets) {
        try {
          const processed = this.processSingleBet(
            bearBet, 
            'bear', 
            rawData, 
            options
          );
          if (processed) {
            processedData.push(processed);
          }
        } catch (error) {
          errors.push({
            type: 'parsing',
            message: `Failed to process bear bet ${bearBet.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            retryable: false,
          });
        }
      }

      // Sort by timestamp (newest first)
      processedData.sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp));

      return { data: processedData, errors };
    } catch (error) {
      errors.push({
        type: 'unknown',
        message: `Failed to process raw data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        retryable: true,
      });
      return { data: [], errors };
    }
  }

  /**
   * Process a single bet (bull or bear) into ProcessedBetData
   */
  private static processSingleBet(
    betData: BetBull | BetBear,
    type: 'bull' | 'bear',
    rawData: RawBetData,
    options: ProcessingOptions
  ): ProcessedBetData | null {
    try {
      // Create base bet record
      const baseBet: BetRecord = {
        id: betData.id,
        roundId: betData.roundId,
        type,
        amount: betData.amount,
        timestamp: betData.timestamp,
        transactionHash: betData.transactionHash,
        sender: betData.sender,
        logIndex: betData.logIndex,
        status: 'calculating', // Will be updated based on round status
      };

      // Find related data
      const claim = rawData.claims.find(c => 
        c.roundId === betData.roundId && 
        c.sender.toLowerCase() === betData.sender.toLowerCase()
      );
      const lockRound = rawData.lockRounds.find(lr => lr.roundId === betData.roundId);
      const endRound = rawData.endRounds.find(er => er.roundId === betData.roundId);
      const round = rawData.rounds.find(r => r.roundId === betData.roundId);

      // Determine bet status and outcome
      const status = this.determineBetStatus(betData, claim, lockRound, endRound, type);
      baseBet.status = status;

      // Add claim information if available
      if (claim) {
        baseBet.claimedAmount = claim.amount;
      }

      // Add price information if available
      if (lockRound) {
        baseBet.lockPrice = lockRound.lockPrice;
      }
      if (endRound) {
        baseBet.closePrice = endRound.closePrice;
      }

      // Create processed bet data
      const processedBet: ProcessedBetData = {
        ...baseBet,
        isWinner: status === 'won',
      };

      // Add round information if requested
      if (options.includeRoundInfo && round) {
        processedBet.roundInfo = {
          lockPrice: lockRound?.lockPrice,
          closePrice: endRound?.closePrice,
          status: round.status,
          startTimeStamp: round.startTimeStamp,
          pricePool: round.pricePool,
        };
      }

      // Add claim information if available
      if (claim) {
        processedBet.claimInfo = {
          amount: claim.amount,
          timestamp: claim.timestamp,
          transactionHash: claim.transactionHash,
        };
      }

      // Calculate profit and price movement if requested
      if (options.includeCalculations) {
        const { profit, profitPercentage } = StatisticsCalculator.calculateBetProfit(baseBet);
        processedBet.profit = profit;
        processedBet.profitPercentage = profitPercentage;
      }

      // Calculate price movement if requested and data is available
      if (options.includePriceMovement && lockRound && endRound) {
        const lockPrice = parseFloat(lockRound.lockPrice);
        const closePrice = parseFloat(endRound.closePrice);
        
        if (!isNaN(lockPrice) && !isNaN(closePrice) && lockPrice > 0) {
          const percentage = ((closePrice - lockPrice) / lockPrice) * 100;
          processedBet.priceMovement = {
            lockPrice: lockRound.lockPrice,
            closePrice: endRound.closePrice,
            percentage: Math.round(percentage * 100) / 100,
          };
        }
      }

      // Calculate round duration if data is available
      if (lockRound && endRound) {
        const lockTime = parseInt(lockRound.timestamp);
        const endTime = parseInt(endRound.timestamp);
        if (!isNaN(lockTime) && !isNaN(endTime)) {
          processedBet.roundDuration = endTime - lockTime;
        }
      }

      // Validate processed data if requested
      if (options.validateData) {
        const validation = StatisticsCalculator.validateBetData(processedBet);
        if (!validation.isValid) {
          console.warn(`Invalid processed bet data for ${betData.id}:`, validation.errors);
          // Still return the data but log the issues
        }
      }

      return processedBet;
    } catch (error) {
      console.error(`Error processing bet ${betData.id}:`, error);
      return null;
    }
  }

  /**
   * Determine bet status based on available data
   */
  private static determineBetStatus(
    _bet: BetBull | BetBear,
    claim: Claim | undefined,
    lockRound: LockRound | undefined,
    endRound: EndRound | undefined,
    betType: 'bull' | 'bear'
  ): 'won' | 'lost' | 'pending' | 'calculating' {
    // If there's a claim, the bet was won
    if (claim) {
      return 'won';
    }

    // If round hasn't ended yet, it's pending
    if (!endRound) {
      return 'pending';
    }

    // If round ended but no lock round data, it's calculating
    if (!lockRound) {
      return 'calculating';
    }

    // Determine if bet won based on price movement
    try {
      const lockPrice = parseFloat(lockRound.lockPrice);
      const closePrice = parseFloat(endRound.closePrice);

      if (isNaN(lockPrice) || isNaN(closePrice)) {
        return 'calculating';
      }

      const priceWentUp = closePrice > lockPrice;
      const betWon = (betType === 'bull' && priceWentUp) || (betType === 'bear' && !priceWentUp);

      return betWon ? 'won' : 'lost';
    } catch (error) {
      return 'calculating';
    }
  }

  /**
   * Convert processed bet data to export format
   */
  static convertToExportData(bets: ProcessedBetData[]): ExportData[] {
    return bets.map(bet => ({
      roundNumber: bet.roundId,
      betType: bet.type === 'bull' ? 'Bull' : 'Bear',
      betAmount: bet.amount,
      timestamp: new Date(parseInt(bet.timestamp) * 1000).toISOString(),
      outcome: this.capitalizeStatus(bet.status),
      profitLoss: bet.profit || '0',
      transactionHash: bet.transactionHash,
      lockPrice: bet.lockPrice,
      closePrice: bet.closePrice,
      claimedAmount: bet.claimedAmount,
    }));
  }

  /**
   * Generate CSV content from export data
   */
  static generateCSV(exportData: ExportData[]): string {
    try {
      const headers = [
        'Round Number',
        'Bet Type',
        'Bet Amount',
        'Timestamp',
        'Outcome',
        'Profit/Loss',
        'Transaction Hash',
        'Lock Price',
        'Close Price',
        'Claimed Amount',
      ];

      const csvRows = [headers.join(',')];

      for (const row of exportData) {
        const csvRow = [
          row.roundNumber,
          row.betType,
          row.betAmount,
          row.timestamp,
          row.outcome,
          row.profitLoss,
          row.transactionHash,
          row.lockPrice || '',
          row.closePrice || '',
          row.claimedAmount || '',
        ].map(field => `"${field}"`).join(',');

        csvRows.push(csvRow);
      }

      return csvRows.join('\n');
    } catch (error) {
      throw new Error(`Failed to generate CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate JSON content from export data
   */
  static generateJSON(exportData: ExportData[]): string {
    try {
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      throw new Error(`Failed to generate JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Sanitize search input
   */
  static sanitizeSearchInput(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    return input
      .replace(/[<>\"'&]/g, '') // Remove potentially harmful characters
      .substring(0, 100) // Limit length
      .trim();
  }

  /**
   * Validate numeric input for amount filters
   */
  static validateNumericInput(input: string | number | undefined): number | undefined {
    if (input === undefined || input === null || input === '') {
      return undefined;
    }

    const num = typeof input === 'string' ? parseFloat(input) : input;
    
    if (isNaN(num) || num < 0) {
      return undefined;
    }

    return num;
  }

  /**
   * Format timestamp for display
   */
  static formatTimestamp(timestamp: string): string {
    try {
      const date = new Date(parseInt(timestamp) * 1000);
      return date.toLocaleString();
    } catch (error) {
      return 'Invalid Date';
    }
  }

  /**
   * Format amount for display
   */
  static formatAmount(amount: string, decimals: number = 6): string {
    try {
      const num = parseFloat(amount);
      if (isNaN(num)) {
        return '0';
      }
      return num.toFixed(decimals);
    } catch (error) {
      return '0';
    }
  }

  /**
   * Truncate transaction hash for display
   */
  static truncateHash(hash: string, startChars: number = 6, endChars: number = 4): string {
    if (!hash || hash.length <= startChars + endChars) {
      return hash;
    }
    return `${hash.substring(0, startChars)}...${hash.substring(hash.length - endChars)}`;
  }

  /**
   * Capitalize bet status for display
   */
  private static capitalizeStatus(status: string): 'Won' | 'Lost' | 'Pending' | 'Calculating' {
    switch (status) {
      case 'won':
        return 'Won';
      case 'lost':
        return 'Lost';
      case 'pending':
        return 'Pending';
      case 'calculating':
        return 'Calculating';
      default:
        return 'Calculating';
    }
  }

  /**
   * Generate filename for export
   */
  static generateExportFilename(format: 'csv' | 'json', filters?: any): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const hasFilters = filters && Object.keys(filters).length > 0;
    const suffix = hasFilters ? '_filtered' : '';
    
    return `shibplay_betting_history${suffix}_${timestamp}.${format}`;
  }

  /**
   * Debounce function for search and filter operations
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  /**
   * Throttle function for scroll events
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Check if data is stale and needs refresh
   */
  static isDataStale(lastUpdated: Date, maxAge: number = 5 * 60 * 1000): boolean {
    return Date.now() - lastUpdated.getTime() > maxAge;
  }

  /**
   * Merge and deduplicate bet records
   */
  static mergeBetRecords(existing: BetRecord[], newData: BetRecord[]): BetRecord[] {
    const merged = [...existing];
    const existingIds = new Set(existing.map(bet => bet.id));

    for (const newBet of newData) {
      if (!existingIds.has(newBet.id)) {
        merged.push(newBet);
      }
    }

    // Sort by timestamp (newest first)
    return merged.sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp));
  }
}