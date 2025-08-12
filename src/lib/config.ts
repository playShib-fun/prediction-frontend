"use client";

import { http, createStorage, cookieStorage } from "wagmi";
import { shibarium } from "wagmi/chains";
import { Chain, getDefaultConfig } from "@rainbow-me/rainbowkit";

const projectId = "1fea2755b6ac1d0b0c832d533ded4c18";

const puppynet = {
  id: 157,
  name: "Puppynet",
  network: "puppynet",
  nativeCurrency: {
    name: "BONE",
    symbol: "BONE",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://puppynet-internal-hfkwce0y8rsqx2zqruxx.shibrpc.com"],
    },
    public: {
      http: ["https://puppynet-internal-hfkwce0y8rsqx2zqruxx.shibrpc.com"],
    },
  },
  blockExplorers: {
    default: { name: "Puppyscan", url: "https://puppyscan.shib.io" },
  },
  testnet: true,
} as const;

const supportedChains: Chain[] = [shibarium, puppynet];

// Ensure a single Wagmi/RainbowKit config instance across HMR to avoid
// reinitializing WalletConnect Core multiple times.
declare global {
  // eslint-disable-next-line no-var
  var __shibplay_wagmi_config: ReturnType<typeof getDefaultConfig> | undefined;
}

export const config =
  globalThis.__shibplay_wagmi_config ||
  (globalThis.__shibplay_wagmi_config = getDefaultConfig({
    appName: "ShibPlay",
    projectId,
    chains: supportedChains as any,
    ssr: true,
    storage: createStorage({
      storage: cookieStorage,
    }),
    transports: supportedChains.reduce(
      (obj, chain) => ({ ...obj, [chain.id]: http() }),
      {}
    ),
  }));
