"""Serving predictor for 48-hour PM2.5 forecasting with uncertainty bands."""

import logging
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional
import joblib
import numpy as np
import pandas as pd

from backend.app.config import ARTIFACTS_DIR, settings
from backend.app.features import (
    FEATURE_COLUMNS,
    extract_origin_features,
    extract_target_features,
)
from backend.app.model.train import compute_adaptive_ensemble

logger = logging.getLogger("breathewise.predict")


class ForecastPredictor:
    """Loads trained model artifact and generates 48h forecasts with uncertainty bounds."""

    def __init__(self, artifact_path: Path = ARTIFACTS_DIR / "model.joblib") -> None:
        self.artifact_path = artifact_path
        self.ml_model = None
        self.calibrator = None
        self.feature_columns = FEATURE_COLUMNS
        self.load_model()

    def load_model(self) -> None:
        if not self.artifact_path.exists():
            logger.warning("Model artifact not found at %s. Forecasts will use fallback.", self.artifact_path)
            return
        try:
            artifact = joblib.load(self.artifact_path)
            self.ml_model = artifact.get("ml_model") or artifact.get("model")
            self.calibrator = artifact["calibrator"]
            self.feature_columns = artifact.get("feature_columns", FEATURE_COLUMNS)
            logger.info("Successfully loaded model artifact from %s", self.artifact_path)
        except Exception as e:
            logger.error("Failed to load model artifact: %s", e)

    def predict_48h(
        self,
        history_df: pd.DataFrame,
        weather_forecast_df: pd.DataFrame,
        lat: float,
        lon: float,
        origin_time: Optional[pd.Timestamp] = None,
    ) -> List[Dict[str, Any]]:
        """
        Generate 48 hourly predictions (t+1 .. t+48) with p10, p50, p90 and CPCB categories.
        history_df: cleaned DataFrame containing at least recent 48 hours of air quality & weather.
        weather_forecast_df: cleaned DataFrame containing future 48 hours of weather forecast.
        """
        if self.ml_model is None or self.calibrator is None:
            self.load_model()

        origin_idx = len(history_df) - 1
        origin_feats = extract_origin_features(history_df, origin_idx)
        origin_feats["latitude"] = lat
        origin_feats["longitude"] = lon
        pm25_orig = origin_feats["pm25_origin"]

        if origin_time is None:
            origin_time = history_df.iloc[origin_idx]["time"]

        records = []
        target_times = []
        horizons = []
        pers_preds = []
        seas_preds = []

        max_h = min(48, len(weather_forecast_df))

        for h in range(1, max_h + 1):
            target_idx = h - 1

            # Lookup diurnal reference from history_df if available
            ref_offset = 24 if h <= 24 else 48
            ref_idx = origin_idx - ref_offset + h
            if 0 <= ref_idx < len(history_df) and "pm2_5" in history_df.columns:
                seasonal_ref = float(history_df.iloc[ref_idx]["pm2_5"])
            else:
                seasonal_ref = pm25_orig

            target_feats = extract_target_features(
                weather_forecast_df,
                target_idx,
                seasonal_ref_pm25=seasonal_ref,
                origin_pm25=pm25_orig,
            )
            t_time = weather_forecast_df.iloc[target_idx]["time"]

            sample = {"horizon_h": h, **origin_feats, **target_feats}
            records.append(sample)
            target_times.append(t_time)
            horizons.append(h)

            pers_preds.append(pm25_orig)
            seas_preds.append(seasonal_ref)

        X_serving = pd.DataFrame(records)[self.feature_columns]
        h_arr = np.array(horizons)
        pers_arr = np.array(pers_preds)
        seas_arr = np.array(seas_preds)

        if self.ml_model is not None:
            y_log = self.ml_model.predict(X_serving)
            ml_raw = np.clip(np.expm1(y_log), 0.0, None)
            p50 = compute_adaptive_ensemble(ml_raw, pers_arr, seas_arr, h_arr)
            p10, p90 = self.calibrator.apply(p50, h_arr)
        else:
            p50 = pers_arr
            p10 = np.clip(p50 * 0.8, 0.0, None)
            p90 = p50 * 1.25

        forecast_list = []
        for i in range(len(horizons)):
            val_p50 = round(float(p50[i]), 1)
            val_p10 = round(float(p10[i]), 1)
            val_p90 = round(float(p90[i]), 1)
            cat_slug, color = settings.get_cpcb_category(val_p50)

            forecast_list.append(
                {
                    "time": target_times[i].isoformat(),
                    "horizon_h": int(horizons[i]),
                    "pm25_p50": val_p50,
                    "pm25_p10": val_p10,
                    "pm25_p90": val_p90,
                    "category": cat_slug,
                    "category_color": color,
                }
            )

        return forecast_list


predictor = ForecastPredictor()
