import React from "react";
import { useCarData } from "../context/CarContext";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getComparisonCars } from "../services/comparisonApi";
import {
  comparisonData as COMPARISON_DATA,
  modelPrices as MODEL_PRICES,
  yearMult as YEAR_MULT,
  kmMult as KM_MULT,
  ownMult as OWN_MULT,
} from "../data/marketData";

function formatPrice(lakhs) {
  return "₹" + Math.round(lakhs * 100000).toLocaleString("en-IN");
}

function getSimilarCars(predictionData) {
  if (!predictionData) return [];
  const { brand, model, fuel, year, kmDriven, ownership } = predictionData;
  const brandData = COMPARISON_DATA[brand] || [];
  const userPrice = (MODEL_PRICES[`${brand}|${model}`] || 6.0) *
    (YEAR_MULT[parseInt(year)] || 1.0) *
    (KM_MULT[kmDriven] || 1.0) *
    (OWN_MULT[ownership] || 1.0);

  // Find similar cars: same brand, similar fuel, exclude same model
  let similar = brandData.filter(c => c.model !== model);

  // Prefer same fuel type
  const sameFuel = similar.filter(c => c.fuel === fuel);
  if (sameFuel.length >= 2) similar = sameFuel;

  // Sort by price proximity to user's car
  similar = similar
    .map(c => ({
      ...c,
      adjustedPrice: c.price * (YEAR_MULT[parseInt(year)] || 1.0) * (KM_MULT[kmDriven] || 1.0) * (OWN_MULT[ownership] || 1.0),
    }))
    .sort((a, b) => Math.abs(a.adjustedPrice - userPrice) - Math.abs(b.adjustedPrice - userPrice))
    .slice(0, 3);

  return { similar, userPrice };
}

function Comparison() {
  const { predictionData } = useCarData();
  const [cars, setCars] = useState([]);
  useEffect(() => {

  async function fetchCars() {

    if (predictionData) {

      const data = await getComparisonCars(predictionData);

      setCars(data);

    }

  }

  fetchCars();

}, [predictionData]);

  if (!predictionData) {
    return (
      <div className="dashboard-container" style={{ textAlign:"center", paddingTop:"80px" }}>
        <h1>Car Comparison</h1>
        <div className="no-prediction-bar" style={{ maxWidth:"500px", margin:"40px auto" }}>
          ⚠️ No prediction made yet. Please fill the prediction form first.
          <br /><br />
          <Link to="/predict"><button className="btn">Go to Predict →</button></Link>
        </div>
      </div>
    );
  }

  const userPrice = predictionData?.predicted_price || 650000;
  const ourCar = {
    model: `${predictionData.brand} ${predictionData.model}`,
    price: userPrice,
    fuel: predictionData.fuel,
    year: predictionData.year,
    isOurs: true,
  };

  const allCars = [ourCar, ...cars.map(c => ({
    model: `${predictionData.brand} ${c.model}`,
    price: c.price,
    fuel: c.fuel,
    year: c.year,
    isOurs: false,
    diff: c.price - userPrice,
  }))];

  return (
    <div className="dashboard-container">
      <h1>Car Comparison</h1>

      <div className="prediction-summary-bar">
        📋 Comparing: <strong>{predictionData.brand} {predictionData.model}</strong> &nbsp;|&nbsp;
        {predictionData.year} &nbsp;|&nbsp; {predictionData.fuel} &nbsp;|&nbsp; {predictionData.kmDriven}
      </div>

      <div className="dashboard-cards" style={{ marginTop:"20px" }}>
        {allCars.map((car, i) => (
          <div className={`dashboard-card ${car.isOurs ? "our-app-card" : ""}`} key={i}>
            {car.isOurs && <div className="our-app-badge">⭐ Your Car (CarAI)</div>}
            <h3>{car.model}</h3>
            <p style={{ color:"#94a3b8", fontSize:"13px" }}>{car.fuel} &nbsp;|&nbsp; {car.year}</p>
            <h2 style={{ color: car.isOurs ? "#60a5fa" : "white" }}>{formatPrice(car.price)}</h2>
            {!car.isOurs && (
              <p style={{ color: car.diff > 0 ? "#f87171" : "#34d399", fontWeight:"bold" }}>
                {car.diff > 0 ? `+${formatPrice(car.diff)} costlier` : `${formatPrice(Math.abs(car.diff))} cheaper`}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="summary-card" style={{ marginTop:"30px" }}>
        <h2>Comparison Insight</h2>
        <p>
          Your <strong>{predictionData.brand} {predictionData.model}</strong> is priced at <strong>{formatPrice(userPrice)}</strong>.
          Compared to similar {predictionData.brand} models, your car is competitively priced based on its year, mileage, and ownership history.
          {predictionData.fuel === "Electric" && " Electric vehicles command a premium in the current market."}
          {predictionData.fuel === "Diesel" && " Diesel variants typically hold higher resale value."}
        </p>
      </div>
    </div>
  );
}

export default Comparison;