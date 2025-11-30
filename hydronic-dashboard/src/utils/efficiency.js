import { calculateMetrics } from "./kpi";

export const EFFICIENCY_THRESHOLDS = {
  // Efficient if coolingPerKWh is above this (good thermal transfer)
  coolingPerKWhThreshold: 0.5,
  // And costPerCoolingDegree is below this (not overpaying per °C removed)
  costPerCoolingDegreeThreshold: 0.07,
};

export function computeEfficiencySummary(rows, overrides = {}) {
  const { coolingPerKWhThreshold, costPerCoolingDegreeThreshold } = {
    ...EFFICIENCY_THRESHOLDS,
    ...overrides,
  };
  if (!rows || !rows.length) {
    return {
      totalHours: 0,
      efficientHours: 0,
      inefficientHours: 0,
      efficientPercent: 0,
      inefficientPercent: 0,
    };
  }

  let efficientHours = 0;
  let totalHours = 0;

  rows.forEach((row) => {
    const metrics = calculateMetrics(row);
    const { coolingPerKWh, costPerCoolingDegree } = metrics;

    if (
      coolingPerKWh == null ||
      costPerCoolingDegree == null ||
      !Number.isFinite(coolingPerKWh) ||
      !Number.isFinite(costPerCoolingDegree)
    ) {
      return;
    }

    totalHours += 1;

    const isEfficient =
      coolingPerKWh > coolingPerKWhThreshold &&
      costPerCoolingDegree < costPerCoolingDegreeThreshold;

    if (isEfficient) efficientHours += 1;
  });

  const inefficientHours = Math.max(totalHours - efficientHours, 0);
  const efficientPercent = totalHours ? (efficientHours / totalHours) * 100 : 0;
  const inefficientPercent = 100 - efficientPercent;

  return {
    totalHours,
    efficientHours,
    inefficientHours,
    efficientPercent,
    inefficientPercent,
  };
}

export function computeInefficiencyByHour(rows, overrides = {}) {
  const { coolingPerKWhThreshold, costPerCoolingDegreeThreshold } = {
    ...EFFICIENCY_THRESHOLDS,
    ...overrides,
  };
  const byHour = new Map(); // hour -> { total, inefficient }

  (rows || []).forEach((row) => {
    if (!row.timestamp) return;
    const ts = String(row.timestamp);
    const [, timePart] = ts.split(" ");
    if (!timePart) return;

    const hour = Number(timePart.slice(0, 2));
    if (!Number.isFinite(hour)) return;

    const metrics = calculateMetrics(row);
    const { coolingPerKWh, costPerCoolingDegree } = metrics;

    if (
      coolingPerKWh == null ||
      costPerCoolingDegree == null ||
      !Number.isFinite(coolingPerKWh) ||
      !Number.isFinite(costPerCoolingDegree)
    ) {
      return;
    }

    const isEfficient =
      coolingPerKWh > coolingPerKWhThreshold &&
      costPerCoolingDegree < costPerCoolingDegreeThreshold;

    const current = byHour.get(hour) || { total: 0, inefficient: 0 };
    current.total += 1;
    if (!isEfficient) current.inefficient += 1;
    byHour.set(hour, current);
  });

  const hours = Array.from(byHour.keys()).sort((a, b) => a - b);

  return hours.map((hour) => {
    const { total, inefficient } = byHour.get(hour);
    const ineffPercent = total > 0 ? (inefficient / total) * 100 : 0;
    return { hour, ineffPercent };
  });
}

export function computeMonthlySpendAndExtremes(rows) {
  if (!rows || !rows.length) {
    return {
      averageSpendPerMonth: 0,
      highestSpendDay: null,
      lowestSpendDay: null,
    };
  }

  const monthTotals = new Map(); // yyyy-mm -> { total }
  const dayTotals = new Map(); // yyyy-mm-dd -> { total }

  (rows || []).forEach((row) => {
    if (!row.timestamp || row.energy_cost_USD == null) return;

    const ts = String(row.timestamp);
    const [datePart] = ts.split(" ");
    if (!datePart) return;

    const [year, month, day] = datePart.split("-");
    if (!year || !month || !day) return;

    const monthKey = `${year}-${month}`;
    const dayKey = `${year}-${month}-${day}`;
    const cost = Number(row.energy_cost_USD) || 0;

    const monthCurrent = monthTotals.get(monthKey) || { total: 0 };
    monthCurrent.total += cost;
    monthTotals.set(monthKey, monthCurrent);

    const dayCurrent = dayTotals.get(dayKey) || { total: 0 };
    dayCurrent.total += cost;
    dayTotals.set(dayKey, dayCurrent);
  });

  const months = Array.from(monthTotals.entries());
  const days = Array.from(dayTotals.entries());

  const averageSpendPerMonth = months.length
    ? months.reduce((sum, [, v]) => sum + v.total, 0) / months.length
    : 0;

  let highestSpendDay = null;
  let lowestSpendDay = null;

  days.forEach(([dayKey, { total }]) => {
    if (!highestSpendDay || total > highestSpendDay.total) {
      highestSpendDay = { date: dayKey, total };
    }
    if (!lowestSpendDay || total < lowestSpendDay.total) {
      lowestSpendDay = { date: dayKey, total };
    }
  });

  return {
    averageSpendPerMonth,
    highestSpendDay,
    lowestSpendDay,
  };
}

