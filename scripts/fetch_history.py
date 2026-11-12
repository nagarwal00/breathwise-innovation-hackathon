"""Fetch historical air quality and weather data for preset cities."""

import json
import logging
import sys
from pathlib import Path

# Add project root to path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import pandas as pd

from backend.app.config import (
    settings,
    RAW_DATA_DIR,
    CACHE_DATA_DIR,
    PROCESSED_DATA_DIR,
)
from backend.app.clients.open_meteo import OpenMeteoClient, round_coord
from backend.app.data.cleaning import (
    raw_to_dataframe,
    merge_air_and_weather,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("fetch_history")


def fetch_all_cities_data(past_days: int = 92, forecast_days: int = 3) -> None:
    """Fetch air quality and weather data for all 8 preset cities and save processed datasets."""
    client = OpenMeteoClient(cache_dir=CACHE_DATA_DIR)
    cities = settings.cities
    logger.info("Starting historical data fetch for %d cities (past_days=%d)...", len(cities), past_days)

    report = {"cities": {}, "total_rows": 0, "generated_at": pd.Timestamp.now().isoformat()}

    for city in cities:
        logger.info("Fetching data for %s (%.4f, %.4f)...", city.name, city.lat, city.lon)

        # 1. Fetch Air Quality
        aq_params = {
            "latitude": round_coord(city.lat),
            "longitude": round_coord(city.lon),
            "hourly": "pm2_5,pm10,nitrogen_dioxide,ozone,carbon_monoxide,sulphur_dioxide",
            "past_days": past_days,
            "forecast_days": forecast_days,
            "timezone": settings.TIMEZONE,
        }
        try:
            aq_raw = client._fetch_with_retry(client.AIR_QUALITY_URL, aq_params)
            raw_aq_file = RAW_DATA_DIR / f"{city.id}_aq.json"
            with open(raw_aq_file, "w", encoding="utf-8") as f:
                json.dump(aq_raw, f)
        except Exception as e:
            logger.error("Failed to fetch air quality for %s: %s", city.name, e)
            continue

        # 2. Fetch Weather (using forecast with past_days=60 or archive if deeper)
        # Note: past_days=60 has 0 nulls on forecast API.
        weather_params = {
            "latitude": round_coord(city.lat),
            "longitude": round_coord(city.lon),
            "hourly": "temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,precipitation,surface_pressure,boundary_layer_height",
            "past_days": min(past_days, 60),
            "forecast_days": forecast_days,
            "timezone": settings.TIMEZONE,
        }
        try:
            weather_raw = client._fetch_with_retry(client.WEATHER_FORECAST_URL, weather_params)
            raw_weather_file = RAW_DATA_DIR / f"{city.id}_weather.json"
            with open(raw_weather_file, "w", encoding="utf-8") as f:
                json.dump(weather_raw, f)
        except Exception as e:
            logger.error("Failed to fetch weather for %s: %s", city.name, e)
            continue

        # 3. Clean and merge
        aq_df = raw_to_dataframe(aq_raw)
        weather_df = raw_to_dataframe(weather_raw)
        merged_df = merge_air_and_weather(aq_df, weather_df)
        merged_df["city_id"] = city.id
        merged_df["city_name"] = city.name
        merged_df["latitude"] = city.lat
        merged_df["longitude"] = city.lon

        # 4. Save processed dataset
        processed_file_csv = PROCESSED_DATA_DIR / f"{city.id}.csv"
        merged_df.to_csv(processed_file_csv, index=False)
        try:
            processed_file_parquet = PROCESSED_DATA_DIR / f"{city.id}.parquet"
            merged_df.to_parquet(processed_file_parquet, index=False)
        except Exception:
            pass  # CSV is always available

        # 5. Populate pre-cached live query payloads for offline robustness
        cache_aq_key = f"aq_p7_f3_{round_coord(city.lat):.2f}_{round_coord(city.lon):.2f}.json"
        client._write_cache(cache_aq_key, aq_raw)
        cache_weather_key = f"weather_p7_f3_{round_coord(city.lat):.2f}_{round_coord(city.lon):.2f}.json"
        client._write_cache(cache_weather_key, weather_raw)

        # 6. Record quality metrics
        city_stats = {
            "rows": len(merged_df),
            "date_start": str(merged_df["time"].min()),
            "date_end": str(merged_df["time"].max()),
            "pm25_min": float(merged_df["pm2_5"].min()),
            "pm25_max": float(merged_df["pm2_5"].max()),
            "pm25_mean": float(merged_df["pm2_5"].mean()),
            "null_rates": {col: float(merged_df[col].isna().mean()) for col in merged_df.columns},
        }
        report["cities"][city.id] = city_stats
        report["total_rows"] += len(merged_df)
        logger.info(
            "Processed %s: %d rows from %s to %s (mean PM2.5=%.1f µg/m³)",
            city.name,
            len(merged_df),
            city_stats["date_start"],
            city_stats["date_end"],
            city_stats["pm25_mean"],
        )

    # Save data quality report
    report_file = PROCESSED_DATA_DIR / "data_quality_report.json"
    with open(report_file, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    logger.info("Historical data fetching and processing complete. Total rows: %d", report["total_rows"])


if __name__ == "__main__":
    fetch_all_cities_data()
