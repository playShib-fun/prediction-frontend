"use client";

import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";

interface PredictionSide {
  type: "up" | "down";
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
  trendIcon: React.ReactNode;
  description: string;
  winCondition: string;
  example: {
    lockPrice: string;
    finalPrice: string;
    result: string;
  };
}

const predictionSides: PredictionSide[] = [
  {
    type: "up",
    label: "UP",
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950/20",
    borderColor: "border-green-200 dark:border-green-800",
    icon: <ArrowUp className="w-8 h-8" />,
    trendIcon: <TrendingUp className="w-5 h-5" />,
    description: "Predict the price will rise",
    winCondition: "Win if final price > locked price",
    example: {
      lockPrice: "$0.001234",
      finalPrice: "$0.001456",
      result: "WIN! +18% gain"
    }
  },
  {
    type: "down",
    label: "DOWN",
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-950/20",
    borderColor: "border-red-200 dark:border-red-800",
    icon: <ArrowDown className="w-8 h-8" />,
    trendIcon: <TrendingDown className="w-5 h-5" />,
    description: "Predict the price will fall",
    winCondition: "Win if final price < locked price",
    example: {
      lockPrice: "$0.001234",
      finalPrice: "$0.001098",
      result: "WIN! -11% drop"
    }
  }
];

export function GameMechanicsCard() {
  const [hoveredSide, setHoveredSide] = useState<"up" | "down" | null>(null);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-center justify-center">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          How Predictions Work
        </CardTitle>
        <p className="text-muted-foreground text-center">
          Choose your prediction and win if you&apos;re right about the price direction
        </p>
      </CardHeader>
      <CardContent className="p-0">
        {/* Split Screen Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[400px]">
          {predictionSides.map((side) => (
            <motion.div
              key={side.type}
              className={`relative p-6 cursor-pointer transition-all duration-300 ${side.bgColor} ${side.borderColor} ${
                side.type === "up" ? "border-r md:border-r-2" : "border-l md:border-l-2"
              }`}
              onHoverStart={() => setHoveredSide(side.type)}
              onHoverEnd={() => setHoveredSide(null)}
              whileHover={{ scale: 1.02 }}
              animate={{
                backgroundColor: hoveredSide === side.type 
                  ? side.type === "up" 
                    ? "rgba(34, 197, 94, 0.1)" 
                    : "rgba(239, 68, 68, 0.1)"
                  : undefined
              }}
            >
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <motion.div
                  className={`w-full h-full ${side.type === "up" ? "bg-gradient-to-br from-green-400 to-green-600" : "bg-gradient-to-br from-red-400 to-red-600"}`}
                  animate={{
                    opacity: hoveredSide === side.type ? 0.1 : 0.05,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col">
                {/* Header with Icon */}
                <div className="text-center mb-6">
                  <motion.div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${side.bgColor} ${side.borderColor} border-2 mb-4`}
                    animate={{
                      scale: hoveredSide === side.type ? 1.1 : 1,
                      rotate: hoveredSide === side.type ? (side.type === "up" ? -10 : 10) : 0,
                    }}
                    transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                  >
                    <span className={side.color}>
                      {side.icon}
                    </span>
                  </motion.div>
                  
                  <motion.h3
                    className={`text-2xl font-bold ${side.color} mb-2`}
                    animate={{
                      scale: hoveredSide === side.type ? 1.05 : 1,
                    }}
                  >
                    {side.label}
                  </motion.h3>
                  
                  <p className="text-muted-foreground text-sm">
                    {side.description}
                  </p>
                </div>

                {/* Animated Price Arrow */}
                <div className="flex-1 flex items-center justify-center mb-6">
                  <motion.div
                    className="relative"
                    animate={{
                      y: hoveredSide === side.type 
                        ? side.type === "up" ? -10 : 10 
                        : 0,
                    }}
                    transition={{ duration: 0.5, type: "spring" }}
                  >
                    {/* Price Line */}
                    <div className="relative w-32 h-16 flex items-center justify-center">
                      <motion.div
                        className={`absolute w-full h-1 ${side.type === "up" ? "bg-green-400" : "bg-red-400"} rounded-full`}
                        animate={{
                          scaleX: hoveredSide === side.type ? 1.2 : 1,
                          opacity: hoveredSide === side.type ? 1 : 0.7,
                        }}
                      />
                      
                      {/* Animated Arrow */}
                      <motion.div
                        className={`absolute ${side.type === "up" ? "right-0 -top-2" : "right-0 -bottom-2"} ${side.color}`}
                        animate={{
                          x: hoveredSide === side.type ? 5 : 0,
                          scale: hoveredSide === side.type ? 1.2 : 1,
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        {side.trendIcon}
                      </motion.div>
                    </div>
                  </motion.div>
                </div>

                {/* Win Condition */}
                <div className="text-center mb-4">
                  <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full ${side.bgColor} ${side.borderColor} border`}>
                    <span className="text-xs font-medium text-muted-foreground">
                      {side.winCondition}
                    </span>
                  </div>
                </div>

                {/* Example Outcome - Shows on Hover */}
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{
                    opacity: hoveredSide === side.type ? 1 : 0,
                    height: hoveredSide === side.type ? "auto" : 0,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`p-3 rounded-lg ${side.bgColor} ${side.borderColor} border`}>
                    <p className="text-xs text-muted-foreground mb-1">Example:</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Lock Price:</span>
                        <span className="font-mono">{side.example.lockPrice}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Final Price:</span>
                        <span className="font-mono">{side.example.finalPrice}</span>
                      </div>
                      <div className={`text-xs font-bold ${side.color} pt-1 border-t border-current/20`}>
                        {side.example.result}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Hover Glow Effect */}
              <motion.div
                className={`absolute inset-0 rounded-lg ${side.type === "up" ? "shadow-green-500/20" : "shadow-red-500/20"}`}
                animate={{
                  boxShadow: hoveredSide === side.type 
                    ? `0 0 30px ${side.type === "up" ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"}`
                    : "0 0 0px rgba(0, 0, 0, 0)",
                }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          ))}
        </div>

        {/* Bottom Info Section */}
        <div className="p-6 bg-muted/30 border-t">
          <div className="text-center">
            <motion.p
              className="text-sm text-muted-foreground mb-3"
              animate={{
                opacity: hoveredSide ? 0.7 : 1,
              }}
            >
              <strong className="text-foreground">Pro Tip:</strong> Hover over each side to see example outcomes
            </motion.p>
            
            <motion.div
              className="flex items-center justify-center gap-4 text-xs text-muted-foreground"
              animate={{
                y: hoveredSide ? 5 : 0,
                opacity: hoveredSide ? 0.8 : 1,
              }}
            >
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>UP wins if price rises</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span>DOWN wins if price falls</span>
              </div>
            </motion.div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}