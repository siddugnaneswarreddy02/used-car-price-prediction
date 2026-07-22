const express = require("express");
const cors = require("cors");
const { execFile } = require("child_process");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Cars24 Price Prediction API Running");
});

app.post("/predict", (req, res) => {
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

    console.log("Validation successful. Calling Python script...");

    const pythonFile = path.join(__dirname, "predict.py");

    execFile(
        "py",
        [
            pythonFile,
            String(year),
            String(car_model),
            String(car_variant),
            String(km_driven),
            String(fuel_type),
            String(transmission),
            String(ownership),
            String(location)
        ],
        (error, stdout, stderr) => {
            console.log("Python stdout:", stdout);
            console.log("Python stderr:", stderr);

            if (error) {
                console.error("Python execution error:", error);

                return res.status(500).json({
                    error: "Prediction failed",
                    details: stderr || error.message
                });
            }

            const output = stdout.trim();
            const priceLakhs = parseFloat(output);

            if (isNaN(priceLakhs)) {
                console.error("Invalid output from Python:", output);

                return res.status(500).json({
                    error: "Invalid prediction output from Python",
                    raw_output: output,
                    stderr: stderr
                });
            }

            console.log(
                "Predicted Price (Lakhs):",
                priceLakhs
            );

            console.log(
                "Sending response to frontend..."
            );

            res.json({
                predicted_price_lakhs: priceLakhs,
                predicted_price_rupees: Math.round(
                    priceLakhs * 100000
                )
            });
        }
    );
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});