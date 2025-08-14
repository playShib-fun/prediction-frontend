"use client";

import {
  ChartArea,
  ChevronsDown,
  ChevronsUp,
  Clock,
  Coins,
  DollarSign,
  Hash,
  PiggyBank,
  TowerControl,
  Trophy,
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
import { useEffect, useMemo, useRef, useState, memo } from "react";
import { Separator } from "@/components/ui/separator";
import { ShineBorder } from "../magicui/shine-border";
import { motion } from "motion/react";
import NeumorphButton from "../ui/neumorph-button";
import {
  useRound,
  useBetBears,
  useBetBulls,
} from "@/hooks/use-prediction-data";
import {
  useFormattedCurrentPrice,
  useFormattedLatestPrice,
} from "@/hooks/use-bone-price";
import PlacePredictionModal from "./place-prediction-modal";
import { useWalletConnection } from "@/hooks/use-wallet";
import BoneLoadingState from "./bone-loading-state";
// import FiveMinuteTimer from "./five-minute-timer";
import AnimatedOdds from "./animated-odds";
import useOddsAnimation from "@/hooks/use-odds-animation";
import { useRealTimeOdds } from "@/hooks/use-real-time-odds";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { predictionConfig } from "@/lib/contracts/prediction";
import { toast } from "sonner";
import { useRoundTimerStore, useTrophyAnimationStore } from "@/stores";

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
  const isPlaceholderLater =
    state === "upcoming" && stateLabelOverride === "Later";

  const [progress, setProgress] = useState(0);
  const { data: betBears, refetch: refetchBetBears } = useBetBears({
    roundId: roundId.toString(),
  });
  const { data: betBulls, refetch: refetchBetBulls } = useBetBulls({
    roundId: roundId.toString(),
  });
  // const { data: priceByRoundId } = useFormattedPriceByRoundId(
  //   roundId.toString()
  // );
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
  // For placeholder "Later" cards, use previous round's startTimeStamp as baseline
  const { data: prevRound } = useRound((roundId - 1).toString());
  const [isCalculatingRewards, setIsCalculatingRewards] = useState(false);
  const calculatingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [oracleWindowStartMs, setOracleWindowStartMs] = useState<number | null>(
    null
  );

  // Get end round data for ended rounds
  // const { data: endRound } = useEndRound(roundId.toString());

  const { data: currentPrice, refetch: refetchCurrentPrice } =
    useFormattedCurrentPrice();

  useEffect(() => {
    const interval = setInterval(() => {
      refetchCurrentPrice();
    }, 15000); // 15s
    return () => clearInterval(interval);
  }, []);

  // removed periodic refetch for current price

  // Latest oracle update timestamp (ms)
  const { data: latestPriceData } = useFormattedLatestPrice();
  const updateTimestampMs = useMemo(() => {
    return latestPriceData?.timestamp?.getTime();
  }, [latestPriceData]);

  // Freeze the first seen oracle update timestamp for the live round to avoid sliding window
  useEffect(() => {
    if (state === "live" && updateTimestampMs && !oracleWindowStartMs) {
      setOracleWindowStartMs(updateTimestampMs);
    }
  }, [state, updateTimestampMs, oracleWindowStartMs]);

  // Reset frozen window when leaving live or changing rounds
  useEffect(() => {
    if (state !== "live") {
      setOracleWindowStartMs(null);
    }
  }, [state, roundId]);

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

  // connected wallet address
  const { address } = useWalletConnection();

  // On-chain claimable status for this round and user
  const {
    data: isClaimable,
    refetch: refetchIsClaimable,
    isLoading: isClaimableLoading,
  } = useReadContract({
    ...predictionConfig,
    functionName: "claimable",
    args: [BigInt(roundId), address ?? ""],
  });

  // On-chain ledger to detect existing bet and claimed status
  const { data: ledgerData } = useReadContract({
    ...predictionConfig,
    functionName: "ledger",
    args: [BigInt(roundId), address ?? ""],
  });

  const hasOnChainBet = useMemo(() => {
    try {
      // ledgerData[1] is amount (bigint)
      const amount = ledgerData && (ledgerData as any)[1];
      if (typeof amount === "bigint") {
        return amount > BigInt(0);
      }
      if (typeof amount === "number") {
        return amount > 0;
      }
      return false;
    } catch {
      return false;
    }
  }, [ledgerData]);

  const isAlreadyClaimed = useMemo(() => {
    try {
      // ledgerData[2] is claimed (bool)
      return Boolean(ledgerData && (ledgerData as any)[2]);
    } catch {
      return false;
    }
  }, [ledgerData]);

  useEffect(() => {
    if (state === "ended" && address) {
      refetchIsClaimable();
    }
  }, [state, address, refetchIsClaimable]);

  const betPlaced = useMemo(() => {
    if (!address) {
      return false;
    }
    const subgraphPlaced =
      betBears?.some(
        (bet) => bet.sender.toLowerCase() === address.toLowerCase()
      ) ||
      betBulls?.some(
        (bet) => bet.sender.toLowerCase() === address.toLowerCase()
      );
    return Boolean(subgraphPlaced || hasOnChainBet);
  }, [address, betBears, betBulls, hasOnChainBet]);

  // Claim rewards
  const {
    writeContract,
    data: claimHash,
    isPending: isClaimPending,
  } = useWriteContract();
  const { isLoading: isClaimConfirming, isSuccess: isClaimSuccess } =
    useWaitForTransactionReceipt({
      hash: claimHash,
    });

  const handleClaim = () => {
    if (!address) return;
    try {
      writeContract({
        ...predictionConfig,
        functionName: "claim",
        args: [[BigInt(roundId)]],
      });
    } catch (error) {
      toast.error("Failed to submit claim transaction");
    }
  };

  const { setIsActive: setIsTrophyActive } = useTrophyAnimationStore();

  useEffect(() => {
    if (isClaimSuccess) {
      setIsTrophyActive(true);
      refetchRound();
      refetchBetBears();
      refetchBetBulls();
      refetchIsClaimable();
    }
  }, [
    isClaimSuccess,
    refetchRound,
    refetchBetBears,
    refetchBetBulls,
    refetchIsClaimable,
  ]);

  // Note: userBetSide UI is currently disabled; keeping minimal logic removed to avoid unused var.

  const setRound = useRoundTimerStore((s) => s.setRound);
  const setProgressPct = useRoundTimerStore((s) => s.setProgressPct);
  const setTimeLeftMs = useRoundTimerStore((s) => s.setTimeLeftMs);
  const timeLeftMs = useRoundTimerStore((s) => s.timeLeftMs);

  function calculateProgress() {
    // Only compute for live; upcoming cards derive from global store
    if (state !== "live") return;

    const fiveMinutesMs = 5 * 60 * 1000;
    const startTimeStamp = Number(round?.updateTimeStamp);
    const now = Date.now();
    const endTime = startTimeStamp + fiveMinutesMs;

    const elapsed = Math.max(0, Math.min(now - startTimeStamp, fiveMinutesMs));
    const timeLeftMs = Math.max(0, endTime - now);

    const progress = Math.min(
      100,
      Math.max(0, (elapsed / fiveMinutesMs) * 100)
    );

    setProgress(Math.round(progress));
    // local state for live progress only

    setProgressPct(progress);
    setTimeLeftMs(timeLeftMs);
    setRound(roundId);

    if (timeLeftMs <= 0 && !isCalculatingRewards) {
      setIsCalculatingRewards(true);
      refetchRound();
    }
  }

  // Components to display upcoming progress/time using the global store
  const UpcomingProgress = memo(function UpcomingProgress() {
    const progressPct = useRoundTimerStore((s) => s.progressPct);
    return <Progress value={progressPct} className="w-full bg-primary/20" />;
  });

  const UpcomingTimeLeft = memo(function UpcomingTimeLeft() {
    const timeLeftMs = useRoundTimerStore((s) => s.timeLeftMs);
    const minutes = Math.floor(timeLeftMs / 60000);
    const seconds = Math.floor((timeLeftMs % 60000) / 1000)
      .toString()
      .padStart(2, "0");
    return (
      <p className="text-xs text-secondary break-keep w-auto">
        {minutes}m&nbsp;{seconds}s
      </p>
    );
  });

  useEffect(() => {
    const interval = setInterval(() => {
      calculateProgress();
    }, 1000);
    return () => clearInterval(interval);
  }, [
    round,
    prevRound,
    state,
    isPlaceholderLater,
    updateTimestampMs,
    oracleWindowStartMs,
  ]);

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
              {/* For upcoming, use global live store's progress/time left */}
              <UpcomingProgress />
              {!isPlaceholderLater && <UpcomingTimeLeft />}
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
                disabled={betPlaced || timeLeftMs <= 10_000}
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
                disabled={betPlaced || timeLeftMs <= 10_000}
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
              {/* {userBetSide === "bull" && (
                <span className="absolute -top-3 left-2 text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full bg-green-500 text-green-900 shadow-[0_0_12px_rgba(34,197,94,0.7)]">
                  Your bet
                </span>
              )} */}
              <NeumorphButton
                disabled
                size={"medium"}
                className={`w-full text-lg rounded-xs bg-green-500 hover:bg-green-700 transition-all ease-in-out duration-150 text-green-900 hover:text-white cursor-default disabled:cursor-not-allowed`}
              >
                <ChevronsUp className="w-8 h-8" />
                <span className="text-lg font-bold">Higher</span>
              </NeumorphButton>
            </div>
            <Separator orientation="vertical" className="h-full bg-gray-500" />
            <div className="relative flex-1">
              {/* {userBetSide === "bear" && (
                <span className="absolute -top-3 left-2 text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full bg-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.7)]">
                  Your bet
                </span>
              )} */}
              <NeumorphButton
                disabled
                size={"medium"}
                className={`w-full text-lg rounded-xs bg-red-500 hover:bg-red-700 transition-all ease-in-out duration-150 text-white font-bold cursor-default disabled:cursor-not-allowed`}
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
              (Boolean(isClaimable) ? (
                <CardFooter className="flex items-center justify-center -mt-2 p-4">
                  <NeumorphButton
                    size="medium"
                    className="w-full max-w-xs bg-green-500 hover:bg-green-600 text-green-900 hover:text-white font-bold cursor-pointer"
                    onClick={handleClaim}
                    disabled={isClaimPending || isClaimConfirming}
                  >
                    {isClaimPending
                      ? "Preparing Claim..."
                      : isClaimConfirming
                      ? "Claiming Rewards..."
                      : "Claim Rewards"}
                  </NeumorphButton>
                </CardFooter>
              ) : isAlreadyClaimed ? (
                <></>
              ) : (
                state === "ended" && !isClaimableLoading && <></>
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
