import React, { createContext, useContext, useState } from "react";

const CarContext = createContext();

export function CarProvider({ children }) {
  const [predictionData, setPredictionData] = useState(null);

  return (
    <CarContext.Provider value={{ predictionData, setPredictionData }}>
      {children}
    </CarContext.Provider>
  );
}

export function useCarData() {
  return useContext(CarContext);
}