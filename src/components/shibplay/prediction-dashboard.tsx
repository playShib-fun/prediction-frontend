"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import {
  useLatestRounds,
  useUserBets,
  useRoundDetails,
  useBetBulls,
  useBetBears,
  useClaims,
  useLockRounds,
  useEndRounds,
  filterAndSortData,
} from "@/hooks/use-prediction-data";

// Utility function to format Wei to ETH
const formatWeiToEth = (wei: string) => {
  return (parseFloat(wei) / 1e18).toFixed(4);
};

// Utility function to format timestamp
const formatTimestamp = (timestamp: string) => {
  return formatDistanceToNow(new Date(parseInt(timestamp) * 1000), {
    addSuffix: true,
  });
};

// Utility function to shorten address
const shortenAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export function PredictionDashboard() {
  const [selectedRoundId, setSelectedRoundId] = useState<string>("");
  const [userAddress, setUserAddress] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<"timestamp" | "amount" | "epoch">(
    "timestamp"
  );

  // Fetch latest rounds
  const { data: latestRounds, isLoading: roundsLoading } = useLatestRounds(5);

  // Fetch user bets if address is provided
  const {
    bullBets,
    bearBets,
    isLoading: userBetsLoading,
  } = useUserBets(userAddress, 10);

  // Fetch round details if round is selected
  const {
    lockRound,
    endRound,
    rewards,
    isLoading: roundDetailsLoading,
  } = useRoundDetails(selectedRoundId);

  // Fetch recent bets
  const { data: recentBullBets, isLoading: bullBetsLoading } = useBetBulls({
    limit: 10,
    sortBy: "timestamp",
    ascending: false,
  });

  const { data: recentBearBets, isLoading: bearBetsLoading } = useBetBears({
    limit: 10,
    sortBy: "timestamp",
    ascending: false,
  });

  // Fetch recent claims
  const { data: recentClaims, isLoading: claimsLoading } = useClaims({
    limit: 10,
    sortBy: "timestamp",
    ascending: false,
  });

  // Filter data based on search term
  const filteredBullBets = searchTerm
    ? filterAndSortData.byTransactionHash(recentBullBets || [], searchTerm)
    : recentBullBets || [];

  const filteredBearBets = searchTerm
    ? filterAndSortData.byTransactionHash(recentBearBets || [], searchTerm)
    : recentBearBets || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Prediction Game Dashboard</h1>
        <p className="text-muted-foreground">
          Real-time data from the Shib prediction game on Puppynet
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">
                Search Transaction Hash
              </label>
              <Input
                placeholder="Enter transaction hash..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">User Address</label>
              <Input
                placeholder="Enter wallet address..."
                value={userAddress}
                onChange={(e) => setUserAddress(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Sort By</label>
              <Select
                value={sortBy}
                onValueChange={(value: any) => setSortBy(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="timestamp">Timestamp</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                  <SelectItem value="epoch">Epoch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Latest Rounds */}
      <Card>
        <CardHeader>
          <CardTitle>Latest Rounds</CardTitle>
          <CardDescription>Most recent prediction rounds</CardDescription>
        </CardHeader>
        <CardContent>
          {roundsLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {latestRounds?.map((round) => (
                <div
                  key={round.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => setSelectedRoundId(round.id)}
                >
                  <div>
                    <div className="font-medium">Epoch {round.epoch}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatTimestamp(round.timestamp)}
                    </div>
                  </div>
                  <Badge variant="outline">Round {round.id}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Round Details */}
      {selectedRoundId && (
        <Card>
          <CardHeader>
            <CardTitle>Round Details</CardTitle>
            <CardDescription>
              Detailed information for round {selectedRoundId}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {roundDetailsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {lockRound && (
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold">Lock Round</h3>
                    <p className="text-2xl font-bold">
                      {formatWeiToEth(lockRound.lockPrice)} ETH
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatTimestamp(lockRound.timestamp)}
                    </p>
                  </div>
                )}
                {endRound && (
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold">Close Price</h3>
                    <p className="text-2xl font-bold">
                      {formatWeiToEth(endRound.closePrice)} ETH
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatTimestamp(endRound.timestamp)}
                    </p>
                  </div>
                )}
                {rewards && (
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold">Rewards</h3>
                    <p className="text-2xl font-bold">
                      {formatWeiToEth(rewards.rewardAmount)} ETH
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Treasury: {formatWeiToEth(rewards.treasuryAmt)} ETH
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* User Bets */}
      {userAddress && (
        <Card>
          <CardHeader>
            <CardTitle>User Bets</CardTitle>
            <CardDescription>
              Bets for address: {shortenAddress(userAddress)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userBetsLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Tabs defaultValue="bulls">
                <TabsList>
                  <TabsTrigger value="bulls">
                    Bull Bets ({bullBets.length})
                  </TabsTrigger>
                  <TabsTrigger value="bears">
                    Bear Bets ({bearBets.length})
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="bulls" className="space-y-2">
                  {bullBets.map((bet) => (
                    <div
                      key={bet.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">
                          {formatWeiToEth(bet.amount)} ETH
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Round {bet.roundId} • {formatTimestamp(bet.timestamp)}
                        </div>
                      </div>
                      <Badge variant="default">Bull</Badge>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="bears" className="space-y-2">
                  {bearBets.map((bet) => (
                    <div
                      key={bet.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">
                          {formatWeiToEth(bet.amount)} ETH
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Round {bet.roundId} • {formatTimestamp(bet.timestamp)}
                        </div>
                      </div>
                      <Badge variant="secondary">Bear</Badge>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest bets and claims</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="bets">
            <TabsList>
              <TabsTrigger value="bets">Recent Bets</TabsTrigger>
              <TabsTrigger value="claims">Recent Claims</TabsTrigger>
            </TabsList>

            <TabsContent value="bets" className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Bull Bets</h4>
                {bullBetsLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredBullBets.slice(0, 5).map((bet) => (
                      <div
                        key={bet.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <div className="font-medium">
                            {formatWeiToEth(bet.amount)} ETH
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {shortenAddress(bet.sender)} • Round {bet.roundId}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="default">Bull</Badge>
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatTimestamp(bet.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-2">Bear Bets</h4>
                {bearBetsLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredBearBets.slice(0, 5).map((bet) => (
                      <div
                        key={bet.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <div className="font-medium">
                            {formatWeiToEth(bet.amount)} ETH
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {shortenAddress(bet.sender)} • Round {bet.roundId}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">Bear</Badge>
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatTimestamp(bet.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="claims" className="space-y-2">
              {claimsLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                recentClaims?.map((claim) => (
                  <div
                    key={claim.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">
                        {formatWeiToEth(claim.amount)} ETH
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {shortenAddress(claim.sender)} • Round {claim.roundId}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">Claim</Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatTimestamp(claim.timestamp)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
