"use client";

import GameCard from "@/components/shibplay/game-card";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import {
  useEndRounds,
  useLockRounds,
  useStartRounds,
} from "@/hooks/use-prediction-data";
import Loading from "@/components/shibplay/loading";

export default function Home() {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [selected, setSelected] = useState(1);
  const [isInitialScroll, setIsInitialScroll] = useState(true);
  const {
    data: startRounds,
    isLoading,
    refetch: refetchStartRounds,
  } = useStartRounds({
    limit: 5,
    sortBy: "timestamp",
    ascending: false,
  });
  const {
    data: endRounds,
    isLoading: isEndLoading,
    refetch: refetchEndRounds,
  } = useEndRounds({
    limit: 5,
    sortBy: "timestamp",
    ascending: false,
  });
  const {
    data: lockRounds,
    isLoading: isLockLoading,
    refetch: refetchLockRounds,
  } = useLockRounds({
    limit: 5,
    sortBy: "timestamp",
    ascending: false,
  });

  function hasRoundEnded(roundId: string) {
    return endRounds?.some((round) => round.epoch === roundId);
  }

  function isRoundLocked(roundId: string) {
    return lockRounds?.some((round) => round.epoch === roundId);
  }

  function returnGameState(roundId: string) {
    if (isRoundLocked(roundId)) {
      if (!hasRoundEnded(roundId)) {
        return "live";
      }
      return "ended";
    }

    return "upcoming";
  }

  useEffect(() => {
    if (!api) {
      return;
    }
    if (!startRounds || startRounds.length === 0) {
      return;
    }
    if (isInitialScroll) {
      api.scrollTo(startRounds.length - 2);
      setSelected(startRounds.length - 2);
      setIsInitialScroll(false);
    }

    api.on("select", () => {
      setSelected(api.selectedScrollSnap());
    });
  }, [api, startRounds, isInitialScroll]);

  useEffect(() => {
    if (isLoading || isEndLoading || isLockLoading) {
      return;
    }
    const interval = setInterval(() => {
      refetchStartRounds();
      refetchEndRounds();
      refetchLockRounds();
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [isLoading, isEndLoading, isLockLoading]);

  // Derive a stable ascending list to avoid mutating original data
  const roundsAsc = [...(startRounds ?? [])].reverse();
  const totalRounds = roundsAsc.length;
  // Compute the epoch of the "Next" card (nearest upcoming); fallback to max epoch
  const nextEpochBase = (() => {
    if (!roundsAsc || roundsAsc.length === 0) return undefined;
    const upcomingEpochs = roundsAsc
      .filter((r) => returnGameState(r.epoch) === "upcoming")
      .map((r) => Number(r.epoch));
    if (upcomingEpochs.length > 0) {
      // Choose the largest upcoming epoch as the base
      return Math.max(...upcomingEpochs);
    }
    // Fallback: largest epoch overall
    return Math.max(...roundsAsc.map((r) => Number(r.epoch)));
  })();

  return (
    <>
      <main className="h-full flex-1 w-full flex items-center justify-center transition-all duration-300 ease-in-out pt-2 md:pt-6 pb-24 md:pb-0">
        {isLoading || isEndLoading || isLockLoading ? (
          <Loading />
        ) : (
          <Carousel
            className="w-full overflow-x-visible"
            opts={{
              startIndex: 1,
            }}
            setApi={setApi}
          >
            <CarouselContent className="overflow-x-visible">
              {roundsAsc.map((round, index) => (
                <CarouselItem
                  key={`round-${round.epoch}`}
                  className={`md:basis-1/4 lg:basis-2/3 transition-all duration-300 ease-in-out ${
                    selected === index
                      ? "opacity-100 scale-100"
                      : "opacity-75 scale-75"
                  }`}
                >
                  <GameCard
                    roundId={Number(round.epoch)}
                    state={returnGameState(round.epoch)}
                    active={selected === index}
                    stateLabelOverride={returnGameState(round.epoch) === "upcoming" ? "Next" : undefined}
                  />
                </CarouselItem>
              ))}
              {nextEpochBase !== undefined && (
                <>
                  <CarouselItem
                    key={`round-later-1-${nextEpochBase}`}
                    className={`md:basis-1/4 lg:basis-2/3 transition-all duration-300 ease-in-out ${
                      selected === (totalRounds + 1)
                        ? "opacity-100 scale-100"
                        : "opacity-75 scale-75"
                    }`}
                  >
                    <GameCard
                      roundId={Number(nextEpochBase) + 1}
                      state="upcoming"
                      active={false}
                      stateLabelOverride="Later"
                      placeholderOffset={1}
                    />
                  </CarouselItem>
                  <CarouselItem
                    key={`round-later-2-${nextEpochBase}`}
                    className={`md:basis-1/4 lg:basis-2/3 transition-all duration-300 ease-in-out ${
                      selected === (totalRounds + 2)
                        ? "opacity-100 scale-100"
                        : "opacity-75 scale-75"
                    }`}
                  >
                    <GameCard
                      roundId={Number(nextEpochBase) + 2}
                      state="upcoming"
                      active={false}
                      stateLabelOverride="Later"
                      placeholderOffset={2}
                    />
                  </CarouselItem>
                </>
              )}

            </CarouselContent>
          </Carousel>
        )}
      </main>
    </>
  );
}
