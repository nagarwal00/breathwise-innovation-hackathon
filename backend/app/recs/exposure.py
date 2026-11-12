"""Inhaled particulate dose and exposure reduction modeling."""

from typing import Dict, Tuple


def compute_inhalation_dose(
    mean_pm25: float,
    ventilation_rate_m3h: float | None,
    duration_minutes: int,
) -> float:
    """
    Computes inhaled PM2.5 dose (µg) = mean_pm25 * ventilation_rate * duration_hours.
    For home ventilation where ventilation rate is None, reports mean concentration (µg/m³).
    """
    duration_hours = max(0.25, duration_minutes / 60.0)
    if ventilation_rate_m3h is None:
        return round(max(0.0, mean_pm25), 1)
    dose = mean_pm25 * ventilation_rate_m3h * duration_hours
    return round(max(0.0, dose), 1)


def compute_exposure_avoided(
    usual_dose: float,
    recommended_dose: float,
    is_home_ventilation: bool = False,
) -> Dict[str, float | str]:
    """
    Computes exposure avoided percentage vs customary usual window.
    Guaranteed non-negative (returns 0.0% if usual window is already optimal).
    """
    if usual_dose <= 0.0 or recommended_dose >= usual_dose:
        avoided_pct = 0.0
    else:
        avoided_pct = round(((usual_dose - recommended_dose) / usual_dose) * 100.0, 1)

    method = (
        "mean_pm25 outdoor concentration differential"
        if is_home_ventilation
        else "mean_pm25 x ventilation_rate x duration"
    )

    return {
        "usual_dose": usual_dose,
        "recommended_dose": recommended_dose,
        "avoided_pct": avoided_pct,
        "method": method,
    }

