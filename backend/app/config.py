"""Configuration loader and application settings for BreatheWise."""

import os
from pathlib import Path
from typing import Any, Dict, List
import yaml
from pydantic import BaseModel, Field

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent.parent
CONFIG_DIR = BASE_DIR / "config"
DATA_DIR = BASE_DIR / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
CACHE_DATA_DIR = DATA_DIR / "cache"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
ARTIFACTS_DIR = BASE_DIR / "artifacts"
SLIDES_DIR = ARTIFACTS_DIR / "slides"
I18N_DIR = BASE_DIR / "i18n"

# Ensure runtime directories exist
for directory in [RAW_DATA_DIR, CACHE_DATA_DIR, PROCESSED_DATA_DIR, ARTIFACTS_DIR, SLIDES_DIR]:
    directory.mkdir(parents=True, exist_ok=True)


class CityConfig(BaseModel):
    id: str
    name: str
    lat: float
    lon: float
    state: str


class ProfileConfig(BaseModel):
    label: str
    factor: float
    description: str
    max_duration_hours: int = 24


class ActivityConfig(BaseModel):
    label: str
    category_group: str = "general"
    category_group_label: str = "General Outdoor"
    default_duration_min: int
    default_usual_start: str
    practical_window_start: str = "05:00"
    practical_window_end: str = "21:00"
    ventilation_rate_m3h: float | None = None
    threshold_key: str = "exercise_ok"
    intensity: str = "moderate"
    description: str = ""
    icon: str = "Activity"


class Settings:
    """Singleton settings holder loading configuration YAML files."""

    TIMEZONE: str = "Asia/Kolkata"
    CACHE_TTL_MINUTES: int = int(os.getenv("CACHE_TTL_MINUTES", "1440"))
    UPSTREAM_TIMEOUT_SECONDS: float = 8.0
    MAX_RETRIES: int = 2
    RETRY_BACKOFF_SECONDS: float = 0.5

    # CPCB PM2.5 categories (µg/m³)
    CPCB_BREAKPOINTS = [
        (0.0, 30.0, "good", "#2E9E4F"),
        (30.0, 60.0, "satisfactory", "#8BC34A"),
        (60.0, 90.0, "moderate", "#F2C94C"),
        (90.0, 120.0, "poor", "#F2994A"),
        (120.0, 250.0, "very_poor", "#E5484D"),
        (250.0, 9999.0, "severe", "#8E1B2C"),
    ]

    WHO_PM25_24H_GUIDELINE: float = 15.0

    def __init__(self) -> None:
        self._cities: List[CityConfig] = []
        self._profiles: Dict[str, ProfileConfig] = {}
        self._base_thresholds: Dict[str, float] = {}
        self._activities: Dict[str, ActivityConfig] = {}
        self.reload()

    def reload(self) -> None:
        # Load cities
        cities_file = CONFIG_DIR / "cities.yaml"
        if cities_file.exists():
            with open(cities_file, "r", encoding="utf-8") as f:
                data = yaml.safe_load(f)
                self._cities = [CityConfig(**c) for c in data.get("cities", [])]

        # Load profiles & thresholds
        profiles_file = CONFIG_DIR / "profiles.yaml"
        if profiles_file.exists():
            with open(profiles_file, "r", encoding="utf-8") as f:
                data = yaml.safe_load(f)
                self._base_thresholds = data.get("base_thresholds", {})
                self._profiles = {
                    k: ProfileConfig(**v)
                    for k, v in data.get("profiles", {}).items()
                }

        # Load activities
        activities_file = CONFIG_DIR / "activities.yaml"
        if activities_file.exists():
            with open(activities_file, "r", encoding="utf-8") as f:
                data = yaml.safe_load(f)
                self._activities = {
                    k: ActivityConfig(**v)
                    for k, v in data.get("activities", {}).items()
                }

    @property
    def cities(self) -> List[CityConfig]:
        return self._cities

    @property
    def profiles(self) -> Dict[str, ProfileConfig]:
        return self._profiles

    @property
    def base_thresholds(self) -> Dict[str, float]:
        return self._base_thresholds

    @property
    def activities(self) -> Dict[str, ActivityConfig]:
        return self._activities

    def get_cpcb_category(self, pm25: float) -> tuple[str, str]:
        """Returns (category_slug, color_hex) for a given PM2.5 concentration."""
        val = max(0.0, pm25)
        for low, high, slug, color in self.CPCB_BREAKPOINTS:
            if val <= high or high == 9999.0:
                return slug, color
        return "severe", "#8E1B2C"


settings = Settings()

