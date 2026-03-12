from fastapi import APIRouter, Query
from ..models import hydrology, prediction, readiness
import random

router = APIRouter()

@router.get("/hotspots")
def get_hotspots(
    rainfall_mm: float = Query(25.0, description="Predicted rainfall in mm/hr"),
    ward: str = Query("ALL", description="Filter by Ward")
):
    """
    Returns 2500+ micro-hotspots with their LSTM predicted risk profiles.
    """
    return {
        "rainfall_mm": rainfall_mm,
        "ward_filter": ward,
        "hotspots": prediction.predict_hotspot_risks(rainfall_mm, ward)
    }

@router.get("/wards")
def get_wards(rainfall_mm: float = Query(25.0, description="Predicted rainfall in mm/hr")):
    """
    Returns Ward-level Pre-Monsoon Readiness Scores based on AHP/Entropy.
    """
    return {
        "rainfall_mm": rainfall_mm,
        "wards": readiness.generate_ward_scores(rainfall_mm)
    }

@router.get("/iot/sensors")
def get_iot_sensors():
    """
    Returns simulated IoT water level and CV blockage measurements from strategic manholes.
    """
    sensors = []
    for i in range(20): # Mock 20 sensors
        sensors.append({
            "sensor_id": f"SEN_{i}",
            "location": f"Manhole Cluster {i}",
            "water_level_m": round(random.uniform(0.1, 2.5), 2),
            "blockage_cv_pct": round(random.uniform(0, 80), 1),
            "status": "DANGER" if random.random() > 0.8 else ("WARNING" if random.random() > 0.5 else "OK")
        })
    return {"sensors": sensors}

@router.get("/hydrology/runoff")
def get_runoff(rainfall_mm: float, cn: float = 95.0):
    return {
        "rainfall_mm": rainfall_mm,
        "curve_number": cn,
        "runoff_depth_mm": hydrology.calculate_scs_cn_runoff(rainfall_mm, cn)
    }
