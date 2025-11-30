import "./App.css";
import React from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import BusinessPage from "./components/BusinessPage";
import EngineerPage from "./components/EngineerPage";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        <header className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-6">
          <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold">Hydronic Dashboard</h1>
              <p className="mt-1 text-sm opacity-90">
                Visualize system performance
              </p>
            </div>

            <nav className="space-x-2">
              <NavLink
                to="/business"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-md font-medium ${
                    isActive ? "bg-white text-slate-700" : "bg-white/70"
                  }`
                }
              >
                Business Persona
              </NavLink>

              <NavLink
                to="/engineer"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-md font-medium ${
                    isActive ? "bg-white text-slate-700" : "bg-white/70"
                  }`
                }
              >
                Engineer Persona
              </NavLink>
            </nav>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-10 ">
          <Routes>
            <Route path="/" element={<BusinessPage />} />
            <Route path="/business" element={<BusinessPage />} />
            <Route path="/engineer" element={<EngineerPage />} />
          </Routes>
        </main>

        <footer className="max-w-6xl mx-auto px-6 py-6 text-sm text-gray-500">
          Built for hydronic systems
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
