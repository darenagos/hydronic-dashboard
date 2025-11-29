import React from "react";
import { calculateMetrics } from "../utils/kpi";

export default function MonthlyCostPerCoolingSummary({ rows }) {
  const monthlyStats = React.useMemo(() => {
    const sums = new Map();

    (rows || []).forEach((row) => {
      const withMetrics = calculateMetrics(row);
      if (!withMetrics.timestamp || withMetrics.costPerCoolingDegree == null)
        return;

      const ts = String(withMetrics.timestamp);
      const key = ts.slice(0, 7); // YYYY-MM
      const current = sums.get(key) || { sum: 0, count: 0 };
      const value = Number(withMetrics.costPerCoolingDegree);
      if (!Number.isFinite(value)) return;
      current.sum += value;
      current.count += 1;
      sums.set(key, current);
    });

    const keys = Array.from(sums.keys()).sort();
    return keys.map((key, index) => {
      const { sum, count } = sums.get(key);
      const avg = count > 0 ? sum / count : 0;
      return {
        key,
        index: index + 1,
        avg,
      };
    });
  }, [rows]);

  if (!monthlyStats.length) {
    return (
      <p className="text-xs text-gray-500">
        No monthly cost-per-cooling data available.
      </p>
    );
  }

  return (
    <ul className="text-xs space-y-1">
      {monthlyStats.map((m, idx) => {
        const prev = monthlyStats[idx - 1];
        let diffText = "";
        let diffClass = "";

        if (prev) {
          const diff = m.avg - prev.avg;
          const sign = diff > 0 ? "+" : diff < 0 ? "-" : "";
          diffText = `${sign}€${Math.abs(diff).toFixed(4)}`;
          if (diff > 0) diffClass = "text-red-500";
          else if (diff < 0) diffClass = "text-green-600";
          else diffClass = "text-gray-500";
        }

        return (
          <li key={m.key} className="flex items-baseline gap-2">
            <span className="font-medium">Month {m.index}:</span>
            <span>€{m.avg.toFixed(4)}</span>
            {prev && <span className={diffClass}>{`(${diffText})`}</span>}
          </li>
        );
      })}
    </ul>
  );
}
