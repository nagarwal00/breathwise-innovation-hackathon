"""Benchmark baselines for PM2.5 forecasting evaluation."""

import numpy as np
import pandas as pd


def predict_persistence(meta_df: pd.DataFrame) -> np.ndarray:
    """Persistence baseline: PM2.5 at forecast origin held constant for all horizons."""
    return meta_df["pm25_origin"].to_numpy(dtype=float)


def predict_seasonal_naive(meta_df: pd.DataFrame) -> np.ndarray:
    """Seasonal-naive baseline: PM2.5 at the same hour yesterday (t + h - 24)."""
    return meta_df["pm25_seasonal_naive"].to_numpy(dtype=float)

