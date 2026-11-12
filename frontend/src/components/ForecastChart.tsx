// Forecast Chart Component using Recharts (Dual-Mode Muted Atmospheric Glassmorphism)
import { useMemo } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { type HourlyForecastItem } from '../api/types'
import { AqiBadge } from './ui'
import { useTheme } from '../context/ThemeContext'

interface ForecastChartProps {
  hourly: HourlyForecastItem[]
  bestWindowStart?: string
  bestWindowEnd?: string
  avoidWindows?: Array<{ start: string; end: string }>
}

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

function formatAxisTick(iso: string) {
  try {
    const d = new Date(iso)
    const hour = d.toLocaleTimeString('en-IN', {
      hour: 'numeric',
      timeZone: 'Asia/Kolkata',
      hour12: true,
    })
    return hour
  } catch {
    return iso
  }
}

// CPCB Category Background Reference Bands (Muted Mineral Tones)
const CPCB_BANDS = [
  { y1: 0, y2: 30, color: '#3E8E7E', label: 'Good' },
  { y1: 30, y2: 60, color: '#6B8E5F', label: 'Satisfactory' },
  { y1: 60, y2: 90, color: '#C2934D', label: 'Moderate' },
  { y1: 90, y2: 120, color: '#BA7347', label: 'Poor' },
  { y1: 120, y2: 250, color: '#B35656', label: 'Very Poor' },
  { y1: 250, y2: 500, color: '#80353F', label: 'Severe' },
]

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    value: number
    dataKey: string
    payload: HourlyForecastItem
  }>
  label?: string
}

function CustomForecastTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length || !label) return null

  const row = payload[0].payload

  return (
    <div className="glass-card-elevated px-3.5 py-2.5 text-xs min-w-44 z-50 text-slate-100 shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2 gap-3">
        <span className="font-semibold text-white">{formatISTTime(row.time)} IST</span>
        <AqiBadge category={row.category} size="sm" />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-baseline font-sans tabular-nums">
          <span className="text-slate-400 text-[11px]">PM2.5 Median (p50):</span>
          <span className="text-sm font-bold text-[#B2DDD6]">{row.pm25_p50.toFixed(1)} µg/m³</span>
        </div>
        <div className="flex justify-between items-baseline font-sans tabular-nums text-[11px] text-slate-400">
          <span>80% Interval (p10–p90):</span>
          <span>
            {row.pm25_p10.toFixed(0)} – {row.pm25_p90.toFixed(0)} µg/m³
          </span>
        </div>
        <div className="flex justify-between items-baseline text-[10px] text-slate-400 pt-1 border-t border-white/5">
          <span>Horizon: +{row.horizon_h}h ahead</span>
          <span className={row.pm25_p50 > 15 ? 'text-[#EED9B8]' : 'text-[#CFE2C8]'}>
            {row.pm25_p50 > 15 ? `${(row.pm25_p50 / 15).toFixed(1)}× WHO limit` : 'Within WHO'}
          </span>
        </div>
      </div>
    </div>
  )
}

