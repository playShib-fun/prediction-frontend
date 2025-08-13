"use client";

import TestRealTimeOdds from '../../../test-integration-real-time-odds';
import TestAnimatedOdds from '../../../test-animated-odds';

export default function TestOddsPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Real-time Odds Integration</h2>
            <TestRealTimeOdds />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Animated Odds Component</h2>
            <TestAnimatedOdds />
          </div>
        </div>
      </div>
    </div>
  );
}