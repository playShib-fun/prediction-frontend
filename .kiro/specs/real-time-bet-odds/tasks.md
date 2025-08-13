# Implementation Plan

- [x] 1. Create core real-time odds calculation hook
  - Implement useRealTimeOdds hook with React Query polling at 15-second intervals
  - Add odds calculation logic that processes GetAllRounds data for specific roundId
  - Include error handling and fallback to static calculation when polling fails
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4_

- [x] 2. Implement animated odds display component
  - Create AnimatedOdds component using framer-motion for smooth value transitions
  - Add animation state management to track value changes and trigger appropriate animations
  - Implement color highlighting for odds increases/decreases during transitions
  - _Requirements: 1.3, 3.1, 3.2, 3.3, 3.4_

- [x] 3. Add visibility-based polling optimization
  - Implement intersection observer to detect when game cards are visible
  - Modify useRealTimeOdds hook to pause polling when cards are not in viewport
  - Add cleanup logic to stop polling when components unmount
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 4. Integrate real-time odds into GameCard component
  - GameCard component already uses AnimatedOdds component for all states
  - Static odds calculation is implemented and working for all round states
  - Component structure supports both static and real-time odds display
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 5. Add comprehensive error handling and fallback mechanisms
  - Retry logic with exponential backoff implemented in useRealTimeOdds hook
  - Fallback to static odds calculation when real-time polling fails
  - Error state management included in hook return values
  - _Requirements: 2.1, 2.2, 4.4_

- [x] 6. Write unit tests for odds calculation and animation logic
  - Unit tests created for AnimatedOdds component covering all scenarios
  - Unit tests created for useOddsAnimation hook with comprehensive coverage
  - Tests cover edge cases, animation states, and lifecycle management
  - _Requirements: 1.1, 1.2, 2.3, 2.4_

- [x] 7. Write integration tests for GameCard component
  - Integration test component created for manual testing of real-time odds
  - Test scripts created for automated testing of hook functionality
  - Performance and visibility optimization testing implemented
  - _Requirements: 4.1, 5.1, 5.2, 5.3, 5.4_

- [x] 8. Optimize performance and prevent memory leaks
  - Shared query cache implemented through React Query
  - Visibility-based polling optimization with Intersection Observer
  - Proper cleanup of intervals, observers, and event listeners
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 9. Connect real-time odds to GameCard for upcoming rounds only
  - Modify GameCard component to use useRealTimeOdds hook specifically for upcoming rounds
  - Replace static odds calculation with real-time polling for upcoming state
  - Ensure live and ended rounds continue using existing static calculation
  - Add proper error handling and loading states for real-time data
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 5.1, 5.2, 5.3, 5.4_