# Prediction Game Data Usage Guide

This guide explains how to use the comprehensive GraphQL data fetching system for the Shib prediction game on Puppynet.

## Overview

The system provides:

- **GraphQL Client**: Configured to connect to the prediction game API
- **TypeScript Types**: Full type safety for all data structures
- **React Query Hooks**: Optimized data fetching with caching, filtering, and sorting
- **Utility Functions**: Helper functions for data manipulation
- **Example Components**: Ready-to-use UI components

## Quick Start

### 1. Basic Usage

```tsx
import { useLatestRounds, useUserBets } from "@/hooks/use-prediction-data";

function MyComponent() {
  // Get latest 10 rounds
  const { data: rounds, isLoading } = useLatestRounds(10);

  // Get user bets for a specific address
  const { bullBets, bearBets } = useUserBets("0x1234...", 50);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {rounds?.map((round) => (
        <div key={round.id}>Epoch: {round.epoch}</div>
      ))}
    </div>
  );
}
```

### 2. Using the Dashboard Component

```tsx
import { PredictionDashboard } from "@/components/shibplay/prediction-dashboard";

export default function DashboardPage() {
  return <PredictionDashboard />;
}
```

## Available Hooks

### Core Data Hooks

#### Start Rounds

```tsx
// Get all start rounds with filtering
const { data, isLoading } = useStartRounds({
  startDate: new Date("2024-01-01"),
  endDate: new Date("2024-12-31"),
  limit: 50,
  sortBy: "epoch",
  ascending: false,
});

// Get specific start round by ID
const { data: round } = useStartRound("round-id-here");
```

#### Lock Rounds

```tsx
// Get lock rounds with options
const { data } = useLockRounds({
  roundId: "specific-round",
  epoch: "123",
  sortBy: "lockPrice",
  limit: 20,
});

// Get specific lock round
const { data: lockRound } = useLockRound("lock-round-id");
```

#### End Rounds

```tsx
// Get end rounds with filtering
const { data } = useEndRounds({
  startDate: new Date("2024-01-01"),
  sortBy: "closePrice",
  ascending: true,
});

// Get specific end round
const { data: endRound } = useEndRound("end-round-id");
```

#### Rewards Calculated

```tsx
// Get rewards with filtering
const { data } = useRewardsCalculated({
  roundId: "round-id",
  sortBy: "rewardAmount",
  limit: 10,
});

// Get specific reward
const { data: reward } = useRewardsCalculatedById("reward-id");
```

#### Bet Bulls

```tsx
// Get bull bets with filtering
const { data } = useBetBulls({
  sender: "0x1234...",
  roundId: "round-id",
  sortBy: "amount",
  limit: 25,
});

// Get specific bull bet
const { data: bet } = useBetBull("bet-id");
```

#### Bet Bears

```tsx
// Get bear bets with filtering
const { data } = useBetBears({
  sender: "0x1234...",
  startDate: new Date("2024-01-01"),
  sortBy: "timestamp",
  ascending: false,
});

// Get specific bear bet
const { data: bet } = useBetBear("bet-id");
```

#### Claims

```tsx
// Get claims with filtering
const { data } = useClaims({
  sender: "0x1234...",
  roundId: "round-id",
  sortBy: "amount",
  limit: 15,
});

// Get specific claim
const { data: claim } = useClaim("claim-id");
```

### Utility Hooks

#### Latest Rounds

```tsx
// Get latest rounds (default: 10, sorted by epoch descending)
const { data: latestRounds } = useLatestRounds(5);
```

#### User Bets

```tsx
// Get all bets for a user (both bull and bear)
const { bullBets, bearBets, isLoading } = useUserBets("0x1234...", 50);
```

#### Round Details

```tsx
// Get complete round information
const { lockRound, endRound, rewards, isLoading } = useRoundDetails("round-id");
```

#### Combined Data

```tsx
// Get all rounds data in one query
const { data: roundsData } = useRoundsData();

// Get all bets data in one query
const { data: betsData } = useBetsData();
```

## Filtering and Sorting Options

