# BreatheWise PM2.5 Forecast Model Card

## 1. Model Summary
- **Model Family**: Adaptive Ensemble combining Gradient-Boosted Trees (`HistGradientBoostingRegressor` on $\ln(1 + \text{PM2.5})$) with Diurnal Seasonal-Naive and Inertial Persistence.
- **Target**: Hourly PM2.5 (µg/m³) at forward horizons $h \in [1, 48]$
- **Trained At**: 2026-11-12T13:27:55.631032
- **Training Samples**: 110592 pooled samples across 8 Indian cities (Delhi, Gurugram, Lucknow, Chandigarh, Patna, Kolkata, Mumbai, Bengaluru)

---

## 2. Benchmark Evaluation on Held-Out Test Period (Oct 20 – Nov 14, 2026)

### 2.1 Overall Performance (1 to 48 Hours)

| Metric | BreatheWise Model | Persistence Baseline | 24h Seasonal-Naive | Improvement vs Best Baseline |
|---|---|---|---|---|
| **MAE (µg/m³)** | **17.17** | 26.36 | 18.69 | **+8.1%** |
| **RMSE (µg/m³)** | **24.28** | 36.43 | 26.49 | — |
| **Bias (µg/m³)** | **-4.26** | -1.53 | -1.33 | — |
| **CPCB Category Accuracy** | **58.4%** | 45.3% | 56.1% | — |
| **Within $\pm 1$ Category** | **94.3%** | 83.8% | 92.8% | — |
| **Empirical Interval Coverage** | **77.3%** | N/A | N/A | (Target: ~80%) |

### 2.2 Performance by Horizon Bucket

| Horizon Bucket | Model MAE | Persistence MAE | Seasonal-Naive MAE | Beats Both Baselines? | Model Category Acc | Interval Coverage |
|---|---|---|---|---|---|---|
| **1 to 6 hours** | **13.78** | 14.92 | 18.26 | **YES** | 64.9% | 79.5% |
| **7 to 24 hours** | **17.09** | 25.97 | 18.32 | **YES** | 58.5% | 77.7% |
| **25 to 48 hours** | **18.02** | 29.34 | 19.06 | **YES** | 56.8% | 76.5% |

---

## 3. Features & Data Leakage Prevention
- **Origin Features (strictly $\le t$)**: Ambient PM2.5, lags ($t-1, t-2, t-3, t-6, t-12, t-24, t-48$), 6h/24h rolling means, 24h rolling max, PM10, $NO_2$, $CO$, $O_3$, $SO_2$, PM2.5/PM10 ratio.
- **Future Target Features ($t+h$)**: Numerical weather forecast (wind speed, wind directional sin/cos, temperature, relative humidity, surface pressure, boundary layer height) and cyclical calendar angles.
- **Automated Verification**: Passes automated unit test `test_features_leakage.py` guaranteeing zero future data pollution.

---

## 4. Uncertainty Intervals
Residual quantiles calibrated on validation block:
- **1 to 6h**: [-19.8, +23.3] µg/m³
- **7 to 24h**: [-23.6, +27.5] µg/m³
- **25 to 48h**: [-23.4, +28.3] µg/m³

---

## 5. Limitations & Ethical Disclosures
1. **Modelled Reanalysis Ground Truth**: Ground truth originates from CAMS global numerical atmospheric models rather than raw physical CAAQMS stations.
2. **Seasonal Distributional Shift**: Winter pollution incurs sharp non-linear spikes due to shallow boundary layers and crop residue burning. The model accounts for this via explicit boundary layer height and seasonal flags, but sudden localized fire events may be underestimated.
