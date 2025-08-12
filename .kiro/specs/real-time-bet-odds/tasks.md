# Implementation Plan

- [ ] 1. Create core real-time odds calculation hook
  - Implement useRealTimeOdds hook with React Query polling at 15-second intervals
  - Add odds calculation logic that processes GetAllRounds data for specific roundId
  - Include error handling and fallback to static calculation when polling fails
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4_

- [ ] 2. Implement animated odds display component
  - Create AnimatedOdds component using framer-motion for smooth value transitions
  - Add animation state management to track value changes and trigger appropriate animations
  - Implement color highlighting for odds increases/decreases during transitions
  - _Requirements: 1.3, 3.1, 3.2, 3.3, 3.4_

- [ ] 3. Add visibility-based polling optimization
  - Implement intersection observer to detect when game cards are visible
  - Modify useRealTimeOdds hook to pause polling when cards are not in viewport
  - Add cleanup logic to stop polling when components unmount
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 4. Integrate real-time odds into GameCard component
  - Modify GameCard component to use useRealTimeOdds hook for upcoming rounds only
  - Replace static odds display with AnimatedOdds component for upcoming state
  - Ensure live and ended rounds continue using existing static odds calculation
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 5. Add comprehensive error handling and fallback mechanisms
  - Implement retry logic with exponential backoff for failed API requests
  - Add fallback to existing static odds calculation when real-time polling fails
  - Create visual indicators for connection status and data freshness
  - _Requirements: 2.1, 2.2, 4.4_

- [ ] 6. Write unit tests for odds calculation and animation logic
  - Create tests for odds calculation function with various pool scenarios including edge cases
  - Test animation state management and transition logic
  - Add tests for hook lifecycle including mounting, unmounting, and state changes
  - _Requirements: 1.1, 1.2, 2.3, 2.4_

- [ ] 7. Write integration tests for GameCard component
  - Test real-time odds integration with existing GameCard functionality
  - Verify that only upcoming rounds use real-time polling while live/ended use static odds
  - Test performance impact with multiple cards displaying real-time odds
  - _Requirements: 4.1, 5.1, 5.2, 5.3, 5.4_

- [ ] 8. Optimize performance and prevent memory leaks
  - Implement shared query cache to avoid duplicate GetAllRounds requests
  - Add debouncing to prevent excessive re-renders during rapid odds changes
  - Ensure proper cleanup of intervals, observers, and event listeners
  - _Requirements: 4.1, 4.2, 4.3, 4.4_