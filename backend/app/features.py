"""Leakage-safe, high-performance feature engineering for PM2.5 forecasting."""

from typing import List, Tuple
import numpy as np
import pandas as pd

# Core feature columns used by the model
FEATURE_COLUMNS = [
    # Horizon
    "horizon_h",
    # Origin PM2.5 and lags
    "pm25_origin",
    "pm25_lag_1",
    "pm25_lag_2",
    "pm25_lag_3",
    "pm25_lag_6",
    "pm25_lag_12",
    "pm25_lag_24",
    "pm25_lag_48",
    "pm25_rolling_mean_6",
    "pm25_rolling_mean_24",
    "pm25_rolling_max_24",
    # Diurnal / seasonal reference known at origin
    "target_seasonal_ref_pm25",
    "target_seasonal_ref_ratio",
    # Origin other pollutants
    "pm10_origin",
    "no2_origin",
    "co_origin",
    "ozone_origin",
    "so2_origin",
    "pm25_pm10_ratio_origin",
    # Target weather forecast features (at t + h)
    "target_temperature_2m",
    "target_relative_humidity_2m",
    "target_wind_speed_10m",
    "target_wind_sin",
    "target_wind_cos",
    "target_precipitation",
    "target_surface_pressure",
    "target_boundary_layer_height",
    # Target calendar & seasonal features (at t + h)
    "target_hour_sin",
    "target_hour_cos",
    "target_dow_sin",
    "target_dow_cos",
    "target_month_sin",
    "target_month_cos",
    "target_is_winter_pollution_season",
    # Location
    "latitude",
    "longitude",
]


def extract_origin_features(df: pd.DataFrame, origin_idx: int) -> dict:
    """Extract features strictly available at origin time index t (no future data)."""
    row_t = df.iloc[origin_idx]

    def get_lag(col: str, lag_h: int) -> float:
        idx = origin_idx - lag_h
        if idx >= 0 and col in df.columns:
            return float(df.iloc[idx][col])
        return float(row_t.get(col, 0.0))

    start_6 = max(0, origin_idx - 5)
    start_24 = max(0, origin_idx - 23)
    pm25_rolling_mean_6 = float(df.iloc[start_6 : origin_idx + 1]["pm2_5"].mean())
    pm25_rolling_mean_24 = float(df.iloc[start_24 : origin_idx + 1]["pm2_5"].mean())
    pm25_rolling_max_24 = float(df.iloc[start_24 : origin_idx + 1]["pm2_5"].max())

    return {
        "pm25_origin": float(row_t["pm2_5"]),
        "pm25_lag_1": get_lag("pm2_5", 1),
        "pm25_lag_2": get_lag("pm2_5", 2),
        "pm25_lag_3": get_lag("pm2_5", 3),
        "pm25_lag_6": get_lag("pm2_5", 6),
        "pm25_lag_12": get_lag("pm2_5", 12),
        "pm25_lag_24": get_lag("pm2_5", 24),
        "pm25_lag_48": get_lag("pm2_5", 48),
        "pm25_rolling_mean_6": pm25_rolling_mean_6,
        "pm25_rolling_mean_24": pm25_rolling_mean_24,
        "pm25_rolling_max_24": pm25_rolling_max_24,
        "pm10_origin": float(row_t.get("pm10", 0.0)),
        "no2_origin": float(row_t.get("nitrogen_dioxide", 0.0)),
        "co_origin": float(row_t.get("carbon_monoxide", 0.0)),
        "ozone_origin": float(row_t.get("ozone", 0.0)),
        "so2_origin": float(row_t.get("sulphur_dioxide", 0.0)),
        "pm25_pm10_ratio_origin": float(row_t.get("pm25_pm10_ratio", 0.5)),
        "latitude": float(row_t.get("latitude", 0.0)),
        "longitude": float(row_t.get("longitude", 0.0)),
    }


