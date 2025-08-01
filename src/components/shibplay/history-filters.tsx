"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  ChevronDown,
  Filter,
  X,
  Sparkles,
  Trophy,
  Clock,
  Zap,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export type FilterType =
  | "all"
  | "winners"
  | "losers"
  | "calculating"
  | "running";

interface HistoryFiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  stats: {
    total: number;
    winners: number;
    losers: number;
    calculating: number;
    running: number;
    upcoming: number;
  };
}

const filterOptions: {
  value: FilterType;
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}[] = [
  {
    value: "all",
    label: "All Bets",
    icon: <Sparkles className="w-5 h-5" />,
    color: "from-blue-500 to-purple-500",
    description: "View all your prediction history",
  },
  {
    value: "winners",
    label: "Won",
    icon: <Trophy className="w-5 h-5" />,
    color: "from-green-500 to-emerald-500",
    description: "Rounds you won with rewards to claim",
  },
  {
    value: "losers",
    label: "Lost",
    icon: <TrendingUp className="w-5 h-5" />,
    color: "from-red-500 to-pink-500",
    description: "Rounds that didn't go your way",
  },
  {
    value: "calculating",
    label: "Calculating",
    icon: <Zap className="w-5 h-5" />,
    color: "from-yellow-500 to-orange-500",
    description: "Rounds being processed for results",
  },
  {
    value: "running",
    label: "Running",
    icon: <Clock className="w-5 h-5" />,
    color: "from-indigo-500 to-blue-500",
    description: "Currently active prediction rounds",
  },
];

export default function HistoryFilters({
  activeFilter,
  onFilterChange,
}: HistoryFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeOption = filterOptions.find(
    (option) => option.value === activeFilter
  );

  return (
    <div className="relative">
      {/* Filter Button */}
      <div className="flex items-center gap-3 mb-6">
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-gradient-to-r from-gray-900/80 to-black/80 backdrop-blur-xl border-gray-700 text-gray-200 hover:from-gray-800/80 hover:to-gray-900/80 hover:border-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DrawerTrigger>

          <DrawerContent className="bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl border-gray-800 max-w-lg mx-auto">
            <DrawerHeader className="border-b border-gray-800/50">
              <DrawerTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Filter Your Bets
              </DrawerTitle>
            </DrawerHeader>

            <div className="p-6 space-y-6">
              {/* Filter Options */}
              <div className="space-y-3">
                {filterOptions.map((option) => {
                  const isActive = activeFilter === option.value;

                  return (
                    <motion.button
                      key={option.value}
                      onClick={() => {
                        onFilterChange(option.value);
                        setIsOpen(false);
                      }}
                      className={`relative w-full p-4 rounded-2xl border transition-all duration-300 text-left group overflow-hidden ${
                        isActive
                          ? `bg-gradient-to-r ${
                              option.color
                            } border-transparent shadow-2xl shadow-${
                              option.color.split("-")[1]
                            }-500/20`
                          : "bg-gray-800/30 border-gray-700/50 hover:bg-gray-700/30 hover:border-gray-600/50 hover:shadow-lg"
                      }`}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Background gradient overlay */}
                      {isActive && (
                        <motion.div
                          layoutId="activeFilter"
                          className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-2xl"
                          initial={false}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                        />
                      )}

                      <div className="relative flex items-center gap-4">
                        {/* Icon */}
                        <div
                          className={`flex-shrink-0 p-3 rounded-xl ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-gray-700/50 text-gray-400 group-hover:bg-gray-600/50 group-hover:text-gray-300"
                          } transition-all duration-300`}
                        >
                          {option.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div
                            className={`text-lg font-semibold ${
                              isActive ? "text-white" : "text-gray-200"
                            } transition-colors duration-300`}
                          >
                            {option.label}
                          </div>
                          <div
                            className={`text-sm ${
                              isActive ? "text-white/80" : "text-gray-400"
                            } transition-colors duration-300`}
                          >
                            {option.description}
                          </div>
                        </div>

                        {/* Count Badge */}
                        {/* <div
                          className={`flex-shrink-0 px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-gray-700/50 text-gray-400 group-hover:bg-gray-600/50 group-hover:text-gray-300"
                          }`}
                        >
                          {count}
                        </div> */}
                      </div>

                      {/* Hover effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.button>
                  );
                })}
              </div>

              {/* Stats Section */}
              {/* <div className="bg-gradient-to-r from-gray-800/30 to-gray-700/30 rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-gray-200 mb-4">
                  Quick Stats
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400 mb-1">
                      {stats.winners}
                    </div>
                    <div className="text-xs text-gray-400 font-medium">
                      Winners
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400 mb-1">
                      {stats.losers}
                    </div>
                    <div className="text-xs text-gray-400 font-medium">
                      Losers
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400 mb-1">
                      {stats.calculating + stats.running}
                    </div>
                    <div className="text-xs text-gray-400 font-medium">
                      Active
                    </div>
                  </div>
                </div>
              </div> */}
            </div>
          </DrawerContent>
        </Drawer>

        {/* Active Filter Display */}
        {activeFilter !== "all" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-xl rounded-full border border-gray-600/50 shadow-lg"
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gray-700/50">
                {activeOption?.icon}
              </div>
              <span className="text-sm font-medium text-gray-200">
                {activeOption?.label}
              </span>
              {/* <span className="text-xs bg-gray-600/50 text-gray-300 px-2 py-0.5 rounded-full">
                {getFilterCount(activeFilter)}
              </span> */}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFilterChange("all")}
              className="h-6 w-6 p-0 hover:bg-gray-600/50 rounded-full"
            >
              <X className="w-3 h-3" />
            </Button>
          </motion.div>
        )}

        {/* Total Count */}
        {/* <div className="ml-auto text-sm text-gray-400 font-medium">
          {stats.total} total bets
        </div> */}
      </div>
    </div>
  );
}
