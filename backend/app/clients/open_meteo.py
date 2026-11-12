"""Open-Meteo API Client with disk TTL caching, retries, and offline fallback."""

import json
import logging
import time
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Any, Dict, Optional, Tuple
import httpx

from backend.app.config import CACHE_DATA_DIR, settings

logger = logging.getLogger("breathewise.client")
logging.basicConfig(level=logging.INFO)

IST = timezone(timedelta(hours=5, minutes=30))


def get_ist_now() -> datetime:
    return datetime.now(IST)


def round_coord(coord: float) -> float:
    return round(coord, 2)


class OpenMeteoClient:
    """Handles upstream HTTP requests to Open-Meteo APIs with disk caching and resilience."""

    AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"
    WEATHER_FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
    WEATHER_ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive"
    GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"

    def __init__(self, cache_dir: Path = CACHE_DATA_DIR) -> None:
        self.cache_dir = cache_dir
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.timeout = settings.UPSTREAM_TIMEOUT_SECONDS
        self.max_retries = settings.MAX_RETRIES
        self.backoff = settings.RETRY_BACKOFF_SECONDS
        self._memory_cache: Dict[str, Tuple[float, Any]] = {}

    def _cache_key(self, prefix: str, lat: float, lon: float) -> str:
        return f"{prefix}_{round_coord(lat):.2f}_{round_coord(lon):.2f}.json"

    def _read_cache(self, filename: str) -> Optional[Tuple[Dict[str, Any], datetime]]:
        cache_path = self.cache_dir / filename
        if not cache_path.exists():
            return None
        try:
            with open(cache_path, "r", encoding="utf-8") as f:
                wrapped = json.load(f)
            cached_at_str = wrapped.get("cached_at")
            cached_at = (
                datetime.fromisoformat(cached_at_str)
                if cached_at_str
                else datetime.fromtimestamp(cache_path.stat().st_mtime, tz=IST)
            )
            data = wrapped.get("data", wrapped)
            return data, cached_at
        except Exception as e:
            logger.warning("Error reading cache file %s: %s", cache_path, e)
            return None

    def _write_cache(self, filename: str, data: Dict[str, Any]) -> None:
        cache_path = self.cache_dir / filename
        try:
            wrapped = {
                "cached_at": get_ist_now().isoformat(),
                "data": data,
            }
            with open(cache_path, "w", encoding="utf-8") as f:
                json.dump(wrapped, f, indent=2)
        except Exception as e:
            logger.warning("Error writing cache file %s: %s", cache_path, e)

    def _fetch_with_retry(
        self, url: str, params: Dict[str, Any]
    ) -> Dict[str, Any]:
        last_exception: Optional[Exception] = None
        for attempt in range(self.max_retries + 1):
            try:
                with httpx.Client(timeout=self.timeout) as client:
                    response = client.get(
                        url,
                        params=params,
                        headers={"User-Agent": "BreatheWise/1.0"},
                    )
                    response.raise_for_status()
                    return response.json()
            except (httpx.RequestError, httpx.HTTPStatusError) as exc:
                last_exception = exc
                logger.warning(
                    "Open-Meteo request failed (attempt %d/%d) for %s: %s",
                    attempt + 1,
                    self.max_retries + 1,
                    url,
                    exc,
                )
                if attempt < self.max_retries:
                    time.sleep(self.backoff * (2**attempt))
        raise last_exception or RuntimeError(f"Failed to fetch {url}")

    def get_air_quality(
        self,
        lat: float,
        lon: float,
        past_days: int = 7,
        forecast_days: int = 3,
        force_fresh: bool = False,
    ) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """Fetch air quality data. Returns (payload, data_status)."""
        cache_file = self._cache_key(f"aq_p{past_days}_f{forecast_days}", lat, lon)
        cached_entry = self._read_cache(cache_file)
        now = get_ist_now()

        # Check if cache is fresh within TTL
        if not force_fresh and cached_entry is not None:
            data, cached_at = cached_entry
            age_minutes = (now - cached_at).total_seconds() / 60.0
            if age_minutes <= settings.CACHE_TTL_MINUTES:
                return data, {
                    "source": "cache",
                    "cached_at": cached_at.isoformat(),
                    "cache_age_min": round(age_minutes, 1),
                    "is_fallback": False,
                }

        # Attempt live call
        params = {
            "latitude": round_coord(lat),
            "longitude": round_coord(lon),
            "hourly": "pm2_5,pm10,nitrogen_dioxide,ozone,carbon_monoxide,sulphur_dioxide",
            "past_days": past_days,
            "forecast_days": forecast_days,
            "timezone": settings.TIMEZONE,
        }
        try:
            live_data = self._fetch_with_retry(self.AIR_QUALITY_URL, params)
            self._write_cache(cache_file, live_data)
            return live_data, {
                "source": "live",
                "cached_at": None,
                "cache_age_min": 0.0,
                "is_fallback": False,
            }
        except Exception as e:
            logger.error("Live Air Quality request failed: %s", e)
            # Fallback to cache if available, regardless of TTL
            if cached_entry is not None:
                data, cached_at = cached_entry
                age_minutes = (now - cached_at).total_seconds() / 60.0
                logger.info(
                    "Serving fallback cached air quality data for (%s, %s) from %s",
                    lat,
                    lon,
                    cached_at,
                )
                return data, {
                    "source": "cache",
                    "cached_at": cached_at.isoformat(),
                    "cache_age_min": round(age_minutes, 1),
                    "is_fallback": True,
                    "fallback_reason": str(e),
                }
            raise RuntimeError(
                f"Air Quality API unavailable and no local cache exists for ({lat}, {lon})"
            ) from e

    def get_weather_forecast(
        self,
        lat: float,
        lon: float,
        past_days: int = 7,
        forecast_days: int = 3,
        force_fresh: bool = False,
    ) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """Fetch weather forecast data. Returns (payload, data_status)."""
        cache_file = self._cache_key(f"weather_p{past_days}_f{forecast_days}", lat, lon)
        cached_entry = self._read_cache(cache_file)
        now = get_ist_now()

        if not force_fresh and cached_entry is not None:
            data, cached_at = cached_entry
            age_minutes = (now - cached_at).total_seconds() / 60.0
            if age_minutes <= settings.CACHE_TTL_MINUTES:
                return data, {
                    "source": "cache",
                    "cached_at": cached_at.isoformat(),
                    "cache_age_min": round(age_minutes, 1),
                    "is_fallback": False,
                }

        params = {
            "latitude": round_coord(lat),
            "longitude": round_coord(lon),
            "hourly": "temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,precipitation,surface_pressure,boundary_layer_height",
            "past_days": past_days,
            "forecast_days": forecast_days,
            "timezone": settings.TIMEZONE,
        }
        try:
            live_data = self._fetch_with_retry(self.WEATHER_FORECAST_URL, params)
            self._write_cache(cache_file, live_data)
            return live_data, {
                "source": "live",
                "cached_at": None,
                "cache_age_min": 0.0,
                "is_fallback": False,
            }
        except Exception as e:
            logger.error("Live Weather request failed: %s", e)
            if cached_entry is not None:
                data, cached_at = cached_entry
                age_minutes = (now - cached_at).total_seconds() / 60.0
                return data, {
                    "source": "cache",
                    "cached_at": cached_at.isoformat(),
                    "cache_age_min": round(age_minutes, 1),
                    "is_fallback": True,
                    "fallback_reason": str(e),
                }
            raise RuntimeError(
                f"Weather API unavailable and no local cache exists for ({lat}, {lon})"
            ) from e

    def get_historical_air_quality(
        self, lat: float, lon: float, start_date: str, end_date: str
    ) -> Dict[str, Any]:
        """Fetch historical air quality by date range (e.g. YYYY-MM-DD)."""
        params = {
            "latitude": round_coord(lat),
            "longitude": round_coord(lon),
            "hourly": "pm2_5,pm10,nitrogen_dioxide,ozone,carbon_monoxide,sulphur_dioxide",
            "start_date": start_date,
            "end_date": end_date,
            "timezone": settings.TIMEZONE,
        }
        return self._fetch_with_retry(self.AIR_QUALITY_URL, params)

    def get_historical_weather(
        self, lat: float, lon: float, start_date: str, end_date: str
    ) -> Dict[str, Any]:
        """Fetch historical weather archive by date range."""
        params = {
            "latitude": round_coord(lat),
            "longitude": round_coord(lon),
            "hourly": "temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,precipitation,surface_pressure",
            "start_date": start_date,
            "end_date": end_date,
            "timezone": settings.TIMEZONE,
        }
        return self._fetch_with_retry(self.WEATHER_ARCHIVE_URL, params)

    def geocode(self, query: str, count: int = 8) -> Dict[str, Any]:
        """Geocoding place search with simple caching."""
        clean_q = query.strip().lower()
        cache_file = f"geocode_{clean_q}.json"
        cached_entry = self._read_cache(cache_file)
        if cached_entry is not None:
            data, _ = cached_entry
            return data

        params = {
            "name": query.strip(),
            "count": count,
            "language": "en",
            "format": "json",
        }
        data = self._fetch_with_retry(self.GEOCODING_URL, params)
        self._write_cache(cache_file, data)
        return data


# Default singleton client instance
client = OpenMeteoClient()

