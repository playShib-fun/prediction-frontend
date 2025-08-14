"use client";

import GameCard from "@/components/shibplay/game-card";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import { useRounds } from "@/hooks/use-prediction-data";
import Loading from "@/components/shibplay/loading";
import Subheader from "@/components/shibplay/subheader";
import TrophyAnimation from "@/components/shibplay/trophy-animation";
import { useTrophyAnimationStore } from "@/stores";

export default function Home() {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [selected, setSelected] = useState(1);
  const [isInitialScroll, setIsInitialScroll] = useState(true);
  const {
    data: allRounds,
    isLoading,
    refetch,
  } = useRounds({
    limit: 5,
    sortBy: "startTimeStamp",
    ascending: false,
  });

  const { isActive } = useTrophyAnimationStore();

  const getGameState = (status?: string) => {
    const normalized = (status || "upcoming").toLowerCase();
    if (
      normalized === "live" ||
      normalized === "ended" ||
      normalized === "upcoming"
    ) {
      return normalized as "live" | "ended" | "upcoming";
    }
    return "upcoming";
  };

  useEffect(() => {
    if (!api) {
      return;
    }
    if (!allRounds || allRounds.length === 0) {
      return;
    }
    if (isInitialScroll) {
      api.scrollTo(allRounds.length - 2);
      setSelected(allRounds.length - 2);
      setIsInitialScroll(false);
    }

    api.on("select", () => {
      setSelected(api.selectedScrollSnap());
    });
  }, [api, allRounds, isInitialScroll]);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    const interval = setInterval(() => {
      refetch();
    }, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, [isLoading, refetch]);

  // Derive a stable ascending list to avoid mutating original data
  const roundsAsc = [...(allRounds ?? [])].reverse();
  const totalRounds = roundsAsc.length;
  // Compute the epoch of the "Next" card (nearest upcoming); fallback to max epoch
  const nextEpochBase = (() => {
    if (!roundsAsc || roundsAsc.length === 0) return undefined;
    const upcomingEpochs = roundsAsc
      .filter((r) => getGameState(r.status) === "upcoming")
      .map((r) => Number(r.roundId));
    if (upcomingEpochs.length > 0) {
      // Choose the largest upcoming epoch as the base
      return Math.max(...upcomingEpochs);
    }
    // Fallback: largest epoch overall
    return Math.max(...roundsAsc.map((r) => Number(r.roundId)));
  })();

  return (
    <>
      <Subheader />
      <main className="h-full flex-1 w-full flex items-center justify-center transition-all duration-300 ease-in-out pt-2 md:pt-6 pb-24 md:pb-0">
        {isLoading ? (
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
                  key={`round-${round.roundId}`}
                  className={`md:basis-1/4 lg:basis-2/3 transition-all duration-300 ease-in-out ${
                    selected === index
                      ? "opacity-100 scale-100"
                      : "opacity-75 scale-75"
                  }`}
                >
                  <GameCard
                    roundId={Number(round.roundId)}
                    state={getGameState(round.status)}
                    active={selected === index}
                    stateLabelOverride={
                      getGameState(round.status) === "upcoming"
                        ? "Next"
                        : undefined
                    }
                  />
                </CarouselItem>
              ))}
              {nextEpochBase !== undefined && (
                <>
                  <CarouselItem
                    key={`round-later-1-${nextEpochBase}`}
                    className={`md:basis-1/4 lg:basis-2/3 transition-all duration-300 ease-in-out ${
                      selected === totalRounds + 1
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
                      selected === totalRounds + 2
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
      {isActive && <TrophyAnimation />}
    </>
  );
}
