from __future__ import annotations

from typing import Any

from ..models import prediction, readiness


def tool_declarations() -> list[dict]:
    """
    JSON-schema style function declarations used by Gemini function calling.
    Keep these stable; the model learns the contract during the conversation.
    """
    return [
        {
            "name": "get_wards",
            "description": "Get ward-level pre-monsoon readiness scores for a given rainfall intensity (mm/hr).",
            "parameters": {
                "type": "object",
                "properties": {
                    "rainfall_mm": {"type": "number", "description": "Rainfall intensity in mm/hr", "default": 25.0}
                },
            },
        },
        {
            "name": "get_hotspots",
            "description": "Get micro-hotspot risk predictions for rainfall intensity and optional ward filter.",
            "parameters": {
                "type": "object",
                "properties": {
                    "rainfall_mm": {"type": "number", "description": "Rainfall intensity in mm/hr", "default": 25.0},
                    "ward": {"type": "string", "description": "Ward filter or ALL", "default": "ALL"},
                },
            },
        },
        {
            "name": "make_chart",
            "description": "Create a validated Recharts chart artifact spec from tabular data.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "chartType": {"type": "string", "enum": ["line", "bar", "area"]},
                    "data": {"type": "array", "items": {"type": "object"}},
                    "xKey": {"type": "string"},
                    "yKey": {"type": "string"},
                },
                "required": ["chartType", "data", "xKey", "yKey"],
            },
        },
        {
            "name": "make_diagram",
            "description": "Create a Mermaid diagram artifact from a requested diagram goal.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "kind": {"type": "string", "enum": ["architecture", "incident_action_plan", "data_flow"]},
                },
                "required": ["kind"],
            },
        },
    ]


def execute_tool(name: str, args: dict[str, Any]) -> dict[str, Any]:
    if name == "get_wards":
        rainfall = float(args.get("rainfall_mm", 25.0))
        wards = readiness.generate_ward_scores(rainfall)
        return {"rainfall_mm": rainfall, "wards": wards}

    if name == "get_hotspots":
        rainfall = float(args.get("rainfall_mm", 25.0))
        ward = str(args.get("ward", "ALL"))
        hotspots = prediction.predict_hotspot_risks(rainfall, ward)
        return {"rainfall_mm": rainfall, "ward_filter": ward, "hotspots": hotspots}

    if name == "make_chart":
        chart_type = str(args.get("chartType", "line"))
        data = args.get("data", [])
        x_key = str(args.get("xKey", "x"))
        y_key = str(args.get("yKey", "y"))
        title = args.get("title") or "Chart"

        if chart_type not in {"line", "bar", "area"}:
            raise RuntimeError("Invalid chartType")
        if not isinstance(data, list):
            raise RuntimeError("Chart data must be a list")

        artifact = {
            "type": "chart",
            "renderer": "recharts",
            "title": title,
            "spec": {
                "chartType": chart_type,
                "data": data,
                "xKey": x_key,
                "yKey": y_key,
            },
        }
        return {"artifact": artifact}

    if name == "make_diagram":
        kind = str(args.get("kind", "architecture"))
        title = args.get("title") or "Diagram"

        if kind == "architecture":
            spec = """flowchart LR
  A[Data Ingestion\\nRainfall + DEM] --> B[Agentic Core\\nTerrain + Drainage + Readiness]
  B --> C[Predictive Engine\\nHybrid AI-Physics]
  C --> D[Outputs\\nMicro-hotspots + Ward scores]
  D --> E[Action Layer\\nAlerts + SOPs]
"""
        elif kind == "incident_action_plan":
            spec = """flowchart TD
  T[Trigger\\nRainfall spike / sensor danger] --> A[Assess\\nHotspots + ward readiness]
  A --> P[Prioritize\\nTop wards + critical hotspots]
  P --> D[Deploy\\nPumps, crews, traffic control]
  D --> C[Communicate\\nCitizen alerts + commissioner brief]
  C --> M[Monitor\\nSensors + field feedback]
  M --> A
"""
        else:  # data_flow
            spec = """sequenceDiagram
  participant IMD as Rainfall Feed
  participant DEM as DEM/CartoDEM
  participant Core as Jal-Satark Core
  participant ML as Hybrid Model
  participant UI as Dashboard/Chat
  IMD->>Core: rainfall_mm
  DEM->>Core: terrain layers
  Core->>ML: features + scenarios
  ML->>UI: micro-hotspots + readiness
"""

        artifact = {"type": "diagram", "renderer": "mermaid", "title": title, "spec": spec}
        return {"artifact": artifact}

    raise RuntimeError(f"Unknown tool: {name}")

