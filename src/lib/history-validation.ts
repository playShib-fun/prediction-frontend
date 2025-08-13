/**
 * Validation script for history core utilities
 * Simple validation without test framework dependencies
 */

import { StatisticsCalculator } from './history-statistics';
import { HistoryFilters, HistorySorting } from './history-filters';
import { HistoryDataProcessor } from './history-utils';
import { BetRecord, FilterState } from './history-types';

// Mock data for validation
const mockBetRecords: BetRecord[] = [
  {
    id: '1',
    roundId: '100',
    type: 'bull',
    amount: '100.0',
    timestamp: '1640995200', // 2022-01-01 00:00:00
    transactionHash: '0x123...',
    sender: '0xuser1',
    logIndex: '1',
    status: 'won',
    claimedAmount: '180.0',
    profit: '80.0',
    profitPercentage: 80,
  },
  {
    id: '2',
    roundId: '101',
    type: 'bear',
    amount: '50.0',
    timestamp: '1641081600', // 2022-01-02 00:00:00
    transactionHash: '0x456...',
    sender: '0xuser1',
    logIndex: '2',
    status: 'lost',
    profit: '-50.0',
    profitPercentage: -100,
  },
  {
    id: '3',
    roundId: '102',
    type: 'bull',
    amount: '200.0',
    timestamp: '1641168000', // 2022-01-03 00:00:00
    transactionHash: '0x789...',
    sender: '0xuser1',
    logIndex: '3',
    status: 'won',
    claimedAmount: '350.0',
    profit: '150.0',
    profitPercentage: 75,
  },
];

export function validateHistoryCore(): { success: boolean; errors: string[] } {
  const errors: string[] = [];

  try {
    console.log('🧪 Validating History Core Utilities...');

    // Test StatisticsCalculator
    console.log('📊 Testing StatisticsCalculator...');
    const statsResult = StatisticsCalculator.calculateUserStats(mockBetRecords);
    
    if (statsResult.statistics.totalBets !== 3) {
      errors.push('StatisticsCalculator: Incorrect total bets count');
    }
    
    if (statsResult.statistics.winRate !== 66.67) {
      errors.push('StatisticsCalculator: Incorrect win rate calculation');
    }

    // Test empty data handling
    const emptyStats = StatisticsCalculator.calculateUserStats([]);
    if (emptyStats.statistics.totalBets !== 0) {
      errors.push('StatisticsCalculator: Failed to handle empty data');
    }

    // Test HistoryFilters
    console.log('🔍 Testing HistoryFilters...');
    const defaultFilters = HistoryFilters.getDefaultFilters();
    
    // Test outcome filter
    const wonFilter: FilterState = { ...defaultFilters, outcome: 'won' };
    const wonFiltered = HistoryFilters.applyFilters(mockBetRecords, wonFilter);
    
    if (wonFiltered.length !== 2) {
      errors.push('HistoryFilters: Outcome filter not working correctly');
    }

    // Test bet type filter
    const bullFilter: FilterState = { ...defaultFilters, betType: 'bull' };
    const bullFiltered = HistoryFilters.applyFilters(mockBetRecords, bullFilter);
    
    if (bullFiltered.length !== 2) {
      errors.push('HistoryFilters: Bet type filter not working correctly');
    }

    // Test filter validation
    const validationResult = HistoryFilters.validateFilters(defaultFilters);
    if (!validationResult.isValid) {
      errors.push('HistoryFilters: Default filters should be valid');
    }

    // Test HistorySorting
    console.log('📈 Testing HistorySorting...');
    const defaultSort = HistorySorting.getDefaultSort();
    
    // Test date sorting
    const dateSorted = HistorySorting.applySorting(mockBetRecords, {
      field: 'date',
      direction: 'desc'
    });
    
    if (parseInt(dateSorted[0].timestamp) < parseInt(dateSorted[1].timestamp)) {
      errors.push('HistorySorting: Date sorting not working correctly');
    }

    // Test amount sorting
    const amountSorted = HistorySorting.applySorting(mockBetRecords, {
      field: 'amount',
      direction: 'desc'
    });
    
    if (parseFloat(amountSorted[0].amount) < parseFloat(amountSorted[1].amount)) {
      errors.push('HistorySorting: Amount sorting not working correctly');
    }

    // Test sort validation
    const sortValidation = HistorySorting.validateSort(defaultSort);
    if (!sortValidation.isValid) {
      errors.push('HistorySorting: Default sort should be valid');
    }

    // Test HistoryDataProcessor utilities
    console.log('🔧 Testing HistoryDataProcessor...');
    
    // Test search sanitization
    const maliciousInput = '<script>alert("xss")</script>';
    const sanitized = HistoryDataProcessor.sanitizeSearchInput(maliciousInput);
    if (sanitized.includes('<') || sanitized.includes('>')) {
      errors.push('HistoryDataProcessor: Search sanitization failed');
    }

    // Test numeric validation
    const validNum = HistoryDataProcessor.validateNumericInput('123.45');
    const invalidNum = HistoryDataProcessor.validateNumericInput('invalid');
    
    if (validNum !== 123.45) {
      errors.push('HistoryDataProcessor: Valid numeric input not processed correctly');
    }
    
    if (invalidNum !== undefined) {
      errors.push('HistoryDataProcessor: Invalid numeric input should return undefined');
    }

    // Test timestamp formatting
    const formatted = HistoryDataProcessor.formatTimestamp('1640995200');
    if (formatted === 'Invalid Date') {
      errors.push('HistoryDataProcessor: Valid timestamp should format correctly');
    }

    // Test amount formatting
    const formattedAmount = HistoryDataProcessor.formatAmount('123.456789', 2);
    if (formattedAmount !== '123.46') {
      errors.push('HistoryDataProcessor: Amount formatting not working correctly');
    }

    // Test hash truncation
    const hash = '0x1234567890abcdef1234567890abcdef12345678';
    const truncated = HistoryDataProcessor.truncateHash(hash);
    if (!truncated.includes('...') || truncated.length >= hash.length) {
      errors.push('HistoryDataProcessor: Hash truncation not working correctly');
    }

    // Test filename generation
    const filename = HistoryDataProcessor.generateExportFilename('csv');
    if (!filename.includes('.csv') || !filename.includes('shibplay_betting_history')) {
      errors.push('HistoryDataProcessor: Filename generation not working correctly');
    }

    console.log('✅ Validation completed!');
    
    if (errors.length === 0) {
      console.log('🎉 All tests passed!');
      return { success: true, errors: [] };
    } else {
      console.log(`❌ ${errors.length} errors found:`);
      errors.forEach(error => console.log(`  - ${error}`));
      return { success: false, errors };
    }

  } catch (error) {
    const errorMessage = `Validation failed with error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    errors.push(errorMessage);
    console.error('❌', errorMessage);
    return { success: false, errors };
  }
}

// Run validation if this file is executed directly
if (require.main === module) {
  validateHistoryCore();
}