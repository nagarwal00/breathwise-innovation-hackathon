# BreatheWise Scientific & Algorithmic Methodology

## 1. Overview
BreatheWise transforms complex atmospheric chemistry data into actionable, personalised daily decisions. Instead of merely reporting ambient PM2.5 or CPCB Air Quality Index numbers, BreatheWise computes the optimum timing window for outdoor activities (exercise, commuting, children's play, home ventilation) and quantifies the estimated reduction in inhaled particulate dose.

---

## 2. Data Sources & Limitations

### 2.1 Atmospheric Data (CAMS Model via Open-Meteo)
- **Source**: Open-Meteo Air Quality API powered by the Copernicus Atmosphere Monitoring Service (CAMS).
- **Temporal Resolution**: Hourly predictions and historical archives.
- **Parameters**: PM2.5, PM10, Nitrogen Dioxide ($NO_2$), Ozone ($O_3$), Carbon Monoxide ($CO$), Sulphur Dioxide ($SO_2$).
- **Spatial Resolution**: Global ~0.4° grid (approx. 40 km resolution) with regional downscaling.
- **Limitation (Explicit Disclosure)**: CAMS data is numerical weather/atmospheric chemistry model reanalysis, **not** an in-situ ground sensor reading from a continuous ambient air quality monitoring station (CAAQMS). Highly localized micro-environments (e.g. roadside traffic canyons, construction sites, industrial clusters) may experience higher concentrations than regional model averages.

### 2.2 Meteorological Data (Open-Meteo Forecast & Archive)
- **Source**: ECMWF IFS / Open-Meteo Numerical Weather Models.
- **Parameters**: 2m Temperature, Relative Humidity, 10m Wind Speed, 10m Wind Direction, Precipitation, Surface Pressure, Planetary Boundary Layer Height (PBLH).
- **Physical Role**: Wind dispersion and boundary layer height are critical drivers of urban aerosol dilution. Low nocturnal boundary layers trap emissions near the ground, producing extreme morning peaks across northern Indian cities.

---

## 3. Exposure Modeling & Inhaled Dose Formulation

### 3.1 Inhaled Dose Equation
Estimated particulate inhalation dose ($D$) over a continuous activity window of duration $T$ hours starting at hour $t_0$ is modeled as:
$$D = \int_{t_0}^{t_0 + T} C(t) \cdot V_E \, dt \approx \left( \frac{1}{T} \sum_{i=0}^{T-1} C(t_0 + i) \right) \cdot V_E \cdot T$$

Where:
- $C(t)$ is the hourly ambient PM2.5 concentration ($\mu\text{g/m}^3$).
- $V_E$ is the minute ventilation rate converted to hourly volume ($\text{m}^3/\text{h}$).
- $T$ is the activity duration in hours.

### 3.2 Activity Ventilation Rates ($V_E$)
Based on human respiratory physiology literature (illustrative engineering assumptions for an adult):
- **Exercise (Vigorous Running / Cycling)**: $3.0\ \text{m}^3/\text{h}$ (~$50\ \text{L/min}$).
- **Commute (Light walking / transit)**: $1.5\ \text{m}^3/\text{h}$ (~$25\ \text{L/min}$).
- **Kids' Outdoor Play**: $2.0\ \text{m}^3/\text{h}$ (incorporating higher breathing frequency per body surface area).
- **Ventilate Home**: Concentration-only comparison ($\mu\text{g/m}^3$ differential across window opening period; no personal inhalation dose).

### 3.3 Exposure Avoided Metric
Comparing user's customary baseline routine ($D_{\text{usual}}$) with the BreatheWise optimal recommendation ($D_{\text{rec}}$):
$$\text{Exposure Avoided (\%)} = \max\left(0, \frac{D_{\text{usual}} - D_{\text{rec}}}{D_{\text{usual}}} \times 100\%\right)$$
If the user's habitual window is already the cleanest window in the permissible span, the metric reports $0.0\%$, accompanied by positive reinforcement ("Your routine is already optimal").

---

## 4. Personalised Thresholds & Verdict Logic

### 4.1 Base PM2.5 Thresholds ($\mu\text{g/m}^3$)
Derived from National Ambient Air Quality Standards (NAAQS) and CPCB breakpoints:
- `exercise_ok`: $60\ \mu\text{g/m}^3$ (Satisfactory boundary)
- `light_ok`: $90\ \mu\text{g/m}^3$ (Moderate boundary)
- `windows_open_ok`: $60\ \mu\text{g/m}^3$
- `mask_advised`: $120\ \mu\text{g/m}^3$ (Poor boundary)
- `avoid`: $250\ \mu\text{g/m}^3$ (Very Poor / Severe boundary)

### 4.2 Sensitivity Scaling Factors
$$\text{Threshold}_{\text{effective}} = \text{Threshold}_{\text{base}} \times \text{Factor}_{\text{profile}}$$
- **Healthy Adult**: $1.0$
- **Outdoor Worker**: $1.0$ (adjusted via shift duration limits & mandatory rest intervals)
- **Pregnant**: $0.75$
- **Child**: $0.75$
- **Elderly**: $0.75$
- **Respiratory / Cardiac**: $0.50$

### 4.3 Risk-Adjusted Concentration ($m_{\text{adj}}$)
To penalise uncertain forecast horizons and protect vulnerable populations:
$$m_{\text{adj}} = \bar{p}_{50} + 0.5 \times (\bar{p}_{90} - \bar{p}_{50})$$
Verdicts:
- `go`: $m_{\text{adj}} \le \text{ok\_threshold}$
- `caution`: $\text{ok\_threshold} < m_{\text{adj}} \le \text{mask\_advised}$
- `mask`: $\text{mask\_advised} < m_{\text{adj}} \le \text{avoid}$
- `avoid`: $m_{\text{adj}} > \text{avoid}$ (Triggers indoor alternative recommendation)

---

## 5. Machine Learning Forecasting Architecture

- **Target**: Hourly PM2.5 ($\mu\text{g/m}^3$) at horizon $t + h$, $h \in [1, 48]$.
- **Target Transformation**: $\ln(1 + \text{PM2.5})$ to stabilize exponential peaks and ensure strictly non-negative predictions upon back-transformation $\exp(\hat{y}) - 1$.
- **Model Family**: Gradient-boosted decision trees (`HistGradientBoostingRegressor` / `LightGBM`) with horizon $h$ passed as an explicit structural feature.
- **Leakage Prevention**: Strictly time-ordered walk-forward feature engineering. Origin features at time $t$ access only historical lags ($\le t$). Target weather features use forecast projections.
- **Uncertainty Quantification**: Empirical residual quantiles ($p_{10}, p_{90}$) stratified by horizon buckets (1–6h, 7–24h, 25–48h) computed on an independent validation set.
- **Baselines**:
  1. *Persistence*: $\hat{y}_{t+h} = y_t$
  2. *24h Seasonal-Naive*: $\hat{y}_{t+h} = y_{t+h-24}$

---

## 6. Regulatory & Health Disclaimer
BreatheWise provides environmental analytics and exposure minimization guidance based on publicly available numerical atmospheric models. **It does not provide medical diagnosis, treatment, or clinical advice.** Users experiencing respiratory distress or cardiovascular symptoms should seek immediate medical attention.

