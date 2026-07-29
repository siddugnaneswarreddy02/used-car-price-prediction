import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useCarData } from "../context/CarContext";
import { useState,useEffect } from "react";
import { getMarketData } from "../services/marketApi";
// Price ranges per mileage bucket (in Lakhs)
const mileagePriceMap = {
  "0 - 10000 KM":    { avg: 8.5, high: 11.0, low: 6.5 },
  "10000 - 30000 KM":{ avg: 7.2, high: 9.5,  low: 5.5 },
  "30000 - 50000 KM":{ avg: 6.2, high: 8.0,  low: 4.5 },
  "50000 - 70000 KM":{ avg: 5.0, high: 6.8,  low: 3.5 },
  "70000+ KM":       { avg: 3.8, high: 5.2,  low: 2.5 },
};

// Demand score per fuel type
const fuelDemandMap = {
  Petrol:   88,
  Diesel:   82,
  CNG:      75,
  Electric: 95,
};

const competitiveData = [
  { platform: "OLX",      accuracy: 75, userExperience: 70 },
  { platform: "CarDekho", accuracy: 85, userExperience: 82 },
  { platform: "Cars24",   accuracy: 88, userExperience: 90 },
  { platform: "CarAI", accuracy: 92, userExperience: 95 },
];

function MarketDashboard() {
  const { predictionData } = useCarData();
  const [marketData,setMarketData] = useState(null);

useEffect(()=>{

async function fetchMarket(){

const data = await getMarketData();

setMarketData(data);

}

fetchMarket();

},[]);

  const prices = predictionData?.mileage
    ? mileagePriceMap[predictionData.mileage] || { avg: 6.2, high: 9.5, low: 4.1 }
    : null;

  const demand = predictionData?.fuel
    ? fuelDemandMap[predictionData.fuel] || 85
    : null;

  return (
    <div className="dashboard-container">
      <h1>Market Intelligence Dashboard</h1>

      {/* Summary of selected car */}
      {predictionData ? (
        <div className="prediction-summary-bar">
          📋 Showing data for: <strong>{predictionData.brand} {predictionData.model}</strong> &nbsp;|&nbsp;
          {predictionData.year} &nbsp;|&nbsp;
          {predictionData.fuel} &nbsp;|&nbsp;
          {predictionData.mileage} &nbsp;|&nbsp;
          {predictionData.location}
        </div>
      ) : (
        <div className="no-prediction-bar">
          ⚠️ No prediction made yet. Showing default market data. &nbsp;
          <a href="/predict" className="predict-link">Go to Predict →</a>
        </div>
      )}

      {/* Cards */}
      <div className="dashboard-cards" style={{ marginTop: "20px" }}>
        <div className="dashboard-card">
          <h3>Average Market Price</h3>
          <h2>{prices ? `₹${prices.avg} Lakh` : "₹6.2 Lakh"}</h2>
          {prices && <p className="card-note">Based on your mileage & fuel</p>}
        </div>

        <div className="dashboard-card">
          <h3>Highest Price</h3>
          <h2>{prices ? `₹${prices.high} Lakh` : "₹9.5 Lakh"}</h2>
          {prices && <p className="card-note">Best condition estimate</p>}
        </div>

        <div className="dashboard-card">
          <h3>Lowest Price</h3>
          <h2>{prices ? `₹${prices.low} Lakh` : "₹4.1 Lakh"}</h2>
          {prices && <p className="card-note">High mileage / wear estimate</p>}
        </div>

        <div className="dashboard-card">
          <h3>Demand Score</h3>
          <h2>{demand ? `${demand}%` : "85%"}</h2>
          {demand && <p className="card-note">{predictionData.fuel} demand in market</p>}
        </div>
      </div>

      {/* Competitive Analysis Chart */}
      <div className="summary-card" style={{ marginTop: "40px" }}>
        <h2>Competitive Analysis (Platform Comparison)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={competitiveData}>
            <XAxis stroke="#94a3b8" dataKey="platform" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111827",
                border: "1px solid #1e3a8a",
                color: "#fff",
              }}
            />
            <Legend />
            <Bar dataKey="accuracy" fill="#2563eb" name="Prediction Accuracy (%)"
              radius={[4,4,0,0]}
              label={false}
            />
            <Bar dataKey="userExperience" fill="#60a5fa" name="User Experience (%)"
              radius={[4,4,0,0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default MarketDashboard;