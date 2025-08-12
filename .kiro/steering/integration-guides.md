---
inclusion: always
---

# Integration Guides Reference

## Available Integration Guides
The project includes comprehensive integration guides for all major components:

### Smart Contract Integration
- **Bone Price Oracle Guide**: #[[file:BONE_PRICE_GUIDE.md]]
  - Complete integration patterns for price oracle contract
  - Custom hooks for price data and updates
  - Real-time price monitoring examples

- **Prediction Contract Guide**: #[[file:PREDICTION_CONTRACT_GUIDE.md]]
  - Full prediction game contract integration
  - Betting, claiming, and round management
  - Admin functions and error handling

### Wallet Integration
- **Wallet Hooks Guide**: #[[file:WALLET_HOOKS_GUIDE.md]]
  - Comprehensive wallet connection patterns
  - Balance management and network switching
  - Error handling and auto-connect functionality

## Implementation Priority
When implementing new features, follow this priority order:

1. **Core Functionality**: Implement basic contract interactions first
2. **User Experience**: Add loading states, error handling, and feedback
3. **Advanced Features**: Add real-time updates and optimizations
4. **Polish**: Animations, micro-interactions, and edge case handling

## Integration Patterns
- Always reference the appropriate guide when working with contracts
- Use the established hook patterns for consistency
- Follow the error handling patterns from the guides
- Implement proper loading and success states

## Code Examples
All guides include complete, working code examples that can be used directly in the application. When implementing features:

1. Start with the basic examples from the guides
2. Adapt them to your specific use case
3. Add proper error handling and loading states
4. Test thoroughly on both networks

## Best Practices
- Use the utility functions provided in the guides
- Follow the established naming conventions
- Implement proper TypeScript types
- Add comprehensive error handling
- Test all integration points thoroughly