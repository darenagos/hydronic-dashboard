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

    // Aggregate to daily total spend
    const byDay = new Map(); // yyyy-mm-dd -> totalCost

    (effectiveRows || [])
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
  }, [rows, monthKeys, selectedMonthIndex]);

  return (
    <div className="w-full flex flex-col gap-2">
      <div>
        <p className="text-xs text-gray-600">
          This chart shows the total energy spend per day for the selected month
          or for all data.
        </p>
      </div>
      <div className="flex items-center gap-2 text-sm">
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
