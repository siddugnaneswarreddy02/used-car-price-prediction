import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCarData } from "../context/CarContext";
import { predictPrice } from "../services/predictionApi";
import {
  modelsByBrand,
  variantsByModel,
  allBrands,
  allYears,
  fuelTypeOptions,
  transmissionOptions,
  ownershipOptions,
} from "../data/carsData";

// ── Autocomplete input (side dropdown) ──
function AutocompleteInput({ label, value, onChange, options, placeholder, disabled, disabledPlaceholder }) {
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 });
  const ref = useRef();
  const inputRef = useRef();

  useEffect(() => { setQuery(value || ""); }, [value]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const calcPos = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropPos({ top: rect.top, left: rect.right + 10 });
    }
  };

  const filtered = options.filter(o => o.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (val) => {
    setQuery(val);
    onChange(val);
    setOpen(false);
  };

  const handleInput = (e) => {
    setQuery(e.target.value);
    onChange("");
    calcPos();
    setOpen(true);
  };

  return (
    <div className="field-group" ref={ref} style={{ position: "relative" }}>
      <label className="field-label">{label} <span className="required-star">*</span></label>
      <input
        ref={inputRef}
        className="autocomplete-input"
        type="text"
        value={query}
        onChange={handleInput}
        onFocus={() => { if (!disabled) { calcPos(); setOpen(true); } }}
        placeholder={disabled ? (disabledPlaceholder || "Select Brand first") : placeholder}
        disabled={disabled}
        autoComplete="off"
      />
      {open && (
        <ul className="autocomplete-dropdown" style={{ top: dropPos.top, left: dropPos.left, position: "fixed" }}>
          {filtered.length > 0
            ? filtered.map((opt, i) => (
                <li key={i} className="autocomplete-item" onMouseDown={() => handleSelect(opt)}>{opt}</li>
              ))
            : <li className="autocomplete-item-empty">No results found</li>
          }
        </ul>
      )}
    </div>
  );
}

