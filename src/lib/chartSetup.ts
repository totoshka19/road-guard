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

Chart.defaults.color = '#94a3b8'
Chart.defaults.borderColor = 'rgba(148, 163, 184, 0.15)'
Chart.defaults.font.family = "'Inter', system-ui, sans-serif"

/** Акцент палитры (--accent) для датасетов без собственного цвета. */
export const CHART_ACCENT = '#38bdf8'
export const CHART_ACCENT_FILL = 'rgba(56, 189, 248, 0.15)'
