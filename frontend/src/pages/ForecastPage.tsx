// Forecast Screen — Analytical Exploration (48-hour Recharts Visualisation — Muted Glassmorphism)
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Building2, Clock, LineChart, RefreshCw, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react'
import { fetchCities, fetchForecast, fetchPlan } from '../api'
import type { CityItem, ForecastResponse, PlanResponse } from '../api/types'
import { ForecastChart } from '../components/ForecastChart'
import { ZoomableGraphic } from '../components/ZoomModal'
import {
  AqiBadge,
  DataStatusChip,
  ErrorCard,
  SectionHeader,
  Skeleton,
} from '../components/ui'

function formatISTTime(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata',
      hour12: true,
    })
  } catch {
    return iso
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
    return iso
  }
}

export default function ForecastPage() {
  const [selectedCityId, setSelectedCityId] = useState<string>('delhi')

  // Load preset monitored cities
  const { data: cities } = useQuery<CityItem[]>({
    queryKey: ['cities'],
    queryFn: fetchCities,
    staleTime: Infinity,
  })

  const currentCity = useMemo(() => {
    return (
      cities?.find((c) => c.id === selectedCityId) ?? {
        id: 'delhi',
        name: 'Delhi',
        lat: 28.6139,
        lon: 77.209,
        state: 'Delhi',
      }
    )
  }, [cities, selectedCityId])

  // Fetch 48h forecast
  const {
    data: forecastData,
    isLoading: forecastLoading,
    isFetching: forecastFetching,
    error: forecastError,
    refetch: refetchForecast,
  } = useQuery<ForecastResponse, Error>({
    queryKey: ['forecast', currentCity.lat, currentCity.lon],
    queryFn: () => fetchForecast(currentCity.lat, currentCity.lon, 48),
    enabled: !!currentCity,
    staleTime: 10 * 60 * 1000,
    retry: 2,
  })

  // Also query plan for this city to highlight recommended window on the forecast chart
  const { data: planData } = useQuery<PlanResponse>({
    queryKey: ['forecastPlanWindow', currentCity.lat, currentCity.lon],
    queryFn: () =>
      fetchPlan({
        lat: currentCity.lat,
        lon: currentCity.lon,
        profile: 'healthy_adult',
        activity: 'exercise',
        duration_min: 60,
        allowed_start: '05:00',
        allowed_end: '21:00',
        usual_start: '07:00',
        language: 'en',
      }),
    enabled: !!currentCity,
    staleTime: 10 * 60 * 1000,
  })

  // Summary statistics computed across 48 forecast hours
  const stats = useMemo(() => {
    if (!forecastData?.forecast || forecastData.forecast.length === 0) return null
    const list = forecastData.forecast
    const meanVal = list.reduce((acc, cur) => acc + cur.pm25_p50, 0) / list.length

    let cleanestHour = list[0]
    let peakHour = list[0]

    for (const h of list) {
      if (h.pm25_p50 < cleanestHour.pm25_p50) cleanestHour = h
      if (h.pm25_p50 > peakHour.pm25_p50) peakHour = h
    }

    const safeHoursCount = list.filter((h) => h.category === 'Good' || h.category === 'Satisfactory').length

    return {
      meanVal,
      cleanestHour,
      peakHour,
      safeHoursCount,
      totalHours: list.length,
    }
  }, [forecastData])

  const bestWindow = planData?.best_windows?.[0]
  const avoidWindows = planData?.avoid_windows?.map((w) => ({ start: w.start, end: w.end }))

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 text-slate-100">
      {/* Page Title & Monitored City Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#3E8E7E]/15 border border-[#3E8E7E]/30 text-[#B2DDD6] rounded-full text-xs font-semibold uppercase tracking-wider mb-2 font-sans">
            <LineChart className="w-3.5 h-3.5 text-[#6bb3a7]" aria-hidden="true" />
            <span>Atmospheric Modeling</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-white tracking-tight">48-Hour Forecast</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5 font-sans">
            Hourly PM2.5 ensemble predictions with calibrated P10–P90 uncertainty intervals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="city-select" className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-sans">
            <Building2 className="w-3.5 h-3.5 text-[#6bb3a7]" aria-hidden="true" />
            <span>City:</span>
          </label>
          <select
            id="city-select"
            value={selectedCityId}
            onChange={(e) => setSelectedCityId(e.target.value)}
            className="border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold glass-input focus:outline-none focus:border-[#4E9B8D]"
          >
            {cities?.map((c) => (
              <option key={c.id} value={c.id} className="bg-[#121A2B] text-white">
                {c.name}, {c.state}
              </option>
            ))}
          </select>

          {forecastData && (
            <div className="flex items-center gap-1.5">
              <DataStatusChip
                isLive={forecastData.data_status.source === 'live'}
                cachedAt={forecastData.data_status.cached_at}
                cacheAgeMin={forecastData.data_status.cache_age_min}
                isFallback={forecastData.data_status.is_fallback}
              />
              <button
                type="button"
                onClick={() => refetchForecast()}
                disabled={forecastFetching}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                title="Sync live atmospheric predictions from Open-Meteo CAMS"
                aria-label="Refresh forecast"
              >
                <RefreshCw
                  className={`w-3 h-3 ${forecastFetching ? 'animate-spin text-[#6bb3a7]' : ''}`}
                />
              </button>
            </div>
          )}
        </div>
      </div>

      {forecastLoading && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      )}

      {forecastError && (
        <ErrorCard
          title="Forecast Fetch Failed"
          message={forecastError.message}
          onRetry={() => refetchForecast()}
        />
      )}

      {forecastData && !forecastLoading && (
        <div className="space-y-8">
          {/* Analytical Summary Cards */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="glass-card p-5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block font-sans">
                  48-Hour Mean
                </span>
                <div className="text-2xl sm:text-3xl font-bold font-sans tabular-nums text-white mt-1">
                  {stats.meanVal.toFixed(1)}{' '}
                  <span className="text-xs font-sans font-normal text-slate-400">µg/m³</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 font-sans">Ensemble mean trajectory</p>
              </div>

              <div className="glass-card p-5 border-[#3E8E7E]/30">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block font-sans flex items-center gap-1 text-[#B2DDD6]">
                  <Sparkles className="w-3 h-3 text-[#6bb3a7]" aria-hidden="true" />
                  <span>Cleanest Window</span>
                </span>
                <div className="text-2xl sm:text-3xl font-bold font-sans tabular-nums text-[#B2DDD6] mt-1">
                  {stats.cleanestHour.pm25_p50.toFixed(1)}{' '}
                  <span className="text-xs font-sans font-normal text-slate-400">µg/m³</span>
                </div>
                <p className="text-[11px] text-[#B2DDD6]/80 mt-0.5 font-sans tabular-nums">
                  At {formatISTTime(stats.cleanestHour.time)} IST
                </p>
              </div>

              <div className="glass-card p-5 border-[#B35656]/30">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block font-sans flex items-center gap-1 text-[#F2C8C8]">
                  <TrendingUp className="w-3 h-3 text-[#B35656]" aria-hidden="true" />
                  <span>Peak Pollution</span>
                </span>
                <div className="text-2xl sm:text-3xl font-bold font-sans tabular-nums text-[#F2C8C8] mt-1">
                  {stats.peakHour.pm25_p50.toFixed(1)}{' '}
                  <span className="text-xs font-sans font-normal text-slate-400">µg/m³</span>
                </div>
                <p className="text-[11px] text-[#F2C8C8]/80 mt-0.5 font-sans tabular-nums">
                  At {formatISTTime(stats.peakHour.time)} IST
                </p>
              </div>

              <div className="glass-card p-5 border-[#6B8E5F]/30">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block font-sans flex items-center gap-1 text-[#CFE2C8]">
                  <ShieldCheck className="w-3 h-3 text-[#6B8E5F]" aria-hidden="true" />
                  <span>Safe Air Hours</span>
                </span>
                <div className="text-2xl sm:text-3xl font-bold font-sans tabular-nums text-[#CFE2C8] mt-1">
                  {stats.safeHoursCount}{' '}
                  <span className="text-xs font-sans font-normal text-slate-400">/ {stats.totalHours} hrs</span>
                </div>
                <p className="text-[11px] text-[#CFE2C8]/80 mt-0.5 font-sans">Good or Satisfactory</p>
              </div>
            </div>
          )}

          {/* Main Visualisation Card */}
          <div className="glass-card p-6 sm:p-8">
            <SectionHeader
              title={`${currentCity.name} 48-Hour PM2.5 Forecast Trajectory`}
              subtitle="Solid line indicates P50 median. Shaded band captures calibrated 80% confidence interval (P10–P90). Dashed green line marks WHO 24h limit (15 µg/m³)."
            />

            <ZoomableGraphic
              title={`${currentCity.name} 48-Hour PM2.5 Forecast Trajectory`}
              subtitle="Ensemble P50 trajectory with calibrated 80% confidence interval (P10–P90)"
              caption="Data sourced from Open-Meteo CAMS atmospheric modeling. Shaded areas highlight recommended activity windows."
            >
              <ForecastChart
                hourly={forecastData.forecast}
                bestWindowStart={bestWindow?.start}
                bestWindowEnd={bestWindow?.end}
                avoidWindows={avoidWindows}
              />
            </ZoomableGraphic>
          </div>

          {/* Accessible 24-Hour Hourly Breakdown Table */}
          <div className="glass-card p-6 sm:p-8 overflow-hidden">
            <SectionHeader
              title="Next 24 Hours Tabular Breakdown"
              subtitle="CPCB category classification with WHO comparisons."
            />

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left" aria-label="Hourly air quality forecast table">
                <thead className="border-b border-white/[0.08] text-slate-300 font-semibold uppercase tracking-wider text-[10px] bg-white/[0.02]">
                  <tr>
                    <th scope="col" className="py-2.5 px-3">
                      Time (IST)
                    </th>
                    <th scope="col" className="py-2.5 px-3">
                      Date
                    </th>
                    <th scope="col" className="py-2.5 px-3 text-right">
                      Median (P50)
                    </th>
                    <th scope="col" className="py-2.5 px-3 text-right">
                      80% Interval (P10–P90)
                    </th>
                    <th scope="col" className="py-2.5 px-3">
                      CPCB Category
                    </th>
                    <th scope="col" className="py-2.5 px-3 text-right">
                      vs WHO (15)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {forecastData.forecast.slice(0, 24).map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-2.5 px-3 font-sans font-bold text-white tabular-nums flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-400" aria-hidden="true" />
                        <span>{formatISTTime(row.time)}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 font-sans tabular-nums text-[11px]">{formatDate(row.time)}</td>
                      <td className="py-2.5 px-3 font-sans tabular-nums text-right font-bold text-[#B2DDD6]">
                        {row.pm25_p50.toFixed(1)} µg/m³
                      </td>
                      <td className="py-2.5 px-3 font-sans tabular-nums text-right text-slate-400">
                        {row.pm25_p10.toFixed(0)} – {row.pm25_p90.toFixed(0)}
                      </td>
                      <td className="py-2.5 px-3">
                        <AqiBadge category={row.category} size="sm" />
                      </td>
                      <td className="py-2.5 px-3 font-sans tabular-nums text-right text-slate-400">
                        {row.pm25_p50 <= 15 ? (
                          <span className="text-[#CFE2C8] font-semibold">Safe</span>
                        ) : (
                          <span className="text-[#EED9B8]">{`${(row.pm25_p50 / 15).toFixed(1)}×`}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
