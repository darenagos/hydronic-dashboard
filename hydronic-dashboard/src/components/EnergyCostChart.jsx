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

export default function EnergyCostChart({ rows }) {
  const data = React.useMemo(() => {
    if (!rows || !rows.length) return [];

    // Aggregate to daily total spend
    const byDay = new Map(); // yyyy-mm-dd -> totalCost

    (rows || [])
      .filter((row) => row.energy_cost_USD != null)
      .forEach((row) => {
        const ts = String(row.timestamp);
        const [datePart] = ts.split(" ");
        if (!datePart) return;

        const current = byDay.get(datePart) || 0;
        byDay.set(datePart, current + Number(row.energy_cost_USD) || 0);
      });

    return Array.from(byDay.entries())
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([date, total]) => ({
        date,
        daily_energy_cost_USD: total,
      }));
  }, [rows]);

  return (
    <div className="w-full flex flex-col gap-2">
      <div>
        <p className="text-xs text-gray-600">
          This chart shows the total energy spend per day across all available
          data.
        </p>
      </div>
      <div className="w-full h-56">
        {!data.length ? (
          <p className="text-sm text-gray-500">
            No energy cost data available.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 20, bottom: 20, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} minTickGap={20} />
              <YAxis
                dataKey="daily_energy_cost_USD"
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => `$${v.toFixed ? v.toFixed(2) : v}`}
              />
              <Tooltip
                formatter={(value) => [
                  `$${Number(value).toFixed(4)}`,
                  "Daily Energy Cost",
                ]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="daily_energy_cost_USD"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
