---
inclusion: fileMatch
fileMatchPattern: '*wallet*|*web3*|*contract*|*prediction*|*bone*'
---

# Web3 Integration Patterns

## Wallet Connection Standards
Use consistent patterns for wallet integration:

```typescript
interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: number | null;
  error: string | null;
}

const useWallet = () => {
  const [state, setState] = useState<WalletState>({
    address: null,
    isConnected: false,
    isConnecting: false,
    chainId: null,
    error: null,
  });
  
  const connect = async (provider: 'metamask' | 'walletconnect') => {
    setState(prev => ({ ...prev, isConnecting: true, error: null }));
    
    try {
      // Connection logic
      const { address, chainId } = await connectWallet(provider);
      setState({
        address,
        isConnected: true,
        isConnecting: false,
        chainId,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: error.message,
      }));
    }
  };
  
  return { ...state, connect };
};
```

## Contract Interaction Patterns
Standardize contract calls with proper error handling:

```typescript
interface ContractCallOptions {
  contract: Contract;
  method: string;
  args: any[];
  value?: BigNumber;
  gasLimit?: number;
}

const useContractCall = () => {
  const [state, setState] = useState({
    isLoading: false,
    error: null,
    txHash: null,
  });
  
  const call = async (options: ContractCallOptions) => {
    setState({ isLoading: true, error: null, txHash: null });
    
    try {
      const tx = await options.contract[options.method](
        ...options.args,
        {
          value: options.value,
          gasLimit: options.gasLimit,
        }
      );
      
      setState({ isLoading: false, error: null, txHash: tx.hash });
      
      // Wait for confirmation
      await tx.wait();
      return tx;
    } catch (error) {
      setState({ 
        isLoading: false, 
        error: parseContractError(error), 
        txHash: null 
      });
      throw error;
    }
  };
  
  return { ...state, call };
};
```

## Network Switching Patterns
Handle network switching gracefully:

```typescript
const SUPPORTED_NETWORKS = {
  SHIBARIUM: {
    chainId: 109,
    name: 'Shibarium',
    rpcUrl: 'https://www.shibrpc.com',
    blockExplorer: 'https://shibarumscan.io',
  },
  PUPPYNET: {
    chainId: 157,
    name: 'Puppynet',
    rpcUrl: 'https://puppynet.shibrpc.com',
    blockExplorer: 'https://puppyscan.shib.io',
  },
};

const useSwitchNetwork = () => {
  const switchNetwork = async (networkKey: keyof typeof SUPPORTED_NETWORKS) => {
    const network = SUPPORTED_NETWORKS[networkKey];
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${network.chainId.toString(16)}` }],
      });
    } catch (switchError) {
      // Network not added, try to add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${network.chainId.toString(16)}`,
            chainName: network.name,
            rpcUrls: [network.rpcUrl],
            blockExplorerUrls: [network.blockExplorer],
          }],
        });
      } else {
        throw switchError;
      }
    }
  };
  
  return { switchNetwork };
};
```

## Transaction State Management
Track transaction states consistently:

```typescript
interface TransactionState {
  status: 'idle' | 'pending' | 'confirming' | 'confirmed' | 'failed';
  hash: string | null;
  error: string | null;
  confirmations: number;
}

