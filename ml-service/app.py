import os
from datetime import datetime

import joblib
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model = joblib.load(os.path.join(BASE_DIR, "cars24_xgboost.pkl"))
encoders = joblib.load(os.path.join(BASE_DIR, "encoders.pkl"))

app = Flask(__name__)
CORS(app)

PREMIUM_BRANDS = ["BMW", "Mercedes-Benz", "Audi", "Jaguar", "Volvo", "Lexus"]

REQUIRED_FIELDS = [
    "year", "car_model", "car_variant", "km_driven",
    "fuel_type", "transmission", "ownership", "location",
]


def safe_encode(column_name, value):
    encoder = encoders[column_name]
    if value in encoder.classes_:
        return encoder.transform([value])[0]
    return encoder.transform([encoder.classes_[0]])[0]


@app.get("/")
def health():
    return jsonify(status="ok")


@app.post("/predict")
def predict():
    payload = request.get_json(force=True, silent=True) or {}

    missing = [f for f in REQUIRED_FIELDS if payload.get(f) in (None, "")]
    if missing:
        return jsonify(error=f"Missing fields: {', '.join(missing)}"), 400

    try:
        year = int(payload["year"])
        car_model = payload["car_model"]
        car_variant = payload["car_variant"]
        km_driven = int(payload["km_driven"])
        fuel_type = payload["fuel_type"]
        transmission = payload["transmission"]
        ownership = payload["ownership"]
        location = payload["location"]

        current_year = datetime.now().year
        car_age = current_year - year
        km_per_year = km_driven / max(car_age, 1)
        owner_num = int(ownership[0]) if ownership[0].isdigit() else 1
        premium_brand = 1 if any(
            brand.lower() in car_model.lower() for brand in PREMIUM_BRANDS
        ) else 0

        data = pd.DataFrame([{
            "Year": year,
            "Car Model": safe_encode("Car Model", car_model),
            "Car Variant": safe_encode("Car Variant", car_variant),
            "KM Driven": km_driven,
            "Fuel Type": safe_encode("Fuel Type", fuel_type),
            "Transmission Type": safe_encode("Transmission Type", transmission),
            "Ownership": safe_encode("Ownership", ownership),
            "Location": safe_encode("Location", location),
            "Car_Age": car_age,
            "KM_Per_Year": km_per_year,
            "Owner_Num": owner_num,
            "Premium_Brand": premium_brand,
        }])

        prediction = model.predict(data)
    except Exception as exc:
        return jsonify(error="Prediction failed", details=str(exc)), 500

    price_lakhs = round(float(prediction[0]), 2)
    return jsonify(
        predicted_price_lakhs=price_lakhs,
        predicted_price_rupees=round(price_lakhs * 100000),
    )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port)
