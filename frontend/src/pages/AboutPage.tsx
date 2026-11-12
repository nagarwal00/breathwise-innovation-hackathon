// About Screen — Product Explanation, Methodology, Data Sources & CPCB Thresholds (Muted Glassmorphism)
import { useState } from 'react'
import {
  ChevronDown,
  Cpu,
  Database,
  ExternalLink,
  Layers,
  Shield,
  Sparkles,
  Wind,
} from 'lucide-react'
import { CPCB_CATEGORIES_LIST, HEALTH_PROFILES } from '../api/types'
import { AqiBadge, SectionHeader } from '../components/ui'

const DATA_SOURCES = [
  {
    name: 'Open-Meteo Air Quality API',
    provider: 'Copernicus Atmosphere Monitoring Service (CAMS)',
    coverage: 'Global / India (11 km grid resolution)',
    parameters: 'PM2.5, PM10, European AQI, Dust, Carbon Monoxide',
    limitation:
      'Modelled atmospheric reanalysis and chemical transport forecasts, not direct localized street-level monitoring station readings.',
    link: 'https://open-meteo.com/en/docs/air-quality-api',
  },
  {
    name: 'Open-Meteo Weather Forecast API',
    provider: 'ECMWF IFS & National Weather Services',
    coverage: 'Global High Resolution',
    parameters: 'Wind speed/direction, boundary layer height, temperature, relative humidity, surface pressure',
    limitation:
      'Boundary layer height is model-derived; micro-scale inversion dissipation may vary by ±1 hour.',
    link: 'https://open-meteo.com/en/docs',
  },
  {
    name: 'Open-Meteo Geocoding Service',
    provider: 'OpenStreetMap Contributors (ODbL)',
    coverage: 'All Indian States and Union Territories',
    parameters: 'Coordinates (latitude, longitude), administrative district, population, elevation',
    limitation: 'Search query rate-limits apply; preset monitored cities bypass live geocoding lookups.',
    link: 'https://open-meteo.com/en/docs/geocoding-api',
  },
]

