"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  Clock,
  TrendingUp,
  TrendingDown,
  User,
  Settings,
  RefreshCw,
  Crown,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import {
  useCurrentPrice,
  useCurrentRoundId,
  useLatestPrice,
  useLastUpdateTime,
  useMinUpdateInterval,
  useOwner,
  useBonePriceState,
  useFormattedCurrentPrice,
  useFormattedLatestPrice,
  useFormattedLastUpdateTime,
  useUpdatePrice,
  useSetMinUpdateInterval,
  useTransferOwnership,
  useRenounceOwnership,
  useCanUpdatePrice,
  usePriceHistory,
} from "@/hooks/use-bone-price";
import { useAccount } from "wagmi";
import { formatBonePrice } from "@/lib/contracts/bone-price";

export default function BonePriceDashboard() {
  const { address } = useAccount();
  const [newPrice, setNewPrice] = useState("");
  const [newInterval, setNewInterval] = useState("");
  const [newOwner, setNewOwner] = useState("");

  // Read hooks
  const { data: currentPrice, isLoading: isPriceLoading } =
    useFormattedCurrentPrice();
  const { data: currentRoundId, isLoading: isRoundLoading } =
    useCurrentRoundId();
  const { data: latestPriceData, isLoading: isLatestLoading } =
    useFormattedLatestPrice();
  const { data: lastUpdateTime, isLoading: isTimeLoading } =
    useFormattedLastUpdateTime();
  const { data: minUpdateInterval, isLoading: isIntervalLoading } =
    useMinUpdateInterval();
  const { data: owner, isLoading: isOwnerLoading } = useOwner();
  const { data: state, isLoading: isStateLoading } = useBonePriceState();
  const { canUpdate, timeUntilNextUpdate } = useCanUpdatePrice();
  const { data: priceHistory } = usePriceHistory(5);

  // Write hooks
  const {
    updatePrice,
    isPending: isUpdating,
    isSuccess: isUpdateSuccess,
  } = useUpdatePrice();
  const { setMinUpdateInterval, isPending: isSettingInterval } =
    useSetMinUpdateInterval();
  const { transferOwnership, isPending: isTransferring } =
    useTransferOwnership();
  const { renounceOwnership, isPending: isRenouncing } = useRenounceOwnership();

  const isOwner =
    address && owner && address.toLowerCase() === owner.toLowerCase();

  const handleUpdatePrice = () => {
    if (newPrice && !isNaN(Number(newPrice))) {
      const priceInWei = BigInt(Math.floor(Number(newPrice) * 1e8)); // Convert to 8 decimals
      updatePrice(priceInWei);
      setNewPrice("");
    }
  };

  const handleSetInterval = () => {
    if (newInterval && !isNaN(Number(newInterval))) {
      setMinUpdateInterval(BigInt(newInterval));
      setNewInterval("");
    }
  };

  const handleTransferOwnership = () => {
    if (newOwner) {
      transferOwnership(newOwner);
      setNewOwner("");
    }
  };

  const handleRenounceOwnership = () => {
    if (
      confirm(
        "Are you sure you want to renounce ownership? This action cannot be undone."
      )
    ) {
      renounceOwnership();
    }
  };

  if (isStateLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading bone price data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bone Price Oracle</h1>
          <p className="text-muted-foreground">
            Real-time price data and management
          </p>
        </div>
        <Badge variant={canUpdate ? "default" : "secondary"}>
          {canUpdate ? "Can Update" : "Update Cooldown"}
        </Badge>
      </div>

      {/* Current Price Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Current Price
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {isPriceLoading ? (
              <RefreshCw className="w-8 h-8 animate-spin" />
            ) : (
              `$${currentPrice?.toFixed(4) || "0.0000"}`
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Round #{currentRoundId?.toString() || "Loading..."}
          </p>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Last Update</span>
            </div>
            <div className="text-lg font-semibold mt-1">
              {isTimeLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                lastUpdateTime?.toLocaleTimeString() || "Never"
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Min Interval
              </span>
            </div>
            <div className="text-lg font-semibold mt-1">
              {isIntervalLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                `${minUpdateInterval?.toString() || 0}s`
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Owner</span>
            </div>
            <div className="text-sm font-mono mt-1 truncate">
              {isOwnerLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : owner ? (
                `${owner.slice(0, 6)}...${owner.slice(-4)}`
              ) : (
                "None"
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Next Update</span>
            </div>
            <div className="text-lg font-semibold mt-1">
              {timeUntilNextUpdate > 0 ? (
                `${Math.ceil(timeUntilNextUpdate)}s`
              ) : (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Latest Price Data */}
      {latestPriceData && (
        <Card>
          <CardHeader>
            <CardTitle>Latest Price Data</CardTitle>
            <CardDescription>
              Detailed information about the latest price update
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Round ID</Label>
                <div className="text-lg font-semibold">
                  {latestPriceData.roundId}
                </div>
              </div>
              <div>
                <Label>Price</Label>
                <div className="text-lg font-semibold">
                  ${latestPriceData.price.toFixed(4)}
                </div>
              </div>
              <div>
                <Label>Timestamp</Label>
                <div className="text-lg font-semibold">
                  {latestPriceData.timestamp.toLocaleString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Owner Controls */}
      {isOwner && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5" />
              Owner Controls
            </CardTitle>
            <CardDescription>
              Manage the bone price oracle (owner only)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Update Price */}
            <div className="space-y-2">
              <Label htmlFor="newPrice">Update Price</Label>
              <div className="flex gap-2">
                <Input
                  id="newPrice"
                  type="number"
                  step="0.0001"
                  placeholder="Enter new price (e.g., 1.2345)"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  disabled={!canUpdate || isUpdating}
                />
                <Button
                  onClick={handleUpdatePrice}
                  disabled={!canUpdate || isUpdating || !newPrice}
                >
                  {isUpdating ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    "Update"
                  )}
                </Button>
              </div>
              {!canUpdate && (
                <p className="text-sm text-orange-600">
                  ⏰ Wait {Math.ceil(timeUntilNextUpdate)}s before next update
                </p>
              )}
            </div>

            <Separator />

            {/* Set Min Update Interval */}
            <div className="space-y-2">
              <Label htmlFor="newInterval">
                Set Min Update Interval (seconds)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="newInterval"
                  type="number"
                  placeholder="Enter interval in seconds"
                  value={newInterval}
                  onChange={(e) => setNewInterval(e.target.value)}
                  disabled={isSettingInterval}
                />
                <Button
                  onClick={handleSetInterval}
                  disabled={isSettingInterval || !newInterval}
                >
                  {isSettingInterval ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    "Set"
                  )}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Transfer Ownership */}
            <div className="space-y-2">
              <Label htmlFor="newOwner">Transfer Ownership</Label>
              <div className="flex gap-2">
                <Input
                  id="newOwner"
                  placeholder="Enter new owner address"
                  value={newOwner}
                  onChange={(e) => setNewOwner(e.target.value)}
                  disabled={isTransferring}
                />
                <Button
                  onClick={handleTransferOwnership}
                  disabled={isTransferring || !newOwner}
                  variant="outline"
                >
                  {isTransferring ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    "Transfer"
                  )}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Renounce Ownership */}
            <div className="space-y-2">
              <Label>Renounce Ownership</Label>
              <Button
                onClick={handleRenounceOwnership}
                disabled={isRenouncing}
                variant="destructive"
              >
                {isRenouncing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  "Renounce"
                )}
              </Button>
              <p className="text-sm text-red-600">
                ⚠️ This action cannot be undone!
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Price History */}
      {priceHistory && priceHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Price History</CardTitle>
            <CardDescription>Last 5 price updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {priceHistory.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm">#{entry.roundId}</span>
                    <span className="font-semibold">
                      ${entry.price.toFixed(4)}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {entry.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Messages */}
      {isUpdateSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span>Price updated successfully!</span>
          </div>
        </div>
      )}
    </div>
  );
}
