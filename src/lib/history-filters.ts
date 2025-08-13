/**
 * Filter and sort utility functions for betting history
 * Provides type-safe filtering and sorting with validation
 */

import { 
  BetRecord, 
  FilterState, 
  SortState, 
  FilterValidationResult, 
  SortValidationResult,
  DATE_RANGE_PRESETS 
} from './history-types';

export class HistoryFilters {
  /**
   * Apply all filters to betting data
   */
  static applyFilters(bets: BetRecord[], filters: FilterState): BetRecord[] {
    try {
      let filteredBets = [...bets];

      // Apply outcome filter
      if (filters.outcome !== 'all') {
        filteredBets = this.filterByOutcome(filteredBets, filters.outcome);
      }

      // Apply round status filter (maps to outcome groups)
      if (filters.roundStatus && filters.roundStatus !== 'all') {
        filteredBets = this.filterByRoundStatus(filteredBets, filters.roundStatus);
      }

      // Apply bet type filter
      if (filters.betType !== 'all') {
        filteredBets = this.filterByBetType(filteredBets, filters.betType);
      }

      // Apply date range filter
      filteredBets = this.filterByDateRange(filteredBets, filters.dateRange);

      // Apply amount range filter
      if (filters.amountRange.min !== undefined || filters.amountRange.max !== undefined) {
        filteredBets = this.filterByAmountRange(filteredBets, filters.amountRange);
      }

      // Apply search filter
      if (filters.search.trim()) {
        filteredBets = this.filterBySearch(filteredBets, filters.search);
      }

      return filteredBets;
    } catch (error) {
      console.error('Error applying filters:', error);
      return bets; // Return original data on error
    }
  }

  /**
   * Filter by bet outcome
   */
  static filterByOutcome(
    bets: BetRecord[], 
    outcome: 'won' | 'lost' | 'pending' | 'calculating'
  ): BetRecord[] {
    return bets.filter(bet => bet.status === outcome);
  }

  /**
   * Filter by bet type
   */
  static filterByBetType(
    bets: BetRecord[], 
    betType: 'bull' | 'bear'
  ): BetRecord[] {
    return bets.filter(bet => bet.type === betType);
  }

  /**
   * Filter by round status grouping
   * live -> pending; ended -> won/lost; calculating -> calculating
   */
  static filterByRoundStatus(
    bets: BetRecord[],
    status: 'live' | 'ended' | 'calculating'
  ): BetRecord[] {
    if (status === 'live') {
      return bets.filter(b => b.status === 'pending');
    }
    if (status === 'ended') {
      return bets.filter(b => b.status === 'won' || b.status === 'lost');
    }
    return bets.filter(b => b.status === 'calculating');
  }

  /**
   * Filter by date range
   */
  static filterByDateRange(
    bets: BetRecord[], 
    dateRange: FilterState['dateRange']
  ): BetRecord[] {
    try {
      if (dateRange.preset === 'all') {
        return bets;
      }

      let startDate: Date | undefined;
      let endDate: Date | undefined;

      if (dateRange.preset === 'custom') {
        startDate = dateRange.startDate;
        endDate = dateRange.endDate;
      } else {
        const preset = DATE_RANGE_PRESETS[dateRange.preset];
        if (preset.days) {
          const now = new Date();
          startDate = new Date(now.getTime() - (preset.days * 24 * 60 * 60 * 1000));
          endDate = now;
        }
      }

      if (!startDate && !endDate) {
        return bets;
      }

      return bets.filter(bet => {
        try {
          const betDate = new Date(parseInt(bet.timestamp) * 1000);
          
          if (startDate && betDate < startDate) {
            return false;
          }
          
          if (endDate && betDate > endDate) {
            return false;
          }
          
          return true;
        } catch (error) {
          console.warn(`Invalid timestamp for bet ${bet.id}:`, bet.timestamp);
          return false;
        }
      });
    } catch (error) {
      console.error('Error filtering by date range:', error);
      return bets;
    }
  }

  /**
   * Filter by amount range
   */
  static filterByAmountRange(
    bets: BetRecord[], 
    amountRange: { min?: number; max?: number }
  ): BetRecord[] {
    try {
      return bets.filter(bet => {
        try {
          const amount = parseFloat(bet.amount);
          
          if (isNaN(amount)) {
            return false;
          }
          
          if (amountRange.min !== undefined && amount < amountRange.min) {
            return false;
          }
          
          if (amountRange.max !== undefined && amount > amountRange.max) {
            return false;
          }
          
          return true;
        } catch (error) {
          console.warn(`Invalid amount for bet ${bet.id}:`, bet.amount);
          return false;
        }
      });
    } catch (error) {
      console.error('Error filtering by amount range:', error);
      return bets;
    }
  }

