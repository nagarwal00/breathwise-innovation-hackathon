// Typed API Client for BreatheWise Backend
import type {
  BacktestResponse,
  CityItem,
  CurrentAQResponse,
  ForecastResponse,
  GeocodeItem,
  HealthResponse,
  PlanRequest,
  PlanResponse,
} from './types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    ...options,
  })

  if (!res.ok) {
    let errorMessage = `HTTP Error ${res.status}`
    try {
      const errBody = await res.json()
      if (errBody?.detail) {
        if (typeof errBody.detail === 'string') {
          errorMessage = errBody.detail
        } else if (Array.isArray(errBody.detail)) {
          errorMessage = errBody.detail.map((e: { msg?: string }) => e.msg || 'Validation error').join(', ')
        }
      }
    } catch {
      // ignore json parse error on non-json error responses
    }
    throw new Error(errorMessage)
  }

  return (await res.json()) as T
}

export function fetchHealth(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>('/health')
}

export function fetchCities(): Promise<CityItem[]> {
  return apiFetch<CityItem[]>('/cities')
}

export async function geocode(query: string): Promise<GeocodeItem[]> {
  const data = await apiFetch<{
    results?: Array<{
      id: number
      name: string
      latitude: number
      longitude: number
      admin1?: string
      country?: string
    }>
  }>(`/geocode?q=${encodeURIComponent(query)}`)

  if (!data?.results || !Array.isArray(data.results)) {
    return []
  }

  return data.results.map((r) => ({
    id: r.id,
    name: r.name,
    lat: r.latitude,
    lon: r.longitude,
    admin1: r.admin1,
    country: r.country,
    displayName: r.admin1 ? `${r.name}, ${r.admin1}` : r.name,
  }))
}

export function fetchCurrent(
  lat: number,
  lon: number,
  profile = 'healthy_adult',
  forceFresh = false
): Promise<CurrentAQResponse> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    profile,
    ...(forceFresh ? { force_fresh: 'true' } : {}),
  })
  return apiFetch<CurrentAQResponse>(`/current?${params.toString()}`)
}

export function fetchForecast(
  lat: number,
  lon: number,
  hours = 48,
  forceFresh = false
): Promise<ForecastResponse> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    hours: String(hours),
    ...(forceFresh ? { force_fresh: 'true' } : {}),
  })
  return apiFetch<ForecastResponse>(`/forecast?${params.toString()}`)
}

export function fetchPlan(req: PlanRequest): Promise<PlanResponse> {
  return apiFetch<PlanResponse>('/plan', {
    method: 'POST',
    body: JSON.stringify(req),
  })
}

export function fetchBacktest(city?: string): Promise<BacktestResponse> {
  const path = city ? `/backtest?city=${encodeURIComponent(city)}` : '/backtest'
  return apiFetch<BacktestResponse>(path)
}
