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
import { calculateMetrics } from "../utils/kpi";

export default function CostPerCoolingChart({ rows }) {
  const data = React.useMemo(() => {
    if (!rows || !rows.length) return [];
    // Enrich each row with KPI metrics
    const withMetrics = rows.map((r) => calculateMetrics(r));

    // Group by date (YYYY-MM-DD) and take daily average of costPerCoolingDegree
    const byDay = new Map();
    withMetrics.forEach((row) => {
      if (!row.timestamp || row.costPerCoolingDegree == null) return;
      const ts = String(row.timestamp);
      const [datePart] = ts.split(" ");
      const value = Number(row.costPerCoolingDegree);
      if (!Number.isFinite(value)) return;

      // calculate the sum of values in each day
      const current = byDay.get(datePart) || { sum: 0, count: 0 };
      current.sum += value;
      current.count += 1;
      byDay.set(datePart, current);
    });

    // turn the map into sorted chart points
    const days = Array.from(byDay.keys()).sort();
    return days.map((day) => {
      const { sum, count } = byDay.get(day);
      const avg = count > 0 ? sum / count : 0; //compute average
      return {
        day,
        costPerCooling: avg,
      };
    });
  }, [rows]);

  return (
    <div className="w-full">
      {!data.length ? (
        <p className="text-sm text-gray-500">
          No cost-per-cooling data available.
        </p>
      ) : (
        <div className="w-full h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 20, bottom: 20, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10 }}
                tickFormatter={(d) => d.slice(5)} //remove year
              />
              <YAxis
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => {
                  const n = Number(v);
                  return Number.isFinite(n) ? `€${n.toFixed(4)}` : v;
                }}
              />
              <Tooltip
                formatter={(value) => {
                  const n = Number(value);
                  return [
                    Number.isFinite(n) ? `€${n.toFixed(4)}` : value,
                    "Cost per °C removed",
                  ];
                }}
                labelFormatter={(label) => `Day: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="costPerCooling"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
