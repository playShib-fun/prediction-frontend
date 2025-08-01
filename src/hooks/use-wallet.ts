import {
  useAccount,
  useBalance,
  useConnect,
  useDisconnect,
  useChainId,
  useSwitchChain,
} from "wagmi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { shibarium } from "wagmi/chains";

// Query Keys
export const walletQueryKeys = {
  all: ["wallet"] as const,
  balance: (address: string) =>
    [...walletQueryKeys.all, "balance", address] as const,
  balances: (address: string) =>
    [...walletQueryKeys.all, "balances", address] as const,
  transactions: (address: string) =>
    [...walletQueryKeys.all, "transactions", address] as const,
  gasEstimate: () => [...walletQueryKeys.all, "gasEstimate"] as const,
};

// Basic Wallet Hooks

/**
 * Hook to get wallet connection status and account info
 */
export const useWalletConnection = () => {
  const { address, isConnected, isConnecting, isDisconnected, status } =
    useAccount();
  const chainId = useChainId();

  return {
    address,
    isConnected,
    isConnecting,
    isDisconnected,
    status,
    chainId,
    isConnectedToShibarium: chainId === shibarium.id,
  };
};

/**
 * Hook to get wallet connection actions
 */
export const useWalletActions = () => {
  const {
    connect,
    connectors,
    error: connectError,
    isPending: isConnecting,
  } = useConnect();
  const { disconnect, isPending: isDisconnecting } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  return {
    connect,
    connectors,
    disconnect,
    switchNetwork: switchChain,
    connectError,
    isConnecting,
    isDisconnecting,
    isSwitching,
  };
};

/**
 * Hook to get user's BONE balance
 */
export const useBoneBalance = (address?: `0x${string}`) => {
  const { address: connectedAddress } = useAccount();
  const targetAddress = address || connectedAddress;

  return useBalance({
    address: targetAddress,
  });
};

/**
 * Hook to get user's native token balance (BONE on Shibarium)
 */
export const useNativeBalance = (address?: `0x${string}`) => {
  const { address: connectedAddress } = useAccount();
  const targetAddress = address || connectedAddress;

  return useBalance({
    address: targetAddress,
  });
};

/**
 * Hook to get multiple token balances
 */
