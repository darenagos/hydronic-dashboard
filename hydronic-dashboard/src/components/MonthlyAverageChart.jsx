import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function MonthlyAverageCostSummary({ rows }) {
  const monthlyAverages = React.useMemo(() => {
    const sums = new Map(); // key -> { sum, count }

    (rows || []).forEach((row) => {
      if (!row.timestamp || row.energy_cost_USD == null) return;
      const ts = String(row.timestamp);
      const key = ts.slice(0, 7); // YYYY-MM
      const current = sums.get(key) || { sum: 0, count: 0 };
      const value = Number(row.energy_cost_USD);
      if (!Number.isFinite(value)) return;
      current.sum += value;
      current.count += 1;
      sums.set(key, current);
    });

    const keys = Array.from(sums.keys()).sort();
    return keys.map((key) => {
      const { sum, count } = sums.get(key);
      return {
        month: key,
        avg_energy_cost_USD: count > 0 ? sum / count : 0,
      };
    });
  }, [rows]);

  if (!monthlyAverages.length) {
    return (
      <p className="text-xs text-gray-500">
        No monthly average data available.
      </p>
    );
  }

  return (
    <div className="w-full h-40 ">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={monthlyAverages}
          margin={{ top: 10, right: 10, bottom: 10, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 9 }}
            tickFormatter={(m) => m.slice(5)}
          />
          <YAxis
            tick={{ fontSize: 9 }}
            tickFormatter={(v) => {
              const n = Number(v);
              return Number.isFinite(n) ? `$${n.toFixed(2)}` : v;
            }}
          />
          <Tooltip
            formatter={(value) => {
              const n = Number(value);
              return [
                Number.isFinite(n) ? `$${n.toFixed(4)}` : value,
                "Avg Energy Cost",
              ];
            }}
            labelFormatter={(label) => `Month: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="avg_energy_cost_USD"
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ r: 2 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
