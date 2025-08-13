"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronsDown, ChevronsUp, DollarSign, Trophy } from "lucide-react";
import NeumorphButton from "@/components/ui/neumorph-button";
import BoneLoadingState from "@/components/shibplay/bone-loading-state";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { predictionConfig } from "@/lib/contracts/prediction";
import { useWalletConnection } from "@/hooks/use-wallet";

interface HistoryCardProps {
  bet: {
    roundId: string;
    type: "bull" | "bear";
    amount: string;
    timestamp: string;
    transactionHash?: string;
  };
  roundStatus: "calculating" | "running" | "upcoming" | "ended";
  index: number;
  isClaimed?: boolean; // Whether the user has already claimed rewards for this round
  activeFilter?: "all" | "winners" | "losers" | "calculating" | "running"; // Current filter state
  profitLoss?: string; // Optional profit/loss display in BONE
  searchTerm?: string; // Optional search term to highlight
}

export default function HistoryCard({
  bet,
  roundStatus,
  index,
  isClaimed = false,
  activeFilter = "all",
  // profitLoss,
  searchTerm,
}: HistoryCardProps) {
  const { address } = useWalletConnection();

  const { data: isClaimable, isLoading: isClaimableLoading } = useReadContract({
    ...predictionConfig,
    functionName: "claimable",
    args: [BigInt(bet.roundId), address ?? ""],
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const claimReward = () => {
    writeContract({
      ...predictionConfig,
      functionName: "claim",
      args: [[BigInt(bet.roundId)]],
    });
  };

  // Determine if this card should be shown based on the active filter
  const shouldShowCard = () => {
    if (activeFilter === "all") return true;

    if (activeFilter === "winners" || activeFilter === "losers") {
      if (roundStatus !== "ended") return false;
      return activeFilter === "winners"
        ? Boolean(isClaimable) || isClaimed
        : !Boolean(isClaimable) && !isClaimed;
    }

    if (activeFilter === "calculating") return roundStatus === "calculating";
    if (activeFilter === "running") return roundStatus === "running";

    return false;
  };

  // If this card doesn't match the current filter, don't render it
  if (!shouldShowCard()) {
    return null;
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.1,
        duration: 0.3,
        ease: "easeOut" as const,
      },
    },
  };

  // Handle loading state for claimable check
  if (isClaimableLoading && roundStatus === "ended") {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        key={`${bet.roundId}-${bet.type}-${roundStatus}-loading`}
      >
        <Card className="overflow-hidden bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border-gray-800">
          <CardHeader
            className={`bg-gradient-to-r from-gray-900/50 to-black/50 border-b transition-all duration-500 ${
              (isSuccess || isClaimed) && Boolean(isClaimable)
                ? "border-green-500/30 bg-gradient-to-r from-green-900/20 to-emerald-900/20"
                : "border-gray-800"
            }`}
          >
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Trophy
                    className={`w-5 h-5 transition-all duration-500 ${
                      (isSuccess || isClaimed) && Boolean(isClaimable)
                        ? "text-green-400 drop-shadow-lg"
                        : "text-yellow-500"
                    }`}
                  />
                  {(isSuccess || isClaimed) && Boolean(isClaimable) && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  )}
                </div>
                <span className="text-gray-200">Round #{bet.roundId}</span>
                {(isSuccess || isClaimed) && Boolean(isClaimable) && (
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">
                    Claimed
                  </span>
                )}
              </div>
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-full transition-all duration-500 ${
                  bet.type === "bull"
                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}
              >
                {bet.type === "bull" ? (
                  <ChevronsUp className="w-4 h-4" />
                ) : (
                  <ChevronsDown className="w-4 h-4" />
                )}
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-mono">
                    {Number(bet.amount).toFixed(2)}
                  </span>
                  <span className="ml-1 font-medium">BONE</span>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <BoneLoadingState text="Checking claimable status..." size="sm" />
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const renderCardContent = () => {
    switch (roundStatus) {
      case "calculating":
        return (
          <CardContent className="p-0">
            <BoneLoadingState
              text="Calculating Results..."
              size="sm"
              animation="shib-stare"
            />
          </CardContent>
        );

      case "running":
        return (
          <CardContent className="p-0">
            <BoneLoadingState text="Round Underway..." size="sm" />
          </CardContent>
        );

      case "upcoming":
        return (
          <CardContent className="p-0">
            <BoneLoadingState text="Round Starting Soon..." size="sm" />
          </CardContent>
        );

      case "ended":
        return (
          <CardFooter className="p-4">
            <div className="w-full bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl border border-gray-700/50 p-4">
              <div className="flex flex-col gap-4">
                {!isClaimed && (
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <BoneLoadingState
                        text=""
                        size="sm"
                        animation={
                          Boolean(isClaimable) ? "shib-happy" : "shib-sad"
                        }
                      />
                    </div>
                    <div>
                      <p className="text-base font-medium text-gray-200">
                        {Boolean(isClaimable)
                          ? isClaimed
                            ? "Winner! (Claimed)"
                            : "Winner!"
                          : "Better luck next time"}
                      </p>
                      <p className="text-sm text-gray-400">
                        {Boolean(isClaimable)
                          ? isClaimed
                            ? "Rewards already claimed"
                            : "Rewards available to claim"
                          : "No rewards for this round"}
                      </p>
                    </div>
                  </div>
                )}

                {Boolean(isClaimable) && !isClaimed && !isSuccess && (
                  <div className="flex justify-center">
                    <NeumorphButton
                      size="large"
                      className="w-full max-w-xs bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/20 transform hover:scale-105 transition-all duration-200"
                      onClick={claimReward}
                      disabled={isPending || isConfirming}
                    >
                      {isPending
                        ? "Preparing Claim..."
                        : isConfirming
                        ? "Claiming Rewards..."
                        : "Claim Rewards"}
                    </NeumorphButton>
                  </div>
                )}

                {isClaimed && (
                  <div className="flex flex-col items-center gap-3">
                    {/* Success Animation Container */}
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 animate-pulse">
                        <svg
                          className="w-8 h-8 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      {/* Animated rings */}
                      <div className="absolute inset-0 w-16 h-16 border-2 border-green-400/30 rounded-full animate-ping"></div>
                      <div
                        className="absolute inset-0 w-16 h-16 border-2 border-green-400/20 rounded-full animate-ping"
                        style={{ animationDelay: "0.5s" }}
                      ></div>
                    </div>

                    {/* Success Text */}
                    <div className="text-center space-y-1">
                      <h3 className="text-lg font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                        {isClaimed
                          ? "Rewards Already Claimed! 🎉"
                          : "Rewards Claimed! 🎉"}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Your rewards have been sent to your wallet
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardFooter>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      className="w-[90%] md:w-full mx-auto"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      key={`${bet.roundId}-${bet.type}-${roundStatus}`}
    >
      <Card className="overflow-hidden bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border-gray-800 hover:border-gray-700 transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-gray-900/50 to-black/50 border-b border-gray-800">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="text-gray-200">
                Round #{highlightText(bet.roundId, searchTerm)}
              </span>
            </div>
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                bet.type === "bull"
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}
            >
              {bet.type === "bull" ? (
                <ChevronsUp className="w-4 h-4" />
              ) : (
                <ChevronsDown className="w-4 h-4" />
              )}
              <div className="flex items-center">
                <span className="font-mono">
                  {(Number(bet.amount) * 1e18).toFixed(3)}
                </span>
                <span className="ml-1 font-medium">BONE</span>
              </div>
            </div>
          </CardTitle>
        </CardHeader>

        {renderCardContent()}

        {/* {roundStatus === "ended" && profitLoss !== undefined && (
          <CardFooter className="px-4 pb-4 pt-0">
            <div
              className={`text-sm font-medium ${
                parseFloat(profitLoss) >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              P/L {parseFloat(profitLoss) >= 0 ? "+" : ""}
              {Number(profitLoss).toFixed(2)} BONE
            </div>
          </CardFooter>
        )} */}

        {/* Show tx hash with search highlighting when available */}
        {/* {bet.transactionHash && (
          <CardFooter className="px-4 pt-2">
            <div className="text-xs text-gray-400 truncate">
              tx: {highlightText(bet.transactionHash, searchTerm)}
            </div>
          </CardFooter>
        )} */}
      </Card>
    </motion.div>
  );
}

function highlightText(text: string, term?: string) {
  if (!term) return text;
  const idx = text.toLowerCase().indexOf(term.toLowerCase());
  if (idx === -1) return text;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + term.length);
  const after = text.slice(idx + term.length);
  return (
    <>
      {before}
      <mark className="bg-yellow-500/20 text-yellow-300 px-0.5 rounded-sm">
        {match}
      </mark>
      {after}
    </>
  );
}