export const useTokenBalances = (
  address?: string,
  tokenAddresses?: string[]
) => {
  const { address: connectedAddress } = useAccount();
  const targetAddress = address || connectedAddress;

  return useQuery({
    queryKey: walletQueryKeys.balances(targetAddress || ""),
    queryFn: async () => {
      if (!targetAddress) return [];

      const balances = await Promise.all(
        (tokenAddresses || []).map(async (tokenAddress) => {
          try {
            const response = await fetch(
              `/api/balance?address=${targetAddress}&token=${tokenAddress}`
            );
            const data = await response.json();
            return {
              tokenAddress,
              balance: data.balance,
              decimals: data.decimals,
              symbol: data.symbol,
            };
          } catch (error) {
            console.error(`Error fetching balance for ${tokenAddress}:`, error);
            return {
              tokenAddress,
              balance: "0",
              decimals: 18,
              symbol: "UNKNOWN",
            };
          }
        })
      );

      return balances;
    },
    enabled: !!targetAddress && !!tokenAddresses?.length,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

/**
 * Hook to get wallet summary (connection status + balances)
 */
export const useWalletSummary = () => {
  const {
    address,
    isConnected,
    isConnecting,
    chainId,
    isConnectedToShibarium,
  } = useWalletConnection();
  const { data: boneBalance, isLoading: isBalanceLoading } = useBoneBalance();
  const { data: nativeBalance, isLoading: isNativeLoading } =
    useNativeBalance();

  return {
    address,
    isConnected,
    isConnecting,
    chainId,
    boneBalance: boneBalance?.formatted,
    boneBalanceValue: boneBalance?.value,
    nativeBalance: nativeBalance?.formatted,
    nativeBalanceValue: nativeBalance?.value,
    isLoading: isBalanceLoading || isNativeLoading,
    isConnectedToShibarium,
  };
};

/**
 * Hook to check if user has sufficient balance for a transaction
 */
export const useHasSufficientBalance = (
  requiredAmount: bigint,
  tokenAddress?: string
) => {
  const { address } = useAccount();

  const balanceQuery = tokenAddress
    ? useBoneBalance(address) // For specific token
    : useNativeBalance(address); // For native token

  const hasSufficientBalance = balanceQuery.data?.value
    ? balanceQuery.data.value >= requiredAmount
    : false;

  return {
    hasSufficientBalance,
    currentBalance: balanceQuery.data?.value || BigInt(0),
    requiredAmount,
    isLoading: balanceQuery.isLoading,
    error: balanceQuery.error,
  };
};

/**
 * Hook to get wallet connection status with auto-refresh
 */
export const useWalletStatus = (refreshInterval = 5000) => {
  const { address, isConnected, status } = useWalletConnection();
  const [lastSeen, setLastSeen] = useState<Date | null>(null);

  useEffect(() => {
    if (isConnected && address) {
      setLastSeen(new Date());
    }
  }, [isConnected, address]);

  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      // This will trigger a re-render and check connection status
      setLastSeen(new Date());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [isConnected, refreshInterval]);

  return {
    address,
    isConnected,
    status,
    lastSeen,
    isRecentlyConnected: lastSeen && Date.now() - lastSeen.getTime() < 60000, // Within last minute
  };
};

/**
 * Hook to get wallet connection history
 */
export const useWalletHistory = () => {
  const [connectionHistory, setConnectionHistory] = useState<
    Array<{
      timestamp: Date;
      action: "connect" | "disconnect";
      address?: string;
    }>
  >([]);

  const { address, isConnected } = useWalletConnection();

  useEffect(() => {
    if (isConnected && address) {
      setConnectionHistory((prev) => [
        ...prev,
        {
          timestamp: new Date(),
          action: "connect",
          address,
        },
      ]);
    } else if (!isConnected) {
      setConnectionHistory((prev) => [
        ...prev,
        {
          timestamp: new Date(),
          action: "disconnect",
        },
      ]);
    }
  }, [isConnected, address]);

  return {
    connectionHistory,
    clearHistory: () => setConnectionHistory([]),
    lastConnection: connectionHistory.find((h) => h.action === "connect"),
    lastDisconnection: connectionHistory.find((h) => h.action === "disconnect"),
  };
};

/**
 * Hook to get wallet permissions and capabilities
 */
export const useWalletPermissions = () => {
  const { address, isConnected } = useWalletConnection();
  const [permissions, setPermissions] = useState<{
    canSign: boolean;
    canSignTypedData: boolean;
    canEncrypt: boolean;
    canDecrypt: boolean;
  }>({
    canSign: false,
    canSignTypedData: false,
    canEncrypt: false,
    canDecrypt: false,
  });

  useEffect(() => {
    if (!isConnected || !address) {
      setPermissions({
        canSign: false,
        canSignTypedData: false,
        canEncrypt: false,
        canDecrypt: false,
      });
      return;
    }

    // Test wallet capabilities
    const testCapabilities = async () => {
      try {
        // Test basic signing
        const testMessage = "Test message for capability check";
        const testSignature = await window.ethereum?.request({
          method: "personal_sign",
          params: [testMessage, address],
        });

        setPermissions((prev) => ({
          ...prev,
          canSign: !!testSignature,
        }));
      } catch (error) {
        console.log("Wallet capability test failed:", error);
      }
    };

    testCapabilities();
  }, [isConnected, address]);

  return permissions;
};

/**
 * Hook to get wallet network information
 */
export const useWalletNetwork = () => {
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const isConnectedToShibarium = chainId === shibarium.id;
  const isConnectedToPuppynet = chainId === 157; // Puppynet chain ID

  return {
    currentChainId: chainId,
    isConnectedToShibarium,
    isConnectedToPuppynet,
    switchNetwork: switchChain,
    isSwitching,
    isCorrectNetwork: isConnectedToShibarium || isConnectedToPuppynet,
  };
};

/**
 * Hook to get wallet transaction history
 */
export const useTransactionHistory = (address?: string, limit = 10) => {
  const { address: connectedAddress } = useAccount();
  const targetAddress = address || connectedAddress;

  return useQuery({
    queryKey: walletQueryKeys.transactions(targetAddress || ""),
    queryFn: async () => {
      if (!targetAddress) return [];

      try {
        // This would typically call your backend API or blockchain explorer
        const response = await fetch(
          `/api/transactions?address=${targetAddress}&limit=${limit}`
        );
        const data = await response.json();
        return data.transactions || [];
      } catch (error) {
        console.error("Error fetching transaction history:", error);
        return [];
      }
    },
    enabled: !!targetAddress,
    refetchInterval: 60000, // Refetch every minute
  });
};

/**
 * Hook to get wallet gas estimation
 */
export const useGasEstimate = (transaction?: {
  to: string;
  value: bigint;
  data?: string;
}) => {
  return useQuery({
    queryKey: walletQueryKeys.gasEstimate(),
    queryFn: async () => {
      if (!transaction) return null;

      try {
        const gasEstimate = await window.ethereum?.request({
          method: "eth_estimateGas",
          params: [
            {
              to: transaction.to,
              value: transaction.value.toString(16),
              data: transaction.data || "0x",
            },
          ],
        });

        return {
          gasLimit: BigInt(gasEstimate || "0"),
          gasPrice: await window.ethereum?.request({
            method: "eth_gasPrice",
          }),
        };
      } catch (error) {
        console.error("Error estimating gas:", error);
        return null;
      }
    },
    enabled: !!transaction,
  });
};

/**
 * Hook to get wallet connection modal state
 */
export const useWalletModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isConnected } = useWalletConnection();

  useEffect(() => {
    if (isConnected) {
      setIsOpen(false);
    }
  }, [isConnected]);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(!isOpen),
  };
};

