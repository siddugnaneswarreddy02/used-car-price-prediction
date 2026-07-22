const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

const normalizeUrl = (url) =>
    /^https?:\/\//i.test(url) ? url.replace(/\/$/, "") : `https://${url}`;

const ML_SERVICE_URL = normalizeUrl(process.env.ML_SERVICE_URL || "http://localhost:8000");

app.get("/", (req, res) => {
    res.send("Cars24 Price Prediction API Running");
});

app.post("/predict", async (req, res) => {
    console.log("PREDICT API HIT");
    console.log("\n========== NEW REQUEST ==========");
    console.log("Request Body:", req.body);

    const {
        year,
        car_model,
        car_variant,
        km_driven,
        fuel_type,
        transmission,
        ownership,
        location
    } = req.body;

    // Validation
    if (
        year === undefined ||
        !car_model ||
        !car_variant ||
        km_driven === undefined ||
        !fuel_type ||
        !transmission ||
        !ownership ||
        !location
    ) {
        console.log("Validation failed.");

        return res.status(400).json({
            error: "All fields are required"
        });
    }

    console.log("Validation successful. Calling ML service...");

    try {
        const { data } = await axios.post(`${ML_SERVICE_URL}/predict`, {
            year,
            car_model,
            car_variant,
            km_driven,
            fuel_type,
            transmission,
            ownership,
            location
        });

        console.log("Predicted Price (Lakhs):", data.predicted_price_lakhs);
        console.log("Sending response to frontend...");

        res.json(data);
    } catch (error) {
        console.error("ML service error:", error.message);

        const status = error.response?.status || 502;

        return res.status(status).json({
            error: "Prediction failed",
            details: error.response?.data || error.message
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
