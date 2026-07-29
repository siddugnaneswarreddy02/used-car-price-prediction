import React from "react";
import { useCarData } from "../context/CarContext";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from "recharts";
import { useEffect, useState } from "react";
import { getAnalytics } from "../services/analyticsApi";
import {
  brandPriceTrend,
  defaultPriceTrend,
  ownershipResale,
} from "../data/marketData";
const tooltipStyle = {
  contentStyle: { backgroundColor: "#111827", border: "1px solid #1e3a8a", color: "#fff" },
};

const PIE_COLORS = ["#2563eb", "#60a5fa", "#34d399", "#f59e0b", "#f87171"];

// Depreciation based on km driven
const depreciationData = {
  "0 - 20,000 KM":        { value: 90, label: "Excellent" , color: "#34d399" },
  "20,000 - 50,000 KM":   { value: 75, label: "Good",       color: "#60a5fa" },
  "50,000 - 80,000 KM":   { value: 60, label: "Average",    color: "#f59e0b" },
  "80,000 - 1,20,000 KM": { value: 45, label: "Fair",       color: "#f87171" },
  "1,20,000+ KM":         { value: 30, label: "Low",        color: "#ef4444" },
};

// Fuel demand score
const fuelDemand = {
  Petrol:   { score: 88, trend: "Stable", color: "#60a5fa" },
  Diesel:   { score: 82, trend: "Declining", color: "#f59e0b" },
  CNG:      { score: 75, trend: "Growing", color: "#34d399" },
  Electric: { score: 95, trend: "Booming", color: "#2563eb" },
  Hybrid:   { score: 85, trend: "Growing", color: "#a78bfa" },
};

