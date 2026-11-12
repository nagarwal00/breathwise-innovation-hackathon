# PROJECT BRIEF: BreatheWise, a Personal Air-Quality Exposure Planner

> Save this file in the repository root as `PROJECT_BRIEF.md`. It is the single source of truth for the build. Read it fully before writing any code.

---

## 0. Read This First

You are acting as a **senior software engineer and applied ML engineer** who owns this project end to end. You are not a code generator waiting for line-by-line instructions. You plan, decide, verify, build, test, and report.

You are building a hackathon prototype for a **time-boxed online competition**. The prototype will be judged on four criteria:

| Criterion | What it means for this build |
|---|---|
| Problem relevance | A daily, health-linked problem that every urban Indian user recognises |
| Originality | Turn "AQI is a number" into "here is your personal schedule, with measured exposure avoided" |
| Functionality | A live, deployed, working app that returns fresh answers for any location |
| Practical usefulness | Output is a concrete action (when to exercise, commute, ventilate), not a chart |

**Hard deadline:** Round 1 submission closes **Saturday 14 Nov 2026, 2:52 PM IST**. The finale (live online presentation and demo) is on **21 Nov 2026**. Today is **Thursday 12 Nov 2026**. Plan to be submission-ready by **14 Nov, 12:00 PM IST**, which leaves buffer.

Priorities, in order: **(1) it works end to end, (2) the numbers are honest and traceable, (3) it is clear and polished, (4) extras.** Never trade 1 to 3 for 4.

---

## 1. Product Definition

### 1.1 Problem
People see "AQI 340" but have no idea what to do. Should they jog, commute now or later, open the windows, or let the kids play outside? Existing apps show the current number. They do not turn the forecast into a personalised decision, and they do not quantify the benefit.

