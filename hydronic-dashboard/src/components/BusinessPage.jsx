import React, { useEffect, useState } from "react";
import { loadCsvRows } from "../utils/loadCsv";
import EnergyCostChart from "./EnergyCostChart";
import MonthlyEnergyCostSummary from "./MonthlyEnergyCostSummary";
import CostPerCoolingChart from "./CostPerCoolingChart";
import MonthlyCostPerCoolingSummary from "./CostPerCoolingMonthlySummary";

export default function BusinessPage() {
  const [allRows, setAllRows] = useState([]);
  const [energyCosts, setEnergyCosts] = useState([]);

  useEffect(() => {
    async function logEnergyCosts() {
      try {
        const rows = await loadCsvRows("task_dashboard.xlsx - in.csv");
        setAllRows(rows);
        const costs = rows.map((row) => row.energy_cost_USD);
        console.log("energy_cost_USD for all rows:", costs);
        setEnergyCosts(costs);
      } catch (error) {
        console.error("Failed to load energy_cost_USD from CSV:", error);
      }
    }

    logEnergyCosts();
  }, []);

  return (
    <div className="space-y-4">
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold">Business Dashboard</h2>
        <p className="mt-2 text-sm text-gray-600">
          High-level KPIs and executive-friendly charts.
        </p>
      </section>

      <section className="grid text-black grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <h3 className="text-lg font-semibold">
            Cost per Cooling Delivered (€/°C removed)
          </h3>
          <p className="text-xs text-gray-600">
            Business-readable efficiency KPI: how much you pay for each °C of
            cooling delivered per day.
          </p>
          <CostPerCoolingChart rows={allRows} />
          <div>
            <h4 className="text-sm font-semibold mb-1">
              Monthly Cost-per-Cooling Summary
            </h4>
            <MonthlyCostPerCoolingSummary rows={allRows} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <h3 className="text-lg font-semibold">Energy Cost (USD) over Time</h3>
          <EnergyCostChart rows={allRows} />
          <div>
            <h4 className="text-sm font-semibold mb-1">
              Monthly Energy Cost Summary
            </h4>
            <MonthlyEnergyCostSummary rows={allRows} />
          </div>
        </div>
      </section>
    </div>
  );
}
