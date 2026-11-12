// BreatheWise Navigation Bar — Zero-Collision Floating Frosted Glass Capsule
import { Link, NavLink } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  Compass,
  LineChart,
  Moon,
  ShieldCheck,
  Sun,
  Wind,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

interface NavbarProps {
  language?: 'en' | 'hi'
  onLanguageChange?: (lang: 'en' | 'hi') => void
}

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Compass, title: 'BreatheWise introduction & atmospheric science' },
  { to: '/plan', label: 'Planner', icon: CalendarClock, title: 'Personal outdoor activity schedule' },
  { to: '/forecast', label: 'Forecast', icon: LineChart, title: '48-hour PM2.5 trajectory' },
  { to: '/proof', label: 'Proof', icon: ShieldCheck, title: '30-day walk-forward backtest' },
  { to: '/about', label: 'About', icon: BookOpen, title: 'Scientific methodology and data sources' },
]

export function Navbar({ language = 'en', onLanguageChange }: NavbarProps) {
  const { theme, toggleTheme } = useTheme()
  const isLight = theme === 'light'

  return (
    <div className="sticky top-3.5 z-50 px-3 sm:px-6 max-w-7xl mx-auto w-full">
      <header className="glass-nav rounded-2xl px-3.5 sm:px-5 py-2 flex items-center justify-between gap-2 sm:gap-4 transition-all">
        {/* Brand Wordmark */}
        <Link
          to="/"
          className="flex items-center gap-2 group shrink-0 transition-opacity hover:opacity-90"
          aria-label="BreatheWise Home"
        >
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shadow-xs transition-colors ${
            isLight
              ? 'bg-[#1E6554]/12 border border-[#1E6554]/30 text-[#14463C]'
              : 'bg-[#3E8E7E]/20 border border-[#3E8E7E]/30 text-[#B2DDD6]'
          }`}>
            <Wind className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <span className={`font-sans font-bold text-base sm:text-lg tracking-tight ${
            isLight ? 'text-[#142E27]' : 'text-white'
          }`}>
            Breathe<span className={isLight ? 'text-[#1E6554]' : 'text-[#6bb3a7]'}>Wise</span>
          </span>
        </Link>

        {/* Central Navigation Links (Compact & Guaranteed Non-Colliding) */}
        <nav aria-label="Main Navigation" className="overflow-x-auto no-scrollbar">
          <ul className="flex items-center gap-1 sm:gap-1.5" role="list">
            {NAV_ITEMS.map(({ to, label, icon: Icon, title }) => (
              <li key={to} className="shrink-0">
                <NavLink
                  to={to}
                  end={to === '/'}
                  title={title}
                  className={({ isActive }) =>
                    `flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-[13px] font-medium transition-all ${
                      isActive
                        ? isLight
                          ? 'bg-[#142E27]/10 text-[#142E27] border border-[#142E27]/20 font-bold shadow-xs'
                          : 'bg-white/[0.12] text-white border border-white/[0.14] shadow-xs'
                        : isLight
                          ? 'text-[#23493E] hover:text-[#142E27] hover:bg-[#142E27]/05'
                          : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5 text-[#6bb3a7] shrink-0" aria-hidden="true" />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Dual Theme Switcher (Light / Dark) */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`p-1.5 rounded-xl border transition-all flex items-center justify-center shadow-xs ${
              isLight
                ? 'border-[#142E27]/15 bg-[#142E27]/06 hover:bg-[#142E27]/10 text-[#142E27]'
                : 'border-white/[0.10] bg-black/20 hover:bg-white/[0.08] text-slate-300 hover:text-white'
            }`}
            title={theme === 'dark' ? 'Switch to Light Mode (Beige / Forest Green)' : 'Switch to Dark Mode (Twilight Slate)'}
            aria-label="Toggle theme mode"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#EED9B8]" aria-hidden="true" />
            ) : (
              <Moon className="w-4 h-4 text-[#142E27]" aria-hidden="true" />
            )}
          </button>

          {/* Language Switcher */}
          {onLanguageChange && (
            <div
              className="flex items-center border border-white/[0.08] rounded-xl p-0.5 text-xs font-semibold bg-black/20"
              role="group"
              aria-label="Select language"
            >
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`px-2 py-0.5 rounded-lg text-[11px] transition-all ${
                  language === 'en'
                    ? 'bg-[#3E8E7E]/30 text-[#B2DDD6] border border-[#3E8E7E]/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                aria-pressed={language === 'en'}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('hi')}
                className={`px-2 py-0.5 rounded-lg text-[11px] transition-all ${
                  language === 'hi'
                    ? 'bg-[#3E8E7E]/30 text-[#B2DDD6] border border-[#3E8E7E]/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                aria-pressed={language === 'hi'}
              >
                HI
              </button>
            </div>
          )}

          {/* Launch App Button */}
          <Link
            to="/plan"
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 bg-[#2D6A5F]/80 hover:bg-[#3E8E7E] text-white text-xs font-semibold rounded-xl border border-[#4E9B8D]/40 transition-all shadow-xs hover:shadow-[0_0_14px_rgba(78,155,141,0.3)]"
          >
            <span className="hidden xs:inline">App</span>
            <span className="xs:hidden sm:inline">Launch App</span>
            <ArrowRight className="w-3 h-3 text-[#B2DDD6]" aria-hidden="true" />
          </Link>
        </div>
      </header>
    </div>
  )
}
