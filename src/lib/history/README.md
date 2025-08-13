# History Page Enhancement - Core Utilities

This directory contains the core data types and utilities for the enhanced history page functionality. These utilities provide comprehensive TypeScript interfaces, statistics calculation, filtering, sorting, and data processing capabilities.

## Files Overview

### Core Types (`history-types.ts`)
- **BetRecord**: Enhanced betting data structure with calculated fields
- **UserStatistics**: Comprehensive user betting statistics interface
- **FilterState**: Advanced filtering state management
- **SortState**: Sorting configuration interface
- **ProcessedBetData**: Fully processed betting data with all enhancements
- **ExportData**: Data format for CSV/JSON exports

### Statistics Calculator (`history-statistics.ts`)
- **StatisticsCalculator**: Main class for calculating user betting statistics
- Handles profit/loss calculations with BigInt precision
- Calculates win rates, streaks, and averages
- Comprehensive error handling and data validation
- Supports filtered statistics calculations

### Filters and Sorting (`history-filters.ts`)
- **HistoryFilters**: Advanced filtering system with type safety
- **HistorySorting**: Comprehensive sorting utilities
- Supports multiple filter combinations (outcome, bet type, date range, amount range, search)
- Input validation and sanitization
- Filter state management utilities

### Data Processing (`history-utils.ts`)
- **HistoryDataProcessor**: Raw data processing and transformation
- Converts GraphQL data to enhanced BetRecord format
- Export functionality (CSV/JSON generation)
- Utility functions for formatting, validation, and data manipulation
- Debouncing and throttling utilities

### Validation (`history-validation.ts`)
- Comprehensive validation suite for all utilities
- Tests core functionality without external test framework dependencies
- Validates data processing, filtering, sorting, and statistics calculation

## Usage Examples

### Basic Statistics Calculation

```typescript
import { StatisticsCalculator, BetRecord } from '@/lib/history';

const bets: BetRecord[] = [
  // ... your bet data
];

const result = StatisticsCalculator.calculateUserStats(bets);
console.log('Win Rate:', result.statistics.winRate);
console.log('Net Profit:', result.statistics.netProfit);
```

### Filtering Data

```typescript
import { HistoryFilters, FilterState } from '@/lib/history';

const filters: FilterState = {
  outcome: 'won',
  betType: 'bull',
  dateRange: { preset: '30d' },
  amountRange: { min: 50, max: 500 },
  search: '',
};

const filteredBets = HistoryFilters.applyFilters(allBets, filters);
```

### Sorting Data

```typescript
import { HistorySorting, SortState } from '@/lib/history';

const sort: SortState = {
  field: 'date',
  direction: 'desc',
};

const sortedBets = HistorySorting.applySorting(bets, sort);
```

### Processing Raw Data

```typescript
import { HistoryDataProcessor, RawBetData } from '@/lib/history';

const rawData: RawBetData = {
  bullBets: [...],
  bearBets: [...],
  claims: [...],
  lockRounds: [...],
  endRounds: [...],
  rounds: [...],
};

const { data, errors } = HistoryDataProcessor.processRawData(
  rawData,
  userAddress,
  {
    includeCalculations: true,
    includePriceMovement: true,
    includeRoundInfo: true,
    validateData: true,
  }
);
```

### Exporting Data

```typescript
import { HistoryDataProcessor } from '@/lib/history';

// Convert to export format
const exportData = HistoryDataProcessor.convertToExportData(processedBets);

// Generate CSV
const csvContent = HistoryDataProcessor.generateCSV(exportData);

// Generate JSON
const jsonContent = HistoryDataProcessor.generateJSON(exportData);
```

## Key Features

### Type Safety
- Comprehensive TypeScript interfaces for all data structures
- Strict type checking for filter and sort operations
- Generic utility functions with proper type constraints

### Error Handling
- Graceful error handling throughout all utilities
- Detailed error reporting with categorized error types
- Fallback behaviors for invalid data

### Performance Optimizations
- BigInt precision for financial calculations
- Efficient filtering and sorting algorithms
- Debouncing and throttling utilities for UI interactions
- Memory-efficient data processing

### Data Validation
- Input sanitization for search terms and numeric inputs
- Comprehensive data validation for bet records
- Filter and sort state validation with sanitization

### Export Functionality
- CSV export with proper formatting and escaping
- JSON export for programmatic use
- Configurable filename generation
- Support for filtered data exports

## Requirements Mapping

This implementation addresses the following requirements from the spec:

- **Requirement 1.1**: User statistics dashboard with comprehensive metrics
- **Requirement 2.1**: Advanced filtering system with multiple criteria
- **Requirement 3.1**: Sorting and ordering capabilities
- **Requirement 6.1**: Performance optimization with proper data structures
- **Requirement 6.2**: Debouncing for smooth user interactions

## Testing

Run the validation suite to verify all functionality:

```bash
npx tsx src/lib/history-validation.ts
```

This will test all core utilities and report any issues.

## Integration

These utilities are designed to integrate seamlessly with:
- React Query for data fetching
- Zustand for state management
- The existing GraphQL client and data structures
- The component architecture outlined in the design document

## Next Steps

After implementing these core utilities, the next tasks in the implementation plan are:
1. Create the StatisticsCalculator class with core methods (Task 2.1)
2. Create useHistoryStats custom hook (Task 2.2)
3. Build statistics dashboard components (Task 3.1-3.2)

These utilities provide the foundation for all subsequent implementation tasks.