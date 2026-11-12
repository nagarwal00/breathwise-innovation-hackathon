"""Data cleaning, timezone alignment, and meteorological frame joining."""

import logging
from typing import Any, Dict, Tuple
import numpy as np
import pandas as pd

logger = logging.getLogger("breathewise.cleaning")


def raw_to_dataframe(hourly_payload: Dict[str, Any]) -> pd.DataFrame:
    """Convert Open-Meteo hourly dict to a DataFrame with parsed timestamps."""
    if "hourly" not in hourly_payload:
        raise ValueError("Payload missing 'hourly' object")

    hourly = hourly_payload["hourly"]
    df = pd.DataFrame(hourly)
    if "time" not in df.columns:
        raise ValueError("Hourly payload missing 'time' column")

    # Parse timestamps as ISO strings
    df["time"] = pd.to_datetime(df["time"])
    # If tz-naive, localize to Asia/Kolkata
    if df["time"].dt.tz is None:
        df["time"] = df["time"].dt.tz_localize("Asia/Kolkata")
    else:
        df["time"] = df["time"].dt.tz_convert("Asia/Kolkata")

    df = df.sort_values("time").reset_index(drop=True)
    return df


def clean_air_quality(df: pd.DataFrame) -> pd.DataFrame:
    """Clean air quality features, interpolating short gaps and clipping bounds."""
    df = df.copy()
    pollutant_cols = [
        "pm2_5",
        "pm10",
        "nitrogen_dioxide",
        "ozone",
        "carbon_monoxide",
        "sulphur_dioxide",
    ]
    for col in pollutant_cols:
        if col in df.columns:
            # Interpolate short gaps (up to 3 consecutive hours)
            df[col] = df[col].interpolate(method="linear", limit=3)
            # Forward/backward fill edge gaps
            df[col] = df[col].bfill().ffill()
            # Physical boundary: non-negative
            df[col] = df[col].clip(lower=0.0)

    # Derived ratio
    if "pm2_5" in df.columns and "pm10" in df.columns:
        df["pm25_pm10_ratio"] = df["pm2_5"] / (df["pm10"].replace(0, np.nan) + 1e-3)
        df["pm25_pm10_ratio"] = df["pm25_pm10_ratio"].clip(0.0, 1.5).fillna(0.5)

    return df


def clean_weather(df: pd.DataFrame) -> pd.DataFrame:
    """Clean meteorological variables and compute cyclical angles."""
    df = df.copy()

    # Temperature
    if "temperature_2m" in df.columns:
        df["temperature_2m"] = df["temperature_2m"].interpolate(method="linear", limit=3).bfill().ffill()

    # Relative humidity
    if "relative_humidity_2m" in df.columns:
        df["relative_humidity_2m"] = (
            df["relative_humidity_2m"].interpolate(method="linear", limit=3).bfill().ffill().clip(0.0, 100.0)
        )

    # Wind speed
    if "wind_speed_10m" in df.columns:
        df["wind_speed_10m"] = (
            df["wind_speed_10m"].interpolate(method="linear", limit=3).bfill().ffill().clip(lower=0.0)
        )

    # Wind direction & directional components
    if "wind_direction_10m" in df.columns:
        df["wind_direction_10m"] = (
            df["wind_direction_10m"].interpolate(method="linear", limit=3).bfill().ffill()
        )
        rad = np.deg2rad(df["wind_direction_10m"])
        df["wind_sin"] = np.sin(rad)
        df["wind_cos"] = np.cos(rad)

    # Precipitation
    if "precipitation" in df.columns:
        df["precipitation"] = (
            df["precipitation"].fillna(0.0).clip(lower=0.0)
        )

    # Surface pressure
    if "surface_pressure" in df.columns:
        df["surface_pressure"] = (
            df["surface_pressure"].interpolate(method="linear", limit=3).bfill().ffill()
        )

    # Boundary layer height
    if "boundary_layer_height" in df.columns:
        df["boundary_layer_height"] = (
            df["boundary_layer_height"].interpolate(method="linear", limit=6).bfill().ffill().clip(lower=10.0)
        )

    return df


def add_calendar_features(df: pd.DataFrame) -> pd.DataFrame:
    """Add cyclic hour, day of week, and seasonal calendar features."""
    df = df.copy()
    hour = df["time"].dt.hour
    dow = df["time"].dt.dayofweek
    month = df["time"].dt.month

    df["hour_sin"] = np.sin(2 * np.pi * hour / 24.0)
    df["hour_cos"] = np.cos(2 * np.pi * hour / 24.0)
    df["dow_sin"] = np.sin(2 * np.pi * dow / 7.0)
    df["dow_cos"] = np.cos(2 * np.pi * dow / 7.0)
    df["month_sin"] = np.sin(2 * np.pi * month / 12.0)
    df["month_cos"] = np.cos(2 * np.pi * month / 12.0)

    # Indian post-monsoon / winter severe pollution season flag (Oct 15 - Jan 31)
    day_of_year = df["time"].dt.dayofyear
    df["is_winter_pollution_season"] = (
        (day_of_year >= 288) | (day_of_year <= 31)
    ).astype(float)

    return df


def merge_air_and_weather(
    aq_df: pd.DataFrame, weather_df: pd.DataFrame
) -> pd.DataFrame:
    """Join cleaned air quality and weather frames on aligned timestamps."""
    aq_clean = clean_air_quality(aq_df)
    weather_clean = clean_weather(weather_df)

    merged = pd.merge(aq_clean, weather_clean, on="time", how="inner")
    merged = add_calendar_features(merged)
    merged = merged.sort_values("time").reset_index(drop=True)
    return merged