export function ForecastChart({
  hourly,
  bestWindowStart,
  bestWindowEnd,
  avoidWindows = [],
}: ForecastChartProps) {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  // Pre-calculate stacked band points so NO background color cutout is needed
  const chartData = useMemo(() => {
    if (!hourly) return []
    return hourly.map((h) => ({
      ...h,
      pm25_band_base: h.pm25_p10,
      pm25_band_range: Math.max(0, h.pm25_p90 - h.pm25_p10),
    }))
  }, [hourly])

  if (!hourly || hourly.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-xs text-slate-400 border border-dashed border-white/10 rounded-2xl">
        No forecast points available for this period.
      </div>
    )
  }

  // Calculate dynamic Y-axis maximum with headroom
  const maxForecastVal = Math.max(...hourly.map((h) => h.pm25_p90), 80)
  const yAxisMax = Math.min(Math.ceil((maxForecastVal + 20) / 20) * 20, 500)

  // Accessible statistical summary for screen readers
  const p50Values = hourly.map((h) => h.pm25_p50)
  const minP50 = Math.min(...p50Values).toFixed(1)
  const maxP50 = Math.max(...p50Values).toFixed(1)
  const meanP50 = (p50Values.reduce((a, b) => a + b, 0) / p50Values.length).toFixed(1)

  return (
    <div className="space-y-3">
      {/* Screen Reader Accessible Summary */}
      <div className="sr-only" aria-live="polite">
        48-hour PM2.5 forecast chart. Median forecast values range from {minP50} to {maxP50} micrograms per cubic meter,
        averaging {meanP50} micrograms per cubic meter. Recommended activity window is highlighted.
      </div>

      <div className="w-full h-72 sm:h-84 select-none">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 12, right: 16, left: -10, bottom: 0 }}
          >
            {/* CPCB Category Reference Bands */}
            {CPCB_BANDS.map((band) => (
              <ReferenceArea
                key={band.label}
                y1={band.y1}
                y2={Math.min(band.y2, yAxisMax)}
                fill={band.color}
                fillOpacity={isLight ? 0.08 : 0.06}
              />
            ))}

            {/* Recommended Best Window Reference Area */}
            {bestWindowStart && bestWindowEnd && (
              <ReferenceArea
                x1={bestWindowStart}
                x2={bestWindowEnd}
                fill={isLight ? '#2D6A5F' : '#3E8E7E'}
                fillOpacity={isLight ? 0.22 : 0.20}
                stroke={isLight ? '#1B4D42' : '#4E9B8D'}
                strokeWidth={1.5}
                strokeDasharray="3 3"
              />
            )}

            {/* Avoid Periods Reference Areas */}
            {avoidWindows.map((aw, idx) => (
              <ReferenceArea
                key={idx}
                x1={aw.start}
                x2={aw.end}
                fill="#B35656"
                fillOpacity={isLight ? 0.16 : 0.14}
                stroke="#B35656"
                strokeWidth={1}
                strokeDasharray="2 2"
              />
            ))}

            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isLight ? 'rgba(20, 46, 39, 0.08)' : 'rgba(255, 255, 255, 0.04)'}
              vertical={false}
            />

            <XAxis
              dataKey="time"
              tickFormatter={formatAxisTick}
              interval={hourly.length > 30 ? 5 : 3}
              tick={{ fontSize: 11, fill: isLight ? '#23493E' : '#94A3B8' }}
              axisLine={{ stroke: isLight ? 'rgba(20, 46, 39, 0.15)' : 'rgba(255, 255, 255, 0.08)' }}
              tickLine={false}
            />

            <YAxis
              domain={[0, yAxisMax]}
              tick={{ fontSize: 10, fill: isLight ? '#23493E' : '#94A3B8' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}`}
              width={38}
            />

            <Tooltip content={<CustomForecastTooltip />} />

            {/* P10-P90 Uncertainty Shaded Band (Clean Stacked Areas: No Hardcoded Ground Mask Needed!) */}
            <Area
              dataKey="pm25_band_base"
              stackId="band"
              stroke="none"
              fill="transparent"
              fillOpacity={0}
              activeDot={false}
              isAnimationActive={false}
            />
            <Area
              dataKey="pm25_band_range"
              stackId="band"
              stroke="none"
              fill={isLight ? '#2D6A5F' : '#3E8E7E'}
              fillOpacity={isLight ? 0.24 : 0.18}
              activeDot={false}
              isAnimationActive={false}
            />

            {/* P50 Median Prediction Line */}
            <Line
              type="monotone"
              dataKey="pm25_p50"
              stroke={isLight ? '#1E6554' : '#4E9B8D'}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: isLight ? '#14463C' : '#3E8E7E', stroke: '#FFFFFF', strokeWidth: 2 }}
              isAnimationActive={false}
            />

            {/* WHO 2021 24-hour Guideline Line (15 µg/m³) */}
            <ReferenceLine
              y={15}
              stroke={isLight ? '#2D6E42' : '#6B8E5F'}
              strokeDasharray="5 3"
              strokeWidth={1.5}
              label={{
                value: 'WHO 24h (15 µg/m³)',
                position: 'insideTopRight',
                fontSize: 10,
                fill: isLight ? '#1B4D2B' : '#CFE2C8',
                fontWeight: 600,
              }}
            />

            {/* Current Time ("Now") */}
            {hourly.length > 0 && (
              <ReferenceLine
                x={hourly[0].time}
                stroke={isLight ? '#4A6B62' : '#64748B'}
                strokeDasharray="3 2"
                strokeWidth={1.2}
                label={{
                  value: 'Now',
                  position: 'insideTopLeft',
                  fontSize: 10,
                  fill: isLight ? '#23493E' : '#94A3B8',
                  fontWeight: 600,
                }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Guidance */}
      <div className={`flex flex-wrap items-center justify-between gap-y-2 gap-x-4 pt-2 text-xs border-t ${
        isLight ? 'border-[#142E27]/10 text-[#3C5850]' : 'border-white/[0.06] text-slate-400'
      }`}>
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className={`w-4 h-0.5 rounded-full ${isLight ? 'bg-[#1E6554]' : 'bg-[#4E9B8D]'}`} aria-hidden="true" />
            <span className={`font-medium ${isLight ? 'text-[#142E27]' : 'text-slate-200'}`}>P50 Median Forecast</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`w-3.5 h-2 rounded-xs border ${
              isLight ? 'bg-[#2D6A5F]/25 border-[#2D6A5F]/40' : 'bg-[#3E8E7E]/30 border-[#3E8E7E]/40'
            }`} aria-hidden="true" />
            <span>80% Uncertainty Band (P10–P90)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`w-4 h-0.5 border-t border-dashed ${isLight ? 'border-[#2D6E42]' : 'border-[#6B8E5F]'}`} aria-hidden="true" />
            <span className={isLight ? 'text-[#1B4D2B] font-medium' : 'text-[#CFE2C8]'}>WHO 24h Limit (15 µg/m³)</span>
          </span>
        </div>

        {bestWindowStart && (
          <span className={`flex items-center gap-1.5 font-medium ${isLight ? 'text-[#14463C]' : 'text-[#B2DDD6]'}`}>
            <span className={`w-3 h-2 border rounded-xs ${
              isLight ? 'bg-[#2D6A5F]/30 border-[#1B4D42]' : 'bg-[#3E8E7E]/30 border-[#4E9B8D]'
            }`} aria-hidden="true" />
            <span>Recommended Window</span>
          </span>
        )}
      </div>
    </div>
  )
}
