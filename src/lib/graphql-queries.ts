import { graphqlClient } from "./graphql-client";
import type {
  StartRound,
  RewardsCalculated,
  LockRound,
  EndRound,
  Claim,
  BetBull,
  BetBear,
} from "./graphql-client";

// GraphQL Queries
const QUERIES = {
  // Start Rounds
  GET_ALL_START_ROUNDS: `
    query GetAllStartRounds {
      startRounds {
        epoch
        id
        logIndex
        transactionHash
        timestamp
      }
    }
  `,

  GET_START_ROUND_BY_ID: `
    query GetStartRoundById($id: String!) {
      startRoundById(id: $id) {
        epoch
        id
        logIndex
        timestamp
        transactionHash
      }
    }
  `,

  // Rewards Calculated
  GET_ALL_REWARDS_CALCULATED: `
    query GetAllRewardsCalculated {
      rewardsCalculateds {
        id
        logIndex
        rewardAmount
        rewardBaseCalAmount
        roundId
        timestamp
        transactionHash
        treasuryAmt
      }
    }
  `,

  GET_REWARDS_CALCULATED_BY_ID: `
    query GetRewardsCalculatedById($id: String!) {
      rewardsCalculatedById(id: $id) {
        id
        logIndex
        rewardAmount
        rewardBaseCalAmount
        roundId
        timestamp
        transactionHash
        treasuryAmt
      }
    }
  `,

  // Lock Rounds
  GET_ALL_LOCK_ROUNDS: `
    query GetAllLockRounds {
      lockRounds {
        epoch
        id
        lockPrice
        logIndex
        roundId
        timestamp
        transactionHash
      }
    }
  `,

  GET_LOCK_ROUND_BY_ID: `
    query GetLockRoundById($id: String!) {
      lockRoundById(id: $id) {
        epoch
        id
        lockPrice
        logIndex
        roundId
        timestamp
        transactionHash
      }
    }
  `,

  // End Rounds
  GET_ALL_END_ROUNDS: `
    query GetAllEndRounds {
      endRounds {
        closePrice
        epoch
        id
        logIndex
        roundId
        timestamp
        transactionHash
      }
    }
  `,

  GET_END_ROUND_BY_ID: `
    query GetEndRoundById($id: String!) {
      endRoundById(id: $id) {
        closePrice
        epoch
        id
        logIndex
        roundId
        timestamp
        transactionHash
      }
    }
  `,

  // Claims
  GET_ALL_CLAIMS: `
    query GetAllClaims {
      claims {
        amount
        id
        logIndex
        roundId
        sender
        timestamp
        transactionHash
      }
    }
  `,

  GET_CLAIM_BY_ID: `
    query GetClaimById($id: String!) {
      claimById(id: $id) {
        amount
        id
        logIndex
        roundId
        sender
        timestamp
        transactionHash
      }
    }
  `,

  // Bet Bulls
  GET_ALL_BET_BULLS: `
    query GetAllBetBulls {
      betBulls {
        amount
        id
        logIndex
        roundId
        sender
        timestamp
        transactionHash
      }
    }
  `,

  GET_BET_BULL_BY_ID: `
    query GetBetBullById($id: String!) {
      betBullById(id: $id) {
        amount
        id
        logIndex
        roundId
        sender
        timestamp
        transactionHash
      }
    }
  `,

  // Bet Bears
  GET_ALL_BET_BEARS: `
    query GetAllBetBears {
      betBears {
        id
        amount
        logIndex
        roundId
        sender
        timestamp
        transactionHash
      }
    }
  `,

  GET_BET_BEAR_BY_ID: `
    query GetBetBearById($id: String!) {
      betBearById(id: $id) {
        id
        amount
        logIndex
        roundId
        sender
        timestamp
        transactionHash
      }
    }
  `,

  // Combined queries for efficiency
  GET_ALL_ROUNDS_DATA: `
    query GetAllRoundsData {
      startRounds {
        epoch
        id
        logIndex
        transactionHash
        timestamp
      }
      lockRounds {
        epoch
        id
        lockPrice
        logIndex
        roundId
        timestamp
        transactionHash
      }
      endRounds {
        closePrice
        epoch
        id
        logIndex
        roundId
        timestamp
        transactionHash
      }
    }
  `,

  GET_ALL_BETS_DATA: `
    query GetAllBetsData {
      betBulls {
        amount
        id
        logIndex
        roundId
        sender
        timestamp
        transactionHash
      }
      betBears {
        id
        amount
        logIndex
        roundId
        sender
        timestamp
        transactionHash
      }
    }
  `,
};

