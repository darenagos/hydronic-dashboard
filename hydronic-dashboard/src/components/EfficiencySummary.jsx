import React from "react";
import { computeEfficiencySummary } from "../utils/efficiency";

export default function EfficiencySummary({ rows }) {
  const summary = React.useMemo(() => computeEfficiencySummary(rows), [rows]);

  const {
    totalHours,
    efficientHours,
    inefficientHours,
    efficientPercent,
    inefficientPercent,
  } = summary;

  if (!totalHours) {
    return (
      <p className="text-xs text-gray-500">No efficiency data available.</p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-baseline text-xs">
        <div>
          <div className="font-semibold text-green-600">
            Efficient hours (good behaviour)
          </div>
          <div>
            {efficientHours}h ({efficientPercent.toFixed(1)}%)
          </div>
        </div>
        <div className="text-right">
          <div className="font-semibold text-red-500">
            Inefficient hours (red zone)
          </div>
          <div>
            {inefficientHours}h ({inefficientPercent.toFixed(1)}%)
          </div>
        </div>
      </div>

      <div className="w-full h-4 bg-gray-200 rounded overflow-hidden">
        <div className="flex h-full w-full">
          <div
            className="bg-green-500"
            style={{ width: `${efficientPercent}%` }}
            title={`Efficient ${efficientPercent.toFixed(1)}%`}
          />
          <div
            className="bg-red-500"
            style={{ width: `${inefficientPercent}%` }}
            title={`Inefficient ${inefficientPercent.toFixed(1)}%`}
          />
        </div>
      </div>

      <p className="text-[11px] text-gray-600">
        Green: hours where the system was transferring heat efficiently and not
        overpaying. Red: hours where performance or cost was outside target –
        wasted money & energy.
      </p>
    </div>
  );
}
