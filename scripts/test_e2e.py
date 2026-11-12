"""End-to-End Integration Test for BreatheWise Prototype."""

import sys
from pathlib import Path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

print("--- Test 1: SPA Static Root ---")
r = client.get("/")
assert r.status_code == 200, f"Expected 200, got {r.status_code}"
assert "BreatheWise" in r.text
print("✓ SPA index.html served successfully")

print("\n--- Test 2: Monitored Preset Cities ---")
r = client.get("/api/cities")
assert r.status_code == 200
cities = r.json()
assert len(cities) == 8
city_names = [c["name"] for c in cities]
print(f"✓ 8 Preset Cities: {', '.join(city_names)}")

print("\n--- Test 3: Geocoding Search ---")
r = client.get("/api/geocode?q=Kanpur")
assert r.status_code == 200
results = r.json().get("results", [])
assert len(results) > 0
print(f"✓ Geocoded Kanpur: {results[0]['name']} at ({results[0]['latitude']}, {results[0]['longitude']})")

print("\n--- Test 4: Current Air Quality Observation ---")
r = client.get("/api/current?lat=28.6139&lon=77.209&profile=child")
assert r.status_code == 200
aq = r.json()
print(f"✓ Current AQ: PM2.5 = {aq['pm25']} µg/m³, Category = {aq['category']}, Trend = {aq['trend']}, Verdict = {aq['verdict']}")

print("\n--- Test 5: 48-Hour Forecast Trajectory ---")
r = client.get("/api/forecast?lat=28.6139&lon=77.209&hours=48")
assert r.status_code == 200
fc = r.json()
assert len(fc["forecast"]) == 48
print(f"✓ Forecast: 48 hourly points returned. Range: {min(h['pm25_p10'] for h in fc['forecast']):.1f} – {max(h['pm25_p90'] for h in fc['forecast']):.1f} µg/m³")

print("\n--- Test 6: Optimization Planning Pipeline ---")
plan_req = {
    "lat": 28.6139,
    "lon": 77.209,
    "profile": "child",
    "activity": "kids_play",
    "duration_min": 45,
    "allowed_start": "06:00",
    "allowed_end": "20:00",
    "usual_start": "07:00",
    "language": "en",
}
r = client.post("/api/plan", json=plan_req)
assert r.status_code == 200
plan = r.json()
best = plan["best_windows"][0]
print(f"✓ Plan Generated: Best Window {best['start']} -> {best['end']}")
print(f"  Exposure avoided: {plan['exposure']['avoided_pct']}%, Advice: {plan['advice']}")

print("\n--- Test 7: Backtest Proof & Metrics ---")
r = client.get("/api/backtest")
assert r.status_code == 200
bt = r.json()
assert "delhi" in bt["cities"]
assert "model_metrics" in bt
print(f"✓ Backtest: Delhi exposure reduction = {bt['cities']['delhi']['mean_exposure_reduction_pct']}%, Overall Model MAE = {bt['model_metrics']['overall']['model']['mae']} µg/m³")

print("\n==========================================")
print("ALL 7 END-TO-END INTEGRATION TESTS PASSED!")
print("==========================================")