  /**
   * Filter by search term (round ID or transaction hash)
   */
  static filterBySearch(bets: BetRecord[], searchTerm: string): BetRecord[] {
    try {
      const normalizedSearch = searchTerm.toLowerCase().trim();
      
      if (!normalizedSearch) {
        return bets;
      }

      return bets.map(bet => {
        const matchesRoundId = bet.roundId.toLowerCase().includes(normalizedSearch);
        const matchesTransactionHash = bet.transactionHash.toLowerCase().includes(normalizedSearch);
        const matchesSearch = matchesRoundId || matchesTransactionHash;

        return {
          ...bet,
          matchesSearch,
          isHighlighted: matchesSearch,
        };
      }).filter(bet => bet.matchesSearch);
    } catch (error) {
      console.error('Error filtering by search:', error);
      return bets;
    }
  }

  /**
   * Validate filter state
   */
  static validateFilters(filters: FilterState): FilterValidationResult {
    const errors: string[] = [];
    const sanitizedFilters: FilterState = { ...filters };

    // Validate outcome
    const validOutcomes = ['all', 'won', 'lost', 'pending', 'calculating'];
    if (!validOutcomes.includes(filters.outcome)) {
      errors.push('Invalid outcome filter');
      sanitizedFilters.outcome = 'all';
    }

    // Validate bet type
    const validBetTypes = ['all', 'bull', 'bear'];
    if (!validBetTypes.includes(filters.betType)) {
      errors.push('Invalid bet type filter');
      sanitizedFilters.betType = 'all';
    }

    // Validate round status
    const validRoundStatuses = ['all', 'live', 'ended', 'calculating'];
    if (filters.roundStatus && !validRoundStatuses.includes(filters.roundStatus)) {
      errors.push('Invalid round status filter');
      sanitizedFilters.roundStatus = 'all';
    }

    // Validate date range
    const validPresets = ['all', '7d', '30d', '90d', 'custom'];
    if (!validPresets.includes(filters.dateRange.preset)) {
      errors.push('Invalid date range preset');
      sanitizedFilters.dateRange.preset = 'all';
    }

    // Validate custom date range
    if (filters.dateRange.preset === 'custom') {
      if (filters.dateRange.startDate && filters.dateRange.endDate) {
        if (filters.dateRange.startDate > filters.dateRange.endDate) {
          errors.push('Start date must be before end date');
          sanitizedFilters.dateRange.startDate = undefined;
          sanitizedFilters.dateRange.endDate = undefined;
        }
      }
    }

    // Validate amount range
    if (filters.amountRange.min !== undefined) {
      if (filters.amountRange.min < 0) {
        errors.push('Minimum amount cannot be negative');
        sanitizedFilters.amountRange.min = 0;
      }
    }

    if (filters.amountRange.max !== undefined) {
      if (filters.amountRange.max < 0) {
        errors.push('Maximum amount cannot be negative');
        sanitizedFilters.amountRange.max = undefined;
      }
    }

    if (
      filters.amountRange.min !== undefined && 
      filters.amountRange.max !== undefined &&
      filters.amountRange.min > filters.amountRange.max
    ) {
      errors.push('Minimum amount cannot be greater than maximum amount');
      sanitizedFilters.amountRange.max = sanitizedFilters.amountRange.min;
    }

    // Sanitize search term
    if (typeof filters.search !== 'string') {
      errors.push('Search term must be a string');
      sanitizedFilters.search = '';
    } else {
      // Remove potentially harmful characters and limit length
      sanitizedFilters.search = filters.search
        .replace(/[<>\"'&]/g, '')
        .substring(0, 100);
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedFilters,
    };
  }

  /**
   * Get default filter state
   */
  static getDefaultFilters(): FilterState {
    return {
      outcome: 'all',
      betType: 'all',
      roundStatus: 'all',
      dateRange: {
        preset: 'all',
        startDate: undefined,
        endDate: undefined,
      },
      amountRange: {
        min: undefined,
        max: undefined,
      },
      search: '',
    };
  }

  /**
   * Check if filters are active (not default)
   */
  static hasActiveFilters(filters: FilterState): boolean {
    const defaultFilters = this.getDefaultFilters();
    
    return (
      filters.outcome !== defaultFilters.outcome ||
      filters.betType !== defaultFilters.betType ||
      filters.dateRange.preset !== defaultFilters.dateRange.preset ||
      filters.amountRange.min !== undefined ||
      filters.amountRange.max !== undefined ||
      filters.search.trim() !== ''
    );
  }

  /**
   * Get active filter count
   */
  static getActiveFilterCount(filters: FilterState): number {
    let count = 0;

    if (filters.outcome !== 'all') count++;
    if (filters.betType !== 'all') count++;
    if (filters.dateRange.preset !== 'all') count++;
    if (filters.amountRange.min !== undefined || filters.amountRange.max !== undefined) count++;
    if (filters.search.trim()) count++;

    return count;
  }
}

export class HistorySorting {
  /**
   * Apply sorting to betting data
   */
  static applySorting(bets: BetRecord[], sort: SortState): BetRecord[] {
    try {
      const sortedBets = [...bets];

      switch (sort.field) {
        case 'date':
          return this.sortByDate(sortedBets, sort.direction);
        case 'amount':
          return this.sortByAmount(sortedBets, sort.direction);
        case 'round':
          return this.sortByRound(sortedBets, sort.direction);
        case 'profit':
          return this.sortByProfit(sortedBets, sort.direction);
        default:
          console.warn(`Unknown sort field: ${sort.field}`);
          return sortedBets;
      }
    } catch (error) {
      console.error('Error applying sorting:', error);
      return bets; // Return original data on error
    }
  }

  /**
   * Sort by date (timestamp)
   */
  static sortByDate(bets: BetRecord[], direction: 'asc' | 'desc'): BetRecord[] {
    return bets.sort((a, b) => {
      try {
        const timeA = parseInt(a.timestamp);
        const timeB = parseInt(b.timestamp);
        
        if (isNaN(timeA) || isNaN(timeB)) {
          return 0; // Keep original order for invalid timestamps
        }
        
        return direction === 'asc' ? timeA - timeB : timeB - timeA;
      } catch (error) {
        return 0;
      }
    });
  }

  /**
   * Sort by bet amount
   */
  static sortByAmount(bets: BetRecord[], direction: 'asc' | 'desc'): BetRecord[] {
    return bets.sort((a, b) => {
      try {
        const amountA = parseFloat(a.amount);
        const amountB = parseFloat(b.amount);
        
        if (isNaN(amountA) || isNaN(amountB)) {
          return 0; // Keep original order for invalid amounts
        }
        
        return direction === 'asc' ? amountA - amountB : amountB - amountA;
      } catch (error) {
        return 0;
      }
    });
  }

  /**
   * Sort by round ID
   */
  static sortByRound(bets: BetRecord[], direction: 'asc' | 'desc'): BetRecord[] {
    return bets.sort((a, b) => {
      try {
        const roundA = parseInt(a.roundId);
        const roundB = parseInt(b.roundId);
        
        if (isNaN(roundA) || isNaN(roundB)) {
          // Fallback to string comparison
          return direction === 'asc' 
            ? a.roundId.localeCompare(b.roundId)
            : b.roundId.localeCompare(a.roundId);
        }
        
        return direction === 'asc' ? roundA - roundB : roundB - roundA;
      } catch (error) {
        return 0;
      }
    });
  }

  /**
   * Sort by profit/loss
   */
  static sortByProfit(bets: BetRecord[], direction: 'asc' | 'desc'): BetRecord[] {
    return bets.sort((a, b) => {
      try {
        const profitA = a.profit ? parseFloat(a.profit) : 0;
        const profitB = b.profit ? parseFloat(b.profit) : 0;
        
        return direction === 'asc' ? profitA - profitB : profitB - profitA;
      } catch (error) {
        return 0;
      }
    });
  }

  /**
   * Validate sort state
   */
  static validateSort(sort: SortState): SortValidationResult {
    const errors: string[] = [];
    const sanitizedSort: SortState = { ...sort };

    // Validate sort field
    const validFields = ['date', 'amount', 'round', 'profit'];
    if (!validFields.includes(sort.field)) {
      errors.push('Invalid sort field');
      sanitizedSort.field = 'date';
    }

    // Validate sort direction
    const validDirections = ['asc', 'desc'];
    if (!validDirections.includes(sort.direction)) {
      errors.push('Invalid sort direction');
      sanitizedSort.direction = 'desc';
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedSort,
    };
  }

  /**
   * Get default sort state
   */
  static getDefaultSort(): SortState {
    return {
      field: 'date',
      direction: 'desc',
    };
  }

  /**
   * Toggle sort direction for the same field
   */
  static toggleSortDirection(currentSort: SortState, newField: SortState['field']): SortState {
    if (currentSort.field === newField) {
      return {
        field: newField,
        direction: currentSort.direction === 'asc' ? 'desc' : 'asc',
      };
    } else {
      return {
        field: newField,
        direction: 'desc', // Default to descending for new fields
      };
    }
  }
}