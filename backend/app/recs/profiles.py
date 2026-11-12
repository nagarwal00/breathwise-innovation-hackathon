"""Personalized sensitivity profiles and threshold computation."""

from typing import Dict, Tuple
from backend.app.config import settings


def get_profile_factor(profile_id: str) -> float:
    """Return sensitivity factor for profile; defaults to 1.0 (healthy_adult)."""
    profile = settings.profiles.get(profile_id)
    if profile:
        return profile.factor
    return 1.0


def compute_effective_thresholds(profile_id: str) -> Dict[str, float]:
    """Compute personalized effective thresholds = base_threshold * profile_factor."""
    factor = get_profile_factor(profile_id)
    base = settings.base_thresholds
    return {
        "exercise_ok": base.get("exercise_ok", 60.0) * factor,
        "light_ok": base.get("light_ok", 90.0) * factor,
        "windows_open_ok": base.get("windows_open_ok", 60.0) * factor,
        "mask_advised": base.get("mask_advised", 120.0) * factor,
        "avoid": base.get("avoid", 250.0) * factor,
    }


def determine_verdict(
    risk_adj_pm25: float, ok_threshold: float, mask_threshold: float, avoid_threshold: float
) -> Tuple[str, bool, bool]:
    """
    Returns (verdict, mask_recommended, indoor_alternative).
    verdict in ['go', 'caution', 'mask', 'avoid'].
    """
    if risk_adj_pm25 <= ok_threshold:
        return "go", False, False
    elif risk_adj_pm25 <= mask_threshold:
        return "caution", False, False
    elif risk_adj_pm25 <= avoid_threshold:
        return "mask", True, False
    else:
        return "avoid", True, True

