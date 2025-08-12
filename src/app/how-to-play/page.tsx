"use client";

import { motion } from "motion/react";
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
  ArrowUp,
  ArrowDown,
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

const steps = [
  {
    icon: <Target className="w-5 h-5" />,
    title: "Choose Your Predictions",
    description: "Decide if BONE price will go UP or DOWN",
    details:
      "Look at the current market conditions and make your prediction. You can choose UP (higher) or DOWN (lower) based on your analysis or intuition.",
    color: "text-blue-600",
  },
  {
    icon: <Coins className="w-5 h-5" />,
    title: "Set Your Bet Amount",
    description: "Choose how much BONE to wager",
    details:
      "Enter the amount you want to bet. You can use quick select buttons (25%, 50%, 75%, 100%) or type a custom amount.",
    color: "text-green-600",
  },
  {
    icon: <Timer className="w-5 h-5" />,
    title: "Wait for Live Phase",
    description: "Round goes live for 5 minutes",
    details:
      "Once you place your bet, wait for the round to go LIVE. During this 5-minute phase, the price will fluctuate and determine the final result.",
    color: "text-orange-600",
  },
  {
    icon: <Trophy className="w-5 h-5" />,
    title: "Collect Your Winnings",
    description: "Claim rewards if you predicted correctly",
    details:
      "If your prediction was correct, you'll see a 'Claim Rewards' button. Click it to collect your winnings directly to your wallet.",
    color: "text-purple-600",
  },
];

const features = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Instant Results",
    description: "Get your results within seconds after the round ends",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Decentralized",
    description: "Built on blockchain for transparency and fairness",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Community Driven",
    description: "Join thousands of players worldwide",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Real-time Odds",
    description: "Dynamic odds that update based on betting activity",
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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <TextAnimate
            animation="slideUp"
            by="word"
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            How to Play
          </TextAnimate>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Master the art of price prediction and earn rewards with
            PlayShib.fun
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <Play className="w-3 h-3 mr-1" />
              Simple & Fun
            </Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <Zap className="w-3 h-3 mr-1" />
              Instant Rewards
            </Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <Shield className="w-3 h-3 mr-1" />
              Decentralized
            </Badge>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16">
        <Tabs defaultValue="overview" className="w-full max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tutorial">Step-by-Step</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* What is Prediction */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
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
                      PlayShib.fun Prediction is a decentralized prediction
                      market where you can bet on whether the BONE/SHIB price
                      will rise or fall.
                    </p>
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                      <h4 className="font-semibold text-foreground">
                        How it works:
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100">
                            <ArrowUp className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-sm">
                            Predict UP: Win if final price &gt; locked price
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100">
                            <ArrowDown className="w-3 h-3 text-red-600" />
                          </div>
                          <span className="text-sm">
                            Predict DOWN: Win if final price &lt; locked price
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Key Features */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Star className="w-6 h-6 text-yellow-600" />
                      Key Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                      {features.map((feature, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
                            {feature.icon}
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">
                              {feature.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {feature.description}
                            </p>
                          </div>
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
                    <div className="flex items-center gap-3 flex-wrap">
                      <code className="bg-background px-3 py-2 rounded-md text-sm font-mono border">
                        0xEfC9743D7e1b84D413647385EC9Ff42Cd9b10119
                      </code>
                      <Button variant="outline" size="sm" asChild>
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
          <TabsContent value="tutorial" className="space-y-8">
            {/* Step-by-Step Guide */}
            <div className="space-y-6">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-full bg-muted ${step.color}`}
                        >
                          {step.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                              {index + 1}
                            </div>
                            <CardTitle className="text-xl">
                              {step.title}
                            </CardTitle>
                          </div>
                          <p className="text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {step.details}
                      </p>
                    </CardContent>
                  </Card>
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
              <Card className="border-primary/20">
                <CardContent className="py-12">
                  <h3 className="text-2xl font-bold mb-4">
                    Ready to Start Predicting?
                  </h3>
                  <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Join thousands of players and test your market prediction
                    skills. Start with small amounts and learn as you play!
                  </p>
                  <Button size="lg" asChild>
                    <Link href="/">
                      <Play className="w-5 h-5 mr-2" />
                      Start Playing Now
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <HelpCircle className="w-6 h-6 text-purple-600" />
                    Frequently Asked Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed">
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
