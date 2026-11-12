"""Unit tests for Open-Meteo client, data cleaning, and offline cache fallback."""

from datetime import datetime, timezone, timedelta
import pandas as pd
import pytest

from backend.app.config import settings
from backend.app.clients.open_meteo import OpenMeteoClient, round_coord
from backend.app.data.cleaning import (
    raw_to_dataframe,
    clean_air_quality,
    clean_weather,
    add_calendar_features,
    merge_air_and_weather,
)

IST = timezone(timedelta(hours=5, minutes=30))


def test_config_loaded() -> None:
    """Verify preset cities, profiles, thresholds, and activities load properly."""
    assert len(settings.cities) == 8
    city_ids = [c.id for c in settings.cities]
    assert "delhi" in city_ids
    assert "bengaluru" in city_ids

    assert len(settings.profiles) == 6
    assert "healthy_adult" in settings.profiles
    assert "child" in settings.profiles
    assert settings.profiles["child"].factor == 0.75
    assert settings.profiles["respiratory_cardiac"].factor == 0.5

    assert len(settings.activities) >= 4
    assert "exercise" in settings.activities
    assert "morning_commute" in settings.activities
    assert settings.activities["exercise"].ventilation_rate_m3h == 3.2


def test_clean_air_quality_bounds_and_ratios() -> None:
    """Verify non-negativity clipping, short gap interpolation, and PM2.5/PM10 ratio."""
    df = pd.DataFrame(
        {
            "time": pd.date_range("2026-11-12 00:00", periods=5, freq="h", tz="Asia/Kolkata"),
            "pm2_5": [50.0, None, 70.0, -5.0, 100.0],
            "pm10": [100.0, 120.0, 140.0, 50.0, 200.0],
            "nitrogen_dioxide": [20.0, 25.0, None, 30.0, 35.0],
        }
    )
    cleaned = clean_air_quality(df)

    # Check interpolated missing value
    assert cleaned.loc[1, "pm2_5"] == 60.0
    # Check negative value clipped to 0
    assert cleaned.loc[3, "pm2_5"] == 0.0
    # Check ratio computed and non-empty
    assert "pm25_pm10_ratio" in cleaned.columns
    assert 0.0 <= cleaned.loc[0, "pm25_pm10_ratio"] <= 1.5


def test_clean_weather_vectors_and_calendar() -> None:
    """Verify wind trigonometry and cyclic hour features."""
    df = pd.DataFrame(
        {
            "time": pd.date_range("2026-11-12 00:00", periods=4, freq="h", tz="Asia/Kolkata"),
            "temperature_2m": [22.0, 24.0, 26.0, 23.0],
            "relative_humidity_2m": [60.0, 55.0, 50.0, 65.0],
            "wind_speed_10m": [2.5, 3.0, 2.0, 1.5],
            "wind_direction_10m": [0.0, 90.0, 180.0, 270.0],
        }
    )
    cleaned = clean_weather(df)
    with_cal = add_calendar_features(cleaned)

    assert "wind_sin" in with_cal.columns
    assert "wind_cos" in with_cal.columns
    assert "hour_sin" in with_cal.columns
    assert "hour_cos" in with_cal.columns
    assert pytest.approx(with_cal.loc[0, "wind_cos"], 0.01) == 1.0  # cos(0) = 1
    assert pytest.approx(with_cal.loc[1, "wind_sin"], 0.01) == 1.0  # sin(90 deg) = 1


def test_client_caching_and_offline_fallback(tmp_path) -> None:
    """Verify disk caching and graceful offline fallback when upstream fails."""
    client = OpenMeteoClient(cache_dir=tmp_path)
    lat, lon = 28.61, 77.21

    # Write synthetic cache file
    cache_file = client._cache_key("aq_p7_f3", lat, lon)
    dummy_payload = {
        "hourly": {
            "time": ["2026-11-12T00:00", "2026-11-12T01:00"],
            "pm2_5": [45.0, 48.0],
        }
    }
    client._write_cache(cache_file, dummy_payload)

    # 1. Read directly within TTL
    data, status = client.get_air_quality(lat, lon, past_days=7, forecast_days=3)
    assert status["source"] == "cache"
    assert data["hourly"]["pm2_5"] == [45.0, 48.0]

    # 2. Simulate upstream failure with force_fresh=True
    # Mock _fetch_with_retry to raise an exception
    def failing_fetch(*args, **kwargs):
        raise ConnectionError("Upstream connection timed out")

    client._fetch_with_retry = failing_fetch

    # When live call fails, it must fallback to the cache with fallback_reason noted
    fallback_data, fallback_status = client.get_air_quality(
        lat, lon, past_days=7, forecast_days=3, force_fresh=True
    )
    assert fallback_status["source"] == "cache"
    assert "fallback_reason" in fallback_status
    assert fallback_data["hourly"]["pm2_5"] == [45.0, 48.0]

