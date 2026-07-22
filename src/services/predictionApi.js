import axios from "axios";
import { API_URL } from "./apiUrl";

export const predictPrice = async (carData) => {
  const KM_BUCKET_VALUES = {
    "0 - 20,000 KM": 10000,
    "20,000 - 50,000 KM": 35000,
    "50,000 - 80,000 KM": 65000,
    "80,000 - 1,20,000 KM": 100000,
    "1,20,000+ KM": 140000,
  };

  const requestData = {
    year: parseInt(carData.year),
    car_model: `${carData.brand} ${carData.model}`.trim(),
    car_variant: carData.variant,
    km_driven: KM_BUCKET_VALUES[carData.kmDriven] || 0,
    fuel_type: carData.fuel,
    transmission: carData.transmission,
    ownership: carData.ownership,
    location: carData.location,
  };

  console.log("Sending data to backend:", requestData);

  const response = await axios.post(
    `${API_URL}/predict`,
    requestData
  );

  return {
    predicted_price:
      response.data.predicted_price_rupees,
    confidence_score: 92,
    min_price:
      response.data.predicted_price_rupees - 50000,
    max_price:
      response.data.predicted_price_rupees + 50000,
  };
};