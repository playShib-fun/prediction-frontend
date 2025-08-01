"use client";

import { ChartArea, Clock, Home } from "lucide-react";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Dock, DockIcon } from "../magicui/dock";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "../ui/button";
import { Separator } from "../ui/separator";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "motion/react";
import ChartsDialog from "./charts-dialog";

export default function Footer() {
  const DATA = {
    primary: [
      {
        href: "/",
        label: "Home",
        icon: Home,
      },
      {
        href: "/history",
        label: "History",
        icon: Clock,
      },
      // {
      //   href: "/how-to-play",
      //   label: "How to Play",
      //   icon: MessageCircleQuestionMark,
      // },
    ],
  };
  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0, rotate: 10 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full flex justify-center items-center"
      >
        <Dock direction="middle" className="fixed bottom-4 w-auto">
          {DATA.primary.map((item) => (
            <DockIcon key={item.label}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    aria-label={item.label}
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "icon" }),
                      "size-12 rounded-full"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>{item.label}</TooltipContent>
              </Tooltip>
            </DockIcon>
          ))}
          <Separator orientation="vertical" className="h-full" />

          <ConnectButton
            accountStatus={"avatar"}
            showBalance={false}
            chainStatus={"none"}
            label="Connect"
          />

          {/* <DarkModeToggle /> */}
          <ChartsDialog>
            <Button variant="ghost" className="rounded-full">
              <ChartArea className="w-4 h-4" /> Charts
            </Button>
          </ChartsDialog>
        </Dock>
      </motion.div>
    </TooltipProvider>
  );
}

/**
 * <footer className="flex justify-between gap-4 items-center p-4 dark:text-white bg-white/10 rounded-full w-full mb-8">
      <button className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/20 cursor-pointer">
        <Clock className="w-4 h-4" />
        History
      </button>
      <button className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/20 cursor-pointer">
        <Trophy className="w-4 h-4" />
        Leaderboards
      </button>
      <button className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/20 cursor-pointer">
        <Wallet className="w-4 h-4" />
        Connect
      </button>
      <DarkModeToggle />
    </footer>
 */
