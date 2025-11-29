import React from "react";

export default function BusinessPage() {
  return (
    <div className="space-y-4">
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold">Business Dashboard</h2>
        <p className="mt-2 text-sm text-gray-600">
          High-level KPIs and executive-friendly charts go here.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          Placeholder: Revenue / Cost Overview
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          Placeholder: Efficiency Summary
        </div>
      </section>
    </div>
  );
}
