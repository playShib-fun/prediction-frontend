---
inclusion: always
---

# Web3 Integration Guidelines

## Wagmi v2 Best Practices
- Always use the latest Wagmi v2 hooks and patterns
- Prefer `useReadContract` over deprecated `useContractRead`
- Use `useWriteContract` with `useWaitForTransactionReceipt` for transactions
- Handle connection states properly with `useAccount` and `useConnect`
- Use `useChainId` and `useSwitchChain` for network management

## Contract Integration Patterns
```typescript
// Reading contract data
const { data, isLoading, error } = useReadContract({
  ...contractConfig,
  functionName: 'functionName',
  args: [arg1, arg2],
});

// Writing to contracts
const { writeContract, data: hash, isPending } = useWriteContract();
const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
  hash,
});

const handleTransaction = () => {
  writeContract({
    ...contractConfig,
    functionName: 'functionName',
    args: [arg1, arg2],
    value: BigInt('1000000000000000000'), // 1 ETH in wei
  });
};
```

## Smart Contract Standards
- **Prediction Contract**: `0x4ACB55Cea2a25FEF18460a41fC7bB5dF2d2cd7bc`
- **Bone Price Oracle**: `0x1E58C1d2b48bdD02a8512dFa4484De8bF983E448`
- Always use contract addresses as constants
- Store ABIs in `src/abis/` directory as JSON files
- Create contract config objects for reusability

## Network Configuration
- **Primary Network**: Shibarium (Chain ID: 109)
- **Test Network**: Puppynet for development
- Always check network connection before contract interactions
- Provide clear network switching prompts to users
- Handle network-specific contract addresses

## Transaction Handling
- Always show loading states during transactions
- Display transaction hashes to users
- Handle transaction failures gracefully
- Implement proper gas estimation
- Use BigInt for all numeric contract values
- Convert wei to readable formats for display

## Wallet Integration
- Support multiple wallet providers via RainbowKit
- Handle wallet connection/disconnection states
- Check wallet balance before transactions
- Provide clear wallet connection prompts
- Store wallet preferences in localStorage

## Error Handling Patterns
```typescript
// Contract read error handling
if (error) {
  console.error('Contract read error:', error);
  return <div>Error loading data: {error.message}</div>;
}

// Transaction error handling
const handleError = (error: Error) => {
  if (error.message.includes('User rejected')) {
    toast.error('Transaction cancelled by user');
  } else if (error.message.includes('insufficient funds')) {
    toast.error('Insufficient balance for transaction');
  } else {
    toast.error('Transaction failed: ' + error.message);
  }
};
```

## Data Formatting
- Use 8 decimals for BONE price formatting
- Convert BigInt values to numbers for display
- Format timestamps to readable dates
- Use proper currency formatting for prices
- Handle null/undefined contract responses