import { useQuery } from "@tanstack/react-query";
import { predictionApi } from "@/lib/graphql-queries";

// Query Keys
export const predictionQueryKeys = {
  all: ["prediction"] as const,
  startRounds: () => [...predictionQueryKeys.all, "startRounds"] as const,
  startRound: (id: string) =>
    [...predictionQueryKeys.startRounds(), id] as const,
  rewardsCalculated: () =>
    [...predictionQueryKeys.all, "rewardsCalculated"] as const,
  rewardsCalculatedById: (id: string) =>
    [...predictionQueryKeys.rewardsCalculated(), id] as const,
  lockRounds: () => [...predictionQueryKeys.all, "lockRounds"] as const,
  lockRound: (id: string) => [...predictionQueryKeys.lockRounds(), id] as const,
  endRounds: () => [...predictionQueryKeys.all, "endRounds"] as const,
  endRound: (id: string) => [...predictionQueryKeys.endRounds(), id] as const,
  claims: () => [...predictionQueryKeys.all, "claims"] as const,
  claim: (id: string) => [...predictionQueryKeys.claims(), id] as const,
  betBulls: () => [...predictionQueryKeys.all, "betBulls"] as const,
  betBull: (id: string) => [...predictionQueryKeys.betBulls(), id] as const,
  betBears: () => [...predictionQueryKeys.all, "betBears"] as const,
  betBear: (id: string) => [...predictionQueryKeys.betBears(), id] as const,
  roundsData: () => [...predictionQueryKeys.all, "roundsData"] as const,
  betsData: () => [...predictionQueryKeys.all, "betsData"] as const,
};

// Utility functions for filtering and sorting
export const filterAndSortData = {
  // Filter by date range
  byDateRange: <T extends { timestamp: string }>(
    data: T[],
    startDate?: Date,
    endDate?: Date
  ): T[] => {
    if (!startDate && !endDate) return data;

    return data.filter((item) => {
      const itemDate = new Date(parseInt(item.timestamp) * 1000);
      if (startDate && itemDate < startDate) return false;
      if (endDate && itemDate > endDate) return false;
      return true;
    });
  },

  // Filter by sender address
  bySender: <T extends { sender: string }>(data: T[], sender: string): T[] => {
    if (!sender) return data;
    return data.filter((item) =>
      item.sender.toLowerCase().includes(sender.toLowerCase())
    );
  },

  // Filter by round ID
  byRoundId: <T extends { roundId: string }>(
    data: T[],
    roundId: string
  ): T[] => {
    if (!roundId) return data;
    return data.filter((item) => item.roundId === roundId);
  },

  // Filter by epoch
  byEpoch: <T extends { epoch: string }>(data: T[], epoch: string): T[] => {
    if (!epoch) return data;
    return data.filter((item) => item.epoch === epoch);
  },

  // Sort by timestamp (newest first)
  byTimestamp: <T extends { timestamp: string }>(
    data: T[],
    ascending = false
  ): T[] => {
    return [...data].sort((a, b) => {
      const timeA = parseInt(a.timestamp);
      const timeB = parseInt(b.timestamp);
      return ascending ? timeA - timeB : timeB - timeA;
    });
  },

  // Sort by amount (highest first)
  byAmount: <T extends { amount: string }>(
    data: T[],
    ascending = false
  ): T[] => {
    return [...data].sort((a, b) => {
      const amountA = parseFloat(a.amount);
      const amountB = parseFloat(b.amount);
      return ascending ? amountA - amountB : amountB - amountA;
    });
  },

  // Sort by reward amount (highest first)
  byRewardAmount: <T extends { rewardAmount: string }>(
    data: T[],
    ascending = false
  ): T[] => {
    return [...data].sort((a, b) => {
      const amountA = parseFloat(a.rewardAmount);
      const amountB = parseFloat(b.rewardAmount);
      return ascending ? amountA - amountB : amountB - amountA;
    });
  },

  // Sort by lock price (highest first)
  byLockPrice: <T extends { lockPrice: string }>(
    data: T[],
    ascending = false
  ): T[] => {
    return [...data].sort((a, b) => {
      const priceA = parseFloat(a.lockPrice);
      const priceB = parseFloat(b.lockPrice);
      return ascending ? priceA - priceB : priceB - priceA;
    });
  },

  // Sort by close price (highest first)
  byClosePrice: <T extends { closePrice: string }>(
    data: T[],
    ascending = false
  ): T[] => {
    return [...data].sort((a, b) => {
      const priceA = parseFloat(a.closePrice);
      const priceB = parseFloat(b.closePrice);
      return ascending ? priceA - priceB : priceB - priceA;
    });
  },

  // Sort by epoch (newest first)
  byEpochSort: <T extends { epoch: string }>(
    data: T[],
    ascending = false
  ): T[] => {
    return [...data].sort((a, b) => {
      const epochA = parseInt(a.epoch);
      const epochB = parseInt(b.epoch);
      return ascending ? epochA - epochB : epochB - epochA;
    });
  },

  // Limit results
  limit: <T>(data: T[], limit: number): T[] => {
    return data.slice(0, limit);
  },

  // Search by transaction hash
  byTransactionHash: <T extends { transactionHash: string }>(
    data: T[],
    hash: string
  ): T[] => {
    if (!hash) return data;
    return data.filter((item) =>
      item.transactionHash.toLowerCase().includes(hash.toLowerCase())
    );
  },
};

