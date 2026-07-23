import axios from "axios";
import { API_URL } from "./apiUrl";

const OWNERSHIP_MAP = {
  "1st owner": "1st owner",
  "2nd owner": "2nd owner",
  "3rd owner": "3rd owner",
  "4th owner": "4th owner",
  "5th owner": "5th owner",
  "6th owner": "6th owner",
  "7th owner": "7th owner",
  "8th owner": "8th owner",
  "10th owner": "10th owner",
};

const KM_BUCKET_VALUES = {
  "0 - 20,000 KM": 10000,
  "20,000 - 50,000 KM": 35000,
  "50,000 - 80,000 KM": 65000,
  "80,000 - 1,20,000 KM": 100000,
  "1,20,000+ KM": 140000,
};

export const predictPrice = async (carData) => {
  // Validate required fields
  if (!carData.brand || !carData.model || !carData.variant || !carData.year) {
    throw new Error("Please fill in Brand, Model, Variant, and Year");
  }
  if (!carData.fuel || !carData.transmission || !carData.kmDriven) {
    throw new Error("Please fill in Fuel, Transmission, and KM Driven");
  }
  if (!carData.ownership || !carData.location) {
    throw new Error("Please fill in Ownership and Location");
  }

  const requestData = {
    year: parseInt(carData.year),
    car_model: `${carData.brand} ${carData.model}`.trim(),
    car_variant: carData.variant,
    km_driven: KM_BUCKET_VALUES[carData.kmDriven] || 0,
    fuel_type: carData.fuel,
    transmission: carData.transmission,
    ownership: OWNERSHIP_MAP[carData.ownership] || carData.ownership,
    location: carData.location,
    insurance: carData.insurance || "Unknown",
  };

  console.log("Sending data to backend:", requestData);

  try {
    const response = await axios.post(
      `${API_URL}/predict`,
      requestData
    );

    console.log("Backend response:", response.data);

    if (!response.data || response.data.predicted_price_rupees === undefined) {
      throw new Error(response.data?.error || "Invalid response from server");
    }

    return {
      predicted_price: response.data.predicted_price_rupees,
      confidence_score: 92,
      min_price: response.data.predicted_price_rupees - 50000,
      max_price: response.data.predicted_price_rupees + 50000,
    };
  } catch (err) {
    if (err.code === "ERR_NETWORK") {
      throw new Error(
        "Cannot connect to server. Please ensure:\n" +
        "1. Backend is running on port 5000\n" +
        "2. ML service is running on port 8000\n" +
        "Run: cd used-car-backend && node server.js"
      );
    }
    if (err.response) {
      const msg = err.response.data?.details || err.response.data?.error || err.message;
      throw new Error(`Server error: ${msg}`);
    }
    throw err;
  }
};
