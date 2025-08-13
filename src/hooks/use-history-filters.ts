/**
 * Custom hook for managing history filter state and operations
 * Provides filter state management with validation and sanitization
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  BetRecord, 
  FilterState, 
  SortState, 
  FilterValidationResult,
  SortValidationResult 
} from '@/lib/history-types';
import { HistoryFilters, HistorySorting } from '@/lib/history-filters';

interface UseHistoryFiltersOptions {
  initialFilters?: Partial<FilterState>;
  initialSort?: Partial<SortState>;
  enablePersistence?: boolean;
  persistenceKey?: string;
  validateOnChange?: boolean;
}

interface UseHistoryFiltersReturn {
  // Filter state
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
  
  // Sort state
  sort: SortState;
  setSort: (sort: SortState) => void;
  updateSort: (field: SortState['field']) => void;
  resetSort: () => void;
  
  // Validation
  filterValidation: FilterValidationResult;
  sortValidation: SortValidationResult;
  isValid: boolean;
  
  // Filter utilities
  hasActiveFilters: boolean;
  activeFilterCount: number;
  
  // Data processing
  applyFiltersAndSort: (data: BetRecord[]) => BetRecord[];
  filteredData: BetRecord[];
  
  // Persistence
  clearPersistedState: () => void;
}

/**
 * Hook for managing filter and sort state with validation
 */
export function useHistoryFilters(
  data: BetRecord[] = [],
  options: UseHistoryFiltersOptions = {}
): UseHistoryFiltersReturn {
  const {
    initialFilters = {},
    initialSort = {},
    enablePersistence = true,
    persistenceKey = 'shibplay-history-filters',
    validateOnChange = true,
  } = options;

  // Load persisted state
  const loadPersistedState = useCallback(() => {
    if (!enablePersistence || typeof window === 'undefined') {
      return { filters: null, sort: null };
    }

    try {
      const stored = localStorage.getItem(persistenceKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          filters: parsed.filters || null,
          sort: parsed.sort || null,
        };
      }
    } catch (error) {
      console.warn('Failed to load persisted filter state:', error);
    }

    return { filters: null, sort: null };
  }, [enablePersistence, persistenceKey]);

  // Initialize state
  const { filters: persistedFilters, sort: persistedSort } = loadPersistedState();
  
  const [filters, setFiltersState] = useState<FilterState>(() => ({
    ...HistoryFilters.getDefaultFilters(),
    ...initialFilters,
    ...persistedFilters,
  }));

  const [sort, setSortState] = useState<SortState>(() => ({
    ...HistorySorting.getDefaultSort(),
    ...initialSort,
    ...persistedSort,
  }));

  // Persist state changes
  const persistState = useCallback((newFilters: FilterState, newSort: SortState) => {
    if (!enablePersistence || typeof window === 'undefined') {
      return;
    }

    try {
      const stateToStore = {
        filters: newFilters,
        sort: newSort,
        timestamp: Date.now(),
      };
      localStorage.setItem(persistenceKey, JSON.stringify(stateToStore));
    } catch (error) {
      console.warn('Failed to persist filter state:', error);
    }
  }, [enablePersistence, persistenceKey]);

  // Validate filters
  const filterValidation = useMemo<FilterValidationResult>(() => {
    return HistoryFilters.validateFilters(filters);
  }, [filters]);

  // Validate sort
  const sortValidation = useMemo<SortValidationResult>(() => {
    return HistorySorting.validateSort(sort);
  }, [sort]);

  // Overall validation state
  const isValid = filterValidation.isValid && sortValidation.isValid;

  // Filter utilities
  const hasActiveFilters = useMemo(() => {
    return HistoryFilters.hasActiveFilters(filters);
  }, [filters]);

  const activeFilterCount = useMemo(() => {
    return HistoryFilters.getActiveFilterCount(filters);
  }, [filters]);

  // Filter setters with validation
  const setFilters = useCallback((newFilters: FilterState) => {
    if (validateOnChange) {
      const validation = HistoryFilters.validateFilters(newFilters);
      if (validation.isValid) {
        setFiltersState(newFilters);
        persistState(newFilters, sort);
      } else {
        console.warn('Invalid filters provided:', validation.errors);
        setFiltersState(validation.sanitizedFilters);
        persistState(validation.sanitizedFilters, sort);
      }
    } else {
      setFiltersState(newFilters);
      persistState(newFilters, sort);
    }
  }, [validateOnChange, sort, persistState]);

  const updateFilter = useCallback(<K extends keyof FilterState>(
    key: K, 
    value: FilterState[K]
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  }, [filters, setFilters]);

  const resetFilters = useCallback(() => {
    const defaultFilters = HistoryFilters.getDefaultFilters();
    setFilters(defaultFilters);
  }, [setFilters]);

  // Sort setters with validation
  const setSort = useCallback((newSort: SortState) => {
    if (validateOnChange) {
      const validation = HistorySorting.validateSort(newSort);
      if (validation.isValid) {
        setSortState(newSort);
        persistState(filters, newSort);
      } else {
        console.warn('Invalid sort provided:', validation.errors);
        setSortState(validation.sanitizedSort);
        persistState(filters, validation.sanitizedSort);
      }
    } else {
      setSortState(newSort);
      persistState(filters, newSort);
    }
  }, [validateOnChange, filters, persistState]);

  const updateSort = useCallback((field: SortState['field']) => {
    const newSort = HistorySorting.toggleSortDirection(sort, field);
    setSort(newSort);
  }, [sort, setSort]);

  const resetSort = useCallback(() => {
    const defaultSort = HistorySorting.getDefaultSort();
    setSort(defaultSort);
  }, [setSort]);

  // Data processing
  const applyFiltersAndSort = useCallback((inputData: BetRecord[]): BetRecord[] => {
    try {
      // Use validated filters and sort
      const validatedFilters = filterValidation.isValid ? filters : filterValidation.sanitizedFilters;
      const validatedSort = sortValidation.isValid ? sort : sortValidation.sanitizedSort;

      // Apply filters first
      let processedData = HistoryFilters.applyFilters(inputData, validatedFilters);
      
      // Then apply sorting
      processedData = HistorySorting.applySorting(processedData, validatedSort);

      return processedData;
    } catch (error) {
      console.error('Error applying filters and sort:', error);
      return inputData; // Return original data on error
    }
  }, [filters, sort, filterValidation, sortValidation]);

  // Memoized filtered data
  const filteredData = useMemo(() => {
    return applyFiltersAndSort(data);
  }, [data, applyFiltersAndSort]);

  // Clear persisted state
  const clearPersistedState = useCallback(() => {
    if (!enablePersistence || typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.removeItem(persistenceKey);
    } catch (error) {
      console.warn('Failed to clear persisted state:', error);
    }
  }, [enablePersistence, persistenceKey]);

  // Auto-correct invalid state on mount
  useEffect(() => {
    if (!filterValidation.isValid) {
      console.warn('Auto-correcting invalid filter state:', filterValidation.errors);
      setFiltersState(filterValidation.sanitizedFilters);
    }
    
    if (!sortValidation.isValid) {
      console.warn('Auto-correcting invalid sort state:', sortValidation.errors);
      setSortState(sortValidation.sanitizedSort);
    }
  }, []); // Only run on mount

  return {
    // Filter state
    filters: filterValidation.isValid ? filters : filterValidation.sanitizedFilters,
    setFilters,
    updateFilter,
    resetFilters,
    
    // Sort state
    sort: sortValidation.isValid ? sort : sortValidation.sanitizedSort,
    setSort,
    updateSort,
    resetSort,
    
    // Validation
    filterValidation,
    sortValidation,
    isValid,
    
    // Filter utilities
    hasActiveFilters,
    activeFilterCount,
    
    // Data processing
    applyFiltersAndSort,
    filteredData,
    
    // Persistence
    clearPersistedState,
  };
}

