import axios from "axios";

const API_URL = "http://localhost:5000";

export const getAnalytics = async () => {

  try {

    const response = await axios.get(
      `${API_URL}/analytics`
    );

    return response.data;

  }
  catch {

    return {

      condition_score: 90,

      fuel_score: 88,

      resale_score: 85,

      market_location: "Hyderabad"

    };

  }

};