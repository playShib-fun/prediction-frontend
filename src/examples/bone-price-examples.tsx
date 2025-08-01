/**
 * Bone Price Oracle Usage Examples
 *
 * This file contains various examples of how to use the bone-price contract hooks
 * in different scenarios. Copy and adapt these patterns for your components.
 */

import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import {
  useCurrentPrice,
  useFormattedCurrentPrice,
  useFormattedLatestPrice,
  useBonePriceState,
  useCanUpdatePrice,
  useUpdatePrice,
  useSetMinUpdateInterval,
  useTransferOwnership,
  usePriceHistory,
} from "@/hooks/use-bone-price";
import { formatBonePrice } from "@/lib/contracts/bone-price";

// Example 1: Simple Price Display
export function SimplePriceDisplay() {
  const { data: price, isLoading, error } = useFormattedCurrentPrice();

  if (isLoading) return <div>Loading price...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="p-4 border rounded">
      <h3>Current BONE Price</h3>
      <p className="text-2xl font-bold">${price?.toFixed(4)}</p>
    </div>
  );
}

// Example 2: Price with Trend Indicator
export function PriceWithTrend() {
  const { data: currentPrice } = useFormattedCurrentPrice();
  const { data: latestData } = useFormattedLatestPrice();
  const [trend, setTrend] = useState<"up" | "down" | "stable">("stable");

  useEffect(() => {
    if (currentPrice && latestData && latestData.price !== currentPrice) {
      setTrend(currentPrice > latestData.price ? "up" : "down");
    }
  }, [currentPrice, latestData]);

  return (
    <div className="p-4 border rounded">
      <h3>BONE Price</h3>
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold">${currentPrice?.toFixed(4)}</span>
        {trend === "up" && <span className="text-green-500">↗</span>}
        {trend === "down" && <span className="text-red-500">↘</span>}
      </div>
    </div>
  );
}

// Example 3: Owner Price Update Interface
export function OwnerPriceUpdater() {
  const { address } = useAccount();
  const { data: state } = useBonePriceState();
  const { canUpdate, timeUntilNextUpdate } = useCanUpdatePrice();
  const { updatePrice, isPending, isSuccess } = useUpdatePrice();
  const [newPrice, setNewPrice] = useState("");

  const isOwner =
    address &&
    state?.owner &&
    address.toLowerCase() === state.owner.toLowerCase();

  const handleUpdate = () => {
    if (newPrice && !isNaN(Number(newPrice))) {
      const priceInWei = BigInt(Math.floor(Number(newPrice) * 1e8));
      updatePrice(priceInWei);
      setNewPrice("");
    }
  };

  if (!isOwner) {
    return <div>Only the contract owner can update prices.</div>;
  }

  return (
    <div className="p-4 border rounded">
      <h3>Update Price (Owner Only)</h3>
      <div className="space-y-2">
        <input
          type="number"
          step="0.0001"
          placeholder="Enter new price"
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value)}
          disabled={!canUpdate || isPending}
          className="border rounded px-2 py-1"
        />
        <button
          onClick={handleUpdate}
          disabled={!canUpdate || isPending || !newPrice}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isPending ? "Updating..." : "Update Price"}
        </button>
        {!canUpdate && (
          <p className="text-orange-600">
            Wait {Math.ceil(timeUntilNextUpdate)}s before next update
          </p>
        )}
        {isSuccess && (
          <p className="text-green-600">Price updated successfully!</p>
        )}
      </div>
    </div>
  );
}

