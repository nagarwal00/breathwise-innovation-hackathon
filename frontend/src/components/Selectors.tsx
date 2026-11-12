// Health Profile & Activity Selectors — Dual-Mode Muted Atmospheric Glassmorphism
import { useState } from 'react'
import {
  Activity,
  Baby,
  Bike,
  Briefcase,
  Footprints,
  GraduationCap,
  HardHat,
  Heart,
  Home,
  Shield,
  ShieldAlert,
  ShoppingBag,
  Sun,
  Train,
  User,
  Zap,
} from 'lucide-react'
import {
  ACTIVITY_GROUPS,
  HEALTH_PROFILES,
  getActivitiesForProfile,
  type ActivityGroupKey,
} from '../api/types'
import { useTheme } from '../context/ThemeContext'

interface ProfileSelectorProps {
  selectedProfile: string
  onProfileChange: (id: string) => void
}

function renderProfileIcon(iconType: string, isSelected: boolean, isLight: boolean) {
  const baseClass = 'w-4 h-4 shrink-0 transition-transform group-hover:scale-105'
  switch (iconType) {
    case 'baby':
      return <Baby className={`${baseClass} ${isSelected ? (isLight ? 'text-[#2D6E42]' : 'text-[#CFE2C8]') : 'text-slate-400'}`} aria-hidden="true" />
    case 'hard-hat':
      return <ShieldAlert className={`${baseClass} ${isSelected ? (isLight ? 'text-[#8A5012]' : 'text-[#EED9B8]') : 'text-slate-400'}`} aria-hidden="true" />
    case 'heart':
      return <Heart className={`${baseClass} ${isSelected ? (isLight ? 'text-[#8A1818]' : 'text-[#F2C8C8]') : 'text-slate-400'}`} aria-hidden="true" />
    case 'activity':
      return <Activity className={`${baseClass} ${isSelected ? (isLight ? 'text-[#1E6554]' : 'text-[#B2DDD6]') : 'text-slate-400'}`} aria-hidden="true" />
    default:
      return <User className={`${baseClass} ${isSelected ? (isLight ? 'text-[#142E27]' : 'text-white') : 'text-slate-400'}`} aria-hidden="true" />
  }
}

