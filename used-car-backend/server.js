const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "10mb" }));

const normalizeUrl = (url) => {
    // Ensure the URL has a protocol
    let normalized = /^https?:\/\//i.test(url)
        ? url.replace(/\/$/, "")
        : `https://${url}`;

    // Fix Render URLs that are missing .onrender.com (e.g. "https://used-car-ml-service")
    try {
        const u = new URL(normalized);
        const hostname = u.hostname;
        if (
            hostname !== "localhost" &&
            hostname !== "127.0.0.1" &&
            !hostname.includes(".") &&
            !hostname.endsWith(".onrender.com")
        ) {
            normalized = `${normalized}.onrender.com`;
            console.log(`[normalizeUrl] Fixed Render URL: ${normalized}`);
        }
    } catch (e) {
        // ignore invalid URLs
    }

    return normalized;
};

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
        const mlResponse = await axios.post(
            `${ML_SERVICE_URL}/predict`,
            {
                year: parseInt(year),
                car_model,
                car_variant,
                km_driven: parseInt(km_driven),
                fuel_type,
                transmission,
                ownership,
                location,
            },
            {
                timeout: 30000,
                headers: { "Content-Type": "application/json" },
            }
        );

        const data = mlResponse.data;
        console.log("ML Response:", JSON.stringify(data, null, 2));

        res.json({
            predicted_price_lakhs: data.predicted_price_lakhs,
            predicted_price_rupees: data.predicted_price_rupees,
        });
    } catch (error) {
        console.error("ML service call failed:");

        if (error.code === "ECONNREFUSED") {
            console.error("  → ML Service is not running on", ML_SERVICE_URL);
            return res.status(502).json({
                error: "Prediction service is not available",
                details: "ML backend is offline. Start it with: cd ml-service && python app.py",
            });
        }

        if (error.code === "ECONNABORTED") {
            console.error("  → Request timed out");
            return res.status(504).json({
                error: "Prediction service timed out",
                details: "The ML model took too long to respond. Try again.",
            });
        }

        const status = error.response?.status || 500;
        const errorData = error.response?.data || {};

        console.error("  → Status:", status);
        console.error("  → Details:", JSON.stringify(errorData));

        return res.status(status).json({
            error: errorData.error || "Prediction failed",
            details: errorData.details || error.message,
        });
    }
});

// ── Express 5 Global Error Handler ──
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
        error: "Internal server error",
        details: err.message,
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`\n✓ Backend server running on http://localhost:${PORT}`);
    console.log(`✓ ML Service URL: ${ML_SERVICE_URL}\n`);
});