All hooks support these filtering options:

### Date Range Filtering

```tsx
{
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31')
}
```

### Sorting Options

```tsx
{
  sortBy: 'timestamp' | 'amount' | 'epoch' | 'lockPrice' | 'closePrice' | 'rewardAmount',
  ascending: true | false
}
```

### Other Filters

```tsx
{
  roundId: 'specific-round-id',
  sender: '0x1234...',
  epoch: '123',
  limit: 50
}
```

## Utility Functions

### Data Filtering

```tsx
import { filterAndSortData } from "@/hooks/use-prediction-data";

// Filter by date range
const filtered = filterAndSortData.byDateRange(data, startDate, endDate);

// Filter by sender
const userData = filterAndSortData.bySender(data, "0x1234...");

// Filter by round ID
const roundData = filterAndSortData.byRoundId(data, "round-id");

// Filter by epoch
const epochData = filterAndSortData.byEpoch(data, "123");

// Search by transaction hash
const txData = filterAndSortData.byTransactionHash(data, "0xabc...");
```

### Data Sorting

```tsx
// Sort by timestamp
const sorted = filterAndSortData.byTimestamp(data, false); // newest first

// Sort by amount
const sorted = filterAndSortData.byAmount(data, true); // lowest first

// Sort by epoch
const sorted = filterAndSortData.byEpochSort(data, false); // newest first
```

### Data Limiting

```tsx
// Limit results
const limited = filterAndSortData.limit(data, 10);
```

## Data Types

All data is fully typed. Here are the main interfaces:

```tsx
interface StartRound {
  epoch: string;
  id: string;
  logIndex: string;
  transactionHash: string;
  timestamp: string;
}

interface LockRound {
  epoch: string;
  id: string;
  lockPrice: string; // in Wei
  logIndex: string;
  roundId: string;
  timestamp: string;
  transactionHash: string;
}

interface EndRound {
  closePrice: string; // in Wei
  epoch: string;
  id: string;
  logIndex: string;
  roundId: string;
  timestamp: string;
  transactionHash: string;
}

interface BetBull {
  amount: string; // in Wei
  id: string;
  logIndex: string;
  roundId: string;
  sender: string;
  timestamp: string;
  transactionHash: string;
}

interface BetBear {
  id: string;
  amount: string; // in Wei
  logIndex: string;
  roundId: string;
  sender: string;
  timestamp: string;
  transactionHash: string;
}

interface Claim {
  amount: string; // in Wei
  id: string;
  logIndex: string;
  roundId: string;
  sender: string;
  timestamp: string;
  transactionHash: string;
}

interface RewardsCalculated {
  id: string;
  logIndex: string;
  rewardAmount: string; // in Wei
  rewardBaseCalAmount: string;
  roundId: string;
  timestamp: string;
  transactionHash: string;
  treasuryAmt: string; // in Wei
}
```

## Utility Functions for Data Formatting

```tsx
// Convert Wei to ETH
const formatWeiToEth = (wei: string) => {
  return (parseFloat(wei) / 1e18).toFixed(4);
};

// Format timestamp
const formatTimestamp = (timestamp: string) => {
  return formatDistanceToNow(new Date(parseInt(timestamp) * 1000), {
    addSuffix: true,
  });
};

// Shorten address
const shortenAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
```

## Error Handling

All hooks return error states:

```tsx
const { data, isLoading, error } = useLatestRounds(10);

if (error) {
  console.error("Failed to fetch rounds:", error);
  return <div>Error loading data</div>;
}
```

## Performance Optimization

### Query Keys

All queries use proper query keys for caching:

```tsx
// Query keys are automatically managed
const queryKeys = {
  all: ["prediction"],
  startRounds: () => [...queryKeys.all, "startRounds"],
  startRound: (id: string) => [...queryKeys.startRounds(), id],
  // ... etc
};
```

### Selective Queries

Use specific queries instead of fetching all data:

```tsx
// Good: Fetch only what you need
const { data } = useBetBulls({ sender: userAddress, limit: 10 });

// Avoid: Fetching everything and filtering client-side
const { data: allBets } = useBetBulls();
const userBets = allBets?.filter((bet) => bet.sender === userAddress);
```

