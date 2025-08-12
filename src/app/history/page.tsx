"use client";

import { useWalletConnection } from "@/hooks/use-wallet";
import {
  useBetBears,
  useBetBulls,
  useClaims,
  useEndRounds,
  useLockRounds,
  useRewardsCalculated,
} from "@/hooks/use-prediction-data";
import { Card, CardContent } from "@/components/ui/card";

import { useEffect, useMemo, useState } from "react";
import Loading from "@/components/shibplay/loading";
import HistoryCard from "@/components/shibplay/history-card";
import HistoryFilters, {
  FilterType,
} from "@/components/shibplay/history-filters";

export default function History() {
  const { address } = useWalletConnection();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const {
    data: claims,
    isLoading: isClaimsLoading,
    refetch: refetchClaims,
  } = useClaims({
    sender: address?.toLowerCase() ?? "",
    sortBy: "timestamp",
    ascending: false,
  });

  const {
    data: bearBets,
    isLoading: isBearBetsLoading,
    refetch: refetchBearBets,
  } = useBetBears({
    sender: address?.toLowerCase() ?? "",
    sortBy: "timestamp",
    ascending: false,
  });

  const {
    data: bullBets,
    isLoading: isBullBetsLoading,
    refetch: refetchBullBets,
  } = useBetBulls({
    sender: address?.toLowerCase() ?? "",
    sortBy: "timestamp",
    ascending: false,
  });

  const {
    data: endRounds,
    isLoading: isEndRoundsLoading,
    refetch: refetchEndRounds,
  } = useEndRounds();
  const {
    data: lockRounds,
    isLoading: isLockRoundsLoading,
    refetch: refetchLockRounds,
  } = useLockRounds();
  const {
    data: rewardsCalculated,
    isLoading: isRewardsCalculatedLoading,
    refetch: refetchRewardsCalculated,
  } = useRewardsCalculated();

  useEffect(() => {
    const interval = setInterval(() => {
      refetchEndRounds();
      refetchLockRounds();
      refetchRewardsCalculated();
      refetchClaims();
      refetchBearBets();
      refetchBullBets();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const allBets = useMemo(() => {
    const bets = [
      ...(bearBets?.map((bet) => ({ ...bet, type: "bear" })) || []),
      ...(bullBets?.map((bet) => ({ ...bet, type: "bull" })) || []),
    ];
    return bets.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
  }, [bearBets, bullBets]);

  // Calculate stats for each bet
  const betsWithStats = useMemo(() => {
    return allBets.map((bet) => {
      const roundStatus = getRoundStatus(bet.roundId);
      const isClaimed =
        claims?.some((claim) => claim.roundId === bet.roundId) ?? false;

      return {
        ...bet,
        roundStatus,
        isClaimed,
      };
    });
  }, [allBets, claims]);

  // Calculate stats
  const stats = useMemo(() => {
    const calculating = betsWithStats.filter(
      (bet) => bet.roundStatus === "calculating"
    ).length;
    const running = betsWithStats.filter(
      (bet) => bet.roundStatus === "running"
    ).length;
    // We're not showing upcoming in filters anymore

    // Calculate winners and losers from ended rounds
    const endedBets = betsWithStats.filter(
      (bet) => bet.roundStatus === "ended"
    );
    const winners = endedBets.filter(
      (bet) => claims?.some((claim) => claim.roundId === bet.roundId) ?? false
    ).length;
    const losers = endedBets.length - winners;

    return {
      total: betsWithStats.length,
      winners,
      losers,
      calculating,
      running,
      upcoming: 0, // We're not showing upcoming in filters anymore
    };
  }, [betsWithStats, claims]);

  function isRoundLocked(roundId: string) {
    return lockRounds?.some((lock) => lock.epoch === roundId);
  }

  function hasRoundEnded(roundId: string) {
    return endRounds?.some((end) => end.epoch === roundId);
  }

  function isRoundRewardsCalculated(roundId: string) {
    return rewardsCalculated?.some((reward) => reward.roundId === roundId);
  }

  function getRoundStatus(roundId: string) {
    if (hasRoundEnded(roundId)) {
      if (isRoundRewardsCalculated(roundId)) {
        return "ended";
      } else {
        return "calculating";
      }
    } else if (isRoundLocked(roundId)) {
      return "running";
    } else {
      return "upcoming";
    }
  }

  if (
    isEndRoundsLoading ||
    isClaimsLoading ||
    isBearBetsLoading ||
    isBullBetsLoading ||
    isLockRoundsLoading ||
    isRewardsCalculatedLoading
  ) {
    return <Loading />;
  }

  if (!address) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-96 bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border-gray-800">
          <CardContent className="">
            <p className="text-center text-gray-400">
              Please connect your wallet to view history
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-4 px-4 lg:px-0">
      <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        History
      </h1>

      {/* Filter Component */}
      <HistoryFilters
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        stats={stats}
      />

      {/* Results - HistoryCard will handle filtering */}
      <div className="grid gap-4">
        {betsWithStats.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              No bets found
            </h3>
            <p className="text-gray-500">
              You haven&apos;t placed any bets yet.
            </p>
          </div>
        ) : (
          betsWithStats.map((bet, index) => (
            <HistoryCard
              key={`${bet.roundId}-${bet.type}-${bet.roundStatus}`}
              bet={{
                roundId: bet.roundId,
                type: bet.type as "bull" | "bear",
                amount: bet.amount,
                timestamp: bet.timestamp,
              }}
              roundStatus={
                bet.roundStatus as
                  | "calculating"
                  | "running"
                  | "upcoming"
                  | "ended"
              }
              index={index}
              isClaimed={bet.isClaimed}
              activeFilter={activeFilter}
            />
          ))
        )}
      </div>
    </div>
  );
}
