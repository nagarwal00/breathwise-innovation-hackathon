"""Backtest results endpoint feeding the Proof page."""

import json
from pathlib import Path
from typing import Any, Dict, Optional
from fastapi import APIRouter, HTTPException, Query

from backend.app.config import ARTIFACTS_DIR

router = APIRouter(tags=["backtest"])


@router.get("/backtest")
def get_backtest_results(city: Optional[str] = Query(None, description="Optional city id filter")) -> Dict[str, Any]:
    """Retrieve 30-day walk-forward backtest results and baseline comparisons."""
    backtest_file = ARTIFACTS_DIR / "backtest_results.json"
    if not backtest_file.exists():
        raise HTTPException(
            status_code=404,
            detail="Backtest results artifact not yet generated. Run scripts/run_backtest.py.",
        )

    try:
        with open(backtest_file, "r", encoding="utf-8") as f:
            data = json.load(f)

        if city:
            clean_city = city.strip().lower()
            if clean_city in data.get("cities", {}):
                return {
                    "generated_at": data.get("generated_at"),
                    "test_period": data.get("test_period"),
                    "city": clean_city,
                    "results": data["cities"][clean_city],
                    "assumptions": data.get("assumptions", []),
                }
            else:
                raise HTTPException(status_code=404, detail=f"No backtest data for city '{city}'")

        metrics_file = ARTIFACTS_DIR / "metrics.json"
        if metrics_file.exists():
            with open(metrics_file, "r", encoding="utf-8") as mf:
                data["model_metrics"] = json.load(mf)

        return data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading backtest results: {e}")