### Combined Queries

Use combined queries for related data:

```tsx
// Efficient: Get all rounds data in one query
const { data: roundsData } = useRoundsData();

// Efficient: Get all bets data in one query
const { data: betsData } = useBetsData();
```

## Advanced Usage Examples

### Real-time Dashboard

```tsx
function LiveDashboard() {
  const { data: latestRounds } = useLatestRounds(5);
  const { data: recentBets } = useBetBulls({ limit: 20 });
  const { data: recentClaims } = useClaims({ limit: 10 });

  return (
    <div className="grid grid-cols-3 gap-4">
      <div>Latest Rounds: {latestRounds?.length}</div>
      <div>Recent Bets: {recentBets?.length}</div>
      <div>Recent Claims: {recentClaims?.length}</div>
    </div>
  );
}
```

### User Profile

```tsx
function UserProfile({ address }: { address: string }) {
  const { bullBets, bearBets, isLoading } = useUserBets(address, 100);
  const { data: claims } = useClaims({ sender: address, limit: 50 });

  const totalBets = (bullBets?.length || 0) + (bearBets?.length || 0);
  const totalBetAmount = [...(bullBets || []), ...(bearBets || [])].reduce(
    (sum, bet) => sum + parseFloat(bet.amount),
    0
  );

  return (
    <div>
      <h2>User Profile: {shortenAddress(address)}</h2>
      <p>Total Bets: {totalBets}</p>
      <p>Total Amount: {formatWeiToEth(totalBetAmount.toString())} ETH</p>
      <p>Claims: {claims?.length || 0}</p>
    </div>
  );
}
```

### Round Analysis

```tsx
function RoundAnalysis({ roundId }: { roundId: string }) {
  const { lockRound, endRound, rewards, isLoading } = useRoundDetails(roundId);
  const { data: bullBets } = useBetBulls({ roundId });
  const { data: bearBets } = useBetBears({ roundId });

  if (isLoading) return <div>Loading...</div>;

  const totalBullAmount =
    bullBets?.reduce((sum, bet) => sum + parseFloat(bet.amount), 0) || 0;
  const totalBearAmount =
    bearBets?.reduce((sum, bet) => sum + parseFloat(bet.amount), 0) || 0;

  return (
    <div>
      <h3>Round {roundId} Analysis</h3>
      <p>
        Lock Price: {lockRound ? formatWeiToEth(lockRound.lockPrice) : "N/A"}{" "}
        ETH
      </p>
      <p>
        Close Price: {endRound ? formatWeiToEth(endRound.closePrice) : "N/A"}{" "}
        ETH
      </p>
      <p>Bull Bets: {formatWeiToEth(totalBullAmount.toString())} ETH</p>
      <p>Bear Bets: {formatWeiToEth(totalBearAmount.toString())} ETH</p>
      <p>
        Rewards: {rewards ? formatWeiToEth(rewards.rewardAmount) : "N/A"} ETH
      </p>
    </div>
  );
}
```

## Best Practices

1. **Use specific queries**: Don't fetch all data if you only need a subset
2. **Implement proper loading states**: Always handle loading and error states
3. **Use the utility functions**: Leverage the built-in filtering and sorting
4. **Cache efficiently**: React Query handles caching automatically
5. **Format data properly**: Use the utility functions for consistent formatting
6. **Handle errors gracefully**: Always provide fallback UI for error states
7. **Optimize for mobile**: Consider limiting data on mobile devices
8. **Use TypeScript**: Take advantage of the full type safety

## Troubleshooting

### Common Issues

1. **Data not loading**: Check the GraphQL endpoint URL
2. **Type errors**: Ensure you're using the correct TypeScript types
3. **Performance issues**: Use limits and specific queries
4. **Caching issues**: Clear React Query cache if needed

### Debug Queries

```tsx
// Enable React Query DevTools in development
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

function App() {
  return (
    <>
      <YourApp />
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
}
```
