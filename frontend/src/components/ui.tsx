// Shared UI Component Library — BreatheWise Muted Atmospheric Glassmorphism
import React, { useState } from 'react'
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Check,
  Copy,
  HelpCircle,
  RotateCcw,
  Share2,
} from 'lucide-react'
import { aqiBgTint, aqiColor, aqiTextColor, normalizeCategory, AQI_CATEGORIES } from '../api/types'
import { useTheme } from '../context/ThemeContext'

// ── AQI Badge (High-Contrast Dual-Mode Glass Pill) ─────────────────────────────
export function AqiBadge({
  category,
  size = 'md',
  showRange = false,
}: {
  category: string
  size?: 'sm' | 'md' | 'lg'
  showRange?: boolean
}) {
  let isLight = false
  try {
    const { theme } = useTheme()
    isLight = theme === 'light'
  } catch {
    isLight = typeof document !== 'undefined' && document.documentElement.classList.contains('light')
  }

  const norm = normalizeCategory(category)
  const cat = AQI_CATEGORIES[norm]
  const color = aqiColor(category)
  const textColor = aqiTextColor(category, isLight)
  const bgTint = aqiBgTint(category, isLight)
  const range = cat?.range
  const label = cat?.label ?? norm

  const sizeClasses = {
    sm: 'text-[11px] px-2.5 py-0.5 font-semibold',
    md: 'text-xs px-3 py-1 font-semibold tracking-wide',
    lg: 'text-xs sm:text-sm px-3.5 py-1.5 font-bold tracking-wide',
  }[size]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-xs uppercase font-sans backdrop-blur-md transition-colors ${sizeClasses}`}
      style={{
        backgroundColor: bgTint,
        borderColor: `${color}${isLight ? '45' : '65'}`,
        color: textColor,
      }}
      aria-label={`Air quality category: ${label}${range ? ` (${range} µg/m³)` : ''}`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      <span className="font-bold tracking-wider">{label}</span>
      {showRange && range && (
        <span className="opacity-80 font-sans font-medium tabular-nums text-[10px]">
          ({range})
        </span>
      )}
    </span>
  )
}

// ── Data Status Chip ─────────────────────────────────────────────────────────
export function DataStatusChip({
  isLive,
  cachedAt,
  cacheAgeMin,
  isFallback = false,
}: {
  isLive: boolean
  cachedAt?: string | null
  cacheAgeMin?: number | null
  isFallback?: boolean
}) {
  if (isLive) {
    return (
      <span
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B2DDD6] bg-[#3E8E7E]/15 border border-[#3E8E7E]/30 rounded-full px-2.5 py-1 backdrop-blur-md"
        title="Live air quality model feed from Open-Meteo CAMS"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#6bb3a7] animate-pulse" aria-hidden="true" />
        <span>Live CAMS Feed</span>
      </span>
    )
  }

  const timeStr = cachedAt
    ? new Date(cachedAt).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Kolkata',
        hour12: true,
      })
    : null

  if (isFallback) {
    return (
      <span
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FFC8C8] bg-[#D44A4A]/15 border border-[#D44A4A]/30 rounded-full px-2.5 py-1 backdrop-blur-md"
        title="Upstream connection unreachable; using verified offline snapshot"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#D44A4A]" aria-hidden="true" />
        <span>Offline Fallback {timeStr ? `(${timeStr})` : ''}</span>
      </span>
    )
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B2DDD6] bg-[#3E8E7E]/10 border border-[#3E8E7E]/25 rounded-full px-2.5 py-1 backdrop-blur-md"
      title={timeStr ? `Synchronized snapshot at ${timeStr} IST` : 'Using verified warm environmental data'}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#3E8E7E]" aria-hidden="true" />
      <span>{timeStr ? `Live Sync (${timeStr})` : `Synced ${cacheAgeMin ? `${Math.round(cacheAgeMin)}m ago` : ''}`}</span>
    </span>
  )
}

// ── Offline Banner ──────────────────────────────────────────────────────────
export function OfflineBanner({ cachedAt }: { cachedAt?: string | null }) {
  const timeStr = cachedAt
    ? new Date(cachedAt).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Kolkata',
        hour12: true,
      })
    : null

  return (
    <div
      className="bg-[#C2934D]/10 border border-[#C2934D]/30 backdrop-blur-xl rounded-2xl p-4 flex items-start gap-3 text-[#EED9B8] text-sm shadow-sm"
      role="status"
    >
      <AlertTriangle className="w-5 h-5 text-[#C2934D] shrink-0 mt-0.5" aria-hidden="true" />
      <div>
        <p className="font-semibold text-white">Cached Data Fallback Active</p>
        <p className="text-xs text-[#EED9B8]/80 mt-0.5 leading-relaxed">
          The live API connection is currently unreachable. BreatheWise is operating in offline mode using verified
          snapshot data {timeStr ? `from ${timeStr} IST` : ''}. All calculations remain authoritative for this period.
        </p>
      </div>
    </div>
  )
}

// ── Error Card with Retry ───────────────────────────────────────────────────
export function ErrorCard({
  title = 'Unable to Load Data',
  message,
  onRetry,
}: {
  title?: string
  message: string
  onRetry?: () => void
}) {
  return (
    <div className="bg-[#B35656]/10 border border-[#B35656]/30 backdrop-blur-xl rounded-2xl p-5 text-center my-3 shadow-sm" role="alert">
      <p className="text-[#F2C8C8] font-semibold text-base mb-1">{title}</p>
      <p className="text-slate-300 text-sm max-w-md mx-auto mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/[0.08] border border-white/10 text-white text-sm font-semibold rounded-xl hover:bg-white/[0.14] transition-all shadow-xs"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          <span>Retry request</span>
        </button>
      )}
    </div>
  )
}

// ── Skeleton Loader ─────────────────────────────────────────────────────────
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />
}

// ── Accessible Info Tooltip ─────────────────────────────────────────────────
export function InfoTooltip({ text, label = 'Help information' }: { text: string; label?: string }) {
  return (
    <span className="group relative inline-flex items-center">
      <button
        type="button"
        className="w-4 h-4 rounded-full text-slate-400 hover:text-[#6bb3a7] inline-flex items-center justify-center cursor-help transition-colors"
        aria-label={label}
        tabIndex={0}
      >
        <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
      <span
        className="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-[#121A2B]/95 border border-white/12 text-slate-200 text-xs font-normal rounded-xl px-3 py-2 shadow-2xl z-50 leading-relaxed pointer-events-none backdrop-blur-xl"
        role="tooltip"
      >
        {text}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#121A2B]" />
      </span>
    </span>
  )
}

// ── Standard Container Card (Frosted Glassmorphism) ──────────────────────────
export function Card({
  children,
  className = '',
  as: Tag = 'div',
}: {
  children: React.ReactNode
  className?: string
  as?: React.ElementType
}) {
  return (
    <Tag className={`glass-card p-5 text-slate-100 ${className}`}>
      {children}
    </Tag>
  )
}

// ── Section Header ──────────────────────────────────────────────────────────
export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs sm:text-sm text-slate-300 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

// ── Trend Indicator (Muted Mineral Tones) ───────────────────────────────────
export function TrendIndicator({
  trend,
  delta,
}: {
  trend: 'rising' | 'falling' | 'stable'
  delta: number
}) {
  if (trend === 'rising') {
    return (
      <span
        className="inline-flex items-center gap-1 text-xs font-semibold text-[#F2C8C8] bg-[#B35656]/15 border border-[#B35656]/25 rounded-full px-2.5 py-0.5 backdrop-blur-md"
        title={`PM2.5 predicted to rise by ${Math.abs(delta)} µg/m³ over next 3 hours`}
      >
        <ArrowUp className="w-3.5 h-3.5 text-[#B35656]" aria-hidden="true" />
        <span>+{delta.toFixed(1)} 3h trend</span>
      </span>
    )
  }
  if (trend === 'falling') {
    return (
      <span
        className="inline-flex items-center gap-1 text-xs font-semibold text-[#B2DDD6] bg-[#3E8E7E]/15 border border-[#3E8E7E]/25 rounded-full px-2.5 py-0.5 backdrop-blur-md"
        title={`PM2.5 predicted to drop by ${Math.abs(delta)} µg/m³ over next 3 hours`}
      >
        <ArrowDown className="w-3.5 h-3.5 text-[#3E8E7E]" aria-hidden="true" />
        <span>{delta.toFixed(1)} 3h trend</span>
      </span>
    )
  }
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 bg-white/[0.05] border border-white/10 rounded-full px-2.5 py-0.5 backdrop-blur-md"
      title="PM2.5 stable over next 3 hours (within ±5 µg/m³)"
    >
      <ArrowRight className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
      <span>Stable 3h trend</span>
    </span>
  )
}

// ── Copy Plan Summary Button ────────────────────────────────────────────────
export function CopySummaryButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      // Fallback
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="glass-pill inline-flex items-center gap-1.5 text-xs font-medium text-slate-200 rounded-xl px-3 py-1.5 hover:bg-white/[0.12] hover:text-white transition-all shadow-xs"
      title="Copy plan details to clipboard"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-[#B2DDD6]" aria-hidden="true" />
          <span className="text-[#B2DDD6] font-semibold">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          <span>Copy plan summary</span>
        </>
      )}
    </button>
  )
}

// ── Share URL Button ────────────────────────────────────────────────────────
export function ShareButton() {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'BreatheWise Air Quality Plan',
          url,
        })
      } else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {
      // ignore user cancel
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="glass-pill inline-flex items-center gap-1.5 text-xs font-medium text-slate-200 rounded-xl px-3 py-1.5 hover:bg-white/[0.12] hover:text-white transition-all shadow-xs"
      title="Share current plan URL"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-[#B2DDD6]" aria-hidden="true" />
          <span className="text-[#B2DDD6] font-semibold">Link copied!</span>
        </>
      ) : (
        <>
          <Share2 className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          <span>Share plan</span>
        </>
      )}
    </button>
  )
}
