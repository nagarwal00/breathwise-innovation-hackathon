"""Plain-language, template-based health guidance generator (English and Hindi)."""

import json
from datetime import datetime
from typing import Any, Dict
from backend.app.config import I18N_DIR, settings


def load_templates(language: str = "en") -> Dict[str, Any]:
    """Load localization dictionary for advice templates."""
    lang_file = I18N_DIR / f"{language}.json"
    if not lang_file.exists():
        lang_file = I18N_DIR / "en.json"
    with open(lang_file, "r", encoding="utf-8") as f:
        return json.load(f)


def format_window_time(start_iso: str, end_iso: str) -> str:
    """Format start and end ISO strings into human readable '2 to 3 PM' format."""
    s_dt = datetime.fromisoformat(start_iso)
    e_dt = datetime.fromisoformat(end_iso)

    def hr_fmt(dt: datetime) -> str:
        h = dt.hour
        m = dt.minute
        meridiem = "AM" if h < 12 else "PM"
        display_h = h if h <= 12 else h - 12
        if display_h == 0:
            display_h = 12
        if m > 0:
            return f"{display_h}:{m:02d} {meridiem}"
        return f"{display_h} {meridiem}"

    return f"{hr_fmt(s_dt)} to {hr_fmt(e_dt)}"


def generate_advice(
    best_window: Dict[str, Any],
    usual_window: Dict[str, Any],
    avoid_windows: list,
    activity_id: str,
    profile_id: str,
    language: str = "en",
) -> Dict[str, Any]:
    """
    Constructs plain language advice strings without technical jargon,
    mask notices, indoor fallback alerts, and standard disclaimer.
    """
    templates = load_templates(language)
    activity_cfg = settings.activities.get(activity_id)
    activity_name = activity_cfg.label if activity_cfg else activity_id.replace("_", " ")

    best_start = best_window["start"]
    best_end = best_window["end"]
    best_span_str = format_window_time(best_start, best_end)

    usual_start_dt = datetime.fromisoformat(usual_window["start"])
    usual_time_str = usual_start_dt.strftime("%I %p").lstrip("0")

    verdict = best_window.get("verdict", "caution")
    mask_rec = best_window.get("mask_recommended", False)
    indoor_alt = best_window.get("indoor_alternative", False)

    sentences = []

    # 1. Headline advice: Skip usual vs Already best
    is_same_window = best_window["start"] == usual_window["start"]
    if is_same_window or usual_window["mean_pm25"] <= best_window["mean_pm25"]:
        sentence_1 = templates["advice"]["already_best"].format(
            usual_time=usual_time_str,
            mean_pm25=usual_window["mean_pm25"],
        )
    else:
        sentence_1 = templates["advice"]["skip_usual"].format(
            usual_time=usual_time_str,
            activity=activity_name.lower(),
            best_window=best_span_str,
        )
    sentences.append(sentence_1)

    # 2. Verdict nuance / cautionary advice
    if indoor_alt:
        sentences.append(templates["advice"]["indoor_fallback"])
    elif verdict == "caution":
        sentences.append(
            templates["advice"]["caution_intensity"].format(
                category=best_window.get("category", "moderate").replace("_", " ")
            )
        )
    elif verdict == "mask" or mask_rec:
        sentences.append(templates["advice"]["mask_required"])

    # Profile special handling: outdoor worker
    if profile_id == "outdoor_worker" and avoid_windows:
        first_avoid = avoid_windows[0]
        avoid_span = format_window_time(first_avoid["start"], first_avoid["end"])
        sentences.append(
            templates["advice"]["outdoor_worker_guidance"].format(avoid_window=avoid_span)
        )

    advice_text = " ".join(sentences)
    disclaimer_text = templates.get(
        "disclaimer", "General guidance, not medical advice."
    )

    return {
        "verdict": verdict,
        "advice": advice_text,
        "mask_recommended": mask_rec,
        "indoor_alternative": indoor_alt,
        "disclaimer": disclaimer_text,
    }

