import pandas as pd
from sklearn.preprocessing import LabelEncoder
import joblib

df = pd.read_csv("Cars24.csv")

# Remove extra spaces from all text columns
for col in df.columns:
    if df[col].dtype == "object":
        df[col] = df[col].astype(str).str.strip()

encoders = {}

categorical_cols = [
    "Car Model",
    "Car Variant",
    "Fuel Type",
    "Transmission Type",
    "Location",
    "Ownership"
]

for col in categorical_cols:
    le = LabelEncoder()
    le.fit(df[col])
    encoders[col] = le

joblib.dump(encoders, "encoders.pkl")

print("encoders.pkl created successfully")