/**
 * Hook for managing search functionality with debouncing
 */
export function useHistorySearch(
  data: BetRecord[] = [],
  debounceMs: number = 300
): {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  debouncedSearchTerm: string;
  searchResults: BetRecord[];
  isSearching: boolean;
  clearSearch: () => void;
} {
  const [searchTerm, setSearchTermState] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search term
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsSearching(false);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  // Apply search filter
  const searchResults = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return data;
    }

    return HistoryFilters.filterBySearch(data, debouncedSearchTerm);
  }, [data, debouncedSearchTerm]);

  const setSearchTerm = useCallback((term: string) => {
    const sanitized = term.replace(/[<>\"'&]/g, '').substring(0, 100);
    setSearchTermState(sanitized);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTermState('');
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    searchResults,
    isSearching,
    clearSearch,
  };
}

/**
 * Hook for managing filter presets
 */
export function useFilterPresets(): {
  presets: Record<string, FilterState>;
  savePreset: (name: string, filters: FilterState) => void;
  loadPreset: (name: string) => FilterState | null;
  deletePreset: (name: string) => void;
  getPresetNames: () => string[];
} {
  const [presets, setPresets] = useState<Record<string, FilterState>>(() => {
    if (typeof window === 'undefined') {
      return {};
    }

    try {
      const stored = localStorage.getItem('shibplay-filter-presets');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn('Failed to load filter presets:', error);
      return {};
    }
  });

  const persistPresets = useCallback((newPresets: Record<string, FilterState>) => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem('shibplay-filter-presets', JSON.stringify(newPresets));
    } catch (error) {
      console.warn('Failed to persist filter presets:', error);
    }
  }, []);

  const savePreset = useCallback((name: string, filters: FilterState) => {
    const newPresets = { ...presets, [name]: filters };
    setPresets(newPresets);
    persistPresets(newPresets);
  }, [presets, persistPresets]);

  const loadPreset = useCallback((name: string): FilterState | null => {
    return presets[name] || null;
  }, [presets]);

  const deletePreset = useCallback((name: string) => {
    const newPresets = { ...presets };
    delete newPresets[name];
    setPresets(newPresets);
    persistPresets(newPresets);
  }, [presets, persistPresets]);

  const getPresetNames = useCallback((): string[] => {
    return Object.keys(presets);
  }, [presets]);

  return {
    presets,
    savePreset,
    loadPreset,
    deletePreset,
    getPresetNames,
  };
}