import Papa from "papaparse";

const buildCsvUrl = (fileName) => `/src/data/${encodeURIComponent(fileName)}`;

export async function loadCsvRows(fileName) {
  const url = buildCsvUrl(fileName);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to load CSV: ${response.status} ${response.statusText}`
    );
  }
  const text = await response.text();

  // Parse as raw rows (no header interpretation) because each line is quoted as a whole
  const parsed = Papa.parse(text, { header: false, skipEmptyLines: true });
  const rows = parsed.data;

  if (!rows.length) return [];

  // First row is the header line, still quoted and comma-separated inside
  const headerLine = rows[0][0]; // e.g. "timestamp,pressure_in_kPa,...,energy_cost_USD"
  const headers = headerLine
    .replace(/^"|"$/g, "")
    .split(",")
    .map((h) => h.trim());

  // Remaining rows: same structure, one big quoted cell with commas inside
  const dataLines = rows.slice(1);
  const objects = dataLines.map((line) => {
    const raw = line[0]; // e.g. "2025-01-01 00:00:00,397.7,...,0.092"
    if (typeof raw !== "string") return {};
    const values = raw
      .replace(/^"|"$/g, "")
      .split(",")
      .map((v) => v.trim());
    const obj = {};
    headers.forEach((h, idx) => {
      let v = values[idx];
      if (v === undefined) v = null;
      const numericKeys = new Set([
        "pressure_in_kPa",
        "pressure_out_kPa",
        "temperature_in_C",
        "temperature_out_C",
        "valve_opening_percent",
        "energy_kWh",
        "energy_cost_USD",
      ]);
      if (v != null && numericKeys.has(h)) {
        const n = Number(v);
        obj[h] = Number.isFinite(n) ? n : v;
      } else {
        obj[h] = v;
      }
    });
    return obj;
  });

  // Optional: filter out any completely empty objects
  return objects.filter((row) => row && Object.keys(row).length > 0);
}
