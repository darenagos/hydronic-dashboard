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
  const [selectedMonthIndex, setSelectedMonthIndex] = React.useState(-1); // -1 = all time

  const monthMap = React.useMemo(() => {
    const map = new Map();
    (rows || []).forEach((row) => {
      if (!row.timestamp) return;
      const ts = String(row.timestamp);
      const key = ts.slice(0, 7); // "YYYY-MM"
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(row);
    });
    return map;
  }, [rows]);

  const monthKeys = React.useMemo(
    () => Array.from(monthMap.keys()).sort(),
    [monthMap]
  );

  const data = React.useMemo(() => {
    if (!rows || !rows.length || !monthKeys.length) return [];

    let effectiveRows = rows;
    if (selectedMonthIndex >= 0 && monthKeys[selectedMonthIndex]) {
      const targetMonth = monthKeys[selectedMonthIndex];
      effectiveRows = rows.filter((row) => {
        if (!row.timestamp) return false;
        const ts = String(row.timestamp);
        const key = ts.slice(0, 7);
        return key === targetMonth;
      });
    }

    return (effectiveRows || [])
      .filter((row) => row.energy_cost_USD != null)
      .map((row) => ({
        timestamp: row.timestamp,
        energy_cost_USD: row.energy_cost_USD,
      }));
  }, [rows, monthKeys, selectedMonthIndex]);

  return (
    <div className="w-full h-64">
      <div className="mb-3 flex items-center gap-2 text-sm">
        <span className="font-medium">Month:</span>
        <select
          value={selectedMonthIndex}
          onChange={(e) => setSelectedMonthIndex(Number(e.target.value))}
          className="border rounded px-2 py-1 text-sm bg-white"
        >
          <option value={-1}>All time</option>
          {monthKeys.map((key, idx) => (
            <option key={key} value={idx}>{`Month ${idx + 1}`}</option>
          ))}
        </select>
      </div>
      {!data.length ? (
        <p className="text-sm text-gray-500">No energy cost data available.</p>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 20, bottom: 20, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tick={{ fontSize: 10 }}
              minTickGap={20}
            />
            <YAxis
              dataKey="energy_cost_USD"
              tick={{ fontSize: 10 }}
              tickFormatter={(v) => `$${v.toFixed ? v.toFixed(2) : v}`}
            />
            <Tooltip
              formatter={(value) => [
                `$${Number(value).toFixed(4)}`,
                "Energy Cost",
              ]}
              labelFormatter={(label) => `Time: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="energy_cost_USD"
              stroke="#0ea5e9"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
