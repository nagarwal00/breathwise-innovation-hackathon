"""Pydantic request and response schemas matching the API contract."""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator


class LocationModel(BaseModel):
    name: str = "Custom Location"
    lat: float
    lon: float


class DataStatusModel(BaseModel):
    source: str = "live"  # "live" | "cache"
    cached_at: Optional[str] = None
    cache_age_min: Optional[float] = None
    is_fallback: bool = False
    fallback_reason: Optional[str] = None


class WindowItem(BaseModel):
    start: str
    end: str
    mean_pm25: float
    category: str
    verdict: Optional[str] = None


class AvoidWindowItem(BaseModel):
    start: str
    end: str
    mean_pm25: float
    category: str


class UsualWindowItem(BaseModel):
    start: str
    mean_pm25: float


class ExposureModel(BaseModel):
    usual_dose: float
    recommended_dose: float
    avoided_pct: float
    method: str


class PlanRequest(BaseModel):
    lat: float = Field(..., ge=-90.0, le=90.0, description="Latitude between -90 and 90")
    lon: float = Field(..., ge=-180.0, le=180.0, description="Longitude between -180 and 180")
    profile: str = Field("healthy_adult", description="Health profile key")
    activity: str = Field("exercise", description="Activity key")
    duration_min: int = Field(60, ge=15, le=480, description="Duration in minutes (15 to 480)")
    allowed_start: str = Field("05:00", description="Earliest allowed start (HH:MM)")
    allowed_end: str = Field("21:00", description="Latest allowed end (HH:MM)")
    usual_start: str = Field("07:00", description="User usual routine start (HH:MM)")
    schedule_flexibility: str = Field("moderate", description="Flexibility mode: strict | moderate | flexible")
    language: str = Field("en", description="Language code: en or hi")
    force_fresh: bool = Field(False, description="Bypass cache and pull fresh upstream data")

    @field_validator("profile")
    @classmethod
    def validate_profile(cls, v: str) -> str:
        valid_profiles = [
            "healthy_adult",
            "outdoor_worker",
            "pregnant",
            "child",
            "elderly",
            "respiratory_cardiac",
        ]
        if v not in valid_profiles:
            raise ValueError(f"Unknown profile '{v}'. Must be one of {valid_profiles}")
        return v

    @field_validator("activity")
    @classmethod
    def validate_activity(cls, v: str) -> str:
        valid_activities = [
            # Categorized activities
            "morning_commute",
            "evening_commute",
            "school_transit",
            "grocery_errands",
            "exercise_running",
            "exercise_cycling",
            "brisk_walking",
            "outdoor_sports",
            "kids_play",
            "dog_walking",
            "elderly_walk",
            "ventilate_home",
            "outdoor_work",
            "street_vending",
            # Legacy aliases
            "exercise",
            "commute",
        ]
        if v not in valid_activities:
            raise ValueError(f"Unknown activity '{v}'. Must be one of {valid_activities}")
        return v


class PlanResponse(BaseModel):
    generated_at: str
    data_status: DataStatusModel
    location: LocationModel
    best_windows: List[WindowItem]
    avoid_windows: List[AvoidWindowItem]
    usual_window: UsualWindowItem
    exposure: ExposureModel
    verdict: str
    advice: str
    mask_recommended: bool
    indoor_alternative: bool
    disclaimer: str


class CurrentAQResponse(BaseModel):
    time: str
    lat: float
    lon: float
    pm25: float
    pm10: float
    category: str
    category_color: str
    trend: str  # "rising", "falling", "stable"
    trend_delta_3h: float
    verdict: str
    profile: str
    data_status: DataStatusModel


class HourlyForecastItem(BaseModel):
    time: str
    horizon_h: int
    pm25_p50: float
    pm25_p10: float
    pm25_p90: float
    category: str
    category_color: str


class ForecastResponse(BaseModel):
    generated_at: str
    data_status: DataStatusModel
    lat: float
    lon: float
    who_reference_24h: float = 15.0
    forecast: List[HourlyForecastItem]

