---
inclusion: always
---

# Coding Standards & Best Practices

## TypeScript Standards
- Use strict TypeScript with `noImplicitAny: false` for flexibility
- Enable `noUnusedLocals` and `noUnusedParameters` for clean code
- Prefer explicit return types for functions
- Use proper type imports: `import type { NextConfig } from "next"`
- Leverage TypeScript's strict mode for better type safety

## Code Organization
- Use absolute imports with `@/` prefix for src directory
- Group imports: external libraries first, then internal modules
- Export components as default exports
- Use named exports for utilities and hooks
- Keep components focused and single-responsibility

## Naming Conventions
- **Components**: PascalCase (e.g., `GameCard`, `BonePriceDisplay`)
- **Files**: kebab-case for components (e.g., `game-card.tsx`)
- **Hooks**: camelCase starting with "use" (e.g., `useBoneBalance`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `PREDICTION_CONTRACT_ADDRESS`)
- **Variables/Functions**: camelCase (e.g., `currentEpoch`, `formatBalance`)

## Component Structure
```typescript
"use client"; // Only when needed for client components

import { useState, useEffect } from "react";
import type { ComponentProps } from "react";

// External imports
import { useAccount } from "wagmi";

// Internal imports
import { Button } from "@/components/ui/button";
import { useBoneBalance } from "@/hooks/use-wallet";

interface ComponentNameProps {
  // Props interface
}

export default function ComponentName({ prop }: ComponentNameProps) {
  // Hooks first
  const { address } = useAccount();
  const { data: balance } = useBoneBalance();
  
  // State
  const [isLoading, setIsLoading] = useState(false);
  
  // Effects
  useEffect(() => {
    // Effect logic
  }, []);
  
  // Event handlers
  const handleClick = () => {
    // Handler logic
  };
  
  // Early returns
  if (!address) return <div>Connect wallet</div>;
  
  // Main render
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

## Error Handling
- Always handle loading and error states in components
- Use try-catch blocks for async operations
- Provide meaningful error messages to users
- Log errors to console for debugging
- Use optional chaining for potentially undefined values

## Performance Guidelines
- Use React.memo() for expensive components
- Implement proper dependency arrays in useEffect
- Avoid inline object/function creation in render
- Use useMemo and useCallback when appropriate
- Lazy load heavy components and animations