# Design Document

## Overview

This design outlines the refactoring of the GameCard component to use the `status` field from the AllRounds GraphQL query instead of separate API calls for determining round states. The refactoring will simplify the component logic, reduce API calls, and ensure TypeScript compliance.

## Architecture

### Current Architecture
- GameCard component receives `state` prop from parent component
- Parent component (page.tsx) already uses `useRounds` hook to fetch AllRounds data
- Parent component maps `round.status` to component state values
- GameCard component makes additional API calls via `useStartRounds` hook

### Target Architecture
- GameCard component will receive the full `Round` object as a prop instead of just `roundId` and `state`
- Component will determine state internally from the `Round.status` field
- Remove dependency on `useStartRounds` hook within GameCard
- Maintain existing state mapping logic but move it inside GameCard component

## Components and Interfaces

### Updated GameCard Interface
```typescript
interface GameCardProps {
  round: Round; // Full Round object instead of roundId and state
  active?: boolean;
}
```

### State Mapping Logic
```typescript
type GameCardState = "live" | "ended" | "upcoming";

const getGameCardState = (status: string): GameCardState => {
  switch (status.toLowerCase()) {
    case "live":
      return "live";
    case "ended":
      return "ended";
    default:
      return "upcoming";
  }
};
```

### Progress Calculation Updates
- Replace `getCurrentRound()` function with direct access to `round` prop
- Use `round.startTimeStamp` instead of `startRound.timestamp`
- Remove `useStartRounds` hook and related loading states

## Data Models

### Round Interface (Existing)
```typescript
interface Round {
  bearAmount: string;
  bullAmount: string;
  id: string;
  pricePool: string;
  roundId: string;
  startTimeStamp: string;
  status: string; // This is the key field we'll use
  updateTimeStamp: string;
  users: string;
}
```

### Component State Updates
- Remove `useStartRounds` hook usage
- Remove `isStartLoading` state
- Remove `getCurrentRound()` function
- Update progress calculation to use `round.startTimeStamp`

## Error Handling

### Removed Error States
- Remove error handling for `useStartRounds` hook
- Simplify loading states by removing `isStartLoading`

### Maintained Error States
- Keep existing error handling for other hooks (`useBetBears`, `useBetBulls`, etc.)
- Maintain proper fallback values for undefined data

## Testing Strategy

### Unit Testing Approach
- Test state mapping function with different status values
- Test component rendering with different Round objects
- Verify progress calculation works with Round.startTimeStamp

### Integration Testing
- Test parent-child component interaction with new prop structure
- Verify carousel functionality still works correctly
- Test real-time updates and refetch behavior

### Manual Testing Checklist
- Verify all three states (live, ended, upcoming) render correctly
- Check progress bars and timers work properly
- Confirm betting functionality remains intact
- Test responsive design and animations

## Implementation Details

### File Changes Required
1. **src/components/shibplay/game-card.tsx**
   - Update GameCardProps interface
   - Remove useStartRounds hook
   - Add getGameCardState function
   - Update progress calculation logic
   - Remove unused imports and variables

2. **src/app/page.tsx**
   - Update GameCard usage to pass full Round object
   - Remove state mapping logic (move to GameCard)

### TypeScript Compliance
- Remove unused imports (`useStartRounds`)
- Remove unused variables (`isStartLoading`, `startRound`)
- Add proper typing for new state mapping function
- Ensure no implicit `any` types

### Performance Improvements
- Reduce API calls by removing `useStartRounds` hook
- Simplify component re-render logic
- Maintain existing 30-second refetch interval for rounds data

## Migration Strategy

### Phase 1: Update GameCard Component
- Modify GameCardProps interface
- Add internal state mapping logic
- Remove useStartRounds dependency
- Update progress calculation

### Phase 2: Update Parent Component
- Modify GameCard usage in page.tsx
- Pass full Round object instead of individual props
- Remove state mapping from parent

### Phase 3: Cleanup and Testing
- Remove unused imports and variables
- Run TypeScript and ESLint checks
- Perform manual testing of all states
- Verify performance improvements