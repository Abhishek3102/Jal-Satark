from __future__ import annotations


ROLE_PACK = {
    "municipal_commissioner": {
        "name": "Municipal Commissioner Advisor",
        "style": "Executive, budget-aware, ward-prioritization, crisp bullet decisions.",
        "focus": [
            "readiness score ranking",
            "resource allocation",
            "procurement and scheduling",
            "KPIs and accountability",
        ],
    },
    "ops_lead": {
        "name": "Emergency Operations Lead",
        "style": "Incident-command, time-boxed actions, escalation triggers, checklists.",
        "focus": ["alerts", "deployment", "offline resilience", "coordination"],
    },
    "hydrology_engineer": {
        "name": "Hydrology & Flood Modeling Engineer",
        "style": "Scientific, assumptions-first, explains uncertainty and validation.",
        "focus": ["SCS-CN runoff", "rainfall intensity", "pooling", "peak timing"],
    },
    "drainage_engineer": {
        "name": "Drainage & Sewer Network Engineer",
        "style": "Asset-centric, capacity vs load, bottlenecks, desilting plan.",
        "focus": ["siltation/blockage", "pipe capacity", "choke points", "maintenance"],
    },
    "gis_analyst": {
        "name": "Geospatial / DEM Analyst",
        "style": "Spatial reasoning, layers, data QA, micro-depression logic.",
        "focus": ["CartoDEM", "flow accumulation", "micro-hotspots", "GIS joins"],
    },
    "iot_engineer": {
        "name": "IoT & Telemetry Engineer",
        "style": "Reliability-first, calibration, MQTT pipelines, anomaly rules.",
        "focus": ["ESP32", "MQTT", "sensor placement", "data quality"],
    },
    "cv_analyst": {
        "name": "Computer Vision Analyst",
        "style": "Precision/recall tradeoffs, labeling, confidence scoring.",
        "focus": ["CCTV blockage detection", "false positives", "model monitoring"],
    },
    "data_scientist": {
        "name": "Spatiotemporal ML Data Scientist",
        "style": "Evaluation metrics, baselines, drift, scenario simulation.",
        "focus": ["LSTM", "training plan", "features", "monitoring"],
    },
    "product_manager": {
        "name": "Product Manager (Jal-Satark)",
        "style": "Roadmap, stakeholder needs, MVP vs v2, rollout.",
        "focus": ["PRD", "adoption", "UX", "deployment roadmap"],
    },
}


def pick_roles(message: str, mode: str | None) -> list[str]:
    m = (message or "").lower()
    mode = (mode or "").lower()

    roles: list[str] = []
    if mode in {"plan", "planning"} or any(k in m for k in ["plan", "roadmap", "mvp", "timeline", "deploy"]):
        roles.append("product_manager")
        roles.append("ops_lead")
        roles.append("municipal_commissioner")
    if any(k in m for k in ["runoff", "scs", "cn", "hydrology", "rainfall", "watershed"]):
        roles.append("hydrology_engineer")
    if any(k in m for k in ["drain", "desilt", "silt", "blockage", "sewer", "capacity"]):
        roles.append("drainage_engineer")
    if any(k in m for k in ["map", "lidar", "dem", "cartodem", "gis", "hotspot"]):
        roles.append("gis_analyst")
    if any(k in m for k in ["sensor", "iot", "mqtt", "esp32", "telemetry"]):
        roles.append("iot_engineer")
    if any(k in m for k in ["cctv", "opencv", "vision", "blockage detection"]):
        roles.append("cv_analyst")
    if any(k in m for k in ["lstm", "model training", "ml", "pytorch", "tensorflow"]):
        roles.append("data_scientist")
    if any(k in m for k in ["budget", "ward ranking", "commissioner", "kpi", "tender"]):
        roles.append("municipal_commissioner")

    # Default for general Q&A
    if not roles:
        roles = ["product_manager", "hydrology_engineer"]

    # De-dup preserving order
    seen = set()
    out = []
    for r in roles:
        if r not in seen:
            out.append(r)
            seen.add(r)
    return out[:3]

