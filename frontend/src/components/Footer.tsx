import { Link } from 'react-router-dom'
import { Wind, Sparkles } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export function Footer() {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  return (
    <footer
      className={`border-t py-8 mt-auto text-xs transition-colors ${
        isLight
          ? 'bg-[#EFECE4] border-[#142E27]/12 text-[#3C5850]'
          : 'bg-black/35 border-white/[0.08] text-slate-400'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                isLight
                  ? 'bg-[#1E6554]/12 border border-[#1E6554]/30 text-[#14463C]'
                  : 'bg-[#3E8E7E]/20 border border-[#3E8E7E]/40 text-[#B2DDD6]'
              }`}
            >
              <Wind className="w-3.5 h-3.5" aria-hidden="true" />
            </div>
            <span
              className={`font-bold text-base font-sans tracking-tight ${
                isLight ? 'text-[#142E27]' : 'text-white'
              }`}
            >
              Breathe<span className={isLight ? 'text-[#1E6554]' : 'text-[#6bb3a7]'}>Wise</span>
            </span>
            <span className={`font-sans text-xs ${isLight ? 'text-[#4A6B62]' : 'text-slate-400'}`}>
              · Personal Air-Quality Exposure Optimization Engine
            </span>
          </div>

          <div
            className={`flex items-center gap-5 font-sans font-medium ${
              isLight ? 'text-[#23493E]' : 'text-slate-300'
            }`}
          >
            <Link
              to="/plan"
              className={`transition-colors ${isLight ? 'hover:text-[#142E27]' : 'hover:text-white'}`}
            >
              Planner
            </Link>
            <Link
              to="/forecast"
              className={`transition-colors ${isLight ? 'hover:text-[#142E27]' : 'hover:text-white'}`}
            >
              Forecast
            </Link>
            <Link
              to="/proof"
              className={`transition-colors ${isLight ? 'hover:text-[#142E27]' : 'hover:text-white'}`}
            >
              Proof
            </Link>
            <Link
              to="/about"
              className={`transition-colors ${isLight ? 'hover:text-[#142E27]' : 'hover:text-white'}`}
            >
              About & Team
            </Link>
          </div>
        </div>

        {/* Member Attribution Banner */}
        <div
          className={`pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] ${
            isLight ? 'border-[#142E27]/10 text-[#3C5850]' : 'border-white/[0.06] text-slate-400'
          }`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className={`font-semibold font-sans ${isLight ? 'text-[#142E27]' : 'text-slate-300'}`}>
              Co-Architected & Built by:
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold font-sans shadow-xs ${
                isLight
                  ? 'bg-[#1E6554]/12 border border-[#1E6554]/30 text-[#14463C]'
                  : 'bg-[#3E8E7E]/15 border border-[#3E8E7E]/30 text-[#B2DDD6]'
              }`}
            >
              <Sparkles className="w-3 h-3 text-[#6bb3a7]" />
              <span>Nistha Agarwal</span>
            </span>
            <span className={`font-semibold ${isLight ? 'text-[#4A6B62]' : 'text-slate-400'}`}>&</span>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold font-sans shadow-xs ${
                isLight
                  ? 'bg-[#1E6554]/12 border border-[#1E6554]/30 text-[#14463C]'
                  : 'bg-[#3E8E7E]/15 border border-[#3E8E7E]/30 text-[#B2DDD6]'
              }`}
            >
              <Sparkles className="w-3 h-3 text-[#6bb3a7]" />
              <span>Dhruv Gupta</span>
            </span>
          </div>

          <div className={`font-sans ${isLight ? 'text-[#4A6B62]' : 'text-slate-400'}`}>
            Built for <strong className={isLight ? 'text-[#142E27]' : 'text-slate-200'}>Innovate Hackathon 2026</strong> · Atmospheric Physics & Real-Time Exposure Reduction
          </div>
        </div>
      </div>
    </footer>
  )
}
