"""Test to mathematically prove absence of data leakage in feature engineering."""

import numpy as np
import pandas as pd
from backend.app.features import extract_origin_features, build_stacked_samples


def test_origin_features_no_leakage() -> None:
    """Modifying future data after origin t must not affect origin features."""
    n = 100
    times = pd.date_range("2026-10-01", periods=n, freq="h", tz="Asia/Kolkata")
    base_pm25 = np.random.uniform(20.0, 150.0, size=n)

    df_original = pd.DataFrame(
        {
            "time": times,
            "pm2_5": base_pm25.copy(),
            "pm10": base_pm25 * 1.5,
            "latitude": 28.61,
            "longitude": 77.21,
            "city_id": "delhi",
        }
    )

    origin_idx = 50
    feats_before = extract_origin_features(df_original, origin_idx)

    # Mutate all future data after origin_idx
    df_tampered = df_original.copy()
    df_tampered.loc[origin_idx + 1 :, "pm2_5"] = 9999.0
    df_tampered.loc[origin_idx + 1 :, "pm10"] = 8888.0

    feats_after = extract_origin_features(df_tampered, origin_idx)

    for key in feats_before:
        assert (
            feats_before[key] == feats_after[key]
        ), f"Leakage detected in key '{key}': was {feats_before[key]} vs {feats_after[key]}"


def test_stacked_samples_shape_and_bounds() -> None:
    """Verify sample creation bounds and feature alignment."""
    n = 120
    times = pd.date_range("2026-10-01", periods=n, freq="h", tz="Asia/Kolkata")
    df = pd.DataFrame(
        {
            "time": times,
            "pm2_5": np.random.uniform(20.0, 100.0, size=n),
            "pm10": np.random.uniform(40.0, 150.0, size=n),
            "temperature_2m": np.random.uniform(15.0, 30.0, size=n),
            "latitude": 28.61,
            "longitude": 77.21,
            "city_id": "delhi",
        }
    )
    X, y, meta = build_stacked_samples(df, max_horizon=6, min_origin_history=24, sample_step_origin=5)
    assert len(X) == len(y) == len(meta)
    assert not X.isna().any().any()
    assert (y >= 0.0).all()