export function ProfileSelector({ selectedProfile, onProfileChange }: ProfileSelectorProps) {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className={`text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 ${
          isLight ? 'text-[#23493E]' : 'text-slate-300'
        }`}>
          <Shield className="w-3.5 h-3.5 text-[#6bb3a7]" aria-hidden="true" />
          <span>Health Vulnerability Profile</span>
        </label>
        <span className={`text-[11px] font-sans font-medium tabular-nums glass-pill px-2.5 py-0.5 rounded-full ${
          isLight ? 'text-[#1E6554] border-[#1E6554]/20' : 'text-[#B2DDD6]'
        }`}>
          Dose factor: {HEALTH_PROFILES[selectedProfile]?.sensitivityFactor ?? 1.0}×
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="radiogroup" aria-label="Select health profile">
        {Object.values(HEALTH_PROFILES).map((prof) => {
          const isSelected = selectedProfile === prof.id
          return (
            <button
              key={prof.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onProfileChange(prof.id)}
              className={`group text-left p-2.5 rounded-2xl border text-xs transition-all relative flex flex-col justify-between min-h-[74px] backdrop-blur-md cursor-pointer ${
                isSelected
                  ? isLight
                    ? 'bg-[#1E6554]/12 border-[#1E6554]/45 text-[#142E27] shadow-xs ring-1 ring-[#1E6554]/30'
                    : 'bg-[#3E8E7E]/20 border-[#3E8E7E]/60 text-white shadow-xs ring-1 ring-[#3E8E7E]/30'
                  : isLight
                    ? 'bg-white/70 border-[#142E27]/10 text-[#3C5850] hover:bg-white hover:border-[#142E27]/20'
                    : 'bg-white/[0.04] border-white/8 text-slate-300 hover:bg-white/[0.08] hover:border-white/16'
              }`}
            >
              <div className="flex items-center justify-between gap-1 w-full mb-1">
                <div className="flex items-center gap-1.5 truncate">
                  {renderProfileIcon(prof.iconType, isSelected, isLight)}
                  <span className={`font-semibold truncate ${
                    isSelected
                      ? isLight ? 'text-[#142E27] font-bold' : 'text-white'
                      : isLight ? 'text-[#23493E]' : 'text-slate-200'
                  }`}>
                    {prof.label}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-sans font-semibold tabular-nums px-1.5 py-0.5 rounded-lg shrink-0 ${
                    isSelected
                      ? isLight
                        ? 'bg-[#1E6554]/18 text-[#14463C] font-bold border border-[#1E6554]/30'
                        : 'bg-[#3E8E7E]/30 text-[#B2DDD6] font-bold border border-[#3E8E7E]/40'
                      : isLight
                        ? 'bg-[#142E27]/05 text-[#4A6B62] border border-[#142E27]/10'
                        : 'bg-white/[0.06] text-slate-400 border border-white/[0.06]'
                  }`}
                >
                  {prof.sensitivityFactor}×
                </span>
              </div>
              <p className={`text-[11px] leading-tight line-clamp-2 ${
                isSelected
                  ? isLight ? 'text-[#1E6554] font-medium' : 'text-[#B2DDD6]/90'
                  : isLight ? 'text-[#4A6B62]' : 'text-slate-300'
              }`}>
                {prof.shortDesc}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface ActivitySelectorProps {
  selectedActivity: string
  onActivityChange: (id: string) => void
  selectedProfile?: string
}

function renderActivityIcon(iconType: string, isSelected: boolean, isLight: boolean) {
  const baseClass = 'w-4 h-4 shrink-0 transition-transform group-hover:scale-105'
  switch (iconType) {
    case 'briefcase':
      return <Briefcase className={`${baseClass} ${isSelected ? (isLight ? 'text-[#1E6554]' : 'text-[#B2DDD6]') : 'text-slate-400'}`} aria-hidden="true" />
    case 'train':
      return <Train className={`${baseClass} ${isSelected ? (isLight ? 'text-[#1E6554]' : 'text-[#B2DDD6]') : 'text-slate-400'}`} aria-hidden="true" />
    case 'school':
      return <GraduationCap className={`${baseClass} ${isSelected ? (isLight ? 'text-[#1E6554]' : 'text-[#B2DDD6]') : 'text-slate-400'}`} aria-hidden="true" />
    case 'shopping':
      return <ShoppingBag className={`${baseClass} ${isSelected ? (isLight ? 'text-[#8A5012]' : 'text-[#EED9B8]') : 'text-slate-400'}`} aria-hidden="true" />
    case 'bike':
      return <Bike className={`${baseClass} ${isSelected ? (isLight ? 'text-[#2D6E42]' : 'text-[#CFE2C8]') : 'text-slate-400'}`} aria-hidden="true" />
    case 'walking':
      return <Footprints className={`${baseClass} ${isSelected ? (isLight ? 'text-[#2D6E42]' : 'text-[#CFE2C8]') : 'text-slate-400'}`} aria-hidden="true" />
    case 'baby':
      return <Baby className={`${baseClass} ${isSelected ? (isLight ? 'text-[#8A5012]' : 'text-[#EED9B8]') : 'text-slate-400'}`} aria-hidden="true" />
    case 'home':
      return <Home className={`${baseClass} ${isSelected ? (isLight ? 'text-[#1E6554]' : 'text-[#B2DDD6]') : 'text-slate-400'}`} aria-hidden="true" />
    case 'work':
      return <HardHat className={`${baseClass} ${isSelected ? (isLight ? 'text-[#8A5012]' : 'text-[#EED9B8]') : 'text-slate-400'}`} aria-hidden="true" />
    case 'sun':
      return <Sun className={`${baseClass} ${isSelected ? (isLight ? 'text-[#7A531C]' : 'text-[#F2DFBD]') : 'text-slate-400'}`} aria-hidden="true" />
    case 'activity':
      return <Activity className={`${baseClass} ${isSelected ? (isLight ? 'text-[#1E6554]' : 'text-[#B2DDD6]') : 'text-slate-400'}`} aria-hidden="true" />
    default:
      return <Zap className={`${baseClass} ${isSelected ? '#6bb3a7' : 'text-slate-400'}`} aria-hidden="true" />
  }
}

export function ActivitySelector({ selectedActivity, onActivityChange, selectedProfile = 'healthy_adult' }: ActivitySelectorProps) {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  // Load strictly realistic, clinically & practically valid activities for this individual profile
  const allowedActivities = getActivitiesForProfile(selectedProfile).filter(
    (act) => act.id !== 'exercise' && act.id !== 'commute'
  )

  const [selectedGroup, setSelectedGroup] = useState<ActivityGroupKey | 'all'>('all')

  // Find which category groups are actually relevant for this individual's allowed activities
  const relevantGroupIds = new Set(allowedActivities.map((act) => act.categoryGroup))
  const visibleGroups = ACTIVITY_GROUPS.filter((g) => relevantGroupIds.has(g.id))

  const displayedActivities = allowedActivities.filter(
    (act) => selectedGroup === 'all' || act.categoryGroup === selectedGroup
  )

  const profileLabel = HEALTH_PROFILES[selectedProfile]?.label ?? 'Selected Profile'

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className={`text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 ${
          isLight ? 'text-[#23493E]' : 'text-slate-300'
        }`}>
          <Activity className="w-3.5 h-3.5 text-[#6bb3a7]" aria-hidden="true" />
          <span>Feasible Activities for {profileLabel}</span>
        </label>
        <span className={`text-[11px] font-sans font-medium glass-pill px-2.5 py-0.5 rounded-full ${
          isLight ? 'text-[#1E6554] border-[#1E6554]/20' : 'text-[#B2DDD6]'
        }`}>
          {displayedActivities.length} feasible {displayedActivities.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Category Filter Pills (Only showing groups containing feasible activities) */}
      {visibleGroups.length > 1 && (
        <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Activity Categories">
          <button
            type="button"
            role="tab"
            aria-selected={selectedGroup === 'all'}
            onClick={() => setSelectedGroup('all')}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all font-sans cursor-pointer ${
              selectedGroup === 'all'
                ? isLight
                  ? 'bg-[#1E6554]/15 text-[#14463C] border border-[#1E6554]/30 shadow-xs font-bold'
                  : 'bg-[#3E8E7E]/25 text-[#B2DDD6] border border-[#3E8E7E]/40 shadow-xs font-bold'
                : isLight
                  ? 'bg-white/60 text-[#4A6B62] hover:text-[#142E27] border border-[#142E27]/10'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/6'
            }`}
          >
            All Realistic ({allowedActivities.length})
          </button>
          {visibleGroups.map((g) => (
            <button
              key={g.id}
              type="button"
              role="tab"
              aria-selected={selectedGroup === g.id}
              onClick={() => setSelectedGroup(g.id)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all font-sans cursor-pointer ${
                selectedGroup === g.id
                  ? isLight
                    ? 'bg-[#1E6554]/15 text-[#14463C] border border-[#1E6554]/30 shadow-xs font-bold'
                    : 'bg-[#3E8E7E]/25 text-[#B2DDD6] border border-[#3E8E7E]/40 shadow-xs font-bold'
                  : isLight
                    ? 'bg-white/60 text-[#4A6B62] hover:text-[#142E27] border border-[#142E27]/10'
                    : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/6'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      )}

      {/* Grid of Action Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="radiogroup" aria-label="Select planned outdoor activity">
        {displayedActivities.map((act) => {
          const isSelected = selectedActivity === act.id || (selectedActivity === 'exercise' && act.id === 'exercise_running') || (selectedActivity === 'commute' && act.id === 'morning_commute')
          return (
            <button
              key={act.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onActivityChange(act.id)}
              className={`group text-left p-3 rounded-2xl border text-xs transition-all flex flex-col justify-between min-h-[78px] backdrop-blur-md cursor-pointer ${
                isSelected
                  ? isLight
                    ? 'bg-[#1E6554]/12 border-[#1E6554]/45 text-[#142E27] shadow-xs ring-1 ring-[#1E6554]/30'
                    : 'bg-[#3E8E7E]/20 border-[#3E8E7E]/60 text-white shadow-xs ring-1 ring-[#3E8E7E]/30'
                  : isLight
                    ? 'bg-white/70 border-[#142E27]/10 text-[#3C5850] hover:bg-white hover:border-[#142E27]/20'
                    : 'bg-white/[0.04] border-white/8 text-slate-300 hover:bg-white/[0.08] hover:border-white/16'
              }`}
            >
              <div className="flex items-center justify-between gap-1 w-full mb-1">
                <div className="flex items-center gap-2 truncate">
                  {renderActivityIcon(act.iconType, isSelected, isLight)}
                  <span className={`font-semibold truncate ${
                    isSelected
                      ? isLight ? 'text-[#142E27] font-bold' : 'text-white'
                      : isLight ? 'text-[#23493E]' : 'text-slate-200'
                  }`}>
                    {act.label}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-sans font-semibold tabular-nums px-2 py-0.5 rounded-lg shrink-0 ${
                    isSelected
                      ? isLight
                        ? 'bg-[#1E6554]/18 text-[#14463C] font-bold border border-[#1E6554]/30'
                        : 'bg-[#3E8E7E]/30 text-[#B2DDD6] font-bold border border-[#3E8E7E]/40'
                      : isLight
                        ? 'bg-[#142E27]/05 text-[#4A6B62] border border-[#142E27]/10'
                        : 'bg-white/[0.06] text-slate-400 border border-white/[0.06]'
                  }`}
                >
                  {act.ventilationRate} m³/h
                </span>
              </div>
              <p className={`text-[11px] leading-tight line-clamp-2 ${
                isSelected
                  ? isLight ? 'text-[#1E6554] font-medium' : 'text-[#B2DDD6]/90'
                  : isLight ? 'text-[#4A6B62]' : 'text-slate-300'
              }`}>
                {act.description}
              </p>
              <div className={`mt-1.5 flex items-center justify-between text-[10px] font-sans border-t pt-1 ${
                isLight ? 'border-[#142E27]/10 text-[#63847B]' : 'border-white/[0.04] text-slate-400'
              }`}>
                <span>{act.categoryGroupLabel}</span>
                <span className="tabular-nums">Usual: {act.defaultUsualStart}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
