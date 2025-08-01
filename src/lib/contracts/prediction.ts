import { createPublicClient, http } from "viem";
import { shibarium, type Chain } from "wagmi/chains";
import predictionAbi from "@/abis/prediction.json";

// Contract address
export const PREDICTION_CONTRACT_ADDRESS =
  "0x4ACB55Cea2a25FEF18460a41fC7bB5dF2d2cd7bc" as const;

// Contract ABI
export const predictionContractAbi = predictionAbi;

// Types for contract data
export interface Round {
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

export interface BetInfo {
  position: 0 | 1; // 0 = Bull, 1 = Bear
  amount: bigint;
  claimed: boolean;
}

export interface UserRoundsResult {
  epochs: bigint[];
  betInfos: BetInfo[];
  cursor: bigint;
}

export interface PredictionState {
  currentEpoch: bigint;
  paused: boolean;
  oracle: string;
  oracleLatestRoundId: bigint;
  adminAddress: string;
  operatorAddress: string;
  owner: string;
  minBetAmount: bigint;
  treasuryFee: bigint;
  treasuryAmount: bigint;
  intervalSeconds: bigint;
  bufferSeconds: bigint;
  oracleUpdateAllowance: bigint;
  genesisStartOnce: boolean;
  genesisLockOnce: boolean;
}

// Contract configuration
export const predictionConfig = {
  address: PREDICTION_CONTRACT_ADDRESS,
  abi: predictionContractAbi,
} as const;

// Public client for read operations
export const createPredictionClient = (chain: Chain) => {
  return createPublicClient({
    chain,
    transport: http(),
  });
};

// Utility functions for data conversion
export const formatAmount = (amount: bigint): number => {
  return Number(amount) / 1e18; // Assuming 18 decimals
};

export const formatTimestamp = (timestamp: bigint): Date => {
  return new Date(Number(timestamp) * 1000);
};

export const formatEpoch = (epoch: bigint): number => {
  return Number(epoch);
};

export const formatPrice = (price: bigint): number => {
  return Number(price) / 1e8; // Assuming 8 decimals for price
};

// Position enum
export enum Position {
  Bull = 0,
  Bear = 1,
}

// Contract function utilities
export const predictionUtils = {
  // Read Functions

  /**
   * Get current epoch
   */
  getCurrentEpoch: async (client: any) => {
    return await client.readContract({
      ...predictionConfig,
      functionName: "currentEpoch",
    });
  },

  /**
   * Get round data by epoch
   */
  getRound: async (client: any, epoch: bigint) => {
    return await client.readContract({
      ...predictionConfig,
      functionName: "rounds",
      args: [epoch],
    });
  },

  /**
   * Get user bet info for specific epoch
   */
  getLedger: async (client: any, epoch: bigint, user: string) => {
    return await client.readContract({
      ...predictionConfig,
      functionName: "ledger",
      args: [epoch, user],
    });
  },

  /**
   * Check if user can claim for epoch
   */
  getClaimable: async (client: any, epoch: bigint, user: string) => {
    return await client.readContract({
      ...predictionConfig,
      functionName: "claimable",
      args: [epoch, user],
    });
  },

  /**
   * Check if user can get refund for epoch
   */
  getRefundable: async (client: any, epoch: bigint, user: string) => {
    return await client.readContract({
      ...predictionConfig,
      functionName: "refundable",
      args: [epoch, user],
    });
  },

  /**
   * Get user rounds with pagination
   */
  getUserRounds: async (
    client: any,
    user: string,
    cursor: bigint,
    size: bigint
  ) => {
    return await client.readContract({
      ...predictionConfig,
      functionName: "getUserRounds",
      args: [user, cursor, size],
    });
  },

  /**
   * Get total user rounds length
   */
  getUserRoundsLength: async (client: any, user: string) => {
    return await client.readContract({
      ...predictionConfig,
      functionName: "getUserRoundsLength",
      args: [user],
    });
  },

  /**
   * Get contract state
   */
  getContractState: async (client: any) => {
    const [
      currentEpoch,
      paused,
      oracle,
      oracleLatestRoundId,
      adminAddress,
      operatorAddress,
      owner,
      minBetAmount,
      treasuryFee,
      treasuryAmount,
      intervalSeconds,
      bufferSeconds,
      oracleUpdateAllowance,
      genesisStartOnce,
      genesisLockOnce,
    ] = await Promise.all([
      client.readContract({
        ...predictionConfig,
        functionName: "currentEpoch",
      }),
      client.readContract({ ...predictionConfig, functionName: "paused" }),
      client.readContract({ ...predictionConfig, functionName: "oracle" }),
      client.readContract({
        ...predictionConfig,
        functionName: "oracleLatestRoundId",
      }),
      client.readContract({
        ...predictionConfig,
        functionName: "adminAddress",
      }),
      client.readContract({
        ...predictionConfig,
        functionName: "operatorAddress",
      }),
      client.readContract({ ...predictionConfig, functionName: "owner" }),
      client.readContract({
        ...predictionConfig,
        functionName: "minBetAmount",
      }),
      client.readContract({ ...predictionConfig, functionName: "treasuryFee" }),
      client.readContract({
        ...predictionConfig,
        functionName: "treasuryAmount",
      }),
      client.readContract({
        ...predictionConfig,
        functionName: "intervalSeconds",
      }),
      client.readContract({
        ...predictionConfig,
        functionName: "bufferSeconds",
      }),
      client.readContract({
        ...predictionConfig,
        functionName: "oracleUpdateAllowance",
      }),
      client.readContract({
        ...predictionConfig,
        functionName: "genesisStartOnce",
      }),
      client.readContract({
        ...predictionConfig,
        functionName: "genesisLockOnce",
      }),
    ]);

    return {
      currentEpoch,
      paused,
      oracle,
      oracleLatestRoundId,
      adminAddress,
      operatorAddress,
      owner,
      minBetAmount,
      treasuryFee,
      treasuryAmount,
      intervalSeconds,
      bufferSeconds,
      oracleUpdateAllowance,
      genesisStartOnce,
      genesisLockOnce,
    } as PredictionState;
  },

  // Write Functions

  /**
   * Place bull bet
   */
  betBull: async (client: any, epoch: bigint, value: bigint) => {
    return await client.writeContract({
      ...predictionConfig,
      functionName: "betBull",
      args: [epoch],
      value,
    });
  },

  /**
   * Place bear bet
   */
  betBear: async (client: any, epoch: bigint, value: bigint) => {
    return await client.writeContract({
      ...predictionConfig,
      functionName: "betBear",
      args: [epoch],
      value,
    });
  },

  /**
   * Claim rewards for multiple epochs
   */
  claim: async (client: any, epochs: bigint[]) => {
    return await client.writeContract({
      ...predictionConfig,
      functionName: "claim",
      args: [epochs],
    });
  },

  /**
   * Execute round (operator/admin only)
   */
  executeRound: async (client: any) => {
    return await client.writeContract({
      ...predictionConfig,
      functionName: "executeRound",
    });
  },

  /**
   * Genesis start round (operator/admin only)
   */
  genesisStartRound: async (client: any) => {
    return await client.writeContract({
      ...predictionConfig,
      functionName: "genesisStartRound",
    });
  },

  /**
   * Genesis lock round (operator/admin only)
   */
  genesisLockRound: async (client: any) => {
    return await client.writeContract({
      ...predictionConfig,
      functionName: "genesisLockRound",
    });
  },

  /**
   * Pause contract (owner only)
   */
  pause: async (client: any) => {
    return await client.writeContract({
      ...predictionConfig,
      functionName: "pause",
    });
  },

  /**
   * Unpause contract (owner only)
   */
  unpause: async (client: any) => {
    return await client.writeContract({
      ...predictionConfig,
      functionName: "unpause",
    });
  },

  /**
   * Claim treasury (admin only)
   */
  claimTreasury: async (client: any) => {
    return await client.writeContract({
      ...predictionConfig,
      functionName: "claimTreasury",
    });
  },

  // Admin Functions (owner/admin only)

  /**
   * Set admin address
   */
  setAdmin: async (client: any, adminAddress: string) => {
    return await client.writeContract({
      ...predictionConfig,
      functionName: "setAdmin",
      args: [adminAddress],
    });
  },

  /**
   * Set operator address
   */
  setOperator: async (client: any, operatorAddress: string) => {
    return await client.writeContract({
      ...predictionConfig,
      functionName: "setOperator",
      args: [operatorAddress],
    });
  },

  /**
   * Set oracle address
   */
  setOracle: async (client: any, oracle: string) => {
    return await client.writeContract({
      ...predictionConfig,
      functionName: "setOracle",
      args: [oracle],
    });
  },

  /**
   * Set minimum bet amount
   */
  setMinBetAmount: async (client: any, minBetAmount: bigint) => {
    return await client.writeContract({
      ...predictionConfig,
      functionName: "setMinBetAmount",
      args: [minBetAmount],
    });
  },

  /**
   * Set treasury fee
   */
  setTreasuryFee: async (client: any, treasuryFee: bigint) => {
    return await client.writeContract({
      ...predictionConfig,
      functionName: "setTreasuryFee",
      args: [treasuryFee],
    });
  },

  /**
   * Set buffer and interval seconds
   */
  setBufferAndIntervalSeconds: async (
    client: any,
    bufferSeconds: bigint,
    intervalSeconds: bigint
  ) => {
    return await client.writeContract({
      ...predictionConfig,
      functionName: "setBufferAndIntervalSeconds",
      args: [bufferSeconds, intervalSeconds],
    });
  },

  /**
   * Set oracle update allowance
   */
  setOracleUpdateAllowance: async (
    client: any,
    oracleUpdateAllowance: bigint
  ) => {
    return await client.writeContract({
      ...predictionConfig,
      functionName: "setOracleUpdateAllowance",
      args: [oracleUpdateAllowance],
    });
  },

  /**
   * Transfer ownership
   */
  transferOwnership: async (client: any, newOwner: string) => {
    return await client.writeContract({
      ...predictionConfig,
      functionName: "transferOwnership",
      args: [newOwner],
    });
  },

  /**
   * Renounce ownership
   */
  renounceOwnership: async (client: any) => {
    return await client.writeContract({
      ...predictionConfig,
      functionName: "renounceOwnership",
    });
  },

  /**
   * Recover tokens (owner only)
   */
  recoverToken: async (client: any, token: string, amount: bigint) => {
    return await client.writeContract({
      ...predictionConfig,
      functionName: "recoverToken",
      args: [token, amount],
    });
  },

  // Utility Functions

  /**
   * Get formatted round data
   */
  getFormattedRound: async (client: any, epoch: bigint) => {
    const round = await predictionUtils.getRound(client, epoch);
    return {
      epoch: formatEpoch(round[0]),
      startTimestamp: formatTimestamp(round[1]),
      lockTimestamp: formatTimestamp(round[2]),
      closeTimestamp: formatTimestamp(round[3]),
      lockPrice: formatPrice(round[4]),
      closePrice: formatPrice(round[5]),
      lockOracleId: formatEpoch(round[6]),
      closeOracleId: formatEpoch(round[7]),
      totalAmount: formatAmount(round[8]),
      bullAmount: formatAmount(round[9]),
      bearAmount: formatAmount(round[10]),
      rewardBaseCalAmount: formatAmount(round[11]),
      rewardAmount: formatAmount(round[12]),
      oracleCalled: round[13],
      rawData: round,
    };
  },

  /**
   * Get formatted user bet info
   */
  getFormattedLedger: async (client: any, epoch: bigint, user: string) => {
    const ledger = await predictionUtils.getLedger(client, epoch, user);
    return {
      position: ledger[0] === 0n ? Position.Bull : Position.Bear,
      amount: formatAmount(ledger[1]),
      claimed: ledger[2],
      rawData: ledger,
    };
  },

  /**
   * Get formatted user rounds
   */
  getFormattedUserRounds: async (
    client: any,
    user: string,
    cursor: bigint,
    size: bigint
  ) => {
    const result = await predictionUtils.getUserRounds(
      client,
      user,
      cursor,
      size
    );
    return {
      epochs: result[0].map(formatEpoch),
      betInfos: result[1].map((bet) => ({
        position: bet[0] === 0n ? Position.Bull : Position.Bear,
        amount: formatAmount(bet[1]),
        claimed: bet[2],
      })),
      cursor: formatEpoch(result[2]),
      rawData: result,
    };
  },

  /**
   * Check if user has bet on epoch
   */
  hasUserBet: async (client: any, epoch: bigint, user: string) => {
    const ledger = await predictionUtils.getLedger(client, epoch, user);
    return ledger[1] > BigInt(0); // amount > 0
  },

  /**
   * Get user bet position for epoch
   */
  getUserBetPosition: async (client: any, epoch: bigint, user: string) => {
    const ledger = await predictionUtils.getLedger(client, epoch, user);
    return ledger[0] === BigInt(0) ? Position.Bull : Position.Bear;
  },

  /**
   * Calculate potential reward for bet
   */
  calculatePotentialReward: async (
    client: any,
    epoch: bigint,
    user: string
  ) => {
    const round = await predictionUtils.getRound(client, epoch);
    const ledger = await predictionUtils.getLedger(client, epoch, user);

    if (ledger[1] === BigInt(0)) return BigInt(0); // No bet

    const totalAmount = round[8];
    const bullAmount = round[9];
    const bearAmount = round[10];
    const userAmount = ledger[1];
    const userPosition = ledger[0];

    if (userPosition === BigInt(0)) {
      // Bull
      return totalAmount > BigInt(0)
        ? (userAmount * totalAmount) / bullAmount
        : BigInt(0);
    } else {
      // Bear
      return totalAmount > BigInt(0)
        ? (userAmount * totalAmount) / bearAmount
        : BigInt(0);
    }
  },

  /**
   * Get all claimable epochs for user
   */
  getClaimableEpochs: async (
    client: any,
    user: string,
    maxEpochs: number = 50
  ) => {
    const currentEpoch = await predictionUtils.getCurrentEpoch(client);
    const claimableEpochs: bigint[] = [];

    for (let i = 0; i < maxEpochs; i++) {
      const epoch = currentEpoch - BigInt(i);
      if (epoch <= 0n) break;

      const isClaimable = await predictionUtils.getClaimable(
        client,
        epoch,
        user
      );
      if (isClaimable) {
        claimableEpochs.push(epoch);
      }
    }

    return claimableEpochs;
  },

  /**
   * Get round status
   */
  getRoundStatus: async (client: any, epoch: bigint) => {
    const round = await predictionUtils.getRound(client, epoch);
    const now = BigInt(Math.floor(Date.now() / 1000));

    if (now < round[1]) return "upcoming";
    if (now < round[2]) return "live";
    if (now < round[3]) return "locked";
    if (round[13]) return "ended"; // oracleCalled
    return "pending";
  },
};
