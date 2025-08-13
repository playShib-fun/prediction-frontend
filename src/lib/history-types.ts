/**
 * Core data types for the enhanced history page
 * Provides comprehensive TypeScript interfaces for betting data structures
 */

import { BetBull, BetBear, Claim, LockRound, EndRound, Round } from './graphql-client';

// Enhanced bet record that combines bull/bear bets with calculated fields
export interface BetRecord {
  id: string;
  roundId: string;
  type: 'bull' | 'bear';
  amount: string;
  timestamp: string;
  transactionHash: string;
  sender: string;
  logIndex: string;
  
  // Calculated fields (populated by processing utilities)
  status: 'won' | 'lost' | 'pending' | 'calculating';
  claimedAmount?: string;
  profit?: string;
  profitPercentage?: number;
  lockPrice?: string;
  closePrice?: string;
  priceMovement?: {
    lockPrice: string;
    closePrice: string;
    percentage: number;
  };
  
  // UI state fields
  isHighlighted?: boolean;
  matchesSearch?: boolean;
}

// User statistics interface
export interface UserStatistics {
  totalBets: number;
  totalWagered: string;
  totalWinnings: string;
  netProfit: string;
  winRate: number;
  averageBet: string;
  longestWinStreak: number;
  longestLoseStreak: number;
  currentStreak: {
    type: 'win' | 'lose' | 'none';
    count: number;
  };
}

// Filter state interface
export interface FilterState {
  outcome: 'all' | 'won' | 'lost' | 'pending' | 'calculating';
  betType: 'all' | 'bull' | 'bear';
  // Round status groups: live maps to pending; ended maps to won/lost
  roundStatus?: 'all' | 'live' | 'ended' | 'calculating';
  dateRange: {
    preset: 'all' | '7d' | '30d' | '90d' | 'custom';
    startDate?: Date;
    endDate?: Date;
  };
  amountRange: {
    min?: number;
    max?: number;
  };
  search: string;
}

// Sort state interface
export interface SortState {
  field: 'date' | 'amount' | 'round' | 'profit';
  direction: 'asc' | 'desc';
}

// Pagination state interface
export interface PaginationState {
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  pageSize: number;
  totalItems?: number;
}

// Processed bet data with all enhancements
export interface ProcessedBetData extends BetRecord {
  // Round information
  roundInfo?: {
    lockPrice?: string;
    closePrice?: string;
    status?: string;
    startTimeStamp?: string;
    pricePool?: string;
  };
  
  // Claim information
  claimInfo?: {
    amount: string;
    timestamp: string;
    transactionHash: string;
  };
  
  // Calculated metrics
  isWinner: boolean;
  roundDuration?: number;
}

// Statistics calculation result with metadata
export interface StatisticsResult {
  statistics: UserStatistics;
  calculatedAt: Date;
  dataCount: number;
  errors: string[];
}

// Filter validation result
export interface FilterValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedFilters: FilterState;
}

// Sort validation result
export interface SortValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedSort: SortState;
}

// Export data format
export interface ExportData {
  roundNumber: string;
  betType: 'Bull' | 'Bear';
  betAmount: string;
  timestamp: string;
  outcome: 'Won' | 'Lost' | 'Pending' | 'Calculating';
  profitLoss: string;
  transactionHash: string;
  lockPrice?: string;
  closePrice?: string;
  claimedAmount?: string;
}

// Error types for better error handling
export type HistoryError = 
  | { type: 'network'; message: string; retryable: boolean }
  | { type: 'parsing'; message: string; retryable: false }
  | { type: 'validation'; message: string; retryable: false }
  | { type: 'calculation'; message: string; retryable: true }
  | { type: 'unknown'; message: string; retryable: boolean };

// Raw data types for processing
export interface RawBetData {
  bullBets: BetBull[];
  bearBets: BetBear[];
  claims: Claim[];
  lockRounds: LockRound[];
  endRounds: EndRound[];
  rounds: Round[];
}

// Processing options
export interface ProcessingOptions {
  includeCalculations: boolean;
  includePriceMovement: boolean;
  includeRoundInfo: boolean;
  validateData: boolean;
}

// Date range presets
export const DATE_RANGE_PRESETS = {
  all: { label: 'All Time', days: null },
  '7d': { label: 'Last 7 Days', days: 7 },
  '30d': { label: 'Last 30 Days', days: 30 },
  '90d': { label: 'Last 90 Days', days: 90 },
  custom: { label: 'Custom Range', days: null },
} as const;

// Sort field options
export const SORT_FIELDS = {
  date: { label: 'Date', field: 'timestamp' as const },
  amount: { label: 'Amount', field: 'amount' as const },
  round: { label: 'Round', field: 'roundId' as const },
  profit: { label: 'Profit/Loss', field: 'profit' as const },
} as const;

// Bet outcome options
export const BET_OUTCOMES = {
  all: { label: 'All Outcomes', value: 'all' as const },
  won: { label: 'Won', value: 'won' as const },
  lost: { label: 'Lost', value: 'lost' as const },
  pending: { label: 'Pending', value: 'pending' as const },
  calculating: { label: 'Calculating', value: 'calculating' as const },
} as const;

// Bet type options
export const BET_TYPES = {
  all: { label: 'All Types', value: 'all' as const },
  bull: { label: 'Bull', value: 'bull' as const },
  bear: { label: 'Bear', value: 'bear' as const },
} as const;