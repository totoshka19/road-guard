import { useAppSelector } from '../../app/hooks'
import { chartPalette, type ChartPalette } from '../../lib/chartSetup'
import { selectResolvedTheme } from './selectors'

/**
 * Палитра графиков, связанная с текущей темой.
 *
 * Одна точка связи «тема → цвета Chart.js»: цвета передаются через `options`
 * каждого графика, а не через глобальный `Chart.defaults`, поэтому смена темы
 * остаётся обычным ре-рендером.
 */
export function useChartPalette(): ChartPalette {
  return chartPalette(useAppSelector(selectResolvedTheme))
}
