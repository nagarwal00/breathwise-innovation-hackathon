"""Activity window optimization and risk period detection."""

import math
from datetime import datetime, time, timedelta
from typing import Any, Dict, List, Optional, Tuple
import pandas as pd

from backend.app.config import settings
from backend.app.recs.profiles import (
    compute_effective_thresholds,
    determine_verdict,
)


def parse_time_str(time_str: str) -> time:
    """Parse 'HH:MM' string to datetime.time."""
    parts = time_str.strip().split(":")
    return time(int(parts[0]), int(parts[1]))


def is_time_in_range(t: datetime, start_time: time, end_time: time) -> bool:
    """Check if timestamp local hour/minute falls within [start_time, end_time]."""
    local_t = t.time()
    if start_time <= end_time:
        return start_time <= local_t <= end_time
    else:  # overnight range
        return local_t >= start_time or local_t <= end_time


def compute_risk_adjusted_mean(p50_vals: List[float], p90_vals: List[float]) -> float:
    """m_adj = mean(p50) + 0.5 * (mean(p90) - mean(p50))."""
    m_p50 = sum(p50_vals) / len(p50_vals)
    m_p90 = sum(p90_vals) / len(p90_vals)
    return round(m_p50 + 0.5 * max(0.0, m_p90 - m_p50), 1)


