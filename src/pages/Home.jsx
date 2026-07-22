import React from "react";
import { Link } from "react-router-dom";

function Home() {
  const features = [
    { title: "AI Prediction", desc: "Accurate price estimation using real market data.", icon: "🤖", link: "/predict" },
    { title: "Market Dashboard", desc: "Track market trends and price movements.", icon: "📊", link: "/dashboard" },
    { title: "Car Comparison", desc: "Compare similar vehicles side by side.", icon: "🚗", link: "/comparison" },
  ];

  return (
    <div>
      <section className="hero">
        <h1>AI Powered Used Car Price Prediction</h1>
        <p>Predict Accurate Resale Value</p>
        <Link to="/predict">
          <button className="btn">Predict Price</button>
        </Link>
      </section>

      <section className="features">
        {features.map((f, i) => (
          <Link to={f.link} key={i} className="feature-card-link">
            <div className="card feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
              <span className="feature-arrow">→</span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}

export default Home;