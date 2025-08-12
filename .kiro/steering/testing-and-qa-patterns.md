---
inclusion: always
---

# Testing & Quality Assurance Patterns

## Manual Testing Workflow
For every component change or refactor, follow this testing checklist:

### Pre-Development Testing
1. **Environment Setup**: Ensure `bun dev` runs without errors
2. **Baseline Testing**: Document current behavior before changes
3. **Network Testing**: Test on both Shibarium and Puppynet
4. **Wallet Testing**: Test with different wallet providers (MetaMask, WalletConnect)

### Component State Testing
Test all possible component states systematically:

```typescript
// Example: GameCard state testing
const testStates = [
  { status: "Live", expected: "live" },
  { status: "Ended", expected: "ended" },
  { status: "Upcoming", expected: "upcoming" }
];

// Manual verification for each state
testStates.forEach(({ status, expected }) => {
  console.log(`Testing ${status} -> ${expected}`);
  // Verify UI renders correctly
  // Check progress bars, buttons, labels
  // Validate user interactions
});
```

### Responsive Design Testing
Test on multiple screen sizes:
- **Mobile**: 375px width (iPhone SE)
- **Tablet**: 768px width (iPad)
- **Desktop**: 1024px+ width
- **Large Desktop**: 1440px+ width

### Performance Testing Checklist
- [ ] Component renders within 100ms
- [ ] No memory leaks in development tools
- [ ] Smooth animations at 60fps
- [ ] Carousel navigation is responsive
- [ ] Real-time updates don't cause lag

### Accessibility Testing
- [ ] Keyboard navigation works (Tab, Enter, Space)
- [ ] Screen reader compatibility (test with VoiceOver/NVDA)
- [ ] Proper ARIA labels and roles
- [ ] Color contrast meets WCAG AA standards
- [ ] Focus indicators are visible

## Automated Testing Patterns

### Component Testing Script Structure
```javascript
// Testing script pattern
const testComponent = (componentPath, testCases) => {
  console.log(`🧪 Testing ${componentPath}`);
  
  const content = fs.readFileSync(componentPath, 'utf8');
  
  testCases.forEach(({ name, test }) => {
    const result = test(content);
    console.log(`   ${result ? '✅' : '❌'} ${name}`);
  });
};
```

### TypeScript Compliance Testing
```bash
# Run these commands before considering work complete
bun run tsc --noEmit  # Check TypeScript errors
bun run lint          # Check ESLint warnings
bun run build         # Verify production build
```

### Integration Testing Patterns
Test component integration with:
- Parent components (data flow down)
- Child components (event bubbling up)
- Global state (Zustand stores)
- External APIs (GraphQL, Web3)

## Error Handling Testing

### Network Error Scenarios
Test these network conditions:
- Slow network (throttle to 3G)
- Network disconnection
- Failed API requests
- Wallet connection failures
- Transaction rejections

### Edge Case Testing
- Empty data states
- Loading states
- Error states
- Extremely long text content
- Very large numbers
- Invalid user inputs

## Quality Gates

### Before Code Review
- [ ] All manual tests pass
- [ ] TypeScript compiles without errors
- [ ] ESLint shows no warnings
- [ ] Component renders in all states
- [ ] Performance is acceptable
- [ ] Accessibility requirements met

### Before Deployment
- [ ] Production build succeeds
- [ ] All integration tests pass
- [ ] Cross-browser testing complete
- [ ] Mobile testing complete
- [ ] Performance benchmarks met
- [ ] Security review complete

## Testing Documentation
Document test results in this format:

```markdown
## Test Results - [Component Name] - [Date]

### Functionality Tests
- ✅ State transitions work correctly
- ✅ User interactions respond properly
- ✅ Data displays accurately

### Performance Tests
- ✅ Renders in <100ms
- ✅ Animations smooth at 60fps
- ✅ Memory usage stable

### Accessibility Tests
- ✅ Keyboard navigation
- ✅ Screen reader compatibility
- ✅ Color contrast compliance

### Browser Compatibility
- ✅ Chrome 120+
- ✅ Firefox 121+
- ✅ Safari 17+
- ✅ Mobile browsers
```

## Continuous Quality Improvement
- Track testing time and identify bottlenecks
- Automate repetitive test cases
- Create reusable testing utilities
- Maintain testing documentation
- Regular review of testing practices