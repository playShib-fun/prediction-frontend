# Bone Price Oracle Integration Guide

This guide covers the complete integration of the Bone Price Oracle contract (`0x1E58C1d2b48bdD02a8512dFa4484De8bF983E448`) into your ShibPlay application.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Contract Functions](#contract-functions)
3. [Hooks Usage](#hooks-usage)
4. [Components](#components)
5. [Quick Start](#quick-start)
6. [Advanced Usage](#advanced-usage)
7. [Troubleshooting](#troubleshooting)

## 🎯 Overview

The Bone Price Oracle provides real-time price data for BONE tokens with the following features:

- **Current Price**: Get the latest BONE price
- **Round Management**: Track price updates by round ID
- **Time-based Updates**: Enforce minimum intervals between updates
- **Owner Controls**: Manage contract settings and ownership

## 📜 Contract Functions

### Read Functions

| Function                                                    | Description                  | Returns                      |
| ----------------------------------------------------------- | ---------------------------- | ---------------------------- |
| `getLatestPrice()`                                          | Get latest price data        | `(uint256, int256, uint256)` |
| `getPriceByRoundId(uint256 _roundId)`                       | Get price for specific round | `(int256, uint256)`          |
| `getPriceRange(uint256 _startRoundId, uint256 _endRoundId)` | Get price range              | `(int256[], uint256[])`      |
| `priceHistory(uint256 _roundId)`                            | Get price for round ID       | `int256`                     |
| `timestampHistory(uint256 _roundId)`                        | Get timestamp for round ID   | `uint256`                    |
| `minUpdateInterval()`                                       | Get minimum update interval  | `uint256`                    |
| `owner()`                                                   | Get contract owner           | `address`                    |

### Write Functions

| Function                                  | Description                 | Parameters                           |
| ----------------------------------------- | --------------------------- | ------------------------------------ |
| `updatePrice(int256 _newPrice)`           | Update BONE price           | `_newPrice`: New price value         |
| `setMinUpdateInterval(uint256 _interval)` | Set minimum update interval | `_interval`: Seconds between updates |
| `transferOwnership(address newOwner)`     | Transfer ownership          | `newOwner`: New owner address        |
| `renounceOwnership()`                     | Renounce ownership          | None                                 |

## 🪝 Hooks Usage

### Basic Read Hooks

```typescript
import {
  useLatestPrice,
  useFormattedCurrentPrice,
  useFormattedLatestPrice,
} from "@/hooks/use-bone-price";

// Get latest price data (roundId, price, timestamp)
const { data: latestData, isLoading, error } = useLatestPrice();

// Get formatted current price (human-readable)
const { data: formattedPrice } = useFormattedCurrentPrice();

// Get formatted latest price with metadata
const { data: latestPriceData } = useFormattedLatestPrice();

// Get price by specific round ID
const { data: roundPrice } = useFormattedPriceByRoundId("123");

// Get price range between round IDs
const { data: priceRange } = useFormattedPriceRange("100", "110");
```

### Advanced Read Hooks

```typescript
import {
  useBonePriceState,
  useFormattedLatestPrice,
  useFormattedPriceByRoundId,
  useFormattedPriceRange,
  useCanUpdatePrice,
} from "@/hooks/use-bone-price";

// Get complete contract state
const { data: state, isLoading } = useBonePriceState();

// Get latest price with metadata
const { data: latestData } = useFormattedLatestPrice();
// Returns: { roundId, price, timestamp, rawRoundId, rawPrice, rawTimestamp }

// Get price by round ID
const { data: roundPrice } = useFormattedPriceByRoundId("123");
// Returns: { price, timestamp, rawPrice, rawTimestamp }

// Get price range
const { data: priceRange } = useFormattedPriceRange("100", "110");
// Returns: { prices: number[], timestamps: Date[], rawPrices: bigint[], rawTimestamps: bigint[] }

// Check if price can be updated
const { canUpdate, timeUntilNextUpdate } = useCanUpdatePrice();
```

### Write Hooks

```typescript
import {
  useUpdatePrice,
  useSetMinUpdateInterval,
  useTransferOwnership,
} from "@/hooks/use-bone-price";

// Update price
const { updatePrice, isPending, isSuccess, error } = useUpdatePrice();

const handleUpdate = () => {
  const priceInWei = BigInt(Math.floor(1.2345 * 1e8)); // Convert to 8 decimals
  updatePrice(priceInWei);
};

// Set minimum update interval
const { setMinUpdateInterval } = useSetMinUpdateInterval();
setMinUpdateInterval(BigInt(300)); // 5 minutes

// Transfer ownership
const { transferOwnership } = useTransferOwnership();
transferOwnership("0x..."); // New owner address
```

## 🧩 Components

### PriceDisplay Component

A simple component to display current price with optional trend indicators:

```typescript
import PriceDisplay from "@/components/bone-price/price-display";

// Basic usage
<PriceDisplay />

// With options
<PriceDisplay
  showTrend={true}
  showRoundId={false}
  className="w-full"
/>
```

### BonePriceDashboard Component

A comprehensive dashboard with all contract functionality:

```typescript
import BonePriceDashboard from "@/components/bone-price/bone-price-dashboard";

// Full dashboard (owner controls included if user is owner)
<BonePriceDashboard />;
```

## 🚀 Quick Start

### 1. Basic Price Display

```typescript
import { useFormattedCurrentPrice } from "@/hooks/use-bone-price";

function MyComponent() {
  const { data: price, isLoading } = useFormattedCurrentPrice();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Current BONE Price</h2>
      <p>${price?.toFixed(4)}</p>
    </div>
  );
}
```

### 2. Price Update (Owner Only)

```typescript
import { useUpdatePrice, useCanUpdatePrice } from "@/hooks/use-bone-price";
import { useAccount } from "wagmi";

function PriceUpdater() {
  const { address } = useAccount();
  const { updatePrice, isPending } = useUpdatePrice();
  const { canUpdate, timeUntilNextUpdate } = useCanUpdatePrice();

  const handleUpdate = (newPrice: number) => {
    const priceInWei = BigInt(Math.floor(newPrice * 1e8));
    updatePrice(priceInWei);
  };

  return (
    <div>
      <button
        onClick={() => handleUpdate(1.25)}
        disabled={!canUpdate || isPending}
      >
        {isPending ? "Updating..." : "Update Price"}
      </button>
      {!canUpdate && (
        <p>Wait {Math.ceil(timeUntilNextUpdate)}s before next update</p>
      )}
    </div>
  );
}
```

### 3. Real-time Price Monitoring

```typescript
import {
  useFormattedCurrentPrice,
  useFormattedLatestPrice,
} from "@/hooks/use-bone-price";
import { useEffect, useState } from "react";

function PriceMonitor() {
  const { data: currentPrice } = useFormattedCurrentPrice();
  const { data: latestData } = useFormattedLatestPrice();
  const [priceHistory, setPriceHistory] = useState<number[]>([]);

  useEffect(() => {
    if (currentPrice) {
      setPriceHistory((prev) => [...prev.slice(-9), currentPrice]);
    }
  }, [currentPrice]);

  return (
    <div>
      <h3>Price History</h3>
      <div className="flex gap-2">
        {priceHistory.map((price, i) => (
          <div key={i} className="p-2 border rounded">
            ${price.toFixed(4)}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 🔧 Advanced Usage

### Custom Price Formatting

```typescript
import { formatBonePrice } from "@/lib/contracts/bone-price";

// Custom formatting
const customFormat = (price: bigint) => {
  const formatted = formatBonePrice(price);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(formatted);
};
```

### Event Listening (Future Enhancement)

```typescript
// This would require additional setup for event listening
import { useContractEvent } from "wagmi";
import { bonePriceConfig } from "@/lib/contracts/bone-price";

function PriceEventListener() {
  useContractEvent({
    ...bonePriceConfig,
    eventName: "PriceUpdated",
    listener: (log) => {
      console.log("Price updated:", log);
      // Handle price update event
    },
  });

  return null;
}
```

### Error Handling

```typescript
import { useCurrentPrice } from "@/hooks/use-bone-price";

function ErrorHandlingExample() {
  const { data, error, isLoading } = useCurrentPrice();

  if (error) {
    return (
      <div className="text-red-500">Error loading price: {error.message}</div>
    );
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <div>Price: ${formatBonePrice(data!)}</div>;
}
```

## 🛠️ Troubleshooting

### Common Issues

1. **"Contract not found" error**

   - Ensure you're connected to the correct network (Shibarium/Puppynet)
   - Verify the contract address is correct

2. **"Insufficient permissions" error**

   - Only the contract owner can call write functions
   - Check if your address matches the contract owner

3. **"Update interval not met" error**

   - Wait for the minimum update interval to pass
   - Use `useCanUpdatePrice()` to check if updates are allowed

4. **Price formatting issues**
   - Ensure you're using the correct decimal places (8 decimals)
   - Use the provided `formatBonePrice()` utility function

### Debug Mode

Enable debug logging by adding this to your component:

```typescript
import { useBonePriceState } from "@/hooks/use-bone-price";

function DebugComponent() {
  const { data, isLoading, error } = useBonePriceState();

  console.log("Bone Price State:", { data, isLoading, error });

  return <div>Check console for debug info</div>;
}
```

## 📚 API Reference

### Hook Return Types

```typescript
// Read hooks return type
interface ReadHookResult<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
}

// Write hooks return type
interface WriteHookResult {
  hash: `0x${string}` | undefined;
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  error: Error | null;
}
```

### Data Types

```typescript
interface BonePriceData {
  roundId: bigint;
  price: bigint;
  timestamp: bigint;
}

interface BonePriceState {
  currentPrice: bigint;
  currentRoundId: bigint;
  lastUpdateTime: bigint;
  minUpdateInterval: bigint;
  owner: string;
}
```

## 🎉 Examples

See the following files for complete examples:

- `src/components/bone-price/bone-price-dashboard.tsx` - Full dashboard
- `src/components/bone-price/price-display.tsx` - Simple price display
- `src/hooks/use-bone-price.ts` - All available hooks

## 🔗 Integration with Existing Components

To integrate with your existing game cards, you can replace the hardcoded price with real-time data:

```typescript
// In your game-card.tsx
import { useFormattedCurrentPrice } from "@/hooks/use-bone-price";

// Replace static price with real-time data
const { data: currentPrice } = useFormattedCurrentPrice();

// Use in your component
<div className="text-2xl text-primary">
  ${currentPrice?.toFixed(8) || "0.00000000"}
</div>;
```

This integration provides a complete, production-ready solution for interacting with the Bone Price Oracle contract!
