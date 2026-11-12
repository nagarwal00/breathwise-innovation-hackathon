// BreatheWise Type Definitions matching Backend Pydantic Schemas and Section 17 Design System

export interface CityItem {
  id: string
  name: string
  lat: number
  lon: number
  state: string
}

export interface GeocodeItem {
  id: number
  name: string
  lat: number
  lon: number
  admin1?: string
  country?: string
  displayName: string
}

export interface DataStatusModel {
  source: 'live' | 'cache'
  cached_at?: string | null
  cache_age_min?: number | null
  is_fallback?: boolean
  fallback_reason?: string | null
}

export interface LocationModel {
  name: string
  lat: number
  lon: number
}

export interface WindowItem {
  start: string // ISO string or HH:MM
  end: string
  mean_pm25: number
  category: string
  verdict?: string | null
}

export interface AvoidWindowItem {
  start: string
  end: string
  mean_pm25: number
  category: string
}

export interface UsualWindowItem {
  start: string
  mean_pm25: number
}

export interface ExposureModel {
  usual_dose: number
  recommended_dose: number
  avoided_pct: number
  method: string
}

export interface PlanRequest {
  lat: number
  lon: number
  profile: string
  activity: string
  duration_min: number
  allowed_start: string
  allowed_end: string
  usual_start: string
  schedule_flexibility?: 'strict' | 'moderate' | 'flexible'
  language: 'en' | 'hi'
  force_fresh?: boolean
}

export interface PlanResponse {
  generated_at: string
  data_status: DataStatusModel
  location: LocationModel
  best_windows: WindowItem[]
  avoid_windows: AvoidWindowItem[]
  usual_window: UsualWindowItem
  exposure: ExposureModel
  verdict: string
  advice: string
  mask_recommended: boolean
  indoor_alternative: boolean
  disclaimer: string
}

export interface CurrentAQResponse {
  time: string
  lat: number
  lon: number
  pm25: number
  pm10: number
  category: string
  category_color: string
  trend: 'rising' | 'falling' | 'stable'
  trend_delta_3h: number
  verdict: string
  profile: string
  data_status: DataStatusModel
}

export interface HourlyForecastItem {
  time: string
  horizon_h: number
  pm25_p50: number
  pm25_p10: number
  pm25_p90: number
  category: string
  category_color: string
}

export interface ForecastResponse {
  generated_at: string
  data_status: DataStatusModel
  lat: number
  lon: number
  who_reference_24h: number
  forecast: HourlyForecastItem[]
}

export interface BacktestDailyPoint {
  date: string
  usual_pm25: number
  recommended_pm25: number
  oracle_pm25: number
  reduction_pct: number
  oracle_reduction_pct: number
  recommended_start: string
  verdict: string
}

export interface BacktestCityData {
  city_name: string
  days: number
  mean_exposure_reduction_pct: number
  median_exposure_reduction_pct: number
  pct_days_improved: number
  pct_days_avoid: number
  oracle_mean_reduction_pct: number
  mae: {
    model: number
    persistence: number
    seasonal_naive: number
  }
  daily_series: BacktestDailyPoint[]
}

export interface ModelMetricsData {
  generated_at: string
  overall: {
    model: {
      mae: number
      rmse: number
      bias: number
      category_accuracy_pct: number
      within_one_category_pct: number
      interval_coverage_pct: number
    }
    persistence: {
      mae: number
      rmse: number
      bias: number
      category_accuracy_pct: number
      within_one_category_pct: number
    }
    seasonal_naive: {
      mae: number
      rmse: number
      bias: number
      category_accuracy_pct: number
      within_one_category_pct: number
    }
    mae_improvement_vs_persistence_pct: number
    mae_improvement_vs_seasonal_pct: number
  }
  by_horizon: {
    '1_to_6h': {
      horizon_hours: string
      model: { mae: number; interval_coverage_pct: number }
      persistence: { mae: number }
      seasonal_naive: { mae: number }
    }
    '7_to_24h': {
      horizon_hours: string
      model: { mae: number; interval_coverage_pct: number }
      persistence: { mae: number }
      seasonal_naive: { mae: number }
    }
    '25_to_48h': {
      horizon_hours: string
      model: { mae: number; interval_coverage_pct: number }
      persistence: { mae: number }
      seasonal_naive: { mae: number }
    }
  }
}

