import { createPublicClient, http } from "viem";
import { type Chain } from "wagmi/chains";
import bonePriceAbi from "@/abis/bone-price.json";

// Contract address
export const BONE_PRICE_CONTRACT_ADDRESS =
  "0x06B8105e10D16f739666A5F79c7339BC86bdAC3b" as const;

// Contract ABI
export const bonePriceContractAbi = bonePriceAbi;

// Types for contract data
export interface BonePriceData {
  roundId: bigint;
  price: bigint;
  timestamp: bigint;
}

export interface BonePriceState {
  currentPrice: bigint;
  currentRoundId: bigint;
  lastUpdateTime: bigint;
  minUpdateInterval: bigint;
  owner: string;
}

// Contract configuration
export const bonePriceConfig = {
  address: BONE_PRICE_CONTRACT_ADDRESS,
  abi: bonePriceContractAbi,
} as const;

// Public client for read operations
export const createBonePriceClient = (chain: Chain) => {
  return createPublicClient({
    chain,
    transport: http(),
  });
};

// Utility functions for data conversion
export const formatBonePrice = (price: bigint): number => {
  return Number(price) / 1e8; // Assuming 8 decimals for price
};

export const formatTimestamp = (timestamp: bigint): Date => {
  return new Date(Number(timestamp) * 1000);
};

export const formatRoundId = (roundId: bigint): number => {
  return Number(roundId);
};
