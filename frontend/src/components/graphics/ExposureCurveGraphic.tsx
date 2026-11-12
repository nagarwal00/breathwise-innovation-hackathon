// Exposure Reduction Curve Graphic (Dual-Mode Muted Glassmorphism)
import { TrendingDown, Sparkles } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export function ExposureCurveGraphic() {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  return (
    <div className="glass-card p-5 space-y-4 text-slate-100 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/[0.08] pb-3">
        <div>
          <span className="text-[11px] font-bold text-[#6bb3a7] uppercase tracking-wider flex items-center gap-1.5 font-sans">
            <Sparkles className="w-3 h-3 text-[#6bb3a7]" aria-hidden="true" />
            <span>Quantified Clinical Impact</span>
          </span>
          <h4 className="text-base font-serif font-medium text-white mt-0.5">
            Diurnal Exposure Variance: 7 AM Routine vs. 3 PM Window
          </h4>
        </div>
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold font-sans ${
          isLight ? 'bg-[#2D6A5F]/15 border border-[#2D6A5F]/35 text-[#14463C]' : 'bg-[#3E8E7E]/15 border border-[#3E8E7E]/30 text-[#B2DDD6]'
        }`}>
          <TrendingDown className="w-3.5 h-3.5 text-[#6bb3a7]" aria-hidden="true" />
          <span>-42.6% Inhaled PM2.5 in Delhi</span>
        </div>
      </div>

      {/* Graphical SVG Chart */}
      <div className={`w-full aspect-[2/1] max-h-64 rounded-xl p-3 border transition-colors ${
        isLight ? 'bg-[#EDEAE1]/70 border-[#142E27]/10' : 'bg-[#090E17]/80 border-white/[0.06]'
      }`}>
        <svg viewBox="0 0 500 240" className="w-full h-full select-none" fill="none">
          <defs>
            <linearGradient id="avoidedFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3E8E7E" stopOpacity={isLight ? 0.45 : 0.35} />
              <stop offset="100%" stopColor="#3E8E7E" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="routineFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#B35656" stopOpacity={isLight ? 0.40 : 0.30} />
              <stop offset="100%" stopColor="#B35656" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="40" y1="40" x2="480" y2="40" stroke={isLight ? 'rgba(20,46,39,0.08)' : 'rgba(255,255,255,0.05)'} strokeWidth="1" strokeDasharray="3 3" />
          <line x1="40" y1="90" x2="480" y2="90" stroke={isLight ? 'rgba(20,46,39,0.08)' : 'rgba(255,255,255,0.05)'} strokeWidth="1" strokeDasharray="3 3" />
          <line x1="40" y1="140" x2="480" y2="140" stroke={isLight ? 'rgba(20,46,39,0.08)' : 'rgba(255,255,255,0.05)'} strokeWidth="1" strokeDasharray="3 3" />
          <line x1="40" y1="190" x2="480" y2="190" stroke={isLight ? 'rgba(20,46,39,0.15)' : 'rgba(255,255,255,0.10)'} strokeWidth="1.5" />

          {/* Y Axis Labels */}
          <text x="32" y="44" fill={isLight ? '#23493E' : '#94A3B8'} fontSize="10" textAnchor="end" fontFamily="sans-serif">200</text>
          <text x="32" y="94" fill={isLight ? '#23493E' : '#94A3B8'} fontSize="10" textAnchor="end" fontFamily="sans-serif">140</text>
          <text x="32" y="144" fill={isLight ? '#23493E' : '#94A3B8'} fontSize="10" textAnchor="end" fontFamily="sans-serif">80</text>
          <text x="32" y="194" fill={isLight ? '#23493E' : '#94A3B8'} fontSize="10" textAnchor="end" fontFamily="sans-serif">0</text>

          {/* X Axis Time Labels */}
          <text x="60" y="210" fill={isLight ? '#4A6B62' : '#64748B'} fontSize="10" textAnchor="middle">04:00</text>
          <text x="140" y="210" fill={isLight ? '#8A1818' : '#F2C8C8'} fontSize="10" fontWeight="bold" textAnchor="middle">07:00 AM</text>
          <text x="220" y="210" fill={isLight ? '#4A6B62' : '#64748B'} fontSize="10" textAnchor="middle">11:00</text>
          <text x="320" y="210" fill={isLight ? '#14463C' : '#B2DDD6'} fontSize="10" fontWeight="bold" textAnchor="middle">03:00 PM</text>
          <text x="420" y="210" fill={isLight ? '#4A6B62' : '#64748B'} fontSize="10" textAnchor="middle">08:00 PM</text>

          {/* Shaded Area Under Routine 7 AM Window */}
          <rect x="120" y="55" width="40" height="135" fill="url(#routineFill)" rx="4" />
          <line x1="120" y1="55" x2="160" y2="55" stroke="#B35656" strokeWidth="2" />
          <circle cx="140" cy="55" r="3.5" fill="#B35656" />

          {/* Callout for 7 AM */}
          <rect x="75" y="15" width="130" height="24" rx="6" fill={isLight ? '#FFFFFF' : '#181F2E'} stroke={isLight ? 'rgba(179,86,86,0.6)' : 'rgba(179,86,86,0.4)'} />
          <text x="140" y="31" fill={isLight ? '#8A1818' : '#F2C8C8'} fontSize="9" fontWeight="bold" textAnchor="middle">
            Routine 7 AM: 175 µg/m³
          </text>
          <line x1="140" y1="39" x2="140" y2="52" stroke="#B35656" strokeWidth="1.5" strokeDasharray="2 2" />

          {/* Shaded Area Under BreatheWise 3 PM Window */}
          <rect x="300" y="130" width="40" height="60" fill="url(#avoidedFill)" rx="4" stroke="#3E8E7E" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="300" y1="130" x2="340" y2="130" stroke="#4E9B8D" strokeWidth="2" />
          <circle cx="320" cy="130" r="3.5" fill="#4E9B8D" />

          {/* Callout for 3 PM */}
          <rect x="255" y="92" width="130" height="24" rx="6" fill={isLight ? '#FFFFFF' : '#132B25'} stroke={isLight ? 'rgba(45,106,95,0.6)' : 'rgba(62,142,126,0.5)'} />
          <text x="320" y="108" fill={isLight ? '#14463C' : '#B2DDD6'} fontSize="9" fontWeight="bold" textAnchor="middle">
            Best 3 PM: 68 µg/m³
          </text>
          <line x1="320" y1="116" x2="320" y2="126" stroke="#4E9B8D" strokeWidth="1.5" strokeDasharray="2 2" />

          {/* Diurnal PM2.5 Curve */}
          <path
            d="M40 70 C 80 50, 120 52, 140 55 C 180 62, 240 105, 280 125 C 310 135, 330 130, 360 115 C 400 90, 440 65, 480 60"
            stroke={isLight ? '#23493E' : '#94A3B8'}
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* WHO Guideline Line (15) */}
          <line x1="40" y1="178" x2="480" y2="178" stroke={isLight ? '#2D6E42' : '#6B8E5F'} strokeWidth="1.5" strokeDasharray="5 3" />
          <text x="475" y="173" fill={isLight ? '#1B4D2B' : '#CFE2C8'} fontSize="8" fontWeight="bold" textAnchor="end">
            WHO 24h Guideline (15 µg/m³)
          </text>
        </svg>
      </div>
    </div>
  )
}