def find_windows(
    forecast: List[Dict[str, Any]],
    profile_id: str,
    activity_id: str,
    duration_min: int,
    allowed_start_str: str = "05:00",
    allowed_end_str: str = "21:00",
    usual_start_str: str = "07:00",
    schedule_flexibility: str = "moderate",
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], Dict[str, Any], Dict[str, Any]]:
    """
    Search candidate windows within activity practical bounds and schedule flexibility,
    returning: (best_windows, avoid_windows, usual_window, meta).
    """
    thresholds = compute_effective_thresholds(profile_id)
    activity = settings.activities.get(activity_id)
    threshold_key = activity.threshold_key if activity else "exercise_ok"
    ok_threshold = thresholds.get(threshold_key, 60.0)
    mask_threshold = thresholds.get("mask_advised", 120.0)
    avoid_threshold = thresholds.get("avoid", 250.0)

    # Activity-specific practical bounds
    # If the request uses the generic all-day span (05:00 to 21:00), automatically bound
    # to the activity's inherent real-world practical window (e.g. morning commute: 7-11 AM)
    if allowed_start_str == "05:00" and allowed_end_str == "21:00" and activity:
        allowed_start_str = activity.practical_window_start
        allowed_end_str = activity.practical_window_end

    # Convert forecast list to timed entries
    items = []
    for f in forecast:
        dt = datetime.fromisoformat(f["time"])
        items.append({"dt": dt, "p50": f["pm25_p50"], "p90": f["pm25_p90"]})

    if not items:
        raise ValueError("Forecast list is empty")

    duration_hours = max(1, math.ceil(duration_min / 60.0))
    allowed_start = parse_time_str(allowed_start_str)
    allowed_end = parse_time_str(allowed_end_str)
    usual_start = parse_time_str(usual_start_str)

    candidate_windows = []
    usual_window_candidate = None

    # Slide window of duration_hours across items
    n = len(items)
    for i in range(n - duration_hours + 1):
        w_items = items[i : i + duration_hours]
        start_dt = w_items[0]["dt"]
        end_dt = start_dt + timedelta(minutes=duration_min)

        p50_slice = [it["p50"] for it in w_items]
        p90_slice = [it["p90"] for it in w_items]

        m_pm25 = round(sum(p50_slice) / len(p50_slice), 1)
        m_adj = compute_risk_adjusted_mean(p50_slice, p90_slice)
        cat_slug, _ = settings.get_cpcb_category(m_pm25)
        verdict, mask_req, indoor_req = determine_verdict(
            m_adj, ok_threshold, mask_threshold, avoid_threshold
        )

        # For sensitive profiles (cardiac, asthma, elderly, pregnant), if risk-adjusted
        # exposure exceeds their lowered threshold, flag indoor alternative
        if profile_id in ["respiratory_cardiac", "elderly", "pregnant"] and m_adj > ok_threshold:
            indoor_req = True

        w_record = {
            "start": start_dt.isoformat(),
            "end": end_dt.isoformat(),
            "start_dt": start_dt,
            "end_dt": end_dt,
            "mean_pm25": m_pm25,
            "risk_adj_pm25": m_adj,
            "category": cat_slug,
            "verdict": verdict,
            "mask_recommended": mask_req,
            "indoor_alternative": indoor_req,
        }

        # Check if matches user's usual start time on the first matching date
        if usual_window_candidate is None and start_dt.time().hour == usual_start.hour:
            usual_window_candidate = w_record

        # Check if candidate falls inside allowed interval
        if is_time_in_range(start_dt, allowed_start, allowed_end) and is_time_in_range(
            end_dt, allowed_start, allowed_end
        ):
            candidate_windows.append(w_record)

    # Fallback for usual window if outside range
    if usual_window_candidate is None:
        usual_window_candidate = (
            candidate_windows[0] if candidate_windows else items[0]
        )

    # If no candidate window fits strictly inside allowed range, use first duration_hours
    if not candidate_windows:
        w_items = items[:duration_hours]
        m_pm25 = round(sum(it["p50"] for it in w_items) / len(w_items), 1)
        m_adj = compute_risk_adjusted_mean([it["p50"] for it in w_items], [it["p90"] for it in w_items])
        cat_slug, _ = settings.get_cpcb_category(m_pm25)
        verdict, mask_req, indoor_req = determine_verdict(
            m_adj, ok_threshold, mask_threshold, avoid_threshold
        )
        start_dt = w_items[0]["dt"]
        end_dt = start_dt + timedelta(minutes=duration_min)
        candidate_windows.append(
            {
                "start": start_dt.isoformat(),
                "end": end_dt.isoformat(),
                "start_dt": start_dt,
                "end_dt": end_dt,
                "mean_pm25": m_pm25,
                "risk_adj_pm25": m_adj,
                "category": cat_slug,
                "verdict": verdict,
                "mask_recommended": mask_req,
                "indoor_alternative": indoor_req,
            }
        )

    # ── Intelligent Multi-Objective Scoring ─────────────────────────────────
    # Weights balance particulate risk vs routine disruption penalty:
    flex_weights = {
        "strict": 25.0,    # Strictly keep within ~1-1.5h of routine
        "moderate": 7.5,   # Shift 1-3 hours allowed if pollution drops significantly
        "flexible": 1.5,   # Find lowest point within the practical activity boundary
    }
    penalty_weight = flex_weights.get(schedule_flexibility, 7.5)

    def window_objective(w: Dict[str, Any]) -> float:
        w_time = w["start_dt"].time()
        w_hours = w_time.hour + w_time.minute / 60.0
        u_hours = usual_start.hour + usual_start.minute / 60.0
        diff = abs(w_hours - u_hours)
        if diff > 12.0:
            diff = 24.0 - diff

        # If strict flexibility, heavily penalize candidates > 2 hours away
        if schedule_flexibility == "strict" and diff > 2.0:
            return 9999.0 + w["risk_adj_pm25"]

        return w["risk_adj_pm25"] + penalty_weight * diff

    sorted_candidates = sorted(candidate_windows, key=window_objective)

    # Pick top 3 non-overlapping windows
    best_windows = []
    for cand in sorted_candidates:
        overlap = False
        for selected in best_windows:
            if not (
                cand["end_dt"] <= selected["start_dt"]
                or cand["start_dt"] >= selected["end_dt"]
            ):
                overlap = True
                break
        if not overlap:
            best_windows.append(cand)
            if len(best_windows) >= 3:
                break

    # If couldn't find 3 non-overlapping, fill with top available
    if len(best_windows) < 3 and len(sorted_candidates) > len(best_windows):
        for cand in sorted_candidates:
            if cand not in best_windows:
                best_windows.append(cand)
                if len(best_windows) >= 3:
                    break

    # Detect avoid windows (contiguous blocks where p50 > avoid_threshold)
    avoid_windows = []
    curr_avoid_start = None
    curr_avoid_items = []

    for item in items:
        if item["p50"] > avoid_threshold:
            if curr_avoid_start is None:
                curr_avoid_start = item["dt"]
            curr_avoid_items.append(item["p50"])
        else:
            if curr_avoid_start is not None and curr_avoid_items:
                m_avoid = round(sum(curr_avoid_items) / len(curr_avoid_items), 1)
                cat_slug, _ = settings.get_cpcb_category(m_avoid)
                avoid_windows.append(
                    {
                        "start": curr_avoid_start.isoformat(),
                        "end": item["dt"].isoformat(),
                        "mean_pm25": m_avoid,
                        "category": cat_slug,
                    }
                )
                curr_avoid_start = None
                curr_avoid_items = []

    if curr_avoid_start is not None and curr_avoid_items:
        m_avoid = round(sum(curr_avoid_items) / len(curr_avoid_items), 1)
        cat_slug, _ = settings.get_cpcb_category(m_avoid)
        avoid_windows.append(
            {
                "start": curr_avoid_start.isoformat(),
                "end": items[-1]["dt"].isoformat(),
                "mean_pm25": m_avoid,
                "category": cat_slug,
            }
        )

    # Clean internal dt references before returning
    clean_best = [
        {k: v for k, v in w.items() if not k.endswith("_dt")} for w in best_windows
    ]
    clean_usual = {k: v for k, v in usual_window_candidate.items() if not k.endswith("_dt")}

    meta = {
        "ok_threshold": ok_threshold,
        "mask_threshold": mask_threshold,
        "avoid_threshold": avoid_threshold,
    }

    return clean_best, avoid_windows, clean_usual, meta

