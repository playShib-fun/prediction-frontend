import { render, screen } from '@testing-library/react';
import AnimatedOdds from '../animated-odds';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
    p: ({ children, className, ...props }: any) => (
      <p className={className} {...props}>
        {children}
      </p>
    ),
  },
  animate: jest.fn(),
}));

describe('AnimatedOdds', () => {
  it('renders odds value correctly', () => {
    render(
      <AnimatedOdds
        value={2.5}
        isAnimating={false}
        direction="none"
        position="bull"
      />
    );

    expect(screen.getByText('2.50x')).toBeInTheDocument();
  });

  it('applies bull position styling', () => {
    const { container } = render(
      <AnimatedOdds
        value={1.8}
        isAnimating={false}
        direction="none"
        position="bull"
      />
    );

    const oddsElement = container.firstChild as HTMLElement;
    expect(oddsElement).toHaveClass('bg-green-700/25', 'text-green-500', 'rounded-l-xs');
  });

  it('applies bear position styling', () => {
    const { container } = render(
      <AnimatedOdds
        value={1.8}
        isAnimating={false}
        direction="none"
        position="bear"
      />
    );

    const oddsElement = container.firstChild as HTMLElement;
    expect(oddsElement).toHaveClass('bg-red-700/25', 'text-red-500', 'rounded-r-xs');
  });

  it('applies animation styling when animating up', () => {
    const { container } = render(
      <AnimatedOdds
        value={2.0}
        isAnimating={true}
        direction="up"
        position="bull"
      />
    );

    const oddsElement = container.firstChild as HTMLElement;
    expect(oddsElement).toHaveClass('bg-green-500/40', 'text-green-300');
  });

  it('applies custom className', () => {
    const { container } = render(
      <AnimatedOdds
        value={1.5}
        isAnimating={false}
        direction="none"
        position="bull"
        className="custom-class"
      />
    );

    const oddsElement = container.firstChild as HTMLElement;
    expect(oddsElement).toHaveClass('custom-class');
  });
});