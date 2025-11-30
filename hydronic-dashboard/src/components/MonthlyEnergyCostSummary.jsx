import React from "react";

export default function MonthlyEnergyCostSummary({ rows }) {
  const monthlyStats = React.useMemo(() => {
    const sums = new Map();

    (rows || []).forEach((row) => {
      if (!row.timestamp || row.energy_cost_USD == null) return;
      const ts = String(row.timestamp);
      const key = ts.slice(0, 7); // YYYY-MM
      const current = sums.get(key) || { total: 0 };
      const value = Number(row.energy_cost_USD);
      if (!Number.isFinite(value)) return;
      current.total += value;
      sums.set(key, current);
    });

    const keys = Array.from(sums.keys()).sort();
    return keys.map((key, index) => {
      const { total } = sums.get(key);
      return {
        key,
        index: index + 1,
        total,
      };
    });
  }, [rows]);

  if (!monthlyStats.length) {
    return <p className="text-xs text-gray-500">No monthly data available.</p>;
  }

  return (
    <ul className="text-xs space-y-1 ">
      {monthlyStats.map((m, idx) => {
        const prev = monthlyStats[idx - 1];
        let diffText = "";
        let diffClass = "";

        if (prev) {
          const diff = m.total - prev.total;
          const sign = diff > 0 ? "+" : diff < 0 ? "-" : "";
          diffText = `${sign}$${Math.abs(diff).toFixed(4)}`;
          if (diff > 0) diffClass = "text-red-500";
          else if (diff < 0) diffClass = "text-green-600";
          else diffClass = "text-gray-500";
        }

        return (
          <li key={m.key} className="flex items-baseline gap-2">
            <span className="font-medium">Month {m.index}:</span>
            <span>${m.total.toFixed(4)}</span>
            {prev && <span className={diffClass}>{`(${diffText})`}</span>}
          </li>
        );
      })}
    </ul>
  );
}
