import React from "react";
import { Link } from "react-router-dom";
import { useCarData } from "../context/CarContext";

function Result() {
  const { predictionData } = useCarData();

  const formatPrice = (value) => {
    if (!value) return "₹0";
    return "₹" + Number(value).toLocaleString("en-IN");
  };

  if (!predictionData || !predictionData.predicted_price) {
    return (
      <div className="result-container" style={{ textAlign: "center", paddingTop: "80px" }}>
        <h1>Prediction Result</h1>

        <div className="no-prediction-bar" style={{ maxWidth: "500px", margin: "40px auto" }}>
          ⚠️ No prediction data found. Please fill the prediction form first.
          <br /><br />
          <Link to="/predict">
            <button className="btn">Go to Predict →</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="result-container">
      <h1>Prediction Result</h1>

      <div className="result-card">
        <h2>Predicted Price</h2>

        <h1 style={{ fontSize: "42px", color: "#60a5fa", margin: "10px 0" }}>
          {formatPrice(predictionData.predicted_price)}
        </h1>

        <p>
          Confidence Score:{" "}
          <strong style={{ color: "#34d399" }}>
            {predictionData.confidence_score}%
          </strong>
        </p>

        <p>
          Price Range:{" "}
          <strong>{formatPrice(predictionData.min_price)}</strong> –{" "}
          <strong>{formatPrice(predictionData.max_price)}</strong>
        </p>
      </div>

      <div className="summary-card">
        <h2>Vehicle Summary</h2>

        <p>Brand: <strong>{predictionData.brand}</strong></p>
        <p>Model: <strong>{predictionData.model}</strong></p>
        <p>Variant: <strong>{predictionData.variant}</strong></p>
        <p>Year: <strong>{predictionData.year}</strong></p>
        <p>Fuel: <strong>{predictionData.fuel}</strong></p>
        <p>Transmission: <strong>{predictionData.transmission}</strong></p>
        <p>KM Driven: <strong>{predictionData.kmDriven}</strong></p>
        <p>Ownership: <strong>{predictionData.ownership}</strong></p>
        <p>Location: <strong>{predictionData.location}</strong></p>
        <p>Insurance: <strong>{predictionData.insurance}</strong></p>
      </div>

      <div style={{ textAlign: "center", marginTop: "25px" }}>
        <Link to="/dashboard">
          <button className="btn" style={{ marginRight: "10px" }}>
            View Market Dashboard
          </button>
        </Link>

        <Link to="/comparison">
          <button className="btn">
            Compare Similar Cars
          </button>
        </Link>
      </div>

      <div style={{ textAlign: "center", marginTop: "15px" }}>
        <Link to="/analytics">
          <button className="btn">
            View Analytics
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Result;