// API Functions
export const predictionApi = {
  // Start Rounds
  getAllStartRounds: async (): Promise<StartRound[]> => {
    const response = await graphqlClient.request<{ startRounds: StartRound[] }>(
      QUERIES.GET_ALL_START_ROUNDS
    );
    return response.startRounds;
  },

  getStartRoundById: async (id: string): Promise<StartRound> => {
    const response = await graphqlClient.request<{
      startRoundById: StartRound;
    }>(QUERIES.GET_START_ROUND_BY_ID, { id });
    return response.startRoundById;
  },

  // Rewards Calculated
  getAllRewardsCalculated: async (): Promise<RewardsCalculated[]> => {
    const response = await graphqlClient.request<{
      rewardsCalculateds: RewardsCalculated[];
    }>(QUERIES.GET_ALL_REWARDS_CALCULATED);
    return response.rewardsCalculateds;
  },

  getRewardsCalculatedById: async (id: string): Promise<RewardsCalculated> => {
    const response = await graphqlClient.request<{
      rewardsCalculatedById: RewardsCalculated;
    }>(QUERIES.GET_REWARDS_CALCULATED_BY_ID, { id });
    return response.rewardsCalculatedById;
  },

  // Lock Rounds
  getAllLockRounds: async (): Promise<LockRound[]> => {
    const response = await graphqlClient.request<{ lockRounds: LockRound[] }>(
      QUERIES.GET_ALL_LOCK_ROUNDS
    );
    return response.lockRounds;
  },

  getLockRoundById: async (id: string): Promise<LockRound> => {
    const response = await graphqlClient.request<{ lockRoundById: LockRound }>(
      QUERIES.GET_LOCK_ROUND_BY_ID,
      { id }
    );
    return response.lockRoundById;
  },

  // End Rounds
  getAllEndRounds: async (): Promise<EndRound[]> => {
    const response = await graphqlClient.request<{ endRounds: EndRound[] }>(
      QUERIES.GET_ALL_END_ROUNDS
    );
    return response.endRounds;
  },

  getEndRoundById: async (id: string): Promise<EndRound> => {
    const response = await graphqlClient.request<{ endRoundById: EndRound }>(
      QUERIES.GET_END_ROUND_BY_ID,
      { id }
    );
    return response.endRoundById;
  },

  // Claims
  getAllClaims: async (): Promise<Claim[]> => {
    const response = await graphqlClient.request<{ claims: Claim[] }>(
      QUERIES.GET_ALL_CLAIMS
    );
    return response.claims;
  },

  getClaimById: async (id: string): Promise<Claim> => {
    const response = await graphqlClient.request<{ claimById: Claim }>(
      QUERIES.GET_CLAIM_BY_ID,
      { id }
    );
    return response.claimById;
  },

  // Bet Bulls
  getAllBetBulls: async (): Promise<BetBull[]> => {
    const response = await graphqlClient.request<{ betBulls: BetBull[] }>(
      QUERIES.GET_ALL_BET_BULLS
    );
    return response.betBulls;
  },

  getBetBullById: async (id: string): Promise<BetBull> => {
    const response = await graphqlClient.request<{ betBullById: BetBull }>(
      QUERIES.GET_BET_BULL_BY_ID,
      { id }
    );
    return response.betBullById;
  },

  // Bet Bears
  getAllBetBears: async (): Promise<BetBear[]> => {
    const response = await graphqlClient.request<{ betBears: BetBear[] }>(
      QUERIES.GET_ALL_BET_BEARS
    );
    return response.betBears;
  },

  getBetBearById: async (id: string): Promise<BetBear> => {
    const response = await graphqlClient.request<{ betBearById: BetBear }>(
      QUERIES.GET_BET_BEAR_BY_ID,
      { id }
    );
    return response.betBearById;
  },

  // Combined queries
  getAllRoundsData: async (): Promise<{
    startRounds: StartRound[];
    lockRounds: LockRound[];
    endRounds: EndRound[];
  }> => {
    const response = await graphqlClient.request<{
      startRounds: StartRound[];
      lockRounds: LockRound[];
      endRounds: EndRound[];
    }>(QUERIES.GET_ALL_ROUNDS_DATA);
    return response;
  },

  getAllBetsData: async (): Promise<{
    betBulls: BetBull[];
    betBears: BetBear[];
  }> => {
    const response = await graphqlClient.request<{
      betBulls: BetBull[];
      betBears: BetBear[];
    }>(QUERIES.GET_ALL_BETS_DATA);
    return response;
  },
};
