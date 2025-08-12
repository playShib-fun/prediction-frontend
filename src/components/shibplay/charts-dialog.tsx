"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import TradingViewWidget from "./trading-view-widget";
import { motion, AnimatePresence } from "motion/react";

interface ChartsDialogProps {
  children: React.ReactNode;
}

export default function ChartsDialog({ children }: ChartsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="p-0 overflow-hidden bg-black/95 border border-gray-800 max-w-[100vw] w-full">
        <DrawerHeader className="sr-only">
          <DrawerTitle>TradingView Chart</DrawerTitle>
        </DrawerHeader>
        <div className="relative w-full h-[70vh]">
          <AnimatePresence mode="wait">
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex-1 h-full"
              >
                <TradingViewWidget />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
