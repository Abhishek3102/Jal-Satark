def calculate_scs_cn_runoff(rainfall_mm: float, cn: float = 95.0) -> float:
    """
    SCS-CN Method to estimate surface runoff depth (Q).
    P = rainfall in mm
    S = potential maximum retention
    Ia = initial abstraction (usually 0.2 * S in India)
    Returns Runoff Q in mm.
    """
    if rainfall_mm <= 0:
        return 0.0
    
    # S in mm for metric systems
    # For CN between 0 and 100, S = (25400 / CN) - 254
    s = (25400.0 / cn) - 254.0
    
    ia = 0.2 * s
    
    if rainfall_mm <= ia:
        return 0.0
        
    q = ((rainfall_mm - ia) ** 2) / (rainfall_mm - ia + s)
    return q

def muskingum_routing_storage(inflow: float, outflow: float, k: float, x: float = 0.2) -> float:
    """
    Muskingum routing method to solve for storage (S).
    S = K[xI + (1 - x)Q]
    """
    return k * (x * inflow + (1 - x) * outflow)
