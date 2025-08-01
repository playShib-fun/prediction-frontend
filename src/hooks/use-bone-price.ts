import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  bonePriceConfig,
  type BonePriceState,
  formatBonePrice,
  formatTimestamp,
  formatRoundId,
} from "@/lib/contracts/bone-price";

// Query Keys
export const bonePriceQueryKeys = {
  all: ["bonePrice"] as const,
  latestPrice: () => [...bonePriceQueryKeys.all, "latestPrice"] as const,
  priceByRoundId: (roundId: string) =>
    [...bonePriceQueryKeys.all, "priceByRoundId", roundId] as const,
  priceRange: (startRoundId: string, endRoundId: string) =>
    [
      ...bonePriceQueryKeys.all,
      "priceRange",
      startRoundId,
      endRoundId,
    ] as const,
  priceHistory: (roundId: string) =>
    [...bonePriceQueryKeys.all, "priceHistory", roundId] as const,
  timestampHistory: (roundId: string) =>
    [...bonePriceQueryKeys.all, "timestampHistory", roundId] as const,
  minUpdateInterval: () =>
    [...bonePriceQueryKeys.all, "minUpdateInterval"] as const,
  owner: () => [...bonePriceQueryKeys.all, "owner"] as const,
  state: () => [...bonePriceQueryKeys.all, "state"] as const,
};

// Read Hooks

/**
 * Hook to get latest price data (roundId, price, timestamp)
 */
export const useLatestPrice = () => {
  return useReadContract({
    ...bonePriceConfig,
    functionName: "getLatestPrice",
  });
};

/**
 * Hook to get price by round ID
 */
export const usePriceByRoundId = (roundId: string) => {
  return useReadContract({
    ...bonePriceConfig,
    functionName: "getPriceByRoundId",
    args: [BigInt(roundId)],
  });
};

/**
 * Hook to get price range between two round IDs
 */
export const usePriceRange = (startRoundId: string, endRoundId: string) => {
  return useReadContract({
    ...bonePriceConfig,
    functionName: "getPriceRange",
    args: [BigInt(startRoundId), BigInt(endRoundId)],
  });
};

/**
 * Hook to get price history for a specific round ID
 */
export const usePriceHistoryByRoundId = (roundId: string) => {
  return useReadContract({
    ...bonePriceConfig,
    functionName: "priceHistory",
    args: [BigInt(roundId)],
  });
};

/**
 * Hook to get timestamp history for a specific round ID
 */
export const useTimestampHistoryByRoundId = (roundId: string) => {
  return useReadContract({
    ...bonePriceConfig,
    functionName: "timestampHistory",
    args: [BigInt(roundId)],
  });
};

/**
 * Hook to get minimum update interval
 */
export const useMinUpdateInterval = () => {
  return useReadContract({
    ...bonePriceConfig,
    functionName: "minUpdateInterval",
  });
};

/**
 * Hook to get contract owner
 */
export const useOwner = () => {
  return useReadContract({
    ...bonePriceConfig,
    functionName: "owner",
  });
};

// Combined State Hook
export const useBonePriceState = () => {
  const latestPrice = useLatestPrice();
  const minUpdateInterval = useMinUpdateInterval();
  const owner = useOwner();

  return {
    data: {
      currentPrice: latestPrice.data?.[1], // price from latest price
      currentRoundId: latestPrice.data?.[0], // roundId from latest price
      lastUpdateTime: latestPrice.data?.[2], // timestamp from latest price
      minUpdateInterval: minUpdateInterval.data,
      owner: owner.data,
    } as BonePriceState,
    isLoading:
      latestPrice.isLoading || minUpdateInterval.isLoading || owner.isLoading,
    error: latestPrice.error || minUpdateInterval.error || owner.error,
  };
};

// Formatted Data Hooks

/**
 * Hook to get formatted current price
 */
