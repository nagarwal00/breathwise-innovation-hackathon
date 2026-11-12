# BreatheWise 90-Second Live Hackathon Demo Script

**Target Time:** 90 seconds (sharp, deliberate, evidence-led)
**URL:** Production deployment URL (or localhost:8000 for local demo)

---

### [00:00 – 00:15] Hook & Problem Setup
- **Action:** Open application landing page (`/`).
- **Spoken:**
  > *"Every winter across North India, millions of people wake up and go for a 7 AM run or send children to the park, believing early morning air is fresh. In reality, thermal inversions trap toxic particulates at ground level. BreatheWise doesn't tell people to stop living — it finds the cleanest window to breathe less pollution."*

---

### [00:15 – 00:35] Plan Experience (Delhi Hero & Window Finding)
- **Action:**
  1. Show Delhi selected by default (Live conditions card: ~80 µg/m³, Moderate).
  2. Click **Child** profile and **Kids Outdoor Play** activity.
  3. Point to the immediate recommendation card:
     - Recommended Window: **3:00 PM – 4:00 PM**
     - Exposure Avoided: **49% less PM2.5 inhaled** compared to 7 AM routine.
- **Spoken:**
  > *"Notice how the verdict dynamically adapts: a child's developing lungs scale thresholds by 1.4x. Our window finder shifts outdoor play from the morning inversion trap to mid-afternoon when atmospheric boundary layers mix, cutting inhaled particulate dose in half."*

---

### [00:35 – 00:55] Forecast Trajectory (Edward Tufte Visualization)
- **Action:**
  1. Click top navigation **Forecast** (`/forecast`).
  2. Hover over the 48-hour chart showing P50 median curve, shaded P10–P90 uncertainty band, and CPCB bands.
  3. Show the green recommended window box aligned with the afternoon dip.
- **Spoken:**
  > *"This isn't a static forecast. It's an adaptive gradient-boosted ensemble trained on 92 days of atmospheric history. It outputs calibrated P10 and P90 uncertainty bands beating persistence and seasonal baselines across all 48 hours."*

---

### [00:55 – 01:20] Proof & Scientific Accountability
- **Action:**
  1. Click **Proof** (`/proof`).
  2. Point to the headline MAE: **17.17 µg/m³** vs. Persistence **26.36 µg/m³** (34.9% error reduction).
  3. Scroll to the 30-Day Walk-Forward Simulation for Delhi: **42.6% mean exposure avoided** across 30 consecutive days, with 96.7% of days improved.
  4. Switch dropdown to **Mumbai** and highlight the transparent 9% result.
- **Spoken:**
  > *"We don't make unsubstantiated claims. We ran a strict 30-day walk-forward backtest simulating 5 AM daily planning with zero future-data leakage. In Delhi, users avoid 42.6% of PM2.5. And in clean coastal Mumbai, we honestly report lower savings because the air is already clean."*

---

### [01:20 – 01:30] Conclusion & Medical Grounding
- **Action:**
  1. Click **About** (`/about`) showing transparent CAMS model disclosures and medical disclaimers.
  2. Final closing statement.
- **Spoken:**
  > *"BreatheWise turns open atmospheric science into personal prevention. Thank you."*