def extract_target_features(
    df: pd.DataFrame,
    target_idx: int,
    seasonal_ref_pm25: float = 50.0,
    origin_pm25: float = 50.0,
) -> dict:
    """Extract weather forecast and calendar features at future target hour t + h."""
    row_target = df.iloc[target_idx]
    ref_ratio = min(5.0, max(0.1, seasonal_ref_pm25 / (origin_pm25 + 1e-3)))

    return {
        "target_seasonal_ref_pm25": float(seasonal_ref_pm25),
        "target_seasonal_ref_ratio": float(ref_ratio),
        "target_temperature_2m": float(row_target.get("temperature_2m", 20.0)),
        "target_relative_humidity_2m": float(row_target.get("relative_humidity_2m", 50.0)),
        "target_wind_speed_10m": float(row_target.get("wind_speed_10m", 2.0)),
        "target_wind_sin": float(row_target.get("wind_sin", 0.0)),
        "target_wind_cos": float(row_target.get("wind_cos", 1.0)),
        "target_precipitation": float(row_target.get("precipitation", 0.0)),
        "target_surface_pressure": float(row_target.get("surface_pressure", 1000.0)),
        "target_boundary_layer_height": float(row_target.get("boundary_layer_height", 500.0)),
        "target_hour_sin": float(row_target.get("hour_sin", 0.0)),
        "target_hour_cos": float(row_target.get("hour_cos", 1.0)),
        "target_dow_sin": float(row_target.get("dow_sin", 0.0)),
        "target_dow_cos": float(row_target.get("dow_cos", 1.0)),
        "target_month_sin": float(row_target.get("month_sin", 0.0)),
        "target_month_cos": float(row_target.get("month_cos", 1.0)),
        "target_is_winter_pollution_season": float(row_target.get("is_winter_pollution_season", 0.0)),
    }


