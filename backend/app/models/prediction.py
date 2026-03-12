import os
import random
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

_db = None

def get_db():
    global _db
    if _db is None:
        uri = os.getenv("MONGODB_URI")
        if uri:
            client = MongoClient(uri)
            _db = client["IndiaInnovates"]
    return _db

def predict_hotspot_risks(rainfall_mm: float, ward_filter: str = "ALL"):
    """
    Simulates AI/LSTM output predicting the flood depth and risk
    per hotspot based on dynamic rain input, fetched from MongoDB.
    """
    db = get_db()
    if db is not None:
        query = {} if ward_filter == "ALL" else {"ward": ward_filter}
        hotspots = list(db["hotspots"].find(query))
    else:
        # Fallback if no DB configured
        hotspots = []

    results = []
    for hs in hotspots:
        # Complex non-linear mock behavior scaling with rain,
        # mimicking an LSTM response curve
        rain_factor = (rainfall_mm / 100.0) ** 1.5 
        
        # Lower elevation, higher imperviousness = more risk
        vuln_factor = (1.0 / hs["elevation"]) * hs["imperviousness"] * 10 
        
        risk_score = min(100.0, hs["base_risk"] + (rain_factor * vuln_factor * 100))
        
        # Determine risk level
        if risk_score > 80:
            status = "CRITICAL"
        elif risk_score > 50:
            status = "HIGH"
        elif risk_score > 25:
            status = "MODERATE"
        else:
            status = "LOW"
            
        # Additional metrics for pitch
        predicted_depth = round((risk_score / 100.0) * 1.5, 2)
        siltation_pct = round(random.uniform(20, 85), 1)
        time_to_peak = round(max(15, 120 - risk_score))
        
        results.append({
            "id": hs["id"],
            "lat": hs["lat"],
            "lng": hs["lng"],
            "ward": hs["ward"],
            "elevation": round(hs["elevation"], 1),
            "risk_score": round(risk_score, 2),
            "status": status,
            "predicted_depth_m": predicted_depth,
            "siltation_pct": siltation_pct,
            "time_to_peak_mins": time_to_peak,
            "flood_peak_delta_hrs": 3.7,
            "year_built": hs.get("year_built", 1960),
            "last_reconstruction": hs.get("last_reconstruction", None),
            "built_capacity_mm_hr": hs.get("built_capacity_mm_hr", 40.0),
            "current_load_pct": hs.get("current_load_pct", 100.0)
        })
    return results
