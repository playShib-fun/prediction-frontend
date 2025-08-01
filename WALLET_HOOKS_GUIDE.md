# Wallet Hooks Integration Guide

This guide covers the complete wallet integration using the custom wallet hooks for your ShibPlay application.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Basic Wallet Hooks](#basic-wallet-hooks)
3. [Balance Hooks](#balance-hooks)
4. [Network Hooks](#network-hooks)
5. [Advanced Hooks](#advanced-hooks)
6. [Quick Start](#quick-start)
7. [Integration Examples](#integration-examples)
8. [Troubleshooting](#troubleshooting)

## 🎯 Overview

The wallet hooks provide comprehensive functionality for:

- **Wallet Connection**: Connect/disconnect wallets
- **Balance Management**: Get user balances for BONE and other tokens
- **Network Management**: Switch between networks (Shibarium/Puppynet)
- **Transaction History**: View user transaction history
- **Error Handling**: Comprehensive error management
- **Auto-Connect**: Automatic wallet reconnection

## 🪝 Basic Wallet Hooks

### 1. useWalletConnection

Get basic wallet connection status:

```typescript
import { useWalletConnection } from "@/hooks/use-wallet";

function WalletStatus() {
  const {
    address,
    isConnected,
    isConnecting,
    isDisconnected,
    status,
    chain,
    isConnectedToShibarium,
  } = useWalletConnection();

  if (isConnecting) return <div>Connecting...</div>;
  if (isDisconnected) return <div>Please connect your wallet</div>;

  return (
    <div>
      <p>Connected: {isConnected ? "Yes" : "No"}</p>
      <p>Address: {address}</p>
      <p>Network: {chain?.name}</p>
      <p>On Shibarium: {isConnectedToShibarium ? "Yes" : "No"}</p>
    </div>
  );
}
```

### 2. useWalletActions

Get wallet connection actions:

```typescript
import { useWalletActions } from "@/hooks/use-wallet";

function WalletActions() {
  const {
    connect,
    connectors,
    disconnect,
    switchNetwork,
    connectError,
    isConnecting,
    isDisconnecting,
  } = useWalletActions();

  const handleConnect = async (connectorId: string) => {
    const connector = connectors.find((c) => c.id === connectorId);
    if (connector) {
      await connect({ connector });
    }
  };

  return (
    <div>
      {!isConnected ? (
        <div>
          {connectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => handleConnect(connector.id)}
              disabled={isConnecting}
            >
              {isConnecting ? "Connecting..." : `Connect ${connector.name}`}
            </button>
          ))}
        </div>
      ) : (
        <button onClick={() => disconnect()} disabled={isDisconnecting}>
          {isDisconnecting ? "Disconnecting..." : "Disconnect"}
        </button>
      )}

      {connectError && <p>Error: {connectError.message}</p>}
    </div>
  );
}
```

## 💰 Balance Hooks

### 3. useBoneBalance

Get user's BONE token balance:

```typescript
import { useBoneBalance } from "@/hooks/use-wallet";

function BoneBalance() {
  const { data: balance, isLoading, error } = useBoneBalance();

  if (isLoading) return <div>Loading balance...</div>;
  if (error) return <div>Error loading balance</div>;

  return (
    <div>
      <h3>BONE Balance</h3>
      <p>
        Balance: {balance?.formatted} {balance?.symbol}
      </p>
      <p>Value: {balance?.value?.toString()}</p>
      <p>Decimals: {balance?.decimals}</p>
    </div>
  );
}
```

### 4. useNativeBalance

Get user's native token balance:

```typescript
import { useNativeBalance } from "@/hooks/use-wallet";

function NativeBalance() {
  const { data: balance, isLoading, error } = useNativeBalance();

  if (isLoading) return <div>Loading balance...</div>;
  if (error) return <div>Error loading balance</div>;

  return (
    <div>
      <h3>Native Balance</h3>
      <p>
        Balance: {balance?.formatted} {balance?.symbol}
      </p>
      <p>Value: {balance?.value?.toString()}</p>
    </div>
  );
}
```

### 5. useWalletSummary

Get comprehensive wallet summary:

```typescript
import { useWalletSummary } from "@/hooks/use-wallet";

function WalletSummary() {
  const {
    address,
    isConnected,
    isConnecting,
    chain,
    boneBalance,
    boneBalanceValue,
    nativeBalance,
    nativeBalanceValue,
    isLoading,
    isConnectedToShibarium,
  } = useWalletSummary();

  if (isConnecting) return <div>Connecting...</div>;
  if (!isConnected) return <div>Please connect your wallet</div>;

  return (
    <div>
      <h3>Wallet Summary</h3>
      <p>Address: {address}</p>
      <p>Network: {chain?.name}</p>
      <p>On Shibarium: {isConnectedToShibarium ? "Yes" : "No"}</p>

      {isLoading ? (
        <p>Loading balances...</p>
      ) : (
        <div>
          <p>BONE Balance: {boneBalance}</p>
          <p>Native Balance: {nativeBalance}</p>
        </div>
      )}
    </div>
  );
}
```

### 6. useHasSufficientBalance

Check if user has sufficient balance for transactions:

```typescript
import { useHasSufficientBalance } from "@/hooks/use-wallet";

function TransactionButton({ requiredAmount }: { requiredAmount: bigint }) {
  const {
    hasSufficientBalance,
    currentBalance,
    requiredAmount: reqAmount,
    isLoading,
  } = useHasSufficientBalance(requiredAmount);

  if (isLoading) return <button disabled>Checking balance...</button>;

  return (
    <button disabled={!hasSufficientBalance}>
      {hasSufficientBalance
        ? "Execute Transaction"
        : `Insufficient balance. Need ${reqAmount.toString()} BONE`}
    </button>
  );
}
```

## 🌐 Network Hooks

### 7. useWalletNetwork

Manage network connections:

```typescript
import { useWalletNetwork } from "@/hooks/use-wallet";
import { shibarium } from "wagmi/chains";

function NetworkManager() {
  const {
    currentChainId,
    isConnectedToShibarium,
    isConnectedToPuppynet,
    switchNetwork,
    isSwitching,
    isCorrectNetwork,
  } = useWalletNetwork();

  const handleSwitchToShibarium = () => {
    switchNetwork?.(shibarium.id);
  };

  return (
    <div>
      <h3>Network Status</h3>
      <p>Current Chain ID: {currentChainId}</p>
      <p>On Shibarium: {isConnectedToShibarium ? "Yes" : "No"}</p>
      <p>On Puppynet: {isConnectedToPuppynet ? "Yes" : "No"}</p>
      <p>Correct Network: {isCorrectNetwork ? "Yes" : "No"}</p>

      {!isConnectedToShibarium && (
        <button onClick={handleSwitchToShibarium} disabled={isSwitching}>
          {isSwitching ? "Switching..." : "Switch to Shibarium"}
        </button>
      )}
    </div>
  );
}
```

## 🔧 Advanced Hooks

### 8. useWalletStatus

Get wallet status with auto-refresh:

```typescript
import { useWalletStatus } from "@/hooks/use-wallet";

function WalletStatusMonitor() {
  const { address, isConnected, status, lastSeen, isRecentlyConnected } =
    useWalletStatus(5000); // Refresh every 5 seconds

  return (
    <div>
      <h3>Wallet Status Monitor</h3>
      <p>Status: {status}</p>
      <p>Connected: {isConnected ? "Yes" : "No"}</p>
      <p>Last Seen: {lastSeen?.toLocaleString()}</p>
      <p>Recently Connected: {isRecentlyConnected ? "Yes" : "No"}</p>
    </div>
  );
}
```

### 9. useWalletHistory

Track wallet connection history:

```typescript
import { useWalletHistory } from "@/hooks/use-wallet";

function ConnectionHistory() {
  const { connectionHistory, clearHistory, lastConnection, lastDisconnection } =
    useWalletHistory();

  return (
    <div>
      <h3>Connection History</h3>
      <button onClick={clearHistory}>Clear History</button>

      <div>
        <h4>Recent Connections</h4>
        {connectionHistory
          .filter((h) => h.action === "connect")
          .slice(-5)
          .map((connection, index) => (
            <div key={index}>
              <p>Connected at: {connection.timestamp.toLocaleString()}</p>
              <p>Address: {connection.address}</p>
            </div>
          ))}
      </div>

      <div>
        <h4>Last Connection</h4>
        {lastConnection && (
          <p>Last connected: {lastConnection.timestamp.toLocaleString()}</p>
        )}
      </div>
    </div>
  );
}
```

### 10. useWalletErrors

Handle wallet errors:

```typescript
import { useWalletErrors } from "@/hooks/use-wallet";

function ErrorHandler() {
  const { errors, addError, removeError, clearErrors, hasErrors } =
    useWalletErrors();

  const handleTestError = () => {
    addError("Test error message", "connection");
  };

  return (
    <div>
      <h3>Error Handler</h3>
      <button onClick={handleTestError}>Add Test Error</button>
      <button onClick={clearErrors}>Clear All Errors</button>

      {hasErrors && (
        <div>
          <h4>Errors ({errors.length})</h4>
          {errors.map((error) => (
            <div key={error.id} className="error">
              <p>{error.message}</p>
              <p>Type: {error.type}</p>
              <p>Time: {error.timestamp.toLocaleString()}</p>
              <button onClick={() => removeError(error.id)}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 11. useWalletAutoConnect

Auto-connect to previously used wallet:

```typescript
import { useWalletAutoConnect } from "@/hooks/use-wallet";

function AutoConnect() {
  const { hasAttemptedAutoConnect, isAutoConnecting } = useWalletAutoConnect();

  return (
    <div>
      <h3>Auto-Connect Status</h3>
      <p>
        Has attempted auto-connect: {hasAttemptedAutoConnect ? "Yes" : "No"}
      </p>
      <p>Auto-connecting: {isAutoConnecting ? "Yes" : "No"}</p>
    </div>
  );
}
```

## 🚀 Quick Start

### Basic Wallet Integration

```typescript
import { useWalletConnection, useWalletActions } from "@/hooks/use-wallet";

function WalletConnect() {
  const { isConnected, address } = useWalletConnection();
  const { connect, connectors, disconnect } = useWalletActions();

  if (isConnected) {
    return (
      <div>
        <p>Connected: {address}</p>
        <button onClick={() => disconnect()}>Disconnect</button>
      </div>
    );
  }

  return (
    <div>
      <p>Please connect your wallet</p>
      {connectors.map((connector) => (
        <button key={connector.id} onClick={() => connect({ connector })}>
          Connect {connector.name}
        </button>
      ))}
    </div>
  );
}
```

### Balance Display

```typescript
import { useWalletSummary } from "@/hooks/use-wallet";

function BalanceDisplay() {
  const { boneBalance, nativeBalance, isLoading } = useWalletSummary();

  if (isLoading) return <div>Loading balances...</div>;

  return (
    <div>
      <h3>Your Balances</h3>
      <p>BONE: {boneBalance}</p>
      <p>Native: {nativeBalance}</p>
    </div>
  );
}
```

### Network Check

```typescript
import { useWalletNetwork } from "@/hooks/use-wallet";

function NetworkCheck() {
  const { isConnectedToShibarium, switchNetwork } = useWalletNetwork();

  if (!isConnectedToShibarium) {
    return (
      <div>
        <p>Please switch to Shibarium network</p>
        <button onClick={() => switchNetwork?.(109)}>
          Switch to Shibarium
        </button>
      </div>
    );
  }

  return <p>Connected to Shibarium ✓</p>;
}
```

## 🎮 Integration Examples

### 1. Complete Wallet Component

```typescript
import {
  useWalletSummary,
  useWalletActions,
  useWalletNetwork,
} from "@/hooks/use-wallet";
import { shortenAddress } from "@/hooks/use-wallet";

function WalletComponent() {
  const { address, isConnected, boneBalance, nativeBalance, isLoading } =
    useWalletSummary();

  const { disconnect } = useWalletActions();
  const { isConnectedToShibarium, switchNetwork } = useWalletNetwork();

  if (!isConnected) {
    return <WalletConnect />;
  }

  return (
    <div className="wallet-card">
      <div className="wallet-header">
        <h3>Wallet</h3>
        <button onClick={() => disconnect()}>Disconnect</button>
      </div>

      <div className="wallet-info">
        <p>Address: {shortenAddress(address!)}</p>
        <p>Network: {isConnectedToShibarium ? "Shibarium" : "Other"}</p>
      </div>

      <div className="wallet-balances">
        {isLoading ? (
          <p>Loading balances...</p>
        ) : (
          <>
            <p>BONE: {boneBalance}</p>
            <p>Native: {nativeBalance}</p>
          </>
        )}
      </div>

      {!isConnectedToShibarium && (
        <button onClick={() => switchNetwork?.(109)}>
          Switch to Shibarium
        </button>
      )}
    </div>
  );
}
```

### 2. Transaction Button with Balance Check

```typescript
import { useHasSufficientBalance } from "@/hooks/use-wallet";

function TransactionButton({
  amount,
  onExecute,
}: {
  amount: bigint;
  onExecute: () => void;
}) {
  const { hasSufficientBalance, currentBalance, requiredAmount, isLoading } =
    useHasSufficientBalance(amount);

  const handleClick = () => {
    if (hasSufficientBalance) {
      onExecute();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!hasSufficientBalance || isLoading}
      className={!hasSufficientBalance ? "insufficient-balance" : ""}
    >
      {isLoading
        ? "Checking balance..."
        : hasSufficientBalance
        ? "Execute Transaction"
        : `Insufficient balance. Need ${requiredAmount.toString()} BONE`}
    </button>
  );
}
```

### 3. Wallet Status Bar

```typescript
import { useWalletSummary, useWalletNetwork } from "@/hooks/use-wallet";

function WalletStatusBar() {
  const { isConnected, boneBalance, isLoading } = useWalletSummary();
  const { isConnectedToShibarium } = useWalletNetwork();

  if (!isConnected) {
    return (
      <div className="status-bar disconnected">
        <span>Wallet not connected</span>
      </div>
    );
  }

  return (
    <div
      className={`status-bar ${
        isConnectedToShibarium ? "connected" : "wrong-network"
      }`}
    >
      <span>
        Network: {isConnectedToShibarium ? "Shibarium" : "Wrong Network"}
      </span>
      {!isLoading && <span>Balance: {boneBalance} BONE</span>}
    </div>
  );
}
```

## 🛠️ Troubleshooting

### Common Issues

1. **"Wallet not connected" error**

   - Check if wallet extension is installed
   - Ensure user has approved connection
   - Try refreshing the page

2. **"Wrong network" error**

   - Use `useWalletNetwork` to check current network
   - Use `switchNetwork` to switch to Shibarium
   - Check if user has approved network switch

3. **"Insufficient balance" error**

   - Use `useHasSufficientBalance` to check before transactions
   - Consider gas fees in balance calculations
   - Show helpful error messages to users

4. **"Auto-connect not working"**
   - Check if user has previously connected
   - Ensure wallet extension is unlocked
   - Check browser permissions

### Debug Mode

```typescript
import { useWalletConnection, useWalletSummary } from "@/hooks/use-wallet";

function DebugWallet() {
  const connection = useWalletConnection();
  const summary = useWalletSummary();

  console.log("Wallet Debug Info:", {
    connection,
    summary,
    timestamp: new Date().toISOString(),
  });

  return (
    <div>
      <h3>Debug Info (check console)</h3>
      <pre>{JSON.stringify({ connection, summary }, null, 2)}</pre>
    </div>
  );
}
```

## 📚 API Reference

### Available Hooks

- `useWalletConnection()` - Basic connection status
- `useWalletActions()` - Connect/disconnect actions
- `useBoneBalance(address?)` - BONE token balance
- `useNativeBalance(address?)` - Native token balance
- `useWalletSummary()` - Comprehensive wallet info
- `useHasSufficientBalance(amount, tokenAddress?)` - Balance check
- `useWalletNetwork()` - Network management (Wagmi v2 compatible)
- `useWalletStatus(refreshInterval?)` - Status with auto-refresh
- `useWalletHistory()` - Connection history
- `useWalletErrors()` - Error handling
- `useWalletAutoConnect()` - Auto-connect functionality

### Utility Functions

- `formatBalance(balance, decimals)` - Format balance for display
- `parseBalance(balance, decimals)` - Parse string to bigint
- `shortenAddress(address, chars)` - Shorten address for display
- `isValidAddress(address)` - Validate address format

This integration provides a complete, production-ready solution for wallet management in your ShibPlay application!
