import type { LayerProps } from 'react-map-gl/maplibre'

/**
 * Стили слоёв карты для нативной кластеризации MapLibre.
 *
 * Один GeoJSON-источник с `cluster: true` порождает два вида фич:
 *  - кластеры (есть свойство `point_count`) — рисуются `clusterLayer` +
 *    подписью `clusterCountLayer`;
 *  - одиночные камеры (свойства `point_count` нет) — `unclusteredLayer`.
 * Фильтры `['has', 'point_count']` / `['!', ['has', 'point_count']]`
 * и разводят их по слоям.
 *
 * `source` в объектах не указываем: `<Layer>` берёт его из родительского
 * `<Source>` через контекст react-map-gl.
 */

/** Круг-кластер: цвет и радиус растут ступенями по числу камер внутри. */
export const clusterLayer: LayerProps = {
  id: 'clusters',
  type: 'circle',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': [
      'step',
      ['get', 'point_count'],
      '#0ea5e9',
      10,
      '#38bdf8',
      25,
      '#7dd3fc',
    ],
    'circle-radius': ['step', ['get', 'point_count'], 16, 10, 22, 25, 30],
    'circle-opacity': 0.85,
    'circle-stroke-width': 2,
    'circle-stroke-color': 'rgba(56, 189, 248, 0.35)',
  },
}

/** Число камер поверх кластера. Шрифт — из глифов стиля OpenFreeMap. */
export const clusterCountLayer: LayerProps = {
  id: 'cluster-count',
  type: 'symbol',
  filter: ['has', 'point_count'],
  layout: {
    'text-field': '{point_count_abbreviated}',
    'text-font': ['Noto Sans Bold'],
    'text-size': 13,
  },
  paint: {
    'text-color': '#0b0f17',
  },
}

/** Одиночная камера. */
export const unclusteredLayer: LayerProps = {
  id: 'unclustered-point',
  type: 'circle',
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-color': '#38bdf8',
    'circle-radius': 6,
    'circle-stroke-width': 2,
    'circle-stroke-color': '#0b0f17',
  },
}

/** Точка-нарушение. Цвет берётся из свойства фичи (по типу нарушения). */
export const violationLayer: LayerProps = {
  id: 'violations',
  type: 'circle',
  paint: {
    'circle-color': ['get', 'color'],
    'circle-radius': 4,
    'circle-opacity': 0.85,
    'circle-stroke-width': 1,
    'circle-stroke-color': 'rgba(11, 15, 23, 0.6)',
  },
}

/**
 * Подсветка выбранной камеры. Фильтр по `id` зависит от выбора, поэтому
 * слой собирается функцией: literal-объект с `type: 'circle'` сужает union
 * `LayerProps` до circle-слоя — только так `filter` проходит проверку типов.
 * Если ничего не выбрано, фильтр не совпадает ни с одной фичей — слой пуст.
 */
export function selectedLayer(selectedId: string | null): LayerProps {
  return {
    id: 'selected-point',
    type: 'circle',
    filter: ['==', ['get', 'id'], selectedId ?? '__none__'],
    paint: {
      'circle-color': '#f43f5e',
      'circle-radius': 9,
      'circle-opacity': 0.9,
      'circle-stroke-width': 3,
      'circle-stroke-color': '#ffffff',
    },
  }
}