/**
 * Hook to get wallet error handling
 */
export const useWalletErrors = () => {
  const [errors, setErrors] = useState<
    Array<{
      id: string;
      message: string;
      timestamp: Date;
      type: "connection" | "transaction" | "network" | "balance";
    }>
  >([]);

  const addError = (
    message: string,
    type: "connection" | "transaction" | "network" | "balance"
  ) => {
    const error = {
      id: Date.now().toString(),
      message,
      timestamp: new Date(),
      type,
    };
    setErrors((prev) => [...prev, error]);
  };

  const removeError = (id: string) => {
    setErrors((prev) => prev.filter((error) => error.id !== id));
  };

  const clearErrors = () => {
    setErrors([]);
  };

  return {
    errors,
    addError,
    removeError,
    clearErrors,
    hasErrors: errors.length > 0,
  };
};

/**
 * Hook to get wallet auto-connect functionality
 */
export const useWalletAutoConnect = () => {
  const { isConnected, isConnecting } = useWalletConnection();
  const { connect, connectors } = useWalletActions();
  const [hasAttemptedAutoConnect, setHasAttemptedAutoConnect] = useState(false);

  useEffect(() => {
    if (hasAttemptedAutoConnect || isConnected || isConnecting) return;

    const attemptAutoConnect = async () => {
      setHasAttemptedAutoConnect(true);

      // Try to connect to the last used connector
      const lastUsedConnector = localStorage.getItem("lastUsedConnector");
      if (lastUsedConnector) {
        const connector = connectors.find((c) => c.id === lastUsedConnector);
        if (connector) {
          try {
            await connect({ connector });
          } catch (error) {
            console.log("Auto-connect failed:", error);
          }
        }
      }
    };

    attemptAutoConnect();
  }, [isConnected, isConnecting, hasAttemptedAutoConnect, connect, connectors]);

  return {
    hasAttemptedAutoConnect,
    isAutoConnecting: !hasAttemptedAutoConnect && isConnecting,
  };
};

// Utility functions
export const formatBalance = (
  balance: bigint,
  decimals: number = 18
): string => {
  return (Number(balance) / Math.pow(10, decimals)).toFixed(6);
};

export const parseBalance = (
  balance: string,
  decimals: number = 18
): bigint => {
  return BigInt(Math.floor(Number(balance) * Math.pow(10, decimals)));
};

export const shortenAddress = (address: string, chars = 4): string => {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

export const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};
