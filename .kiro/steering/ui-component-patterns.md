---
inclusion: always
---

# UI Component Patterns & Design System

## Component Library Structure
- **Base Components**: Use shadcn/ui components from `@/components/ui/`
- **Custom Components**: Build in `@/components/shibplay/` for game-specific UI
- **Third-party Components**: MagicUI components in `@/components/magicui/`
- **21stdev Components**: Specialized components in `@/components/21stdev/`

## Design System Principles
- **Mobile-first**: Design for mobile, enhance for desktop
- **Dark/Light Theme**: Support both themes with `next-themes`
- **Responsive Design**: Use Tailwind responsive prefixes (sm:, md:, lg:, xl:)
- **Accessibility**: Follow WCAG guidelines, use proper ARIA labels
- **Animation**: Use Framer Motion for smooth transitions

## Component Patterns
```typescript
// Game-specific component pattern
interface GameCardProps {
  roundId: number;
  state: "live" | "ended" | "upcoming";
  active: boolean;
}

export default function GameCard({ roundId, state, active }: GameCardProps) {
  const { data: round } = useRounds({ roundId });
  
  return (
    <div className={cn(
      "game-card transition-all duration-300",
      active && "scale-100 opacity-100",
      !active && "scale-75 opacity-75"
    )}>
      {/* Card content */}
    </div>
  );
}
```

## Styling Guidelines
- Use Tailwind CSS utility classes
- Create custom CSS classes only when necessary
- Use `cn()` utility for conditional classes
- Follow consistent spacing scale (4, 8, 12, 16, 24, 32, 48, 64)
- Use semantic color names from theme

## Animation Standards
- **Carousel Transitions**: 300ms ease-in-out
- **Loading States**: Use Lottie animations from `src/animations/`
- **Hover Effects**: Subtle scale/opacity changes
- **Page Transitions**: Smooth fade/slide effects
- **Micro-interactions**: Button press feedback

## Loading States
```typescript
// Standard loading pattern
if (isLoading) {
  return <Loading />; // Use custom Loading component
}

// Skeleton loading for better UX
return (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
);
```

## Error States
```typescript
// Standard error display
if (error) {
  return (
    <div className="text-red-500 p-4 border border-red-200 rounded">
      <p>Error: {error.message}</p>
      <button onClick={retry} className="mt-2 text-sm underline">
        Try again
      </button>
    </div>
  );
}
```

## Responsive Patterns
- **Carousel**: `md:basis-1/4 lg:basis-2/3` for different screen sizes
- **Grid Layouts**: Use CSS Grid with responsive columns
- **Typography**: Scale text sizes appropriately
- **Spacing**: Adjust padding/margins for mobile vs desktop

## Theme Integration
- Use CSS custom properties for theme colors
- Support system preference detection
- Provide theme toggle component
- Ensure proper contrast ratios
- Test both light and dark modes

## Accessibility Requirements
- Use semantic HTML elements
- Provide alt text for images
- Ensure keyboard navigation works
- Use proper heading hierarchy
- Include focus indicators
- Support screen readers with ARIA labels