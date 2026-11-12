"""Preset cities and geocoding search endpoints."""

from typing import Any, Dict, List
from fastapi import APIRouter, HTTPException, Query
from backend.app.config import settings
from backend.app.clients.open_meteo import client

router = APIRouter(tags=["locations"])


@router.get("/cities")
def get_cities() -> List[Dict[str, Any]]:
    """Return all preset Indian cities with coordinates."""
    return [c.model_dump() for c in settings.cities]


@router.get("/geocode")
def geocode_search(q: str = Query(..., min_length=2, description="Place or city name")) -> Dict[str, Any]:
    """Proxy geocoding search to Open-Meteo Geocoding API with local disk caching."""
    try:
        results = client.geocode(q)
        return results
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Geocoding service unavailable: {e}")

