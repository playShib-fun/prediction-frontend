"use client";

import GameCard from "@/components/shibplay/game-card";
import { Tutorial } from "@/components/shibplay/tutorial";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Fragment, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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

  return (
    <>
      <main className="h-full flex-1 w-full flex items-center justify-center transition-all duration-300 ease-in-out">
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
              {startRounds?.reverse().map((round, index) => (
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
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        )}
      </main>
    </>
  );
}