// Link efficiency to potential savings: interpret reaching target
// efficient-hour percentages as yielding proportional reductions in
// average monthly spend.
export function computeEfficiencyLinkedSavings(rows) {
  if (!rows || !rows.length) {
    return {
      currentMonthlySpend: 0,
      efficientPercent: 0,
      targetEfficient50: 0,
      targetEfficient60: 0,
      targetEfficient75: 0,
      savings50: 0,
      savings60: 0,
      savings75: 0,
    };
  }

  const { efficientPercent = 0 } = computeEfficiencySummary(rows);

  // Compute average monthly spend (same basis as other spend stats)
  const monthTotals = new Map(); // yyyy-mm -> total

  (rows || []).forEach((row) => {
    if (!row.timestamp || row.energy_cost_USD == null) return;

    const ts = String(row.timestamp);
    const [datePart] = ts.split(" ");
    if (!datePart) return;

    const [year, month] = datePart.split("-");
    if (!year || !month) return;

    const monthKey = `${year}-${month}`;
    const cost = Number(row.energy_cost_USD) || 0;
    const current = monthTotals.get(monthKey) || 0;
    monthTotals.set(monthKey, current + cost);
  });

  const monthValues = Array.from(monthTotals.values());
  const currentMonthlySpend = monthValues.length
    ? monthValues.reduce((sum, v) => sum + v, 0) / monthValues.length
    : 0;

  if (!currentMonthlySpend || !efficientPercent) {
    return {
      currentMonthlySpend,
      efficientPercent,
      targetEfficient50: 0,
      targetEfficient60: 0,
      targetEfficient75: 0,
      savings50: 0,
      savings60: 0,
      savings75: 0,
    };
  }

  const targetEfficient5 = Math.min(efficientPercent + 5, 100);
  const targetEfficient10 = Math.min(efficientPercent + 10, 100);
  const targetEfficient20 = Math.min(efficientPercent + 20, 100);

  const relativeGain = (target) => {
    if (!efficientPercent || target <= efficientPercent) return 0;
    return (target - efficientPercent) / efficientPercent;
  };

  const gain5 = relativeGain(targetEfficient5);
  const gain10 = relativeGain(targetEfficient10);
  const gain20 = relativeGain(targetEfficient20);

  return {
    currentMonthlySpend,
    efficientPercent,
    targetEfficient5,
    targetEfficient10,
    targetEfficient20,
    savings5: currentMonthlySpend * gain5,
    savings10: currentMonthlySpend * gain10,
    savings20: currentMonthlySpend * gain20,
  };
}
// Simple projected savings: assume a 5/10/20% reduction in
// average monthly spend.
export function computeProjectedSavings(rows) {
  if (!rows || !rows.length) {
    return {
      currentMonthlySpend: 0,
      savings5: 0,
      savings10: 0,
      savings20: 0,
    };
  }

  const monthTotals = new Map(); // yyyy-mm -> total

  (rows || []).forEach((row) => {
    if (!row.timestamp || row.energy_cost_USD == null) return;

    const ts = String(row.timestamp);
    const [datePart] = ts.split(" ");
    if (!datePart) return;

    const [year, month] = datePart.split("-");
    if (!year || !month) return;

    const monthKey = `${year}-${month}`;
    const cost = Number(row.energy_cost_USD) || 0;
    const current = monthTotals.get(monthKey) || 0;
    monthTotals.set(monthKey, current + cost);
  });

  const monthValues = Array.from(monthTotals.values());
  const currentMonthlySpend = monthValues.length
    ? monthValues.reduce((sum, v) => sum + v, 0) / monthValues.length
    : 0;

  return {
    currentMonthlySpend,
    savings5: currentMonthlySpend * 0.05,
    savings10: currentMonthlySpend * 0.1,
    savings20: currentMonthlySpend * 0.2,
  };
}