export interface BacktestResponse {
  generated_at: string
  test_period: {
    start: string
    end: string
    days: number
  }
  cities: Record<string, BacktestCityData>
  assumptions: string[]
  model_metrics?: ModelMetricsData
}

export interface HealthResponse {
  status: string
  model_loaded: boolean
  cities_loaded: number
  version: string
}

export interface CategoryMeta {
  label: string
  color: string
  bgTintDark: string
  bgTintLight: string
  textColorDark: string
  textColorLight: string
  textColor?: string
  range: string
  healthText: string
}

export function normalizeCategory(category: string): 'Good' | 'Satisfactory' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe' {
  if (!category) return 'Moderate'
  const clean = category.trim().toLowerCase().replace(/[_\s-]+/g, '')
  if (clean.includes('verypoor')) return 'Very Poor'
  if (clean.includes('good')) return 'Good'
  if (clean.includes('sat')) return 'Satisfactory'
  if (clean.includes('mod')) return 'Moderate'
  if (clean.includes('poor')) return 'Poor'
  if (clean.includes('sev')) return 'Severe'
  return 'Moderate'
}

// ── CPCB Semantic Categories & Colors (Dual-Mode Luminous & High-Contrast) ─────────────
const BASE_CATEGORIES: Record<string, CategoryMeta> = {
  Good: {
    label: 'Good',
    color: '#3E8E7E',
    bgTintDark: 'rgba(62, 142, 126, 0.20)',
    bgTintLight: 'rgba(62, 142, 126, 0.14)',
    textColorDark: '#B2DDD6',
    textColorLight: '#14463C',
    textColor: '#B2DDD6',
    range: '0–30',
    healthText: 'Minimal health impact. Air quality is considered pristine.',
  },
  Satisfactory: {
    label: 'Satisfactory',
    color: '#6B8E5F',
    bgTintDark: 'rgba(107, 142, 95, 0.20)',
    bgTintLight: 'rgba(107, 142, 95, 0.14)',
    textColorDark: '#CFE2C8',
    textColorLight: '#235229',
    textColor: '#CFE2C8',
    range: '31–60',
    healthText: 'Minor breathing discomfort to sensitive individuals.',
  },
  Moderate: {
    label: 'Moderate',
    color: '#C2934D',
    bgTintDark: 'rgba(194, 147, 77, 0.22)',
    bgTintLight: 'rgba(194, 147, 77, 0.14)',
    textColorDark: '#F2DFBD',
    textColorLight: '#734C15',
    textColor: '#F2DFBD',
    range: '61–90',
    healthText: 'Breathing discomfort to individuals with asthma, heart disease, and children.',
  },
  Poor: {
    label: 'Poor',
    color: '#C86E3C',
    bgTintDark: 'rgba(200, 110, 60, 0.22)',
    bgTintLight: 'rgba(200, 110, 60, 0.14)',
    textColorDark: '#F9D8C6',
    textColorLight: '#853512',
    textColor: '#F9D8C6',
    range: '91–120',
    healthText: 'Breathing discomfort to most people on prolonged exposure.',
  },
  'Very Poor': {
    label: 'Very Poor',
    color: '#D44A4A',
    bgTintDark: 'rgba(212, 74, 74, 0.24)',
    bgTintLight: 'rgba(212, 74, 74, 0.14)',
    textColorDark: '#FFC8C8',
    textColorLight: '#8A1818',
    textColor: '#FFC8C8',
    range: '121–250',
    healthText: 'Respiratory illness on prolonged exposure. Significant risk to vulnerable groups.',
  },
  Severe: {
    label: 'Severe',
    color: '#9C3343',
    bgTintDark: 'rgba(156, 51, 67, 0.28)',
    bgTintLight: 'rgba(156, 51, 67, 0.15)',
    textColorDark: '#FFD3DA',
    textColorLight: '#630D1B',
    textColor: '#FFD3DA',
    range: '250+',
    healthText: 'Healthy individuals affected; serious impact on people with pre-existing conditions.',
  },
}

