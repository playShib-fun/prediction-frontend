import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "History",
  description:
    "View your ShibPlay round history: bets, outcomes, and claim status.",
};

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
