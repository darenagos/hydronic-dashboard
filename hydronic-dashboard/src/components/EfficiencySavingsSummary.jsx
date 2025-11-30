import React from "react";
import { computeEfficiencyLinkedSavings } from "../utils/efficiency";

export default function EfficiencySavingsSummary({ rows }) {
  const {
    currentMonthlySpend,
    efficientPercent,
    targetEfficient5,
    targetEfficient10,
    targetEfficient20,
    savings5,
    savings10,
    savings20,
  } = React.useMemo(() => computeEfficiencyLinkedSavings(rows), [rows]);

  if (!rows || !rows.length || currentMonthlySpend === 0 || !efficientPercent) {
    return (
      <p className="text-xs text-gray-500">
        Not enough data yet to project savings.
      </p>
    );
  }

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(value || 0);

  return (
    <div className="text-xs  space-y-1">
      <p className="text-sm font-semibold mb-1">
        Projected Monthly Savings from More Efficient Hours
      </p>
      <p className="text-[11px] text-gray-600">
        Based on your current share of efficient hours and average monthly
        energy spend, these figures show how much you could save each month if
        you increase the proportion of efficient hours.
      </p>
      <p>
        <span className="font-semibold">Current average monthly spend:</span>{" "}
        {formatCurrency(currentMonthlySpend)}
      </p>
      <p>
        <span className="font-semibold">Current efficient hours:</span>{" "}
        {efficientPercent.toFixed(1)}%
      </p>
      <p>
        <span className="font-semibold">If efficient hours rise to </span>
        {targetEfficient5.toFixed(1)}%: save about {formatCurrency(savings5)}{" "}
        per month (+5%)
      </p>
      <p>
        <span className="font-semibold">If efficient hours rise to </span>
        {targetEfficient10.toFixed(1)}%: save about {formatCurrency(savings10)}{" "}
        per month (+10%)
      </p>
      <p>
        <span className="font-semibold">If efficient hours rise to </span>
        {targetEfficient20.toFixed(1)}%: save about {formatCurrency(savings20)}{" "}
        per month (+20%)
      </p>
    </div>
  );
}
