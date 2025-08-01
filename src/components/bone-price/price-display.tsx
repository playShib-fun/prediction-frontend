"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import {
  useFormattedCurrentPrice,
  useFormattedLatestPrice,
} from "@/hooks/use-bone-price";
import { useState, useEffect } from "react";

interface PriceDisplayProps {
  showTrend?: boolean;
  showRoundId?: boolean;
  className?: string;
}

export default function PriceDisplay({
  showTrend = true,
  showRoundId = true,
  className = "",
}: PriceDisplayProps) {
  const { data: currentPrice, isLoading: isPriceLoading } =
    useFormattedCurrentPrice();
  const { data: latestPriceData } = useFormattedLatestPrice();
  const [priceChange, setPriceChange] = useState<number>(0);
  const [isPositive, setIsPositive] = useState<boolean>(true);

  // Calculate price change when we have both current and latest data
  useEffect(() => {
    if (
      currentPrice &&
      latestPriceData &&
      latestPriceData.price !== currentPrice
    ) {
      const change =
        ((currentPrice - latestPriceData.price) / latestPriceData.price) * 100;
      setPriceChange(Math.abs(change));
      setIsPositive(change >= 0);
    }
  }, [currentPrice, latestPriceData]);

  if (isPriceLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading price...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            <div>
              <div className="text-2xl font-bold">
                ${currentPrice?.toFixed(4) || "0.0000"}
              </div>
              {showRoundId && latestPriceData && (
                <div className="text-sm text-muted-foreground">
                  Round #{latestPriceData.roundId}
                </div>
              )}
            </div>
          </div>

          {showTrend && priceChange > 0 && (
            <div className="flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <Badge variant={isPositive ? "default" : "destructive"}>
                {isPositive ? "+" : "-"}
                {priceChange.toFixed(2)}%
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
