"""Unit tests for PM2.5 forecasting model, uncertainty calibrator, and predictor."""

import numpy as np
import pandas as pd
import pytest

from backend.app.model.intervals import UncertaintyCalibrator
from backend.app.model.predict import ForecastPredictor
from backend.app.model.train import compute_adaptive_ensemble


def test_uncertainty_calibrator_bounds() -> None:
    """Verify that uncertainty intervals never output negative p10 and that p90 >= p10."""
    calibrator = UncertaintyCalibrator()
    calibrator.quantiles = {
        "1_to_6h": (-15.0, 20.0),
        "7_to_24h": (-20.0, 25.0),
        "25_to_48h": (-25.0, 30.0),
    }

    preds = np.array([5.0, 50.0, 100.0])
    horizons = np.array([2, 12, 36])

    p10, p90 = calibrator.apply(preds, horizons)

    # 5.0 - 15.0 = -10.0 -> must be clipped to 0.0
    assert p10[0] == 0.0
    assert p90[0] >= p10[0]
    assert p90[1] >= p10[1]
    assert p90[2] >= p10[2]


def test_adaptive_ensemble_weights() -> None:
    """Check adaptive horizon weighting transitions from inertia to weather/diurnal."""
    horizons = np.array([1, 6, 12, 24, 48])
    pers = np.full(5, 100.0)
    seas = np.full(5, 60.0)
    ml = np.full(5, 80.0)

    ensemble = compute_adaptive_ensemble(ml, pers, seas, horizons)
    assert len(ensemble) == 5
    # Near horizon (h=1) should be closer to persistence than far horizon (h=48)
    assert ensemble[0] > ensemble[4]
    assert (ensemble >= 0.0).all()


def test_predictor_48h_shape(tmp_path) -> None:
    """Verify that predictor outputs exactly 48 hourly predictions with valid schema."""
    predictor = ForecastPredictor()
    times = pd.date_range("2026-11-12 00:00", periods=50, freq="h", tz="Asia/Kolkata")
    history_df = pd.DataFrame(
        {
            "time": times[:48],
            "pm2_5": np.random.uniform(30.0, 80.0, size=48),
            "pm10": np.random.uniform(50.0, 120.0, size=48),
            "temperature_2m": np.random.uniform(20.0, 30.0, size=48),
            "wind_speed_10m": np.random.uniform(1.0, 4.0, size=48),
            "latitude": 28.61,
            "longitude": 77.21,
            "city_id": "delhi",
        }
    )
    future_times = pd.date_range("2026-11-14 00:00", periods=48, freq="h", tz="Asia/Kolkata")
    weather_forecast_df = pd.DataFrame(
        {
            "time": future_times,
            "temperature_2m": np.random.uniform(20.0, 30.0, size=48),
            "relative_humidity_2m": np.random.uniform(40.0, 70.0, size=48),
            "wind_speed_10m": np.random.uniform(1.0, 5.0, size=48),
            "latitude": 28.61,
            "longitude": 77.21,
        }
    )

    preds = predictor.predict_48h(history_df, weather_forecast_df, 28.61, 77.21)
    assert len(preds) == 48
    for item in preds:
        assert "time" in item
        assert "horizon_h" in item
        assert "pm25_p50" in item
        assert "pm25_p10" in item
        assert "pm25_p90" in item
        assert item["pm25_p90"] >= item["pm25_p10"]
        assert item["pm25_p10"] >= 0.0
        assert item["category"] in ["good", "satisfactory", "moderate", "poor", "very_poor", "severe"]
        assert item["category_color"].startswith("#")

