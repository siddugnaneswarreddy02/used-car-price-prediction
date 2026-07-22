import axios from "axios";

const API_URL = "http://localhost:5000";

export const getComparisonCars = async (carData) => {

  try {

    const response = await axios.post(
      `${API_URL}/comparison`,
      carData
    );

    return response.data;

  } catch (error) {

    return [
      {
        model: "Hyundai i20",
        price: 620000,
        fuel: "Petrol",
        year: "2019-2024"
      },
      {
        model: "Hyundai Verna",
        price: 850000,
        fuel: "Petrol",
        year: "2018-2024"
      },
      {
        model: "Hyundai Creta",
        price: 1100000,
        fuel: "Petrol",
        year: "2019-2024"
      }
    ];

  }

};