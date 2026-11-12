# BreatheWise Design System — Muted Atmospheric Glassmorphism

## 1. Design Read & Calibrated Dials

```yaml
Design Read:
  artifact: responsive web application / exposure-optimization dashboard (BreatheWise)
  audience: urban Indian residents (Delhi NCR, Lucknow, Mumbai, etc.) seeking actionable, calm scheduling
  visual-language: atmospheric hybrid mist & frosted glassmorphism, muted organic mineral tones, editorial typography
  mode: redesign · overhaul
  visual-variance: 7       # Distinctive, elegant, non-generic identity with bespoke typography & glass layers
  motion-intensity: 3      # Restrained, subtle transitions (180ms–240ms); zero jumpy or erratic animations
  information-density: 6   # High data density without visual crowding; clear breathing room
  asset-dependence: 3      # High-craft custom SVG diagrams, typography, and frosted glass textures
  brand-fidelity: 9        # Strict adherence to CPCB & WHO air quality standards and clinical multipliers
```

### Four Positioning Questions
1. **Narrative Role**: A serene, authoritative atmospheric companion that replaces air quality anxiety with empowering, actionable daily schedules.
2. **Viewing Distance**: Laptop and mobile viewports (10cm–1m). Requires clean optical typography, generous letter-spacing on labels, and zero collision in the navigation bar.
3. **Visual Temperature**: Meditative, calm, sophisticated. Soft twilight slate mist with desaturated mineral tones (pine sage, warm sandstone, dusty ochre, muted terracotta).
4. **Capacity Check**: The navigation bar is condensed into a floating frosted glass pill bar with concise labels (`Home`, `Planner`, `Forecast`, `Proof`, `About`), ensuring zero element collisions across all standard desktop, laptop, and tablet viewports.

---

## 2. Selected Visual Direction & Aesthetics

**Hybrid "Atmospheric Slate & Pearl Glassmorphism"**:
- **Neither pitch-black nor stark-white**: An atmospheric twilight ground (`#0B0F17` transitioning into `#111827`) layered with semi-translucent frosted glass surfaces (`rgba(17, 24, 39, 0.65)` to `rgba(30, 41, 59, 0.55)`).
- **Glass Specular Hairlines**: Subtle frosted glass borders (`1px solid rgba(255, 255, 255, 0.09)`) paired with inner specular rim lighting (`box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12)`).
- **Muted, Grounded Colors**: High-saturation neons are replaced with calm, desaturated mineral tones that protect against visual fatigue.

---

## 3. Typography Scheme

| Role | Font Family | Weights / Style | Purpose |
|---|---|---|---|
| **Editorial Headlines & Pull-Quotes** | `Newsreader` (Google Fonts) | Regular, SemiBold, Italic | Breathes warmth, literary authority, and refined editorial elegance; eliminates generic AI appearance. |
| **Interface, Controls, Body** | `Instrument Sans` (Google Fonts) | Regular (400), Medium (500), SemiBold (600) | Ultra-clean, modern grotesque with balanced geometry and exceptional legibility at small sizes. |
| **Tabular Numbers & Timestamps** | `JetBrains Mono` (Google Fonts) | Regular (400), Medium (500) | Accurate monospaced alignment for PM2.5 readings, coordinates, and hours. |

---

## 4. Color Palette Tokens

### Atmospheric Ground & Frosted Glass Surfaces
- **Ground Twilight**: `#0B0F17` to `#111827` (subtle radial mist of `#1E293B` and desaturated pine)
- **Glass Panel**: `rgba(18, 26, 43, 0.60)` with `backdrop-filter: blur(20px)`
- **Glass Panel Elevated**: `rgba(26, 36, 56, 0.65)` with `backdrop-filter: blur(24px)`
- **Glass Nav Pill**: `rgba(15, 23, 42, 0.75)` with `backdrop-filter: blur(20px)` and `border: 1px solid rgba(255, 255, 255, 0.1)`
- **Specular Highlight**: `inset 0 1px 0 rgba(255, 255, 255, 0.12)`

### Muted Semantic AQI Palette (Desaturated, Earthy, Non-Jumpy)
| Category | Range | Muted Accent | Glass Pill Background | Pearl Text Tint |
|---|---|---|---|---|
| **Good** | 0 – 30 | Sage Pine `#3E8E7E` | `rgba(62, 142, 126, 0.15)` | `#B2DDD6` |
| **Satisfactory** | 31 – 60 | Olive Herb `#6B8E5F` | `rgba(107, 142, 95, 0.15)` | `#CFE2C8` |
| **Moderate** | 61 – 90 | Warm Sandstone `#C2934D` | `rgba(194, 147, 77, 0.15)` | `#EED9B8` |
| **Poor** | 91 – 120 | Dusty Ochre `#BA7347` | `rgba(186, 115, 71, 0.15)` | `#F4D3C2` |
| **Very Poor** | 121 – 250 | Muted Terracotta `#B35656` | `rgba(179, 86, 86, 0.18)` | `#F2C8C8` |
| **Severe** | 250+ | Muted Portwine `#80353F` | `rgba(128, 53, 63, 0.22)` | `#E4B1B7` |

### Ink & Neutral Text
- **Ink Primary**: `#F1F5F9` (Soft mist off-white; zero blinding glare)
- **Ink Secondary**: `#94A3B8` (Refined cool slate)
- **Ink Tertiary**: `#64748B` (Muted dusk)
- **Border Default**: `rgba(255, 255, 255, 0.08)`
- **Border Interactive**: `rgba(255, 255, 255, 0.18)`

---

## 5. Navigation Bar Architecture (Zero-Collision Floating Glass Pill)

- **Structure**: A centered floating frosted glass container (`max-w-5xl mx-auto px-4 py-2.5 rounded-2xl`).
- **Brand Wordmark**: Subtle icon + `BreatheWise` in `Instrument Sans` with muted sage dot.
- **Links**: Concise, non-wrapping labels (`Home`, `Planner`, `Forecast`, `Proof`, `About`).
- **Right Utilities**: Compact pill language switcher (`EN | HI`) and a frosted glass `Launch App` button.
- **Responsiveness**: At viewports `< 860px`, primary links collapse cleanly without text clipping or overlapping controls.

---

## 6. Elevation, Glassmorphism & Shadow Hierarchy

1. **Elevation 1 (Glass Surface)**: `box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08)`
2. **Elevation 2 (Floating Nav & Hero Cards)**: `box-shadow: 0 12px 36px -8px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.12)`
3. **Elevation 3 (Dropdowns & Modals)**: `box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.16)`
4. **Interactive Focus**: `ring-1 ring-teal-500/40 border-teal-500/50`
