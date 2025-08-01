# Prediction Contract Integration Guide

This guide covers the complete integration of the Prediction Contract (`0x4ACB55Cea2a25FEF18460a41fC7bB5dF2d2cd7bc`) into your ShibPlay application.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Contract Functions](#contract-functions)
3. [Usage Examples](#usage-examples)
4. [Quick Start](#quick-start)
5. [Advanced Usage](#advanced-usage)
6. [Troubleshooting](#troubleshooting)

## 🎯 Overview

The Prediction Contract provides a complete prediction market system with the following features:

- **Betting System**: Place bull/bear bets on price movements
- **Round Management**: Automatic round execution and management
- **Reward System**: Claim rewards for winning predictions
- **Admin Controls**: Complete contract management for owners/admins
- **Oracle Integration**: Real-time price data integration

## 📜 Contract Functions

### Read Functions

| Function                                                    | Description              | Returns                           |
| ----------------------------------------------------------- | ------------------------ | --------------------------------- |
| `currentEpoch()`                                            | Get current epoch        | `uint256`                         |
| `rounds(uint256 epoch)`                                     | Get round data           | `Round struct`                    |
| `ledger(uint256 epoch, address user)`                       | Get user bet info        | `BetInfo struct`                  |
| `claimable(uint256 epoch, address user)`                    | Check if user can claim  | `bool`                            |
| `refundable(uint256 epoch, address user)`                   | Check if user can refund | `bool`                            |
| `getUserRounds(address user, uint256 cursor, uint256 size)` | Get user rounds          | `(uint256[], BetInfo[], uint256)` |
| `getUserRoundsLength(address user)`                         | Get user rounds count    | `uint256`                         |

### Write Functions

| Function                  | Description           | Parameters                |
| ------------------------- | --------------------- | ------------------------- |
| `betBull(uint256 epoch)`  | Place bull bet        | `epoch`: Epoch number     |
| `betBear(uint256 epoch)`  | Place bear bet        | `epoch`: Epoch number     |
| `claim(uint256[] epochs)` | Claim rewards         | `epochs`: Array of epochs |
| `executeRound()`          | Execute round (admin) | None                      |
| `genesisStartRound()`     | Start genesis (admin) | None                      |
| `genesisLockRound()`      | Lock genesis (admin)  | None                      |

### Admin Functions

| Function                                 | Description      | Parameters                       |
| ---------------------------------------- | ---------------- | -------------------------------- |
| `setAdmin(address _adminAddress)`        | Set admin        | `_adminAddress`: New admin       |
| `setOperator(address _operatorAddress)`  | Set operator     | `_operatorAddress`: New operator |
| `setOracle(address _oracle)`             | Set oracle       | `_oracle`: Oracle address        |
| `setMinBetAmount(uint256 _minBetAmount)` | Set min bet      | `_minBetAmount`: Minimum bet     |
| `setTreasuryFee(uint256 _treasuryFee)`   | Set treasury fee | `_treasuryFee`: Fee percentage   |
| `pause()`                                | Pause contract   | None                             |
| `unpause()`                              | Unpause contract | None                             |

## 🚀 Quick Start

### 1. Basic Setup

```typescript
import { predictionUtils, predictionConfig } from "@/lib/contracts/prediction";
import { createPublicClient, http } from "viem";
import { shibarium } from "wagmi/chains";

// Create client
const client = createPublicClient({
  chain: shibarium,
  transport: http(),
});

// Get current epoch
const currentEpoch = await predictionUtils.getCurrentEpoch(client);
console.log("Current epoch:", currentEpoch.toString());
```

### 2. Place a Bet

```typescript
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { predictionConfig } from "@/lib/contracts/prediction";

function BetComponent() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const placeBullBet = (epoch: bigint, amount: bigint) => {
    writeContract({
      ...predictionConfig,
      functionName: "betBull",
      args: [epoch],
      value: amount,
    });
  };

  const placeBearBet = (epoch: bigint, amount: bigint) => {
    writeContract({
      ...predictionConfig,
      functionName: "betBear",
      args: [epoch],
      value: amount,
    });
  };

  return (
    <div>
      <button
        onClick={() => placeBullBet(BigInt(123), BigInt("1000000000000000000"))}
        disabled={isPending}
      >
        {isPending ? "Placing bet..." : "Bet Bull"}
      </button>

      <button
        onClick={() => placeBearBet(BigInt(123), BigInt("1000000000000000000"))}
        disabled={isPending}
      >
        {isPending ? "Placing bet..." : "Bet Bear"}
      </button>

      {isSuccess && <p>Bet placed successfully!</p>}
    </div>
  );
}
```

### 3. Get Round Data

```typescript
import { useReadContract } from "wagmi";
import { predictionConfig } from "@/lib/contracts/prediction";

function RoundDataComponent({ epoch }: { epoch: bigint }) {
  const {
    data: round,
    isLoading,
    error,
  } = useReadContract({
    ...predictionConfig,
    functionName: "rounds",
    args: [epoch],
  });

  if (isLoading) return <div>Loading round data...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!round) return <div>No round data</div>;

  return (
    <div>
      <h3>Round {epoch.toString()}</h3>
      <p>Start: {new Date(Number(round[1]) * 1000).toLocaleString()}</p>
      <p>Lock: {new Date(Number(round[2]) * 1000).toLocaleString()}</p>
      <p>Close: {new Date(Number(round[3]) * 1000).toLocaleString()}</p>
      <p>Lock Price: ${(Number(round[4]) / 1e8).toFixed(4)}</p>
      <p>Close Price: ${(Number(round[5]) / 1e8).toFixed(4)}</p>
      <p>Total Amount: {(Number(round[8]) / 1e18).toFixed(4)} BONE</p>
      <p>Bull Amount: {(Number(round[9]) / 1e18).toFixed(4)} BONE</p>
      <p>Bear Amount: {(Number(round[10]) / 1e18).toFixed(4)} BONE</p>
      <p>Oracle Called: {round[13] ? "Yes" : "No"}</p>
    </div>
  );
}
```

### 4. Check User Bets

```typescript
import { useReadContract } from "wagmi";
import { predictionConfig } from "@/lib/contracts/prediction";
import { useAccount } from "wagmi";

function UserBetComponent({ epoch }: { epoch: bigint }) {
  const { address } = useAccount();

  const { data: ledger, isLoading } = useReadContract({
    ...predictionConfig,
    functionName: "ledger",
    args: [epoch, address!],
  });

  if (isLoading) return <div>Loading bet data...</div>;
  if (!ledger) return <div>No bet found</div>;

  const position = ledger[0] === BigInt(0) ? "Bull" : "Bear";
  const amount = Number(ledger[1]) / 1e18;
  const claimed = ledger[2];

  return (
    <div>
      <h3>Your Bet for Round {epoch.toString()}</h3>
      <p>Position: {position}</p>
      <p>Amount: {amount.toFixed(4)} BONE</p>
      <p>Claimed: {claimed ? "Yes" : "No"}</p>
    </div>
  );
}
```

### 5. Claim Rewards

```typescript
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { predictionConfig } from "@/lib/contracts/prediction";
import { useReadContract } from "wagmi";

function ClaimComponent() {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Get claimable epochs
  const { data: claimableEpochs } = useReadContract({
    ...predictionConfig,
    functionName: "getClaimableEpochs",
    args: [address!],
  });

  const claimRewards = (epochs: bigint[]) => {
    writeContract({
      ...predictionConfig,
      functionName: "claim",
      args: [epochs],
    });
  };

  return (
    <div>
      <button
        onClick={() => claimRewards([BigInt(123), BigInt(124)])}
        disabled={isPending || !claimableEpochs?.length}
      >
        {isPending
          ? "Claiming..."
          : `Claim ${claimableEpochs?.length || 0} rewards`}
      </button>

      {isSuccess && <p>Rewards claimed successfully!</p>}
    </div>
  );
}
```

## 🔧 Advanced Usage

### 1. Get Formatted Round Data

```typescript
import { predictionUtils } from "@/lib/contracts/prediction";

async function getFormattedRound(client: any, epoch: bigint) {
  const formattedRound = await predictionUtils.getFormattedRound(client, epoch);

  console.log("Formatted Round:", {
    epoch: formattedRound.epoch,
    startTime: formattedRound.startTimestamp,
    lockTime: formattedRound.lockTimestamp,
    closeTime: formattedRound.closeTimestamp,
    lockPrice: formattedRound.lockPrice,
    closePrice: formattedRound.closePrice,
    totalAmount: formattedRound.totalAmount,
    bullAmount: formattedRound.bullAmount,
    bearAmount: formattedRound.bearAmount,
    oracleCalled: formattedRound.oracleCalled,
  });
}
```

### 2. Get User Rounds with Pagination

```typescript
import { predictionUtils } from "@/lib/contracts/prediction";

async function getUserRounds(client: any, user: string) {
  const cursor = BigInt(0);
  const size = BigInt(10);

  const userRounds = await predictionUtils.getFormattedUserRounds(
    client,
    user,
    cursor,
    size
  );

  console.log("User Rounds:", {
    epochs: userRounds.epochs,
    betInfos: userRounds.betInfos.map((bet) => ({
      position: bet.position === 0 ? "Bull" : "Bear",
      amount: bet.amount,
      claimed: bet.claimed,
    })),
    cursor: userRounds.cursor,
  });
}
```

### 3. Calculate Potential Rewards

```typescript
import { predictionUtils } from "@/lib/contracts/prediction";

async function calculateReward(client: any, epoch: bigint, user: string) {
  const potentialReward = await predictionUtils.calculatePotentialReward(
    client,
    epoch,
    user
  );
  const formattedReward = Number(potentialReward) / 1e18;

  console.log(
    `Potential reward for epoch ${epoch}: ${formattedReward.toFixed(4)} BONE`
  );
}
```

### 4. Get Round Status

```typescript
import { predictionUtils } from "@/lib/contracts/prediction";

async function getRoundStatus(client: any, epoch: bigint) {
  const status = await predictionUtils.getRoundStatus(client, epoch);

  console.log(`Round ${epoch} status: ${status}`);
  // Returns: "upcoming", "live", "locked", "ended", or "pending"
}
```

### 5. Check if User Has Bet

```typescript
import { predictionUtils } from "@/lib/contracts/prediction";

async function checkUserBet(client: any, epoch: bigint, user: string) {
  const hasBet = await predictionUtils.hasUserBet(client, epoch, user);

  if (hasBet) {
    const position = await predictionUtils.getUserBetPosition(
      client,
      epoch,
      user
    );
    console.log(
      `User has bet ${position === 0 ? "Bull" : "Bear"} on epoch ${epoch}`
    );
  } else {
    console.log(`User has no bet on epoch ${epoch}`);
  }
}
```

## 🎮 Integration Examples

### 1. Complete Betting Interface

```typescript
import { useState } from "react";
import { useWriteContract, useReadContract } from "wagmi";
import { predictionConfig } from "@/lib/contracts/prediction";
import { useAccount } from "wagmi";

function BettingInterface({ epoch }: { epoch: bigint }) {
  const { address } = useAccount();
  const [betAmount, setBetAmount] = useState("");
  const [betPosition, setBetPosition] = useState<"bull" | "bear">("bull");

  const { writeContract, isPending } = useWriteContract();

  // Get user's existing bet
  const { data: existingBet } = useReadContract({
    ...predictionConfig,
    functionName: "ledger",
    args: [epoch, address!],
  });

  const placeBet = () => {
    const amount = BigInt(parseFloat(betAmount) * 1e18);

    writeContract({
      ...predictionConfig,
      functionName: betPosition === "bull" ? "betBull" : "betBear",
      args: [epoch],
      value: amount,
    });
  };

  return (
    <div>
      <h3>Place Bet for Round {epoch.toString()}</h3>

      {existingBet && existingBet[1] > BigInt(0) && (
        <div className="alert">
          You already bet {(Number(existingBet[1]) / 1e18).toFixed(4)} BONE on{" "}
          {existingBet[0] === BigInt(0) ? "Bull" : "Bear"}
        </div>
      )}

      <div>
        <input
          type="number"
          placeholder="Bet amount in BONE"
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
        />

        <div>
          <button
            onClick={() => setBetPosition("bull")}
            className={betPosition === "bull" ? "active" : ""}
          >
            Bull
          </button>
          <button
            onClick={() => setBetPosition("bear")}
            className={betPosition === "bear" ? "active" : ""}
          >
            Bear
          </button>
        </div>

        <button onClick={placeBet} disabled={isPending || !betAmount}>
          {isPending ? "Placing bet..." : `Bet ${betPosition.toUpperCase()}`}
        </button>
      </div>
    </div>
  );
}
```

### 2. Round History Component

```typescript
import { useReadContract } from "wagmi";
import { predictionConfig } from "@/lib/contracts/prediction";

function RoundHistory({ epochs }: { epochs: bigint[] }) {
  return (
    <div>
      <h3>Round History</h3>
      {epochs.map((epoch) => (
        <RoundDataComponent key={epoch.toString()} epoch={epoch} />
      ))}
    </div>
  );
}
```

### 3. Admin Panel

```typescript
import { useWriteContract } from "wagmi";
import { predictionConfig } from "@/lib/contracts/prediction";
import { useAccount } from "wagmi";

function AdminPanel() {
  const { address } = useAccount();
  const { writeContract, isPending } = useWriteContract();

  const executeRound = () => {
    writeContract({
      ...predictionConfig,
      functionName: "executeRound",
    });
  };

  const pauseContract = () => {
    writeContract({
      ...predictionConfig,
      functionName: "pause",
    });
  };

  const unpauseContract = () => {
    writeContract({
      ...predictionConfig,
      functionName: "unpause",
    });
  };

  return (
    <div>
      <h3>Admin Panel</h3>
      <button onClick={executeRound} disabled={isPending}>
        {isPending ? "Executing..." : "Execute Round"}
      </button>
      <button onClick={pauseContract} disabled={isPending}>
        {isPending ? "Pausing..." : "Pause Contract"}
      </button>
      <button onClick={unpauseContract} disabled={isPending}>
        {isPending ? "Unpausing..." : "Unpause Contract"}
      </button>
    </div>
  );
}
```

## 🛠️ Troubleshooting

### Common Issues

1. **"Insufficient funds" error**

   - Ensure user has enough BONE for betting
   - Check minimum bet amount requirement

2. **"Round not live" error**

   - Check if round is in "live" status
   - Verify current timestamp vs round timestamps

3. **"Already bet" error**

   - User can only bet once per round
   - Check existing bet with `ledger` function

4. **"Not claimable" error**
   - Round must be ended and oracle called
   - User must have won the round

### Debug Mode

```typescript
import { predictionUtils } from "@/lib/contracts/prediction";

async function debugRound(client: any, epoch: bigint) {
  const round = await predictionUtils.getRound(client, epoch);
  const status = await predictionUtils.getRoundStatus(client, epoch);

  console.log("Debug Info:", {
    epoch: epoch.toString(),
    status,
    roundData: round,
    currentTime: Math.floor(Date.now() / 1000),
  });
}
```

## 📚 API Reference

### Types

```typescript
interface Round {
  epoch: bigint;
  startTimestamp: bigint;
  lockTimestamp: bigint;
  closeTimestamp: bigint;
  lockPrice: bigint;
  closePrice: bigint;
  lockOracleId: bigint;
  closeOracleId: bigint;
  totalAmount: bigint;
  bullAmount: bigint;
  bearAmount: bigint;
  rewardBaseCalAmount: bigint;
  rewardAmount: bigint;
  oracleCalled: boolean;
}

interface BetInfo {
  position: 0 | 1; // 0 = Bull, 1 = Bear
  amount: bigint;
  claimed: boolean;
}

enum Position {
  Bull = 0,
  Bear = 1,
}
```

### Utility Functions

All utility functions are available in `predictionUtils` object:

- `getCurrentEpoch(client)`
- `getRound(client, epoch)`
- `getLedger(client, epoch, user)`
- `getClaimable(client, epoch, user)`
- `getRefundable(client, epoch, user)`
- `getUserRounds(client, user, cursor, size)`
- `getContractState(client)`
- `betBull(client, epoch, value)`
- `betBear(client, epoch, value)`
- `claim(client, epochs)`
- `executeRound(client)`
- `getFormattedRound(client, epoch)`
- `getFormattedLedger(client, epoch, user)`
- `hasUserBet(client, epoch, user)`
- `getUserBetPosition(client, epoch, user)`
- `calculatePotentialReward(client, epoch, user)`
- `getClaimableEpochs(client, user, maxEpochs)`
- `getRoundStatus(client, epoch)`

This integration provides a complete, production-ready solution for interacting with the Prediction Contract!
