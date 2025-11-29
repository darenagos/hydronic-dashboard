import "./App.css";

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-10">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="text-4xl font-extrabold">Hydronic Dashboard</h1>
          <p className="mt-2 text-lg opacity-90">Visualize and analyze hydronic system performance over time</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold">Overview</h2>
          <p className="mt-2 text-sm text-gray-600">
            Upload a CSV to compute deltaT, pressure drop and efficiency metrics. This is a minimal starter page using Tailwind CSS.
          </p>

          <div className="mt-6 flex gap-4">
            <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700">
              <input type="file" accept=".csv" className="hidden" />
              Upload CSV
            </label>
            <button className="px-4 py-2 border rounded-md">Sample Data</button>
          </div>
        </section>
      </main>

      <footer className="max-w-5xl mx-auto px-6 py-6 text-sm text-gray-500">
        Built for hydronic systems • Designed to be extended
      </footer>
    </div>
  );
}

export default App;