def build_stacked_samples(
    df: pd.DataFrame,
    max_horizon: int = 48,
    min_origin_history: int = 48,
    sample_step_origin: int = 2,
    sample_horizons: List[int] | None = None,
) -> Tuple[pd.DataFrame, pd.Series, pd.DataFrame]:
    """
    High-performance, vectorized sample generation across horizons h = 1..max_horizon.
    Strictly leakage-safe: origin features only use data <= t.
    """
    n_rows = len(df)
    if sample_horizons is None:
        sample_horizons = list(range(1, max_horizon + 1))

    # Pre-extract arrays for instant indexing
    pm25_arr = df["pm2_5"].to_numpy(dtype=float)
    pm10_arr = df["pm10"].to_numpy(dtype=float) if "pm10" in df else np.zeros(n_rows)
    no2_arr = df["nitrogen_dioxide"].to_numpy(dtype=float) if "nitrogen_dioxide" in df else np.zeros(n_rows)
    co_arr = df["carbon_monoxide"].to_numpy(dtype=float) if "carbon_monoxide" in df else np.zeros(n_rows)
    o3_arr = df["ozone"].to_numpy(dtype=float) if "ozone" in df else np.zeros(n_rows)
    so2_arr = df["sulphur_dioxide"].to_numpy(dtype=float) if "sulphur_dioxide" in df else np.zeros(n_rows)
    ratio_arr = df["pm25_pm10_ratio"].to_numpy(dtype=float) if "pm25_pm10_ratio" in df else np.full(n_rows, 0.5)

    lat_val = float(df["latitude"].iloc[0]) if "latitude" in df else 0.0
    lon_val = float(df["longitude"].iloc[0]) if "longitude" in df else 0.0
    city_id = str(df["city_id"].iloc[0]) if "city_id" in df else "unknown"

    # Pre-calculate rolling stats using pandas vectorization
    roll_6_arr = df["pm2_5"].rolling(6, min_periods=1).mean().to_numpy(dtype=float)
    roll_24_arr = df["pm2_5"].rolling(24, min_periods=1).mean().to_numpy(dtype=float)
    max_24_arr = df["pm2_5"].rolling(24, min_periods=1).max().to_numpy(dtype=float)

    # Weather arrays
    temp_arr = df["temperature_2m"].to_numpy(dtype=float) if "temperature_2m" in df else np.full(n_rows, 20.0)
    rh_arr = df["relative_humidity_2m"].to_numpy(dtype=float) if "relative_humidity_2m" in df else np.full(n_rows, 50.0)
    wspd_arr = df["wind_speed_10m"].to_numpy(dtype=float) if "wind_speed_10m" in df else np.full(n_rows, 2.0)
    wsin_arr = df["wind_sin"].to_numpy(dtype=float) if "wind_sin" in df else np.zeros(n_rows)
    wcos_arr = df["wind_cos"].to_numpy(dtype=float) if "wind_cos" in df else np.ones(n_rows)
    precip_arr = df["precipitation"].to_numpy(dtype=float) if "precipitation" in df else np.zeros(n_rows)
    press_arr = df["surface_pressure"].to_numpy(dtype=float) if "surface_pressure" in df else np.full(n_rows, 1000.0)
    blh_arr = df["boundary_layer_height"].to_numpy(dtype=float) if "boundary_layer_height" in df else np.full(n_rows, 500.0)

    # Calendar arrays
    hsin_arr = df["hour_sin"].to_numpy(dtype=float) if "hour_sin" in df else np.zeros(n_rows)
    hcos_arr = df["hour_cos"].to_numpy(dtype=float) if "hour_cos" in df else np.ones(n_rows)
    dsin_arr = df["dow_sin"].to_numpy(dtype=float) if "dow_sin" in df else np.zeros(n_rows)
    dcos_arr = df["dow_cos"].to_numpy(dtype=float) if "dow_cos" in df else np.ones(n_rows)
    msin_arr = df["month_sin"].to_numpy(dtype=float) if "month_sin" in df else np.zeros(n_rows)
    mcos_arr = df["month_cos"].to_numpy(dtype=float) if "month_cos" in df else np.ones(n_rows)
    winter_arr = df["is_winter_pollution_season"].to_numpy(dtype=float) if "is_winter_pollution_season" in df else np.zeros(n_rows)
    time_series = df["time"]

    records = []
    targets = []
    meta = []

    origins = list(range(min_origin_history, n_rows - max_horizon, sample_step_origin))

    for o in origins:
        pm25_orig = pm25_arr[o]
        lag_1 = pm25_arr[o - 1]
        lag_2 = pm25_arr[o - 2]
        lag_3 = pm25_arr[o - 3]
        lag_6 = pm25_arr[o - 6]
        lag_12 = pm25_arr[o - 12]
        lag_24 = pm25_arr[o - 24]
        lag_48 = pm25_arr[o - 48]
        r6 = roll_6_arr[o]
        r24 = roll_24_arr[o]
        m24 = max_24_arr[o]
        pm10_orig = pm10_arr[o]
        no2_orig = no2_arr[o]
        co_orig = co_arr[o]
        o3_orig = o3_arr[o]
        so2_orig = so2_arr[o]
        ratio_orig = ratio_arr[o]
        o_time = time_series.iloc[o]

        for h in sample_horizons:
            tgt = o + h
            actual = pm25_arr[tgt]

            # Diurnal reference strictly known <= o
            ref_idx = tgt - 24 if (tgt - 24 <= o) else tgt - 48
            ref_val = pm25_arr[ref_idx] if ref_idx >= 0 else pm25_orig
            ref_ratio = min(5.0, max(0.1, ref_val / (pm25_orig + 1e-3)))

            rec = {
                "horizon_h": h,
                "pm25_origin": pm25_orig,
                "pm25_lag_1": lag_1,
                "pm25_lag_2": lag_2,
                "pm25_lag_3": lag_3,
                "pm25_lag_6": lag_6,
                "pm25_lag_12": lag_12,
                "pm25_lag_24": lag_24,
                "pm25_lag_48": lag_48,
                "pm25_rolling_mean_6": r6,
                "pm25_rolling_mean_24": r24,
                "pm25_rolling_max_24": m24,
                "target_seasonal_ref_pm25": ref_val,
                "target_seasonal_ref_ratio": ref_ratio,
                "pm10_origin": pm10_orig,
                "no2_origin": no2_orig,
                "co_origin": co_orig,
                "ozone_origin": o3_orig,
                "so2_origin": so2_orig,
                "pm25_pm10_ratio_origin": ratio_orig,
                "target_temperature_2m": temp_arr[tgt],
                "target_relative_humidity_2m": rh_arr[tgt],
                "target_wind_speed_10m": wspd_arr[tgt],
                "target_wind_sin": wsin_arr[tgt],
                "target_wind_cos": wcos_arr[tgt],
                "target_precipitation": precip_arr[tgt],
                "target_surface_pressure": press_arr[tgt],
                "target_boundary_layer_height": blh_arr[tgt],
                "target_hour_sin": hsin_arr[tgt],
                "target_hour_cos": hcos_arr[tgt],
                "target_dow_sin": dsin_arr[tgt],
                "target_dow_cos": dcos_arr[tgt],
                "target_month_sin": msin_arr[tgt],
                "target_month_cos": mcos_arr[tgt],
                "target_is_winter_pollution_season": winter_arr[tgt],
                "latitude": lat_val,
                "longitude": lon_val,
            }
            records.append(rec)
            targets.append(actual)

            seas_idx = tgt - 24
            seas_val = pm25_arr[seas_idx] if seas_idx >= 0 else pm25_orig
            meta.append(
                {
                    "origin_idx": o,
                    "target_idx": tgt,
                    "origin_time": o_time,
                    "target_time": time_series.iloc[tgt],
                    "horizon_h": h,
                    "city_id": city_id,
                    "pm25_origin": pm25_orig,
                    "pm25_seasonal_naive": seas_val,
                    "actual_pm25": actual,
                }
            )

    X_df = pd.DataFrame(records)[FEATURE_COLUMNS]
    y_series = pd.Series(targets)
    meta_df = pd.DataFrame(meta)
    return X_df, y_series, meta_df