const useTransaction = () => {
  const [state, setState] = useState<TransactionState>({
    status: 'idle',
    hash: null,
    error: null,
    confirmations: 0,
  });
  
  const sendTransaction = async (txFunction: () => Promise<any>) => {
    setState({ status: 'pending', hash: null, error: null, confirmations: 0 });
    
    try {
      const tx = await txFunction();
      setState(prev => ({ ...prev, status: 'confirming', hash: tx.hash }));
      
      // Monitor confirmations
      const receipt = await tx.wait();
      setState(prev => ({ 
        ...prev, 
        status: 'confirmed', 
        confirmations: receipt.confirmations 
      }));
      
      return receipt;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        status: 'failed', 
        error: parseContractError(error) 
      }));
      throw error;
    }
  };
  
  return { ...state, sendTransaction };
};
```

## Error Handling for Web3
Parse and display user-friendly error messages:

```typescript
const parseContractError = (error: any): string => {
  // User rejected transaction
  if (error.code === 4001) {
    return 'Transaction was rejected by user';
  }
  
  // Insufficient funds
  if (error.code === -32000 && error.message.includes('insufficient funds')) {
    return 'Insufficient funds for transaction';
  }
  
  // Contract revert with reason
  if (error.reason) {
    return error.reason;
  }
  
  // Gas estimation failed
  if (error.message.includes('gas required exceeds allowance')) {
    return 'Transaction would fail. Please check your inputs.';
  }
  
  // Network error
  if (error.message.includes('network')) {
    return 'Network error. Please check your connection.';
  }
  
  // Generic fallback
  return 'Transaction failed. Please try again.';
};
```

## Gas Estimation Patterns
Implement proper gas estimation:

```typescript
const useGasEstimation = () => {
  const estimateGas = async (
    contract: Contract,
    method: string,
    args: any[],
    value?: BigNumber
  ) => {
    try {
      const gasEstimate = await contract.estimateGas[method](
        ...args,
        value ? { value } : {}
      );
      
      // Add 20% buffer for gas estimation
      const gasLimit = gasEstimate.mul(120).div(100);
      
      return gasLimit;
    } catch (error) {
      console.warn('Gas estimation failed:', error);
      // Return a reasonable default
      return BigNumber.from('300000');
    }
  };
  
  return { estimateGas };
};
```

## Price Formatting Utilities
Consistent formatting for crypto values:

```typescript
const formatBoneAmount = (amount: string | BigNumber, decimals = 18): string => {
  const value = BigNumber.from(amount);
  const formatted = ethers.utils.formatUnits(value, decimals);
  const number = parseFloat(formatted);
  
  if (number === 0) return '0';
  if (number < 0.001) return '<0.001';
  if (number < 1) return number.toFixed(3);
  if (number < 1000) return number.toFixed(2);
  
  // Format large numbers with K, M suffixes
  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(1)}M`;
  }
  if (number >= 1000) {
    return `${(number / 1000).toFixed(1)}K`;
  }
  
  return number.toFixed(2);
};

const formatUSDValue = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
```

## Contract Event Listening
Handle contract events properly:

```typescript
const useContractEvents = (contract: Contract, eventName: string) => {
  const [events, setEvents] = useState([]);
  
  useEffect(() => {
    if (!contract) return;
    
    const handleEvent = (...args) => {
      const event = args[args.length - 1]; // Last argument is the event object
      setEvents(prev => [...prev, event]);
    };
    
    contract.on(eventName, handleEvent);
    
    return () => {
      contract.off(eventName, handleEvent);
    };
  }, [contract, eventName]);
  
  return events;
};
```

## Testing Web3 Components
Mock Web3 providers for testing:

```typescript
// Mock ethers for testing
const mockContract = {
  method: jest.fn(),
  estimateGas: {
    method: jest.fn().mockResolvedValue(BigNumber.from('21000')),
  },
  on: jest.fn(),
  off: jest.fn(),
};

const mockProvider = {
  getNetwork: jest.fn().mockResolvedValue({ chainId: 109 }),
  getSigner: jest.fn().mockReturnValue({
    getAddress: jest.fn().mockResolvedValue('0x123...'),
  }),
};

// Test wallet connection
test('should connect wallet successfully', async () => {
  const { result } = renderHook(() => useWallet());
  
  await act(async () => {
    await result.current.connect('metamask');
  });
  
  expect(result.current.isConnected).toBe(true);
  expect(result.current.address).toBe('0x123...');
});
```

## Security Best Practices
- ✅ Always validate user inputs before contract calls
- ✅ Use proper gas limits to prevent failed transactions
- ✅ Implement transaction confirmation UI
- ✅ Handle network switching gracefully
- ✅ Validate contract addresses and ABIs
- ✅ Use secure RPC endpoints
- ✅ Implement proper error boundaries
- ✅ Never store private keys in frontend code

## Common Web3 Pitfalls to Avoid
- ❌ Not handling user rejection of transactions
- ❌ Hardcoding gas limits without estimation
- ❌ Not validating network before contract calls
- ❌ Ignoring transaction confirmation states
- ❌ Not handling network switching errors
- ❌ Displaying raw error messages to users
- ❌ Not cleaning up event listeners
- ❌ Assuming wallet is always connected