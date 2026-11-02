# 🚗 Used Car Price Prediction Platform

A full-stack, machine learning-driven web application to predict used car market valuations in India. Built with a **high-performance Asynchronous FastAPI backend** and a **responsive React (Vite) frontend**.

---

## 🌟 Key Features

- **Accurate Price Valuation**: Predicts used car prices based on make, model, variant, year, mileage, fuel type, transmission, ownership history, and location using an **XGBoost Regressor** trained on real Cars24 market data.
- **Asynchronous FastAPI Backend**: Built on ASGI (`asyncio` + `uvicorn`) for high concurrency, ultra-low latency, and efficient ML inference.
- **Single Unified Backend Architecture**: Consolidates ML model serving, data preprocessing, fuzzy city matching, analytics, and market comparison into a single `backend/` service.
- **Interactive Analytics & Trends**: Visual charts for depreciation, fuel demand trends, ownership resale scores, and competitor pricing using Recharts.
- **Fuzzy Location Matching**: Handles Indian city name variations and synonyms (e.g., *Bangalore* ↔ *Bengaluru*).
- **One-Command Dev Launcher**: Run both the asynchronous backend and frontend concurrently with `npm start`.
- **Production-Ready Blueprint**: Pre-configured `render.yaml` for zero-configuration deployment on Render.

---

## 🏗️ Architecture

```
used-car-price-prediction/
├── backend/                  # Unified Asynchronous FastAPI Service
│   ├── main.py               # FastAPI application & ML inference endpoints
│   ├── app.py                # ASGI application alias
│   ├── cars24_xgboost.pkl    # Trained XGBoost regression model (tracked in Git)
│   ├── encoders.pkl          # Categorical label encoders (tracked in Git)
│   ├── Cars24.csv            # Cars24 dataset
│   ├── create_encoders.py    # Encoder generation utility
│   ├── requirements.txt      # Python dependencies (FastAPI, Uvicorn, XGBoost, Pandas)
│   └── runtime.txt           # Pinned Python version (3.11.9)
├── src/                      # React Frontend Application
│   ├── components/           # UI components (Navbar, AnalyticsCards, Forms, etc.)
│   ├── pages/                # Pages (Home, Prediction, Result, Analytics, Comparison, MarketDashboard)
│   ├── services/             # API clients (predictionApi, analyticsApi, comparisonApi, marketApi)
│   ├── context/              # CarContext state provider
│   └── data/                 # Market and car catalog metadata
├── public/                   # Static public assets
├── render.yaml               # Render Infrastructure-as-Code deployment blueprint
├── server.js                 # Unified dev runner (ES Module, runs FastAPI + Vite)
├── package.json              # Frontend & platform script definitions
└── vite.config.js            # Vite build & local API proxy configuration
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.11 or v3.12)
- **Git**

### 2. Install Dependencies

Install frontend dependencies:
```bash
npm install
```

Install backend Python dependencies:
```bash
pip install -r backend/requirements.txt
```

### 3. Launch the Application

Start both the **FastAPI backend** (port `5000`) and the **React frontend** (port `5173`) with a single command:
```bash
npm start
```

Open your browser at:
- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API & Swagger Docs**: [http://localhost:5000/docs](http://localhost:5000/docs)

---

## 🛠️ Individual Service Commands

Run backend independently:
```bash
npm run start:backend
# Starts uvicorn on http://localhost:5000 with auto-reload
```

Run frontend independently:
```bash
npm run dev
# Starts Vite dev server on http://localhost:5173
```

Build frontend for production:
```bash
npm run build
```

---

## 📡 API Reference

All backend endpoints run under `http://localhost:5000` (or your deployed Render backend URL):

### 1. Health Check
- **`GET /`**
  - Returns backend status and API version.

### 2. Predict Price
- **`POST /predict`**
  - **Payload**:
    ```json
    {
      "year": 2019,
      "car_model": "Hyundai Creta",
      "car_variant": "1.6 CRDi SX",
      "km_driven": 35000,
      "fuel_type": "Diesel",
      "transmission": "Manual",
      "ownership": "1st owner",
      "location": "Hyderabad",
      "insurance": "Comprehensive"
    }
    ```
  - **Response**:
    ```json
    {
      "predicted_price_lakhs": 9.25,
      "predicted_price_rupees": 925000
    }
    ```

### 3. Analytics
- **`GET /analytics`**
  - Returns condition scores, fuel scores, and resale valuation metrics.

### 4. Comparison
- **`POST /comparison`**
  - Returns market-comparable vehicles across similar segment and fuel type.

### 5. Market Trends
- **`GET /market-trends`**
  - Returns average, high, low market prices and demand indices.

---

## ☁️ Deployment (Render)

This repository includes a production-ready `render.yaml` Blueprint that deploys **only the two necessary services**:
1. **`used-car-backend`** (Python Web Service):
   - Root Directory: `backend`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Python Version: `3.11.9`
2. **`used-car-frontend`** (Static Site):
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Environment Variable: `VITE_API_URL` automatically links to the backend's live URL.

---

## 📦 Model Artifacts & Git
The trained model (`backend/cars24_xgboost.pkl`) and encoders (`backend/encoders.pkl`) are tracked in the repository and available directly in GitHub.
