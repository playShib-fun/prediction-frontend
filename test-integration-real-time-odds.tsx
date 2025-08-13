/**
 * Integration Test Component for useRealTimeOdds Hook
 * 
 * This component demonstrates the hook integration and can be used
 * for manual testing in the browser.
 */

import React, { useState } from 'react';
import { useRealTimeOdds } from '@/hooks/use-real-time-odds';

const TestRealTimeOdds: React.FC = () => {
  const [roundId, setRoundId] = useState('1');
  const [enabled, setEnabled] = useState(true);
  const [changeLog, setChangeLog] = useState<string[]>([]);

  const [enableVisibilityOptimization, setEnableVisibilityOptimization] = useState(true);
  const [visibilityThreshold, setVisibilityThreshold] = useState(0.1);

  const { odds, isLoading, error, isAnimating, elementRef, isVisible } = useRealTimeOdds({
    roundId,
    enabled,
    enableVisibilityOptimization,
    visibilityThreshold,
    onOddsChange: (newOdds, previousOdds) => {
      const timestamp = new Date().toLocaleTimeString();
      const logEntry = `${timestamp}: Bull ${previousOdds.bullOdds.toFixed(2)}x → ${newOdds.bullOdds.toFixed(2)}x, Bear ${previousOdds.bearOdds.toFixed(2)}x → ${newOdds.bearOdds.toFixed(2)}x`;
      setChangeLog(prev => [logEntry, ...prev.slice(0, 9)]); // Keep last 10 entries
    }
  });

  return (
    <div ref={elementRef as React.RefObject<HTMLDivElement>} className="p-6 max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Real-Time Odds Hook Test
      </h2>
      
      {/* Controls */}
      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Round ID:
          </label>
          <input
            type="text"
            value={roundId}
            onChange={(e) => setRoundId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Enter round ID"
          />
        </div>
        
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Enable real-time polling (15s intervals)
            </span>
          </label>
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={enableVisibilityOptimization}
              onChange={(e) => setEnableVisibilityOptimization(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Enable visibility-based polling optimization
            </span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Visibility Threshold: {visibilityThreshold}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={visibilityThreshold}
            onChange={(e) => setVisibilityThreshold(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            How much of the component must be visible to trigger polling
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
            <span className={`ml-2 px-2 py-1 rounded text-xs ${
              isLoading ? 'bg-yellow-100 text-yellow-800' : 
              error ? 'bg-red-100 text-red-800' : 
              'bg-green-100 text-green-800'
            }`}>
              {isLoading ? 'Loading' : error ? 'Error' : 'Ready'}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Animating:</span>
            <span className={`ml-2 px-2 py-1 rounded text-xs ${
              isAnimating ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {isAnimating ? 'Yes' : 'No'}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Visible:</span>
            <span className={`ml-2 px-2 py-1 rounded text-xs ${
              isVisible ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
            }`}>
              {isVisible ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
        
        {error && (
          <div className="mt-2 text-red-600 dark:text-red-400 text-sm">
            Error: {error.message}
          </div>
        )}
      </div>

      {/* Odds Display */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
          Current Odds
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {odds.bullOdds.toFixed(2)}x
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">
              Bull (Higher)
            </div>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {odds.bearOdds.toFixed(2)}x
            </div>
            <div className="text-sm text-red-700 dark:text-red-300">
              Bear (Lower)
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {odds.totalPool.toFixed(2)}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">
              Total Pool (BONE)
            </div>
          </div>
        </div>
        
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
          Last updated: {new Date(odds.lastUpdated).toLocaleTimeString()}
        </div>
      </div>

      {/* Change Log */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
          Change Log
        </h3>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-64 overflow-y-auto">
          {changeLog.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
              No changes detected yet. Enable polling and wait for odds to update.
            </div>
          ) : (
            <div className="space-y-2">
              {changeLog.map((entry, index) => (
                <div
                  key={index}
                  className="text-sm text-gray-700 dark:text-gray-300 font-mono bg-white dark:bg-gray-800 p-2 rounded border-l-4 border-blue-500"
                >
                  {entry}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Testing Instructions:
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Enter a valid round ID (e.g., "1", "2", "3")</li>
          <li>• Enable polling to see real-time updates every 15 seconds</li>
          <li>• Toggle visibility optimization to test performance features</li>
          <li>• Scroll the component out of view to test visibility detection</li>
          <li>• Adjust visibility threshold to test intersection observer</li>
          <li>• Check the network tab to verify API calls pause when not visible</li>
          <li>• Watch the "Visible" status indicator change as you scroll</li>
          <li>• Disable polling to test the enabled/disabled functionality</li>
          <li>• Watch the change log for odds updates</li>
        </ul>
      </div>
    </div>
  );
};

export default TestRealTimeOdds;