// Example 4: Price History Chart
export function PriceHistoryChart() {
  const { data: history } = usePriceHistory(10);

  if (!history || history.length === 0) {
    return <div>No price history available</div>;
  }

  return (
    <div className="p-4 border rounded">
      <h3>Price History</h3>
      <div className="space-y-1">
        {history.map((entry, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span>Round #{entry.roundId}</span>
            <span>${entry.price.toFixed(4)}</span>
            <span>{entry.timestamp.toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Example 5: Contract Status Monitor
export function ContractStatusMonitor() {
  const { data: state, isLoading } = useBonePriceState();
  const { canUpdate, timeUntilNextUpdate } = useCanUpdatePrice();

  if (isLoading) return <div>Loading contract status...</div>;
  if (!state) return <div>No contract data available</div>;

  return (
    <div className="p-4 border rounded">
      <h3>Contract Status</h3>
      <div className="space-y-2 text-sm">
        <div>Current Price: ${formatBonePrice(state.currentPrice)}</div>
        <div>Round ID: {state.currentRoundId.toString()}</div>
        <div>
          Last Update:{" "}
          {new Date(Number(state.lastUpdateTime) * 1000).toLocaleString()}
        </div>
        <div>Min Interval: {state.minUpdateInterval.toString()}s</div>
        <div>
          Owner: {state.owner.slice(0, 6)}...{state.owner.slice(-4)}
        </div>
        <div>Can Update: {canUpdate ? "Yes" : "No"}</div>
        {!canUpdate && (
          <div>Next Update In: {Math.ceil(timeUntilNextUpdate)}s</div>
        )}
      </div>
    </div>
  );
}

// Example 6: Real-time Price Ticker
export function PriceTicker() {
  const { data: price } = useFormattedCurrentPrice();
  const [priceHistory, setPriceHistory] = useState<number[]>([]);

  useEffect(() => {
    if (price) {
      setPriceHistory((prev) => [...prev.slice(-9), price]);
    }
  }, [price]);

  return (
    <div className="p-4 border rounded">
      <h3>Live Price Ticker</h3>
      <div className="text-3xl font-bold mb-2">
        ${price?.toFixed(4) || "0.0000"}
      </div>
      <div className="flex gap-1">
        {priceHistory.map((p, i) => (
          <div
            key={i}
            className="w-2 h-8 bg-blue-500 rounded"
            style={{ height: `${Math.max(10, (p / (price || 1)) * 40)}px` }}
          />
        ))}
      </div>
    </div>
  );
}

// Example 7: Price Alert System
export function PriceAlertSystem() {
  const { data: price } = useFormattedCurrentPrice();
  const [alerts, setAlerts] = useState<
    { id: number; target: number; type: "above" | "below" }[]
  >([]);
  const [newAlert, setNewAlert] = useState("");
  const [alertType, setAlertType] = useState<"above" | "below">("above");

  const addAlert = () => {
    const target = parseFloat(newAlert);
    if (!isNaN(target) && target > 0) {
      setAlerts((prev) => [
        ...prev,
        { id: Date.now(), target, type: alertType },
      ]);
      setNewAlert("");
    }
  };

  const removeAlert = (id: number) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  // Check alerts
  useEffect(() => {
    if (price) {
      alerts.forEach((alert) => {
        const triggered =
          alert.type === "above"
            ? price >= alert.target
            : price <= alert.target;

        if (triggered) {
          console.log(`Price alert: BONE ${alert.type} $${alert.target}`);
          // You could show a notification here
        }
      });
    }
  }, [price, alerts]);

  return (
    <div className="p-4 border rounded">
      <h3>Price Alerts</h3>
      <div className="space-y-2">
        <div className="flex gap-2">
          <select
            value={alertType}
            onChange={(e) => setAlertType(e.target.value as "above" | "below")}
            className="border rounded px-2 py-1"
          >
            <option value="above">Above</option>
            <option value="below">Below</option>
          </select>
          <input
            type="number"
            step="0.0001"
            placeholder="Price target"
            value={newAlert}
            onChange={(e) => setNewAlert(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <button
            onClick={addAlert}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Add Alert
          </button>
        </div>
        <div className="space-y-1">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex justify-between items-center">
              <span>
                Alert when price {alert.type} ${alert.target}
              </span>
              <button
                onClick={() => removeAlert(alert.id)}
                className="text-red-500"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Example 8: Contract Management Interface
export function ContractManagement() {
  const { address } = useAccount();
  const { data: state } = useBonePriceState();
  const { setMinUpdateInterval, isPending: isSettingInterval } =
    useSetMinUpdateInterval();
  const { transferOwnership, isPending: isTransferring } =
    useTransferOwnership();
  const [newInterval, setNewInterval] = useState("");
  const [newOwner, setNewOwner] = useState("");

  const isOwner =
    address &&
    state?.owner &&
    address.toLowerCase() === state.owner.toLowerCase();

  if (!isOwner) {
    return <div>Only the contract owner can manage settings.</div>;
  }

  return (
    <div className="p-4 border rounded">
      <h3>Contract Management (Owner Only)</h3>
      <div className="space-y-4">
        <div>
          <label>Set Min Update Interval (seconds)</label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Interval in seconds"
              value={newInterval}
              onChange={(e) => setNewInterval(e.target.value)}
              className="border rounded px-2 py-1"
            />
            <button
              onClick={() => setMinUpdateInterval(BigInt(newInterval))}
              disabled={isSettingInterval || !newInterval}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Set
            </button>
          </div>
        </div>
        <div>
          <label>Transfer Ownership</label>
          <div className="flex gap-2">
            <input
              placeholder="New owner address"
              value={newOwner}
              onChange={(e) => setNewOwner(e.target.value)}
              className="border rounded px-2 py-1"
            />
            <button
              onClick={() => transferOwnership(newOwner)}
              disabled={isTransferring || !newOwner}
              className="bg-orange-500 text-white px-4 py-2 rounded"
            >
              Transfer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
