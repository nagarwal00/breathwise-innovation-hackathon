// Location Search with typed Open-Meteo geocoding and preset city chips — Frosted Glassmorphism
import React, { useEffect, useRef, useState } from 'react'
import { Building2, MapPin, Search, X } from 'lucide-react'
import { fetchCities, geocode } from '../api'
import type { CityItem, GeocodeItem } from '../api/types'

export interface SelectedLocation {
  name: string
  lat: number
  lon: number
  cityId?: string
}

interface LocationSearchProps {
  selectedLocation: SelectedLocation | null
  onLocationSelect: (loc: SelectedLocation) => void
}

const STORAGE_KEY = 'breathewise_last_location'

export function LocationSearch({
  selectedLocation,
  onLocationSelect,
}: LocationSearchProps) {
  const [query, setQuery] = useState('')
  const [cities, setCities] = useState<CityItem[]>([])
  const [results, setResults] = useState<GeocodeItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [highlightIdx, setHighlightIdx] = useState(-1)

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fetch preset cities on mount & restore last location if not set
  useEffect(() => {
    fetchCities()
      .then((data) => {
        setCities(data)
        if (!selectedLocation) {
          try {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) {
              const parsed = JSON.parse(saved)
              if (parsed?.lat && parsed?.lon && parsed?.name) {
                onLocationSelect(parsed)
                return
              }
            }
          } catch {
            // ignore
          }
          // Default to first preset city (Delhi)
          if (data.length > 0) {
            const first = data[0]
            const initial: SelectedLocation = {
              name: first.name,
              lat: first.lat,
              lon: first.lon,
              cityId: first.id,
            }
            onLocationSelect(initial)
          }
        }
      })
      .catch(() => {
        // Fallback default
        if (!selectedLocation) {
          onLocationSelect({ name: 'Delhi', lat: 28.6139, lon: 77.209, cityId: 'delhi' })
        }
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle outside clicks to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleQueryChange = (text: string) => {
    setQuery(text)
    setError(null)
    setHighlightIdx(-1)

    if (debounceTimer.current) clearTimeout(debounceTimer.current)

    const clean = text.trim()
    if (clean.length < 2) {
      setResults([])
      setOpen(false)
      setLoading(false)
      return
    }

    setLoading(true)
    debounceTimer.current = setTimeout(async () => {
      try {
        const items = await geocode(clean)
        setResults(items)
        setOpen(true)
        if (items.length === 0) {
          setError(`No locations found matching "${clean}".`)
        }
      } catch {
        setError('Geocoding service unavailable. Please pick a preset city.')
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 280)
  }

  const handleSelectPreset = (city: CityItem) => {
    const loc: SelectedLocation = {
      name: city.name,
      lat: city.lat,
      lon: city.lon,
      cityId: city.id,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loc))
    onLocationSelect(loc)
    setQuery('')
    setOpen(false)
    setResults([])
  }

  const handleSelectGeocode = (item: GeocodeItem) => {
    const loc: SelectedLocation = {
      name: item.displayName || item.name,
      lat: item.lat,
      lon: item.lon,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loc))
    onLocationSelect(loc)
    setQuery('')
    setOpen(false)
    setResults([])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIdx((prev) => (prev < results.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIdx((prev) => (prev > 0 ? prev - 1 : results.length - 1))
    } else if (e.key === 'Enter' && highlightIdx >= 0) {
      e.preventDefault()
      handleSelectGeocode(results[highlightIdx])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="space-y-3">
      {/* Current Selection Header */}
      <div className="flex items-center justify-between text-xs text-slate-300">
        <label htmlFor="location-input" className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#6bb3a7]" aria-hidden="true" />
          <span>Target Location</span>
        </label>
        {selectedLocation && (
          <span className="font-sans font-medium tabular-nums text-slate-400 text-[11px]">
            {selectedLocation.lat.toFixed(3)}°N, {selectedLocation.lon.toFixed(3)}°E
          </span>
        )}
      </div>

      {/* Autocomplete Input */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" aria-hidden="true" />
          <input
            id="location-input"
            type="search"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (results.length > 0 || error) setOpen(true)
            }}
            placeholder={selectedLocation ? `Current: ${selectedLocation.name} (type to search...)` : 'Search city, town, or district in India...'}
            className="w-full pl-9 pr-8 py-2.5 glass-input rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-[#4E9B8D] focus:ring-1 focus:ring-[#4E9B8D]/30 transition-all"
            role="combobox"
            aria-expanded={open}
            aria-autocomplete="list"
            aria-controls="geocode-results-list"
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setResults([])
                setOpen(false)
              }}
              className="absolute right-2.5 p-1 text-slate-400 hover:text-white transition-colors"
              aria-label="Clear location search"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Dropdown Menu */}
        {open && (
          <div
            id="geocode-results-list"
            className="absolute left-0 right-0 top-full mt-1.5 glass-card-elevated rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-white/5 max-h-60 overflow-y-auto"
            role="listbox"
          >
            {loading && (
              <div className="p-3 text-xs text-slate-400 flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-[#6bb3a7] border-t-transparent rounded-full animate-spin" />
                <span>Searching Open-Meteo geocoding...</span>
              </div>
            )}

            {!loading && error && (
              <div className="p-3 text-xs text-slate-300 text-center">{error}</div>
            )}

            {!loading &&
              results.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectGeocode(item)}
                  className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between transition-colors ${
                    idx === highlightIdx
                      ? 'bg-white/[0.12] text-white border-l-2 border-[#6bb3a7]'
                      : 'hover:bg-white/[0.06] text-slate-200'
                  }`}
                  role="option"
                  aria-selected={idx === highlightIdx}
                >
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="w-3.5 h-3.5 text-[#6bb3a7] shrink-0" aria-hidden="true" />
                    <span className="font-medium truncate text-white">{item.displayName}</span>
                    {item.country && <span className="text-slate-400 text-[11px] shrink-0">({item.country})</span>}
                  </div>
                  <span className="font-sans font-medium tabular-nums text-[10px] text-slate-400 ml-2 shrink-0">
                    {item.lat.toFixed(2)}, {item.lon.toFixed(2)}
                  </span>
                </button>
              ))}
          </div>
        )}
      </div>

      {/* Preset Indian City Chips */}
      <div>
        <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Building2 className="w-3 h-3 text-[#6bb3a7]" aria-hidden="true" />
          <span>Preset Monitored Basins</span>
        </p>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Quick select monitored city">
          {cities.map((city) => {
            const isSelected =
              selectedLocation?.cityId === city.id ||
              (Math.abs((selectedLocation?.lat ?? 0) - city.lat) < 0.05 &&
                Math.abs((selectedLocation?.lon ?? 0) - city.lon) < 0.05)

            return (
              <button
                key={city.id}
                type="button"
                onClick={() => handleSelectPreset(city)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${
                  isSelected
                    ? 'bg-[#3E8E7E]/30 text-[#B2DDD6] border-[#3E8E7E]/60 shadow-xs'
                    : 'glass-pill text-slate-300 hover:border-white/20 hover:text-white'
                }`}
                aria-pressed={isSelected}
              >
                {city.name}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
