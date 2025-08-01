"use client";

import { motion } from "motion/react";
import { TextAnimate } from "@/components/magicui/text-animate";
import { ShineBorder } from "@/components/magicui/shine-border";
import { AuroraText } from "@/components/magicui/aurora-text";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowUp,
  ArrowDown,
  Clock,
  Trophy,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Play,
  Target,
  Zap,
  Star,
  CheckCircle,
  XCircle,
  Info,
  ExternalLink,
  ChevronRight,
  Timer,
  Coins,
  Award,
  Shield,
  Users,
  BarChart3,
  Calculator,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";

const steps = [
  {
    icon: <Target className="w-6 h-6" />,
    title: "Choose Your Prediction",
    description: "Decide if BONE price will go UP or DOWN",
    details:
      "Look at the current market conditions and make your prediction. You can choose UP (higher) or DOWN (lower) based on your analysis or intuition.",
    color: "from-blue-500 to-purple-500",
  },
  {
    icon: <Coins className="w-6 h-6" />,
    title: "Set Your Bet Amount",
    description: "Choose how much BONE to wager",
    details:
      "Enter the amount you want to bet. You can use quick select buttons (25%, 50%, 75%, 100%) or type a custom amount.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: <Timer className="w-6 h-6" />,
    title: "Wait for Live Phase",
    description: "Round goes live for 5 minutes",
    details:
      "Once you place your bet, wait for the round to go LIVE. During this 5-minute phase, the price will fluctuate and determine the final result.",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: <Trophy className="w-6 h-6" />,
    title: "Collect Your Winnings",
    description: "Claim rewards if you predicted correctly",
    details:
      "If your prediction was correct, you'll see a 'Claim Rewards' button. Click it to collect your winnings directly to your wallet.",
    color: "from-purple-500 to-pink-500",
  },
];

const features = [
  {
    icon: <Zap className="w-8 h-8" />,
    title: "Instant Results",
    description: "Get your results within seconds after the round ends",
    color: "from-yellow-400 to-orange-500",
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Decentralized",
    description: "Built on blockchain for transparency and fairness",
    color: "from-blue-400 to-cyan-500",
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Community Driven",
    description: "Join thousands of players worldwide",
    color: "from-green-400 to-emerald-500",
  },
  {
    icon: <BarChart3 className="w-8 h-8" />,
    title: "Real-time Odds",
    description: "Dynamic odds that update based on betting activity",
    color: "from-purple-400 to-pink-500",
  },
];

const faqs = [
  {
    question: "How is the payout calculated?",
    answer:
      "Payout Ratio = Total Pool Value ÷ Your Side Pool Value. Your winnings = (Your Bet × Payout Ratio) × (1 - 5% Treasury Fee). For example, if you bet 2 BONE and the payout ratio is 10x, you'd win 19 BONE (2 × 10 × 0.95).",
  },
  {
    question: "Can I change my prediction after placing it?",
    answer:
      "No, once you confirm your prediction, it's locked in. Make sure you're confident in your choice before confirming the transaction.",
  },
  {
    question: "What happens if the price stays the same?",
    answer:
      "If the final price equals the locked price, the round is considered a tie and all bets are returned to players (minus the treasury fee).",
  },
  {
    question: "How long do I have to claim my winnings?",
    answer:
      "There's no time limit to claim your winnings. You can claim them at any time in the future.",
  },
  {
    question: "What are the fees?",
    answer:
      "There's a 5% treasury fee on all winnings. This fee goes to support the platform's development and maintenance.",
  },
  {
    question: "Can I participate without connecting a wallet?",
    answer:
      "No, you need to connect your wallet to participate. This ensures secure transactions and allows you to claim your winnings directly to your wallet.",
  },
];

