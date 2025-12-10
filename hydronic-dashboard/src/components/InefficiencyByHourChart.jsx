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
import {
  computeInefficiencyByHour,
  EFFICIENCY_THRESHOLDS,
} from "../utils/efficiency";

export default function InefficiencyByHourChart({ rows }) {
  const data = React.useMemo(
    () =>
      computeInefficiencyByHour(rows).map((d) => ({
        ...d,
        effPercent: 100 - d.ineffPercent,
      })),
    [rows]
  );

  if (!data.length) {
    return (
      <p className="text-xs text-gray-500">
        No inefficiency pattern data available.
      </p>
    );
  }

  return (
    <div className="w-full px-2 ">
      <div>
        <p className="mt-1 text-[9px] text-gray-400 leading-snug">
          Assumed thresholds: coolingPerKWh &gt;{" "}
          {EFFICIENCY_THRESHOLDS.coolingPerKWhThreshold}, costPerCoolingDegree
          &lt; {EFFICIENCY_THRESHOLDS.costPerCoolingDegreeThreshold}.
        </p>
      </div>

      <div className="h-44 mt-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 10, bottom: 5, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 10 }}
              label={{
                value: "Hour of day",
                position: "insideBottom",
                offset: -3,
                style: { fontSize: 12 },
              }}
            />
            <YAxis
              tick={{ fontSize: 10 }}
              tickFormatter={(v) => `${v.toFixed(0)}%`}
              label={{
                value: ["% of efficient hours"],
                angle: -90,
                position: "center",
                dx: -15,
                style: { fontSize: 12 },
              }}
            />
            <Tooltip
              formatter={(value, name) => {
                const label =
                  name === "effPercent" ? "% efficient" : "% inefficient";
                return [`${Number(value).toFixed(1)}%`, label];
              }}
              labelFormatter={(label) => `Hour: ${label}:00`}
            />
            <Line
              type="monotone"
              dataKey="effPercent"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ r: 2 }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="ineffPercent"
              stroke="#ef4444"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
