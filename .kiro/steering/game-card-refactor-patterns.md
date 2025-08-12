---
inclusion: fileMatch
fileMatchPattern: '*game-card*'
---

# Game Card Refactor Patterns

## Component Interface Standards
The GameCard component should follow this specific interface pattern:

```typescript
interface GameCardProps {
  round: Round;  // Full Round object, not roundId
  active: boolean;
}

type GameCardState = "live" | "ended" | "upcoming";
```

## State Mapping Logic
Use this exact state mapping function to convert Round.status to component state:

```typescript
const getGameCardState = (round: Round): GameCardState => {
  switch (round.status) {
    case "Live":
      return "live";
    case "Ended":
      return "ended";
    default:
      return "upcoming";
  }
};
```

## Progress Calculation Pattern
Always use `round.startTimeStamp` directly for progress calculations:

```typescript
const progress = calculateProgress(Number(round.startTimeStamp));
```

## Removed Dependencies
These hooks and imports should NOT be used in GameCard:
- ❌ `useStartRounds` hook
- ❌ `isStartLoading` variable
- ❌ `startRound` variable  
- ❌ `getCurrentRound()` function
- ❌ `StartRound` import from graphql-client

## Parent Component Integration
The parent component should pass the full Round object:

```typescript
<GameCard
  round={round}
  active={selected === index}
/>
```

## Required Component Features
Every GameCard must include:
- ✅ State labels (Live, Ended, Upcoming)
- ✅ Progress bar with countdown
- ✅ Betting buttons (Higher/Lower) for upcoming rounds
- ✅ Price display with real-time updates
- ✅ Animations (motion.div, ShineBorder)
- ✅ Responsive design with scale transitions

## Testing Requirements
Before considering the refactor complete:
1. All three game states render correctly
2. Progress bars and timers work with new data source
3. Betting functionality remains intact
4. Carousel navigation works properly
5. Active state highlighting functions
6. TypeScript strict mode compliance
7. No ESLint warnings for unused variables

## Performance Considerations
- Remove all unused hook calls to improve performance
- Use direct prop access instead of additional API calls
- Maintain smooth carousel transitions with proper state management