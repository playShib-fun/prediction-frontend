"use client";

import { cookieToInitialState, WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@rainbow-me/rainbowkit/styles.css";

import { config } from "@/lib/config";
import { DynamicIslandProvider } from "@/components/ui/dynamic-island";
import { StarsBackground } from "@/components/shibplay/stars-background";

// Ensure a singleton QueryClient to prevent multiple listeners during HMR
declare global {
  var __shibplay_query_client: QueryClient | undefined;
}

const queryClient =
  globalThis.__shibplay_query_client ||
  (globalThis.__shibplay_query_client = new QueryClient());

type Props = {
  children: React.ReactNode;
  cookie: string | null;
};

export default function Providers({ children, cookie }: Props) {
  const initialState = cookieToInitialState(config, cookie);

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#f08800",
            accentColorForeground: "white",
            borderRadius: "large",
            fontStack: "system",
            overlayBlur: "small",
          })}
          modalSize="compact"
          coolMode
        >
          <DynamicIslandProvider initialSize={"default"}>
            <StarsBackground className="size-full">{children}</StarsBackground>
          </DynamicIslandProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
