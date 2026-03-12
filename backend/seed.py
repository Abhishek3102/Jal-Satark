import os
import random
import numpy as np
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MUMBAI_CENTER = {"lat": 19.0760, "lng": 72.8777}
NUM_HOTSPOTS = 2500

def seed():
    uri = os.getenv("MONGODB_URI")
    if not uri:
        print("No MONGODB_URI found. Cannot seed.")
        return

    client = MongoClient(uri)
    db = client["IndiaInnovates"]
    collection = db["hotspots"]

    # We want to drop and re-create to fix the geography bounds
    collection.delete_many({})
    print("Cleared existing hotspots. Re-seeding database with 2500 geographically-bound hotspots...")
    hotspots = []
    random.seed(42)
    np.random.seed(42)
    
    wards_config = {
        "K-West": {"lat": 19.1136, "lng": 72.8297, "spread_lat": 0.04, "spread_lng": 0.04}, # Andheri West
        "E-Ward": {"lat": 18.9750, "lng": 72.8353, "spread_lat": 0.03, "spread_lng": 0.03}, # Byculla
        "M-East": {"lat": 19.0553, "lng": 72.9126, "spread_lat": 0.04, "spread_lng": 0.04}, # Govandi
        "H-West": {"lat": 19.0596, "lng": 72.8295, "spread_lat": 0.03, "spread_lng": 0.03}, # Bandra West
        "Other":  {"lat": 19.0760, "lng": 72.8777, "spread_lat": 0.25, "spread_lng": 0.15}  # Everything else
    }
    
    ward_names = list(wards_config.keys())
    
    for i in range(NUM_HOTSPOTS):
        ward = random.choice(ward_names)
        bounds = wards_config[ward]
        
        lat = bounds["lat"] + (random.random() - 0.5) * bounds["spread_lat"]
        lng = bounds["lng"] + (random.random() - 0.5) * bounds["spread_lng"]
        
        elevation = random.uniform(2, 20)
        imperviousness = random.uniform(0.6, 0.98) 
        
        # Historical / Root Cause Data
        year_built = random.randint(1890, 2015)
        # 30% chance of reconstruction in last 20 years
        last_reconstruction = random.randint(2005, 2023) if random.random() > 0.7 else None
        
        built_capacity_mm_hr = random.uniform(25.0, 50.0) # Typical old civic drainage capacity maxes out at 50mm/hr
        current_load_pct = random.uniform(85.0, 140.0) # Often overloaded
        
        hotspots.append({
            "id": f"hs_{i}",
            "lat": lat,
            "lng": lng,
            "ward": ward,
            "elevation": round(elevation, 1),
            "imperviousness": round(imperviousness, 2),
            "base_risk": random.random() * 50,
            "year_built": year_built,
            "last_reconstruction": last_reconstruction,
            "built_capacity_mm_hr": round(built_capacity_mm_hr, 1),
            "current_load_pct": round(current_load_pct, 1)
        })

    collection.insert_many(hotspots)
    print("Seeding complete.")

if __name__ == "__main__":
    seed()
