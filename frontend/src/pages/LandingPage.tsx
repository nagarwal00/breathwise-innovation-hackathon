// BreatheWise Content-Rich Landing Page — Muted Atmospheric Glassmorphism with Editorial Typography
import { Link } from 'react-router-dom'
import {
  Activity,
  AlertOctagon,
  ArrowRight,
  Baby,
  BarChart3,
  Clock,
  Heart,
  LineChart,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingDown,
} from 'lucide-react'
import { AtmosphericInversionGraphic } from '../components/graphics/AtmosphericInversionGraphic'
import { ExposureCurveGraphic } from '../components/graphics/ExposureCurveGraphic'
import { LungDepositionGraphic } from '../components/graphics/LungDepositionGraphic'
import { ZoomableGraphic } from '../components/ZoomModal'

const PROOF_POINTS = [
  { city: 'Delhi NCR', reduction: '42.6%', daysImproved: '96.7%', note: 'Severe winter inversion basin' },
  { city: 'Lucknow', reduction: '39.0%', daysImproved: '83.3%', note: 'Gangetic plains stagnation' },
  { city: 'Kolkata', reduction: '25.9%', daysImproved: '86.7%', note: 'Urban density & biomass transport' },
  { city: 'Bengaluru', reduction: '25.2%', daysImproved: '80.0%', note: 'Traffic and valley micro-climates' },
  { city: 'Mumbai', reduction: '9.0%', daysImproved: '60.0%', note: 'Honest clean coastal baseline' },
]

