import os
from datetime import datetime
from typing import Any, Dict, List, Optional

import joblib
import pandas as pd
import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "cars24_xgboost.pkl")
ENCODERS_PATH = os.path.join(BASE_DIR, "encoders.pkl")

print(f"Loading ML model from {MODEL_PATH}...")
model = joblib.load(MODEL_PATH)
print("Loading categorical encoders from {ENCODERS_PATH}...")
encoders = joblib.load(ENCODERS_PATH)
print("ML Model and encoders successfully loaded.")

app = FastAPI(
    title="Cars24 Price Prediction Backend",
    description="Unified Asynchronous FastAPI backend for Used Car Price Prediction",
    version="2.0.0",
)

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PREMIUM_BRANDS = ["BMW", "Mercedes-Benz", "Audi", "Jaguar", "Volvo", "Lexus"]

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


def safe_encode(column_name: str, value: str):
    """Encode a categorical value with fuzzy matching fallback."""
    encoder = encoders[column_name]
    classes = encoder.classes_

    # 1. Exact match
    if value in classes:
        return encoder.transform([value])[0]

    # 2. Fuzzy match: check if value is a substring of any class
    value_lower = str(value).lower().strip()
    for cls in classes:
        if isinstance(cls, str) and value_lower in cls.lower():
            return encoder.transform([cls])[0]

    # 3. For locations, try city name matching & synonyms
    if column_name == "Location":
        first_word = str(value).split(",")[0].split(" ")[0].strip().lower()
        for cls in classes:
            if isinstance(cls, str) and first_word in cls.lower():
                return encoder.transform([cls])[0]

        synonym = CITY_SYNONYMS.get(first_word)
        if synonym:
            for cls in classes:
                if isinstance(cls, str) and synonym in cls.lower():
                    return encoder.transform([cls])[0]

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

    # 4. Fallback to default class
    print(f"WARNING: '{value}' not found in {column_name} encoder, using fallback default.")
    return encoder.transform([classes[0]])[0]


class PredictRequest(BaseModel):
    year: int = Field(..., description="Manufacturing year")
    car_model: str = Field(..., description="Brand and model of the car")
    car_variant: str = Field(..., description="Car variant/trim")
    km_driven: int = Field(..., description="Total kilometers driven")
    fuel_type: str = Field(..., description="Fuel type (Petrol, Diesel, CNG, Electric)")
    transmission: str = Field(..., description="Transmission (Manual, Automatic)")
    ownership: str = Field(..., description="Ownership status (e.g., 1st owner)")
    location: str = Field(..., description="City / Region")
    insurance: Optional[str] = Field("Unknown", description="Insurance type")


class PredictResponse(BaseModel):
    predicted_price_lakhs: float
    predicted_price_rupees: int


@app.get("/")
async def root():
    return {
        "status": "ok",
        "message": "Cars24 Price Prediction Asynchronous Backend Running",
        "version": "2.0.0",
    }


@app.post("/predict", response_model=PredictResponse)
async def predict(req: PredictRequest):
    try:
        current_year = datetime.now().year
        car_age = current_year - req.year
        km_per_year = req.km_driven / max(car_age, 1)

        owner_str = req.ownership.strip()
        owner_num = int(owner_str[0]) if (owner_str and owner_str[0].isdigit()) else 1

        premium_brand = 1 if any(
            b.lower() in req.car_model.lower() for b in PREMIUM_BRANDS
        ) else 0

        features = pd.DataFrame([{
            "Year": req.year,
            "Car Model": safe_encode("Car Model", req.car_model),
            "Car Variant": safe_encode("Car Variant", req.car_variant),
            "KM Driven": req.km_driven,
            "Fuel Type": safe_encode("Fuel Type", req.fuel_type),
            "Transmission Type": safe_encode("Transmission Type", req.transmission),
            "Ownership": safe_encode("Ownership", req.ownership),
            "Location": safe_encode("Location", req.location),
            "Car_Age": car_age,
            "KM_Per_Year": km_per_year,
            "Owner_Num": owner_num,
            "Premium_Brand": premium_brand,
        }])

        prediction = model.predict(features)
        price_lakhs = round(float(prediction[0]), 2)
        price_rupees = round(price_lakhs * 100000)

        return PredictResponse(
            predicted_price_lakhs=price_lakhs,
            predicted_price_rupees=price_rupees,
        )
    except Exception as exc:
        print(f"Error during prediction: {exc}")
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(exc)}",
        )


@app.get("/analytics")
async def get_analytics():
    return {
        "condition_score": 90,
        "fuel_score": 88,
        "resale_score": 85,
        "market_location": "Hyderabad",
    }


@app.post("/comparison")
async def get_comparison(request: Request):
    try:
        body = await request.json()
    except Exception:
        body = {}

    brand = body.get("brand", "Hyundai")
    return [
        {
            "model": f"{brand} i20" if brand != "Hyundai" else "Hyundai i20",
            "price": 620000,
            "fuel": body.get("fuel", "Petrol"),
            "year": "2019-2024",
        },
        {
            "model": f"{brand} Verna" if brand != "Hyundai" else "Hyundai Verna",
            "price": 850000,
            "fuel": body.get("fuel", "Petrol"),
            "year": "2018-2024",
        },
        {
            "model": f"{brand} Creta" if brand != "Hyundai" else "Hyundai Creta",
            "price": 1100000,
            "fuel": body.get("fuel", "Petrol"),
            "year": "2019-2024",
        },
    ]


@app.get("/market-trends")
async def get_market_trends():
    return {
        "average_price": "6.2",
        "highest_price": "9.5",
        "lowest_price": "4.1",
        "demand_score": "85",
    }


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

