"""Static scientific methodology, assumptions, and limitations endpoint."""

from typing import Any, Dict
from fastapi import APIRouter
from backend.app.config import settings

router = APIRouter(tags=["methodology"])


@router.get("/methodology")
def get_methodology() -> Dict[str, Any]:
    """Return scientific data sources, threshold models, inhalation assumptions, and limitations."""
    return {
        "title": "BreatheWise Scientific & Algorithmic Methodology",
        "data_sources": [
            {
                "name": "Copernicus Atmosphere Monitoring Service (CAMS)",
                "provider": "Open-Meteo Air Quality API",
                "type": "Atmospheric Reanalysis & Numerical Forecast Model",
                "resolution": "~40 km global grid with regional downscaling",
                "limitation": (
                    "CAMS data reflects regional atmospheric chemistry simulations, not real-time in-situ "
                    "physical sensor readings. Roadside traffic canyons and localized industrial micro-climates "
                    "may record higher particulate spikes in reality."
                ),
            },
            {
                "name": "ECMWF IFS / Numerical Weather Prediction",
                "provider": "Open-Meteo Weather API",
                "parameters": "Temperature, Humidity, Wind Vectors, Surface Pressure, Boundary Layer Height",
            },
        ],
        "cpcb_categories": [
            {"range": f"{low} - {high} µg/m³", "label": slug.replace("_", " ").title(), "color": color}
            for low, high, slug, color in settings.CPCB_BREAKPOINTS
        ],
        "who_guideline": {
            "standard": "WHO 2021 Global Air Quality Guidelines",
            "pm25_24h_target": 15.0,
            "unit": "µg/m³",
            "note": "Shown as a health reference benchmark; CPCB standards used for active regional categorization.",
        },
        "profiles": {
            k: {"label": v.label, "sensitivity_factor": v.factor, "description": v.description}
            for k, v in settings.profiles.items()
        },
        "activities": {
            k: {
                "label": v.label,
                "default_duration_min": v.default_duration_min,
                "ventilation_rate_m3h": v.ventilation_rate_m3h,
                "description": v.description,
            }
            for k, v in settings.activities.items()
        },
        "inhalation_formula": "Dose (µg) = Mean PM2.5 (µg/m³) × Minute Ventilation Rate (m³/h) × Duration (hours)",
        "exposure_avoided_formula": "Avoided (%) = max(0, (Usual Dose - Recommended Dose) / Usual Dose × 100%)",
        "disclaimer": "BreatheWise provides environmental exposure planning guidance and does not provide clinical or medical advice.",
    }

