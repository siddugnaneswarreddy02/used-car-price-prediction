import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Prediction from "../pages/Prediction";
import Result from "../pages/Result";
import MarketDashboard from "../pages/MarketDashboard";
import Comparison from "../pages/Comparison";
import Analytics from "../pages/Analytics";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/predict" element={<Prediction />} />
      <Route path="/result" element={<Result />} />
      <Route path="/dashboard" element={<MarketDashboard />} />
      <Route path="/comparison" element={<Comparison />} />
      <Route path="/analytics" element={<Analytics />} />
    </Routes>
  );
}

export default AppRoutes;