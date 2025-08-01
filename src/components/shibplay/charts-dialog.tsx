"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChartArea } from "lucide-react";
import TradingViewWidget from "./trading-view-widget";
import { motion, AnimatePresence } from "motion/react";

interface ChartsDialogProps {
  children: React.ReactNode;
}

export default function ChartsDialog({ children }: ChartsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg md:max-w-2xl w-full h-auto gap-0 bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-xl border border-gray-800 p-0 overflow-hidden">
        <DialogHeader className="flex items-center justify-between px-6 py-4 border-b border-gray-800/50 bg-gradient-to-r from-gray-900/50 to-black/50">
          <DialogTitle className="flex items-center gap-3 text-lg font-bold h-full p-0">
            <ChartArea className="w-4 h-4" />
            TradingView
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex-1 h-full"
            >
              <div className="h-full w-full">
                <TradingViewWidget />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
