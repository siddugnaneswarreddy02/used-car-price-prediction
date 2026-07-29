import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from "recharts";

const fuelData = [
  { fuel: "Petrol", count: 5240 },
  { fuel: "Diesel", count: 3768 },
  { fuel: "CNG",    count: 96 },
  { fuel: "Electric", count: 54 },
  { fuel: "Hybrid", count: 18 },
];

const brandData = [
  { brand: "Maruti",     count: 2375 },
  { brand: "Hyundai",    count: 1774 },
  { brand: "Tata",       count: 944 },
  { brand: "Mahindra",   count: 651 },
  { brand: "Honda",      count: 599 },
  { brand: "Renault",    count: 423 },
  { brand: "Toyota",     count: 383 },
  { brand: "Ford",       count: 366 },
  { brand: "KIA",        count: 290 },
  { brand: "Volkswagen", count: 253 },
];

const priceByYear = [
  { year: "2016", price: 4.69 },
  { year: "2017", price: 5.80 },
  { year: "2018", price: 6.39 },
  { year: "2019", price: 7.17 },
  { year: "2020", price: 8.04 },
  { year: "2021", price: 9.11 },
  { year: "2022", price: 10.46 },
  { year: "2023", price: 11.01 },
  { year: "2024", price: 11.39 },
  { year: "2025", price: 10.97 },
];

const ownershipData = [
  { owner: "1st Owner", count: 5381 },
  { owner: "2nd Owner", count: 2474 },
  { owner: "3rd Owner", count: 919 },
  { owner: "4th Owner", count: 292 },
  { owner: "5th Owner+", count: 80 },
];

const competitiveData = [
  { platform: "OLX",      accuracy: 75, userExperience: 70 },
  { platform: "CarDekho", accuracy: 85, userExperience: 82 },
  { platform: "Cars24",   accuracy: 88, userExperience: 90 },
  { platform: "CarAI",    accuracy: 92, userExperience: 95 },
];

const PIE_COLORS = ["#2563eb", "#60a5fa", "#34d399", "#f59e0b", "#f87171"];

const tooltipStyle = {
  contentStyle: { backgroundColor: "#111827", border: "1px solid #1e3a8a", color: "#fff" },
};

function Analytics() {
  return (
    <div className="dashboard-container">
      <h1>Analytics Dashboard</h1>

      {/* Summary Cards */}
      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Total Listings</h3>
          <h2>9,176</h2>
        </div>
        <div className="dashboard-card">
          <h3>Avg Price</h3>
          <h2>₹8.5 Lakh</h2>
        </div>
        <div className="dashboard-card">
          <h3>CarAI Accuracy</h3>
          <h2>92%</h2>
        </div>
        <div className="dashboard-card">
          <h3>Top Brand</h3>
          <h2>Maruti</h2>
        </div>
      </div>

      {/* Price Trend by Year */}
      <div className="summary-card" style={{ marginTop: "30px" }}>
        <h2>📈 Average Price Trend by Year (₹ Lakhs)</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={priceByYear}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e3a8a" />
            <XAxis dataKey="year" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" unit=" L" />
            <Tooltip {...tooltipStyle} formatter={(v) => [`₹${v} Lakh`, "Avg Price"]} />
            <Line type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={3} dot={{ fill: "#60a5fa", r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Brand Popularity */}
      <div className="summary-card" style={{ marginTop: "30px" }}>
        <h2>🏆 Top 10 Brands by Listings</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={brandData} layout="vertical">
            <XAxis type="number" stroke="#94a3b8" />
            <YAxis dataKey="brand" type="category" stroke="#94a3b8" width={80} />
            <Tooltip {...tooltipStyle} formatter={(v) => [v, "Listings"]} />
            <Bar dataKey="count" fill="#2563eb" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Fuel Type + Ownership side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "30px" }}>

        {/* Fuel Distribution Pie */}
        <div className="summary-card">
          <h2>⛽ Fuel Type Distribution</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={fuelData} dataKey="count" nameKey="fuel" cx="50%" cy="50%" outerRadius={90} label={({ fuel, percent }) => `${fuel} ${(percent * 100).toFixed(0)}%`}>
                {fuelData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip {...tooltipStyle} formatter={(v) => [v, "Cars"]} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Ownership Distribution */}
        <div className="summary-card">
          <h2>👤 Ownership Distribution</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={ownershipData}>
              <XAxis dataKey="owner" stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <YAxis stroke="#94a3b8" />
              <Tooltip {...tooltipStyle} formatter={(v) => [v, "Cars"]} />
              <Bar dataKey="count" fill="#60a5fa" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Competitive Analysis — CarAI highlighted */}
      <div className="summary-card" style={{ marginTop: "30px" }}>
        <h2>🥇 Competitive Analysis — <span style={{ color: "#60a5fa" }}>CarAI</span> vs Others</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={competitiveData}>
            <XAxis stroke="#94a3b8" dataKey="platform" />
            <YAxis stroke="#94a3b8" domain={[60, 100]} />
            <Tooltip {...tooltipStyle} />
            <Legend />
            <Bar dataKey="accuracy" name="Prediction Accuracy (%)" radius={[4, 4, 0, 0]}
              fill="#2563eb"
              label={{ position: "top", fill: "#94a3b8", fontSize: 12 }}
            />
            <Bar dataKey="userExperience" name="User Experience (%)" radius={[4, 4, 0, 0]}
              fill="#60a5fa"
            />
          </BarChart>
        </ResponsiveContainer>
        <p style={{ color: "#60a5fa", textAlign: "center", fontWeight: "bold", marginTop: "10px" }}>
          ⭐ CarAI leads with 92% accuracy and 95% user experience score
        </p>
      </div>

    </div>
  );
}

export default Analytics;