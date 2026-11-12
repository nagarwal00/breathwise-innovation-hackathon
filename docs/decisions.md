# Architecture Decisions & API Verification Log — BreatheWise

## 1. External API Verification (Phase 0 Live Recon — 12 Nov 2026)

### 1.1 Open-Meteo Air Quality API
- **Endpoint**: `https://air-quality-api.open-meteo.com/v1/air-quality`
- **Verified Parameters**:
  - `latitude`, `longitude` (float)
  - `hourly=pm2_5,pm10,nitrogen_dioxide,ozone,carbon_monoxide,sulphur_dioxide`
  - `past_days=92`, `forecast_days=3`
  - `timezone=Asia/Kolkata`
- **Live Output Findings**:
  - Returned 2,280 continuous hourly timestamps for Delhi (`2026-08-12T00:00` to `2026-11-14T23:00`).
  - **Null Rate**: Exactly 0 nulls across all queried pollutant series (`pm2_5`, `pm10`, `nitrogen_dioxide`, `ozone`, `carbon_monoxide`, `sulphur_dioxide`).
  - Units: µg/m³ for particulate matter and gases (CO in µg/m³).
  - Historical query support: Queried historical intervals via `start_date` and `end_date` (e.g. `2024-01-01` to `2024-03-01`); returned 1,464 non-null hourly rows seamlessly without API keys.
- **Decision**: Primary source for historical training and live air quality forecasting.

### 1.2 Open-Meteo Weather Forecast & Archive API
- **Endpoint 1 (Live Forecast + Recent History)**: `https://api.open-meteo.com/v1/forecast`
  - Parameters: `hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,precipitation,surface_pressure,boundary_layer_height`
  - **Findings**:
    - `boundary_layer_height` is fully supported and returned valid numeric estimates (min: 10m, max: 2,505m).
    - When requesting `past_days=92`, older days (>60 days) in the standard forecast API return `null` (701 nulls out of 2,280).
    - `past_days <= 60` returns **0 nulls** across all weather variables.
- **Endpoint 2 (Historical Weather Archive)**: `https://archive-api.open-meteo.com/v1/archive`
  - Parameters: `hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,precipitation,surface_pressure&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`
  - **Findings**: 0 nulls across all historical dates.
- **Decision**:
  - For long-term historical training data (>60 days prior), pull historical weather from `archive-api.open-meteo.com/v1/archive`.
  - For live serving (recent 48h history + 48h future weather forecast), use `api.open-meteo.com/v1/forecast` with `past_days=7&forecast_days=3`.

### 1.3 Open-Meteo Geocoding API
- **Endpoint**: `https://geocoding-api.open-meteo.com/v1/search?name={query}&count=8&language=en&format=json`
- **Findings**:
  - Returned top 8 structured geographic records with name, latitude, longitude, admin1 (state), country, elevation, and population.
  - Latency < 300 ms, zero rate-limit blocks detected under standard usage.
- **Decision**: Proxy geocoding requests through `/api/geocode` with in-memory caching.

---

## 2. Technical Stack & Tooling Decisions

- **Python Runtime**: Python 3.13.5 (fully compatible with FastAPI, scikit-learn, LightGBM / HistGradientBoostingRegressor, httpx, pandas, pydantic v2).
- **Package Management**: `uv` / `pip` for lightning-fast backend virtual environment and dependency resolution.
- **Node/NPM Runtime**: Node v24.14.0 with `npm.cmd` on Windows (bypassing PowerShell execution policy restrictions cleanly).
- **Frontend Framework**: React 19 / Vite with strict TypeScript, Tailwind CSS, Recharts for data visualization, and TanStack Query.
- **Unified Service Architecture**: FastAPI serves both REST API endpoints (`/api/*`) and production static React build files (`frontend/dist`), eliminating CORS friction in Docker and single-instance deployments.