// React Query Hooks

// Start Rounds
export const useStartRounds = (options?: {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  sortBy?: "timestamp" | "epoch";
  ascending?: boolean;
}) => {
  return useQuery({
    queryKey: predictionQueryKeys.startRounds(),
    queryFn: predictionApi.getAllStartRounds,
    select: (data) => {
      let filtered = data;

      if (options?.startDate || options?.endDate) {
        filtered = filterAndSortData.byDateRange(
          filtered,
          options.startDate,
          options.endDate
        );
      }

      if (options?.sortBy === "timestamp") {
        filtered = filterAndSortData.byTimestamp(filtered, options.ascending);
      } else if (options?.sortBy === "epoch") {
        filtered = filterAndSortData.byEpochSort(filtered, options.ascending);
      } else {
        // Default sort by timestamp descending
        filtered = filterAndSortData.byTimestamp(filtered, false);
      }

      if (options?.limit) {
        filtered = filterAndSortData.limit(filtered, options.limit);
      }

      return filtered;
    },
  });
};

export const useStartRound = (id: string) => {
  return useQuery({
    queryKey: predictionQueryKeys.startRound(id),
    queryFn: () => predictionApi.getStartRoundById(id),
    enabled: !!id,
  });
};

// Rewards Calculated
export const useRewardsCalculated = (options?: {
  startDate?: Date;
  endDate?: Date;
  roundId?: string;
  limit?: number;
  sortBy?: "timestamp" | "rewardAmount";
  ascending?: boolean;
}) => {
  return useQuery({
    queryKey: predictionQueryKeys.rewardsCalculated(),
    queryFn: predictionApi.getAllRewardsCalculated,
    select: (data) => {
      let filtered = data;

      if (options?.startDate || options?.endDate) {
        filtered = filterAndSortData.byDateRange(
          filtered,
          options.startDate,
          options.endDate
        );
      }

      if (options?.roundId) {
        filtered = filterAndSortData.byRoundId(filtered, options.roundId);
      }

      if (options?.sortBy === "timestamp") {
        filtered = filterAndSortData.byTimestamp(filtered, options.ascending);
      } else if (options?.sortBy === "rewardAmount") {
        filtered = filterAndSortData.byRewardAmount(
          filtered,
          options.ascending
        );
      } else {
        filtered = filterAndSortData.byTimestamp(filtered, false);
      }

      if (options?.limit) {
        filtered = filterAndSortData.limit(filtered, options.limit);
      }

      return filtered;
    },
  });
};

export const useRewardsCalculatedById = (id: string) => {
  return useQuery({
    queryKey: predictionQueryKeys.rewardsCalculatedById(id),
    queryFn: () => predictionApi.getRewardsCalculatedById(id),
    enabled: !!id,
  });
};

