import React from "react";
import "./App.css";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AppRoutes from "./routes/AppRoutes";
import { CarProvider } from "./context/CarContext.jsx";

function App() {
  return (
    <CarProvider>
      <Navbar />
      <AppRoutes />
      <Footer />
    </CarProvider>
  );
}

export default App;