export const CPCB_CATEGORIES_LIST: CategoryMeta[] = Object.values(BASE_CATEGORIES)

// Build dictionary supporting both PascalCase and snake_case lookups
export const AQI_CATEGORIES: Record<string, CategoryMeta> = {
  ...BASE_CATEGORIES,
  good: BASE_CATEGORIES.Good,
  satisfactory: BASE_CATEGORIES.Satisfactory,
  moderate: BASE_CATEGORIES.Moderate,
  poor: BASE_CATEGORIES.Poor,
  very_poor: BASE_CATEGORIES['Very Poor'],
  'very poor': BASE_CATEGORIES['Very Poor'],
  severe: BASE_CATEGORIES.Severe,
}

export function aqiColor(category: string): string {
  const norm = normalizeCategory(category)
  return BASE_CATEGORIES[norm]?.color ?? '#3E8E7E'
}

export function aqiBgTint(category: string, isLightMode = false): string {
  const norm = normalizeCategory(category)
  const cat = BASE_CATEGORIES[norm]
  return isLightMode ? cat?.bgTintLight ?? 'rgba(0,0,0,0.05)' : cat?.bgTintDark ?? 'rgba(255,255,255,0.08)'
}

export function aqiTextColor(category: string, isLightMode = false): string {
  const norm = normalizeCategory(category)
  const cat = BASE_CATEGORIES[norm]
  return isLightMode ? cat?.textColorLight ?? '#142E27' : cat?.textColorDark ?? '#F1F5F9'
}

// ── Profile Definitions (from config/profiles.yaml) ───────────────────────────
export interface ProfileDef {
  id: string
  label: string
  shortDesc: string
  sensitivityFactor: number
  iconType: 'user' | 'hard-hat' | 'baby' | 'activity' | 'heart' | 'briefcase'
}

export const HEALTH_PROFILES: Record<string, ProfileDef> = {
  healthy_adult: {
    id: 'healthy_adult',
    label: 'Healthy Adult',
    shortDesc: 'Baseline sensitivity, standard thresholds',
    sensitivityFactor: 1.0,
    iconType: 'user',
  },
  outdoor_worker: {
    id: 'outdoor_worker',
    label: 'Outdoor Worker',
    shortDesc: 'Prolonged shift exposure, high daily dose',
    sensitivityFactor: 1.3,
    iconType: 'hard-hat',
  },
  pregnant: {
    id: 'pregnant',
    label: 'Pregnant',
    shortDesc: 'Maternal and fetal protection, cautious limits',
    sensitivityFactor: 1.3,
    iconType: 'heart',
  },
  child: {
    id: 'child',
    label: 'Child',
    shortDesc: 'Developing lungs, higher ventilation rate per kg',
    sensitivityFactor: 1.4,
    iconType: 'baby',
  },
  elderly: {
    id: 'elderly',
    label: 'Elderly',
    shortDesc: 'Reduced respiratory reserve, cardiovascular vulnerability',
    sensitivityFactor: 1.3,
    iconType: 'user',
  },
  respiratory_cardiac: {
    id: 'respiratory_cardiac',
    label: 'Respiratory / Cardiac',
    shortDesc: 'Asthma, COPD, or heart disease. High risk',
    sensitivityFactor: 1.6,
    iconType: 'activity',
  },
}

// ── Activity Definitions & Categories (from config/activities.yaml) ─────────
export type ActivityGroupKey = 'transit' | 'fitness' | 'family' | 'home_work'

export interface ActivityGroupDef {
  id: ActivityGroupKey
  label: string
  description: string
}

