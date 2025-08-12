---
inclusion: always
---

# ShibPlay Project Overview

## Project Description
ShibPlay is a Web3 prediction game built on the Shibarium blockchain where users can bet on BONE token price movements. The application features a carousel-based interface showing different prediction rounds with real-time price data integration.

## Core Technologies
- **Framework**: Next.js 15.4.5 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS with custom components
- **Web3**: Wagmi v2 + RainbowKit for wallet integration
- **Blockchain**: Shibarium (Chain ID: 109) and Puppynet for testing
- **State Management**: Zustand for client state
- **Animations**: Framer Motion + Lottie React
- **Package Manager**: Bun (preferred)

## Key Features
1. **Prediction Rounds**: Users can bet Bull/Bear on BONE price movements
2. **Real-time Price Oracle**: Integration with Bone Price Oracle contract
3. **Wallet Integration**: Multi-wallet support via RainbowKit
4. **Responsive Design**: Mobile-first approach with carousel interface
5. **Game History**: Track user betting history and results
6. **Tutorial System**: How-to-play guides and tutorials

## Smart Contracts
- **Prediction Contract**: `0x4ACB55Cea2a25FEF18460a41fC7bB5dF2d2cd7bc`
- **Bone Price Oracle**: `0x1E58C1d2b48bdD02a8512dFa4484De8bF983E448`

## Project Structure
- `src/app/` - Next.js App Router pages and layouts
- `src/components/` - Reusable UI components (shadcn/ui + custom)
- `src/hooks/` - Custom React hooks for Web3 and app logic
- `src/lib/` - Utility functions and contract configurations
- `src/abis/` - Smart contract ABIs
- `src/animations/` - Lottie animation files
- `src/stores.ts` - Zustand state management

## Development Commands
- `bun dev` - Start development server with Turbopack
- `bun build` - Build for production
- `bun start` - Start production server
- `bun lint` - Run ESLint