function Analytics() {
  const { predictionData } = useCarData();
  const [analyticsData, setAnalyticsData] = useState(null);

useEffect(() => {

  async function fetchAnalytics() {

    const data = await getAnalytics();

    setAnalyticsData(data);

  }

  fetchAnalytics();

}, []);

  if (!predictionData) {
    return (
      <div className="dashboard-container" style={{ textAlign: "center", paddingTop: "80px" }}>
        <h1>Analytics Dashboard</h1>
        <div className="no-prediction-bar" style={{ maxWidth: "500px", margin: "40px auto" }}>
          ⚠️ No prediction made yet. Please fill in your car details first to see personalized analytics.
          <br /><br />
          <Link to="/predict">
            <button className="btn">Go to Predict →</button>
          </Link>
        </div>
      </div>
    );
  }

  const priceTrend = brandPriceTrend[predictionData.brand] || defaultPriceTrend;
  const depreciation = depreciationData[predictionData.kmDriven] || { value: 60, label: "Average", color: "#f59e0b" };
  const fuel = fuelDemand[predictionData.fuel] || { score: 80, trend: "Stable", color: "#60a5fa" };
  const ownerIndex = ownershipResale.findIndex(o => o.owner === predictionData.ownership);
  const resaleScore = ownershipResale[ownerIndex]?.resale || 70;

  // Pie — condition breakdown
  const conditionData = [
    { name: "Condition Value", value: depreciation.value },
    { name: "Depreciation", value: 100 - depreciation.value },
  ];

  return (
    <div className="dashboard-container">
      <h1>Analytics Dashboard</h1>

      {/* Car summary bar */}
      <div className="prediction-summary-bar">
        📋 Showing analytics for: <strong>{predictionData.brand} {predictionData.model}</strong> &nbsp;|&nbsp;
        {predictionData.year} &nbsp;|&nbsp; {predictionData.fuel} &nbsp;|&nbsp;
        {predictionData.kmDriven} &nbsp;|&nbsp; {predictionData.ownership}
      </div>

      {/* Summary Cards */}
      <div className="dashboard-cards" style={{ marginTop: "20px" }}>
        <div className="dashboard-card">
          <h3>Condition Score</h3>
          <h2 style={{ color: depreciation.color }}>{depreciation.value}%</h2>
          <p className="card-note">{depreciation.label} condition</p>
        </div>
        <div className="dashboard-card">
          <h3>Fuel Demand</h3>
          <h2 style={{ color: fuel.color }}>{fuel.score}%</h2>
          <p className="card-note">{predictionData.fuel} — {fuel.trend}</p>
        </div>
        <div className="dashboard-card">
          <h3>Resale Score</h3>
          <h2 style={{ color: resaleScore > 70 ? "#34d399" : resaleScore > 50 ? "#f59e0b" : "#f87171" }}>{resaleScore}%</h2>
          <p className="card-note">Based on ownership history</p>
        </div>
        <div className="dashboard-card">
          <h3>Market Location</h3>
          <h2 style={{ fontSize: "20px" }}>{predictionData.location}</h2>
          <p className="card-note">Your selected region</p>
        </div>
      </div>

      {/* Price Trend for selected brand */}
      <div className="summary-card" style={{ marginTop: "30px" }}>
        <h2>📈 {predictionData.brand} Price Trend (₹ Lakhs)</h2>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={priceTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e3a8a" />
            <XAxis dataKey="year" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" unit=" L" />
            <Tooltip {...tooltipStyle} formatter={(v) => [`₹${v} Lakh`, "Avg Price"]} />
            <Line type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={3} dot={{ fill: "#60a5fa", r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Condition + Resale side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "30px" }}>

        {/* Condition Pie */}
        <div className="summary-card">
          <h2>🔍 Vehicle Condition</h2>
          <p style={{ color: "#94a3b8", fontSize: "14px" }}>Based on KM driven: <strong style={{ color: "#fff" }}>{predictionData.kmDriven}</strong></p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={conditionData} dataKey="value" cx="50%" cy="50%" outerRadius={80}
                label={({ name, value }) => `${name}: ${value}%`}>
                <Cell fill={depreciation.color} />
                <Cell fill="#1e293b" />
              </Pie>
              <Tooltip {...tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Resale by ownership */}
        <div className="summary-card">
          <h2>👤 Resale Value by Ownership</h2>
          <p style={{ color: "#94a3b8", fontSize: "14px" }}>Your car: <strong style={{ color: "#60a5fa" }}>{predictionData.ownership}</strong></p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ownershipResale}>
              <XAxis dataKey="owner" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" unit="%" />
              <Tooltip {...tooltipStyle} formatter={(v) => [`${v}%`, "Resale Score"]} />
              <Bar dataKey="resale" radius={[6,6,0,0]}>
                {ownershipResale.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.owner === predictionData.ownership ? "#2563eb" : "#1e3a8a"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insurance status insight */}
      <div className="summary-card" style={{ marginTop: "30px" }}>
        <h2>🛡️ Insurance & Documentation Status</h2>
        <div style={{ display: "flex", gap: "20px", marginTop: "15px", flexWrap: "wrap" }}>
          <div className={`insight-chip ${predictionData.insurance?.startsWith("Valid") ? "chip-green" : "chip-red"}`}>
            🔒 Insurance: {predictionData.insurance}
          </div>
          <div className="insight-chip chip-green">
            📄 RC Card: Uploaded ✅
          </div>
          <div className="insight-chip chip-blue">
            📍 Location: {predictionData.location}
          </div>
          <div className="insight-chip chip-blue">
            ⚙️ Transmission: {predictionData.transmission}
          </div>
        </div>
        <p style={{ color: "#94a3b8", marginTop: "20px", fontSize: "14px" }}>
          {predictionData.insurance?.startsWith("Valid")
            ? "✅ Valid insurance increases your car's resale value by up to 10%. Buyers prefer insured vehicles."
            : "⚠️ Expired or missing insurance can reduce your resale value by 8–15%. Consider renewing before selling."}
        </p>
      </div>

    </div>
  );
}

export default Analytics;