# BreatheWise REST API Specification

Base URL: `/api`

All timestamps use ISO 8601 formatting with Asia/Kolkata timezone offset (`+05:30`).

---

## 1. Endpoints Overview

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Service health, model status, cache health |
| `GET` | `/api/cities` | List of preset Indian cities with coordinates |
| `GET` | `/api/geocode?q={query}` | Geocoding place search proxy with local caching |
| `GET` | `/api/current?lat={lat}&lon={lon}&profile={profile}` | Current PM2.5, category, 3h trend, and quick profile verdict |
| `GET` | `/api/forecast?lat={lat}&lon={lon}&hours=48` | 48-hour hourly p10/p50/p90 forecast and CPCB categories |
| `POST` | `/api/plan` | Core planning engine: optimal windows, avoid periods, dose avoided, advice |
| `GET` | `/api/backtest?city={city}` | Historical 30-day proof and baseline evaluation metrics |
| `GET` | `/api/methodology` | Static methodology, assumptions, and scientific references |

---

## 2. Request & Response Schemas

### 2.1 `POST /api/plan`
**Request Body**:
```json
{
  "lat": 28.6139,
  "lon": 77.2090,
  "profile": "healthy_adult",
  "activity": "exercise",
  "duration_min": 60,
  "allowed_start": "05:00",
  "allowed_end": "21:00",
  "usual_start": "07:00",
  "language": "en"
}
```

**Response Body (200 OK)**:
```json
{
  "generated_at": "2026-11-12T08:15:00+05:30",
  "data_status": {
    "source": "live",
    "cached_at": null
  },
  "location": {
    "name": "Delhi",
    "lat": 28.6139,
    "lon": 77.2090
  },
  "best_windows": [
    {
      "start": "2026-11-12T14:00:00+05:30",
      "end": "2026-11-12T15:00:00+05:30",
      "mean_pm25": 118.4,
      "category": "poor",
      "verdict": "caution"
    }
  ],
  "avoid_windows": [
    {
      "start": "2026-11-12T06:00:00+05:30",
      "end": "2026-11-12T10:00:00+05:30",
      "mean_pm25": 242.0,
      "category": "very_poor"
    }
  ],
  "usual_window": {
    "start": "2026-11-12T07:00:00+05:30",
    "mean_pm25": 231.0
  },
  "exposure": {
    "usual_dose": 231.0,
    "recommended_dose": 118.4,
    "avoided_pct": 48.7,
    "method": "mean_pm25 x ventilation_rate x duration"
  },
  "verdict": "caution",
  "advice": "Skip your 7 AM run. The cleanest window today is 2 to 3 PM. Air will still be poor, so keep the pace light or consider an N95-type mask.",
  "mask_recommended": true,
  "indoor_alternative": false,
  "disclaimer": "General guidance, not medical advice."
}
```

### 2.2 Error Format
```json
{
  "error": "Validation error message",
  "field": "duration_min"
}
```
All errors return typed HTTP status codes (400 for input validation, 404 for missing resources, 503 for upstream failure without cache).