export default function LandingPage() {
  return (
    <div className="w-full text-slate-100 selection:bg-[#3E8E7E]/30 selection:text-[#B2DDD6]">
      {/* ── 1. HERO SECTION ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-white/[0.06]">
        {/* Subtle atmospheric mist */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[500px] bg-[#3E8E7E]/08 blur-[140px] pointer-events-none rounded-full"
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Mission Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 glass-pill text-[#B2DDD6] rounded-full text-xs font-semibold uppercase tracking-wider font-sans">
              <Sparkles className="w-3.5 h-3.5 text-[#6bb3a7]" aria-hidden="true" />
              <span>Personal Air-Quality Exposure Optimization</span>
            </div>

            {/* Editorial Headline with Newsreader Serif */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-normal tracking-tight text-white leading-[1.12]">
              Breathe Less Pollution, <br />
              <span className="italic font-normal text-[#B2DDD6]">
                Not Less Fresh Air.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-sans font-normal max-w-2xl mx-auto">
              Instead of passive AQI numbers that leave you anxious, BreatheWise turns 48-hour atmospheric forecasts
              into personal schedules — pinpointing the cleanest daily window to exercise, commute, and let children play outside.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to="/plan"
                className="w-full sm:w-auto px-8 py-3.5 bg-[#2D6A5F] hover:bg-[#3E8E7E] text-white font-semibold text-sm sm:text-base rounded-2xl border border-[#4E9B8D]/40 transition-all shadow-lg shadow-[#2D6A5F]/25 flex items-center justify-center gap-2 group"
              >
                <span>Launch Planner App</span>
                <ArrowRight className="w-4 h-4 text-[#B2DDD6] group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Link>
              <Link
                to="/forecast"
                className="w-full sm:w-auto px-7 py-3.5 glass-pill hover:bg-white/[0.10] text-slate-200 font-semibold text-sm sm:text-base rounded-2xl transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <LineChart className="w-4 h-4 text-[#6bb3a7]" aria-hidden="true" />
                <span>View 48h Forecast</span>
              </Link>
            </div>

            {/* Stat Pill Bar */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
              <div className="glass-card p-4 rounded-2xl">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block font-sans flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5 text-[#6bb3a7]" aria-hidden="true" />
                  <span>Delhi Reduction</span>
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-[#B2DDD6] font-sans tabular-nums mt-0.5 block">42.6%</span>
                <span className="text-[11px] text-slate-400 block font-sans">Less PM2.5 inhaled</span>
              </div>
              <div className="glass-card p-4 rounded-2xl">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block font-sans flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#CFE2C8]" aria-hidden="true" />
                  <span>Days Improved</span>
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-[#CFE2C8] font-sans tabular-nums mt-0.5 block">96.7%</span>
                <span className="text-[11px] text-slate-400 block font-sans">Cleaner than 7 AM</span>
              </div>
              <div className="glass-card p-4 rounded-2xl">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block font-sans flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                  <span>Forecast MAE</span>
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-white font-sans tabular-nums mt-0.5 block">17.17</span>
                <span className="text-[11px] text-slate-400 block font-sans">µg/m³ accuracy</span>
              </div>
              <div className="glass-card p-4 rounded-2xl">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block font-sans flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#EED9B8]" aria-hidden="true" />
                  <span>Horizon Depth</span>
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-[#EED9B8] font-sans tabular-nums mt-0.5 block">48 Hours</span>
                <span className="text-[11px] text-slate-400 block font-sans">P10–P90 calibrated</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. THE PROBLEM: THE MORNING INVERSION TRAP ─────────────────── */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#B35656]/15 border border-[#B35656]/30 text-[#F2C8C8] rounded-full text-xs font-semibold uppercase tracking-wider font-sans">
            <ShieldAlert className="w-3.5 h-3.5 text-[#B35656]" aria-hidden="true" />
            <span>Atmospheric Physics</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-normal text-white tracking-tight">
            Why Early Morning Jogs Are Often a Silent Hazard
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
            In winter across northern India, nocturnal ground temperature inversions trap tailpipe and combustion
            particulates beneath a shallow boundary layer, creating extreme morning pollution peaks.
          </p>
        </div>

        {/* Interactive Atmospheric Graphic */}
        <ZoomableGraphic
          title="Nocturnal Radiation Inversion & Boundary Layer Mechanics"
          subtitle="Surface Temperature Inversion vs. Solar Convective Mixing"
          caption="Solar heating after 10:00 AM breaks the inversion cap, diluting surface particulates by up to 50% across a 1,200m convective layer."
        >
          <AtmosphericInversionGraphic />
        </ZoomableGraphic>

        {/* Scientific Takeaways (Clean Layout Outside Graphic) */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto text-xs leading-relaxed text-slate-300">
          <div className="flex items-start gap-3 p-4 rounded-2xl glass-card">
            <AlertOctagon className="w-4 h-4 text-[#B35656] shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <strong className="text-white block font-sans text-sm mb-0.5">The Morning Inversion Trap</strong>
              Radiative ground cooling at night traps vehicular exhaust and particulates under a shallow cold-air lid,
              spiking surface PM2.5 right when people go outdoors for morning activities.
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-2xl glass-card border-[#3E8E7E]/30">
            <ShieldCheck className="w-4 h-4 text-[#6bb3a7] shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <strong className="text-white block font-sans text-sm mb-0.5">The Afternoon Ventilation Window</strong>
              Solar heating between 1:00 PM and 4:00 PM breaks the thermal inversion lid, driving vertical convective
              mixing that dilutes ground particulate concentrations by 30% to 50%.
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. QUANTIFIED CLINICAL IMPACT (EXPOSURE CURVE) ─────────────── */}
      <section className="py-16 sm:py-20 border-y border-white/[0.06] bg-black/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#3E8E7E]/15 border border-[#3E8E7E]/30 text-[#B2DDD6] rounded-full text-xs font-semibold uppercase tracking-wider font-sans">
                <Sparkles className="w-3.5 h-3.5 text-[#6bb3a7]" aria-hidden="true" />
                <span>The Science of Timing</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-serif font-normal text-white tracking-tight leading-snug">
                Timing Trumps Masks. Shifting 3 Hours Cuts PM2.5 in Half.
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                Ground-level PM2.5 concentrations peak at night and during early mornings. By afternoon, solar heating
                disperses particulates into a 1,200m deep boundary layer. Moving your outdoor run from 7 AM to 3 PM
                reduces inhaled mass by up to <strong className="text-[#B2DDD6]">42.6%</strong> without extra equipment.
              </p>

              <div className="pt-2">
                <Link
                  to="/proof"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#6bb3a7] hover:text-[#B2DDD6] transition-colors"
                >
                  <span>Explore the 30-Day Empirical Proof</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7">
              <ZoomableGraphic
                title="Diurnal Exposure Curve & Inhaled PM2.5 Mass"
                subtitle="Concentration vs. Inhaled Dose across typical winter day"
                caption="Moving a 60-minute outdoor workout from 07:00 to 15:00 achieves a 42.6% reduction in inhaled particulate mass."
              >
                <ExposureCurveGraphic />
              </ZoomableGraphic>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. PHYSIOLOGICAL BASIS & VULNERABILITY TIERS ───────────────── */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <ZoomableGraphic
              title="Aerosol Penetration & Respiratory Deposition Depth"
              subtitle="Comparison of PM10, PM2.5, and PM0.1 cellular penetration mechanics"
              caption="Sub-2.5µm particles cross the alveolar-capillary barrier into systemic circulation, elevating cardiovascular mortality risk."
            >
              <LungDepositionGraphic />
            </ZoomableGraphic>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#6B8E5F]/15 border border-[#6B8E5F]/30 text-[#CFE2C8] rounded-full text-xs font-semibold uppercase tracking-wider font-sans">
              <Heart className="w-3.5 h-3.5 text-[#6B8E5F]" aria-hidden="true" />
              <span>Clinical Sensitivity</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif font-normal text-white tracking-tight leading-snug">
              Every Body Breathes Differently.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              Standard apps give one generic AQI number. BreatheWise applies clinical dose multipliers for
              respiratory intake and vulnerability profiles:
            </p>
            <ul className="text-xs space-y-2.5 text-slate-300 font-sans">
              <li className="flex items-center gap-2.5 p-2 rounded-xl glass-pill">
                <Baby className="w-4 h-4 text-[#CFE2C8] shrink-0" aria-hidden="true" />
                <span><strong className="text-white">Child (1.4×):</strong> Higher minute ventilation per kg and developing airways.</span>
              </li>
              <li className="flex items-center gap-2.5 p-2 rounded-xl glass-pill">
                <Heart className="w-4 h-4 text-[#F2C8C8] shrink-0" aria-hidden="true" />
                <span><strong className="text-white">Respiratory/Cardiac (1.6×):</strong> Reactive airways and elevated inflammation risk.</span>
              </li>
              <li className="flex items-center gap-2.5 p-2 rounded-xl glass-pill">
                <ShieldAlert className="w-4 h-4 text-[#EED9B8] shrink-0" aria-hidden="true" />
                <span><strong className="text-white">Outdoor Worker (1.3×):</strong> Prolonged shift accumulation during traffic hours.</span>
              </li>
            </ul>

            <div className="pt-2">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#6bb3a7] hover:text-[#B2DDD6] transition-colors"
              >
                <span>Read Clinical Methodology & Thresholds</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. EMPIRICAL BACKTEST SUMMARY (5 CITIES) ────────────────────── */}
      <section className="py-16 sm:py-20 border-t border-white/[0.06] bg-black/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#3E8E7E]/15 border border-[#3E8E7E]/30 text-[#B2DDD6] rounded-full text-xs font-semibold uppercase tracking-wider font-sans">
              <BarChart3 className="w-3.5 h-3.5 text-[#6bb3a7]" aria-hidden="true" />
              <span>Walk-Forward Backtesting</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif font-normal text-white tracking-tight">
              Tested on 30 Consecutive Real-World Days
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed font-sans">
              Simulated user consultations at 05:00 IST every morning with zero future knowledge,
              empirically evaluated against ground stations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {PROOF_POINTS.map((pt) => (
              <div
                key={pt.city}
                className="glass-card p-4 rounded-2xl flex flex-col justify-between hover:border-[#3E8E7E]/50 transition-all"
              >
                <div>
                  <h4 className="font-semibold text-sm text-white mb-1 font-sans">{pt.city}</h4>
                  <p className="text-[11px] text-slate-400 leading-tight mb-3 font-sans">{pt.note}</p>
                </div>
                <div>
                  <div className="text-2xl font-bold font-sans tabular-nums text-[#B2DDD6]">
                    {pt.reduction}
                  </div>
                  <span className="text-[11px] font-medium text-slate-300 block font-sans">Inhaled PM2.5 Avoided</span>
                  <span className="text-[10px] text-[#CFE2C8] font-sans tabular-nums mt-0.5 block">{pt.daysImproved} Days Cleaner</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-2">
            <Link
              to="/proof"
              className="glass-pill inline-flex items-center gap-2 px-5 py-2.5 text-white text-xs font-semibold rounded-2xl hover:bg-white/[0.10] transition-all shadow-xs"
            >
              <BarChart3 className="w-4 h-4 text-[#6bb3a7]" aria-hidden="true" />
              <span>Inspect Full Multi-City Backtest Charts & Accuracy</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 6. FINAL CALL TO ACTION ────────────────────────────────────── */}
      <section className="py-20 relative overflow-hidden border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-serif font-normal tracking-tight text-white">
            Start Planning Around Clean Air Today.
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed font-sans">
            Free, open-source, and powered by Copernicus CAMS atmospheric models. Find your cleanest window in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/plan"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#2D6A5F] hover:bg-[#3E8E7E] text-white font-semibold text-sm sm:text-base rounded-2xl border border-[#4E9B8D]/40 transition-all shadow-lg shadow-[#2D6A5F]/30"
            >
              Open the Interactive Planner
            </Link>
            <Link
              to="/about"
              className="w-full sm:w-auto px-7 py-3.5 glass-pill hover:bg-white/[0.10] text-slate-200 font-semibold text-sm sm:text-base rounded-2xl transition-colors"
            >
              How It Works & Methodology
            </Link>
          </div>

          <p className="text-[11px] text-slate-400 pt-4 font-sans">
            CPCB AQI Scale Standards · 48-Hour Atmospheric Forecasts
          </p>
        </div>
      </section>
    </div>
  )
}