export default function AboutPage() {
  const [methodologyOpen, setMethodologyOpen] = useState<'dose' | 'windows' | 'ml' | null>('dose')

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10 text-slate-100">
      {/* Product Hero */}
      <section className="text-center space-y-3 py-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#3E8E7E]/15 border border-[#3E8E7E]/30 text-[#B2DDD6] text-xs font-semibold rounded-full uppercase tracking-wider font-sans">
          <Wind className="w-3.5 h-3.5 text-[#6bb3a7]" aria-hidden="true" />
          <span>Scientific Air Quality Planning</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-normal text-white tracking-tight">
          Breathe Less Pollution, Not Less Fresh Air.
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed font-sans">
          BreatheWise is a personal air-quality exposure planner for Indian metropolitan basins. By combining
          numerical weather predictions with health vulnerability modeling, it pinpoints when outdoor air is cleanest
          for exercise, children’s play, and daily commuting.
        </p>
      </section>

      {/* 3-STEP EXPLANATION */}
      <section className="space-y-4">
        <SectionHeader
          title="How BreatheWise Works in 3 Steps"
          subtitle="Turning probabilistic atmospheric models into clear, actionable daily schedules."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 relative flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-xl bg-[#3E8E7E]/20 border border-[#3E8E7E]/30 text-[#B2DDD6] font-sans font-bold text-sm flex items-center justify-center mb-3 shadow-xs">
                1
              </div>
              <h3 className="font-bold text-white text-base mb-1.5 flex items-center gap-2 font-sans">
                <Database className="w-4 h-4 text-[#6bb3a7]" aria-hidden="true" />
                <span>Fetch & Forecast</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Ingests 92-hour atmospheric histories and 48-hour forward meteorological predictions from CAMS. An
                adaptive ensemble machine-learning model computes P10/P50/P90 PM2.5 trajectories.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11px] font-sans text-[#B2DDD6] font-semibold">
              48-hour forward horizon
            </div>
          </div>

          <div className="glass-card p-6 relative flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-xl bg-[#3E8E7E]/20 border border-[#3E8E7E]/30 text-[#B2DDD6] font-sans font-bold text-sm flex items-center justify-center mb-3 shadow-xs">
                2
              </div>
              <h3 className="font-bold text-white text-base mb-1.5 flex items-center gap-2 font-sans">
                <Layers className="w-4 h-4 text-[#6bb3a7]" aria-hidden="true" />
                <span>Profile & Dose Math</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Air quality impacts differ by vulnerability. Your selected profile scales thresholds by 1.0× to 1.6×,
                calculating inhaled particulate mass dose (D = PM2.5 × Ventilation Rate × Duration).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11px] font-sans text-[#B2DDD6] font-semibold">
              6 clinical sensitivity tiers
            </div>
          </div>

          <div className="glass-card p-6 relative flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-xl bg-[#3E8E7E]/20 border border-[#3E8E7E]/30 text-[#B2DDD6] font-sans font-bold text-sm flex items-center justify-center mb-3 shadow-xs">
                3
              </div>
              <h3 className="font-bold text-white text-base mb-1.5 flex items-center gap-2 font-sans">
                <Cpu className="w-4 h-4 text-[#6bb3a7]" aria-hidden="true" />
                <span>Optimize Window</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                The window search engine filters candidate time slots within allowed daily hours, ranking them by
                risk-adjusted particulate concentration to highlight the cleanest slots and flag nocturnal inversion spikes.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11px] font-sans text-[#B2DDD6] font-semibold">
              Top-3 non-overlapping windows
            </div>
          </div>
        </div>
      </section>

      {/* CPCB THRESHOLD REFERENCE TABLE */}
      <section className="space-y-4">
        <SectionHeader
          title="CPCB National Ambient Air Quality Scale"
          subtitle="India's Central Pollution Control Board standard 24-hour PM2.5 breakpoints and health statements."
        />

        <div className="glass-card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left" aria-label="CPCB AQI Category reference table">
              <thead className="border-b border-white/[0.08] text-slate-300 font-semibold uppercase tracking-wider text-[10px] bg-white/[0.02]">
                <tr>
                  <th scope="col" className="py-3 px-4">
                    Category
                  </th>
                  <th scope="col" className="py-3 px-4">
                    PM2.5 Breakpoint
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Clinical Health Guidance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {CPCB_CATEGORIES_LIST.map((cat) => (
                  <tr key={cat.label} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-medium whitespace-nowrap">
                      <AqiBadge category={cat.label} size="md" />
                    </td>
                    <td className="py-3 px-4 font-sans font-bold tabular-nums text-white whitespace-nowrap">
                      {cat.range} <span className="text-[11px] font-normal text-slate-400">µg/m³</span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 leading-relaxed font-sans">{cat.healthText}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* HEALTH PROFILES & SENSITIVITY MULTIPLIERS */}
      <section className="space-y-4">
        <SectionHeader
          title="Clinical Health Profile Tiers"
          subtitle="Threshold scaling factors and physiological rationale derived from environmental epidemiology."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(HEALTH_PROFILES).map((prof) => (
            <div key={prof.id} className="glass-card p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="font-semibold text-sm text-white font-sans">{prof.label}</h4>
                  <span className="text-xs font-sans font-bold tabular-nums text-[#B2DDD6] bg-[#3E8E7E]/20 px-2.5 py-0.5 rounded-full border border-[#3E8E7E]/30">
                    {prof.sensitivityFactor}× Sensitivity
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{prof.shortDesc}</p>
              </div>
              <p className="text-[11px] text-[#B2DDD6]/80 font-sans tabular-nums mt-3 pt-2 border-t border-white/[0.06]">
                Effective Exercise Limit: {(60 / prof.sensitivityFactor).toFixed(0)} µg/m³
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* METHODOLOGY PROGRESSIVE DISCLOSURE (ACCORDIONS) */}
      <section className="space-y-4">
        <SectionHeader
          title="Deep-Dive Methodology"
          subtitle="Mathematical formulation and architectural details."
        />

        <div className="space-y-3">
          {/* Dose Formulation */}
          <div className="border border-white/10 rounded-2xl overflow-hidden glass-card p-0">
            <button
              type="button"
              onClick={() => setMethodologyOpen(methodologyOpen === 'dose' ? null : 'dose')}
              className="w-full p-4 text-left flex items-center justify-between text-sm font-semibold text-white bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
            >
              <span className="flex items-center gap-2 font-sans">
                <Sparkles className="w-4 h-4 text-[#6bb3a7]" aria-hidden="true" />
                <span>1. Inhalation Dose & Exposure Avoidance Formula</span>
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${methodologyOpen === 'dose' ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>
            {methodologyOpen === 'dose' && (
              <div className="p-4 text-xs text-slate-300 space-y-2 border-t border-white/10 leading-relaxed font-sans bg-black/20">
                <p>
                  Cumulative inhaled particulate mass dose (D) over activity duration (t minutes):
                </p>
                <div className="p-3 bg-white/[0.04] border border-white/8 rounded-xl font-sans font-medium text-[12px] text-[#B2DDD6] overflow-x-auto">
                  D = Mean_PM2.5 (µg/m³) × Ventilation_Rate (m³/h) × (Duration_Min / 60)
                </div>
                <p>
                  Ventilation rates (V_E) from standard pulmonary physiology:
                  <br />• <strong className="text-white">Exercise:</strong> 2.5 m³/h
                  <br />• <strong className="text-white">Commute:</strong> 1.2 m³/h
                  <br />• <strong className="text-white">Kids Play:</strong> 1.8 m³/h
                  <br />• <strong className="text-white">Home Ventilation:</strong> 1.0 m³/h
                </p>
                <p>
                  <strong className="text-white">Exposure Avoidance Percentage</strong> compared against routine time:
                </p>
                <div className="p-3 bg-white/[0.04] border border-white/8 rounded-xl font-sans font-medium text-[12px] text-[#B2DDD6]">
                  Avoided_% = max(0, ((Routine_Dose - Recommended_Dose) / Routine_Dose) × 100)
                </div>
              </div>
            )}
          </div>

          {/* Window Search Optimization */}
          <div className="border border-white/10 rounded-2xl overflow-hidden glass-card p-0">
            <button
              type="button"
              onClick={() => setMethodologyOpen(methodologyOpen === 'windows' ? null : 'windows')}
              className="w-full p-4 text-left flex items-center justify-between text-sm font-semibold text-white bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
            >
              <span className="flex items-center gap-2 font-sans">
                <Layers className="w-4 h-4 text-[#6bb3a7]" aria-hidden="true" />
                <span>2. Window Search Optimization Engine</span>
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${methodologyOpen === 'windows' ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>
            {methodologyOpen === 'windows' && (
              <div className="p-4 text-xs text-slate-300 space-y-2 border-t border-white/10 leading-relaxed font-sans bg-black/20">
                <p>
                  Candidate windows are evaluated with rolling moving averages matching the requested duration within allowed hours.
                  Ranked by risk-adjusted concentration:
                </p>
                <div className="p-3 bg-white/[0.04] border border-white/8 rounded-xl font-sans font-medium text-[12px] text-[#B2DDD6]">
                  m_adj = Mean_P50 + 0.35 × (Mean_P90 - Mean_P50)
                </div>
                <p>
                  Penalizes periods with high forecast volatility, prioritizing stable clean air over erratic spikes.
                </p>
              </div>
            )}
          </div>

          {/* ML Adaptive Ensemble Architecture */}
          <div className="border border-white/10 rounded-2xl overflow-hidden glass-card p-0">
            <button
              type="button"
              onClick={() => setMethodologyOpen(methodologyOpen === 'ml' ? null : 'ml')}
              className="w-full p-4 text-left flex items-center justify-between text-sm font-semibold text-white bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
            >
              <span className="flex items-center gap-2 font-sans">
                <Cpu className="w-4 h-4 text-[#6bb3a7]" aria-hidden="true" />
                <span>3. Machine Learning Adaptive Forecast Ensemble</span>
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${methodologyOpen === 'ml' ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>
            {methodologyOpen === 'ml' && (
              <div className="p-4 text-xs text-slate-300 space-y-2 border-t border-white/10 leading-relaxed font-sans bg-black/20">
                <p>
                  The model blends a gradient-boosted tree (HistGradientBoostingRegressor) with persistence and diurnal
                  seasonal naive baselines using horizon-adaptive decay weights:
                </p>
                <div className="p-3 bg-white/[0.04] border border-white/8 rounded-xl font-sans font-medium text-[12px] text-[#B2DDD6]">
                  y_hat(h) = w_ml(h)·y_gbm + w_pers(h)·y_persistence + w_seas(h)·y_seasonal
                </div>
                <p>
                  • <strong className="text-white">1–6h horizon:</strong> Higher persistence weight (0.25) leverages near-term inertia.
                  <br />• <strong className="text-white">7–24h horizon:</strong> Balanced ML (0.65) + seasonal diurnal recurrence (0.25).
                  <br />• <strong className="text-white">25–48h horizon:</strong> Dominated by meteorological ML features (0.75).
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* DATA SOURCES & LIMITATIONS TABLE */}
      <section className="space-y-4">
        <SectionHeader
          title="Data Sources & Limitations"
          subtitle="Disclosure of underlying environmental APIs and model boundaries."
        />

        <div className="space-y-3">
          {DATA_SOURCES.map((ds, idx) => (
            <div key={idx} className="glass-card p-5">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-2">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#6bb3a7] shrink-0" aria-hidden="true" />
                  <h4 className="font-semibold text-sm text-white font-sans">{ds.name}</h4>
                  <a
                    href={ds.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-[#6bb3a7] hover:text-[#B2DDD6] hover:underline inline-flex items-center gap-0.5"
                  >
                    API Docs <ExternalLink className="w-3 h-3" aria-hidden="true" />
                  </a>
                </div>
                <span className="text-[11px] text-slate-400 font-sans">{ds.provider}</span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300 font-sans">
                <p>
                  <strong className="text-white">Parameters:</strong> {ds.parameters}
                </p>
                <p>
                  <strong className="text-white">Coverage:</strong> {ds.coverage}
                </p>
                <div className="p-3 bg-[#C2934D]/10 border border-[#C2934D]/30 rounded-xl text-[#EED9B8] text-[11px] mt-2 font-sans">
                  <strong className="text-[#EED9B8]">Model Limitation:</strong> {ds.limitation}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PROJECT ARCHITECTURE & ENGINEERING TEAM */}
      <section className="space-y-4">
        <SectionHeader
          title="Project Architecture & Engineering Team"
          subtitle="Equal technical co-leadership designed, built, and evaluated for the Innovate Hackathon 2026."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Nistha Agarwal — Co-Architect & Systems Lead */}
          <div className="glass-card-elevated p-6 sm:p-7 border-[#3E8E7E]/40 relative overflow-hidden ring-1 ring-[#3E8E7E]/30 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#3E8E7E]/15 border border-[#3E8E7E]/30 text-[#B2DDD6] rounded-full text-[10px] font-bold uppercase tracking-wider font-sans mb-1.5">
                    <Sparkles className="w-3 h-3 text-[#6bb3a7]" />
                    <span>Co-Architect & Systems Lead</span>
                  </span>
                  <h4 className="text-2xl font-serif font-medium text-white tracking-tight">
                    Nistha Agarwal
                  </h4>
                  <p className="text-xs text-[#6bb3a7] font-sans font-semibold mt-0.5">
                    Atmospheric Physics, ML Ensemble & Optimization Architecture
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-[#3E8E7E]/20 border border-[#3E8E7E]/40 flex items-center justify-center text-[#B2DDD6] shrink-0">
                  <Sparkles className="w-5 h-5 text-[#6bb3a7]" />
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans mb-3">
                Co-led technical direction and core scientific algorithms: engineered the atmospheric boundary-layer physics simulation, predictive machine learning ensemble models, and the constrained window optimization algorithms.
              </p>

              <div className="space-y-2 pt-3 border-t border-white/[0.08]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-sans block">
                  Core Engineering Contributions:
                </span>
                <ul className="text-xs text-slate-300 space-y-1.5 font-sans">
                  <li className="flex items-start gap-2">
                    <span className="text-[#6bb3a7] font-bold">▪</span>
                    <span><strong>Atmospheric Physics Engine:</strong> Mathematical modeling of nocturnal radiation inversions, convective boundary layer depths, and ground particulate trapping.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#6bb3a7] font-bold">▪</span>
                    <span><strong>Predictive ML Ensemble:</strong> Built the gradient-boosted regression pipeline with horizon-adaptive decay weights and diurnal persistence baselines.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#6bb3a7] font-bold">▪</span>
                    <span><strong>Constrained Window Optimizer:</strong> Designed multi-objective search algorithms incorporating clinical dose multipliers and schedule penalty mathematics.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#6bb3a7] font-bold">▪</span>
                    <span><strong>Data Pipeline Integration:</strong> Engineered automated ingestion pipelines for Copernicus CAMS and Open-Meteo meteorological vectors.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Dhruv Gupta — Co-Architect & Systems Lead */}
          <div className="glass-card-elevated p-6 sm:p-7 border-[#3E8E7E]/40 relative overflow-hidden ring-1 ring-[#3E8E7E]/30 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#3E8E7E]/15 border border-[#3E8E7E]/30 text-[#B2DDD6] rounded-full text-[10px] font-bold uppercase tracking-wider font-sans mb-1.5">
                    <Cpu className="w-3 h-3 text-[#6bb3a7]" />
                    <span>Co-Architect & Systems Lead</span>
                  </span>
                  <h4 className="text-2xl font-serif font-medium text-white tracking-tight">
                    Dhruv Gupta
                  </h4>
                  <p className="text-xs text-[#6bb3a7] font-sans font-semibold mt-0.5">
                    Full-Stack Systems, Evaluation Harness & Dual-Mode UI
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-[#3E8E7E]/20 border border-[#3E8E7E]/40 flex items-center justify-center text-[#B2DDD6] shrink-0">
                  <Cpu className="w-5 h-5 text-[#6bb3a7]" />
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans mb-3">
                Co-led full-stack systems engineering and evaluation framework: engineered the 30-day walk-forward empirical validation harness, backend FastAPI architecture, and the high-contrast dual-mode visual systems.
              </p>

              <div className="space-y-2 pt-3 border-t border-white/[0.08]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-sans block">
                  Core Engineering Contributions:
                </span>
                <ul className="text-xs text-slate-300 space-y-1.5 font-sans">
                  <li className="flex items-start gap-2">
                    <span className="text-[#6bb3a7] font-bold">▪</span>
                    <span><strong>Walk-Forward Backtest Harness:</strong> Architected the 30-day out-of-sample empirical evaluation framework with zero future-data leakage benchmarking.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#6bb3a7] font-bold">▪</span>
                    <span><strong>FastAPI Backend & Caching:</strong> Engineered high-throughput asynchronous endpoints, in-memory TTL caching, and schema validation pipelines.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#6bb3a7] font-bold">▪</span>
                    <span><strong>Dual-Mode Visual Design System:</strong> Developed responsive glassmorphism interfaces, Recharts data graphics, and accessible color schemes.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#6bb3a7] font-bold">▪</span>
                    <span><strong>Testing & Release Harness:</strong> Implemented end-to-end integration test suites, automated health probes, and production build pipelines.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HEALTH DISCLAIMER */}
      <section className="p-5 glass-card space-y-2 text-xs text-slate-300 leading-relaxed shadow-sm">
        <h3 className="font-semibold text-white text-sm flex items-center gap-2 font-sans">
          <Shield className="w-4 h-4 text-[#6bb3a7]" aria-hidden="true" />
          <span>Notice Regarding Health Decisions</span>
        </h3>
        <p className="font-sans">
          BreatheWise is an environmental exposure planning tool built for educational and activity optimization purposes.
          It is not certified as a medical device. Always exercise personal discretion and consult your
          physician if you have asthma, coronary artery disease, or other chronic pulmonary conditions.
        </p>
      </section>

      {/* OPEN SOURCE & ATTRIBUTION CREDITS */}
      <section className="text-center text-xs text-slate-400 pt-4 pb-6 space-y-1 border-t border-white/[0.06]">
        <p className="font-medium text-slate-300">BreatheWise Prototype · INNOVATE Hackathon 2026</p>
        <p>Built with React, Vite, Tailwind CSS v4, Recharts, and FastAPI.</p>
        <p>
          Data © <a href="https://open-meteo.com" className="underline hover:text-white">Open-Meteo</a> (CC BY 4.0)
          via Copernicus CAMS. Geocoding data © <a href="https://www.openstreetmap.org/copyright" className="underline hover:text-white">OpenStreetMap contributors</a> (ODbL).
        </p>
      </section>
    </main>
  )
}
