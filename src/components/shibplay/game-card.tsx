"use client";

import {
  ArrowDown,
  ArrowUp,
  ChartArea,
  ChartLine,
  CheckCircle,
  ChevronsDown,
  ChevronsUp,
  Clock,
  Coins,
  DollarSign,
  Hash,
  TowerControl,
  Trophy,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";
import { useEffect, useMemo, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { ShineBorder } from "../magicui/shine-border";
import { useTheme } from "next-themes";
import { TextAnimate } from "../magicui/text-animate";
import { motion } from "motion/react";
import NeumorphButton from "../ui/neumorph-button";
import { useStateStore } from "@/stores";
import {
  useBetBears,
  useBetBulls,
  useClaims,
  useStartRounds,
  useUserBets,
} from "@/hooks/use-prediction-data";
import {
  useFormattedCurrentPrice,
  useFormattedPriceByRoundId,
} from "@/hooks/use-bone-price";
import { StartRound } from "@/lib/graphql-client";
import PlacePredictionModal from "./place-prediction-modal";
import { useWalletConnection } from "@/hooks/use-wallet";

interface GameCardProps {
  roundId: number;
  state: "live" | "ended" | "upcoming";
  active?: boolean;
}

export default function GameCard({
  roundId,
  state,
  active = false,
}: GameCardProps) {
  const { setState } = useStateStore((state) => state);
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const { data: startRound, isLoading: isStartLoading } = useStartRounds();

  const [progress, setProgress] = useState(0);
  const [displayTime, setDisplayTime] = useState("0m 0s");
  const {
    data: betBears,
    isLoading: isBetBearsLoading,
    refetch: refetchBetBears,
  } = useBetBears({
    roundId: roundId.toString(),
  });
  const {
    data: betBulls,
    isLoading: isBetBullsLoading,
    refetch: refetchBetBulls,
  } = useBetBulls({
    roundId: roundId.toString(),
  });
  const { data: priceByRoundId, isLoading: isPriceByRoundIdLoading } =
    useFormattedPriceByRoundId(roundId.toString());
  const [bearOdds, setBearOdds] = useState(1);
  const [bullOdds, setBullOdds] = useState(1);
  // refetch every 5 seconds
  const { data: currentPrice, refetch: refetchCurrentPrice } =
    useFormattedCurrentPrice();

  // find the next-round epoch if this round has ended and then pull the round price for it's epoch
  const { data: finalPrice, isLoading: isFinalPriceLoading } =
    useFormattedPriceByRoundId((roundId + 1).toString());

  useEffect(() => {
    const interval = setInterval(() => {
      refetchCurrentPrice();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  function calculateOdds() {
    if (isBetBearsLoading || isBetBullsLoading) {
      return;
    }
    const totalBearAmount =
      betBears?.reduce((sum, b) => sum + Number(b.amount), 0) ?? 0;
    const totalBullAmount =
      betBulls?.reduce((sum, b) => sum + Number(b.amount), 0) ?? 0;
    const total = totalBearAmount + totalBullAmount;

    const brOdds = totalBearAmount === 0 ? 1 : total / totalBearAmount;
    const blOdds = totalBullAmount === 0 ? 1 : total / totalBullAmount;
    setBearOdds(brOdds);
    setBullOdds(blOdds);
  }

  useEffect(() => {
    calculateOdds();
  }, [betBears, betBulls]);

  function getCurrentRound(): StartRound | null {
    if (isStartLoading) {
      return null;
    }
    const currentRound = startRound?.find((round) => {
      return round.epoch === roundId.toString();
    });
    return currentRound ?? null;
  }

  // connected wallet address
  const { address } = useWalletConnection();

  const { data: claimableBets, isLoading: isClaimableBetsLoading } = useClaims({
    sender: address ?? "",
    roundId: roundId.toString(),
  });

  const isClaimable = useMemo(() => {
    return claimableBets?.length && claimableBets.length > 0;
  }, [claimableBets]);

  useEffect(() => {
    console.log(`roundId: ${roundId} isClaimable: ${isClaimable}`);
  }, [isClaimable]);

  const betPlaced = useMemo(() => {
    if (!address) {
      return false;
    }
    return (
      betBears?.some(
        (bet) => bet.sender.toLowerCase() === address.toLowerCase()
      ) ||
      betBulls?.some(
        (bet) => bet.sender.toLowerCase() === address.toLowerCase()
      )
    );
  }, [address, betBears, betBulls]);

  function calculateProgress() {
    if (isStartLoading) {
      return 0;
    }
    const startTimestamp = Number(getCurrentRound()?.timestamp);
    let endTime;
    if (state === "upcoming") {
      endTime = startTimestamp + 5 * 60 * 1000;
    } else {
      endTime = startTimestamp + 10 * 60 * 1000;
    }
    const now = Date.now();

    const totalDuration = endTime - startTimestamp;
    const elapsed = Math.max(0, Math.min(now - startTimestamp, totalDuration));
    const timeLeftMs = Math.max(0, endTime - now);

    const progress = Math.min(
      100,
      Math.max(0, (elapsed / totalDuration) * 100)
    );

    const minutes = Math.floor(timeLeftMs / 60000);
    const seconds = Math.floor((timeLeftMs % 60000) / 1000);
    const timeLeft = `${minutes}m ${seconds}s`;

    setProgress(Math.round(progress));
    setDisplayTime(timeLeft);
  }

  useEffect(() => {
    if (isStartLoading) {
      return;
    }
    const interval = setInterval(() => {
      calculateProgress();
    }, 1000);
    return () => clearInterval(interval);
  }, [isStartLoading]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="dark:bg-black/50 backdrop-blur-lg relative overflow-hidden">
        {active && (
          <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />
        )}
        <CardHeader>
          <CardTitle className="flex items-center gap-1 justify-between">
            <div className="flex items-center gap-2 font-mono">
              <Hash className="w-6 h-6 text-gray-500" />
              {roundId}
            </div>
            {state === "live" && (
              <Label className="text-white bg-red-500 px-2 py-0.5 rounded-full">
                <TowerControl className="w-4 h-4" />
                Live
              </Label>
            )}
            {state === "ended" && (
              <Label className="text-white bg-gray-500 px-2 py-0.5 rounded-full">
                <Trophy className="w-4 h-4" />
                Ended
              </Label>
            )}
            {state === "upcoming" && (
              <Label className="text-white bg-yellow-500 px-2 py-0.5 rounded-full">
                <Clock className="w-4 h-4" />
                Upcoming
              </Label>
            )}
          </CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent className="text-gray-500 flex flex-col items-start justify-between py-4 px-4 dark:bg-black/50 bg-white/50 rounded w-11/12 mx-auto gap-4">
          <div className="flex flex-col justify-between group">
            <div className="text-2xl text-primary z-0 font-black flex items-center gap-1">
              <DollarSign className="w-6 h-6" />
              <TextAnimate animation="slideLeft" by="character">
                {priceByRoundId ? priceByRoundId.price.toFixed(8) : "-"}
              </TextAnimate>
            </div>
            <h2 className="text-xl dark:text-secondary text-gray-500 flex items-center gap-1 font-normal ml-1">
              <Coins className="w-4 h-4" />
              Entry
            </h2>
          </div>
          <div className="flex flex-col justify-between group w-full">
            <div
              className={`text-2xl font-black ${
                priceByRoundId &&
                currentPrice &&
                priceByRoundId.price > currentPrice
                  ? "text-red-500"
                  : "text-green-500"
              } flex items-center w-full`}
            >
              <DollarSign className="w-6 h-6" />

              <TextAnimate animation="slideLeft" by="character">
                {currentPrice ? currentPrice.toFixed(8) : "-"}
              </TextAnimate>
              <div className="flex-1 w-full h-4"></div>
              {priceByRoundId &&
              currentPrice &&
              priceByRoundId.price < currentPrice ? (
                <div className="text-green-500 text-sm animate-bounce">
                  <ArrowUp className="w-6 h-6" />
                </div>
              ) : (
                <div className="text-red-500 text-sm animate-bounce">
                  <ArrowDown className="w-6 h-6" />
                </div>
              )}
            </div>
            <h2 className="text-xl dark:text-secondary text-gray-500 flex items-center gap-1 font-normal ml-1">
              <ChartLine className="w-4 h-4" />
              Current
            </h2>
          </div>
          <div className="flex flex-col justify-between group">
            <p
              className={`text-2xl font-black ${
                state === "ended" && finalPrice
                  ? "text-blue-500"
                  : "dark:text-secondary text-gray-500"
              } flex items-center gap-1`}
            >
              <DollarSign className="w-6 h-6" />
              {state === "ended" && finalPrice
                ? finalPrice.price.toFixed(8)
                : "-"}
            </p>
            <h2 className="text-xl dark:text-secondary text-gray-500 flex items-center gap-1 font-normal ml-1">
              <ChartArea className="w-4 h-4" />
              Final
            </h2>
          </div>
          {(state === "upcoming" || state === "live") && (
            <div className="flex items-center gap-2 w-full">
              <Progress value={progress} className="w-full bg-primary/20" />
              <p className="text-xs text-secondary break-keep w-auto">
                {displayTime.split(" ")[0]}&nbsp;{displayTime.split(" ")[1]}
              </p>
            </div>
          )}
        </CardContent>
        {state === "upcoming" && !betPlaced && (
          <CardFooter className="flex items-center justify-between gap-1">
            <PlacePredictionModal
              onSuccess={() => {
                refetchBetBears();
                refetchBetBulls();
              }}
              roundId={roundId}
              bearOdds={bearOdds}
              bullOdds={bullOdds}
              initialDirection="higher"
            >
              <NeumorphButton
                disabled={betPlaced}
                loading={isLoading}
                size={"medium"}
                className="flex-1 rounded-xs bg-green-500 hover:bg-green-700 transition-all ease-in-out duration-150 text-green-900 hover:text-white cursor-pointer text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!isLoading && <ChevronsUp className="w-8 h-8" />}
                <span className="text-lg font-bold">Higher</span>
              </NeumorphButton>
            </PlacePredictionModal>
            <Separator orientation="vertical" className="h-full bg-gray-500" />
            <PlacePredictionModal
              onSuccess={() => {
                refetchBetBears();
                refetchBetBulls();
              }}
              roundId={roundId}
              bearOdds={bearOdds}
              bullOdds={bullOdds}
              initialDirection="lower"
            >
              <NeumorphButton
                loading={isLoading}
                size={"medium"}
                disabled={betPlaced}
                className="flex-1 text-lg rounded-xs bg-red-500 hover:bg-red-700 transition-all ease-in-out duration-150 text-white font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!isLoading && <ChevronsDown className="w-8 h-8" />}
                <span className="text-lg font-bold">Lower</span>
              </NeumorphButton>
            </PlacePredictionModal>
          </CardFooter>
        )}
        {state === "upcoming" && betPlaced && (
          <CardFooter className="flex items-center justify-center -mt-2 p-4">
            <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-lg border border-indigo-500/20 p-4 w-full">
              <div className="flex items-center justify-center gap-3">
                <div className="animate-pulse">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <p className="text-base font-medium bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Prediction confirmed!
                </p>
              </div>
            </div>
          </CardFooter>
        )}
        {state === "ended" && betPlaced && (
          <>
            {isClaimable ? (
              <CardFooter className="flex items-center justify-center -mt-2 p-4">
                <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-lg border border-indigo-500/20 p-4 w-full">
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-pulse">
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    </div>
                    <p className="text-base font-medium bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      You have won this round
                    </p>
                  </div>
                </div>
              </CardFooter>
            ) : (
              <CardFooter className="flex items-center justify-center -mt-2 p-4">
                <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-lg border border-indigo-500/20 p-4 w-full">
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-pulse">
                      <XCircle className="w-6 h-6 text-red-400" />
                    </div>
                    <p className="text-base font-medium bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      You have not won this round
                    </p>
                  </div>
                </div>
              </CardFooter>
            )}
          </>
        )}
        {state === "live" && (
          <CardFooter className="flex items-center justify-between -mt-2">
            <div className="px-2 py-1 rounded-l-xs w-full flex-1 bg-red-700/25 text-red-500 flex items-center justify-center">
              <p className="text-lg font-bold font-mono">
                {bearOdds.toFixed(2)}x
              </p>
            </div>
            <div className="px-2 py-1 rounded-r-xs w-full flex-1 bg-green-700/25 text-green-500 flex items-center justify-center">
              <p className="text-lg font-bold font-mono">
                {bullOdds.toFixed(2)}x
              </p>
            </div>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}
