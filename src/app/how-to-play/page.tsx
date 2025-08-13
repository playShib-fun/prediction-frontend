"use client";

import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { TextAnimate } from "@/components/magicui/text-animate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Trophy,
  Play,
  Target,
  Zap,
  Star,
  Info,
  ExternalLink,
  Timer,
  Coins,
  Shield,
  Users,
  BarChart3,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { GameMechanicsCard } from "@/components/shibplay/game-mechanics-card";
import { Input } from "@/components/ui/input";

const steps = [
  {
    icon: <Target className="w-6 h-6" />,
    title: "Master Predictor",
    description:
      "Channel your inner oracle and unleash market-reading superpowers",
    details:
      "Become the prediction legend you were born to be! Analyze the battlefield, trust your instincts, and choose your destiny: UP for moon missions or DOWN for bear hunts. This is where heroes are forged and legends begin!",
    color: "text-blue-600",
    category: "Strategy",
  },
  {
    icon: <Coins className="w-6 h-6" />,
    title: "Smart Investor",
    description:
      "Deploy your war chest with tactical precision and calculated courage",
    details:
      "Time to fuel your prediction rocket! Select your ammunition using our power-up buttons (25%, 50%, 75%, 100%) or go custom for maximum control. Remember, brave warrior: only risk what you can afford to lose in this epic battle!",
    color: "text-green-600",
    category: "Finance",
  },
  {
    icon: <Timer className="w-6 h-6" />,
    title: "Patience Champion",
    description:
      "Master the art of zen while your destiny unfolds in real-time",
    details:
      "The arena is now LIVE! For exactly 5 electrifying minutes, watch the price dance like a wild stallion. Every tick could be your ticket to glory. Feel the adrenaline surge as your prediction battles against the market forces!",
    color: "text-orange-600",
    category: "Timing",
  },
  {
    icon: <Trophy className="w-6 h-6" />,
    title: "Victory Collector",
    description: "Ascend to the throne and claim your rightful treasure",
    details:
      "VICTORY IS YOURS! The golden 'Claim Rewards' button appears like a beacon of triumph. Click it to transfer your hard-earned spoils directly to your wallet. Bask in the glory - you've earned every BONE of it!",
    color: "text-purple-600",
    category: "Rewards",
  },
];

const features = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Lightning Fast Results",
    description:
      "Victory or defeat revealed in seconds - no waiting, just pure adrenaline",
    category: "speed",
    color: "from-yellow-500/20 to-orange-500/30",
    borderColor: "border-yellow-500/30",
    iconColor: "text-yellow-600",
    bgColor: "bg-yellow-500/10",
    hoverBg: "hover:bg-yellow-500/20",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Fortress-Level Security",
    description:
      "Blockchain-powered transparency means every move is verified and fair",
    category: "security",
    color: "from-blue-500/20 to-cyan-500/30",
    borderColor: "border-blue-500/30",
    iconColor: "text-blue-600",
    bgColor: "bg-blue-500/10",
    hoverBg: "hover:bg-blue-500/20",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Global Arena",
    description:
      "Battle alongside thousands of prediction warriors from every corner of the world",
    category: "community",
    color: "from-purple-500/20 to-pink-500/30",
    borderColor: "border-purple-500/30",
    iconColor: "text-purple-600",
    bgColor: "bg-purple-500/10",
    hoverBg: "hover:bg-purple-500/20",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Dynamic Power Multipliers",
    description:
      "Watch your potential rewards shift in real-time as the battle intensifies",
    category: "technical",
    color: "from-green-500/20 to-emerald-500/30",
    borderColor: "border-green-500/30",
    iconColor: "text-green-600",
    bgColor: "bg-green-500/10",
    hoverBg: "hover:bg-green-500/20",
  },
];

const faqCategories = [
  {
    id: "gameplay",
    title: "Gameplay & Rules",
    icon: <Target className="w-5 h-5" />,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    questions: [
      {
        question: "How is the payout calculated?",
        answer:
          "Think of it like a prize pool split! Your payout depends on how much everyone bet on each side. The formula is: Your Winnings = (Your Bet × Pool Multiplier) × 95% (after 5% platform fee). Example: Bet 2 BONE with a 10x multiplier = 19 BONE total winnings. The fewer people on your winning side, the bigger your slice of the victory pie!",
      },
      {
        question: "Can I change my prediction after placing it?",
        answer:
          "Nope! Once you've committed to battle, there's no backing down - your prediction is locked and loaded. This keeps the game fair for everyone. Take a moment to trust your instincts, then go all-in with confidence. Remember: great warriors commit fully to their strategy!",
      },
      {
        question: "What happens if the price stays the same?",
        answer:
          "It's a rare cosmic draw! When the final price matches exactly where it started, nobody wins or loses - it's like the universe hit the pause button. Everyone gets their original bet back (minus the small 5% platform fee). Think of it as a practice round that didn't count!",
      },
    ],
  },
  {
    id: "rewards",
    title: "Rewards & Payouts",
    icon: <Trophy className="w-5 h-5" />,
    color: "text-yellow-600",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20",
    questions: [
      {
        question: "How long do I have to claim my winnings?",
        answer:
          "Forever and always! Your victory spoils are permanently yours - there's no expiration date on glory. Whether you claim them immediately or wait years, your rewards will be patiently waiting in the smart contract. Take your time, champion - your treasure isn't going anywhere!",
      },
      {
        question: "What are the fees?",
        answer:
          "Just a tiny 5% victory tax on your winnings - think of it as the arena's maintenance fee! This small contribution keeps the platform running smoothly, funds new features, and ensures the game stays epic for everyone. You keep 95% of your glory, and we keep the lights on. Fair deal, right?",
      },
      {
        question: "What happens if I win multiple rounds?",
        answer:
          "You become a legend! Each victory is its own separate treasure chest that you can claim individually. Win 10 rounds? That's 10 separate piles of BONE waiting for you. There's no limit to your winning streak - the more you conquer, the more rewards stack up. Build your empire, one prediction at a time!",
      },
    ],
  },
  {
    id: "technical",
    title: "Technical & Security",
    icon: <Shield className="w-5 h-5" />,
    color: "text-green-600",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
    questions: [
      {
        question: "Can I participate without connecting a wallet?",
        answer:
          "Nope - you need your digital armor (wallet) to enter the arena! This isn't just a rule, it's your protection. Your wallet ensures every transaction is secure, every reward goes directly to YOU, and nobody else can touch your winnings. Think of it as your personal vault that only you control!",
      },
      {
        question: "Is the platform secure?",
        answer:
          "Absolutely fortress-level secure! We're built on blockchain technology - imagine an unbreakable digital vault that everyone can see but nobody can hack. Every smart contract is verified, every transaction is permanent and transparent on Shibarium. It's like having a public ledger that's impossible to fake or manipulate!",
      },
      {
        question: "What wallets are supported?",
        answer:
          "We welcome all the popular digital warriors! MetaMask, WalletConnect, and any Web3 wallet that plays nice with Shibarium network. If your wallet can handle Shibarium, it can handle the glory. Most modern wallets are ready for battle - just make sure yours is configured for the Shibarium network!",
      },
    ],
  },
  {
    id: "general",
    title: "General Questions",
    icon: <HelpCircle className="w-5 h-5" />,
    color: "text-purple-600",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    questions: [
      {
        question: "How long does each round last?",
        answer:
          "Each epic battle lasts exactly 5 heart-pounding minutes! That's 300 seconds of pure adrenaline as you watch the price dance in real-time. Long enough to feel the excitement, short enough to keep you on the edge of your seat. Perfect for coffee breaks, commutes, or whenever you need a quick thrill!",
      },
      {
        question: "Can I place multiple bets in one round?",
        answer:
          "One warrior, one weapon, one shot at glory per round! You can only place a single prediction each battle, but here's the exciting part - new rounds start constantly. Miss one? Jump into the next! It's like having an endless tournament where every 5 minutes brings a fresh chance to prove your skills.",
      },
      {
        question: "Is there a minimum bet amount?",
        answer:
          "Yes, there's a small entry fee to join the arena - just enough to keep the game exciting and fair for everyone! The exact amount adjusts based on network conditions (like gas fees) and is always clearly shown before you commit. Think of it as the price of admission to the most thrilling prediction game in the crypto universe!",
      },
    ],
  },
];

