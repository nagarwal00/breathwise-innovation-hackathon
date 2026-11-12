// Plan Screen — Primary Decision Surface for BreatheWise (Muted Atmospheric Glassmorphism)
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  AlertTriangle,
  Clock,
  Home,
  Info,
  RefreshCw,
  Sliders,
  Sparkles,
  Zap,
} from 'lucide-react'
import { fetchCurrent, fetchPlan } from '../api'
import type { PlanRequest, PlanResponse } from '../api/types'
import {
  ACTIVITIES,
  HEALTH_PROFILES,
  aqiColor,
  getDefaultActivityForProfile,
  isActivityAllowedForProfile,
} from '../api/types'
import { LocationSearch, type SelectedLocation } from '../components/LocationSearch'
import { ActivitySelector, ProfileSelector } from '../components/Selectors'
import {
  AqiBadge,
  Card,
  CopySummaryButton,
  DataStatusChip,
  ErrorCard,
  InfoTooltip,
  OfflineBanner,
  ShareButton,
  Skeleton,
  TrendIndicator,
} from '../components/ui'

function formatTimeOnly(timeStr: string) {
  if (!timeStr) return ''
  if (/^\d{2}:\d{2}$/.test(timeStr)) {
    const [h, m] = timeStr.split(':').map(Number)
    const period = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 === 0 ? 12 : h % 12
    return `${h12}:${m.toString().padStart(2, '0')} ${period}`
  }
  try {
    const d = new Date(timeStr)
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata',
      hour12: true,
    })
  } catch {
    return timeStr
  }
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone: 'Asia/Kolkata',
    })
  } catch {
    return ''
  }
}

