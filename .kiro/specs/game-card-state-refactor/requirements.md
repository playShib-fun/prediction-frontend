# Requirements Document

## Introduction

This feature involves refactoring the GameCard component to use the `status` field from the AllRounds GraphQL query instead of relying on separate `startRound`, `lockRound`, and `endRound` calls. The goal is to simplify the state management logic, improve performance by reducing API calls, and ensure proper TypeScript compliance with strict mode and unused variable checks.

## Requirements

### Requirement 1

**User Story:** As a developer, I want the GameCard component to determine round states from the AllRounds GraphQL query response, so that we reduce the number of API calls and simplify state management.

#### Acceptance Criteria

1. WHEN the GameCard component renders THEN it SHALL use the `status` field from the Round interface to determine the game state
2. WHEN the component needs to determine if a round is "live", "ended", or "upcoming" THEN it SHALL map the GraphQL `status` field values to the appropriate component states
3. WHEN the component renders THEN it SHALL NOT make separate calls to `useStartRounds`, `useLockRounds`, or `useEndRounds` hooks
4. WHEN the refactoring is complete THEN the component SHALL maintain the same visual behavior and user experience as before

### Requirement 2

**User Story:** As a developer, I want the code to pass TypeScript strict mode checks, so that we maintain code quality and avoid runtime errors.

#### Acceptance Criteria

1. WHEN the code is compiled THEN it SHALL pass all TypeScript strict mode checks without errors
2. WHEN the code is linted THEN it SHALL pass ESLint checks for unused variables and imports
3. WHEN variables are declared THEN they SHALL be used or properly marked as intentionally unused
4. WHEN the refactoring is complete THEN there SHALL be no TypeScript `any` types unless explicitly required

### Requirement 3

**User Story:** As a developer, I want the GameCard component to maintain proper state management, so that the game logic continues to work correctly.

#### Acceptance Criteria

1. WHEN the component determines round state THEN it SHALL correctly map GraphQL status values to component state values
2. WHEN the component calculates progress and timing THEN it SHALL use the appropriate Round data from the AllRounds query
3. WHEN the component needs round-specific data THEN it SHALL access it from the Round interface instead of separate API calls
4. WHEN the component renders different states THEN it SHALL display the correct UI elements for "live", "ended", and "upcoming" states

### Requirement 4

**User Story:** As a developer, I want the refactored code to maintain performance, so that the application remains responsive.

#### Acceptance Criteria

1. WHEN the component renders THEN it SHALL make fewer API calls than the previous implementation
2. WHEN the component updates THEN it SHALL not cause unnecessary re-renders or API requests
3. WHEN the AllRounds query is used THEN it SHALL provide all necessary data for state determination
4. WHEN the component mounts THEN it SHALL efficiently determine the round state without blocking the UI