export default function HowToPlay() {
  const [faqSearch, setFaqSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const contractAddress = "0xEfC9743D7e1b84D413647385EC9Ff42Cd9b10119";
  const shouldReduceMotion = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const filteredFaqCategories = useMemo(() => {
    const term = faqSearch.trim().toLowerCase();
    if (!term) return faqCategories;
    return faqCategories
      .map((cat) => ({
        ...cat,
        questions: cat.questions.filter((q) =>
          q.question.toLowerCase().includes(term) || q.answer.toLowerCase().includes(term)
        ),
      }))
      .filter((cat) => cat.questions.length > 0);
  }, [faqSearch]);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(contractAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-28 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={shouldReduceMotion ? undefined : { duration: 1, ease: "easeOut" }}
            className="text-center max-w-5xl mx-auto"
          >
            {/* Main Title with Gradient Effect */}
            <div className="relative mb-6 sm:mb-8 md:mb-10 lg:mb-12">
              <TextAnimate
                animation="blurInUp"
                by="word"
                className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold mb-3 sm:mb-4 md:mb-5 lg:mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent leading-[1.1] xs:leading-[1.15] sm:leading-tight px-2 sm:px-4"
                duration={0.8}
                delay={0.2}
              >
                Master the Game
              </TextAnimate>
              <TextAnimate
                animation="slideUp"
                by="word"
                className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-semibold text-muted-foreground/80 px-2 sm:px-4 leading-relaxed"
                duration={0.6}
                delay={0.6}
              >
                Predict. Win. Repeat.
              </TextAnimate>
            </div>

            {/* Enhanced Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 sm:mb-10 md:mb-12 lg:mb-16 max-w-4xl mx-auto leading-relaxed px-4 sm:px-6 text-center"
            >
              Transform your market intuition into epic wins! Every 5 minutes
              brings a new chance to prove your prediction prowess and
              <span className="text-primary font-medium">
                {" "}
                claim legendary rewards.
              </span>
            </motion.p>

            {/* Floating Achievement Badges */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, scale: 1 }}
              transition={shouldReduceMotion ? undefined : { duration: 0.8, delay: 1.2 }}
              className="flex flex-wrap justify-center gap-2 xs:gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-8 sm:mb-10 md:mb-12 lg:mb-16 px-4 sm:px-6"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group flex-shrink-0"
              >
                <Badge
                  variant="secondary"
                  className="text-xs xs:text-sm sm:text-base md:text-lg px-3 xs:px-4 sm:px-5 md:px-6 py-2.5 xs:py-3 sm:py-3.5 md:py-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20 hover:border-green-500/40 transition-all duration-300 shadow-lg hover:shadow-xl touch-manipulation min-h-[48px] xs:min-h-[52px] sm:min-h-[56px] flex items-center justify-center whitespace-nowrap"
                >
                  <Play className="w-4 h-4 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-2 xs:mr-2 sm:mr-2.5 md:mr-3 text-green-600 group-hover:animate-pulse flex-shrink-0" />
                  <span className="font-semibold">Easy to Play</span>
                </Badge>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group flex-shrink-0"
              >
                <Badge
                  variant="secondary"
                  className="text-xs xs:text-sm sm:text-base md:text-lg px-3 xs:px-4 sm:px-5 md:px-6 py-2.5 xs:py-3 sm:py-3.5 md:py-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 shadow-lg hover:shadow-xl touch-manipulation min-h-[48px] xs:min-h-[52px] sm:min-h-[56px] flex items-center justify-center whitespace-nowrap"
                >
                  <Zap className="w-4 h-4 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-2 xs:mr-2 sm:mr-2.5 md:mr-3 text-yellow-600 group-hover:animate-bounce flex-shrink-0" />
                  <span className="font-semibold">Instant Rewards</span>
                </Badge>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group flex-shrink-0"
              >
                <Badge
                  variant="secondary"
                  className="text-xs xs:text-sm sm:text-base md:text-lg px-3 xs:px-4 sm:px-5 md:px-6 py-2.5 xs:py-3 sm:py-3.5 md:py-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 shadow-lg hover:shadow-xl touch-manipulation min-h-[48px] xs:min-h-[52px] sm:min-h-[56px] flex items-center justify-center whitespace-nowrap"
                >
                  <Shield className="w-4 h-4 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-2 xs:mr-2 sm:mr-2.5 md:mr-3 text-blue-600 group-hover:animate-pulse flex-shrink-0" />
                  <span className="font-semibold">100% Secure</span>
                </Badge>
              </motion.div>
            </motion.div>

            {/* Achievement Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={shouldReduceMotion ? undefined : { duration: 0.8, delay: 1.4 }}
              className="grid grid-cols-1 xs:grid-cols-3 gap-3 xs:gap-4 sm:gap-5 md:gap-6 lg:gap-8 max-w-5xl mx-auto px-4 sm:px-6"
            >
              <div className="text-center group">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4 xs:p-5 sm:p-6 md:p-7 shadow-lg hover:shadow-xl transition-all duration-300 touch-manipulation min-h-[100px] xs:min-h-[110px] sm:min-h-[120px] md:min-h-[130px] flex flex-col justify-center"
                >
                  <div className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-1 xs:mb-1.5 sm:mb-2 group-hover:text-primary/80 transition-colors leading-none">
                    5min
                  </div>
                  <div className="text-xs xs:text-sm sm:text-base text-muted-foreground font-medium leading-tight">
                    Round Duration
                  </div>
                </motion.div>
              </div>

              <div className="text-center group">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4 xs:p-5 sm:p-6 md:p-7 shadow-lg hover:shadow-xl transition-all duration-300 touch-manipulation min-h-[100px] xs:min-h-[110px] sm:min-h-[120px] md:min-h-[130px] flex flex-col justify-center"
                >
                  <div className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-1 xs:mb-1.5 sm:mb-2 group-hover:text-primary/80 transition-colors leading-none">
                    24/7
                  </div>
                  <div className="text-xs xs:text-sm sm:text-base text-muted-foreground font-medium leading-tight">
                    Always Active
                  </div>
                </motion.div>
              </div>

              <div className="text-center group">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4 xs:p-5 sm:p-6 md:p-7 shadow-lg hover:shadow-xl transition-all duration-300 touch-manipulation min-h-[100px] xs:min-h-[110px] sm:min-h-[120px] md:min-h-[130px] flex flex-col justify-center"
                >
                  <div className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-1 xs:mb-1.5 sm:mb-2 group-hover:text-primary/80 transition-colors leading-none">
                    95%
                  </div>
                  <div className="text-xs xs:text-sm sm:text-base text-muted-foreground font-medium leading-tight">
                    Payout Rate
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Enhanced Call to Action Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.6 }}
              className="mt-12"
            >
              {/* Primary CTA with Progress Indicator */}
              <div className="relative">
                {/* Animated Background Glow */}
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-2xl blur-xl"
                />

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative"
                >
                  <Button
                    size="lg"
                    asChild
                    className="text-base xs:text-lg sm:text-xl md:text-2xl px-6 xs:px-8 sm:px-10 md:px-12 lg:px-14 py-4 xs:py-5 sm:py-6 md:py-7 bg-gradient-to-r from-primary via-primary to-purple-600 hover:from-primary/90 hover:via-primary/90 hover:to-purple-600/90 shadow-2xl hover:shadow-3xl transition-all duration-500 border-0 relative overflow-hidden group touch-manipulation min-h-[56px] xs:min-h-[60px] sm:min-h-[64px] md:min-h-[68px] rounded-2xl"
                  >
                    <Link href="/">
                      {/* Animated Shine Effect */}
                      <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 3,
                          ease: "easeInOut",
                        }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                      />
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="mr-2 xs:mr-2.5 sm:mr-3 md:mr-3.5"
                      >
                        <Trophy className="w-5 h-5 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                      </motion.div>
                      Start Your Journey
                      {/* Pulsing Arrow */}
                      <motion.div
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="ml-2 xs:ml-2.5 sm:ml-3 md:ml-3.5"
                      >
                        →
                      </motion.div>
                    </Link>
                  </Button>
                </motion.div>
              </div>

              {/* Readiness Progress Indicator */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1.8 }}
                className="mt-6 sm:mt-8 md:mt-10 max-w-md mx-auto px-4"
              >
                <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4 xs:p-5 sm:p-6 md:p-7 shadow-lg">
                  <div className="flex items-center justify-between mb-3 xs:mb-4 sm:mb-5">
                    <span className="text-sm xs:text-base sm:text-lg font-semibold text-muted-foreground">
                      Readiness Level
                    </span>
                    <span className="text-sm xs:text-base sm:text-lg font-bold text-primary">
                      Ready to Play!
                    </span>
                  </div>

                  <div className="relative">
                    <div className="w-full bg-muted/50 rounded-full h-3 xs:h-3.5 sm:h-4 md:h-5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2, delay: 2, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-green-500 via-primary to-purple-600 rounded-full relative overflow-hidden"
                      >
                        {/* Animated Shine on Progress Bar */}
                        <motion.div
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            repeatDelay: 2,
                            ease: "easeInOut",
                          }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                        />
                      </motion.div>
                    </div>

                    {/* Progress Checkpoints */}
                    <div className="flex justify-between mt-3 xs:mt-4 text-xs xs:text-sm sm:text-base text-muted-foreground font-medium">
                      <span>Learned</span>
                      <span>Confident</span>
                      <span>Ready!</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <Tabs defaultValue="overview" className="w-full max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-6 sm:mb-8 md:mb-10 h-14 xs:h-16 sm:h-18 md:h-auto gap-1 xs:gap-2 p-1.5 xs:p-2 sm:p-2.5 rounded-2xl">
            <TabsTrigger
              value="overview"
              className="text-sm xs:text-base sm:text-lg md:text-xl py-3 xs:py-3.5 sm:py-4 md:py-5 px-3 xs:px-4 sm:px-5 md:px-6 touch-manipulation min-h-[48px] xs:min-h-[52px] sm:min-h-[56px] flex items-center justify-center font-semibold rounded-xl transition-all duration-300"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="tutorial"
              className="text-sm xs:text-base sm:text-lg md:text-xl py-3 xs:py-3.5 sm:py-4 md:py-5 px-3 xs:px-4 sm:px-5 md:px-6 touch-manipulation min-h-[48px] xs:min-h-[52px] sm:min-h-[56px] flex items-center justify-center font-semibold rounded-xl transition-all duration-300"
            >
              <span className="hidden xs:inline">Step-by-Step</span>
              <span className="xs:hidden">Tutorial</span>
            </TabsTrigger>
            <TabsTrigger
              value="faq"
              className="text-sm xs:text-base sm:text-lg md:text-xl py-3 xs:py-3.5 sm:py-4 md:py-5 px-3 xs:px-4 sm:px-5 md:px-6 touch-manipulation min-h-[48px] xs:min-h-[52px] sm:min-h-[56px] flex items-center justify-center font-semibold rounded-xl transition-all duration-300"
            >
              FAQ
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Interactive Game Mechanics Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <GameMechanicsCard />
            </motion.div>

            {/* Strategic CTA After Game Mechanics */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-center"
            >
              <Card className="relative overflow-hidden border-2 border-green-500/30 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-600/5">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.1, 0.2, 0.1],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute -top-10 -right-10 w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600"
                  />
                  <motion.div
                    animate={{
                      scale: [1.1, 1, 1.1],
                      opacity: [0.1, 0.15, 0.1],
                      rotate: [360, 180, 0],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1,
                    }}
                    className="absolute -bottom-8 -left-8 w-16 h-16 rounded-full bg-gradient-to-br from-emerald-600 to-green-500"
                  />
                </div>

                <CardContent className="py-12 relative z-10">
                  {/* Achievement-Style Icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      duration: 0.8,
                      delay: 0.5,
                      type: "spring",
                      stiffness: 150,
                    }}
                    className="mb-6"
                  >
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Target className="w-8 h-8 text-white" />
                      </motion.div>
                    </div>
                  </motion.div>

                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="text-2xl md:text-3xl font-bold mb-4 text-foreground"
                  >
                    <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      Game Mechanics Mastered!
                    </span>
                  </motion.h3>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.9 }}
                    className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed"
                  >
                    You&apos;ve unlocked the secrets of prediction mastery! Your
                    training is complete - time to enter the arena and claim
                    your first victory! 🏆
                  </motion.p>

                  {/* Progress Indicator */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 1.1 }}
                    className="mb-8"
                  >
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                        className="w-3 h-3 rounded-full bg-green-500"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: 0.2,
                        }}
                        className="w-3 h-3 rounded-full bg-green-500"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: 0.4,
                        }}
                        className="w-3 h-3 rounded-full bg-green-500"
                      />
                    </div>
                    <p className="text-sm font-medium text-green-600">
                      Knowledge Level: Expert
                    </p>
                  </motion.div>

                  {/* Enhanced CTA Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.3 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="lg"
                        asChild
                        className="text-lg px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-xl hover:shadow-2xl transition-all duration-300 border-0 relative overflow-hidden group"
                      >
                        <Link href="/">
                          {/* Animated Background Pulse */}
                          <motion.div
                            animate={{
                              scale: [1, 1.1, 1],
                              opacity: [0, 0.3, 0],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 bg-white rounded-lg"
                          />
                          <motion.div
                            animate={{ rotate: [0, 15, -15, 0] }}
                            transition={{
                              duration: 0.5,
                              repeat: Infinity,
                              repeatDelay: 2,
                            }}
                            className="mr-3"
                          >
                            <Play className="w-5 h-5" />
                          </motion.div>
                          Try Your First Prediction
                          <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="ml-3"
                          >
                            🎯
                          </motion.div>
                        </Link>
                      </Button>
                    </motion.div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
              {/* Enhanced Key Features */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <motion.div
                        animate={{
                          rotate: [0, 5, -5, 0],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 3,
                        }}
                      >
                        <Star className="w-7 h-7 text-yellow-600" />
                      </motion.div>
                      Key Features
                    </CardTitle>
                    <p className="text-muted-foreground mt-2">
                      Unlock the superpowers that make champions
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-5 sm:gap-6 md:gap-7">
                      {features.map((feature, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{
                            duration: 0.6,
                            delay: index * 0.15,
                            type: "spring",
                            stiffness: 100,
                          }}
                          whileHover={{
                            scale: 1.02,
                            y: -2,
                            transition: { duration: 0.2 },
                          }}
                          className="group relative"
                        >
                          <div
                            className={`relative overflow-hidden rounded-2xl border-2 ${feature.borderColor} bg-gradient-to-br ${feature.color} p-5 xs:p-6 sm:p-7 md:p-8 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 touch-manipulation min-h-[140px] xs:min-h-[150px] sm:min-h-[160px] md:min-h-[170px]`}
                          >
                            {/* Background Pattern */}
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Animated Background Glow */}
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{
                                scale: [0, 1.2, 0],
                                opacity: [0, 0.3, 0],
                              }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                                delay: index * 0.5,
                              }}
                              className={`absolute inset-0 rounded-xl bg-gradient-to-r ${feature.color} blur-xl`}
                            />

                            <div className="relative flex flex-col sm:flex-row items-start gap-4 xs:gap-5 sm:gap-6">
                              {/* Enhanced Icon with Multiple Animations */}
                              <motion.div
                                whileHover={{
                                  scale: 1.2,
                                  rotate:
                                    feature.category === "speed"
                                      ? 360
                                      : feature.category === "security"
                                      ? [0, -10, 10, 0]
                                      : feature.category === "community"
                                      ? [0, 5, -5, 0]
                                      : 0,
                                  transition: {
                                    duration:
                                      feature.category === "speed" ? 0.8 : 0.4,
                                    type: "spring",
                                    stiffness: 200,
                                  },
                                }}
                                whileTap={{ scale: 0.9 }}
                                className={`relative flex items-center justify-center w-14 h-14 xs:w-16 xs:h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${feature.color} border ${feature.borderColor} shadow-lg group-hover:shadow-xl transition-all duration-300 touch-manipulation flex-shrink-0`}
                              >
                                <motion.div
                                  animate={
                                    feature.category === "speed"
                                      ? {
                                          scale: [1, 1.1, 1],
                                        }
                                      : feature.category === "security"
                                      ? {
                                          y: [0, -2, 0],
                                        }
                                      : feature.category === "community"
                                      ? {
                                          rotate: [0, 5, -5, 0],
                                        }
                                      : {
                                          scale: [1, 1.05, 1],
                                        }
                                  }
                                  transition={{
                                    duration:
                                      feature.category === "speed"
                                        ? 1.5
                                        : feature.category === "security"
                                        ? 2
                                        : feature.category === "community"
                                        ? 2.5
                                        : 2,
                                    repeat: Infinity,
                                    repeatDelay: 1,
                                  }}
                                  className={`${feature.iconColor} group-hover:scale-110 transition-transform duration-200`}
                                >
                                  {feature.icon}
                                </motion.div>

                                {/* Pulsing Ring Animation */}
                                <motion.div
                                  animate={{
                                    scale: [1, 1.4, 1],
                                    opacity: [0.5, 0, 0.5],
                                  }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: index * 0.3,
                                  }}
                                  className={`absolute inset-0 rounded-xl border-2 ${feature.borderColor}`}
                                />
                              </motion.div>

                              <div className="flex-1 min-w-0">
                                {/* Category Badge */}
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{
                                    duration: 0.4,
                                    delay: index * 0.15 + 0.2,
                                  }}
                                  className="mb-3 xs:mb-4"
                                >
                                  <span
                                    className={`inline-flex items-center px-3 xs:px-4 py-1.5 xs:py-2 rounded-full text-xs xs:text-sm font-semibold uppercase tracking-wider ${feature.bgColor} ${feature.iconColor} border ${feature.borderColor}`}
                                  >
                                    {feature.category}
                                  </span>
                                </motion.div>

                                {/* Title with Hover Effect */}
                                <motion.h4
                                  className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-3 xs:mb-4 sm:mb-5 group-hover:text-primary transition-colors duration-300 leading-tight"
                                  whileHover={{ x: 2 }}
                                >
                                  {feature.title}
                                </motion.h4>

                                {/* Description */}
                                <motion.p
                                  className="text-sm xs:text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors duration-300"
                                  initial={{ opacity: 0.8 }}
                                  whileHover={{ opacity: 1 }}
                                >
                                  {feature.description}
                                </motion.p>

                                {/* Progress Bar Animation */}
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: "100%" }}
                                  transition={{
                                    duration: 1.5,
                                    delay: index * 0.15 + 0.5,
                                    ease: "easeOut",
                                  }}
                                  className={`mt-4 h-1 bg-gradient-to-r ${feature.color} rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300`}
                                />
                              </div>
                            </div>

                            {/* Hover Shine Effect */}
                            <motion.div
                              initial={{ x: "-100%", opacity: 0 }}
                              whileHover={{
                                x: "100%",
                                opacity: [0, 0.5, 0],
                                transition: { duration: 0.6 },
                              }}
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Enhanced Call to Action with Achievement Style */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.6,
                        delay: features.length * 0.15 + 0.3,
                      }}
                      className="mt-8"
                    >
                      {/* Achievement Completion Card */}
                      <div className="relative">
                        <motion.div
                          animate={{
                            scale: [1, 1.02, 1],
                            opacity: [0.3, 0.6, 0.3],
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-600/10 rounded-2xl blur-sm"
                        />

                        <div className="relative bg-gradient-to-r from-primary/5 to-purple-600/5 border-2 border-primary/20 rounded-2xl p-6 text-center">
                          {/* Achievement Badge */}
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                              duration: 0.8,
                              delay: features.length * 0.15 + 0.5,
                              type: "spring",
                              stiffness: 150,
                            }}
                            className="mb-4"
                          >
                            <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
                              <Star className="w-6 h-6 text-white" />
                            </div>
                          </motion.div>

                          <h4 className="text-lg font-bold mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                            Features Unlocked!
                          </h4>
                          <p className="text-sm text-muted-foreground mb-6">
                            All power-ups discovered! Time to unleash them in
                            epic battle! ⚔️
                          </p>

                          {/* Progress Dots */}
                          <div className="flex justify-center gap-2 mb-6">
                            {features.map((_, index) => (
                              <motion.div
                                key={index}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                  duration: 0.3,
                                  delay:
                                    features.length * 0.15 + 0.7 + index * 0.1,
                                }}
                                className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-purple-600"
                              />
                            ))}
                          </div>

                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              size="lg"
                              asChild
                              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl transition-all duration-300 border-0 relative overflow-hidden group"
                            >
                              <Link href="/">
                                {/* Shine Effect */}
                                <motion.div
                                  initial={{ x: "-100%" }}
                                  animate={{ x: "100%" }}
                                  transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    repeatDelay: 3,
                                    ease: "easeInOut",
                                  }}
                                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                                />
                                <motion.div
                                  whileHover={{ scale: 1.1, rotate: 360 }}
                                  transition={{ duration: 0.5 }}
                                  className="mr-2"
                                >
                                  <Play className="w-4 h-4" />
                                </motion.div>
                                Experience These Features
                                <motion.div
                                  animate={{ x: [0, 4, 0] }}
                                  transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                  }}
                                  className="ml-2"
                                >
                                  ✨
                                </motion.div>
                              </Link>
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Additional Info Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Target className="w-6 h-6 text-blue-600" />
                      What is Prediction?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      PlayShib.fun Prediction is your gateway to the ultimate
                      crypto arena! Battle the markets by predicting whether
                      BONE/SHIB will soar to the moon 🚀 or dive into bear
                      territory 🐻. Every prediction is a chance to prove your
                      market mastery!
                    </p>
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                      <h4 className="font-semibold text-foreground">
                        Quick Facts:
                      </h4>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span>⚡ Lightning-fast 5-minute battles</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span>💰 Massive 95% payout to champions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span>🛡️ Fortress-level blockchain security</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span>♾️ Eternal claim window for your rewards</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Contract Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Info className="w-5 h-5 text-blue-600" />
                    Contract Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      <strong className="text-foreground">
                        Verified Contract Address:
                      </strong>
                    </p>
                    <div className="flex flex-col gap-4 sm:gap-5">
                      <code className="bg-background px-4 xs:px-5 sm:px-6 py-4 xs:py-5 sm:py-6 rounded-xl text-xs xs:text-sm sm:text-base font-mono border break-all w-full min-h-[56px] xs:min-h-[60px] sm:min-h-[64px] flex items-center justify-center text-center leading-relaxed">
                        {contractAddress}
                      </code>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={handleCopyAddress}
                          className="w-full sm:w-auto"
                          aria-live="polite"
                          aria-label="Copy contract address"
                        >
                          {copied ? "Copied!" : "Copy Address"}
                        </Button>
                        <Button
                        variant="outline"
                        size="lg"
                        asChild
                        className="w-full sm:w-auto touch-manipulation min-h-[56px] xs:min-h-[60px] sm:min-h-[64px] px-6 xs:px-7 sm:px-8 text-base xs:text-lg sm:text-xl font-semibold rounded-xl"
                      >
                        <Link
                          href={`https://puppyscan.shib.io/address/${contractAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-5 h-5 xs:w-6 xs:h-6 mr-3 xs:mr-4 flex-shrink-0" />
                          View on Explorer
                        </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Trust & Security CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-center"
            >
              <Card className="relative overflow-hidden border-2 border-blue-500/30 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-600/5">
                {/* Animated Security Icons */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                      opacity: [0.1, 0.3, 0.1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute top-6 right-6"
                  >
                    <Shield className="w-8 h-8 text-blue-500/20" />
                  </motion.div>
                  <motion.div
                    animate={{
                      y: [0, 10, 0],
                      opacity: [0.1, 0.2, 0.1],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1,
                    }}
                    className="absolute bottom-6 left-6"
                  >
                    <ExternalLink className="w-6 h-6 text-cyan-500/20" />
                  </motion.div>
                </div>

                <CardContent className="py-12 relative z-10">
                  {/* Security Badge */}
                  <motion.div
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      duration: 0.8,
                      delay: 0.8,
                      type: "spring",
                      stiffness: 150,
                    }}
                    className="mb-6"
                  >
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-2xl">
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Shield className="w-8 h-8 text-white" />
                      </motion.div>
                    </div>
                  </motion.div>

                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1 }}
                    className="text-2xl md:text-3xl font-bold mb-4 text-foreground"
                  >
                    <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      Verified & Secure
                    </span>
                  </motion.h3>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.2 }}
                    className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed"
                  >
                    Our smart contract is fully verified and transparent. Your
                    funds are secure, and every transaction is recorded on the
                    blockchain.
                  </motion.p>

                  {/* Trust Indicators */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 1.4 }}
                    className="flex justify-center items-center gap-6 mb-8"
                  >
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-3 h-3 rounded-full bg-green-500"
                      />
                      <span className="text-sm font-medium text-green-600">
                        Verified
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: 0.5,
                        }}
                        className="w-3 h-3 rounded-full bg-blue-500"
                      />
                      <span className="text-sm font-medium text-blue-600">
                        Transparent
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                        className="w-3 h-3 rounded-full bg-purple-500"
                      />
                      <span className="text-sm font-medium text-purple-600">
                        Decentralized
                      </span>
                    </div>
                  </motion.div>

                  {/* Enhanced CTA Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.6 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="lg"
                        asChild
                        className="text-lg px-10 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 shadow-xl hover:shadow-2xl transition-all duration-300 border-0 relative overflow-hidden group"
                      >
                        <Link href="/">
                          {/* Animated Security Pulse */}
                          <motion.div
                            animate={{
                              scale: [1, 1.05, 1],
                              opacity: [0, 0.2, 0],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 bg-white rounded-lg"
                          />
                          <motion.div
                            animate={{
                              rotate: [0, 360],
                              scale: [1, 1.1, 1],
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="mr-3"
                          >
                            <Shield className="w-5 h-5" />
                          </motion.div>
                          Play with Confidence
                          <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="ml-3"
                          >
                            🔒
                          </motion.div>
                        </Link>
                      </Button>
                    </motion.div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Tutorial Tab */}
          <TabsContent value="tutorial" className="space-y-8">
            {/* Achievement-Style Progress Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16 px-4 sm:px-6"
            >
              <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 xs:mb-5 sm:mb-6 md:mb-8 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent leading-tight">
                Your Path to Mastery
              </h2>
              <p className="text-base xs:text-lg sm:text-xl md:text-2xl text-muted-foreground mb-6 xs:mb-8 sm:mb-10 md:mb-12 max-w-3xl mx-auto leading-relaxed">
                Conquer these legendary quests to ascend to prediction godhood!
                🏆⚡
              </p>

              {/* Overall Progress Bar */}
              <div className="max-w-lg mx-auto">
                <div className="flex items-center justify-between mb-3 xs:mb-4">
                  <span className="text-sm xs:text-base sm:text-lg font-semibold text-muted-foreground">
                    Progress
                  </span>
                  <span className="text-sm xs:text-base sm:text-lg font-bold text-primary">
                    0 / {steps.length}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 xs:h-4 sm:h-5 md:h-6 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-primary to-purple-600 rounded-full"
                  />
                </div>
              </div>
            </motion.div>

            {/* Achievement-Style Step Cards */}
            <div className="space-y-6 xs:space-y-7 sm:space-y-8 md:space-y-10 lg:space-y-12 px-4 sm:px-6">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -50, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{
                    duration: 0.7,
                    delay: index * 0.15,
                    type: "spring",
                    stiffness: 100,
                    damping: 15,
                  }}
                  whileHover={{
                    scale: 1.02,
                    transition: { duration: 0.2 },
                  }}
                  className="group"
                >
                  <Card className="relative overflow-hidden border-2 border-muted hover:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-xl touch-manipulation rounded-2xl">
                    {/* Achievement Badge */}
                    <div className="absolute top-5 xs:top-6 sm:top-7 right-5 xs:right-6 sm:right-7 z-10">
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          duration: 0.6,
                          delay: index * 0.15 + 0.3,
                          type: "spring",
                          stiffness: 200,
                        }}
                        className="w-14 h-14 xs:w-16 xs:h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-br from-muted to-muted/50 border-2 border-muted-foreground/20 flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/10 group-hover:border-primary/30 transition-all duration-300 touch-manipulation"
                      >
                        <div className="w-7 h-7 xs:w-8 xs:h-8 sm:w-9 sm:h-9 rounded-full bg-muted-foreground/20 group-hover:bg-primary/30 transition-all duration-300" />
                      </motion.div>
                    </div>

                    {/* Background Gradient Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <CardHeader className="pb-4 xs:pb-5 sm:pb-6 md:pb-7 px-5 xs:px-6 sm:px-7 md:px-8 pt-5 xs:pt-6 sm:pt-7 md:pt-8">
                      <div className="flex items-start gap-5 xs:gap-6 sm:gap-7 md:gap-8">
                        {/* Enhanced Step Icon */}
                        <motion.div
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{
                            duration: 0.6,
                            delay: index * 0.15 + 0.2,
                            type: "spring",
                            stiffness: 150,
                          }}
                          whileHover={{
                            scale: 1.1,
                            rotate: 5,
                            transition: { duration: 0.2 },
                          }}
                          whileTap={{ scale: 0.95 }}
                          className={`relative flex items-center justify-center w-16 h-16 xs:w-18 xs:h-18 sm:w-20 sm:h-20 md:w-22 md:h-22 rounded-2xl bg-gradient-to-br shadow-lg group-hover:shadow-xl transition-all duration-300 touch-manipulation flex-shrink-0 ${
                            step.color === "text-blue-600"
                              ? "from-blue-500/20 to-blue-600/30 border border-blue-500/30"
                              : step.color === "text-green-600"
                              ? "from-green-500/20 to-green-600/30 border border-green-500/30"
                              : step.color === "text-orange-600"
                              ? "from-orange-500/20 to-orange-600/30 border border-orange-500/30"
                              : "from-purple-500/20 to-purple-600/30 border border-purple-500/30"
                          }`}
                        >
                          <div
                            className={`${step.color} group-hover:scale-110 transition-transform duration-200`}
                          >
                            <div className="w-7 h-7 xs:w-8 xs:h-8 sm:w-9 sm:h-9 md:w-10 md:h-10">
                              {step.icon}
                            </div>
                          </div>

                          {/* Animated Ring */}
                          <motion.div
                            initial={{ scale: 1, opacity: 0 }}
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0, 0.6, 0],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: index * 0.5,
                            }}
                            className="absolute inset-0 rounded-2xl border-2 border-primary/40"
                          />
                        </motion.div>

                        <div className="flex-1 min-w-0">
                          {/* Step Number, Category Badge, and Title */}
                          <div className="flex items-start gap-4 xs:gap-5 sm:gap-6 mb-4 xs:mb-5 sm:mb-6">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{
                                duration: 0.5,
                                delay: index * 0.15 + 0.4,
                                type: "spring",
                                stiffness: 200,
                              }}
                              className="flex items-center justify-center w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-r from-primary to-purple-600 text-primary-foreground text-base xs:text-lg sm:text-xl md:text-2xl font-bold shadow-lg flex-shrink-0 touch-manipulation"
                            >
                              {index + 1}
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col gap-3 xs:gap-4 mb-3 xs:mb-4">
                                <CardTitle className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold group-hover:text-primary transition-colors duration-300 leading-tight">
                                  {step.title}
                                </CardTitle>
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{
                                    duration: 0.4,
                                    delay: index * 0.15 + 0.6,
                                  }}
                                >
                                  <Badge
                                    variant="secondary"
                                    className={`text-sm xs:text-base font-semibold px-3 xs:px-4 py-2 xs:py-2.5 rounded-full ${
                                      step.color === "text-blue-600"
                                        ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                        : step.color === "text-green-600"
                                        ? "bg-green-500/10 text-green-600 border-green-500/20"
                                        : step.color === "text-orange-600"
                                        ? "bg-orange-500/10 text-orange-600 border-orange-500/20"
                                        : "bg-purple-500/10 text-purple-600 border-purple-500/20"
                                    }`}
                                  >
                                    {step.category}
                                  </Badge>
                                </motion.div>
                              </div>
                            </div>
                          </div>

                          {/* Achievement Description */}
                          <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.5,
                              delay: index * 0.15 + 0.5,
                            }}
                            className="text-muted-foreground text-base xs:text-lg sm:text-xl md:text-2xl font-medium mb-4 xs:mb-5 sm:mb-6 leading-relaxed"
                          >
                            {step.description}
                          </motion.p>

                          {/* Progress Indicator */}
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "0%" }}
                            transition={{
                              duration: 1,
                              delay: index * 0.15 + 0.7,
                            }}
                            className="h-2 bg-gradient-to-r from-primary to-purple-600 rounded-full mb-4 opacity-30"
                          />
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0 px-5 xs:px-6 sm:px-7 md:px-8 pb-5 xs:pb-6 sm:pb-7 md:pb-8">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.5,
                          delay: index * 0.15 + 0.6,
                        }}
                        className="bg-muted/30 rounded-2xl p-5 xs:p-6 sm:p-7 md:p-8 group-hover:bg-muted/50 transition-all duration-300"
                      >
                        <p className="text-muted-foreground leading-relaxed text-base xs:text-lg sm:text-xl md:text-2xl">
                          {step.details}
                        </p>

                        {/* Achievement Unlock Button */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            duration: 0.4,
                            delay: index * 0.15 + 0.8,
                          }}
                          className="mt-6 xs:mt-7 sm:mt-8"
                        >
                          <Button
                            variant="outline"
                            size="lg"
                            className="group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300 touch-manipulation min-h-[56px] xs:min-h-[60px] sm:min-h-[64px] text-base xs:text-lg px-6 xs:px-7 sm:px-8 font-semibold rounded-xl w-full sm:w-auto"
                            disabled
                          >
                            <Trophy className="w-5 h-5 xs:w-6 xs:h-6 mr-3 xs:mr-4 flex-shrink-0" />
                            Achievement Locked
                          </Button>
                        </motion.div>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Mid-Tutorial Engagement CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="text-center my-12"
            >
              <Card className="relative overflow-hidden border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/5 via-transparent to-red-600/5">
                {/* Animated Fire Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <motion.div
                    animate={{
                      y: [0, -15, 0],
                      opacity: [0.2, 0.4, 0.2],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute top-8 right-8"
                  >
                    <Zap className="w-6 h-6 text-orange-500/30" />
                  </motion.div>
                  <motion.div
                    animate={{
                      y: [0, 12, 0],
                      opacity: [0.1, 0.3, 0.1],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5,
                    }}
                    className="absolute bottom-8 left-8"
                  >
                    <Target className="w-8 h-8 text-red-500/20" />
                  </motion.div>
                </div>

                <CardContent className="py-10 relative z-10">
                  {/* Motivation Icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      duration: 0.8,
                      delay: 1.2,
                      type: "spring",
                      stiffness: 150,
                    }}
                    className="mb-6"
                  >
                    <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-xl">
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [0, 10, -10, 0],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Zap className="w-7 h-7 text-white" />
                      </motion.div>
                    </div>
                  </motion.div>

                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.4 }}
                    className="text-2xl md:text-3xl font-bold mb-4 text-foreground"
                  >
                    <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      Feeling Confident?
                    </span>
                  </motion.h3>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.6 }}
                    className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed"
                  >
                    Your warrior training is complete! Strike while the iron is
                    hot and claim your first victory! The arena awaits your
                    legendary debut! 🔥
                  </motion.p>

                  {/* Confidence Meter */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 1.8 }}
                    className="mb-8"
                  >
                    <div className="max-w-xs mx-auto">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          Confidence Level
                        </span>
                        <span className="text-sm font-bold text-orange-600">
                          High!
                        </span>
                      </div>
                      <div className="w-full bg-muted/50 rounded-full h-3 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "85%" }}
                          transition={{
                            duration: 1.5,
                            delay: 2,
                            ease: "easeOut",
                          }}
                          className="h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full relative overflow-hidden"
                        >
                          <motion.div
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{
                              duration: 1.2,
                              repeat: Infinity,
                              repeatDelay: 2,
                              ease: "easeInOut",
                            }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                          />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Quick Action CTAs */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 2 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="lg"
                        asChild
                        className="text-lg px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-xl hover:shadow-2xl transition-all duration-300 border-0 relative overflow-hidden group"
                      >
                        <Link href="/">
                          {/* Fire Animation */}
                          <motion.div
                            animate={{
                              scale: [1, 1.1, 1],
                              opacity: [0, 0.3, 0],
                            }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="absolute inset-0 bg-yellow-400 rounded-lg"
                          />
                          <motion.div
                            animate={{
                              rotate: [0, 15, -15, 0],
                              scale: [1, 1.1, 1],
                            }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="mr-3"
                          >
                            <Zap className="w-5 h-5" />
                          </motion.div>
                          Try First Prediction
                          <motion.div
                            animate={{
                              scale: [1, 1.3, 1],
                              rotate: [0, 180, 360],
                            }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="ml-3"
                          >
                            🔥
                          </motion.div>
                        </Link>
                      </Button>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="outline"
                        size="lg"
                        className="group border-2 border-orange-500/30 hover:border-orange-500/50 bg-gradient-to-r from-orange-500/5 to-red-500/5 hover:from-orange-500/10 hover:to-red-500/10 transition-all duration-300"
                      >
                        <motion.div
                          animate={{ y: [0, -2, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="mr-2"
                        >
                          📚
                        </motion.div>
                        Continue Learning
                        <motion.div
                          animate={{ x: [0, 3, 0] }}
                          transition={{ duration: 1.2, repeat: Infinity }}
                          className="ml-2"
                        >
                          →
                        </motion.div>
                      </Button>
                    </motion.div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Achievement Completion Celebration */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="text-center"
            >
              <Card className="relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-purple-600/5">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.1, 0.2, 0.1],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br from-primary to-purple-600"
                  />
                  <motion.div
                    animate={{
                      scale: [1.2, 1, 1.2],
                      opacity: [0.1, 0.15, 0.1],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1,
                    }}
                    className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-primary"
                  />
                </div>

                <CardContent className="py-16 relative z-10">
                  {/* Trophy Animation */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      duration: 0.8,
                      delay: 1.4,
                      type: "spring",
                      stiffness: 150,
                    }}
                    className="mb-8"
                  >
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl">
                      <Trophy className="w-10 h-10 text-white" />
                    </div>
                  </motion.div>

                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.6 }}
                    className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent"
                  >
                    Ready to Become a Legend?
                  </motion.h3>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.8 }}
                    className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed"
                  >
                    You&apos;ve learned the path to mastery. Now it&apos;s time
                    to put your skills to the test! Join thousands of players
                    and start your prediction journey today.
                  </motion.p>

                  {/* Achievement Stats */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 2 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-2xl mx-auto"
                  >
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary mb-1">
                        4/4
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Achievements Learned
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        ∞
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Potential Rewards
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        5min
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Per Round
                      </div>
                    </div>
                  </motion.div>

                  {/* Enhanced CTA Button with Achievement Style */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 2.2 }}
                    className="space-y-6"
                  >
                    {/* Primary CTA */}
                    <div className="relative">
                      {/* Animated Glow Effect */}
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="absolute inset-0 bg-gradient-to-r from-primary/30 to-purple-600/30 rounded-2xl blur-xl"
                      />

                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative"
                      >
                        <Button
                          size="lg"
                          asChild
                          className="text-xl px-12 py-6 bg-gradient-to-r from-primary via-primary to-purple-600 hover:from-primary/90 hover:via-primary/90 hover:to-purple-600/90 shadow-2xl hover:shadow-3xl transition-all duration-500 border-0 relative overflow-hidden group"
                        >
                          <Link href="/">
                            {/* Epic Shine Effect */}
                            <motion.div
                              initial={{ x: "-100%" }}
                              animate={{ x: "100%" }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatDelay: 4,
                                ease: "easeInOut",
                              }}
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                            />
                            <motion.div
                              animate={{
                                rotate: [0, 360],
                                scale: [1, 1.2, 1],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                              className="mr-3"
                            >
                              <Play className="w-6 h-6" />
                            </motion.div>
                            Begin Your Legend
                            {/* Epic Sparkle */}
                            <motion.div
                              animate={{
                                rotate: [0, 180, 360],
                                scale: [1, 1.3, 1],
                              }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="ml-3"
                            >
                              ⚡
                            </motion.div>
                          </Link>
                        </Button>
                      </motion.div>
                    </div>

                    {/* Secondary Achievement Unlock CTA */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: 2.4 }}
                      className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    >
                      <Button
                        variant="outline"
                        size="lg"
                        asChild
                        className="group border-2 border-yellow-500/30 hover:border-yellow-500/50 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 hover:from-yellow-500/10 hover:to-orange-500/10 transition-all duration-300"
                      >
                        <Link href="/">
                          <motion.div
                            animate={{ rotate: [0, 15, -15, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="mr-2"
                          >
                            <Trophy className="w-5 h-5 text-yellow-600" />
                          </motion.div>
                          Unlock Achievements
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="ml-2"
                          >
                            🏆
                          </motion.div>
                        </Link>
                      </Button>

                      <Button
                        variant="outline"
                        size="lg"
                        className="group border-2 border-green-500/30 hover:border-green-500/50 bg-gradient-to-r from-green-500/5 to-emerald-500/5 hover:from-green-500/10 hover:to-emerald-500/10 transition-all duration-300"
                      >
                        <motion.div
                          animate={{ y: [0, -2, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="mr-2"
                        >
                          <Users className="w-5 h-5 text-green-600" />
                        </motion.div>
                        Join Community
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 1.2, repeat: Infinity }}
                          className="ml-2"
                        >
                          🌟
                        </motion.div>
                      </Button>
                    </motion.div>
                  </motion.div>

                  {/* Floating Achievement Icons */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[Target, Coins, Timer, Trophy].map((Icon, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                          opacity: [0, 0.3, 0],
                          scale: [0, 1, 0],
                          y: [0, -20, -40],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: index * 0.5 + 2.5,
                          ease: "easeOut",
                        }}
                        className={`absolute ${
                          index === 0
                            ? "top-20 left-20"
                            : index === 1
                            ? "top-32 right-24"
                            : index === 2
                            ? "bottom-32 left-16"
                            : "bottom-20 right-20"
                        }`}
                      >
                        <Icon className="w-6 h-6 text-primary/40" />
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-8">
            {/* FAQ Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center px-4 sm:px-6 mb-8 sm:mb-10 md:mb-12"
            >
              <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 xs:mb-5 sm:mb-6 md:mb-8 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent leading-tight">
                Got Questions?
              </h2>
              <p className="text-base xs:text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Your burning questions answered by the prediction masters! Get
                ready to become unstoppable! 🧠💡
              </p>
              {/* FAQ Search */}
              <div className="max-w-xl mx-auto mt-6">
                <Input
                  placeholder="Search FAQ (e.g., payout, wallet, claim)"
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  className="bg-muted/40"
                  aria-label="Search FAQ"
                />
              </div>
            </motion.div>

            {/* FAQ Categories with search filter */}
            <div className="grid gap-8 xs:gap-9 sm:gap-10 md:gap-12 lg:gap-14 px-4 sm:px-6">
              {filteredFaqCategories.length === 0 && (
                <div className="text-center text-muted-foreground">No questions match your search.</div>
              )}
              {filteredFaqCategories.map((category, categoryIndex) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: categoryIndex * 0.15 }}
                  className="group"
                >
                  <Card className="overflow-hidden border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-lg touch-manipulation rounded-2xl">
                    {/* Category Header */}
                    <CardHeader className="pb-4 xs:pb-5 sm:pb-6 md:pb-7 px-5 xs:px-6 sm:px-7 md:px-8 pt-5 xs:pt-6 sm:pt-7 md:pt-8">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-4 xs:gap-5 sm:gap-6 md:gap-7"
                      >
                        {/* Category Icon */}
                        <motion.div
                          whileHover={{
                            scale: 1.1,
                            rotate:
                              category.id === "technical" ? [0, -5, 5, 0] : 0,
                          }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ duration: 0.3 }}
                          className={`flex items-center justify-center w-14 h-14 xs:w-16 xs:h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-2xl ${category.bgColor} ${category.borderColor} border-2 shadow-sm group-hover:shadow-md transition-all duration-300 touch-manipulation flex-shrink-0`}
                        >
                          <div className={category.color}>
                            <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-9 md:h-9">
                              {category.icon}
                            </div>
                          </div>
                        </motion.div>

                        {/* Category Title */}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 leading-tight">
                            {category.title}
                          </CardTitle>
                          <div className="flex items-center gap-3 xs:gap-3.5 mt-2 xs:mt-3">
                            <div
                              className={`w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 rounded-full ${category.bgColor.replace(
                                "/10",
                                "/60"
                              )}`}
                            />
                            <span className="text-base xs:text-lg sm:text-xl text-muted-foreground font-semibold">
                              {category.questions.length} questions
                            </span>
                          </div>
                        </div>

                        {/* Category Badge */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            duration: 0.4,
                            delay: categoryIndex * 0.15 + 0.2,
                          }}
                          className="hidden sm:block"
                        >
                          <div
                            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider ${category.bgColor} ${category.color} ${category.borderColor} border`}
                          >
                            {category.id}
                          </div>
                        </motion.div>
                      </motion.div>
                    </CardHeader>

                    {/* Questions Accordion */}
                    <CardContent className="pt-0 px-4 xs:px-5 sm:px-6 pb-4 xs:pb-5 sm:pb-6">
                      <Accordion type="single" collapsible className="w-full">
                        {category.questions.map((faq, questionIndex) => (
                          <motion.div
                            key={questionIndex}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              duration: 0.5,
                              delay:
                                categoryIndex * 0.15 +
                                questionIndex * 0.1 +
                                0.3,
                            }}
                          >
                            <AccordionItem
                              value={`${category.id}-${questionIndex}`}
                              className="border-b border-border/50 last:border-b-0 group/item"
                            >
                              <AccordionTrigger className="text-left py-4 xs:py-5 sm:py-6 px-3 xs:px-4 sm:px-5 rounded-lg hover:bg-muted/30 transition-all duration-300 group-hover/item:bg-muted/50 touch-manipulation min-h-[52px] xs:min-h-[56px] sm:min-h-[60px]">
                                <div className="flex items-start gap-3 xs:gap-4 sm:gap-5 w-full">
                                  {/* Question Number */}
                                  <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`flex items-center justify-center w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-full ${category.bgColor} ${category.borderColor} border text-sm xs:text-base sm:text-lg font-bold ${category.color} shrink-0 mt-0.5 touch-manipulation`}
                                  >
                                    {questionIndex + 1}
                                  </motion.div>

                                  {/* Question Text */}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-base xs:text-lg sm:text-xl md:text-2xl font-semibold text-foreground group-hover/item:text-primary transition-colors duration-300 text-left leading-relaxed">
                                      {faq.question}
                                    </h4>
                                  </div>
                                </div>
                              </AccordionTrigger>

                              <AccordionContent className="px-3 xs:px-4 sm:px-5 pb-5 xs:pb-6 sm:pb-7">
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="ml-8 xs:ml-10 sm:ml-12 md:ml-14 pr-4 xs:pr-6 sm:pr-8"
                                >
                                  {/* Answer Content */}
                                  <div
                                    className={`p-4 xs:p-5 sm:p-6 md:p-7 rounded-xl ${category.bgColor} border ${category.borderColor} relative overflow-hidden`}
                                  >
                                    {/* Background Pattern */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/5 opacity-50" />

                                    <p className="text-muted-foreground leading-relaxed text-sm xs:text-base sm:text-lg relative z-10">
                                      {faq.answer}
                                    </p>

                                    {/* Decorative Element */}
                                    <motion.div
                                      initial={{ scale: 0, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 0.1 }}
                                      transition={{ duration: 0.5, delay: 0.2 }}
                                      className={`absolute bottom-3 right-3 xs:bottom-4 xs:right-4 w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 ${category.color} opacity-10`}
                                    >
                                      {category.icon}
                                    </motion.div>
                                  </div>

                                  {/* Helpful Indicator */}
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.1 }}
                                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mt-5 xs:mt-6 text-sm xs:text-base text-muted-foreground"
                                  >
                                    <div className="flex items-center gap-2 xs:gap-2.5">
                                      <div
                                        className={`w-2 h-2 xs:w-2.5 xs:h-2.5 rounded-full ${category.bgColor.replace(
                                          "/10",
                                          "/60"
                                        )}`}
                                      />
                                      <span>Was this helpful?</span>
                                    </div>
                                    <div className="flex items-center gap-3 xs:gap-4">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-10 xs:h-11 px-4 xs:px-5 text-sm xs:text-base hover:bg-green-500/10 hover:text-green-600 touch-manipulation"
                                      >
                                        👍 Yes
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-10 xs:h-11 px-4 xs:px-5 text-sm xs:text-base hover:bg-red-500/10 hover:text-red-600 touch-manipulation"
                                      >
                                        👎 No
                                      </Button>
                                    </div>
                                  </motion.div>
                                </motion.div>
                              </AccordionContent>
                            </AccordionItem>
                          </motion.div>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* FAQ Footer CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-center"
            >
              <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-purple-600/5">
                <CardContent className="py-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 1 }}
                    className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-xl"
                  >
                    <HelpCircle className="w-8 h-8 text-white" />
                  </motion.div>

                  <h3 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    Still Have Questions?
                  </h3>

                  <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Still hungry for knowledge? Join our legendary community of
                    prediction warriors or dive straight into battle - the best
                    way to learn is by conquering! 🚀
                  </p>

                  {/* Enhanced Multi-CTA Section */}
                  <div className="space-y-6">
                    {/* Primary CTA with Animated Background */}
                    <div className="relative">
                      <motion.div
                        animate={{
                          scale: [1, 1.05, 1],
                          opacity: [0.4, 0.7, 0.4],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-2xl blur-lg"
                      />

                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative"
                      >
                        <Button
                          size="lg"
                          asChild
                          className="text-xl px-12 py-6 bg-gradient-to-r from-primary via-primary to-purple-600 hover:from-primary/90 hover:via-primary/90 hover:to-purple-600/90 shadow-2xl hover:shadow-3xl transition-all duration-500 border-0 relative overflow-hidden group"
                        >
                          <Link href="/">
                            {/* Animated Shine */}
                            <motion.div
                              initial={{ x: "-100%" }}
                              animate={{ x: "100%" }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatDelay: 3,
                                ease: "easeInOut",
                              }}
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12"
                            />
                            <motion.div
                              animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 360],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                              className="mr-3"
                            >
                              <Play className="w-6 h-6" />
                            </motion.div>
                            Start Playing Now
                            <motion.div
                              animate={{ x: [0, 6, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="ml-3"
                            >
                              🚀
                            </motion.div>
                          </Link>
                        </Button>
                      </motion.div>
                    </div>

                    {/* Secondary CTAs with Achievement Style */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant="outline"
                          size="lg"
                          className="group border-2 border-green-500/30 hover:border-green-500/50 bg-gradient-to-r from-green-500/5 to-emerald-500/5 hover:from-green-500/10 hover:to-emerald-500/10 transition-all duration-300 relative overflow-hidden"
                        >
                          {/* Subtle Background Animation */}
                          <motion.div
                            animate={{
                              scale: [1, 1.1, 1],
                              opacity: [0, 0.1, 0],
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute inset-0 bg-green-500 rounded-lg"
                          />

                          <motion.div
                            animate={{
                              y: [0, -2, 0],
                              rotate: [0, 5, -5, 0],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="mr-2 relative z-10"
                          >
                            <Users className="w-5 h-5 text-green-600" />
                          </motion.div>
                          <span className="relative z-10">Join Community</span>
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="ml-2 relative z-10"
                          >
                            🌟
                          </motion.div>
                        </Button>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant="outline"
                          size="lg"
                          className="group border-2 border-blue-500/30 hover:border-blue-500/50 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 hover:from-blue-500/10 hover:to-cyan-500/10 transition-all duration-300 relative overflow-hidden"
                        >
                          {/* Subtle Background Animation */}
                          <motion.div
                            animate={{
                              scale: [1, 1.1, 1],
                              opacity: [0, 0.1, 0],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              delay: 1,
                            }}
                            className="absolute inset-0 bg-blue-500 rounded-lg"
                          />

                          <motion.div
                            animate={{
                              rotate: [0, 360],
                              scale: [1, 1.1, 1],
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="mr-2 relative z-10"
                          >
                            <HelpCircle className="w-5 h-5 text-blue-600" />
                          </motion.div>
                          <span className="relative z-10">Get Help</span>
                          <motion.div
                            animate={{
                              y: [0, -3, 0],
                              opacity: [1, 0.7, 1],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="ml-2 relative z-10"
                          >
                            💡
                          </motion.div>
                        </Button>
                      </motion.div>
                    </div>

                    {/* Progress Completion Indicator */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: 1.2 }}
                      className="max-w-sm mx-auto"
                    >
                      <div className="bg-card/30 backdrop-blur-sm border border-border/30 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-muted-foreground">
                            Knowledge Complete
                          </span>
                          <span className="text-xs font-bold text-green-600">
                            100%
                          </span>
                        </div>
                        <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{
                              duration: 2,
                              delay: 1.4,
                              ease: "easeOut",
                            }}
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full relative overflow-hidden"
                          >
                            <motion.div
                              animate={{ x: ["-100%", "100%"] }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                repeatDelay: 2,
                                ease: "easeInOut",
                              }}
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                            />
                          </motion.div>
                        </div>
                        <div className="flex justify-center mt-2">
                          <span className="text-xs text-green-600 font-medium">
                            Ready to Play! 🎮
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