// Lock Rounds
export const useLockRounds = (options?: {
  startDate?: Date;
  endDate?: Date;
  roundId?: string;
  epoch?: string;
  limit?: number;
  sortBy?: "timestamp" | "epoch" | "lockPrice";
  ascending?: boolean;
}) => {
  return useQuery({
    queryKey: predictionQueryKeys.lockRounds(),
    queryFn: predictionApi.getAllLockRounds,
    select: (data) => {
      let filtered = data;

      if (options?.startDate || options?.endDate) {
        filtered = filterAndSortData.byDateRange(
          filtered,
          options.startDate,
          options.endDate
        );
      }

      if (options?.roundId) {
        filtered = filterAndSortData.byRoundId(filtered, options.roundId);
      }

      if (options?.epoch) {
        filtered = filterAndSortData.byEpoch(filtered, options.epoch);
      }

      if (options?.sortBy === "timestamp") {
        filtered = filterAndSortData.byTimestamp(filtered, options.ascending);
      } else if (options?.sortBy === "epoch") {
        filtered = filterAndSortData.byEpochSort(filtered, options.ascending);
      } else if (options?.sortBy === "lockPrice") {
        filtered = filterAndSortData.byLockPrice(filtered, options.ascending);
      } else {
        filtered = filterAndSortData.byTimestamp(filtered, false);
      }

      if (options?.limit) {
        filtered = filterAndSortData.limit(filtered, options.limit);
      }

      return filtered;
    },
  });
};

export const useLockRound = (id: string) => {
  return useQuery({
    queryKey: predictionQueryKeys.lockRound(id),
    queryFn: () => predictionApi.getLockRoundById(id),
    enabled: !!id,
  });
};

// End Rounds
export const useEndRounds = (options?: {
  startDate?: Date;
  endDate?: Date;
  roundId?: string;
  epoch?: string;
  limit?: number;
  sortBy?: "timestamp" | "epoch" | "closePrice";
  ascending?: boolean;
}) => {
  return useQuery({
    queryKey: predictionQueryKeys.endRounds(),
    queryFn: predictionApi.getAllEndRounds,
    select: (data) => {
      let filtered = data;

      if (options?.startDate || options?.endDate) {
        filtered = filterAndSortData.byDateRange(
          filtered,
          options.startDate,
          options.endDate
        );
      }

      if (options?.roundId) {
        filtered = filterAndSortData.byRoundId(filtered, options.roundId);
      }

      if (options?.epoch) {
        filtered = filterAndSortData.byEpoch(filtered, options.epoch);
      }

      if (options?.sortBy === "timestamp") {
        filtered = filterAndSortData.byTimestamp(filtered, options.ascending);
      } else if (options?.sortBy === "epoch") {
        filtered = filterAndSortData.byEpochSort(filtered, options.ascending);
      } else if (options?.sortBy === "closePrice") {
        filtered = filterAndSortData.byClosePrice(filtered, options.ascending);
      } else {
        filtered = filterAndSortData.byTimestamp(filtered, false);
      }

      if (options?.limit) {
        filtered = filterAndSortData.limit(filtered, options.limit);
      }

      return filtered;
    },
  });
};

export const useEndRound = (id: string) => {
  return useQuery({
    queryKey: predictionQueryKeys.endRound(id),
    queryFn: () => predictionApi.getEndRoundById(id),
    enabled: !!id,
  });
};

// Claims
export const useClaims = (options?: {
  startDate?: Date;
  endDate?: Date;
  roundId?: string;
  sender?: string;
  limit?: number;
  sortBy?: "timestamp" | "amount";
  ascending?: boolean;
}) => {
  return useQuery({
    queryKey: predictionQueryKeys.claims(),
    queryFn: predictionApi.getAllClaims,
    select: (data) => {
      let filtered = data;

      if (options?.startDate || options?.endDate) {
        filtered = filterAndSortData.byDateRange(
          filtered,
          options.startDate,
          options.endDate
        );
      }

      if (options?.roundId) {
        filtered = filterAndSortData.byRoundId(filtered, options.roundId);
      }

      if (options?.sender) {
        filtered = filterAndSortData.bySender(filtered, options.sender);
      }

      if (options?.sortBy === "timestamp") {
        filtered = filterAndSortData.byTimestamp(filtered, options.ascending);
      } else if (options?.sortBy === "amount") {
        filtered = filterAndSortData.byAmount(filtered, options.ascending);
      } else {
        filtered = filterAndSortData.byTimestamp(filtered, false);
      }

      if (options?.limit) {
        filtered = filterAndSortData.limit(filtered, options.limit);
      }

      return filtered;
    },
  });
};

export const useClaim = (id: string) => {
  return useQuery({
    queryKey: predictionQueryKeys.claim(id),
    queryFn: () => predictionApi.getClaimById(id),
    enabled: !!id,
  });
};

