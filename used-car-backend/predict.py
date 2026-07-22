import sys
import joblib
import pandas as pd
from datetime import datetime
import os

# Load model and encoders
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model = joblib.load(os.path.join(BASE_DIR, "cars24_xgboost.pkl"))
encoders = joblib.load(os.path.join(BASE_DIR, "encoders.pkl"))

# Read command-line arguments
year = int(sys.argv[1])
car_model = sys.argv[2]
car_variant = sys.argv[3]
km_driven = int(sys.argv[4])
fuel_type = sys.argv[5]
transmission = sys.argv[6]
ownership = sys.argv[7]
location = sys.argv[8]

# Feature Engineering
current_year = datetime.now().year
car_age = current_year - year
km_per_year = km_driven / max(car_age, 1)

owner_num = int(ownership[0]) if ownership[0].isdigit() else 1

premium_brands = [
    "BMW", "Mercedes-Benz", "Audi", "Jaguar", "Volvo", "Lexus"
]

premium_brand = 1 if any(
    brand.lower() in car_model.lower()
    for brand in premium_brands
) else 0


# Safe encoding function
def safe_encode(column_name, value):
    encoder = encoders[column_name]

    if value in encoder.classes_:
        return encoder.transform([value])[0]
    else:
        return encoder.transform([encoder.classes_[0]])[0]


# Encode categorical values
car_model = safe_encode("Car Model", car_model)
car_variant = safe_encode("Car Variant", car_variant)
fuel_type = safe_encode("Fuel Type", fuel_type)
transmission = safe_encode("Transmission Type", transmission)
ownership = safe_encode("Ownership", ownership)
location = safe_encode("Location", location)

# Create DataFrame
data = pd.DataFrame([{
    "Year": year,
    "Car Model": car_model,
    "Car Variant": car_variant,
    "KM Driven": km_driven,
    "Fuel Type": fuel_type,
    "Transmission Type": transmission,
    "Ownership": ownership,
    "Location": location,
    "Car_Age": car_age,
    "KM_Per_Year": km_per_year,
    "Owner_Num": owner_num,
    "Premium_Brand": premium_brand
}])

# Prediction
prediction = model.predict(data)

print(round(float(prediction[0])))