export default function PlanPage({ language = 'en' }: { language?: 'en' | 'hi' }) {
  const [searchParams, setSearchParams] = useSearchParams()

  // State from URL or defaults
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null)
  const [profile, setProfile] = useState<string>(searchParams.get('profile') ?? 'healthy_adult')
  const [activity, setActivity] = useState<string>(searchParams.get('activity') ?? 'morning_commute')

  // Constraints & Customization
  const [durationMin, setDurationMin] = useState<number>(45)
  const [allowedStart, setAllowedStart] = useState<string>('07:00')
  const [allowedEnd, setAllowedEnd] = useState<string>('11:00')
  const [usualStart, setUsualStart] = useState<string>('08:30')
  const [scheduleFlexibility, setScheduleFlexibility] = useState<'strict' | 'moderate' | 'flexible'>('moderate')
  const [customiseOpen, setCustomiseOpen] = useState(false)

  // Smart activity change handler synchronizes realistic practical bounds
  const handleActivityChange = (newActId: string) => {
    setActivity(newActId)
    const actDef = ACTIVITIES[newActId]
    if (actDef) {
      setUsualStart(actDef.defaultUsualStart)
      setAllowedStart(actDef.practicalWindowStart)
      setAllowedEnd(actDef.practicalWindowEnd)
      if (newActId === 'outdoor_work') setDurationMin(180)
      else if (newActId === 'ventilate_home' || newActId === 'school_transit') setDurationMin(30)
      else if (newActId === 'kids_play' || newActId === 'exercise_running') setDurationMin(60)
      else setDurationMin(45)
    }
  }

  // Profile change automatically ensures only physically and clinically feasible activities are selected
  const handleProfileChange = (newProfileId: string) => {
    setProfile(newProfileId)
    if (!isActivityAllowedForProfile(newProfileId, activity)) {
      const fallbackActId = getDefaultActivityForProfile(newProfileId)
      handleActivityChange(fallbackActId)
    }
  }

  // Sync URL query parameters
  useEffect(() => {
    const params = new URLSearchParams()
    if (selectedLocation?.cityId) {
      params.set('city', selectedLocation.cityId)
    }
    params.set('profile', profile)
    params.set('activity', activity)
    setSearchParams(params, { replace: true })
  }, [selectedLocation, profile, activity, setSearchParams])

  // Current Air Quality Observation Query
  const {
    data: currentAQ,
    isLoading: currentLoading,
    isFetching: currentFetching,
    error: currentError,
    refetch: refetchCurrent,
  } = useQuery({
    queryKey: ['currentAQ', selectedLocation?.lat, selectedLocation?.lon, profile],
    queryFn: () => fetchCurrent(selectedLocation!.lat, selectedLocation!.lon, profile),
    enabled: selectedLocation !== null,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  })

  // Full Recommendation Plan Query
  const planPayload: PlanRequest | null = useMemo(() => {
    if (!selectedLocation) return null
    return {
      lat: selectedLocation.lat,
      lon: selectedLocation.lon,
      profile,
      activity,
      duration_min: durationMin,
      allowed_start: allowedStart,
      allowed_end: allowedEnd,
      usual_start: usualStart,
      schedule_flexibility: scheduleFlexibility,
      language,
    }
  }, [selectedLocation, profile, activity, durationMin, allowedStart, allowedEnd, usualStart, scheduleFlexibility, language])

  const {
    data: plan,
    isLoading: planLoading,
    isFetching: planFetching,
    error: planError,
    refetch: refetchPlan,
  } = useQuery<PlanResponse, Error>({
    queryKey: ['plan', planPayload],
    queryFn: () => fetchPlan(planPayload!),
    enabled: planPayload !== null,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  })

  // Format shareable summary text
  const shareableSummary = useMemo(() => {
    if (!plan || !plan.best_windows || plan.best_windows.length === 0) return ''
    const best = plan.best_windows[0]
    return `BreatheWise Plan for ${plan.location.name}:
• Best Window: ${formatTimeOnly(best.start)} – ${formatTimeOnly(best.end)} (${best.category}, ${best.mean_pm25.toFixed(1)} µg/m³)
• Exposure Avoided: ${plan.exposure.avoided_pct.toFixed(0)}% less PM2.5 vs usual ${formatTimeOnly(plan.usual_window.start)}
• Advice: ${plan.advice}
Generated at ${formatTimeOnly(plan.generated_at)} IST | Data: ${plan.data_status.source}
Disclaimer: For informational guidance only. Not medical advice.`
  }, [plan])

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 text-slate-100">
      {/* Offline Alert ONLY if upstream request failed and fell back to offline snapshot */}
      {plan?.data_status.is_fallback && (
        <OfflineBanner cachedAt={plan.data_status.cached_at} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── Left Column: Configuration Controls (lg:col-span-5) ──────── */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
              <h1 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-sans">
                <Sparkles className="w-3.5 h-3.5 text-[#6bb3a7]" aria-hidden="true" />
                <span>Plan Parameters</span>
              </h1>
              <div className="flex items-center gap-1.5">
                <ShareButton />
              </div>
            </div>

            {/* Location Selector */}
            <LocationSearch
              selectedLocation={selectedLocation}
              onLocationSelect={setSelectedLocation}
            />

            {/* Profile Selector */}
            <ProfileSelector
              selectedProfile={profile}
              onProfileChange={handleProfileChange}
            />

            {/* Activity Selector (Reloaded dynamically per individual profile) */}
            <ActivitySelector
              selectedActivity={activity}
              onActivityChange={handleActivityChange}
              selectedProfile={profile}
            />

            {/* Customise Constraints Accordion */}
            <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/20">
              <button
                type="button"
                onClick={() => setCustomiseOpen(!customiseOpen)}
                className="w-full flex items-center justify-between p-3.5 hover:bg-white/[0.04] text-xs font-semibold text-slate-200 transition-colors"
                aria-expanded={customiseOpen}
              >
                <span className="flex items-center gap-2 font-sans">
                  <Sliders className="w-3.5 h-3.5 text-[#6bb3a7]" aria-hidden="true" />
                  <span>Customise Routine & Hours</span>
                </span>
                <span className="text-[11px] text-[#B2DDD6] font-sans font-medium tabular-nums">
                  {durationMin}m · Usual: {formatTimeOnly(usualStart)}
                </span>
              </button>

              {customiseOpen && (
                <div className="p-4 bg-black/30 space-y-4 text-xs border-t border-white/10">
                  {/* Duration Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="duration-slider" className="font-medium text-slate-300 font-sans">
                        Activity Duration
                      </label>
                      <span className="font-sans font-bold tabular-nums text-[#B2DDD6]">{durationMin} minutes</span>
                    </div>
                    <input
                      id="duration-slider"
                      type="range"
                      min={15}
                      max={240}
                      step={15}
                      value={durationMin}
                      onChange={(e) => setDurationMin(Number(e.target.value))}
                      className="w-full accent-[#3E8E7E] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-sans tabular-nums mt-0.5">
                      <span>15 min</span>
                      <span>1 hr</span>
                      <span>2 hr</span>
                      <span>4 hr</span>
                    </div>
                  </div>

                  {/* Usual Start Time */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="usual-time" className="font-medium text-slate-300 font-sans">
                        Usual Outdoor Time
                      </label>
                      <span className="text-[11px] text-slate-400 font-sans">Baseline</span>
                    </div>
                    <input
                      id="usual-time"
                      type="time"
                      value={usualStart}
                      onChange={(e) => setUsualStart(e.target.value)}
                      className="w-full px-3 py-2 glass-input rounded-xl text-xs font-sans tabular-nums text-white focus:ring-1 focus:ring-[#4E9B8D] focus:border-[#4E9B8D]"
                    />
                  </div>

                  {/* Schedule Flexibility Selector */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="font-medium text-slate-300 font-sans text-xs">
                        Routine Shift Flexibility
                      </label>
                      <span className="text-[10px] text-[#B2DDD6] font-sans">Adaptive</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'strict', label: 'Strict (±1h)', desc: 'Near routine' },
                        { id: 'moderate', label: 'Balanced (±2-3h)', desc: 'Best compromise' },
                        { id: 'flexible', label: 'Flexible', desc: 'Any clean hour' },
                      ].map((flex) => (
                        <button
                          key={flex.id}
                          type="button"
                          onClick={() => setScheduleFlexibility(flex.id as any)}
                          className={`px-2 py-1.5 rounded-xl text-center border text-[11px] transition-all font-sans ${
                            scheduleFlexibility === flex.id
                              ? 'bg-[#3E8E7E]/30 border-[#3E8E7E] text-white font-bold shadow-xs'
                              : 'bg-white/[0.04] border-white/8 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span className="block truncate">{flex.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Allowed Window Boundaries */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label htmlFor="allowed-start" className="block text-[11px] text-slate-400 mb-1 font-sans">
                        Earliest Start
                      </label>
                      <input
                        id="allowed-start"
                        type="time"
                        value={allowedStart}
                        onChange={(e) => setAllowedStart(e.target.value)}
                        className="w-full px-2.5 py-2 glass-input rounded-xl text-xs font-sans tabular-nums text-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="allowed-end" className="block text-[11px] text-slate-400 mb-1 font-sans">
                        Latest End
                      </label>
                      <input
                        id="allowed-end"
                        type="time"
                        value={allowedEnd}
                        onChange={(e) => setAllowedEnd(e.target.value)}
                        className="w-full px-2.5 py-2 glass-input rounded-xl text-xs font-sans tabular-nums text-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={() => refetchPlan()}
              disabled={planFetching || !selectedLocation}
              className="w-full py-3 px-4 bg-[#2D6A5F] hover:bg-[#3E8E7E] disabled:opacity-50 text-white font-semibold text-sm rounded-2xl border border-[#4E9B8D]/40 transition-all shadow-md shadow-[#2D6A5F]/25 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {planFetching ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Computing optimal window...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#B2DDD6]" aria-hidden="true" />
                  <span>Update My Plan</span>
                </>
              )}
            </button>
          </Card>

          {/* Persistent Health Disclaimer */}
          <div
            className="p-4 glass-card text-[11px] text-slate-400 leading-relaxed rounded-2xl"
            role="note"
          >
            <p className="font-semibold text-slate-200 flex items-center gap-1.5 mb-1 font-sans">
              <Info className="w-3.5 h-3.5 text-[#6bb3a7] shrink-0" aria-hidden="true" />
              <span>Medical & Air Quality Disclaimer</span>
            </p>
            BreatheWise provides informational exposure estimates derived from CAMS atmospheric reanalysis. It is not a
            medical device. Consult a physician before intense exertion in severe air quality.
          </div>
        </div>

        {/* ── Right Column: Decision Dashboard & Hero (lg:col-span-7) ─── */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. CURRENT AIR QUALITY HERO CARD */}
          {currentLoading && <Skeleton className="h-44 w-full rounded-2xl" />}

          {currentError && (
            <ErrorCard
              title="Current Air Quality Unavailable"
              message={currentError.message}
              onRetry={() => refetchCurrent()}
            />
          )}

          {currentAQ && !currentLoading && (
            <div
              className="glass-card p-6 border relative overflow-hidden transition-all shadow-md"
              style={{
                borderColor: `${aqiColor(currentAQ.category)}40`,
              }}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-sans">
                      Live Conditions · {selectedLocation?.name}
                    </span>
                    <DataStatusChip
                      isLive={currentAQ.data_status.source === 'live'}
                      cachedAt={currentAQ.data_status.cached_at}
                      cacheAgeMin={currentAQ.data_status.cache_age_min}
                      isFallback={currentAQ.data_status.is_fallback}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        refetchCurrent()
                        refetchPlan()
                      }}
                      disabled={currentFetching || planFetching}
                      className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                      title="Sync live environmental feeds from Open-Meteo CAMS"
                      aria-label="Refresh data"
                    >
                      <RefreshCw
                        className={`w-3 h-3 ${
                          currentFetching || planFetching ? 'animate-spin text-[#6bb3a7]' : ''
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                    As of {formatTimeOnly(currentAQ.time)} IST
                  </p>
                </div>

                <AqiBadge category={currentAQ.category} size="lg" showRange />
              </div>

              {/* Main Reading & Trend */}
              <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 my-3">
                <div className="flex items-baseline gap-1.5 font-sans">
                  <span className="text-4xl sm:text-5xl font-bold tracking-tight text-white tabular-nums">
                    {currentAQ.pm25.toFixed(1)}
                  </span>
                  <span className="text-sm font-medium text-slate-400">µg/m³ PM2.5</span>
                </div>

                <TrendIndicator trend={currentAQ.trend} delta={currentAQ.trend_delta_3h} />

                <span className="text-xs text-slate-400 font-sans tabular-nums">
                  PM10: {currentAQ.pm10.toFixed(1)} µg/m³
                </span>
              </div>

              {/* Personalized Verdict Banner */}
              <div className="mt-3 pt-3 border-t border-white/[0.08] flex items-center justify-between gap-3">
                <div className="text-xs text-slate-300 font-sans">
                  <span className="font-semibold text-white uppercase tracking-wider text-[11px] mr-1.5 font-sans">
                    Profile Verdict ({HEALTH_PROFILES[profile]?.label}):
                  </span>
                  <span className="font-medium text-[#B2DDD6]">{currentAQ.verdict}</span>
                </div>
              </div>
            </div>
          )}

          {/* 2. PLAN RESULTS / WINDOWS */}
          {planLoading && (
            <div className="space-y-4">
              <Skeleton className="h-56 w-full rounded-2xl" />
              <Skeleton className="h-36 w-full rounded-2xl" />
            </div>
          )}

          {planError && (
            <ErrorCard
              title="Plan Generation Failed"
              message={planError.message}
              onRetry={() => refetchPlan()}
            />
          )}

          {plan && !planLoading && (
            <div className="space-y-6">
              {/* PRIMARY BEST WINDOW CARD */}
              {plan.best_windows && plan.best_windows.length > 0 ? (
                <div className="glass-card-elevated p-6 sm:p-7 border-[#3E8E7E]/40 relative">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/[0.08] pb-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#B2DDD6] bg-[#3E8E7E]/20 border border-[#3E8E7E]/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-sans">
                          <Clock className="w-3 h-3 text-[#6bb3a7]" aria-hidden="true" />
                          <span>Recommended Best Window</span>
                        </span>
                        <span className="text-xs text-slate-400 font-sans">
                          {formatDate(plan.best_windows[0].start)}
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-4xl font-serif font-normal text-white mt-1.5">
                        {formatTimeOnly(plan.best_windows[0].start)} – {formatTimeOnly(plan.best_windows[0].end)}
                      </h2>
                    </div>

                    <div className="flex flex-col sm:items-end gap-1">
                      <AqiBadge category={plan.best_windows[0].category} size="md" />
                      <span className="text-xs font-sans tabular-nums font-semibold text-slate-300">
                        {plan.best_windows[0].mean_pm25.toFixed(1)} µg/m³ avg PM2.5
                      </span>
                    </div>
                  </div>

                  {/* Plain Language Actionable Advice */}
                  <div className="bg-[#3E8E7E]/15 border border-[#3E8E7E]/30 rounded-2xl p-4 mb-5 text-xs text-[#B2DDD6] leading-relaxed shadow-sm">
                    <p className="font-semibold text-white text-sm mb-1 font-sans">{plan.advice}</p>
                    <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                      {plan.mask_recommended && (
                        <span className="inline-flex items-center px-2 py-0.5 bg-[#C2934D]/20 text-[#EED9B8] border border-[#C2934D]/30 font-medium rounded-lg font-sans">
                          N95/KF94 Mask Advised
                        </span>
                      )}
                      {plan.indoor_alternative && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#B35656]/20 text-[#F2C8C8] border border-[#B35656]/30 font-medium rounded-lg font-sans">
                          <Home className="w-3 h-3" aria-hidden="true" />
                          Indoor Alternative Recommended
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Exposure Comparison Progress Widget */}
                  <div className="glass-pill rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-white font-sans">
                          <Zap className="w-3.5 h-3.5 text-[#6bb3a7]" aria-hidden="true" />
                          <span>Inhaled Exposure Avoidance</span>
                          <InfoTooltip
                            text="Reduction in inhaled PM2.5 mass compared to your routine outdoor time."
                            label="Dose calculation info"
                          />
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 font-sans">
                          Vs routine {formatTimeOnly(plan.usual_window.start)} slot (
                          {plan.usual_window.mean_pm25.toFixed(1)} µg/m³ mean)
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-2xl sm:text-3xl font-bold font-sans tabular-nums text-[#B2DDD6]">
                          {plan.exposure.avoided_pct > 0 ? `-${plan.exposure.avoided_pct.toFixed(0)}%` : '0%'}
                        </span>
                        <p className="text-[10px] text-slate-400 font-medium font-sans">Inhaled PM2.5 Avoided</p>
                      </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="w-full bg-white/[0.08] rounded-full h-2.5 overflow-hidden" aria-hidden="true">
                      <div
                        className="bg-gradient-to-r from-[#3E8E7E] to-[#6bb3a7] h-full rounded-full transition-all duration-500 shadow-xs"
                        style={{ width: `${Math.min(Math.max(plan.exposure.avoided_pct, 5), 100)}%` }}
                      />
                    </div>

                    {/* Zero savings explanation if routine was already optimal */}
                    {plan.exposure.avoided_pct === 0 && (
                      <p className="text-[11px] text-[#B2DDD6] italic mt-2 font-sans">
                        Your routine time ({formatTimeOnly(plan.usual_window.start)}) is already within the cleanest daily window!
                      </p>
                    )}
                  </div>

                  {/* Copy Plan Summary Action */}
                  <div className="mt-4 flex justify-end">
                    <CopySummaryButton text={shareableSummary} />
                  </div>
                </div>
              ) : (
                /* No Window Found State */
                <Card className="p-6 text-center text-slate-400">
                  <AlertTriangle className="w-8 h-8 text-[#C2934D] mx-auto mb-2" aria-hidden="true" />
                  <p className="font-semibold text-white font-sans">No Safe Activity Window Within Allowed Range</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto font-sans">
                    Air pollution remains elevated throughout your requested hours. Please consider an indoor alternative or widen your hours.
                  </p>
                </Card>
              )}

              {/* 3. RUNNER-UP ALTERNATIVE WINDOWS */}
              {plan.best_windows && plan.best_windows.length > 1 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 font-sans flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#6bb3a7]" aria-hidden="true" />
                    <span>Alternative Feasible Windows</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {plan.best_windows.slice(1, 3).map((w, idx) => (
                      <div key={idx} className="glass-card p-4 hover:border-white/20 transition-all">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-semibold text-slate-300 font-sans">Option #{idx + 2}</span>
                          <AqiBadge category={w.category} size="sm" />
                        </div>
                        <div className="font-sans text-base font-bold text-white tabular-nums">
                          {formatTimeOnly(w.start)} – {formatTimeOnly(w.end)}
                        </div>
                        <p className="text-xs text-slate-400 font-sans tabular-nums mt-0.5">
                          Mean PM2.5: {w.mean_pm25.toFixed(1)} µg/m³
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. AVOID PERIODS SECTION */}
              {plan.avoid_windows && plan.avoid_windows.length > 0 && (
                <div className="rounded-2xl border border-[#B35656]/30 hatch-avoid p-5 backdrop-blur-md">
                  <div className="flex items-center gap-2 mb-3 text-[#F2C8C8] font-semibold text-xs uppercase tracking-wider font-sans">
                    <AlertTriangle className="w-4 h-4 text-[#B35656]" aria-hidden="true" />
                    <span>Peak Inversion Periods to Avoid Outdoors</span>
                  </div>
                  <div className="space-y-2.5">
                    {plan.avoid_windows.map((aw, idx) => (
                      <div
                        key={idx}
                        className="glass-card p-3.5 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-white font-sans tabular-nums">
                            {formatTimeOnly(aw.start)} – {formatTimeOnly(aw.end)}
                          </div>
                          <span className="text-[11px] text-slate-400 font-sans">
                            Winter inversion pollution peak trap
                          </span>
                        </div>
                        <div className="text-right">
                          <AqiBadge category={aw.category} size="sm" />
                          <p className="font-sans font-bold tabular-nums text-[11px] text-[#F2C8C8] mt-0.5">
                            {aw.mean_pm25.toFixed(1)} µg/m³
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