// Bet Bulls
export const useBetBulls = (options?: {
  startDate?: Date;
  endDate?: Date;
  roundId?: string;
  sender?: string;
  limit?: number;
  sortBy?: "timestamp" | "amount";
  ascending?: boolean;
}) => {
  return useQuery({
    queryKey: predictionQueryKeys.betBulls(),
    queryFn: predictionApi.getAllBetBulls,
    select: (data) => {
      let filtered = data;

      if (options?.startDate || options?.endDate) {
        filtered = filterAndSortData.byDateRange(
          filtered,
          options.startDate,
          options.endDate
        );
      }

      if (options?.roundId) {
        filtered = filterAndSortData.byRoundId(filtered, options.roundId);
      }

      if (options?.sender) {
        filtered = filterAndSortData.bySender(filtered, options.sender);
      }

      if (options?.sortBy === "timestamp") {
        filtered = filterAndSortData.byTimestamp(filtered, options.ascending);
      } else if (options?.sortBy === "amount") {
        filtered = filterAndSortData.byAmount(filtered, options.ascending);
      } else {
        filtered = filterAndSortData.byTimestamp(filtered, false);
      }

      if (options?.limit) {
        filtered = filterAndSortData.limit(filtered, options.limit);
      }

      return filtered;
    },
  });
};

export const useBetBull = (id: string) => {
  return useQuery({
    queryKey: predictionQueryKeys.betBull(id),
    queryFn: () => predictionApi.getBetBullById(id),
    enabled: !!id,
  });
};

// Bet Bears
export const useBetBears = (options?: {
  startDate?: Date;
  endDate?: Date;
  roundId?: string;
  sender?: string;
  limit?: number;
  sortBy?: "timestamp" | "amount";
  ascending?: boolean;
}) => {
  return useQuery({
    queryKey: predictionQueryKeys.betBears(),
    queryFn: predictionApi.getAllBetBears,
    select: (data) => {
      let filtered = data;

      if (options?.startDate || options?.endDate) {
        filtered = filterAndSortData.byDateRange(
          filtered,
          options.startDate,
          options.endDate
        );
      }

      if (options?.roundId) {
        filtered = filterAndSortData.byRoundId(filtered, options.roundId);
      }

      if (options?.sender) {
        filtered = filterAndSortData.bySender(filtered, options.sender);
      }

      if (options?.sortBy === "timestamp") {
        filtered = filterAndSortData.byTimestamp(filtered, options.ascending);
      } else if (options?.sortBy === "amount") {
        filtered = filterAndSortData.byAmount(filtered, options.ascending);
      } else {
        filtered = filterAndSortData.byTimestamp(filtered, false);
      }

      if (options?.limit) {
        filtered = filterAndSortData.limit(filtered, options.limit);
      }

      return filtered;
    },
  });
};

export const useBetBear = (id: string) => {
  return useQuery({
    queryKey: predictionQueryKeys.betBear(id),
    queryFn: () => predictionApi.getBetBearById(id),
    enabled: !!id,
  });
};

// Combined queries for efficiency
export const useRoundsData = () => {
  return useQuery({
    queryKey: predictionQueryKeys.roundsData(),
    queryFn: predictionApi.getAllRoundsData,
  });
};

export const useBetsData = () => {
  return useQuery({
    queryKey: predictionQueryKeys.betsData(),
    queryFn: predictionApi.getAllBetsData,
  });
};

// Utility hooks for common use cases
export const useLatestRounds = (limit = 10) => {
  return useStartRounds({ limit, sortBy: "epoch", ascending: false });
};

export const useUserBets = (sender: string, limit = 50) => {
  const bullBets = useBetBulls({
    sender,
    limit,
    sortBy: "timestamp",
    ascending: false,
  });
  const bearBets = useBetBears({
    sender,
    limit,
    sortBy: "timestamp",
    ascending: false,
  });

  return {
    bullBets: bullBets.data || [],
    bearBets: bearBets.data || [],
    isLoading: bullBets.isLoading || bearBets.isLoading,
    error: bullBets.error || bearBets.error,
  };
};

export const useRoundDetails = (roundId: string) => {
  const lockRound = useLockRounds({ roundId, limit: 1 });
  const endRound = useEndRounds({ roundId, limit: 1 });
  const rewards = useRewardsCalculated({ roundId, limit: 1 });

  return {
    lockRound: lockRound.data?.[0],
    endRound: endRound.data?.[0],
    rewards: rewards.data?.[0],
    isLoading: lockRound.isLoading || endRound.isLoading || rewards.isLoading,
    error: lockRound.error || endRound.error || rewards.error,
  };
};
