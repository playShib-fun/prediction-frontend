import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { TextAnimate } from "../magicui/text-animate";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useNativeBalance, useWalletConnection } from "@/hooks/use-wallet";
import { predictionConfig } from "@/lib/contracts/prediction";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { toast } from "sonner";

interface PlacePredictionModalProps {
  roundId: number;
  children: React.ReactNode;
  initialDirection?: "higher" | "lower";
  bearOdds: number;
  bullOdds: number;
  onSuccess: () => void;
}

export default function PlacePredictionModal({
  roundId,
  children,
  initialDirection = "higher",
  bearOdds,
  bullOdds,
  onSuccess,
}: PlacePredictionModalProps) {
  const [direction, setDirection] = useState(initialDirection);
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const MIN_BET = 1;

  const { isConnected } = useWalletConnection();

  const { data: balance, isLoading: isBalanceLoading } = useNativeBalance();
  const {
    writeContract,
    data: hash,
    isSuccess: isWriteSuccess,
    isError: isWriteError,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmSuccess } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Get prediction contract functions
  const handleBet = async () => {
    if (!isValidAmount || !isConnected) return;
    setIsSubmitting(true);

    const value = BigInt(Math.floor(Number(amount) * 1e18));

    try {
      if (direction === "higher") {
        writeContract({
          ...predictionConfig,
          functionName: "betBull",
          args: [roundId],
          value,
        });
      } else {
        writeContract({
          ...predictionConfig,
          functionName: "betBear",
          args: [roundId],
          value,
        });
      }
    } catch (error) {
      toast.error("Failed to place bet. Please try again.");
      setIsSubmitting(false);
      setAmount("");
    }
  };

  useEffect(() => {
    if (isWriteSuccess && isConfirmSuccess) {
      setIsOpen(false);
      toast.success(
        `You've placed a prediction of ${amount} BONE on ${direction}. Good luck! 🎲`
      );
      setIsSubmitting(false);
      setAmount("");
      onSuccess();
    }
  }, [
    isWriteSuccess,
    isConfirmSuccess,
    setIsSubmitting,
    setAmount,
    setIsOpen,
    amount,
    direction,
  ]);

  // Reset state on user rejection/cancel (no tx hash, write error)
  useEffect(() => {
    if (isWriteError) {
      setIsSubmitting(false);
      setAmount("");
      // Optional toast for visibility
      toast.info("Transaction cancelled");
    }
  }, [isWriteError]);

  // When drawer closes by any means, clear values
  useEffect(() => {
    if (!isOpen) {
      setAmount("");
      setIsSubmitting(false);
      setDirection(initialDirection);
    }
  }, [isOpen, initialDirection]);

  // Calculate potential winnings based on direction and odds
  const potentialWinnings = useMemo(() => {
    if (!amount || !balance?.formatted) return 0;
    const betAmount = parseFloat(amount);
    if (betAmount <= 0) return 0;

    const odds = direction === "higher" ? bullOdds : bearOdds;
    return betAmount * odds;
  }, [amount, direction, bullOdds, bearOdds, balance?.formatted]);

  // Format balance for display
  const formattedBalance = useMemo(() => {
    if (!balance?.formatted) return "0.00";
    const [whole, decimal] = balance.formatted.split(".");
    return `${whole}.${(decimal || "00").slice(0, 2)}`;
  }, [balance?.formatted]);

  // Check if amount is valid
  const isValidAmount = useMemo(() => {
    if (!amount || !balance?.formatted) return false;
    const betAmount = parseFloat(amount);
    return betAmount >= MIN_BET && betAmount <= Number(balance.formatted);
  }, [amount, balance?.formatted]);

  // Handle amount input with proper validation
  function handleAmountInput(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;

    // Allow empty string or valid numbers
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      if (Number(value) > Number(balance?.formatted)) {
        setAmount(balance?.formatted || "0");
      } else {
        setAmount(value);
      }
    }
  }

  // Handle quick amount selection
  function handleQuickAmount(percentage: number) {
    if (!balance?.formatted) return;
    const maxAmount = Number(balance.formatted);
    const quickAmount = (maxAmount * percentage) / 100;
    setAmount(quickAmount.toFixed(2));
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-xl border border-gray-800 max-w-lg mx-auto z-[500] pb-36 md:pb-10">
        <DrawerHeader className="max-w-lg mx-auto w-full">
          <DrawerTitle>
            <div className="text-2xl text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-400" />
              <TextAnimate animation="slideLeft" by="character">
                Place Your Prediction
              </TextAnimate>
            </div>
          </DrawerTitle>

          {/* Direction Toggle */}
          <button
            onClick={() =>
              setDirection(direction === "higher" ? "lower" : "higher")
            }
            className={`w-full px-6 py-8 rounded-xl transition-all ease-in-out duration-300 flex items-center justify-center uppercase text-2xl font-bold cursor-pointer relative overflow-hidden group ${
              direction === "higher"
                ? "bg-gradient-to-r from-green-600/20 to-emerald-600/20 text-green-400 hover:from-green-500/30 hover:to-emerald-500/30 border-2 border-green-500/50 hover:border-green-400"
                : "bg-gradient-to-r from-red-600/20 to-rose-600/20 text-red-400 hover:from-red-500/30 hover:to-rose-500/30 border-2 border-red-500/50 hover:border-red-400"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            {direction === "higher" ? (
              <>
                <TrendingUp className="w-8 h-8 mr-3" />
                {direction}
              </>
            ) : (
              <>
                <TrendingDown className="w-8 h-8 mr-3" />
                {direction}
              </>
            )}
          </button>
        </DrawerHeader>

        {/* Balance and Potential Winnings */}
        <div className="flex items-center gap-6 justify-between max-w-lg text-center mx-auto w-full px-4 py-6">
          <div className="flex flex-col flex-1 bg-white/5 rounded-xl p-4 border border-white/10">
            <TextAnimate
              animation="slideLeft"
              by="character"
              className="text-sm font-medium text-gray-400 mb-1"
            >
              Your Balance
            </TextAnimate>
            {isBalanceLoading ? (
              <div className="h-6 bg-gray-700/50 rounded animate-pulse"></div>
            ) : (
              <TextAnimate
                animation="slideLeft"
                by="character"
                className="text-xl font-bold text-white"
              >
                {`${formattedBalance} BONE`}
              </TextAnimate>
            )}
          </div>

          <div className="h-16 bg-gradient-to-b from-gray-600/30 to-transparent w-px"></div>

          <div className="flex flex-col flex-1 bg-white/5 rounded-xl p-4 border border-white/10">
            <TextAnimate
              animation="slideLeft"
              by="character"
              className="text-sm font-medium text-gray-400 mb-1"
            >
              Potential Win
            </TextAnimate>
            <TextAnimate className="text-xl font-bold text-green-400">
              {potentialWinnings > 0
                ? `${potentialWinnings.toFixed(2)} BONE`
                : "0.00 BONE"}
            </TextAnimate>
          </div>
        </div>

        {/* Bet Amount Input */}
        <div className="flex flex-col gap-4 w-full max-w-lg mx-auto px-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-300">
              Bet Amount (BONE)
            </Label>
            <div className="relative">
              <Input
                type="text"
                value={amount}
                onChange={handleAmountInput}
                placeholder="0.00"
                className="w-full bg-white/5 border-gray-600/50 text-white placeholder:text-gray-500 focus:border-green-500/50 focus:ring-green-500/20"
                disabled={!isConnected || isSubmitting || isConfirming}
              />
              {amount && !isValidAmount && (
                <p className="text-xs text-red-400 mt-1">
                  {(() => {
                    const betAmount = parseFloat(amount);
                    if (betAmount > Number(balance?.formatted || 0)) {
                      return "Insufficient balance";
                    }
                    if (betAmount < MIN_BET) {
                      return `Minimum stake is ${MIN_BET} BONE`;
                    }
                    return "Invalid amount";
                  })()}
                </p>
              )}
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-300">
              Quick Select
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 75, 100].map((percentage) => (
                <button
                  key={percentage}
                  onClick={() => handleQuickAmount(percentage)}
                  disabled={
                    !isConnected ||
                    isSubmitting ||
                    isBalanceLoading ||
                    isConfirming
                  }
                  className="h-10 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all duration-200 border border-gray-600/30 hover:border-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {percentage}%
                </button>
              ))}
            </div>
          </div>
        </div>

        <DrawerFooter className="max-w-lg mx-auto w-full px-4">
          <Button
            onClick={handleBet}
            disabled={!isValidAmount || !isConnected || isSubmitting}
            className={`w-full h-12 text-lg font-bold transition-all duration-300 cursor-pointer disabled:cursor-not-allowed ${
              isValidAmount && isConnected
                ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white"
                : "bg-gray-600/50 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isSubmitting || isConfirming ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : (
              "Play"
            )}
          </Button>

          {!isConnected && (
            <button className="text-center text-sm text-red-400 mt-2">
              Please connect your wallet to place a bet
            </button>
          )}
        </DrawerFooter>
        <DrawerClose
          onClick={() => {
            setAmount("");
            setIsSubmitting(false);
            setDirection(initialDirection);
          }}
        />
      </DrawerContent>
    </Drawer>
  );
}
