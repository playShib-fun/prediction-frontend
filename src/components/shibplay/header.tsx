"use client";

import Image from "next/image";
import Link from "next/link";
import { Trophy, Info, Home, LineChart, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShineBorder } from "@/components/magicui/shine-border";
import { useEffect, useMemo, useState } from "react";
import { useRounds } from "@/hooks/use-prediction-data";
import { useWalletConnection } from "@/hooks/use-wallet";
import ChartsDialog from "@/components/shibplay/charts-dialog";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import FiveMinuteTimer from "@/components/shibplay/five-minute-timer";

export default function Header() {
  const { data: rounds } = useRounds();
  // keep hook for potential future state; not directly used due to RainbowKit Custom
  useWalletConnection();
  const [isLarge, setIsLarge] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => setIsLarge(window.innerWidth >= 1024);
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);
  const totalRewardsBone = useMemo(() => {
    if (!rounds?.length) return 0;
    return rounds.reduce((sum, r) => {
      const pool = r.pricePool ? parseFloat(r.pricePool) / 1e18 : 0;
      if (pool > 0) return sum + pool;
      const bear = r.bearAmount ? parseFloat(r.bearAmount) / 1e18 : 0;
      const bull = r.bullAmount ? parseFloat(r.bullAmount) / 1e18 : 0;
      return sum + bear + bull;
    }, 0);
  }, [rounds]);

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-[200] backdrop-blur supports-[backdrop-filter]:bg-black/40 bg-black/60 border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12">
        <div className="h-16 md:h-20 flex items-center gap-4 justify-between">
          {/* Left: Logo + Brand */}
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src="/images/shibplay-logo.png"
              alt="ShibPlay"
              width={32}
              height={32}
              className="rounded-sm shadow-md"
            />
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-white">
              Shib<span className="text-primary">Play</span>
            </span>
          </Link>

          {/* Center: Global timer */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <FiveMinuteTimer />
          </div>

          {/* Right: Actions (mobile connect + desktop actions) */}
          {!isLarge && (
            <ConnectButton.Custom>
              {({ account, chain, openAccountModal, openConnectModal, mounted }) => {
                const connected = mounted && account && chain;
                return (
                  <Button
                    onClick={() => (connected ? openAccountModal() : openConnectModal())}
                    variant="outline"
                    className="md:hidden h-9 px-3 text-xs border-primary text-primary bg-primary/10 hover:bg-primary/20 rounded-lg"
                  >
                    {connected ? account.displayName : "Connect Wallet"}
                  </Button>
                );
              }}
            </ConnectButton.Custom>
          )}
          {/* Desktop actions */}
          {isLarge && (
          <nav className="hidden lg:flex items-center gap-3 sm:gap-4">
            <Link href="/how-to-play" target="_blank" rel="noopener noreferrer">
              <div className="relative">
                <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} className="rounded-lg" />
                <Button
                  variant="outline"
                  className="relative h-10 md:h-11 border-primary text-primary bg-primary/5 hover:bg-primary/10 hover:text-primary rounded-lg px-4 cursor-pointer"
                >
                  <Info className="w-4 h-4 mr-2" />
                  How it works
                </Button>
              </div>
            </Link>
            <div className="relative">
              <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} className="rounded-lg" />
              <Button
                disabled
                aria-disabled="true"
                className="relative h-10 md:h-11 px-5 rounded-lg cursor-not-allowed
                bg-gradient-to-r from-black/60 via-primary/25 to-black/60
                text-primary border border-primary/50 shadow-2xl shadow-primary/50 ring-4 ring-primary/40
                hover:brightness-110 active:brightness-110"
              >
                {/* Outer glow layers */}
                <span className="pointer-events-none absolute -inset-1 rounded-lg bg-gradient-to-r from-primary/50 via-pink-500/40 to-purple-500/50 blur-xl opacity-90" />
                <span className="pointer-events-none absolute -inset-2 rounded-lg bg-gradient-to-r from-primary/40 via-pink-500/30 to-purple-500/40 blur-2xl opacity-70 animate-pulse" />
                <span className="pointer-events-none absolute inset-0 rounded-lg ring-2 ring-primary/50 blur-sm opacity-60" />
                {/* Content */}
                <span className="relative z-10 flex items-center gap-2 w-full">
                  <Trophy className="w-5 h-5 mr-1 text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,1)]" />
                  <span className="mr-2 text-white/90">Winning</span>
                  <span className="ml-auto text-xs md:text-sm font-semibold
                    text-white bg-primary/50 rounded px-2 py-0.5 shadow shadow-primary/50 drop-shadow-[0_0_10px_rgba(167,139,250,0.8)]">
                    {totalRewardsBone.toFixed(2)} BONE
                  </span>
                </span>
              </Button>
            </div>
          </nav>
          )}
        </div>
      </div>
    </header>
    {/* Bottom action bar (mobile + tablet) - placed outside header to avoid iOS fixed issues */}
    {!isLarge && (
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[250] backdrop-blur bg-black/70 border-t border-white/10 shadow-2xl pb-[env(safe-area-inset-bottom)]">
        {/* Primary actions: How it works + Winning */}
        <div className="max-w-7xl mx-auto px-4 pt-2">
          <div className="grid grid-cols-2 gap-3 mb-2">
            <Link href="/how-to-play" target="_blank" rel="noopener noreferrer">
              <div className="relative">
                <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} className="rounded-lg" />
                <Button
                  variant="outline"
                  className="relative h-12 w-full text-base border-primary text-primary bg-primary/5 hover:bg-primary/10 hover:text-primary rounded-lg"
                >
                  <Info className="w-4 h-4 mr-2" />
                  How it works
                </Button>
              </div>
            </Link>
            <div className="relative">
              <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} className="rounded-lg" />
              <Button
                disabled
                aria-disabled="true"
                className="relative h-12 w-full text-base rounded-lg cursor-not-allowed
                bg-gradient-to-r from-black/60 via-primary/25 to-black/60
                text-primary border border-primary/50 shadow-2xl shadow-primary/50 ring-4 ring-primary/40"
              >
                <span className="pointer-events-none absolute -inset-1 rounded-lg bg-gradient-to-r from-primary/50 via-pink-500/40 to-purple-500/50 blur-xl opacity-90" />
                <span className="pointer-events-none absolute -inset-2 rounded-lg bg-gradient-to-r from-primary/40 via-pink-500/30 to-purple-500/40 blur-2xl opacity-70 animate-pulse" />
                <span className="relative z-10 flex items-center gap-2 justify-center w-full">
                  <Trophy className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,1)]" />
                  <span className="text-white/90">Winning</span>
                  <span className="ml-2 text-xs font-semibold text-white bg-primary/50 rounded px-2 py-0.5 shadow shadow-primary/50">{totalRewardsBone.toFixed(2)} BONE</span>
                </span>
              </Button>
            </div>
          </div>
          {/* Secondary bottom nav: Home, History, Connect, Charts */}
          <div className="grid grid-cols-3 gap-2 pb-3">
            <Link href="/">
              <Button variant="ghost" className="w-full text-gray-300 hover:text-white">
                <Home className="w-8 h-8" />
                <span className="sr-only">Home</span>
              </Button>
            </Link>
            <Link href="/history">
              <Button variant="ghost" className="w-full text-gray-300 hover:text-white">
                <History className="w-8 h-8" />
                <span className="sr-only">History</span>
              </Button>
            </Link>
            <ChartsDialog>
              <Button variant="ghost" className="w-full text-gray-300 hover:text-white">
                <LineChart className="w-8 h-8" />
                <span className="sr-only">Charts</span>
              </Button>
            </ChartsDialog>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
