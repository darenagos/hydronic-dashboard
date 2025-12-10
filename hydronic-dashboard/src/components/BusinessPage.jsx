import React, { useEffect, useState } from "react";
import { loadCsvRows } from "../utils/loadCsv";
import EnergyCostChart from "./EnergyCostChart";
import MonthlyEnergyCostSummary from "./MonthlyEnergyCostSummary";
import CostPerCoolingChart from "./CostPerCoolingChart";
import MonthlyCostPerCoolingSummary from "./CostPerCoolingMonthlySummary";
import EfficiencySummary from "./EfficiencySummary";
import InefficiencyByHourChart from "./InefficiencyByHourChart";
import SpendStatsSummary from "./SpendStatsSummary";
import EfficiencySavingsSummary from "./EfficiencySavingsSummary";

export default function BusinessPage() {
  const [allRows, setAllRows] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const rows = await loadCsvRows("task_dashboard.xlsx - in.csv");
        setAllRows(rows);
      } catch (error) {
        console.error("Failed to load CSV:", error);
      }
    }

    loadData();
  }, []);

  return (
    <div className="space-y-4">
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold">Business Dashboard</h2>
        <p className="mt-2 text-sm text-gray-600">
          Daily spend, cost-per-cooling, efficiency, and projected savings from
          recent plant data.
        </p>
      </section>

      <section>
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <h4 className="text-sm font-semibold mb-1">Spend Stats</h4>
          <SpendStatsSummary rows={allRows} />
        </div>
      </section>

      <section className="grid text-black grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <h3 className="text-lg font-semibold">
            Cost per Cooling Delivered (€/°C removed)
          </h3>
          <p className="text-xs text-gray-600">
            Tracks the energy cost to remove each °C of heat over time,
            highlighting periods when cooling is cheap versus expensive.
          </p>
          <CostPerCoolingChart rows={allRows} />
          <div>
            <h4 className="text-sm font-semibold mb-1">
              Monthly Average Cost-per-Cooling Summary
            </h4>
            <MonthlyCostPerCoolingSummary rows={allRows} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <h3 className="text-lg font-semibold">
            Energy Spend (USD) over Time
          </h3>

          <EnergyCostChart rows={allRows} />

          <div className="mt-5">
            <h4 className="text-sm font-semibold mb-1">
              Monthly Average Energy Cost Summary
            </h4>
            <MonthlyEnergyCostSummary rows={allRows} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <h4 className="text-lg font-semibold">
            Efficient vs Inefficient Hours
          </h4>
          <EfficiencySummary rows={allRows} />
          <InefficiencyByHourChart rows={allRows} />
          <div className="mt-3">
            <EfficiencySavingsSummary rows={allRows} />
          </div>
        </div>
      </section>
    </div>
  );
}