export const ACTIVITY_GROUPS: ActivityGroupDef[] = [
  { id: 'transit', label: 'Transit & Commute', description: 'Office commutes, school drop-offs, and daily transit' },
  { id: 'fitness', label: 'Fitness & Sports', description: 'Running, cycling, brisk walking, and outdoor athletics' },
  { id: 'family', label: 'Family & Recreation', description: 'Playground play, dog walks, and senior citizen strolls' },
  { id: 'home_work', label: 'Home & Livelihood', description: 'Natural cross-ventilation, field work, and vending duty' },
]

export interface ActivityDef {
  id: string
  label: string
  categoryGroup: ActivityGroupKey
  categoryGroupLabel: string
  description: string
  ventilationRate: number // m3/h
  intensity: 'light' | 'moderate' | 'vigorous' | 'none'
  defaultUsualStart: string
  practicalWindowStart: string
  practicalWindowEnd: string
  iconType: 'activity' | 'briefcase' | 'baby' | 'home' | 'bike' | 'walking' | 'school' | 'shopping' | 'work' | 'sun'
}

export const ACTIVITIES: Record<string, ActivityDef> = {
  // ── Category 1: Transit & Commute ──
  morning_commute: {
    id: 'morning_commute',
    label: 'Morning Work / Office Commute',
    categoryGroup: 'transit',
    categoryGroupLabel: 'Transit & Commute',
    description: 'Two-wheeler, transit, or walking to morning work',
    ventilationRate: 1.4,
    intensity: 'light',
    defaultUsualStart: '08:30',
    practicalWindowStart: '07:00',
    practicalWindowEnd: '11:00',
    iconType: 'briefcase',
  },
  evening_commute: {
    id: 'evening_commute',
    label: 'Evening Return Commute',
    categoryGroup: 'transit',
    categoryGroupLabel: 'Transit & Commute',
    description: 'Evening return transit, avoiding dusk traffic-inversion trap',
    ventilationRate: 1.4,
    intensity: 'light',
    defaultUsualStart: '18:00',
    practicalWindowStart: '16:30',
    practicalWindowEnd: '21:00',
    iconType: 'briefcase',
  },
  school_transit: {
    id: 'school_transit',
    label: 'School Run & Student Drop-off',
    categoryGroup: 'transit',
    categoryGroupLabel: 'Transit & Commute',
    description: 'Morning bus stop wait or walking children to school',
    ventilationRate: 1.3,
    intensity: 'light',
    defaultUsualStart: '07:30',
    practicalWindowStart: '07:00',
    practicalWindowEnd: '09:30',
    iconType: 'school',
  },
  grocery_errands: {
    id: 'grocery_errands',
    label: 'Market Shopping & Errands',
    categoryGroup: 'transit',
    categoryGroupLabel: 'Transit & Commute',
    description: 'Grocery shopping, local market visits, and outdoor errands',
    ventilationRate: 1.3,
    intensity: 'light',
    defaultUsualStart: '11:00',
    practicalWindowStart: '09:30',
    practicalWindowEnd: '19:00',
    iconType: 'shopping',
  },

  // ── Category 2: Fitness & Sports ──
  exercise_running: {
    id: 'exercise_running',
    label: 'Outdoor Running & Jogging',
    categoryGroup: 'fitness',
    categoryGroupLabel: 'Fitness & Sports',
    description: 'High-cadence road or park running, sprint intervals (3.2 m³/h)',
    ventilationRate: 3.2,
    intensity: 'vigorous',
    defaultUsualStart: '06:30',
    practicalWindowStart: '05:30',
    practicalWindowEnd: '19:30',
    iconType: 'activity',
  },
  exercise_cycling: {
    id: 'exercise_cycling',
    label: 'Road Cycling & Bike Training',
    categoryGroup: 'fitness',
    categoryGroupLabel: 'Fitness & Sports',
    description: 'Road cycling, aerobic distance bike rides (2.8 m³/h)',
    ventilationRate: 2.8,
    intensity: 'vigorous',
    defaultUsualStart: '06:00',
    practicalWindowStart: '05:30',
    practicalWindowEnd: '19:30',
    iconType: 'bike',
  },
  brisk_walking: {
    id: 'brisk_walking',
    label: 'Brisk Walking & Health Stroll',
    categoryGroup: 'fitness',
    categoryGroupLabel: 'Fitness & Sports',
    description: 'Aerobic park walking for cardiovascular wellness (1.6 m³/h)',
    ventilationRate: 1.6,
    intensity: 'moderate',
    defaultUsualStart: '07:00',
    practicalWindowStart: '06:00',
    practicalWindowEnd: '20:30',
    iconType: 'walking',
  },
  outdoor_sports: {
    id: 'outdoor_sports',
    label: 'Outdoor Team Sports',
    categoryGroup: 'fitness',
    categoryGroupLabel: 'Fitness & Sports',
    description: 'Cricket nets, football matches, tennis court practice (3.0 m³/h)',
    ventilationRate: 3.0,
    intensity: 'vigorous',
    defaultUsualStart: '16:30',
    practicalWindowStart: '15:30',
    practicalWindowEnd: '19:30',
    iconType: 'activity',
  },

  // ── Category 3: Family & Recreation ──
  kids_play: {
    id: 'kids_play',
    label: "Kids' Outdoor Play & Recess",
    categoryGroup: 'family',
    categoryGroupLabel: 'Family & Recreation',
    description: 'Playground, school recess, park activity (1.8 m³/h)',
    ventilationRate: 1.8,
    intensity: 'moderate',
    defaultUsualStart: '16:30',
    practicalWindowStart: '15:30',
    practicalWindowEnd: '18:30',
    iconType: 'baby',
  },
  dog_walking: {
    id: 'dog_walking',
    label: 'Dog Walking & Pet Care',
    categoryGroup: 'family',
    categoryGroupLabel: 'Family & Recreation',
    description: 'Daily neighborhood walks for family pets (1.4 m³/h)',
    ventilationRate: 1.4,
    intensity: 'light',
    defaultUsualStart: '07:00',
    practicalWindowStart: '06:00',
    practicalWindowEnd: '21:30',
    iconType: 'walking',
  },
  elderly_walk: {
    id: 'elderly_walk',
    label: 'Senior Citizen Gentle Walk',
    categoryGroup: 'family',
    categoryGroupLabel: 'Family & Recreation',
    description: 'Gentle mobility walks for seniors, avoiding cold morning inversions',
    ventilationRate: 1.2,
    intensity: 'light',
    defaultUsualStart: '10:00',
    practicalWindowStart: '09:30',
    practicalWindowEnd: '17:30',
    iconType: 'sun',
  },

  // ── Category 4: Home & Livelihood ──
  ventilate_home: {
    id: 'ventilate_home',
    label: 'Home Natural Ventilation',
    categoryGroup: 'home_work',
    categoryGroupLabel: 'Home & Work',
    description: 'Flushing indoor air during daytime convective mixing',
    ventilationRate: 0.6,
    intensity: 'none',
    defaultUsualStart: '13:00',
    practicalWindowStart: '11:30',
    practicalWindowEnd: '16:00',
    iconType: 'home',
  },
  outdoor_work: {
    id: 'outdoor_work',
    label: 'Construction & Field Shift',
    categoryGroup: 'home_work',
    categoryGroupLabel: 'Home & Work',
    description: 'On-site construction, inspection, field labor shifts (2.2 m³/h)',
    ventilationRate: 2.2,
    intensity: 'moderate',
    defaultUsualStart: '09:00',
    practicalWindowStart: '08:00',
    practicalWindowEnd: '18:00',
    iconType: 'work',
  },
  street_vending: {
    id: 'street_vending',
    label: 'Market Vending & Duty',
    categoryGroup: 'home_work',
    categoryGroupLabel: 'Home & Work',
    description: 'Street-level retail stalls, food vending, outdoor counter duty',
    ventilationRate: 1.5,
    intensity: 'light',
    defaultUsualStart: '10:00',
    practicalWindowStart: '09:00',
    practicalWindowEnd: '20:00',
    iconType: 'work',
  },

  // ── Legacy Aliases ──
  exercise: {
    id: 'exercise',
    label: 'Outdoor Running & Jogging',
    categoryGroup: 'fitness',
    categoryGroupLabel: 'Fitness & Sports',
    description: 'Running, cycling, sports — high respiratory intake (3.2 m³/h)',
    ventilationRate: 3.2,
    intensity: 'vigorous',
    defaultUsualStart: '06:30',
    practicalWindowStart: '05:30',
    practicalWindowEnd: '19:30',
    iconType: 'activity',
  },
  commute: {
    id: 'commute',
    label: 'Morning Work Commute',
    categoryGroup: 'transit',
    categoryGroupLabel: 'Transit & Commute',
    description: 'Daily office commute transit window (1.4 m³/h)',
    ventilationRate: 1.4,
    intensity: 'light',
    defaultUsualStart: '08:30',
    practicalWindowStart: '07:00',
    practicalWindowEnd: '11:00',
    iconType: 'briefcase',
  },
}

