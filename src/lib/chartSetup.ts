import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js'
import type { ResolvedTheme } from './theme'

/**
 * Регистрируем только используемые части Chart.js (tree-shaking) и задаём
 * тёмные дефолты под палитру дашборда. Импортируется один раз в main.tsx.
 */
Chart.register(
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
)

Chart.defaults.font.family = "'Inter', system-ui, sans-serif"

/** Акцент палитры (--accent) для датасетов без собственного цвета. */
export const CHART_ACCENT = '#38bdf8'
export const CHART_ACCENT_FILL = 'rgba(56, 189, 248, 0.15)'

export interface ChartPalette {
  /** Цвет подписей осей и легенды. */
  tick: string
  /** Цвет линий сетки. */
  grid: string
}

const PALETTES: Record<ResolvedTheme, ChartPalette> = {
  dark: { tick: '#94a3b8', grid: 'rgba(148, 163, 184, 0.15)' },
  light: { tick: '#475569', grid: 'rgba(71, 85, 105, 0.18)' },
}

/**
 * Цвета графиков передаются через `options`, а не через глобальный
 * `Chart.defaults`: смена темы должна быть обычным ре-рендером, а не гонкой
 * с мутацией глобалей (эффекты детей выполняются раньше эффектов родителя,
 * и график успел бы создаться со старой палитрой).
 */
export function chartPalette(theme: ResolvedTheme): ChartPalette {
  return PALETTES[theme]
}
