"""Unit and integration tests for recommendation engine and FastAPI endpoints."""

from fastapi.testclient import TestClient
import pytest

from backend.app.main import app
from backend.app.recs.profiles import compute_effective_thresholds, determine_verdict
from backend.app.recs.exposure import compute_inhalation_dose, compute_exposure_avoided
from backend.app.recs.windows import find_windows
from backend.app.recs.advice import generate_advice

client = TestClient(app)


def test_effective_thresholds_scaling() -> None:
    """Verify profile factors scale base thresholds properly."""
    adult_thresh = compute_effective_thresholds("healthy_adult")
    child_thresh = compute_effective_thresholds("child")
    resp_thresh = compute_effective_thresholds("respiratory_cardiac")

    assert adult_thresh["exercise_ok"] == 60.0
    assert child_thresh["exercise_ok"] == 45.0  # 60 * 0.75
    assert resp_thresh["exercise_ok"] == 30.0   # 60 * 0.5


def test_exposure_avoided_never_negative() -> None:
    """Dose avoided must never be negative, even if usual is cleaner than recommended."""
    res1 = compute_exposure_avoided(usual_dose=100.0, recommended_dose=60.0)
    assert res1["avoided_pct"] == 40.0

    res2 = compute_exposure_avoided(usual_dose=50.0, recommended_dose=60.0)
    assert res2["avoided_pct"] == 0.0

    res3 = compute_exposure_avoided(usual_dose=50.0, recommended_dose=50.0)
    assert res3["avoided_pct"] == 0.0


def test_window_finder_ranking() -> None:
    """Verify window finder ranks cleanest hours first and identifies avoid periods."""
    forecast = []
    # 24 hours of synthetic data
    for h in range(24):
        pm25 = 20.0 + (h * 10.0)  # PM2.5 rises each hour from 20 to 250
        forecast.append(
            {
                "time": f"2026-11-12T{h:02d}:00:00+05:30",
                "pm25_p50": pm25,
                "pm25_p90": pm25 + 10.0,
            }
        )

    best_windows, avoid_windows, usual_window, meta = find_windows(
        forecast=forecast,
        profile_id="healthy_adult",
        activity_id="exercise",
        duration_min=60,
        allowed_start_str="05:00",
        allowed_end_str="21:00",
        usual_start_str="07:00",
    )

    assert len(best_windows) >= 1
    # First best window should be at 05:00 (cleanest allowed hour)
    assert "05:00" in best_windows[0]["start"]
    assert best_windows[0]["mean_pm25"] == 70.0  # 20 + 5*10 = 70.0 at h=5
    assert usual_window["mean_pm25"] == 90.0     # h=7


def test_api_health() -> None:
    """Check /api/health returns 200 with service information."""
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
    assert data["cities_configured"] == 8


def test_api_cities_and_methodology() -> None:
    """Check /api/cities and /api/methodology endpoints."""
    resp = client.get("/api/cities")
    assert resp.status_code == 200
    cities = resp.json()
    assert len(cities) == 8

    resp_meth = client.get("/api/methodology")
    assert resp_meth.status_code == 200
    assert "cpcb_categories" in resp_meth.json()


def test_api_plan_contract() -> None:
    """Check POST /api/plan returns full schema conforming response."""
    payload = {
        "lat": 28.6139,
        "lon": 77.2090,
        "profile": "healthy_adult",
        "activity": "exercise",
        "duration_min": 60,
        "allowed_start": "05:00",
        "allowed_end": "21:00",
        "usual_start": "07:00",
        "language": "en",
    }
    resp = client.post("/api/plan", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    # Validate mandatory contract fields
    assert "generated_at" in data
    assert "data_status" in data
    assert "location" in data
    assert "best_windows" in data
    assert len(data["best_windows"]) >= 1
    assert "avoid_windows" in data
    assert "usual_window" in data
    assert "exposure" in data
    assert data["exposure"]["avoided_pct"] >= 0.0
    assert "verdict" in data
    assert "advice" in data
    assert "disclaimer" in data


def test_api_plan_validation_errors() -> None:
    """Check that invalid parameters return 400 with {'error': '...', 'field': '...'}'."""
    # Invalid profile
    bad_profile = {
        "lat": 28.6139,
        "lon": 77.2090,
        "profile": "invalid_superhuman",
        "activity": "exercise",
    }
    resp = client.post("/api/plan", json=bad_profile)
    assert resp.status_code == 400
    err = resp.json()
    assert "field" in err
    assert "profile" in err["field"]

    # Invalid latitude
    bad_lat = {
        "lat": 199.0,
        "lon": 77.2090,
        "profile": "healthy_adult",
        "activity": "exercise",
    }
    resp_lat = client.post("/api/plan", json=bad_lat)
    assert resp_lat.status_code == 400
    assert "lat" in resp_lat.json()["field"]

