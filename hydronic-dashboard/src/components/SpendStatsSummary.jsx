import React from "react";
import { computeMonthlySpendAndExtremes } from "../utils/efficiency";

export default function SpendStatsSummary({ rows }) {
  const { averageSpendPerMonth, highestSpendDay, lowestSpendDay } =
    React.useMemo(() => computeMonthlySpendAndExtremes(rows), [rows]);

  if (!rows || !rows.length) {
    return (
      <p className="text-xs text-gray-500">No spend data available yet.</p>
    );
  }

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(value || 0);

  const formatDate = (isoDate) => {
    if (!isoDate) return "N/A";
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="text-xs text-gray-700 space-y-1">
      <p>
        <span className="font-semibold">Average spend per month:</span>{" "}
        {formatCurrency(averageSpendPerMonth)}
      </p>
      {highestSpendDay && (
        <p>
          <span className="font-semibold">Highest spending day:</span>{" "}
          {formatDate(highestSpendDay.date)} (
          {formatCurrency(highestSpendDay.total)})
        </p>
      )}
      {lowestSpendDay && (
        <p>
          <span className="font-semibold">Lowest spending day:</span>{" "}
          {formatDate(lowestSpendDay.date)} (
          {formatCurrency(lowestSpendDay.total)})
        </p>
      )}
    </div>
  );
}
