# Implementation Plan

- [x] 1. Update GameCard component interface and state logic
  - Modify GameCardProps interface to accept full Round object instead of roundId and state
  - Add internal state mapping function to convert Round.status to component state
  - Remove useStartRounds hook dependency and related loading states
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Refactor progress calculation logic
  - Replace getCurrentRound() function with direct access to round prop
  - Update progress calculation to use round.startTimeStamp instead of startRound.timestamp
  - Remove isStartLoading checks from progress calculation
  - _Requirements: 3.2, 3.3_

- [x] 3. Update parent component to pass Round object
  - Modify GameCard usage in page.tsx to pass full Round object
  - Remove state mapping logic from parent component
  - Update carousel rendering to use new prop structure
  - _Requirements: 3.1, 3.4_

- [x] 4. Clean up unused code and imports
  - Remove unused useStartRounds import and hook usage
  - Remove unused variables (isStartLoading, startRound, getCurrentRound)
  - Remove unused StartRound import from graphql-client
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 5. Ensure TypeScript compliance and fix linting issues
  - Run TypeScript compiler to check for strict mode compliance
  - Run ESLint to identify and fix unused variable warnings
  - Add proper type annotations for new state mapping function
  - Verify no implicit any types are introduced
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 6. Test component functionality and performance
  - Manually test all three game states (live, ended, upcoming) render correctly
  - Verify progress bars and timers work with new data source
  - Confirm betting functionality and user interactions remain intact
  - Test carousel navigation and active state highlighting
  - _Requirements: 1.4, 3.4, 4.1, 4.2, 4.3, 4.4_