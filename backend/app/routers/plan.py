"""Activity planning and exposure reduction optimization router."""

from datetime import datetime
from fastapi import APIRouter, HTTPException

from backend.app.config import settings
from backend.app.clients.open_meteo import client, get_ist_now
from backend.app.data.cleaning import raw_to_dataframe, clean_air_quality, clean_weather
from backend.app.model.predict import predictor
from backend.app.recs.windows import find_windows
from backend.app.recs.exposure import compute_inhalation_dose, compute_exposure_avoided
from backend.app.recs.advice import generate_advice
from backend.app.schemas import (
    AvoidWindowItem,
    DataStatusModel,
    ExposureModel,
    LocationModel,
    PlanRequest,
    PlanResponse,
    UsualWindowItem,
    WindowItem,
)

router = APIRouter(tags=["plan"])


@router.post("/plan", response_model=PlanResponse)
def create_plan(req: PlanRequest) -> PlanResponse:
    """Compute optimal activity windows, avoid periods, inhaled dose avoided, and advice."""
    try:
        raw_aq, status_aq = client.get_air_quality(
            req.lat, req.lon, past_days=3, forecast_days=3, force_fresh=req.force_fresh
        )
        raw_weather, status_weather = client.get_weather_forecast(
            req.lat, req.lon, past_days=3, forecast_days=3, force_fresh=req.force_fresh
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Failed to fetch environmental data: {e}")

    aq_df = clean_air_quality(raw_to_dataframe(raw_aq))
    weather_df = clean_weather(raw_to_dataframe(raw_weather))

    now = get_ist_now()
    history_aq = aq_df[aq_df["time"] <= now]
    if history_aq.empty:
        history_aq = aq_df.iloc[:24]

    future_weather = weather_df[weather_df["time"] > now].reset_index(drop=True)
    if future_weather.empty:
        future_weather = weather_df.iloc[-48:].reset_index(drop=True)

    # Generate 48h forecast
    forecast = predictor.predict_48h(history_aq, future_weather, req.lat, req.lon)

    # Window optimization with routine-aware constrained search
    best_windows, avoid_windows, usual_window, meta = find_windows(
        forecast=forecast,
        profile_id=req.profile,
        activity_id=req.activity,
        duration_min=req.duration_min,
        allowed_start_str=req.allowed_start,
        allowed_end_str=req.allowed_end,
        usual_start_str=req.usual_start,
        schedule_flexibility=req.schedule_flexibility,
    )

    primary_best = best_windows[0]
    act_cfg = settings.activities.get(req.activity)
    vent_rate = act_cfg.ventilation_rate_m3h if act_cfg else 1.5
    is_ventilate = req.activity == "ventilate_home"

    # Compute inhaled doses
    usual_dose = compute_inhalation_dose(
        usual_window["mean_pm25"], vent_rate, req.duration_min
    )
    rec_dose = compute_inhalation_dose(
        primary_best["mean_pm25"], vent_rate, req.duration_min
    )
    exposure_res = compute_exposure_avoided(
        usual_dose, rec_dose, is_home_ventilation=is_ventilate
    )

    # Generate plain-language advice
    advice_info = generate_advice(
        best_window=primary_best,
        usual_window=usual_window,
        avoid_windows=avoid_windows,
        activity_id=req.activity,
        profile_id=req.profile,
        language=req.language,
    )

    # Format window lists
    window_items = [
        WindowItem(
            start=w["start"],
            end=w["end"],
            mean_pm25=w["mean_pm25"],
            category=w["category"],
            verdict=w.get("verdict"),
        )
        for w in best_windows
    ]
    avoid_items = [
        AvoidWindowItem(
            start=w["start"],
            end=w["end"],
            mean_pm25=w["mean_pm25"],
            category=w["category"],
        )
        for w in avoid_windows
    ]

    source = "cache" if status_aq["source"] == "cache" or status_weather["source"] == "cache" else "live"
    cached_at = status_aq.get("cached_at") or status_weather.get("cached_at")
    cache_age_min = max(status_aq.get("cache_age_min") or 0.0, status_weather.get("cache_age_min") or 0.0)
    is_fallback = bool(status_aq.get("is_fallback") or status_weather.get("is_fallback"))
    fallback_reason = status_aq.get("fallback_reason") or status_weather.get("fallback_reason")

    # City name detection
    loc_name = "Selected Location"
    for city in settings.cities:
        if abs(city.lat - req.lat) < 0.1 and abs(city.lon - req.lon) < 0.1:
            loc_name = city.name
            break

    return PlanResponse(
        generated_at=now.isoformat(),
        data_status=DataStatusModel(
            source=source,
            cached_at=cached_at,
            cache_age_min=cache_age_min,
            is_fallback=is_fallback,
            fallback_reason=fallback_reason,
        ),
        location=LocationModel(name=loc_name, lat=req.lat, lon=req.lon),
        best_windows=window_items,
        avoid_windows=avoid_items,
        usual_window=UsualWindowItem(
            start=usual_window["start"],
            mean_pm25=usual_window["mean_pm25"],
        ),
        exposure=ExposureModel(
            usual_dose=exposure_res["usual_dose"],
            recommended_dose=exposure_res["recommended_dose"],
            avoided_pct=exposure_res["avoided_pct"],
            method=exposure_res["method"],
        ),
        verdict=advice_info["verdict"],
        advice=advice_info["advice"],
        mask_recommended=advice_info["mask_recommended"],
        indoor_alternative=advice_info["indoor_alternative"],
        disclaimer=advice_info["disclaimer"],
    )

