"use client";

import { useState, useEffect } from 'react';
import AnimatedOdds from './src/components/shibplay/animated-odds';
import { useOddsAnimation } from './src/hooks/use-odds-animation';

export default function TestAnimatedOdds() {
  const [bullOdds, setBullOdds] = useState(1.5);
  const [bearOdds, setBearOdds] = useState(2.0);
  
  const bullAnimation = useOddsAnimation(bullOdds, { threshold: 0.05 });
  const bearAnimation = useOddsAnimation(bearOdds, { threshold: 0.05 });

  // Simulate odds changes
  useEffect(() => {
    const interval = setInterval(() => {
      // Random odds changes
      const bullChange = (Math.random() - 0.5) * 0.4; // -0.2 to +0.2
      const bearChange = (Math.random() - 0.5) * 0.4;
      
      setBullOdds(prev => Math.max(1.1, Math.min(5.0, prev + bullChange)));
      setBearOdds(prev => Math.max(1.1, Math.min(5.0, prev + bearChange)));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleManualUpdate = () => {
    setBullOdds(prev => prev + 0.3);
    setBearOdds(prev => prev - 0.2);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 dark:text-white">
          Animated Odds Test
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">
            Current Odds Values
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Bull Odds</p>
              <p className="text-2xl font-bold text-green-600">{bullOdds.toFixed(3)}</p>
              <p className="text-xs text-gray-500">
                {bullAnimation.isAnimating ? `Animating ${bullAnimation.direction}` : 'Static'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Bear Odds</p>
              <p className="text-2xl font-bold text-red-600">{bearOdds.toFixed(3)}</p>
              <p className="text-xs text-gray-500">
                {bearAnimation.isAnimating ? `Animating ${bearAnimation.direction}` : 'Static'}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleManualUpdate}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Trigger Manual Update
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">
            Animated Odds Components
          </h2>
          
          {/* Upcoming state simulation */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2 dark:text-white">Upcoming State</h3>
            <div className="flex items-center justify-between">
              <AnimatedOdds
                value={bullOdds}
                isAnimating={bullAnimation.isAnimating}
                direction={bullAnimation.direction}
                position="bull"
              />
              <AnimatedOdds
                value={bearOdds}
                isAnimating={bearAnimation.isAnimating}
                direction={bearAnimation.direction}
                position="bear"
              />
            </div>
          </div>

          {/* Live state simulation */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2 dark:text-white">Live State</h3>
            <div className="flex items-center justify-between">
              <AnimatedOdds
                value={bearOdds}
                isAnimating={bearAnimation.isAnimating}
                direction={bearAnimation.direction}
                position="bear"
              />
              <AnimatedOdds
                value={bullOdds}
                isAnimating={bullAnimation.isAnimating}
                direction={bullAnimation.direction}
                position="bull"
              />
            </div>
          </div>

          {/* Custom styling test */}
          <div>
            <h3 className="text-lg font-medium mb-2 dark:text-white">Custom Styling</h3>
            <div className="flex items-center justify-between">
              <AnimatedOdds
                value={bullOdds}
                isAnimating={bullAnimation.isAnimating}
                direction={bullAnimation.direction}
                position="bull"
                className="bg-purple-700/25 text-purple-400"
              />
              <AnimatedOdds
                value={bearOdds}
                isAnimating={bearAnimation.isAnimating}
                direction={bearAnimation.direction}
                position="bear"
                className="bg-orange-700/25 text-orange-400"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Odds automatically update every 3 seconds</p>
          <p>Animation threshold: 0.05 | Animation duration: 1.5s</p>
        </div>
      </div>
    </div>
  );
}