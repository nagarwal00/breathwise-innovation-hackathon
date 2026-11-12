// Clinical Lung Deposition & Minute Ventilation Infographic — Dual Mode Muted Glassmorphism
import { Sparkles } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export function LungDepositionGraphic() {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  const activities = [
    {
      label: 'Outdoor Running',
      rate: '2.5 m³/h',
      factor: 'High Intake',
      color: isLight ? 'text-[#8A1818] bg-[#B35656]/15 border-[#B35656]/30' : 'text-[#F2C8C8] bg-[#B35656]/15 border-[#B35656]/30',
      barColor: 'from-[#B35656] to-[#C2934D]',
      pct: 100,
    },
    {
      label: 'Kids Playground',
      rate: '1.8 m³/h',
      factor: '1.4× Body Mass',
      color: isLight ? 'text-[#734C15] bg-[#C2934D]/15 border-[#C2934D]/30' : 'text-[#EED9B8] bg-[#C2934D]/15 border-[#C2934D]/30',
      barColor: 'from-[#C2934D] to-[#D8B478]',
      pct: 72,
    },
    {
      label: 'Daily Commute',
      rate: '1.2 m³/h',
      factor: 'Moderate',
      color: isLight ? 'text-[#1B4D42] bg-[#3E8E7E]/15 border-[#3E8E7E]/30' : 'text-[#D0E2EC] bg-[#4C6A88]/20 border-[#4C6A88]/30',
      barColor: 'from-[#4C6A88] to-[#3E8E7E]',
      pct: 48,
    },
    {
      label: 'Home Ventilation',
      rate: '1.0 m³/h',
      factor: 'Passive Flush',
      color: isLight ? 'text-[#14463C] bg-[#2D6A5F]/15 border-[#2D6A5F]/30' : 'text-[#B2DDD6] bg-[#3E8E7E]/15 border-[#3E8E7E]/30',
      barColor: 'from-[#3E8E7E] to-[#6bb3a7]',
      pct: 40,
    },
  ]

  return (
    <div className="glass-card p-5 space-y-4 text-slate-100 shadow-xl">
      <div className="border-b border-white/[0.08] pb-3">
        <span className="text-[11px] font-bold text-[#6bb3a7] uppercase tracking-wider flex items-center gap-1.5 font-sans">
          <Sparkles className="w-3 h-3 text-[#6bb3a7]" aria-hidden="true" />
          <span>Physiological Basis</span>
        </span>
        <h4 className="text-base font-serif font-medium text-white mt-0.5">
          Minute Ventilation Rates Across Activities
        </h4>
        <p className="text-xs text-slate-400 mt-0.5 font-sans">
          Inhaled dose = Particulate Concentration × Duration × Minute Ventilation Rate.
        </p>
      </div>

      <div className="space-y-4">
        {activities.map((act) => (
          <div key={act.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white font-sans">{act.label}</span>
              <div className="flex items-center gap-2 font-sans tabular-nums">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${act.color}`}>
                  {act.factor}
                </span>
                <span className={`font-bold ${isLight ? 'text-[#142E27]' : 'text-slate-200'}`}>{act.rate}</span>
              </div>
            </div>
            {/* Visual Bar */}
            <div className={`w-full rounded-full h-2.5 overflow-hidden ${isLight ? 'bg-[#142E27]/10' : 'bg-white/[0.06]'}`}>
              <div
                className={`h-full rounded-full bg-gradient-to-r ${act.barColor} transition-all`}
                style={{ width: `${act.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
