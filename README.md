# BreatheWise — Personal Air-Quality Exposure Planner

BreatheWise transforms air quality forecasts into personalized, actionable daily schedules. Instead of a passive "AQI 340" reading, BreatheWise answers: **When should I exercise, commute, ventilate my home, or let my kids play outside to minimize inhaled PM2.5?**

---

## Key Features

1. **Personalized Activity Optimization**: Finds the cleanest window for 4 key daily activities across 6 health vulnerability profiles.
2. **Quantified Exposure Avoidance**: Directly calculates the reduction in inhaled particulate dose vs your customary schedule.
3. **48-Hour ML Forecast with Uncertainty Bands**: Machine learning gradient-boosted forecasting trained on historical air quality and meteorological dispersion parameters, backed by p10–p90 confidence intervals.
4. **Empirical 30-Day Proof**: Walk-forward backtesting across major Indian cities measuring real-world exposure reduction and model performance against persistent and seasonal baselines.
5. **Resilient Offline Architecture**: 30-minute disk cache fallback ensuring instant offline functionality if upstream APIs fail.

---

## Quickstart

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 1. Setup Environment
```bash
make setup
```

### 2. Fetch Historical Data & Train ML Model
```bash
make data
make train
make backtest
```

### 3. Run Automated Tests
```bash
make test
```

### 4. Launch Service Locally
```bash
# Terminal 1: Backend API & Static Hosting
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000

# Optional: Frontend Hot-Reload Development Server
cd frontend && npm run dev
```
Open [http://localhost:8000](http://localhost:8000) to view the integrated BreatheWise application.

### 5. Build Single-Service Docker Container
```bash
docker build -t breathewise .
docker run -p 8000:8000 -e PORT=8000 breathewise
```

### 6. Export Presentation Slide Deliverables
```bash
python scripts/export_slide_assets.py
```
Exports `slide_numbers.json`, 4 high-res charts, and `demo_script.md` into `artifacts/slides/`.

---

## Technical Architecture

```
Browser (React SPA + Tailwind CSS + Recharts + TanStack Query)
      │  HTTPS / JSON
      ▼
FastAPI Backend
      ├──► Open-Meteo Air Quality & Weather APIs (Live)
      ├──► Persistent Disk Cache (TTL 30m + Offline Fallback)
      ├──► Gradient-Boosted PM2.5 Forecasting Model
      └──► Physiological Recommendation Engine
```

---

## Scientific & Health Disclaimer
BreatheWise uses numerical atmospheric dispersion models provided by the Copernicus Atmosphere Monitoring Service (CAMS) via Open-Meteo. It provides general exposure mitigation guidance and does not provide clinical or medical advice.

