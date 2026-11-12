"""Forecast and real-time air quality observation endpoints."""

from datetime import datetime, timezone, timedelta
from typing import Any, Dict
import pandas as pd
from fastapi import APIRouter, HTTPException, Query

from backend.app.config import settings
from backend.app.clients.open_meteo import client, get_ist_now
from backend.app.data.cleaning import raw_to_dataframe, clean_air_quality, clean_weather
from backend.app.model.predict import predictor
from backend.app.recs.profiles import compute_effective_thresholds, determine_verdict
from backend.app.schemas import (
    CurrentAQResponse,
    DataStatusModel,
    ForecastResponse,
)

router = APIRouter(tags=["forecast"])


@router.get("/current", response_model=CurrentAQResponse)
def get_current_air_quality(
    lat: float = Query(..., ge=-90.0, le=90.0),
    lon: float = Query(..., ge=-180.0, le=180.0),
    profile: str = Query("healthy_adult"),
    force_fresh: bool = Query(False),
) -> CurrentAQResponse:
    """Get current PM2.5, CPCB category, 3h trend direction, and personalized verdict."""
    try:
        raw_aq, status = client.get_air_quality(
            lat, lon, past_days=2, forecast_days=2, force_fresh=force_fresh
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Failed to fetch air quality: {e}")

    df = raw_to_dataframe(raw_aq)
    df_clean = clean_air_quality(df)

    now = get_ist_now()
    # Find row closest to now (or latest observation <= now)
    past_rows = df_clean[df_clean["time"] <= now]
    current_row = past_rows.iloc[-1] if not past_rows.empty else df_clean.iloc[0]
    curr_idx = current_row.name

    curr_pm25 = round(float(current_row["pm2_5"]), 1)
    curr_pm10 = round(float(current_row.get("pm10", curr_pm25 * 1.5)), 1)
    category_slug, color = settings.get_cpcb_category(curr_pm25)

    # 3-hour trend
    future_idx = min(len(df_clean) - 1, curr_idx + 3)
    future_pm25 = float(df_clean.iloc[future_idx]["pm2_5"])
    delta_3h = round(future_pm25 - curr_pm25, 1)

    if delta_3h > 5.0:
        trend = "rising"
    elif delta_3h < -5.0:
        trend = "falling"
    else:
        trend = "stable"

    # Profile verdict
    thresholds = compute_effective_thresholds(profile)
    verdict, _, _ = determine_verdict(
        curr_pm25,
        thresholds.get("exercise_ok", 60.0),
        thresholds.get("mask_advised", 120.0),
        thresholds.get("avoid", 250.0),
    )

    return CurrentAQResponse(
        time=current_row["time"].isoformat(),
        lat=lat,
        lon=lon,
        pm25=curr_pm25,
        pm10=curr_pm10,
        category=category_slug,
        category_color=color,
        trend=trend,
        trend_delta_3h=delta_3h,
        verdict=verdict,
        profile=profile,
        data_status=DataStatusModel(
            source=status["source"],
            cached_at=status.get("cached_at"),
            cache_age_min=status.get("cache_age_min"),
            is_fallback=bool(status.get("is_fallback")),
            fallback_reason=status.get("fallback_reason"),
        ),
    )


@router.get("/forecast", response_model=ForecastResponse)
def get_48h_forecast(
    lat: float = Query(..., ge=-90.0, le=90.0),
    lon: float = Query(..., ge=-180.0, le=180.0),
    hours: int = Query(48, ge=1, le=72),
    force_fresh: bool = Query(False),
) -> ForecastResponse:
    """Return 48-hour hourly p10/p50/p90 PM2.5 forecasts with uncertainty bands and CPCB categories."""
    try:
        raw_aq, status_aq = client.get_air_quality(
            lat, lon, past_days=3, forecast_days=3, force_fresh=force_fresh
        )
        raw_weather, status_weather = client.get_weather_forecast(
            lat, lon, past_days=3, forecast_days=3, force_fresh=force_fresh
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Failed to fetch forecast upstream data: {e}")

    aq_df = clean_air_quality(raw_to_dataframe(raw_aq))
    weather_df = clean_weather(raw_to_dataframe(raw_weather))

    # Split into history (<= now) and forecast (> now)
    now = get_ist_now()
    history_aq = aq_df[aq_df["time"] <= now]
    if history_aq.empty:
        history_aq = aq_df.iloc[:24]

    future_weather = weather_df[weather_df["time"] > now].reset_index(drop=True)
    if future_weather.empty:
        future_weather = weather_df.iloc[-48:].reset_index(drop=True)

    predictions = predictor.predict_48h(history_aq, future_weather, lat, lon)
    predictions = predictions[:hours]

    # Combine data status (if either is cache, report cache)
    source = "cache" if status_aq["source"] == "cache" or status_weather["source"] == "cache" else "live"
    cached_at = status_aq.get("cached_at") or status_weather.get("cached_at")
    cache_age_min = max(status_aq.get("cache_age_min") or 0.0, status_weather.get("cache_age_min") or 0.0)
    is_fallback = bool(status_aq.get("is_fallback") or status_weather.get("is_fallback"))
    fallback_reason = status_aq.get("fallback_reason") or status_weather.get("fallback_reason")

    return ForecastResponse(
        generated_at=now.isoformat(),
        data_status=DataStatusModel(
            source=source,
            cached_at=cached_at,
            cache_age_min=cache_age_min,
            is_fallback=is_fallback,
            fallback_reason=fallback_reason,
        ),
        lat=lat,
        lon=lon,
        who_reference_24h=settings.WHO_PM25_24H_GUIDELINE,
        forecast=predictions,
    )

