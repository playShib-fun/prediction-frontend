"use client";

import { useWalletConnection } from "@/hooks/use-wallet";
import { useBetBears, useBetBulls, useClaims, useRounds } from "@/hooks/use-prediction-data";
import { Card, CardContent } from "@/components/ui/card";

import { useEffect, useMemo, useState } from "react";
import { formatUnits } from "viem";
import Loading from "@/components/shibplay/loading";
import HistoryCard from "@/components/shibplay/history-card";
// import StatisticsDashboard from "@/components/shibplay/statistics-dashboard";
// import FilterPanel from "@/components/shibplay/filter-panel";
// import HistoryControls from "@/components/shibplay/history-controls";
// import { useHistoryStats } from "@/hooks/use-history-stats";
import {
  useHistoryFilters,
  useHistorySearch,
} from "@/hooks/use-history-filters";
// Utilities are used internally by hooks
import type { BetRecord } from "@/lib/history-types";
import {
  useInfiniteScroll,
  useVirtualInfiniteScroll,
} from "@/hooks/use-infinite-scroll";
import { StatisticsCalculator } from "@/lib/history-statistics";

export default function History() {
  const { address } = useWalletConnection();
  // Enhanced filters and sort state
  const [allProcessedBets, setAllProcessedBets] = useState<BetRecord[]>([]);
  const { filters, sort, filteredData } =
    useHistoryFilters(allProcessedBets, {
      validateOnChange: true,
    });
  // Debounce occurs in controls (300ms). Avoid double-debouncing here.
  const { searchResults } = useHistorySearch(filteredData, 0);

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
    data: allRounds,
    isLoading: isRoundsLoading,
    refetch: refetchRounds,
  } = useRounds();

  useEffect(() => {
    const interval = setInterval(() => {
      refetchRounds();
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

  // Build round status map from AllRounds and helper accessor
  const roundStatusMap = useMemo(() => {
    const map = new Map<string, "upcoming" | "running" | "ended">();
    (allRounds ?? []).forEach((r: any) => {
      const normalized = String(r.status || "").toLowerCase();
      const status: "upcoming" | "running" | "ended" =
        normalized === "live"
          ? "running"
          : normalized === "ended"
          ? "ended"
          : "upcoming";
      map.set(String(r.roundId), status);
    });
    return map;
  }, [allRounds]);

  function getRoundStatus(roundId: string) {
    return roundStatusMap.get(String(roundId)) ?? "upcoming";
  }

  // Calculate enhanced bet records with outcome mapping expected by utilities
  const betsWithStats = useMemo(() => {
    return allBets.map((bet) => {
      const roundStatus = getRoundStatus(bet.roundId);
      const isClaimed =
        claims?.some((claim) => claim.roundId === bet.roundId) ?? false;
      // Derive status in terms of won/lost/pending/calculating
      let status: BetRecord["status"] = "pending";
      if (roundStatus === "ended") {
        status = isClaimed ? "won" : "lost";
      } else if (roundStatus === "running") {
        status = "pending";
      } else {
        // upcoming
        status = "pending";
      }

      const base: BetRecord = {
        id: `${bet.transactionHash}-${bet.logIndex}`,
        roundId: bet.roundId,
        type: bet.type as "bull" | "bear",
        amount: bet.amount,
        timestamp: bet.timestamp,
        transactionHash: bet.transactionHash,
        sender: bet.sender,
        logIndex: bet.logIndex,
        status,
        claimedAmount: isClaimed
          ? claims?.find(
              (c) =>
                c.roundId === bet.roundId &&
                c.sender?.toLowerCase() === (address?.toLowerCase() ?? "")
            )?.amount ?? undefined
          : undefined,
      } as BetRecord;

      // Calculate profit/loss
      const { profit, profitPercentage } =
        StatisticsCalculator.calculateBetProfit(base);
      return { ...base, profit, profitPercentage } as BetRecord;
    });
  }, [allBets, claims, address]);

  // Keep a local copy for filter hook input
  useEffect(() => {
    setAllProcessedBets(betsWithStats);
  }, [betsWithStats]);

  // Compute statistics for current filtered dataset (currently unused in UI)
  // const statsHook = useHistoryStats(searchResults, {
  //   recalculateOnDataChange: true,
  // });

  // Pagination with infinite scroll
  const PAGE_SIZE = 20;
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const paginatedResults = useMemo(
    () => searchResults.slice(0, page * PAGE_SIZE),
    [searchResults, page]
  );
  const hasMore = paginatedResults.length < searchResults.length;

  const loadMore = async () => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    // Simulate network latency for UX and to avoid rapid loads
    await new Promise((r) => setTimeout(r, 300));
    setPage((p) => p + 1);
    setIsLoadingMore(false);
  };

  // Always initialize virtualized infinite scroll hook at the top level
  // Even if we don't render the virtualized list, calling hooks unconditionally is required
  const virtual = useVirtualInfiniteScroll(
    paginatedResults,
    128,
    720,
    loadMore,
    { threshold: 200, hasMore, isLoading: isLoadingMore, overscan: 6 }
  );

  const {
    triggerRef,
    error: loadError,
    retry: retryLoad,
  } = useInfiniteScroll(loadMore, {
    threshold: 200,
    hasMore,
    isLoading: isLoadingMore,
  });

  // Reset pagination on filters/sort/search change
  useEffect(() => {
    setPage(1);
  }, [
    filters.outcome,
    filters.betType,
    filters.roundStatus,
    filters.dateRange.preset,
    filters.amountRange.min,
    filters.amountRange.max,
    filters.search,
    sort.field,
    sort.direction,
  ]);

  

  if (isRoundsLoading || isClaimsLoading || isBearBetsLoading || isBullBetsLoading) {
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
      {/* <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        History
      </h1> */}

      {/* Statistics Dashboard */}
      {/* <StatisticsDashboard statistics={statsHook.statistics} isLoading={statsHook.isLoading} filteredData={searchResults} /> */}

      {/* Controls: search, sort, export, active filters */}
      {/* <HistoryControls
        filters={filters}
        onFiltersChange={(f) => { setFilters(f); }}
        sort={sort}
        onSortChange={(s) => setSort(s)}
        totalResults={searchResults.length}
        onSearchChange={(term) => {
          setFilters({ ...filters, search: term });
          setSearchTerm(term);
        }}
        dataForExport={searchResults}
      /> */}

      {/* Filter panel (drawer/modal/sidebar) */}
      {/* <FilterPanel filters={filters} onChange={(f) => setFilters(f)} /> */}

      {/* Results with infinite scroll and virtualization for large lists */}
      <div className="grid gap-4">
        {paginatedResults.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              No bets found
            </h3>
            <p className="text-gray-500">
              You haven&apos;t placed any bets yet.
            </p>
          </div>
        ) : paginatedResults.length > 100 ? (
          <div
            ref={virtual.containerRef as any}
            style={{ height: 720, overflow: "auto", position: "relative" }}
            className="rounded-xl border border-gray-800/50"
          >
            <div style={{ position: "relative", height: virtual.totalHeight }}>
              {virtual.visibleItems.map(({ item: bet, index, style }) => (
                <div
                  key={`${bet.roundId}-${bet.type}-${bet.timestamp}`}
                  style={style}
                >
                  <HistoryCard
                    bet={{
                      roundId: bet.roundId,
                      type: bet.type,
                      amount: (() => {
                        try {
                          return formatUnits(BigInt(bet.amount), 18);
                        } catch {
                          return "0";
                        }
                      })(),
                      timestamp: bet.timestamp,
                      transactionHash: bet.transactionHash,
                    }}
                    roundStatus={getRoundStatus(bet.roundId)}
                    index={index}
                    isClaimed={bet.status === "won"}
                    profitLoss={bet.profit}
                    searchTerm={filters.search}
                  />
                </div>
              ))}
            </div>
            <div className="py-3 text-center text-gray-400">
              {isLoadingMore ? (
                "Loading more..."
              ) : hasMore ? (
                loadError ? (
                  <button onClick={() => retryLoad()} className="text-red-400 underline">
                    Failed to load. Tap to retry.
                  </button>
                ) : (
                  "Scroll for more"
                )
              ) : (
                "End of results"
              )}
            </div>
          </div>
        ) : (
          paginatedResults.map((bet, index) => (
            <HistoryCard
              key={`${bet.roundId}-${bet.type}-${bet.timestamp}`}
              bet={{
                roundId: bet.roundId,
                type: bet.type,
                amount: (() => {
                  try {
                    return formatUnits(BigInt(bet.amount), 18);
                  } catch {
                    return "0";
                  }
                })(),
                timestamp: bet.timestamp,
                transactionHash: bet.transactionHash,
              }}
              roundStatus={getRoundStatus(bet.roundId)}
              index={index}
              isClaimed={bet.status === "won"}
              profitLoss={bet.profit}
              searchTerm={filters.search}
            />
          ))
        )}

        {/* Infinite scroll trigger and states for non-virtualized path */}
        {paginatedResults.length <= 100 &&
          (hasMore ? (
            <div
              ref={triggerRef as any}
              className="h-12 flex items-center justify-center text-gray-400"
            >
              {isLoadingMore ? (
                "Loading more..."
              ) : loadError ? (
                <button
                  onClick={() => retryLoad()}
                  className="text-red-400 underline"
                >
                  Failed to load. Tap to retry.
                </button>
              ) : (
                "Scroll to load more"
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">End of results</div>
          ))}
      </div>
    </div>
  );
}