// ── Profile-Specific Realistic Activity Rules ─────────────────────────────
// Enforces real-life physical & clinical feasibility (e.g., toddlers cannot cycle or commute to offices)
export const PROFILE_ALLOWED_ACTIVITIES: Record<string, string[]> = {
  child: [
    'kids_play',
    'school_transit',
    'brisk_walking',
    'ventilate_home',
  ],
  pregnant: [
    'brisk_walking',
    'morning_commute',
    'evening_commute',
    'grocery_errands',
    'dog_walking',
    'ventilate_home',
  ],
  elderly: [
    'elderly_walk',
    'brisk_walking',
    'grocery_errands',
    'dog_walking',
    'ventilate_home',
  ],
  respiratory_cardiac: [
    'brisk_walking',
    'morning_commute',
    'evening_commute',
    'grocery_errands',
    'dog_walking',
    'ventilate_home',
  ],
  outdoor_worker: [
    'outdoor_work',
    'street_vending',
    'morning_commute',
    'evening_commute',
    'grocery_errands',
    'brisk_walking',
    'ventilate_home',
  ],
  healthy_adult: [
    'exercise_running',
    'exercise_cycling',
    'brisk_walking',
    'outdoor_sports',
    'morning_commute',
    'evening_commute',
    'school_transit',
    'grocery_errands',
    'dog_walking',
    'ventilate_home',
    'outdoor_work',
    'street_vending',
  ],
}

