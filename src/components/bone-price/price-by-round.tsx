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
import { Badge } from "@/components/ui/badge";
import { DollarSign, Clock, Hash, RefreshCw, Search } from "lucide-react";
import {
  useFormattedPriceByRoundId,
  useFormattedPriceRange,
} from "@/hooks/use-bone-price";

export default function PriceByRound() {
  const [roundId, setRoundId] = useState("");
  const [startRoundId, setStartRoundId] = useState("");
  const [endRoundId, setEndRoundId] = useState("");

  const {
    data: roundPrice,
    isLoading: isRoundLoading,
    error: roundError,
  } = useFormattedPriceByRoundId(roundId);
  const {
    data: priceRange,
    isLoading: isRangeLoading,
    error: rangeError,
  } = useFormattedPriceRange(startRoundId, endRoundId);

  const handleSearchRound = () => {
    // The hook will automatically refetch when roundId changes
  };

  const handleSearchRange = () => {
    // The hook will automatically refetch when startRoundId or endRoundId changes
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Price by Round ID</h2>
        <p className="text-muted-foreground">
          Search for specific round prices and ranges
        </p>
      </div>

      {/* Single Round Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="w-5 h-5" />
            Search by Round ID
          </CardTitle>
          <CardDescription>Get price data for a specific round</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="roundId">Round ID</Label>
              <Input
                id="roundId"
                type="number"
                placeholder="Enter round ID (e.g., 123)"
                value={roundId}
                onChange={(e) => setRoundId(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearchRound} disabled={!roundId}>
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </div>

          {isRoundLoading && (
            <div className="flex items-center justify-center p-4">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span className="ml-2">Loading round data...</span>
            </div>
          )}

          {roundError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">Error: {roundError.message}</p>
            </div>
          )}

          {roundPrice && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div>
                <Label className="text-sm text-green-700">Price</Label>
                <div className="text-2xl font-bold text-green-800 flex items-center gap-1">
                  <DollarSign className="w-5 h-5" />
                  {roundPrice.price.toFixed(4)}
                </div>
              </div>
              <div>
                <Label className="text-sm text-green-700">Timestamp</Label>
                <div className="text-lg font-semibold text-green-800 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {roundPrice.timestamp.toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Price Range Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="w-5 h-5" />
            Price Range Search
          </CardTitle>
          <CardDescription>
            Get price data for a range of rounds
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <Label htmlFor="startRoundId">Start Round ID</Label>
              <Input
                id="startRoundId"
                type="number"
                placeholder="Start round (e.g., 100)"
                value={startRoundId}
                onChange={(e) => setStartRoundId(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endRoundId">End Round ID</Label>
              <Input
                id="endRoundId"
                type="number"
                placeholder="End round (e.g., 110)"
                value={endRoundId}
                onChange={(e) => setEndRoundId(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleSearchRange}
                disabled={!startRoundId || !endRoundId}
                className="w-full"
              >
                <Search className="w-4 h-4 mr-2" />
                Search Range
              </Button>
            </div>
          </div>

          {isRangeLoading && (
            <div className="flex items-center justify-center p-4">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span className="ml-2">Loading range data...</span>
            </div>
          )}

          {rangeError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">Error: {rangeError.message}</p>
            </div>
          )}

          {priceRange && priceRange.prices.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Price Range Results</h4>
                <Badge variant="secondary">
                  {priceRange.prices.length} rounds
                </Badge>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {priceRange.prices.map((price: number, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Round {Number(startRoundId) + index}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">${price.toFixed(4)}</span>
                      <span className="text-sm text-muted-foreground">
                        {priceRange.timestamps[index].toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div>
                  <Label className="text-sm text-blue-700">Lowest Price</Label>
                  <div className="text-lg font-bold text-blue-800">
                    ${Math.min(...priceRange.prices).toFixed(4)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-blue-700">Highest Price</Label>
                  <div className="text-lg font-bold text-blue-800">
                    ${Math.max(...priceRange.prices).toFixed(4)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-blue-700">Average Price</Label>
                  <div className="text-lg font-bold text-blue-800">
                    $
                    {(
                      priceRange.prices.reduce(
                        (a: number, b: number) => a + b,
                        0
                      ) / priceRange.prices.length
                    ).toFixed(4)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
