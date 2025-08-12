import { GraphQLClient } from "graphql-request";

const GRAPHQL_ENDPOINT =
  "https://23019154-5b6e-4edb-a020-f889c237c21c.squids.live/puppynet-prediction-squid@v2/api/graphql";

export const graphqlClient = new GraphQLClient(GRAPHQL_ENDPOINT, {
  headers: {
    "Content-Type": "application/json",
  },
});

// Types for all the entities
export interface StartRound {
  epoch: string;
  id: string;
  logIndex: string;
  transactionHash: string;
  timestamp: string;
}

export interface RewardsCalculated {
  id: string;
  logIndex: string;
  rewardAmount: string;
  rewardBaseCalAmount: string;
  roundId: string;
  timestamp: string;
  transactionHash: string;
  treasuryAmt: string;
}

export interface LockRound {
  epoch: string;
  id: string;
  lockPrice: string;
  logIndex: string;
  roundId: string;
  timestamp: string;
  transactionHash: string;
}

export interface EndRound {
  closePrice: string;
  epoch: string;
  id: string;
  logIndex: string;
  roundId: string;
  timestamp: string;
  transactionHash: string;
}

export interface Claim {
  amount: string;
  id: string;
  logIndex: string;
  roundId: string;
  sender: string;
  timestamp: string;
  transactionHash: string;
}

export interface BetBull {
  amount: string;
  id: string;
  logIndex: string;
  roundId: string;
  sender: string;
  timestamp: string;
  transactionHash: string;
}

export interface BetBear {
  id: string;
  amount: string;
  logIndex: string;
  roundId: string;
  sender: string;
  timestamp: string;
  transactionHash: string;
}

export interface Round {
  id: string;
  pricePool: string;
  roundId: string;
  startTimeStamp: string;
  users: string;
  exitTimeStamp: string;
  // Newly added fields from rounds query
  bearAmount?: string;
  bullAmount?: string;
  status?: string;
  updateTimeStamp?: string;
}

// Query types
export interface QueryResponse {
  startRounds: StartRound[];
  rewardsCalculateds: RewardsCalculated[];
  lockRounds: LockRound[];
  endRounds: EndRound[];
  claims: Claim[];
  betBulls: BetBull[];
  betBears: BetBear[];
}

export interface SingleQueryResponse {
  startRoundById: StartRound;
  rewardsCalculatedById: RewardsCalculated;
  lockRoundById: LockRound;
  endRoundById: EndRound;
  claimById: Claim;
  betBullById: BetBull;
  betBearById: BetBear;
}
