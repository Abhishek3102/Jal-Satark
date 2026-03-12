import random

WARD_ZONES = {
    "Ward A (Colaba)": "Island City", "Ward B (Sandhurst)": "Island City", "Ward C (Marine Lines)": "Island City", 
    "Ward D (Grant Road)": "Island City", "Ward E (Byculla)": "Island City", "Ward F/North (Matunga)": "Island City", 
    "Ward F/South (Parel)": "Island City", "Ward G/North (Dadar)": "Island City", "Ward G/South (Elphinstone)": "Island City",
    "Ward H/East (Bandra East)": "Western Suburbs", "Ward H/West (Bandra West)": "Western Suburbs",
    "Ward K/East (Andheri East)": "Western Suburbs", "Ward K/West (Andheri West)": "Western Suburbs", 
    "Ward P/North (Malad)": "Western Suburbs", "Ward P/South (Goregaon)": "Western Suburbs", 
    "Ward R/Central (Borivali)": "Western Suburbs", "Ward R/North (Dahisar)": "Western Suburbs", 
    "Ward R/South (Kandivali)": "Western Suburbs",
    "Ward L (Kurla)": "Eastern Suburbs", "Ward M/East (Govandi)": "Eastern Suburbs", "Ward M/West (Chembur)": "Eastern Suburbs", 
    "Ward N (Ghatkopar)": "Eastern Suburbs", "Ward S (Bhandup)": "Eastern Suburbs", "Ward T (Mulund)": "Eastern Suburbs"
}

WARD_NAMES = list(WARD_ZONES.keys())

def generate_ward_scores(rainfall_mm: float):
    """
    Calculate the Readiness Score per ward.
    Scale 0 to 100. <40 is High Risk.
    
    AHP Weightings:
    Resistance: 0.45 
    Adaptability: 0.25
    Recovery: 0.30
    """
    random.seed(42) # Base properties are static
    
    ward_scores = []
    for idx, name in enumerate(WARD_NAMES):
        # Base indicators
        pipeline_density = random.uniform(0.4, 0.9)
        desilting = random.uniform(0.5, 1.0)
        pop_density_neg = random.uniform(0.3, 0.8) # inverted meaning lower is better
        disaster_education = random.uniform(0.3, 0.9)
        healthcare = random.uniform(0.4, 0.95)
        green_cov = random.uniform(0.1, 0.6)
        
        # Dynamic impact of rainfall on Resistance & Recovery
        rain_stress = rainfall_mm / 200.0 # max 200mm stress baseline
        
        # Calculate Dimensions (0 to 1 scale)
        resistance = max(0.1, (pipeline_density * 0.5 + desilting * 0.5) - rain_stress * 0.5)
        adaptability = (1.0 - pop_density_neg) * 0.6 + disaster_education * 0.4
        recovery = healthcare * 0.5 + green_cov * 0.5 - rain_stress * 0.3
        
        total_score = (resistance * 0.45 + adaptability * 0.25 + recovery * 0.30) * 100
        
        # Operational mock data
        delta = round(random.uniform(-8.0, 5.0), 1)
        contractor_gap = round((1.0 - desilting) * 100)
        penalty_cr = round(contractor_gap * 0.12, 1)

        ward_scores.append({
            "id": f"W{idx}",
            "name": name,
            "zone": WARD_ZONES[name],
            "readiness_score": round(max(0.0, total_score), 1),
            "resistance": round(resistance * 100, 1),
            "adaptability": round(adaptability * 100, 1),
            "recovery": round(recovery * 100, 1),
            "delta": delta,
            "contractor_gap_pct": contractor_gap,
            "contractor_penalty_cr": penalty_cr
        })
        
    return ward_scores
