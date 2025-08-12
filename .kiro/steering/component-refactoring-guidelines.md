---
inclusion: always
---

# Component Refactoring Guidelines

## Refactoring Methodology
When refactoring components, follow this systematic approach:

1. **Analyze Dependencies**: Identify all hooks, props, and external dependencies
2. **Define New Interface**: Create clear TypeScript interfaces for new prop structure
3. **Implement Incrementally**: Make changes in small, testable increments
4. **Remove Dead Code**: Clean up unused imports, variables, and functions
5. **Test Thoroughly**: Verify all functionality works with new implementation
6. **Document Changes**: Update comments and documentation

## Props Interface Evolution
When changing component props:

```typescript
// Before: Primitive props requiring additional data fetching
interface OldComponentProps {
  id: number;
  status: string;
}

// After: Rich object props with all needed data
interface NewComponentProps {
  entity: EntityObject;  // Contains all needed data
  uiState: UIState;      // UI-specific state
}
```

## Hook Dependency Reduction
Prefer passing data down as props rather than fetching in child components:

```typescript
// ❌ Avoid: Child component fetching its own data
function ChildComponent({ id }: { id: number }) {
  const { data, loading } = useDataById(id);
  // Component logic
}

// ✅ Prefer: Parent fetches, child receives
function ChildComponent({ data }: { data: DataObject }) {
  // Component logic with direct data access
}
```

## State Mapping Patterns
Create pure functions for state transformations:

```typescript
// Pure function for state mapping
const mapEntityToUIState = (entity: Entity): UIState => {
  switch (entity.status) {
    case "ACTIVE":
      return "active";
    case "COMPLETED":
      return "completed";
    default:
      return "pending";
  }
};
```

## Performance Optimization During Refactoring
- Remove unnecessary re-renders by eliminating unused hooks
- Use direct prop access instead of derived state when possible
- Implement proper memoization for expensive calculations
- Reduce component re-mounting by stabilizing keys and props

## Testing Strategy for Refactored Components
1. **Unit Tests**: Test state mapping functions in isolation
2. **Integration Tests**: Verify parent-child component interaction
3. **Visual Tests**: Ensure UI renders correctly in all states
4. **Performance Tests**: Measure render performance improvements
5. **Regression Tests**: Confirm existing functionality still works

## Code Cleanup Checklist
After refactoring, ensure:
- [ ] No unused imports remain
- [ ] No unused variables or functions
- [ ] TypeScript strict mode compliance
- [ ] ESLint warnings resolved
- [ ] Console errors eliminated
- [ ] Proper error boundaries in place

## Documentation Updates
Update these areas after refactoring:
- Component prop interfaces and examples
- Integration guides and usage patterns
- Performance characteristics and benchmarks
- Breaking changes and migration guides