export const PROFILE_DEFAULT_ACTIVITY: Record<string, string> = {
  child: 'kids_play',
  pregnant: 'brisk_walking',
  elderly: 'elderly_walk',
  respiratory_cardiac: 'brisk_walking',
  outdoor_worker: 'outdoor_work',
  healthy_adult: 'exercise_running',
}

export function getActivitiesForProfile(profileId: string): ActivityDef[] {
  const allowedIds = PROFILE_ALLOWED_ACTIVITIES[profileId] ?? PROFILE_ALLOWED_ACTIVITIES.healthy_adult
  return allowedIds.map((id) => ACTIVITIES[id]).filter(Boolean)
}

export function isActivityAllowedForProfile(profileId: string, activityId: string): boolean {
  const allowedIds = PROFILE_ALLOWED_ACTIVITIES[profileId] ?? PROFILE_ALLOWED_ACTIVITIES.healthy_adult
  if (allowedIds.includes(activityId)) return true
  // Check legacy aliases
  if (activityId === 'exercise' && allowedIds.includes('exercise_running')) return true
  if (activityId === 'commute' && allowedIds.includes('morning_commute')) return true
  return false
}

export function getDefaultActivityForProfile(profileId: string): string {
  return PROFILE_DEFAULT_ACTIVITY[profileId] ?? 'exercise_running'
}

