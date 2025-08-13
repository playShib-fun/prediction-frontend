"use client";

import {
  ChartArea,
  CheckCircle,
  ChevronsDown,
  ChevronsUp,
  Clock,
  Coins,
  DollarSign,
  Hash,
  PiggyBank,
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
import { useEffect, useMemo, useRef, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { ShineBorder } from "../magicui/shine-border";
import { motion } from "motion/react";
import NeumorphButton from "../ui/neumorph-button";
import {
  useStartRounds,
  useRound,
  useEndRound,
  useBetBears,
  useBetBulls,
  useClaims,
} from "@/hooks/use-prediction-data";
import {
  useFormattedCurrentPrice,
  useFormattedPriceByRoundId,
} from "@/hooks/use-bone-price";
import { StartRound } from "@/lib/graphql-client";
import PlacePredictionModal from "./place-prediction-modal";
import { useWalletConnection } from "@/hooks/use-wallet";
import BoneLoadingState from "./bone-loading-state";
import { useRoundDetails } from "@/hooks/use-prediction-data";
import FiveMinuteTimer from "./five-minute-timer";
import AnimatedOdds from "./animated-odds";
import useOddsAnimation from "@/hooks/use-odds-animation";
import { useRealTimeOdds } from "@/hooks/use-real-time-odds";

interface GameCardProps {
  roundId: number;
  state: "live" | "ended" | "upcoming";
  active?: boolean;
  stateLabelOverride?: string;
  placeholderOffset?: number;
}

export default function GameCard({
  roundId,
  state,
  active = false,
  stateLabelOverride,
  placeholderOffset: _placeholderOffset,
}: GameCardProps) {
  const [isLoading] = useState(false);
  const { data: startRound, isLoading: isStartLoading } = useStartRounds();
  const isPlaceholderLater =
    state === "upcoming" && stateLabelOverride === "Later";

  const [progress, setProgress] = useState(0);
  const [displayTime, setDisplayTime] = useState("0m 0s");
  const [timeLeftMsState, setTimeLeftMsState] = useState(0);
  const { data: betBears, refetch: refetchBetBears } = useBetBears({
    roundId: roundId.toString(),
  });
  const { data: betBulls, refetch: refetchBetBulls } = useBetBulls({
    roundId: roundId.toString(),
  });
  const { data: priceByRoundId } = useFormattedPriceByRoundId(
    roundId.toString()
  );
  const [bearOdds, setBearOdds] = useState(1);
  const [bullOdds, setBullOdds] = useState(1);

  // Real-time odds for upcoming rounds only
  const {
    odds: realTimeOdds,
    error: realTimeError,
    isAnimating: isRealTimeAnimating,
    elementRef: realTimeElementRef,
  } = useRealTimeOdds({
    roundId: roundId.toString(),
    enabled: state === "upcoming",
    onOddsChange: (newOdds) => {
      // Update local state when real-time odds change
      setBearOdds(newOdds.bearOdds);
      setBullOdds(newOdds.bullOdds);
    },
    enableVisibilityOptimization: true,
  });

  // Use real-time odds for upcoming rounds, static for others
  const currentBearOdds =
    state === "upcoming" ? realTimeOdds.bearOdds : bearOdds;
  const currentBullOdds =
    state === "upcoming" ? realTimeOdds.bullOdds : bullOdds;

  // Animation hooks for odds
  const bearOddsAnimation = useOddsAnimation(currentBearOdds, {
    threshold: 0.05,
  });
  const bullOddsAnimation = useOddsAnimation(currentBullOdds, {
    threshold: 0.05,
  });
  // current price removed from card UI

  // Use round data directly for ended rounds
  const {
    data: round,
    isLoading: isRoundLoading,
    refetch: refetchRound,
  } = useRound(roundId.toString());
  const { lockRound } = useRoundDetails(roundId.toString());
  const [isCalculatingRewards, setIsCalculatingRewards] = useState(false);
  const calculatingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Get end round data for ended rounds
  const { data: endRound } = useEndRound(roundId.toString());

  const { data: currentPrice, refetch: refetchCurrentPrice } =
    useFormattedCurrentPrice();

  useEffect(() => {
    const interval = setInterval(() => {
      refetchCurrentPrice();
    }, 15000); // 15s
    return () => clearInterval(interval);
  }, []);

  // removed periodic refetch for current price

  const totalPoolBone = useMemo(() => {
    const bear = round?.bearAmount ? parseFloat(round.bearAmount) / 1e18 : 0;
    const bull = round?.bullAmount ? parseFloat(round.bullAmount) / 1e18 : 0;
    return bear + bull;
  }, [round]);

  // Calculate price difference for ended rounds using values directly from round
  const priceDifference = useMemo(() => {
    if (round?.endPrice && round?.lockPrice) {
      const endPx = parseFloat(round.endPrice);
      const lockPx = parseFloat(round.lockPrice);
      if (!Number.isFinite(endPx) || !Number.isFinite(lockPx)) return 0;
      return (endPx - lockPx) / 1e8;
    }
    return 0;
  }, [round]);

  // Get endPrice for display
  const endPrice = useMemo(() => {
    if (round?.endPrice) {
      return parseFloat(round.endPrice) / 1e8;
    }
    return 0;
  }, [round]);

  // Get lockPrice for display
  const lockPrice = useMemo(() => {
    if (round?.lockPrice) {
      return parseFloat(round.lockPrice) / 1e8;
    }
    return 0;
  }, [round]);

  const isFinalHigherThanEntry = useMemo(() => {
    return priceDifference > 0;
  }, [priceDifference]);

  const isFinalLowerThanEntry = useMemo(() => {
    return priceDifference < 0;
  }, [priceDifference]);

  function calculateOdds() {
    // Only calculate static odds for live and ended rounds
    // Upcoming rounds use real-time odds
    if (isRoundLoading || state === "upcoming") return;

    const totalBearAmount = round?.bearAmount
      ? parseFloat(round.bearAmount) / 1e18
      : 0;
    const totalBullAmount = round?.bullAmount
      ? parseFloat(round.bullAmount) / 1e18
      : 0;
    const total = totalBearAmount + totalBullAmount;

    const bearOddsValue = totalBearAmount === 0 ? 1 : total / totalBearAmount;
    const bullOddsValue = totalBullAmount === 0 ? 1 : total / totalBullAmount;
    setBearOdds(bearOddsValue);
    setBullOdds(bullOddsValue);
  }

  useEffect(() => {
    calculateOdds();
  }, [round, isRoundLoading, state]);

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

  const { data: claimableBets } = useClaims({
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

  // Determine which side the user bet on for highlighting
  const userBetSide = useMemo<"bull" | "bear" | null>(() => {
    if (!address) return null;
    if (
      betBulls?.some(
        (bet) => bet.sender.toLowerCase() === address.toLowerCase()
      )
    ) {
      return "bull";
    }
    if (
      betBears?.some(
        (bet) => bet.sender.toLowerCase() === address.toLowerCase()
      )
    ) {
      return "bear";
    }
    return null;
  }, [address, betBears, betBulls]);

  function calculateProgress() {
    if (isStartLoading) {
      return 0;
    }

    // Base start timestamp for this card's upcoming window
    let startRoundTimestamp = Number(getCurrentRound()?.timestamp);

    // If this is a placeholder "Later" card, derive the timestamp based on previous known rounds
    if (isPlaceholderLater || !Number.isFinite(startRoundTimestamp)) {
      const previousKnown = startRound?.find(
        (r) => Number(r.epoch) === roundId - 1
      );
      // If not found, pick the largest epoch smaller than current
      const fallbackPrevious = previousKnown
        ? previousKnown
        : startRound
            ?.filter((r) => Number(r.epoch) < roundId)
            .sort((a, b) => Number(b.epoch) - Number(a.epoch))[0];
      const baselineEpoch = fallbackPrevious
        ? Number(fallbackPrevious.epoch)
        : roundId;
      const baselineTs = fallbackPrevious
        ? Number(fallbackPrevious.timestamp)
        : Date.now();
      const roundOffset = Math.max(0, roundId - baselineEpoch);
      startRoundTimestamp = baselineTs + roundOffset * 5 * 60 * 1000;
    }

    let segmentStart = startRoundTimestamp;
    let endTime = startRoundTimestamp + 5 * 60 * 1000; // default upcoming 5m

    if (state === "live") {
      const lockTimestamp = lockRound?.timestamp
        ? Number(lockRound.timestamp)
        : startRoundTimestamp + 5 * 60 * 1000; // fallback if lock not present
      segmentStart = lockTimestamp;
      endTime = lockTimestamp + 5 * 60 * 1000; // live is 5m
    }

    const now = Date.now();

    const totalDuration = endTime - segmentStart;
    const elapsed = Math.max(0, Math.min(now - segmentStart, totalDuration));
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
    setTimeLeftMsState(timeLeftMs);

    // Show calculating animation for 15s after live duration ends
    if (state === "live" && timeLeftMs <= 0 && !isCalculatingRewards) {
      setIsCalculatingRewards(true);
      if (calculatingTimerRef.current) {
        clearTimeout(calculatingTimerRef.current);
      }
      calculatingTimerRef.current = setTimeout(() => {
        setIsCalculatingRewards(false);
        calculatingTimerRef.current = null;
      }, 15000);
    }
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

  // Periodically refresh round data for upcoming card to update prize pool and odds
  useEffect(() => {
    if (state !== "upcoming") {
      return;
    }
    const interval = setInterval(() => {
      refetchRound();
    }, 15000);
    return () => clearInterval(interval);
  }, [state, refetchRound]);

  useEffect(() => {
    return () => {
      if (calculatingTimerRef.current) {
        clearTimeout(calculatingTimerRef.current);
      }
    };
  }, []);

  return (
    <motion.div
      ref={realTimeElementRef as React.RefObject<HTMLDivElement>}
      className="w-[90%] md:w-full mx-auto"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="dark:bg-black/50 backdrop-blur-lg relative overflow-hidden">
        {active && (
          <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />
        )}
        {state === "ended" && round && (
          <ShineBorder
            shineColor={
              isFinalHigherThanEntry
                ? ["#22c55e", "#16a34a", "#22c55e"]
                : ["#ef4444", "#b91c1c", "#ef4444"]
            }
            borderWidth={5}
            duration={10}
            className="opacity-100"
          />
        )}
        <CardHeader>
          <CardTitle className="flex items-center gap-1 justify-between">
            <div className="flex items-center gap-2 font-mono">
              <Hash className="w-6 h-6 text-gray-500" />
              {roundId}
            </div>
            <div className="flex items-center gap-2">
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
                  {stateLabelOverride === "Later"
                    ? "Later"
                    : stateLabelOverride || "Next"}
                </Label>
              )}

              {/* State badges only here now */}
            </div>
          </CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        {/** Bet badge UI commented out for now */}
        {/**
        <div className="absolute top-2 right-2 z-20">
          {userBetSide ? (
            <div
              className={`flex items-center gap-1 px-3 py-1 rounded-full border shadow-sm backdrop-blur-sm ${
                userBetSide === "bull"
                  ? "bg-green-600/90 text-white border-green-400/60"
                  : "bg-red-600/90 text-white border-red-400/60"
              }`}
            >
              {userBetSide === "bull" ? (
                <ArrowUp className="w-4 h-4" />
              ) : (
                <ArrowDown className="w-4 h-4" />
              )}
              <span className="text-xs font-bold uppercase tracking-wide">
                {userBetSide === "bull" ? "Up" : "Down"}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-3 py-1 rounded-full border shadow-sm backdrop-blur-sm bg-gray-700/80 text-white border-gray-400/60">
              <ArrowUp className="w-4 h-4 opacity-80" />
              <span className="text-xs font-semibold uppercase tracking-wide opacity-90">
                Preview
              </span>
            </div>
          )}
        </div>
        */}
        {state === "live" && isCalculatingRewards && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <BoneLoadingState
              text="Calculating rewards..."
              size="lg"
              animation="bone"
              textClassName="tracking-wide drop-shadow-md"
            />
          </div>
        )}
        {state === "upcoming" && realTimeError && (
          <div className="absolute top-2 left-2 z-10">
            <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-md px-2 py-1">
              <p className="text-xs text-yellow-400">
                Real-time odds unavailable
              </p>
            </div>
          </div>
        )}
        <CardContent className="text-gray-500 flex flex-col items-start justify-between py-4 px-4 dark:bg-black/50 bg-white/50 rounded w-11/12 mx-auto gap-4">
          {state === "ended" && (
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col justify-between group">
                <p
                  className={`text-2xl font-black ${
                    state === "ended" && round
                      ? "text-blue-500"
                      : "dark:text-secondary text-gray-500"
                  } flex items-center gap-1`}
                >
                  <DollarSign className="w-6 h-6" />
                  {endPrice.toFixed(4)}
                </p>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl dark:text-secondary text-gray-500 flex items-center gap-1 font-normal ml-1">
                      <ChartArea className="w-4 h-4" />
                      Closed Price
                    </h2>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end">
                <div className="flex items-center gap-2">
                  <p
                    className={`text-sm break-keep w-auto px-2 py-1 rounded-xs flex gap-1 items-center font-mono font-bold ${
                      priceDifference > 0
                        ? "bg-green-700/25 text-green-500"
                        : "bg-red-700/25 text-red-500"
                    }`}
                  >
                    <DollarSign className="w-4 h-4" />
                    {priceDifference.toFixed(4)}
                    {priceDifference > 0 ? (
                      <ChevronsUp className="w-4 h-4" />
                    ) : (
                      <ChevronsDown className="w-4 h-4" />
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
          {state === "live" && (
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col justify-between group">
                <p
                  className={`text-2xl font-black ${
                    state === "live" && round
                      ? "text-blue-500"
                      : "dark:text-secondary text-gray-500"
                  } flex items-center gap-1`}
                >
                  <DollarSign className="w-6 h-6" />
                  {currentPrice ? currentPrice.toFixed(4) : "0.0000"}
                </p>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl dark:text-secondary text-gray-500 flex items-center gap-1 font-normal ml-1">
                      <ChartArea className="w-4 h-4" />
                      Current Price
                    </h2>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end">
                {currentPrice && (
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-sm break-keep w-auto px-2 py-1 rounded-xs flex gap-1 items-center font-mono font-bold ${
                        currentPrice > lockPrice
                          ? "bg-green-700/25 text-green-500"
                          : "bg-red-700/25 text-red-500"
                      }`}
                    >
                      <DollarSign className="w-4 h-4" />
                      {(currentPrice - lockPrice).toFixed(4)}
                      {currentPrice > lockPrice ? (
                        <ChevronsUp className="w-4 h-4" />
                      ) : (
                        <ChevronsDown className="w-4 h-4" />
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {
            <div className="flex flex-col justify-between group">
              <p
                className={`text-2xl font-black ${
                  isPlaceholderLater
                    ? "dark:text-secondary text-gray-500"
                    : totalPoolBone > 0
                    ? "text-blue-500"
                    : "dark:text-secondary text-gray-500"
                } flex items-center gap-1`}
              >
                <Coins className="w-6 h-6" />
                {isPlaceholderLater
                  ? "- BONE"
                  : `${totalPoolBone.toFixed(2)} BONE`}
              </p>
              <h2 className="text-xl dark:text-secondary text-gray-500 flex items-center gap-1 font-normal ml-1">
                <PiggyBank className="w-4 h-4" />
                Prize Pool
              </h2>
            </div>
          }

          {state === "upcoming" && (
            <div className="flex items-center gap-2 w-full">
              <Progress value={progress} className="w-full bg-primary/20" />
              {!isPlaceholderLater && (
                <p className="text-xs text-secondary break-keep w-auto">
                  {displayTime.split(" ")[0]}&nbsp;{displayTime.split(" ")[1]}
                </p>
              )}
            </div>
          )}
          {state === "live" && (
            <div className="flex items-center gap-2 w-full">
              <Progress value={progress} className="w-full bg-primary/20" />
            </div>
          )}
        </CardContent>
        {state === "upcoming" && !betPlaced && !isPlaceholderLater && (
          <CardFooter className="flex items-center justify-between gap-1">
            <PlacePredictionModal
              onSuccess={() => {
                refetchBetBears();
                refetchBetBulls();
                refetchRound();
              }}
              roundId={roundId}
              bearOdds={currentBearOdds}
              bullOdds={currentBullOdds}
              initialDirection="higher"
            >
              <NeumorphButton
                disabled={betPlaced || timeLeftMsState <= 10_000}
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
                refetchRound();
              }}
              roundId={roundId}
              bearOdds={currentBearOdds}
              bullOdds={currentBullOdds}
              initialDirection="lower"
            >
              <NeumorphButton
                loading={isLoading}
                size={"medium"}
                disabled={betPlaced || timeLeftMsState <= 10_000}
                className="flex-1 text-lg rounded-xs bg-red-500 hover:bg-red-700 transition-all ease-in-out duration-150 text-white font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!isLoading && <ChevronsDown className="w-8 h-8" />}
                <span className="text-lg font-bold">Lower</span>
              </NeumorphButton>
            </PlacePredictionModal>
          </CardFooter>
        )}
        {state === "upcoming" && !betPlaced && isPlaceholderLater && (
          <CardFooter className="flex items-center justify-between gap-1">
            <div className="relative flex-1">
              <NeumorphButton
                disabled
                size={"medium"}
                className="w-full text-lg rounded-xs bg-green-500 text-green-900 cursor-default disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <ChevronsUp className="w-8 h-8" />
                <span className="text-lg font-bold">Higher</span>
              </NeumorphButton>
            </div>
            <Separator orientation="vertical" className="h-full bg-gray-500" />
            <div className="relative flex-1">
              <NeumorphButton
                disabled
                size={"medium"}
                className="w-full text-lg rounded-xs bg-red-500 text-white cursor-default disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <ChevronsDown className="w-8 h-8" />
                <span className="text-lg font-bold">Lower</span>
              </NeumorphButton>
            </div>
          </CardFooter>
        )}
        {state === "upcoming" && !betPlaced && (
          <CardFooter className="flex items-center justify-between -mt-2">
            {/* Higher (Bull) odds on the left to match button order */}
            <AnimatedOdds
              value={currentBullOdds}
              isAnimating={
                bullOddsAnimation.isAnimating ||
                (state === "upcoming" && isRealTimeAnimating)
              }
              direction={bullOddsAnimation.direction}
              position="bull"
            />
            {/* Lower (Bear) odds on the right */}
            <AnimatedOdds
              value={currentBearOdds}
              isAnimating={
                bearOddsAnimation.isAnimating ||
                (state === "upcoming" && isRealTimeAnimating)
              }
              direction={bearOddsAnimation.direction}
              position="bear"
            />
          </CardFooter>
        )}
        {state === "upcoming" && betPlaced && (
          <CardFooter className="flex items-center justify-between gap-1">
            <div className="relative flex-1">
              {userBetSide === "bull" && (
                <span className="absolute -top-3 left-2 text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full bg-green-500 text-green-900 shadow-[0_0_12px_rgba(34,197,94,0.7)]">
                  Your bet
                </span>
              )}
              <NeumorphButton
                disabled
                size={"medium"}
                className={`w-full text-lg rounded-xs bg-green-500 hover:bg-green-700 transition-all ease-in-out duration-150 text-green-900 hover:text-white cursor-default disabled:cursor-not-allowed ${
                  userBetSide === "bull"
                    ? "disabled:opacity-100 ring-4 ring-green-400 shadow-[0_0_24px_rgba(34,197,94,0.65)] scale-[1.02] animate-pulse"
                    : ""
                }`}
              >
                <ChevronsUp className="w-8 h-8" />
                <span className="text-lg font-bold">Higher</span>
              </NeumorphButton>
            </div>
            <Separator orientation="vertical" className="h-full bg-gray-500" />
            <div className="relative flex-1">
              {userBetSide === "bear" && (
                <span className="absolute -top-3 left-2 text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full bg-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.7)]">
                  Your bet
                </span>
              )}
              <NeumorphButton
                disabled
                size={"medium"}
                className={`w-full text-lg rounded-xs bg-red-500 hover:bg-red-700 transition-all ease-in-out duration-150 text-white font-bold cursor-default disabled:cursor-not-allowed ${
                  userBetSide === "bear"
                    ? "disabled:opacity-100 ring-4 ring-red-400 shadow-[0_0_24px_rgba(239,68,68,0.65)] scale-[1.02] animate-pulse"
                    : ""
                }`}
              >
                <ChevronsDown className="w-8 h-8" />
                <span className="text-lg font-bold">Lower</span>
              </NeumorphButton>
            </div>
          </CardFooter>
        )}
        {state === "upcoming" && betPlaced && (
          <CardFooter className="flex items-center justify-between -mt-2">
            {/* Higher (Bull) odds on the left to match button order */}
            <div className="px-2 py-1 rounded-l-xs w-full flex-1 bg-green-700/25 text-green-500 flex items-center justify-center">
              <p className="text-lg font-bold font-mono">
                {bullOdds.toFixed(2)}x
              </p>
            </div>
            {/* Lower (Bear) odds on the right */}
            <div className="px-2 py-1 rounded-r-xs w-full flex-1 bg-red-700/25 text-red-500 flex items-center justify-center">
              <p className="text-lg font-bold font-mono">
                {bearOdds.toFixed(2)}x
              </p>
            </div>
          </CardFooter>
        )}
        {state === "ended" && (
          <>
            {/* Non-interactive side labels styled like upcoming buttons */}
            <CardFooter className="flex items-center justify-between gap-1 -mb-1">
              {/* Higher on the left, Lower on the right */}
              <NeumorphButton
                disabled
                size={"medium"}
                className={`flex-1 rounded-xs cursor-default text-lg font-bold disabled:cursor-not-allowed disabled:opacity-100 ${
                  isFinalHigherThanEntry
                    ? "bg-green-500 text-green-900 ring-2 ring-green-300 shadow-[0_0_20px_rgba(34,197,94,0.35)]"
                    : "bg-muted/40 text-muted-foreground"
                }`}
              >
                <ChevronsUp className="w-8 h-8" />
                <span className="text-lg font-bold">Higher</span>
              </NeumorphButton>
              <Separator
                orientation="vertical"
                className="h-full bg-gray-500/60"
              />
              <NeumorphButton
                disabled
                size={"medium"}
                className={`flex-1 rounded-xs cursor-default text-lg font-bold disabled:cursor-not-allowed disabled:opacity-100 ${
                  isFinalLowerThanEntry
                    ? "bg-red-500 text-red-700 ring-2 ring-red-300 shadow-[0_0_20px_rgba(239,68,68,0.35)]"
                    : "bg-muted/40 text-muted-foreground"
                }`}
              >
                <ChevronsDown className="w-8 h-8" />
                <span className="text-lg font-bold">Lower</span>
              </NeumorphButton>
            </CardFooter>
            {/* Show final odds like live card */}
            <CardFooter className="flex items-center justify-between -mt-2">
              <div className="px-2 py-1 rounded-l-xs w-full flex-1 bg-green-700/25 text-green-500 flex items-center justify-center">
                <p className="text-lg font-bold font-mono">
                  {bullOdds.toFixed(2)}x
                </p>
              </div>
              <div className="px-2 py-1 rounded-r-xs w-full flex-1 bg-red-700/25 text-red-500 flex items-center justify-center">
                <p className="text-lg font-bold font-mono">
                  {bearOdds.toFixed(2)}x
                </p>
              </div>
            </CardFooter>

            {betPlaced &&
              (isClaimable ? (
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
              ))}
          </>
        )}
        {state === "live" && (
          <>
            {/* Non-interactive side labels styled like upcoming buttons */}
            <CardFooter className="flex items-center justify-between gap-1 -mb-1">
              {/* Higher on the left */}
              <NeumorphButton
                disabled
                size={"medium"}
                className="flex-1 rounded-xs bg-green-500 hover:bg-green-700 transition-all ease-in-out duration-150 text-green-900 hover:text-white cursor-default text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronsUp className="w-8 h-8" />
                <span className="text-lg font-bold">Higher</span>
              </NeumorphButton>
              <Separator
                orientation="vertical"
                className="h-full bg-gray-500/60"
              />
              {/* Lower on the right */}
              <NeumorphButton
                disabled
                size={"medium"}
                className="flex-1 text-lg rounded-xs bg-red-500 hover:bg-red-700 transition-all ease-in-out duration-150 text-white font-bold cursor-default disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronsDown className="w-8 h-8" />
                <span className="text-lg font-bold">Lower</span>
              </NeumorphButton>
            </CardFooter>
            <CardFooter className="flex items-center justify-between -mt-2">
              <div className="px-2 py-1 rounded-l-xs w-full flex-1 bg-green-700/25 text-green-500 flex items-center justify-center">
                <p className="text-lg font-bold font-mono">
                  {bullOdds.toFixed(2)}x
                </p>
              </div>
              <div className="px-2 py-1 rounded-r-xs w-full flex-1 bg-red-700/25 text-red-500 flex items-center justify-center">
                <p className="text-lg font-bold font-mono">
                  {bearOdds.toFixed(2)}x
                </p>
              </div>
            </CardFooter>
          </>
        )}
      </Card>
    </motion.div>
  );
}