// ── Custom select with side dropdown ──
function SideSelect({ label, name, value, onChange, options, placeholder, required }) {
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 });
  const ref = useRef();
  const btnRef = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropPos({ top: rect.top, left: rect.right + 10 });
    }
    setOpen(!open);
  };

  const handleSelect = (val) => {
    onChange({ target: { name, value: val } });
    setOpen(false);
  };

  return (
    <div className="field-group" ref={ref} style={{ position: "relative" }}>
      {label && (
        <label className="field-label">
          {label} {required && <span className="required-star">*</span>}
        </label>
      )}
      <button type="button" ref={btnRef} className="side-select-btn" onClick={handleOpen}>
        <span style={{ color: value ? "#111827" : "#6b7280" }}>{value || placeholder}</span>
        <span style={{ color: "#6b7280" }}>▾</span>
      </button>
      {open && (
        <ul className="autocomplete-dropdown" style={{ top: dropPos.top, left: dropPos.left, position: "fixed" }}>
          {options.map((opt, i) => (
            <li
              key={i}
              className="autocomplete-item"
              style={{ fontWeight: opt === value ? "bold" : "normal", color: opt === value ? "#60a5fa" : "#e2e8f0" }}
              onMouseDown={() => handleSelect(opt)}
            >
              {opt === value ? "✓ " : ""}{opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Main Prediction Component ──
function Prediction() {
  const navigate = useNavigate();
  const { setPredictionData } = useCarData();
  const [error, setError] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [rcFileName, setRcFileName] = useState("");
  const [rcError, setRcError] = useState("");

  const [carData, setCarData] = useState({
    brand: "", model: "", variant: "", year: "", fuel: "", transmission: "",
    kmDriven: "", ownership: "", location: "", electricRange: "",
    batteryCapacity: "", insurance: "", rcCard: null,
  });

  const isElectric = carData.fuel === "Electric";
  const availableModels = carData.brand ? (modelsByBrand[carData.brand] || []) : [];
  const availableVariants = (carData.brand && carData.model)
    ? (variantsByModel[`${carData.brand} ${carData.model}`] || [])
    : [];

  const isFormComplete = () => {
    const base = carData.brand && carData.model && carData.variant && carData.year && carData.fuel &&
      carData.transmission && carData.kmDriven && carData.ownership &&
      carData.location && carData.insurance && carData.rcCard;
    if (isElectric) return base && carData.electricRange && carData.batteryCapacity;
    return base;
  };

  const setField = (field) => (val) => {
    setCarData((prev) => ({
      ...prev,
      [field]: val,
      ...(field === "brand" ? { model: "", variant: "" } : {}),
      ...(field === "model" ? { variant: "" } : {}),
    }));
  };

  const handleChange = (e) => {
    setCarData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRCUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg","image/png","image/jpg","application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      setRcError("❌ Invalid file type. Please upload JPG/PNG or PDF only.");
      setRcFileName("");
      setCarData((p) => ({ ...p, rcCard: null }));
      e.target.value = "";
      return;
    }
    const name = file.name.toLowerCase();
    const rcKw = ["rc","registration","regn","reg_cert","rc_card","rc-card","vehicle_reg","vehicle_registration"];
    const badKw = ["aadhar","aadhaar","pan","passport","license","dl","driving","voter","invoice","birth","salary","bank","statement","resume","cv"];
    if (badKw.some(k => name.includes(k))) {
      setRcError(`❌ "${file.name}" is not an RC Card. Please upload your Vehicle Registration Certificate.`);
      setRcFileName("");
      setCarData((p) => ({ ...p, rcCard: null }));
      e.target.value = "";
      return;
    }
    if (!rcKw.some(k => name.includes(k))) {
      setRcError("⚠️ Could not confirm this is an RC Card. Make sure you're uploading your Vehicle Registration Certificate.");
      setCarData((p) => ({ ...p, rcCard: file }));
      setRcFileName(file.name);
      return;
    }
    setRcError("");
    setCarData((p) => ({ ...p, rcCard: file }));
    setRcFileName(file.name);
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) { alert("Geolocation not supported."); return; }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
          const data = await res.json();
          const city = data.address.city || data.address.town || data.address.village || "Unknown";
          setCarData((p) => ({ ...p, location: city }));
        } catch {
          setCarData((p) => ({ ...p, location: "Location detected" }));
        }
        setLocationLoading(false);
      },
      () => { alert("Unable to get location."); setLocationLoading(false); }
    );
  };

  const handleReset = () => {
    setCarData({ brand:"",model:"",variant:"",year:"",fuel:"",transmission:"",kmDriven:"",ownership:"",location:"",electricRange:"",batteryCapacity:"",insurance:"",rcCard:null });
    setRcFileName("");
    setRcError("");
    setError("");
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!isFormComplete()) {
    setError("⚠ Please fill all required fields before predicting the car price.");
    return;
  }

  try {
    setError("");

    const result = await predictPrice(carData);

    setPredictionData({
      ...carData,
      predicted_price: result.predicted_price,
      confidence_score: result.confidence_score,
      min_price: result.min_price,
      max_price: result.max_price,
    });

    navigate("/result");

  } catch (error) {
    console.error("Prediction error:", error);
    const message = error.message || "Prediction failed";
    if (message.includes("Server error:")) {
      setError(`❌ ${message}`);
    } else if (message.includes("Cannot connect")) {
      setError(`❌ ${message}`);
    } else {
      setError(`❌ Prediction failed: ${message}`);
    }
  }
};
  const locationOptions = ["Hyderabad","Bangalore","Chennai","Mumbai","Delhi","Pune","Kolkata","Ahmedabad","Jaipur","Lucknow",
    ...(carData.location && !["Hyderabad","Bangalore","Chennai","Mumbai","Delhi","Pune","Kolkata","Ahmedabad","Jaipur","Lucknow",""].includes(carData.location) ? [carData.location] : [])
  ];

  return (
    <div className="prediction-container">
      <h1>Used Car Price Prediction</h1>
      <form className="prediction-form" onSubmit={handleSubmit}>

        {error && <p className="error-message">{error}</p>}

        <AutocompleteInput label="Brand" value={carData.brand} onChange={setField("brand")} options={allBrands} placeholder="Type brand name..." />
        <AutocompleteInput label="Model" value={carData.model} onChange={setField("model")} options={availableModels} placeholder="Type model name..." disabled={!carData.brand} />
        <AutocompleteInput label="Variant" value={carData.variant} onChange={setField("variant")} options={availableVariants} placeholder="Type variant name..." disabled={!carData.model} disabledPlaceholder="Select Model first" />
        <AutocompleteInput label="Year" value={carData.year} onChange={setField("year")} options={allYears} placeholder="Type year e.g. 2020" />

        <SideSelect label="Fuel Type" name="fuel" value={carData.fuel} onChange={handleChange} placeholder="Select Fuel Type" required options={fuelTypeOptions} />

        {isElectric && (
          <div className="electric-section">
            <div className="electric-badge">⚡ Electric Vehicle Details</div>
            <SideSelect label="Electric Range (km)" name="electricRange" value={carData.electricRange} onChange={handleChange} placeholder="Select Range" required options={["0 - 150 km","150 - 300 km","300 - 450 km","450+ km"]} />
            <SideSelect label="Battery Capacity (kWh)" name="batteryCapacity" value={carData.batteryCapacity} onChange={handleChange} placeholder="Select Capacity" required options={["Below 30 kWh","30 - 50 kWh","50 - 75 kWh","75+ kWh"]} />
          </div>
        )}

        <SideSelect label="Transmission" name="transmission" value={carData.transmission} onChange={handleChange} placeholder="Select Transmission" required options={transmissionOptions} />
        <SideSelect label="KM Driven" name="kmDriven" value={carData.kmDriven} onChange={handleChange} placeholder="Select KM Driven" required options={["0 - 20,000 KM","20,000 - 50,000 KM","50,000 - 80,000 KM","80,000 - 1,20,000 KM","1,20,000+ KM"]} />
        <SideSelect label="No. of Owners" name="ownership" value={carData.ownership} onChange={handleChange} placeholder="Select Ownership" required options={ownershipOptions} />
        <SideSelect label="Insurance Status" name="insurance" value={carData.insurance} onChange={handleChange} placeholder="Select Insurance" required options={["Valid (Comprehensive)","Valid (Third Party)","Expired","No Insurance"]} />

        {/* Location */}
        <div className="field-group">
          <label className="field-label">Location <span className="required-star">*</span></label>
          <div className="location-row">
            <div style={{ flex: 1 }}>
              <SideSelect name="location" value={carData.location} onChange={handleChange} placeholder="Select Location" options={locationOptions} />
            </div>
            <button type="button" className="location-btn" onClick={handleCurrentLocation} disabled={locationLoading}>
              {locationLoading ? "Detecting..." : "📍 Use Current Location"}
            </button>
          </div>
        </div>

        {/* RC Card Upload */}
        <div className="field-group">
          <label className="field-label">RC Card (Registration Certificate) <span className="required-star">*</span></label>
          <label className="rc-upload-label">
            <input type="file" accept="image/*,application/pdf" onChange={handleRCUpload} className="rc-upload-input" />
            <span className="rc-upload-btn">📄 {rcFileName || "Upload RC Card"}</span>
          </label>
          {rcError && <p className={rcError.startsWith("⚠️") ? "rc-warning" : "rc-error"}>{rcError}</p>}
          {!rcError && rcFileName && <p className="rc-success">✅ RC Card uploaded successfully</p>}
        </div>

        <p className="required-note"><span className="required-star">*</span> Required fields</p>

        <div className="button-group">
          <button type="submit" className={isFormComplete() ? "btn-predict" : "btn-predict btn-predict-disabled"} disabled={!isFormComplete()}>
            {isFormComplete() ? "🔍 Predict Price" : "🔒 Predict Price"}
          </button>
          <button type="button" onClick={handleReset} className="btn-reset">Reset</button>
        </div>

      </form>
    </div>
  );
}

export default Prediction;