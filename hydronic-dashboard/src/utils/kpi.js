export function calculateMetrics(row) {
  const deltaT = row.temperature_out_C - row.temperature_in_C;
  const pressureDrop = row.pressure_in_kPa - row.pressure_out_kPa;

  return {
    ...row,
    deltaT,
    pressureDrop,
    costPerCoolingDegree:
      deltaT !== 0 && !isNaN(deltaT) ? row.energy_cost_USD / deltaT : null,
    coolingPerKWh:
      row.energy_kWh !== 0 && !isNaN(row.energy_kWh)
        ? deltaT / row.energy_kWh
        : null,
  };
}
