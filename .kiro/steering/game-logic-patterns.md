---
inclusion: always
---

# Game Logic & State Management Patterns

## Prediction Game Flow
1. **Round States**: upcoming → live → locked → ended
2. **User Actions**: Connect wallet → Place bet → Wait for result → Claim rewards
3. **Data Flow**: Oracle price updates → Round execution → Reward calculation
4. **Real-time Updates**: 30-second intervals for round data refresh

## State Management with Zustand
```typescript
// Store pattern for game state
interface GameStore {
  currentRound: number;
  userBets: Map<number, BetInfo>;
  priceHistory: PricePoint[];
  
  // Actions
  setCurrentRound: (round: number) => void;
  addUserBet: (roundId: number, bet: BetInfo) => void;
  updatePriceHistory: (price: PricePoint) => void;
}

const useGameStore = create<GameStore>((set) => ({
  currentRound: 0,
  userBets: new Map(),
  priceHistory: [],
  
  setCurrentRound: (round) => set({ currentRound: round }),
  addUserBet: (roundId, bet) => set((state) => ({
    userBets: new Map(state.userBets).set(roundId, bet)
  })),
  updatePriceHistory: (price) => set((state) => ({
    priceHistory: [...state.priceHistory.slice(-99), price]
  })),
}));
```

## Round Management Patterns
```typescript
// Hook for round data with auto-refresh
const useRounds = (options: RoundOptions) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['rounds', options],
    queryFn: () => fetchRounds(options),
    refetchInterval: 30000, // 30 seconds
  });

  return { data, isLoading, refetch };
};

// Round status determination
const getRoundStatus = (round: Round): RoundStatus => {
  const now = Date.now() / 1000;
  
  if (now < round.startTimestamp) return 'upcoming';
  if (now < round.lockTimestamp) return 'live';
  if (now < round.closeTimestamp) return 'locked';
  if (!round.oracleCalled) return 'pending';
  return 'ended';
};
```

## Betting Logic
```typescript
// Bet placement validation
const validateBet = (amount: bigint, userBalance: bigint, minBet: bigint) => {
  if (amount < minBet) throw new Error('Bet amount below minimum');
  if (amount > userBalance) throw new Error('Insufficient balance');
  return true;
};

// Reward calculation
const calculateReward = (
  userBet: BetInfo,
  round: Round
): bigint => {
  if (!isWinningBet(userBet, round)) return BigInt(0);
  
  const winningPool = userBet.position === Position.Bull 
    ? round.bullAmount 
    : round.bearAmount;
  
  const rewardRate = round.totalAmount / winningPool;
  return userBet.amount * rewardRate;
};
```

## Price Oracle Integration
```typescript
// Price update handling
const usePriceUpdates = () => {
  const [currentPrice, setCurrentPrice] = useState<bigint>(BigInt(0));
  
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const price = await getLatestPrice();
        setCurrentPrice(price);
      } catch (error) {
        console.error('Price update failed:', error);
      }
    }, 10000); // 10 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  return currentPrice;
};
```

## Error Recovery Patterns
```typescript
// Transaction retry logic
const useTransactionWithRetry = () => {
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  
  const executeWithRetry = async (transaction: () => Promise<void>) => {
    try {
      await transaction();
      setRetryCount(0);
    } catch (error) {
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => executeWithRetry(transaction), 2000);
      } else {
        throw error;
      }
    }
  };
  
  return { executeWithRetry, retryCount };
};
```

## Data Synchronization
- Use React Query for server state management
- Implement optimistic updates for better UX
- Handle stale data with background refetching
- Cache user bet history locally
- Sync wallet connection state across tabs

## Performance Optimization
- Lazy load historical data
- Implement virtual scrolling for large lists
- Use React.memo for expensive calculations
- Debounce user inputs
- Preload next round data