### 1.2 Solution
BreatheWise takes a location and a user profile and returns:
1. The current air quality, in plain language, for that profile.
2. A 48-hour PM2.5 forecast with an uncertainty band.
3. For a chosen activity (exercise, commute, ventilate home, kids' outdoor play): the **best window**, the **windows to avoid**, and a plain-language instruction.
4. The **exposure avoided** by following the advice versus the user's usual routine.
5. A **Proof page** showing how the planner performed on the past 30 days (forecast error and exposure reduction), so the claim is evidence-backed.

### 1.3 Users (profiles)
`healthy_adult`, `child`, `elderly`, `respiratory_cardiac` (asthma, COPD, heart conditions), `pregnant`, `outdoor_worker`.

### 1.4 Success criteria (definition of "done")
- [ ] A public URL where a judge can pick any location, choose a profile, and get a plan in under 3 seconds (warm cache) or 8 seconds (cold).
- [ ] Works for at least 8 preset Indian cities **and** any location found through geocoding search.
- [ ] Forecast model beats both baselines (persistence and 24h-seasonal-naive) on a held-out time period, **or** the final report states honestly that it does not and the planner uses the better method.
- [ ] A reproducible backtest produces `artifacts/backtest_results.json` with exposure-reduction figures for at least 3 cities.
- [ ] Graceful offline fallback: if the live API fails, the app serves cached data and shows a clear "using cached data from <time>" banner.
- [ ] Core logic has automated tests, and they pass.
- [ ] `artifacts/slide_numbers.json` exists and feeds the presentation (see Section 14).

---

## 2. Operating Principles (how a senior engineer works)

1. **Plan before coding.** Produce an implementation plan and a task list for each phase. Do not start a phase until its plan exists.
2. **Verify, do not assume.** You must test every external API call live before building on it. Parameter names, units, date ranges, and rate limits in this brief are my best understanding and **may be wrong or outdated**. The live API response and official documentation overrule this document. When they differ, follow the API and record the difference in `docs/decisions.md`.
3. **Never fabricate results.** Every number shown in the UI or exported for slides must trace to a computed artifact. If a metric turns out poor, report it honestly and iterate. Do not hard-code, cherry-pick, or tune on the test period.
4. **Prevent data leakage.** Features for a forecast issued at time `t` may use only data available at or before `t` (plus weather forecasts for future hours, never weather actuals, at serving time). Write a test for this.
5. **Small, verifiable steps.** Commit after every working unit with a clear message (`feat:`, `fix:`, `test:`, `docs:`, `chore:`). Run tests before every commit.
6. **Config over constants.** Thresholds, profile factors, city lists, and API URLs live in config files, never scattered in code.
7. **Readable code.** Type hints everywhere in Python, strict TypeScript on the frontend, docstrings on public functions, one responsibility per module, and no clever one-liners where clear code is possible.
8. **Fail gracefully.** Timeouts, retries with backoff, input validation, typed error responses, structured logs, and a cache fallback. The app must never show a raw stack trace.
9. **Decide, log, move on.** If something is ambiguous, choose the sensible option, write one line in `docs/decisions.md` (decision, reason, alternative rejected), and continue. Stop and ask me only if you are blocked or a decision would change scope or timeline.
10. **Respect the time box.** If a task is taking more than 1.5x its estimate, cut scope using the "Should/Could" lists in Section 3, and tell me.
11. **Health content is guidance, not medical advice.** Keep thresholds conservative and always show the disclaimer.

### Reporting format (after every phase)
Post a short report with: **Done** (what exists), **Evidence** (test output, screenshots, sample responses), **Decisions** (what you chose and why), **Risks** (what could break), **Next** (the next phase and its first three tasks). Wait for my approval only at the gates marked **GATE** in Section 13. Otherwise continue.

---

## 3. Scope: How Much Is Enough

### MUST (the prototype is not acceptable without these)
- Data pipeline from Open-Meteo (air quality and weather) with caching.
- Forecast model for PM2.5, 1 to 48 hours ahead, plus two baselines, with a time-based evaluation.
- Recommendation engine: 6 profiles, 4 activities, window finder, verdicts, exposure comparison, plain-language advice.
- Backtest producing exposure-reduction numbers across at least 3 cities.
- REST API (FastAPI) with the endpoints in Section 7.
- Web frontend with the four screens in Section 10 (Plan, Forecast, Proof, About).
- Deployment to one public URL.
- Offline cache fallback.
- Tests for core logic and a README with run instructions.

### SHOULD (do these if Phase 5 finishes ahead of schedule)
- Shareable plan link (query parameters) and a "copy summary" button for WhatsApp-style text.
- Hindi and English toggle for advice text.
- Printable or screenshot-friendly summary card.
- Compare "your usual time" against "recommended time" with a draggable time input.

### COULD (only after everything above is polished)
- Ground-truth sanity check with OpenAQ station data for one city (needs an API key and may be rate-limited).
- Map view of preset cities.
- Multi-day weekly planner.

### WON'T (do not build these)
User accounts, databases, push notifications, native mobile apps, payments, scraping of private sources, any model larger than gradient boosting, or any medical diagnosis feature.

---

## 4. Data Sources

All primary sources are free and need **no API key**.

### 4.1 Air quality: Open-Meteo Air Quality API
```
GET https://air-quality-api.open-meteo.com/v1/air-quality
  ?latitude={lat}&longitude={lon}
  &hourly=pm2_5,pm10,nitrogen_dioxide,ozone,carbon_monoxide,sulphur_dioxide
  &past_days=92&forecast_days=3
  &timezone=Asia/Kolkata
```
- Also test `start_date` and `end_date` parameters to see **how far back** hourly history is available. Longer history is better for training. Record what you find.
- Data is **model-based (CAMS)**, not a ground sensor reading, at coarse resolution. Urban hotspots can read higher in reality. State this clearly in the UI ("About") and in the methodology document. This is a known limitation, not something to hide.

### 4.2 Weather: Open-Meteo Forecast and Archive APIs
```
GET https://api.open-meteo.com/v1/forecast
  ?latitude={lat}&longitude={lon}
  &hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,
          precipitation,surface_pressure,boundary_layer_height
  &past_days=92&forecast_days=3&timezone=Asia/Kolkata

GET https://archive-api.open-meteo.com/v1/archive   (historical actuals, if needed)
```
- If `boundary_layer_height` is unavailable, drop it and log the decision.
- Weather is a feature because wind, rain, and boundary-layer height strongly drive pollutant dispersion.

### 4.3 Geocoding: Open-Meteo Geocoding API
```
GET https://geocoding-api.open-meteo.com/v1/search?name={query}&count=8&language=en&format=json
```

### 4.4 Preset cities (lat, lon)
Delhi (28.6139, 77.2090), Gurugram (28.4595, 77.0266), Lucknow (26.8467, 80.9462), Chandigarh (30.7333, 76.7794), Patna (25.5941, 85.1376), Kolkata (22.5726, 88.3639), Mumbai (19.0760, 72.8777), Bengaluru (12.9716, 77.5946). Store them in `config/cities.yaml`.

### 4.5 Reference standard for categories
Use the Indian CPCB PM2.5 categories (24-hour average breakpoints in µg/m³) for labels and colours: Good 0 to 30, Satisfactory 31 to 60, Moderate 61 to 90, Poor 91 to 120, Very Poor 121 to 250, Severe 251+. Apply them to hourly values as an approximation, and say so in the methodology. Also show the WHO 2021 24-hour guideline (15 µg/m³) as a reference line on charts. **Verify these figures against the official sources and fix any mistake.**

### 4.6 Data hygiene tasks
- Handle `null` values (interpolate short gaps, drop long gaps, log counts).
- Force a single timezone (`Asia/Kolkata`) and test that timestamps align between air-quality and weather frames.
- Cache raw responses to `data/raw/` (with timestamp) and processed frames to `data/processed/`.

---

## 5. Architecture and Stack

```
Browser (React SPA)
      │  HTTPS / JSON
      ▼
FastAPI service ──► Open-Meteo APIs (live)
      │                     ▲
      ├──► Cache (disk, TTL) ┘   ◄── offline fallback
      ├──► Forecast model (joblib artifact)
      └──► Recommendation engine (pure Python, unit-tested)
```

**Stack (do not change without logging a decision):**
- **Backend:** Python 3.11+, FastAPI, Uvicorn, Pydantic v2, httpx, pandas, numpy, scikit-learn, LightGBM (fallback: scikit-learn `HistGradientBoostingRegressor`), joblib, pytest, ruff.
- **Frontend:** React + Vite + TypeScript (strict), Tailwind CSS, Recharts, TanStack Query.
- **Deployment:** a **single service**. FastAPI serves the built frontend as static files, so there is one URL and no CORS problems. Suggested hosts: Render, Railway, or Fly.io free or low tiers. Choose one, document it, and include a `Dockerfile`.
- **Why not a bigger model or database?** Not needed. Simple, explainable, reproducible, and fast to train on a laptop.

### Repository layout
```
breathewise/
├─ PROJECT_BRIEF.md
├─ README.md
├─ Dockerfile
├─ Makefile                    # make setup | data | train | backtest | test | run | build
├─ config/
│   ├─ cities.yaml
│   ├─ profiles.yaml           # thresholds and profile factors
│   └─ activities.yaml         # durations, ventilation rates, default usual times
├─ backend/
│   ├─ app/
│   │   ├─ main.py
│   │   ├─ config.py
│   │   ├─ schemas.py          # Pydantic request/response models
│   │   ├─ clients/open_meteo.py
│   │   ├─ data/               # loaders, cache, cleaning
│   │   ├─ features.py         # leakage-safe feature builder
│   │   ├─ model/              # train.py, predict.py, intervals.py, baselines.py
│   │   ├─ recs/               # profiles.py, windows.py, exposure.py, advice.py
│   │   └─ routers/
│   └─ tests/
├─ scripts/
│   ├─ fetch_history.py
│   ├─ train_model.py
│   ├─ run_backtest.py
│   └─ export_slide_assets.py
├─ data/{raw,cache,processed}/
├─ artifacts/                  # model.joblib, metrics.json, backtest_results.json, slide_numbers.json
├─ frontend/
│   └─ src/{components,pages,api,hooks,lib,i18n}/
└─ docs/{decisions.md, api.md, METHODOLOGY.md}
```

---

## 6. Forecast Model Specification

**Target:** PM2.5 (µg/m³) at hour `t + h`, for `h = 1 … 48`.

**Approach:** a single gradient-boosting model with `horizon_h` as a feature, trained on stacked samples (forecast origin `t`, target `t + h`). Train on `log1p(PM2.5)` and invert after prediction. Pooling several cities into one model is allowed and encouraged (it gives more data and more weather regimes). Add city coordinates or a city id only if it helps on validation.

**Features (all leakage-safe):**
- PM2.5 at origin and lags: 1, 2, 3, 6, 12, 24, 48 hours; rolling mean (6h, 24h) and rolling max (24h).
- PM10, NO2, CO, ozone at origin (and PM2.5/PM10 ratio).
- Weather at the **target hour**: wind speed, wind direction (sin/cos), temperature, humidity, precipitation, pressure, boundary-layer height. In training, use archived values. At serving time, use the **weather forecast** for those hours. Note this train/serve mismatch in the methodology.
- Calendar: target hour (sin/cos), day of week, month, horizon.
- Optional: Diwali or stubble-burning season flag. Skip it unless time is plentiful.

**Baselines (mandatory):**
1. **Persistence:** PM2.5 at origin held constant.
2. **Seasonal-naive:** PM2.5 at the same hour yesterday.

**Evaluation:**
- **Time-based split only.** Never random. Train on earlier data, validate on the next block, test on the most recent ~30 days. Report which dates each block covers.
- Metrics: MAE, RMSE, and bias per horizon bucket (1 to 6 h, 7 to 24 h, 25 to 48 h); category accuracy (predicted CPCB category equals actual) and within-one-category accuracy.
- Report the model against both baselines in a table. Save to `artifacts/metrics.json`.
- Seasonal shift is a real risk: autumn to winter pollution rises sharply. Check that test-period behaviour is not simply extrapolation, and describe any limitation honestly.

**Uncertainty bands:** compute residual quantiles (p10 and p90) per horizon bucket on the validation block, and apply them to predictions. Report empirical coverage on the test block (target: roughly 80%). If coverage is poor, say so.

**Artifacts:** `artifacts/model.joblib`, `artifacts/model_card.md` (training window, features, metrics, limitations). Commit the artifact so that deployment does not depend on retraining.

---

## 7. Backend Specification

### 7.1 Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Status, model version, cache age |
| GET | `/api/cities` | Preset cities |
| GET | `/api/geocode?q=` | Place search (proxy to geocoding API) |
| GET | `/api/current?lat=&lon=&profile=` | Current PM2.5, category, trend, verdict |
| GET | `/api/forecast?lat=&lon=&hours=48` | Hourly p10/p50/p90 PM2.5 and categories |
| POST | `/api/plan` | Windows, avoid periods, advice, exposure comparison |
| GET | `/api/backtest?city=` | Backtest results from `artifacts/backtest_results.json` |
| GET | `/api/methodology` | Static methodology and limitations text |

### 7.2 `/api/plan` request and response (contract)
```json
// POST /api/plan
{
  "lat": 28.6139, "lon": 77.2090,
  "profile": "healthy_adult",
  "activity": "exercise",
  "duration_min": 60,
  "allowed_start": "05:00", "allowed_end": "21:00",
  "usual_start": "07:00",
  "language": "en"
}
```
```json
{
  "generated_at": "2026-11-12T08:15:00+05:30",
  "data_status": { "source": "live", "cached_at": null },
  "location": { "name": "New Delhi", "lat": 28.6139, "lon": 77.2090 },
  "best_windows": [
    { "start": "2026-11-12T14:00:00+05:30", "end": "2026-11-12T15:00:00+05:30",
      "mean_pm25": 118.4, "category": "poor", "verdict": "caution" }
  ],
  "avoid_windows": [
    { "start": "2026-11-12T06:00:00+05:30", "end": "2026-11-12T10:00:00+05:30",
      "mean_pm25": 242.0, "category": "very_poor" }
  ],
  "usual_window": { "start": "2026-11-12T07:00:00+05:30", "mean_pm25": 231.0 },
  "exposure": {
    "usual_dose": 231.0, "recommended_dose": 118.4,
    "avoided_pct": 48.7, "method": "mean_pm25 x ventilation_rate x duration"
  },
  "verdict": "caution",
  "advice": "Skip your 7 AM run. The cleanest window today is 2 to 3 PM. Air will still be poor, so keep the pace light or consider an N95-type mask.",
  "mask_recommended": true,
  "indoor_alternative": false,
  "disclaimer": "General guidance, not medical advice."
}
```
All timestamps are ISO 8601 with the `+05:30` offset. Validate inputs (lat in [-90, 90], lon in [-180, 180], known profile and activity, `allowed_start < allowed_end`, `duration_min` in [15, 180]) and return typed errors (`400` with `{ "error": "...", "field": "..." }`).

### 7.3 Caching
- TTL cache on live API calls: **30 minutes** (round coordinates to 2 decimals for the cache key).
- Persist the last successful response per location to disk. If the live call fails after 2 retries, serve the cached response with `data_status.source = "cache"` and `cached_at`.
- Ship pre-fetched cache files for the 8 preset cities in `data/cache/` so the demo works even if the network is down.

### 7.4 Non-functional
- Request timeout 8 seconds to upstream; global rate limit (simple in-memory, e.g. 60 requests/min/IP).
- Structured JSON logs, request IDs, and no logging of precise user location beyond what is needed for debugging (round to 2 decimals).
- No API keys in the repository. Use environment variables with a `.env.example`.

---

## 8. Recommendation Engine Specification

### 8.1 Threshold model (config-driven, in `config/profiles.yaml`)
Base PM2.5 thresholds (µg/m³), multiplied by a **profile sensitivity factor**:

| Base threshold | µg/m³ | Meaning |
|---|---|---|
| `exercise_ok` | 60 | Outdoor vigorous activity is fine below this |
| `light_ok` | 90 | Light outdoor activity or commute is fine below this |
| `windows_open_ok` | 60 | Opening windows is fine below this |
| `mask_advised` | 120 | An N95/FFP2-type mask is advised above this when outdoors |
| `avoid` | 250 | Avoid outdoor activity above this |

| Profile | Factor |
|---|---|
| `healthy_adult` | 1.0 |
| `outdoor_worker` | 1.0 (but long durations and a higher ventilation rate, see 8.3) |
| `pregnant` | 0.75 |
| `child` | 0.75 |
| `elderly` | 0.75 |
| `respiratory_cardiac` | 0.5 |

Effective threshold = base × factor. **These are conservative engineering defaults built from the CPCB categories, not clinical thresholds.** Put the rationale and a "verify before use" note in `docs/METHODOLOGY.md`.

### 8.2 Verdict logic
For a candidate window with mean PM2.5 `m` (use the risk-adjusted value `m_adj = mean(p50) + 0.5 × (mean(p90) − mean(p50))` so uncertain hours are penalised):
- `go`: `m_adj ≤ ok_threshold` for the activity
- `caution`: `ok_threshold < m_adj ≤ mask_advised`; suggest lighter intensity
- `mask`: `mask_advised < m_adj ≤ avoid`; suggest a well-fitted mask or a shorter duration
- `avoid`: `m_adj > avoid`; recommend an indoor alternative

If even the best window is `avoid`, say so plainly and return `indoor_alternative: true` with a short suggestion.

### 8.3 Activities (config-driven in `config/activities.yaml`)
| Activity | Default duration | Default usual start | Ventilation rate (m³/h, illustrative) | Threshold used |
|---|---|---|---|---|
| `exercise` | 60 min | 07:00 | 3.0 | `exercise_ok` |
| `commute` | 45 min | 09:00 (and 18:00 as a second leg) | 1.5 | `light_ok` |
| `kids_play` | 60 min | 16:30 | 2.0 | `exercise_ok` × child factor |
| `ventilate_home` | 30 min | 08:00 | n/a (not an inhalation dose; compare mean outdoor PM2.5 only) | `windows_open_ok` |

Ventilation rates are **assumptions**. List them as such in the methodology. For `outdoor_worker`, allow a custom long duration (up to 8 h), and recommend breaks or a mask rather than avoiding work.

### 8.4 Window finder (pure function, fully unit-tested)
1. Take the hourly forecast (p10/p50/p90) inside `[allowed_start, allowed_end]`.
2. For every possible start hour, compute the window's `m_adj` over the duration (round duration up to whole hours, minimum one hour).
3. Rank ascending. Return the **top 3 non-overlapping** windows as `best_windows`.
4. Find the **worst contiguous periods** (mean above the `avoid` threshold) as `avoid_windows`.
5. Compute the **usual window** (user's usual start and the same duration) the same way.
6. **Exposure avoided** = `(usual_dose − recommended_dose) / usual_dose`, where dose = mean PM2.5 × ventilation rate × duration. If the usual window is already the best, return 0 and say "your usual time is already a good choice". **Never return negative savings.**

### 8.5 Advice text
Template-based, plain language, at most two sentences plus an optional mask line. Keep templates in `i18n/en.json` and `i18n/hi.json`. No jargon such as "µg/m³" in the headline advice. Do not use alarmist wording. Always include the disclaimer.

---

## 9. Backtest ("Proof") Specification

Purpose: convert "this should help" into "this would have helped, measured on the last 30 days".

**Procedure (walk-forward, no peeking):**
1. For each city in at least {Delhi, Lucknow, Kolkata, Mumbai, Bengaluru}, take the final 30 days as the test period.
2. For each day `D`, simulate the user checking at 05:00 IST. Using only data available at that moment, run the planner for the profile `healthy_adult`, activity `exercise` (60 min), allowed range 05:00 to 21:00, usual start 07:00.
3. Look up the **actual** PM2.5 (the CAMS values recorded afterwards) for (a) the usual 07:00 window and (b) the window the planner recommended.
4. Compute: exposure reduction % per day, mean and median reduction, % of days improved, % of days the recommended window was `avoid` anyway, and an **oracle** (the best possible window in hindsight) to show the gap.
5. Repeat for `commute` and `child` as secondary rows if time allows.
6. Also report forecast MAE vs both baselines for the same period.

**Output:** `artifacts/backtest_results.json`
```json
{
  "generated_at": "...", "test_period": { "start": "...", "end": "..." },
  "cities": {
    "delhi": {
      "days": 30,
      "mean_exposure_reduction_pct": 0.0,
      "median_exposure_reduction_pct": 0.0,
      "pct_days_improved": 0.0,
      "oracle_mean_reduction_pct": 0.0,
      "mae": { "model": 0.0, "persistence": 0.0, "seasonal_naive": 0.0 }
    }
  },
  "assumptions": ["CAMS modelled PM2.5 used as ground truth", "ventilation rate 3.0 m3/h for exercise"]
}
```
The zeros above are placeholders only. Real values must come from the run. The UI **Proof** page and the slides read from this file. If results are weak in a clean-air city (for example Bengaluru, where there is little to avoid), say that plainly. It is a valid and honest finding.

---

## 10. Frontend Specification

### 10.1 Design principles
Clean, calm, trustworthy, health-adjacent. Mobile-first (most judges and users will open it on a phone), then desktop. Large type for the main verdict. Colour is never the only signal (add icons and text labels). WCAG AA contrast.

AQI category colours (adjust for contrast if needed): Good `#2E9E4F`, Satisfactory `#8BC34A`, Moderate `#F2C94C`, Poor `#F2994A`, Very Poor `#E5484D`, Severe `#8E1B2C`.

### 10.2 Screens

**Plan (home)**
- Location: search box (geocoding) plus preset city chips. Remember the last location in `localStorage`.
- Profile selector (6 profiles, short descriptions) and activity selector (4 activities).
- Optional controls: duration, allowed time range, usual time (sensible defaults, collapsed under "Customise").
- **Hero card:** current PM2.5, category, trend arrow (rising/falling over the next 3 hours), and a one-line verdict for the profile.
- **Plan card:** the best window (large), runner-up windows, the windows to avoid, the advice text, and the mask or indoor-alternative note.
- **Exposure-avoided widget:** "Your usual 7 AM run vs recommended 2 PM: X% less PM2.5 inhaled". Show the formula in a tooltip.
- Data status chip: "Live" or "Cached at HH:MM".

**Forecast**
- 48-hour chart (Recharts): p50 line, p10 to p90 shaded band, coloured background bands for CPCB categories, a WHO reference line, shaded best window, hatched avoid windows, and a "now" marker.
- Hover or tap tooltip with the hour, p50, range, and category.
- Toggle for PM10 or NO2 as context lines (optional).

**Proof**
- City selector. Cards for: mean exposure reduction, % of days improved, forecast MAE vs baselines (bar chart), and a 30-day chart (usual-window vs recommended-window PM2.5 per day).
- Test period dates, assumptions, and limitations visible, not hidden.

**About**
- How it works (3 steps), data sources and their limitations (modelled data, coarse resolution), the threshold table, the disclaimer, and the open-source/credits line.

### 10.3 States and quality
- Skeleton loaders (under 300 ms to first paint), friendly error states with a retry button, an empty state, and an offline/cached banner.
- Responsive from 360 px wide. Keyboard navigable. Semantic HTML and ARIA labels on charts (provide a text summary equivalent).
- No console errors. Lighthouse performance and accessibility ≥ 85 on mobile as a target.
- Shareable URL state (`?city=delhi&profile=child&activity=kids_play`).

---

## 11. Testing and Verification

**Backend unit tests (pytest):**
- Window finder: correct best window on hand-made series, ties, windows at range edges, durations longer than the range, all-bad-air case.
- Exposure: never negative; zero when the usual window is already best.
- Threshold logic per profile (parametrised).
- Feature builder: **no-leakage test** (changing future values must not change features at origin `t`).
- Schema contract tests for every endpoint.
- Upstream failure test (mock timeout, expect cached response with `data_status.source == "cache"`).

**Integration:** run the app, call each endpoint for the 8 preset cities, and assert response shape and plausible value ranges (PM2.5 between 0 and 1500).

**Frontend:** component tests for the verdict card and chart data mapping, plus a browser smoke test that you perform and record (screenshots): open the app, search a city, change profile, change activity, open Forecast and Proof, and confirm there are no console errors.

**Manual QA checklist** (complete before the freeze): a clean-air case (Bengaluru), a severe case (Delhi), a profile change flipping the verdict, an invalid location, offline mode, and a 360 px wide viewport.

---

## 12. Deployment

- `Dockerfile` that builds the frontend, installs backend dependencies, copies artifacts, and serves everything through Uvicorn on `$PORT`.
- A free-tier cold start can be slow. Add a lightweight warm-up call on the home page load and a `/api/health` endpoint, and state the cold-start behaviour in the README.
- Provide `README.md` with: what it does, a screenshot, quick start (`make setup && make data && make train && make backtest && make run`), the architecture sketch, the limitations, and the live URL.
- Verify the deployed URL end to end after every deploy. Record a **backup screen recording** of the full flow (60 to 90 seconds) in case the live demo fails during judging.

---

## 13. Workflow, Phases, and Gates

Work in order. Use your planning and task-list features in every phase. Report after each phase in the format from Section 2.

### Phase 0: Recon and setup (target: 45 min, Thu 12 Nov)
- Read this brief. Write an implementation plan and a task list for the whole project.
- **Test every API in Section 4 live.** Record real parameter names, units, date ranges, null rates, and rate-limit behaviour in `docs/decisions.md`. Fix any wrong assumption in this brief's examples.
- Scaffold the repository, tooling (ruff, pytest, pre-commit optional), `Makefile`, config files.
- **GATE 0:** show me the plan, the verified API notes, and any scope changes. Continue unless I object within the working session.

### Phase 1: Data layer (target: 1.5 h, Thu 12 Nov)
- Open-Meteo client with retries, timeouts, and the disk cache; geocoding client.
- Cleaning, timezone alignment, joining of air-quality and weather frames.
- Fetch history for the 8 cities (and as far back as the API allows). Save processed frames.
- Tests and a data-quality report (row counts, null rates, date ranges).

### Phase 2: Forecast model and evaluation (target: 3 h, Thu 12 Nov evening)
- Feature builder with the leakage test, baselines, the gradient-boosting model, time-based split, uncertainty bands.
- Produce `metrics.json` and `model_card.md`.
- **GATE 2:** show me the metrics table (model vs baselines, by horizon bucket) and the interval coverage. If the model does not beat the baselines, tell me before proceeding and propose the fix or fallback. Do not tune on the test block.

### Phase 3: Recommendation engine and API (target: 3 h, Fri 13 Nov morning)
- Config files, thresholds, window finder, exposure, advice templates.
- FastAPI endpoints, schemas, validation, caching, fallback, error handling.
- Full unit and integration test pass.

### Phase 4: Backtest (target: 1.5 h, Fri 13 Nov)
- `scripts/run_backtest.py` producing `backtest_results.json`, plus the 30-day comparison series for charts.
- **GATE 4:** show me the numbers per city and your honest interpretation, including weak cases. These feed the slides, so they need to be right.

### Phase 5: Frontend (target: 4 h, Fri 13 Nov)
- App shell, API client with typed contracts, Plan screen, Forecast chart, Proof page, About page, states, responsive pass, accessibility pass.
- Verify in a browser. Capture screenshots of every screen at mobile and desktop widths.

### Phase 6: Integration, deployment, and slide assets (target: 2 h, Fri 13 Nov night)
- Wire up everything, deploy to the public URL, run the full QA checklist against the deployed app.
- Run `scripts/export_slide_assets.py` (see Section 14).
- **GATE 6:** give me the public URL, the QA results, and the exported asset list.

### Phase 7: Polish and freeze (Sat 14 Nov, 08:00 to 11:00)
- Fix QA findings, tighten copy, final accessibility and performance pass, README and methodology review.
- **Feature freeze at 11:00 IST.** After the freeze, only fix bugs. No new features.
- Record the backup demo video. Confirm the deployed app one last time before I submit.

### Cut-scope rule
If any phase runs late, cut in this order: (1) Hindi toggle, (2) shareable summary, (3) secondary backtest rows, (4) PM10/NO2 chart overlays. Do **not** cut: the offline fallback, the backtest, the tests for the window finder, or the disclaimer.

---

## 14. Handoff to the Presentation

The slides must use numbers and visuals produced by the prototype, so that both always agree. Create `scripts/export_slide_assets.py`, which writes into `artifacts/slides/`:

1. `slide_numbers.json`, with these keys at minimum:
```json
{
  "headline": {
    "delhi_mean_exposure_reduction_pct": 0,
    "all_cities_mean_exposure_reduction_pct": 0,
    "pct_days_improved_delhi": 0,
    "test_period": "YYYY-MM-DD to YYYY-MM-DD"
  },
  "model": {
    "mae_model": 0, "mae_persistence": 0, "mae_seasonal_naive": 0,
    "mae_improvement_vs_best_baseline_pct": 0,
    "interval_coverage_pct": 0,
    "training_hours": 0, "cities_in_training": 0
  },
  "product": {
    "profiles": 6, "activities": 4, "preset_cities": 8, "api_endpoints": 8
  },
  "data": {
    "sources": ["Open-Meteo Air Quality (CAMS)", "Open-Meteo Weather"],
    "needs_api_key": false
  }
}
```
All values must be computed from artifacts, never typed in by hand.

2. Chart images (PNG, 2x resolution, transparent or white background, consistent fonts and the AQI colour palette): `forecast_band.png` (48 h forecast with the best and avoid windows), `exposure_comparison.png` (usual vs recommended, per day), `model_vs_baselines.png` (MAE bars), `thirty_day_reduction.png`.
3. Screenshots (mobile 390 px wide and desktop 1440 px wide): Plan screen (Delhi, healthy adult, exercise), Plan screen (child profile showing a changed verdict), Forecast screen, Proof screen.
4. `demo_script.md`: a click-by-click 90-second live demo path using the deployed URL, matching the slide order.

Read `PPT_LAYOUT_BRIEF.md` for exactly how each asset is used.

---

## 15. Guardrails

- Do not present modelled data as ground-truth sensor readings.
- Do not claim medical benefits ("prevents asthma attacks"). Claim only **reduced estimated PM2.5 inhalation** according to the stated method.
- Do not invent population, health-cost, or market statistics. If an impact figure needs an external number, leave a clearly marked placeholder and tell me. I will source and cite it.
- Do not tune hyperparameters on the test block, and do not overwrite `backtest_results.json` by hand.
- Do not add dependencies casually. Justify each in `docs/decisions.md`.
- Do not leave dead code, unused files, or TODOs without an owner and reason in the final repository.

---

## 16. Final Deliverables Checklist

- [ ] Public URL working on mobile and desktop
- [ ] `artifacts/model.joblib`, `metrics.json`, `model_card.md`
- [ ] `artifacts/backtest_results.json`
- [ ] `artifacts/slides/` with numbers, charts, screenshots, and `demo_script.md`
- [ ] All tests passing, with the output saved in the final report
- [ ] `README.md`, `docs/METHODOLOGY.md`, `docs/decisions.md`, `docs/api.md`
- [ ] Backup demo video (60 to 90 seconds)
- [ ] Final report: what was built, what was cut, known limitations, and the three most likely failure points during a live demo with their mitigations

**Begin with Phase 0. Show me your implementation plan before writing application code.**

---

# 17. Antigravity Frontend Build Instructions — Web Design Engineer Skill

> **Purpose of this section:** This is the project-specific, self-contained operating brief for Antigravity's frontend agent. It incorporates the relevant working principles and workflow of the Web Design Engineer skill into this project document, so the agent can follow the design process without needing the user to restate the skill instructions. It does not replace Sections 0–16; it tells Antigravity how to execute their frontend requirements.

**Skill source:** [ConardLi/garden-skills — Web Design Engineer](https://github.com/ConardLi/garden-skills/tree/main/skills/web-design-engineer)  
**Main skill file:** `skills/web-design-engineer/SKILL.md`  
**Skill name:** `web-design-engineer`

## 17.1 Mandatory instruction to Antigravity

You MUST use the **Web Design Engineer** skill when designing and implementing the BreatheWise frontend. Act as a senior product designer and frontend design engineer in addition to your software-engineering role.

Your responsibility is not merely to make the React application render. Build a distinctive, polished, accessible, responsive and genuinely interactive product interface that communicates BreatheWise's value immediately and makes its recommendations easy to understand and act upon.

The project requirements, data contracts, scientific assumptions, backend architecture, API paths, deadlines, deliverables and scope in Sections 0–16 remain authoritative. The Web Design Engineer skill governs the **visual design process, design quality, frontend interaction design and frontend implementation craft**. It must not silently change the product, invent data, alter the prescribed stack, change backend contracts, or expand project scope.

### Source-of-truth and precedence rules

If instructions appear to conflict, follow this order:

1. **Product truth, scope, data, health guardrails, API contracts and deliverables:** Sections 0–16 of this `PROJECT_BRIEF.md`.
2. **Frontend stack and architecture:** Section 5 — React + Vite + strict TypeScript, Tailwind CSS, Recharts and TanStack Query.
3. **Visual design and interaction quality:** this Section 17 and the Web Design Engineer skill.
4. **Optional enhancements:** only the SHOULD and COULD items in Section 3, and only when time permits.

Do not replace Recharts with Chart.js or D3, do not replace the prescribed React/Vite application with a standalone HTML/Babel prototype, and do not introduce another framework simply because a skill example uses it. Adapt the skill's design principles to the existing stack.

The skill is for visual frontend work. Do not use it as a reason to redesign the FastAPI service, data pipeline, forecasting model, recommendation engine, or deployment architecture.

## 17.2 Make the skill available to Antigravity

At the beginning of the project:

1. Inspect the repository for `.agents/skills/web-design-engineer/SKILL.md`.
2. If it exists, read the skill file before frontend work. Read the relevant reference files listed in Section 17.12 as needed; do not load the entire recipe library indiscriminately.
3. If it does not exist, install the complete skill folder into the workspace. From the repository root, the following PowerShell commands are suitable:

```powershell
git clone --depth 1 https://github.com/ConardLi/garden-skills.git "$env:TEMP\garden-skills"

New-Item -ItemType Directory -Force ".agents/skills"

Copy-Item -Recurse `
  "$env:TEMP\garden-skills\skills\web-design-engineer" `
  ".agents/skills/web-design-engineer"
```

4. Ensure the copied folder contains `SKILL.md`, `agents/` and `references/`; do not copy only the main Markdown file.
5. Start a fresh Antigravity agent context or refresh skill discovery if necessary. Confirm that `web-design-engineer` is discoverable. If Antigravity supports explicit skill invocation in the current environment, invoke `/web-design-engineer`; otherwise explicitly state in the agent task that the skill and this Section 17 must be followed.
6. If the skill cannot be installed or discovered, do not silently claim it was activated. Follow the self-contained instructions in this section and record the limitation in the phase report.

The skill folder is a design-engineering aid. This `PROJECT_BRIEF.md` remains the single source of truth for BreatheWise.

## 17.3 Product-specific Design Read

Before choosing visual tokens or writing frontend code, create a concise Design Read in `docs/design-read.md` (or in `docs/design-system.md` if that file is already being created).

Use the following as the initial project-specific calibration. Adjust a dial only if the adjustment is explained and recorded.

```yaml
Design Read:
  artifact: responsive interactive web application / health-adjacent planning dashboard
  audience: urban Indian residents, including healthy adults and users selecting child,
            elderly, pregnant, respiratory/cardiac and outdoor-worker profiles
  primary_task: decide when to exercise, commute, ventilate a home or let children play outdoors
  visual_language: calm, trustworthy, human-centred information design;
                   precise data visualisation; warm and reassuring, never alarmist
  mode: greenfield
  visual_variance: 6
  motion_intensity: 3
  information_density: 6
  asset_dependence: 3
  brand_fidelity: 8
```

These five dials are real design variables, not decorative scores:

- **Visual variance — 6/10:** BreatheWise should be recognisable and distinctive, not a generic weather dashboard. Use deliberate composition and typography, while keeping the product familiar enough to understand quickly.
- **Motion intensity — 3/10:** Use restrained feedback, transitions and chart interactions. No distracting animation, parallax-heavy landing page or motion that delays the task.
- **Information density — 6/10:** The Forecast and Proof screens contain meaningful data, but the Plan screen must prioritise the next action. Progressive disclosure should keep advanced controls secondary.
- **Asset dependence — 3/10:** The product is primarily data and decision oriented. Use charts, clear visual hierarchy and a small number of purposeful visual assets. Do not fill space with stock photography.
- **Brand fidelity — 8/10:** Preserve the BreatheWise product identity and the supplied health, AQI and data semantics consistently across every screen.

### Four positioning questions to answer before design tokens

For each major screen, explicitly decide:

1. **Narrative role:** Is this screen a decision surface (Plan), analytical view (Forecast), evidence view (Proof), or explanation (About)?
2. **Viewing distance:** Is it primarily viewed on a 360–390 px phone, a laptop, or a presentation display? Design mobile-first, then scale up.
3. **Visual temperature:** Calm, reassuring and authoritative. The product must not make health-related content feel frightening or sensational.
4. **Capacity check:** Sketch the screen at thumbnail size and confirm that its most important content fits without overflow or excessive scrolling.

Record these decisions briefly in the design specification.

## 17.4 Choose a coherent design direction

The product brief already provides substantial design context. Do not ask the user a long series of generic aesthetic questions or delay development with unnecessary exploration.

Before implementation, consider three genuinely different design directions and document a concise comparison in the Phase 5 design proposal:

1. **Information Architecture — Edward Tufte / Pentagram influence.** Strong hierarchy, disciplined grids, high data-ink ratio, restrained decoration and charts that explain rather than decorate. This is the strongest foundation for Forecast and Proof.
2. **Warm Humanist — Headspace / Stripe Press influence.** Approachable language, warmer neutral surfaces, reassuring composition and gentle visual cues. This helps make health-adjacent advice understandable without becoming clinical or alarming.
3. **Editorial / Minimalist — Apple HIG / MUJI influence.** Clear typography, generous whitespace, carefully composed cards and a quiet premium feel. This can make the Plan screen feel simple and focused.

**Recommended direction:** combine the information clarity and data discipline of **Information Architecture** with restrained **Warm Humanist** cues. Use editorial spacing and typography where useful. This is a coherent direction, not permission to combine unrelated visual styles.

The selected direction must serve the product's real job: turn forecast data into a personal schedule and explain the estimated exposure avoided. Do not imitate any named brand's logo or claim affiliation with it.

If the installed skill's `references/style-recipes/INDEX.md` is available, consult it to identify the most relevant recipes. Read only the one or two selected recipe files, not all 25. Suitable starting points to evaluate are `tufte-dataink`, `pentagram`, `headspace-meditation`, `stripe-press` and `apple-hig`. The recommendation above remains the project default unless a materially better fit is justified.

## 17.5 Declare the design system before coding

Before writing frontend components, create `docs/design-system.md` and present the proposed system. It must specify:

- Design Read and the five calibrated dials.
- Selected direction and any recipe anchors used.
- Primary, secondary, neutral, surface, border, text and accent tokens.
- Semantic AQI category tokens using the exact category meanings and initial colours from Sections 4.5 and 10.1.
- Typography families, weights, scale, line heights and hierarchy.
- Spacing scale and grid rules.
- Border-radius and shadow/elevation hierarchy.
- Button, input, select, chip, navigation, tooltip, alert, card and modal treatments.
- Chart typography, axes, gridlines, tooltip and semantic series colours.
- Motion durations, easing, triggers and reduced-motion behaviour.
- Responsive breakpoints and layout behaviour.
- Focus, hover, active, disabled, loading, empty and error treatments.

### BreatheWise design-system constraints

1. Use the AQI category colours specified in Section 10.1 as the semantic starting point:
   - Good: `#2E9E4F`
   - Satisfactory: `#8BC34A`
   - Moderate: `#F2C94C`
   - Poor: `#F2994A`
   - Very Poor: `#E5484D`
   - Severe: `#8E1B2C`

   Adjust foreground/background combinations only as needed to achieve accessible contrast. Do not change the category meaning or use category colours decoratively.

2. Use OKLCH for deriving harmonious supporting colours and tonal steps where useful. Preserve the defined semantic category mapping. Keep all colours in shared CSS variables/design tokens; do not introduce arbitrary one-off hues in components.

3. Choose a deliberate, readable type pairing. Do not default to Inter, Roboto, Arial, Fraunces or system-ui as the display identity. A restrained sans-serif for interface/body text and a complementary mono face for technical values may be appropriate. Keep font families to two where practical and ensure fonts load reliably.

4. Use a consistent spacing system, preferably based on a 4 px or 8 px rhythm. Use `clamp()` for fluid type where useful, CSS Grid and Flexbox for layout, and container queries where they materially help component responsiveness.

5. Use a controlled radius and shadow system. Do not make every element a large rounded card. Use whitespace, typography, dividers and grouping to establish hierarchy.

6. Do not use a purple-pink-blue gradient, decorative left-border cards, random neon accents, emoji in place of icons, or generic dashboard decoration unless a documented design reason makes a specific pattern appropriate.

7. Avoid excessive card nesting. A card should represent a meaningful unit of information or action, not merely wrap every element.

8. Use semantic HTML and accessible controls. Colour must never be the only signal: every AQI category and verdict must also have a readable label and, where useful, a consistent icon or shape.

9. Do not fabricate logos, testimonials, user counts, impact claims, city readings, model scores or exposure-reduction figures. Use the actual BreatheWise wordmark as text until a real approved logo asset is provided. Do not invent a logo and present it as an existing brand asset.

10. Use placeholders honestly in the first draft. Missing data should be labelled as unavailable or illustrative, never presented as a live reading.

## 17.6 Screen-by-screen frontend design and interaction requirements

The four screens in Section 10.2 are mandatory. Their information architecture and required features must be preserved. Improve their clarity and interaction quality without adding unnecessary screens.

### A. Plan — primary decision surface

This is the most important screen and the default landing view. It must communicate the current situation and the next useful action immediately.

**Above-the-fold priority on mobile:**

1. BreatheWise identity and compact navigation.
2. Location search and selected location.
3. Profile and activity selection.
4. Current air-quality hero: PM2.5 value, category label, trend and profile-specific verdict.
5. The recommended action window and plain-language instruction.

The user should not need to scroll through explanatory content before seeing the key recommendation.

**Required interactive behaviour:**

- Location search calls the typed `/api/geocode?q=` endpoint, supports loading/no-results/error states, and lets the user select a result. Do not invent geocoding results.
- Preset city chips load the corresponding city. Remember the last selected location in `localStorage`.
- Profile selector supports all six profiles and shows a short, understandable description for each.
- Activity selector supports all four activities.
- Changing location, profile or activity must update the relevant displayed information through the API. Do not merely change the selected label while leaving stale recommendation data on screen.
- Customise controls expand/collapse and include duration, allowed start/end time and usual start time. Defaults must come from the project configuration/API contract, not duplicated arbitrary constants in the UI.
- Validate time ranges and durations before submitting. Show field-level errors in plain language.
- A clear primary action (for example, “Build my plan” or an equivalent concise label) submits the plan request and displays a visible loading state.
- Prevent duplicate submissions while a request is pending.
- The hero card displays current PM2.5, category, trend over the next three hours and the profile-specific verdict.
- The plan card displays the best window prominently, up to two runner-up windows, avoid periods, advice and mask/indoor-alternative guidance when applicable.
- The exposure comparison explains “usual time vs recommended time” and the percentage reduction. Include a tooltip or expandable explanation of the calculation.
- If the usual window is already best, display the backend's zero-savings explanation rather than implying a benefit.
- The data-status indicator must clearly distinguish **Live** from **Cached at HH:MM**. If cached data is served, show a visible banner and timestamp.
- Include an actionable retry state when the request fails and a clear offline/cached fallback state.
- If no safe window exists, make the indoor alternative prominent and do not disguise an `avoid` verdict.

**Trust and content rules:**

- Use concise, non-alarmist language.
- Do not imply that the tool diagnoses or treats a medical condition.
- Do not promise that exposure reduction prevents illness.
- Show the disclaimer in a persistent but unobtrusive location on the Plan experience.
- Use the actual API response and computed artifacts. The example JSON in Section 7 is a schema illustration, not live data.

### B. Forecast — analytical exploration

Use Recharts, as required by Section 5.

**Required chart behaviour:**

- Display the next 48 hours.
- Show the p50 forecast line and p10–p90 uncertainty band.
- Show CPCB category background bands or an equally clear category encoding.
- Show the WHO 2021 24-hour guideline reference at 15 µg/m³, clearly labelled as a 24-hour guideline reference rather than an hourly threshold.
- Mark the current time.
- Highlight the recommended window and visually distinguish avoid windows. Do not obscure the forecast line or uncertainty band.
- Tooltip on hover and tap must expose local time, p50 value, p10–p90 range and category.
- Optional PM10/NO2 context toggle is only included if it does not compromise the required 48-hour PM2.5 view or Phase 5 deadline.
- Include a concise text summary equivalent for screen readers and users who cannot interpret the chart.

**Visualisation quality:**

- Keep axes and gridlines restrained; data should dominate.
- Use consistent units and time formatting (`Asia/Kolkata`).
- Use semantic colour consistently with the rest of the product.
- Avoid 3D charts, decorative shadows, excessive gridlines or misleading axis ranges.
- Chart must resize correctly on mobile and desktop. Tooltips must remain usable on touch devices.

### C. Proof — evidence and accountability

This screen exists to substantiate the product's claims. It must feel transparent and evidence-led, not promotional.

**Required interactive behaviour:**

- City selector loads the corresponding backtest result.
- Show mean exposure reduction, median exposure reduction if available, percentage of days improved and forecast MAE against both baselines.
- Show the model-versus-baselines comparison using a clear chart.
- Show the 30-day usual-window versus recommended-window comparison series.
- Display the test-period start/end dates, number of days, assumptions, data source and limitations visibly.
- Clearly distinguish measured backtest output from forecasts or illustrative values.
- If a city has weak or near-zero exposure reduction, show that honestly. Do not hide weak cases, cherry-pick cities or exaggerate the result.
- If backtest data is missing or incomplete, show an explicit unavailable state rather than zero or fabricated values.

### D. About — explanation and trust

Include the three-step explanation, data sources, modelled-data limitation, coarse spatial resolution, threshold table, methodology link/content, disclaimer and credits/open-source line required by Section 10.2.

Use progressive disclosure (for example, accordions) for detailed methodology so the main explanation remains readable. Do not bury the fact that Open-Meteo air-quality values are CAMS model-based estimates rather than ground-sensor readings.

## 17.7 Global interaction, navigation and state requirements

Build a cohesive application shell with clear navigation between Plan, Forecast, Proof and About.

- Navigation must work with mouse, touch and keyboard.
- Clearly indicate the active screen.
- Keep the main Plan action easy to reach on mobile.
- Preserve location/profile/activity in the URL using the specified query parameter format where applicable.
- Support shareable URL state: `?city=delhi&profile=child&activity=kids_play`.
- Parse URL state safely and fall back to sensible defaults for invalid values.
- Use TanStack Query for server-state fetching, caching, invalidation and loading/error handling, consistent with the existing stack.
- Define TypeScript request/response types matching the FastAPI/Pydantic contracts. Do not use `any` to bypass contract mismatches.
- Keep API calls in the frontend API/service layer, not scattered across visual components.
- Separate reusable UI components from page-level composition and business logic.
- Do not calculate authoritative exposure, verdicts or forecast metrics independently in the browser. The backend is the source of truth. The frontend may format and visualise returned values.
- Keep the frontend state synchronised after location/profile/activity changes. Avoid stale data and confusing intermediate states.
- Use local storage only for appropriate user convenience, such as remembering the last location or lightweight UI preferences. Do not store sensitive personal information.
- If a copy-summary action is implemented, generate its text from the actual plan response and clearly identify location, profile, activity, recommended time, data status and disclaimer.
- If Hindi/English switching is implemented, use the existing `i18n/en.json` and `i18n/hi.json` templates. Do not hard-code a second set of translated strings inside components.

### Required state coverage

For every relevant interactive component, implement the appropriate states:

- Default
- Hover
- Keyboard focus
- Active/selected
- Disabled
- Loading
- Empty/no results
- Error/retry
- Success/updated
- Offline/cached, where relevant

Do not show a loading spinner indefinitely. Do not leave stale results visible without indicating that a new request is in progress. Use skeletons for substantial loading regions and keep the initial page shell fast.

## 17.8 Responsive design and accessibility

Mobile-first is mandatory because judges and users may open the public URL on a phone.

Test and design at minimum for:

- **360 px** narrow mobile
- **390 px** common mobile
- **768 px** tablet
- **1440 px** desktop

Requirements:

1. No horizontal overflow at 360 px.
2. Touch targets should be at least 44 × 44 px where practical.
3. Body text should generally start at 16–18 px; small metadata must remain legible.
4. Use semantic landmarks, headings in logical order, labels and buttons with accessible names.
5. Every form control must have a visible or programmatic label.
6. Keyboard users must be able to reach and operate all controls, selectors, navigation and chart alternatives.
7. Provide visible focus indicators; never remove outlines without a replacement.
8. Maintain WCAG AA contrast for text and important controls.
9. Do not communicate AQI category, verdict, loading or errors through colour alone.
10. Respect `prefers-reduced-motion`. Motion must never be required to understand information or complete a task.
11. Use `text-wrap: pretty` where supported and avoid text clipping/truncation.
12. Charts must have a meaningful text summary or accessible data equivalent.
13. Ensure responsive chart containers resize with their parent (use `ResizeObserver` only if needed; prefer Recharts' responsive container support).

## 17.9 Motion and visual craft

Use motion to clarify cause and effect, not as decoration.

- Prefer CSS transitions and animations for most micro-interactions.
- Use subtle state transitions for selection, disclosure, loading and feedback.
- Use restrained entry transitions only where they help orientation.
- Keep animation durations short and easing consistent.
- Do not animate every card on page load.
- Avoid parallax, continuous ambient motion, excessive blur, large animated gradients and scroll hijacking.
- Do not add Framer Motion, GSAP, Lottie or another animation dependency unless a specific interaction cannot reasonably be implemented with CSS or existing React state. Any new dependency requires justification in `docs/decisions.md`.
- Never use `scrollIntoView`; it can disrupt embedded preview scrolling. Use normal browser navigation/scroll behaviour or controlled scroll position only when necessary.

## 17.10 Honest content, assets and anti-cliché rules

The interface must be credible to judges and useful to users.

- No fabricated statistics, testimonials, user counts, partner logos, sensor readings, model accuracy, forecast improvements or exposure-reduction figures.
- The numerical examples in this brief are contract illustrations/placeholders. Do not render them as current BreatheWise readings.
- During V0, use clearly labelled placeholders such as `[live PM2.5 value]`, `[forecast chart]` or `Awaiting backtest artifact`. Replace them with real API/artifact data during integration.
- Do not use emoji as substitute icons. Use an existing project icon library if one is already installed; otherwise use simple accessible text labels or neutral placeholders until an icon solution is justified.
- Do not create fake maps, fake sensor pins or fake city-level precision.
- Do not use generic stock imagery merely to fill empty space. BreatheWise is a data-and-decision product; charts and purposeful interface elements are its primary visual assets.
- Missing data must be shown as unavailable, not as zero.
- Missing logo: use a clean typographic “BreatheWise” wordmark, not a fabricated emblem or colored rectangle pretending to be an official logo.
- Avoid generic AI-generated design clichés: purple/pink/blue gradient backgrounds, excessive pill-shaped cards, left-border accent cards, random neon accents, emoji decoration, default Inter/Roboto styling, fake testimonials and meaningless dashboard widgets. These are defaults to avoid, not absolute bans if a documented product requirement makes one appropriate.
- Every section and control must support a user task or explain the product. If removing an element does not make the experience worse, remove it.
- Do not add screens or sections beyond the four specified in Section 10 without a documented need and user approval.

## 17.11 Prototype variants, v0 and the full build

Follow the skill's staged design process, adapted to the project deadline and the existing phase plan.

### Stage A — Design proposal

Before frontend coding, produce a short proposal containing:

- Product-specific Design Read.
- Three differentiated visual directions from Section 17.4.
- Recommended direction and reasoning.
- Four screen positioning notes.
- Initial design tokens and component principles.
- Any assumptions or missing assets.

Do not ask a long questionnaire: the project brief already contains the core requirements. Ask only if a missing decision materially blocks implementation or changes project scope.

### Stage B — Design system checkpoint

Create `docs/design-system.md` with the concrete tokens and rules in Section 17.5. Present it for review before building the complete UI.

### Stage C — Viewable V0

Build a viewable V0 of the primary Plan screen and the core navigation shell using the selected design system.

V0 must include:

- The main layout and visual hierarchy.
- Location/profile/activity controls in their intended positions.
- Hero and plan-card placeholders.
- Exposure comparison placeholder.
- Navigation to the four required screens, with layout placeholders for Forecast, Proof and About.
- Responsive structure.
- Explicit markers for missing real data or assets.

V0 does not need the full backend integration, final chart data, every state or polished motion. It must be viewable early so the user can correct the direction before the full frontend is built.

### Stage D — Full frontend implementation

After the design system and V0 direction are approved, implement the four complete screens, API integration, real interactions, data visualisations, all relevant states and responsive/accessibility requirements.

### Checkpoint handling within the existing schedule

These design checkpoints are part of **Phase 5**, not new project phases. Present the design proposal/design system and V0 early in Phase 5. Obtain confirmation before committing to a substantially different visual direction or proceeding from V0 to the full UI. Do not create unnecessary approval stops for routine implementation details. The existing GATE 0, GATE 2, GATE 4 and GATE 6 in Section 13 remain the project-level gates; this section adds the skill's focused design review within the existing frontend phase.

The user has explicitly prioritised a time-boxed, working prototype. If the design workflow threatens the deadline, keep the design proposal concise, build the smallest viewable V0, and move on to the core implementation. Do not spend hours producing decorative variants.

### Variant exploration

The skill encourages meaningful variation, not cosmetic recolouring. During the initial design proposal, compare the three directions in Section 17.4. If time allows, show three small treatments of the Plan hero or one key component to clarify the choice. Do not build three separate applications.

A live “Tweaks” panel is optional and is **not a MUST** for this project. Add it only if it can be implemented quickly without distracting from the real Plan workflow. If added, keep it hidden by default and limit it to harmless presentation preferences such as compact/comfortable density or reduced motion. Do not let it alter health thresholds, model outputs, API behaviour or the underlying recommendation.

## 17.12 Skill reference routing

If the skill folder is installed, use these references selectively:

| Need | Reference |
|---|---|
| Infer Design Read, calibrate five dials and resolve conflicts | `references/design-calibration.md` |
| Recommend distinct visual directions | `references/design-directions.md` |
| Browse recipe catalog and indexes | `references/style-recipes/INDEX.md` |
| Apply a selected recipe | Only the matching file, e.g. `references/style-recipes/tufte-dataink.md` or `headspace-meditation.md` |
| Detect recurring design failures | Relevant parts of `references/failure-patterns.md` |
| Reuse an existing component pattern | `references/block-library.md`, then targeted section of `references/advanced-patterns.md` |
| Responsive charts, data visualisation, OKLCH, motion or Tweaks patterns | Relevant section of `references/advanced-patterns.md` |
| Existing UI redesign/preservation protocol | `references/redesign-protocol.md` (only if adapting an existing frontend rather than greenfield work) |
| Explicit browser acceptance and responsive testing | `references/browser-acceptance.md` |
| Detailed five-dimension design critique | `references/critique-guide.md` |

Do not preload every reference or all 25 style recipes. Read only the material needed for the current frontend task. This section contains the project-specific operating instructions even if the skill's reference folder is unavailable.

## 17.13 Browser acceptance, visual critique and delivery evidence

The project brief already explicitly requires frontend component tests, a browser smoke test, screenshots at mobile and desktop widths, and manual QA. Therefore, browser-based acceptance testing is part of this project's required work; do not treat it as an optional extra.

Use the skill's `references/browser-acceptance.md` if available and combine it with Section 11. At minimum, execute and record the following flow in a real browser:

1. Open the deployed or local app.
2. Search for a location and select a result.
3. Select each relevant profile, including a profile that changes the verdict.
4. Change the activity.
5. Customise the usual time/duration if implemented.
6. Generate a plan and confirm that the displayed recommendation matches the API response.
7. Open Forecast and inspect tooltip, uncertainty band, current-time marker and recommended/avoid windows.
8. Open Proof and change city; confirm all displayed figures come from `backtest_results.json`.
9. Open About and inspect methodology, data limitations and disclaimer.
10. Test an upstream/API failure and verify the cached-data banner and retry behaviour.
11. Test an invalid location and empty search results.
12. Test at 360/390 px mobile and 1440 px desktop.
13. Check keyboard navigation, focus visibility, contrast and chart text alternatives.
14. Check browser console and network errors.

Capture the screenshots required in Section 13 and Section 14. Record actual evidence; never claim a test passed if it was not run. Fix failures and rerun the affected checks. If a test cannot be run, state exactly what was not tested and why.

### Five-dimension visual critique

Before declaring the frontend complete, perform a self-critique using these dimensions:

| Dimension | BreatheWise evaluation |
|---|---|
| Philosophy alignment | Does the interface consistently feel calm, trustworthy, human-centred and data-led? |
| Visual hierarchy | Is the next useful action obvious on Plan? Are headings, values and supporting text clearly differentiated? |
| Craft quality | Are alignment, spacing, type, contrast, chart treatment and responsive behaviour deliberate and consistent? |
| Functionality | Does every control work? Does each interaction produce the expected state or API result? |
| Originality | Does the product avoid generic AI-dashboard styling while remaining clear and credible? |

Score each dimension from 0–10. Report the overall score, the dimension scores, what should be kept, fixes ordered by severity and three quick wins. Critique the interface, not the developer. Do not inflate scores to make the result look better.

## 17.14 Frontend completion checklist

The frontend is not complete until the applicable items below are checked:

- [ ] `web-design-engineer` skill was located/installed and its use was confirmed, or its unavailability was disclosed and Section 17 was followed directly.
- [ ] Product-specific Design Read exists and the five dials informed real decisions.
- [ ] Three distinct directions were considered; one coherent direction was selected and documented.
- [ ] `docs/design-system.md` exists and all screens use its shared tokens.
- [ ] V0 was shown before the full frontend build.
- [ ] Existing React + Vite + strict TypeScript + Tailwind + Recharts + TanStack Query stack was preserved.
- [ ] Plan, Forecast, Proof and About screens are implemented.
- [ ] Location, profile, activity, customisation, navigation and URL-state interactions work.
- [ ] API contracts are typed and match the FastAPI backend.
- [ ] Forecast and Proof visualisations use real backend/artifact data.
- [ ] Live/cached status, loading, empty, error, retry and offline states work.
- [ ] No fabricated metrics, testimonials, readings, logos or medical claims appear.
- [ ] AQI category colours and meanings remain consistent and are not the only information signal.
- [ ] Responsive layouts work at 360, 390, 768 and 1440 px.
- [ ] Keyboard access, focus states, labels, contrast and reduced-motion support are implemented.
- [ ] No horizontal overflow, clipped text, broken assets or obvious console errors remain.
- [ ] No unnecessary animation or dependency was added.
- [ ] Browser acceptance flow was executed and evidence/screenshots were saved.
- [ ] Five-dimension design critique was completed and severe issues were fixed.
- [ ] Frontend performance and accessibility targets in Section 10.3 were checked.
- [ ] The final phase report includes Done, Evidence, Decisions, Risks and Next.

## 17.15 Required Antigravity behaviour when starting this project

When this file is supplied to Antigravity, do not immediately begin writing application code.

Start with **Phase 0**, as required by Section 13:

1. Read this entire `PROJECT_BRIEF.md`, including this Section 17.
2. Inspect the repository and determine whether the Web Design Engineer skill is installed and discoverable.
3. Produce the whole-project implementation plan and phase task list.
4. Verify every external API in Section 4 and record findings in `docs/decisions.md`.
5. Identify any conflict, missing input or schedule risk. Make sensible reversible decisions and log them rather than repeatedly asking questions.
6. Present the Phase 0 report and satisfy GATE 0 before proceeding.

When Phase 5 begins, explicitly activate/use Web Design Engineer for the frontend and follow Sections 17.3–17.14. The result must be a **working BreatheWise product**, not merely a beautiful static mockup.

**Final instruction:** The frontend must make the product's core promise immediately understandable: choose where you are, who the plan is for and what you intend to do; then receive a clear, evidence-grounded recommendation about when to do it and the estimated PM2.5 exposure avoided. Every visual and interactive decision must support that journey.
