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
  const [selectedMonth, setSelectedMonth] = React.useState("all");

  const filteredRows = React.useMemo(() => {
    if (!rows || rows.length === 0) return [];
    if (selectedMonth === "all") return rows;

    const monthNumber = Number(selectedMonth);
    if (!Number.isFinite(monthNumber)) return rows;

    return rows.filter((row) => {
      if (!row.timestamp) return false;
      const ts = String(row.timestamp);
      const [datePart] = ts.split(" ");
      if (!datePart) return false;
      const [, month] = datePart.split("-");
      const m = Number(month);
      return Number.isFinite(m) && m === monthNumber;
    });
  }, [rows, selectedMonth]);

  const data = React.useMemo(
    () =>
      computeInefficiencyByHour(filteredRows).map((d) => ({
        ...d,
        effPercent: 100 - d.ineffPercent,
      })),
    [filteredRows]
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
      <div className="flex items-center justify-start mb-1 text-xs ">
        <label className="flex items-center gap-2 text-sm">
          <span className="font-medium">Month:</span>
          <select
            className="border rounded px-2 py-1 text-sm bg-white"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="all">All time</option>
            <option value="1">Month 1</option>
            <option value="2">Month 2</option>
            <option value="3">Month 3</option>
          </select>
        </label>
      </div>
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
