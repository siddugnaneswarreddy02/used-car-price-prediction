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


# City name synonyms for better matching
CITY_SYNONYMS = {
    "bangalore": "bengaluru",
    "bengaluru": "bengaluru",
    "delhi": "delhi",
    "mumbai": "mumbai",
    "kolkata": "kolkata",
    "chennai": "chennai",
    "hyderabad": "hyderabad",
    "pune": "pune",
    "ahmedabad": "ahmedabad",
    "jaipur": "jaipur",
    "lucknow": "lucknow",
    "gurgaon": "gurgaon",
    "noida": "noida",
    "chandigarh": "chandigarh",
    "bhopal": "bhopal",
    "indore": "indore",
}


def safe_encode(column_name, value):
    """Encode a categorical value, with fuzzy matching fallback."""
    encoder = encoders[column_name]
    classes = encoder.classes_

    # 1. Exact match
    if value in classes:
        return encoder.transform([value])[0]

    # 2. Fuzzy match: check if value is a substring of any class
    value_lower = value.lower().strip()
    for cls in classes:
        if isinstance(cls, str) and value_lower in cls.lower():
            return encoder.transform([cls])[0]

    # 3. For locations, try extracting city name
    if column_name == "Location":
        # Try matching first word of value within class
        first_word = value.split(",")[0].split(" ")[0].strip().lower()
        for cls in classes:
            if isinstance(cls, str) and first_word in cls.lower():
                return encoder.transform([cls])[0]

        # Try synonym map (e.g. "Bangalore" -> "bengaluru")
        synonym = CITY_SYNONYMS.get(first_word)
        if synonym:
            for cls in classes:
                if isinstance(cls, str) and synonym in cls.lower():
                    return encoder.transform([cls])[0]

        # Try matching ANY word from value against any class word
        value_words = set(value_lower.replace(",", " ").split())
        best_match = None
        best_count = 0
        for cls in classes:
            if isinstance(cls, str):
                cls_words = set(cls.lower().split())
                common = value_words & cls_words
                if len(common) > best_count:
                    best_count = len(common)
                    best_match = cls
        if best_match and best_count > 0:
            print(f"  → Best word match for '{value}': '{best_match}'")
            return encoder.transform([best_match])[0]

    # 4. Last resort: use the first class
    print(f"WARNING: '{value}' not found in {column_name} encoder, using default")
    return encoder.transform([classes[0]])[0]


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