export default function HowToPlay() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20" />
        <div className="relative z-10 container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <AuroraText className="text-6xl md:text-8xl font-bold mb-6">
              How to Play
            </AuroraText>
            <TextAnimate
              animation="slideUp"
              by="word"
              className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto"
            >
              Master the art of price prediction and earn rewards with
              PlayShib.fun
            </TextAnimate>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge
                variant="secondary"
                className="text-lg px-4 py-2 bg-green-500/20 text-green-400 border-green-500/30"
              >
                <Play className="w-4 h-4 mr-2" />
                Simple & Fun
              </Badge>
              <Badge
                variant="secondary"
                className="text-lg px-4 py-2 bg-blue-500/20 text-blue-400 border-blue-500/30"
              >
                <Zap className="w-4 h-4 mr-2" />
                Instant Rewards
              </Badge>
              <Badge
                variant="secondary"
                className="text-lg px-4 py-2 bg-purple-500/20 text-purple-400 border-purple-500/30"
              >
                <Shield className="w-4 h-4 mr-2" />
                Decentralized
              </Badge>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="tutorial"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500"
            >
              Step-by-Step
            </TabsTrigger>
            <TabsTrigger
              value="faq"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500"
            >
              FAQ
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-8">
            <div className="grid md:grid-cols-1 gap-8">
              {/* What is Prediction */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <ShineBorder className="rounded-2xl">
                  <Card className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border-gray-800 h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-2xl">
                        <Target className="w-8 h-8 text-blue-400" />
                        What is Prediction?
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-300 leading-relaxed">
                        PlayShib.fun Prediction is a decentralized prediction
                        market where you can bet on whether the BONE/SHIB price
                        will rise or fall.
                      </p>
                      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-4 border border-blue-500/20">
                        <h4 className="font-semibold text-blue-400 mb-2">
                          How it works:
                        </h4>
                        <ul className="space-y-2 text-sm text-gray-300">
                          <li className="flex items-start gap-2">
                            <ArrowUp className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span>
                              Predict UP: Win if final price &gt; locked price
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <ArrowDown className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                            <span>
                              Predict DOWN: Win if final price &lt; locked price
                            </span>
                          </li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </ShineBorder>
              </motion.div>

              {/* Key Features */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="w-full"
              >
                <Card className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border-gray-800 h-full w-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <Star className="w-8 h-8 text-yellow-400" />
                      Key Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {features.map((feature, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="text-center p-4 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300"
                        >
                          <div
                            className={`inline-flex p-3 rounded-full bg-gradient-to-r ${feature.color} mb-3`}
                          >
                            {feature.icon}
                          </div>
                          <h4 className="font-semibold text-white mb-1">
                            {feature.title}
                          </h4>
                          <p className="text-sm text-gray-400">
                            {feature.description}
                          </p>
                        </motion.div>
                      ))}
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
              className="mt-8"
            >
              <Card className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <Info className="w-6 h-6 text-blue-400" />
                    Contract Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-4 border border-blue-500/20">
                    <p className="text-gray-300 mb-3">
                      <strong>Verified Contract Address:</strong>
                    </p>
                    <div className="flex items-center gap-3">
                      <code className="bg-gray-800/50 px-3 py-2 rounded-lg text-green-400 font-mono text-sm">
                        0xEfC9743D7e1b84D413647385EC9Ff42Cd9b10119
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                      >
                        <Link
                          href="https://puppyscan.shib.io/address/0xEfC9743D7e1b84D413647385EC9Ff42Cd9b10119"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View on Explorer
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Tutorial Tab */}
          <TabsContent value="tutorial" className="mt-8">
            <div className="space-y-8">
              {/* Step-by-Step Guide */}
              <div className="grid gap-6">
                {steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                  >
                    <ShineBorder className="rounded-2xl">
                      <Card className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border-gray-800">
                        <CardHeader>
                          <div className="flex items-center gap-4">
                            <div
                              className={`flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r ${step.color} text-white font-bold text-xl`}
                            >
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <CardTitle className="flex items-center gap-3 text-xl">
                                <div
                                  className={`p-2 rounded-lg bg-gradient-to-r ${step.color}`}
                                >
                                  {step.icon}
                                </div>
                                {step.title}
                              </CardTitle>
                              <p className="text-gray-400 mt-2">
                                {step.description}
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-300 leading-relaxed">
                            {step.details}
                          </p>
                        </CardContent>
                      </Card>
                    </ShineBorder>
                  </motion.div>
                ))}
              </div>

              {/* Quick Start CTA */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="text-center"
              >
                <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl border-green-500/20">
                  <CardContent className="py-8">
                    <h3 className="text-2xl font-bold text-green-400 mb-4">
                      Ready to Start Predicting?
                    </h3>
                    <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                      Join thousands of players and test your market prediction
                      skills. Start with small amounts and learn as you play!
                    </p>
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold px-8 py-3"
                      asChild
                    >
                      <Link href="/">
                        <Play className="w-5 h-5 mr-2" />
                        Start Playing Now
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <HelpCircle className="w-8 h-8 text-purple-400" />
                    Frequently Asked Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                      <AccordionItem
                        key={index}
                        value={`item-${index}`}
                        className="border-gray-700"
                      >
                        <AccordionTrigger className="text-left hover:text-purple-400 transition-colors">
                          <span className="text-gray-200">{faq.question}</span>
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-300 leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