export const useFormattedCurrentPrice = () => {
  const { data, isLoading, error, refetch } = useLatestPrice();

  return {
    data: data ? formatBonePrice(data[1]) : undefined, // price is at index 1
    rawData: data?.[1],
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook to get formatted latest price data
 */
export const useFormattedLatestPrice = () => {
  const { data, isLoading, error } = useLatestPrice();

  return {
    data: data
      ? {
          roundId: formatRoundId(data[0]),
          price: formatBonePrice(data[1]),
          timestamp: formatTimestamp(data[2]),
          rawRoundId: data[0],
          rawPrice: data[1],
          rawTimestamp: data[2],
        }
      : undefined,
    rawData: data,
    isLoading,
    error,
  };
};

/**
 * Hook to get formatted price by round ID
 */
export const useFormattedPriceByRoundId = (roundId: string) => {
  const { data, isLoading, error } = usePriceByRoundId(roundId);

  return {
    data: data
      ? {
          price: formatBonePrice(data[0]),
          timestamp: formatTimestamp(data[1]),
          rawPrice: data[0],
          rawTimestamp: data[1],
        }
      : undefined,
    rawData: data,
    isLoading,
    error,
  };
};

/**
 * Hook to get formatted price range
 */
export const useFormattedPriceRange = (
  startRoundId: string,
  endRoundId: string
) => {
  const { data, isLoading, error } = usePriceRange(startRoundId, endRoundId);

  return {
    data: data
      ? {
          prices: data[0].map((price) => formatBonePrice(price)),
          timestamps: data[1].map((timestamp) => formatTimestamp(timestamp)),
          rawPrices: data[0],
          rawTimestamps: data[1],
        }
      : undefined,
    rawData: data,
    isLoading,
    error,
  };
};

/**
 * Hook to get formatted last update time
 */
export const useFormattedLastUpdateTime = () => {
  const { data, isLoading, error } = useLatestPrice();

  return {
    data: data ? formatTimestamp(data[2]) : undefined, // timestamp is at index 2
    rawData: data?.[2],
    isLoading,
    error,
  };
};

// Write Hooks

/**
 * Hook to update price (write transaction)
 */
export const useUpdatePrice = () => {
  const queryClient = useQueryClient();

  const { data: hash, isPending, error, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const updatePrice = (newPrice: bigint) => {
    writeContract({
      ...bonePriceConfig,
      functionName: "updatePrice",
      args: [newPrice],
    });
  };

  // Invalidate queries on success
  if (isSuccess) {
    queryClient.invalidateQueries({ queryKey: bonePriceQueryKeys.all });
  }

  return {
    updatePrice,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
};

/**
 * Hook to set minimum update interval (write transaction)
 */
export const useSetMinUpdateInterval = () => {
  const queryClient = useQueryClient();

  const { data: hash, isPending, error, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const setMinUpdateInterval = (interval: bigint) => {
    writeContract({
      ...bonePriceConfig,
      functionName: "setMinUpdateInterval",
      args: [interval],
    });
  };

  // Invalidate queries on success
  if (isSuccess) {
    queryClient.invalidateQueries({ queryKey: bonePriceQueryKeys.all });
  }

  return {
    setMinUpdateInterval,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
};

/**
 * Hook to transfer ownership (write transaction)
 */
export const useTransferOwnership = () => {
  const queryClient = useQueryClient();

  const { data: hash, isPending, error, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const transferOwnership = (newOwner: string) => {
    writeContract({
      ...bonePriceConfig,
      functionName: "transferOwnership",
      args: [newOwner],
    });
  };

  // Invalidate queries on success
  if (isSuccess) {
    queryClient.invalidateQueries({ queryKey: bonePriceQueryKeys.all });
  }

  return {
    transferOwnership,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
};

/**
 * Hook to renounce ownership (write transaction)
 */
export const useRenounceOwnership = () => {
  const queryClient = useQueryClient();

  const { data: hash, isPending, error, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const renounceOwnership = () => {
    writeContract({
      ...bonePriceConfig,
      functionName: "renounceOwnership",
    });
  };

  // Invalidate queries on success
  if (isSuccess) {
    queryClient.invalidateQueries({ queryKey: bonePriceQueryKeys.all });
  }

  return {
    renounceOwnership,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
};

// Utility Hooks

/**
 * Hook to get price history (simulated - you'd need events for real history)
 */
export const usePriceHistory = (limit = 10) => {
  const { data: latestPriceData } = useLatestPrice();

  // This is a simplified version - in reality you'd query events
  return useQuery({
    queryKey: [
      ...bonePriceQueryKeys.all,
      "priceHistory",
      limit,
      latestPriceData,
    ],
    queryFn: async () => {
      // Simulate price history - replace with actual event queries
      const history = [];
      if (latestPriceData) {
        const currentRoundId = Number(latestPriceData[0]);
        const history: Array<{
          roundId: number;
          price: number;
          timestamp: Date;
        }> = [];
        for (let i = 0; i < limit; i++) {
          history.push({
            roundId: currentRoundId - i,
            price: Math.random() * 100, // Replace with actual data
            timestamp: new Date(Date.now() - i * 60000),
          });
        }
      }
      return history;
    },
    enabled: !!latestPriceData,
  });
};

/**
 * Hook to check if user can update price (based on time interval)
 */
export const useCanUpdatePrice = () => {
  const { data: latestPriceData } = useLatestPrice();
  const { data: minUpdateInterval } = useMinUpdateInterval();

  return {
    canUpdate:
      latestPriceData && minUpdateInterval
        ? Date.now() / 1000 - Number(latestPriceData[2]) >=
          Number(minUpdateInterval)
        : false,
    timeUntilNextUpdate:
      latestPriceData && minUpdateInterval
        ? Math.max(
            0,
            Number(minUpdateInterval) -
              (Date.now() / 1000 - Number(latestPriceData[2]))
          )
        : 0,
  };
};

// Legacy hooks for backward compatibility
export const useCurrentPrice = useLatestPrice;
export const useCurrentRoundId = useLatestPrice;
export const useLastUpdateTime = useLatestPrice;
