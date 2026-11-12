// Atmospheric Inversion vs. Solar Mixing Scientific Diagram (Dual-Mode Frosted Glassmorphism)
import { useState } from 'react'
import { Sun, Moon, Sparkles } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export function AtmosphericInversionGraphic() {
  const [mode, setMode] = useState<'morning' | 'afternoon'>('morning')
  const { theme } = useTheme()
  const isLight = theme === 'light'

  return (
    <div className="glass-card overflow-hidden transition-all text-slate-100 p-0 shadow-xl">
      {/* Graphic Header / Toggle */}
      <div className="border-b border-white/[0.08] px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 bg-white/[0.02]">
        <div>
          <span className="text-[11px] font-bold text-[#6bb3a7] uppercase tracking-wider flex items-center gap-1.5 font-sans">
            <Sparkles className="w-3 h-3 text-[#6bb3a7]" aria-hidden="true" />
            <span>Atmospheric Boundary Layer Physics</span>
          </span>
          <h4 className="text-base font-serif font-medium text-white mt-0.5">
            Surface Temperature Inversion vs. Solar Convective Mixing
          </h4>
        </div>

        {/* Interactive Mode Switcher */}
        <div className="flex items-center gap-1 glass-pill p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setMode('morning')
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              mode === 'morning'
                ? isLight
                  ? 'bg-[#B35656]/20 text-[#8A1818] border border-[#B35656]/40 shadow-xs'
                  : 'bg-[#B35656]/25 text-[#F2C8C8] border border-[#B35656]/50 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-[#B35656]" aria-hidden="true" />
            <span>07:00 AM (Inversion Trap)</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setMode('afternoon')
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              mode === 'afternoon'
                ? isLight
                  ? 'bg-[#2D6A5F]/20 text-[#14463C] border border-[#2D6A5F]/40 shadow-xs'
                  : 'bg-[#3E8E7E]/30 text-[#B2DDD6] border border-[#3E8E7E]/50 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-[#C2934D]" aria-hidden="true" />
            <span>03:00 PM (Clean Window)</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas Diagram */}
      <div className={`p-4 sm:p-6 transition-colors ${isLight ? 'bg-[#EDEAE1]/70' : 'bg-[#0a0f18]/80'}`}>
        <div className="relative w-full aspect-[16/9] max-h-80 sm:max-h-96">
          <svg
            viewBox="0 0 600 320"
            className="w-full h-full rounded-2xl select-none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Sky Background Gradients */}
            <defs>
              <linearGradient id="morningSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isLight ? '#1B263B' : '#0B101B'} />
                <stop offset="50%" stopColor={isLight ? '#2E3D52' : '#1A2234'} />
                <stop offset="100%" stopColor={isLight ? '#473322' : '#352317'} stopOpacity={isLight ? 0.7 : 0.5} />
              </linearGradient>
              <linearGradient id="afternoonSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isLight ? '#2B5A5C' : '#102A36'} />
                <stop offset="50%" stopColor={isLight ? '#3E7B73' : '#1B4745'} />
                <stop offset="100%" stopColor={isLight ? '#5D9B8A' : '#2D6B5F'} stopOpacity={isLight ? 0.8 : 0.6} />
              </linearGradient>
              <linearGradient id="inversionGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#80353F" stopOpacity={isLight ? 0.90 : 0.82} />
                <stop offset="50%" stopColor="#BA7347" stopOpacity={isLight ? 0.80 : 0.70} />
                <stop offset="100%" stopColor="#4A1E24" stopOpacity={isLight ? 0.95 : 0.88} />
              </linearGradient>
            </defs>

            {/* Atmosphere Backdrop */}
            <rect
              width="600"
              height="320"
              rx="16"
              fill={mode === 'morning' ? 'url(#morningSky)' : 'url(#afternoonSky)'}
            />

            {/* City Skyline Silhouette */}
            <path
              d="M0 290h25v-20h15v-35h30v55h20v-40h25v-20h20v60h35v-50h25v-30h30v80h30v-45h20v-25h25v70h40v-60h25v20h25v40h35v-35h30v-25h20v60h55v-45h25v-20h20v65h40v-55h25v25h20v30h20v-20h20v20H600v30H0z"
              fill={isLight ? '#0D131B' : '#060A10'}
              opacity="0.95"
            />

            {/* Ground Roadway */}
            <rect x="0" y="290" width="600" height="30" fill={isLight ? '#0A0F16' : '#030508'} />
            <line x1="0" y1="305" x2="600" y2="305" stroke="#475569" strokeWidth="2" strokeDasharray="15 10" />

            {/* MORNING STATE: NOCTURNAL TEMPERATURE INVERSION */}
            {mode === 'morning' ? (
              <g className="transition-opacity duration-500">
                {/* Cold early morning crescent moon */}
                <circle cx="510" cy="55" r="18" fill="#F1F5F9" opacity="0.85" />
                <circle cx="518" cy="50" r="16" fill={isLight ? '#1B263B' : '#0B101B'} />

                {/* Stagnant Inversion Boundary Layer (<200m) */}
                <rect x="0" y="160" width="600" height="130" fill="url(#inversionGrad)" />

                {/* Warm Inversion Lid Capping The Valley */}
                <line x1="0" y1="160" x2="600" y2="160" stroke="#F2994A" strokeWidth="2.5" strokeDasharray="6 4" />
                <rect x="150" y="146" width="300" height="26" rx="6" fill="#0B0F17" stroke="#F2994A" strokeWidth="1.2" />
                <text x="300" y="163" fill="#F2DFBD" fontSize="11" fontWeight="bold" textAnchor="middle" letterSpacing="1">
                  WARM INVERSION LID (Atmospheric Cap ~200m)
                </text>

                {/* Trapped Particulate Particles */}
                <circle cx="60" cy="245" r="3" fill="#FFF" opacity="0.6" />
                <circle cx="110" cy="225" r="3.5" fill="#FFF" opacity="0.5" />
                <circle cx="180" cy="255" r="2.5" fill="#FFF" opacity="0.7" />
                <circle cx="230" cy="205" r="3" fill="#FFF" opacity="0.6" />
                <circle cx="290" cy="240" r="3.5" fill="#FFF" opacity="0.5" />
                <circle cx="360" cy="215" r="2.5" fill="#FFF" opacity="0.7" />
                <circle cx="430" cy="250" r="3" fill="#FFF" opacity="0.6" />
                <circle cx="500" cy="230" r="3.5" fill="#FFF" opacity="0.5" />
                <circle cx="550" cy="260" r="2.5" fill="#FFF" opacity="0.7" />

                {/* Danger Smog Callout Banner */}
                <rect x="170" y="195" width="260" height="38" rx="8" fill="#180B0F" fillOpacity="0.95" stroke="rgba(212,74,74,0.5)" />
                <text x="300" y="211" fill="#FFC8C8" fontSize="10" fontWeight="bold" textAnchor="middle">
                  TOXIC PARTICULATES TRAPPED
                </text>
                <text x="300" y="225" fill="#F9D8C6" fontSize="10" textAnchor="middle">
                  PM2.5: 180–320 µg/m³ · Stagnant Ground Layer
                </text>

                {/* Human Walking in Toxic Fog */}
                <circle cx="100" cy="268" r="5" fill="#D44A4A" />
                <path d="M100 274v12m-4-8h8m-8 12l4-4 4 4" stroke="#D44A4A" strokeWidth="1.8" strokeLinecap="round" />
                <text x="100" y="258" fill="#FFC8C8" fontSize="9" fontWeight="bold" textAnchor="middle">
                  7 AM Routine (High Exposure)
                </text>
              </g>
            ) : (
              /* AFTERNOON THERMAL DISPERSION STATE */
              <g className="transition-opacity duration-500">
                {/* Sun with radiant beams */}
                <circle cx="500" cy="65" r="26" fill="#C2934D" />
                <circle cx="500" cy="65" r="36" fill="#C2934D" opacity="0.25" />

                {/* Convective Updraft Arrows (Mixing) */}
                <path d="M120 270V120m-5 10l5-10 5 10" stroke="#6BB3A7" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M280 270V100m-5 10l5-10 5 10" stroke="#6BB3A7" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M440 270V110m-5 10l5-10 5 10" stroke="#6BB3A7" strokeWidth="2.2" strokeLinecap="round" />

                {/* Planetary Boundary Layer Expanded */}
                <line x1="0" y1="80" x2="600" y2="80" stroke="#6BB3A7" strokeWidth="1.8" strokeDasharray="8 6" opacity="0.6" />
                <text x="20" y="74" fill="#B2DDD6" fontSize="11" fontWeight="bold">
                  EXPANDED MIXING LAYER (~1,200m Deep Boundary Layer)
                </text>

                {/* Clean Air Notice */}
                <rect x="170" y="195" width="260" height="38" rx="8" fill="#132B25" fillOpacity="0.95" stroke="rgba(62,142,126,0.5)" />
                <text x="300" y="211" fill="#B2DDD6" fontSize="10" fontWeight="bold" textAnchor="middle">
                  SOLAR CONVECTION DILUTES PARTICULATES
                </text>
                <text x="300" y="225" fill="#CFE2C8" fontSize="10" textAnchor="middle">
                  PM2.5: 50–75 µg/m³ · 42% Lower Inhalation
                </text>

                {/* Human in Clean Air */}
                <circle cx="100" cy="268" r="5" fill="#3E8E7E" />
                <path d="M100 274v12m-4-8h8m-8 12l4-4 4 4" stroke="#3E8E7E" strokeWidth="1.8" strokeLinecap="round" />
                <text x="100" y="258" fill="#B2DDD6" fontSize="9" fontWeight="bold" textAnchor="middle">
                  3 PM Recommended Window
                </text>
              </g>
            )}
          </svg>
        </div>
      </div>
    </div>
  )
}
