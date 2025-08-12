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

export default function Home() {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [selected, setSelected] = useState(1);
  const [isInitialScroll, setIsInitialScroll] = useState(true);

  const {
    data: rounds,
    isLoading,
    refetch,
  } = useRounds({
    orderBy: "startTimeStamp",
    orderDirection: "desc",
    limit: 5,
  });

  useEffect(() => {
    if (!api) {
      return;
    }
    if (!rounds || rounds.length === 0) {
      return;
    }
    if (isInitialScroll) {
      api.scrollTo(rounds.length - 2);
      setSelected(rounds.length - 2);
      setIsInitialScroll(false);
    }

    api.on("select", () => {
      setSelected(api.selectedScrollSnap());
    });
  }, [api, rounds, isInitialScroll]);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    const interval = setInterval(() => {
      refetch();
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [isLoading, refetch]);

  return (
    <>
      <main className="h-full flex-1 w-full flex items-center justify-center transition-all duration-300 ease-in-out">
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
              {rounds?.reverse().map((round, index) => (
                <CarouselItem
                  key={`round-${round.roundId}`}
                  className={`md:basis-1/4 lg:basis-2/3 transition-all duration-300 ease-in-out ${
                    selected === index
                      ? "opacity-100 scale-100"
                      : "opacity-75 scale-75"
                  }`}
                >
                  <GameCard
                    round={round}
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
