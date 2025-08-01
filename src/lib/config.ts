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
    default: { http: ["https://puppynet.shibrpc.com"] },
    public: { http: ["https://puppynet.shibrpc.com"] },
  },
  blockExplorers: {
    default: { name: "Puppyscan", url: "https://puppyscan.shib.io" },
  },
  testnet: true,
} as const;

const supportedChains: Chain[] = [shibarium, puppynet];

export const config = getDefaultConfig({
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
});
