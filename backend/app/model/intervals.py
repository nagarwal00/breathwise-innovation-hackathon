"""Empirical residual quantile uncertainty bands for PM2.5 forecasting."""

from typing import Dict, Tuple
import numpy as np
import pandas as pd


HORIZON_BUCKETS = {
    "1_to_6h": (1, 6),
    "7_to_24h": (7, 24),
    "25_to_48h": (25, 48),
}


def get_bucket_for_horizon(horizon_h: int) -> str:
    """Return the bucket key for a given horizon in hours."""
    if horizon_h <= 6:
        return "1_to_6h"
    elif horizon_h <= 24:
        return "7_to_24h"
    else:
        return "25_to_48h"


class UncertaintyCalibrator:
    """Calibrates empirical residual quantiles (p10, p90) by horizon bucket."""

    def __init__(self) -> None:
        # Default fallback quantiles in µg/m³
        self.quantiles: Dict[str, Tuple[float, float]] = {
            "1_to_6h": (-8.0, 8.0),
            "7_to_24h": (-18.0, 20.0),
            "25_to_48h": (-30.0, 35.0),
        }

    def fit(self, val_meta: pd.DataFrame, y_val_actual: np.ndarray, y_val_pred: np.ndarray) -> None:
        """Fit empirical residual quantiles on validation block residuals = actual - pred."""
        residuals = y_val_actual - y_val_pred
        val_df = val_meta.copy()
        val_df["residual"] = residuals

        for bucket, (low_h, high_h) in HORIZON_BUCKETS.items():
            mask = (val_df["horizon_h"] >= low_h) & (val_df["horizon_h"] <= high_h)
            bucket_residuals = val_df.loc[mask, "residual"].dropna()
            if len(bucket_residuals) >= 10:
                p10 = float(np.percentile(bucket_residuals, 10))
                p90 = float(np.percentile(bucket_residuals, 90))
                self.quantiles[bucket] = (p10, p90)

    def apply(self, y_pred: np.ndarray, horizons: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Apply residual quantiles to point predictions, clipping bounds to >= 0."""
        p10_out = np.zeros_like(y_pred)
        p90_out = np.zeros_like(y_pred)

        for i, (pred, h) in enumerate(zip(y_pred, horizons)):
            bucket = get_bucket_for_horizon(int(h))
            q10, q90 = self.quantiles[bucket]
            # p10 = pred + residual_p10, p90 = pred + residual_p90
            p10_out[i] = max(0.0, float(pred + q10))
            p90_out[i] = max(p10_out[i], float(pred + q90))

        return p10_out, p90_out

    def evaluate_coverage(
        self, y_actual: np.ndarray, p10: np.ndarray, p90: np.ndarray
    ) -> float:
        """Compute fraction of observations falling within [p10, p90]."""
        covered = (y_actual >= p10) & (y_actual <= p90)
        return float(np.mean(covered) * 100.0)

