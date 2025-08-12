---
inclusion: always
---

# Development Workflow & Testing

## Development Environment
- **Package Manager**: Use `bun` for all operations (install, dev, build)
- **Development Server**: `bun dev` with Turbopack for fast HMR
- **TypeScript**: Strict mode enabled with custom tsconfig settings
- **Linting**: ESLint with Next.js configuration
- **Git**: Follow conventional commit messages

## File Organization Standards
```
src/
├── app/                 # Next.js App Router pages
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── providers.tsx   # App providers
├── components/         # React components
│   ├── ui/            # shadcn/ui base components
│   ├── shibplay/      # Game-specific components
│   ├── magicui/       # MagicUI components
│   └── 21stdev/       # Specialized components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
├── abis/              # Smart contract ABIs
├── animations/        # Lottie animation files
└── stores.ts          # Zustand stores
```

## Component Development Workflow
1. **Create Component**: Use kebab-case file naming
2. **Define Interface**: TypeScript props interface
3. **Implement Logic**: Hooks, state, effects
4. **Style Component**: Tailwind classes with responsive design
5. **Handle States**: Loading, error, empty states
6. **Test Integration**: Manual testing with different states

## Smart Contract Integration Workflow
1. **Add ABI**: Place contract ABI in `src/abis/`
2. **Create Config**: Contract configuration object
3. **Build Hooks**: Custom hooks for contract interactions
4. **Handle Errors**: Comprehensive error handling
5. **Test Transactions**: Test on Puppynet before mainnet
6. **Document Usage**: Add examples and documentation

## Code Quality Checklist
- [ ] TypeScript strict mode compliance
- [ ] No unused imports or variables
- [ ] Proper error handling implemented
- [ ] Loading states for async operations
- [ ] Responsive design tested
- [ ] Accessibility considerations
- [ ] Performance optimizations applied
- [ ] Console errors resolved

## Testing Strategy
- **Manual Testing**: Test all user flows manually
- **Network Testing**: Test on both Shibarium and Puppynet
- **Wallet Testing**: Test with different wallet providers
- **Responsive Testing**: Test on mobile and desktop
- **Error Testing**: Test error scenarios and edge cases

## Deployment Checklist
- [ ] Build passes without errors (`bun build`)
- [ ] No TypeScript errors
- [ ] All environment variables configured
- [ ] Contract addresses verified
- [ ] Network configurations correct
- [ ] Performance metrics acceptable
- [ ] SEO meta tags updated