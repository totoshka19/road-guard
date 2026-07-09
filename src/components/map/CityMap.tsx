import { useCallback, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Layer, Map, Popup, Source } from 'react-map-gl/maplibre'
import type { MapLayerMouseEvent, MapRef } from 'react-map-gl/maplibre'
import type { GeoJSONSource } from 'maplibre-gl'
import type { Point } from 'geojson'
import 'maplibre-gl/dist/maplibre-gl.css'

import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { selectCamera } from '../../features/cameras/camerasSlice'
import {
  selectAllCameras,
  selectSelectedCamera,
} from '../../features/cameras/selectors'
import { selectResolvedTheme } from '../../features/ui/selectors'
import type { ResolvedTheme } from '../../lib/theme'
import { camerasToGeoJson } from '../../features/cameras/cameraGeoJson'
import { recentViolationsToGeoJson } from '../../features/violations/violationGeoJson'
import { selectFilteredViolations } from '../../features/stats/selectors'
import { CITY } from '../../data/city'
import {
  clusterCountLayer,
  clusterLayer,
  selectedLayer,
  unclusteredLayer,
  violationHeatmapLayer,
  violationLayer,
} from './layers'
import { ViolationPulses } from './ViolationPulses'

/**
 * Векторные стили без API-ключа (OpenFreeMap, схема OpenMapTiles).
 *
 * Смена `mapStyle` безопасна для наших слоёв: `<Source>` и `<Layer>` из
 * react-map-gl подписаны на событие `styledata` и переустанавливают себя
 * после перезагрузки стиля — кластеры и heatmap не теряются.
 */
const MAP_STYLES: Record<ResolvedTheme, string> = {
  dark: 'https://tiles.openfreemap.org/styles/dark',
  light: 'https://tiles.openfreemap.org/styles/positron',
}
const CAMERAS_SOURCE_ID = 'cameras'
// Клики ловим только на кластерах и одиночных камерах, не на подложке.
const INTERACTIVE_LAYERS = ['clusters', 'unclustered-point']
// Сколько последних нарушений держим точками на карте (свежие сверху буфера).
const MAX_MAP_VIOLATIONS = 150

export function CityMap() {
  const dispatch = useAppDispatch()
  const cameras = useAppSelector(selectAllCameras)
  const violations = useAppSelector(selectFilteredViolations)
  const heatmap = useAppSelector((s) => s.ui.heatmap)
  const selectedId = useAppSelector((s) => s.cameras.selectedId)
  const selectedCamera = useAppSelector(selectSelectedCamera)
  const theme = useAppSelector(selectResolvedTheme)
  const mapRef = useRef<MapRef>(null)
  const [cursor, setCursor] = useState('grab')

  const data = useMemo(() => camerasToGeoJson(cameras), [cameras])
  const violationData = useMemo(
    () => recentViolationsToGeoJson(violations, MAX_MAP_VIOLATIONS),
    [violations],
  )
  // Слой-подсветка выбранной камеры (фильтр зависит от выбора).
  const selectedLayerStyle = useMemo(
    () => selectedLayer(selectedId),
    [selectedId],
  )

  const onClick = useCallback(
    async (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0]
      // Клик по пустому месту карты — снимаем выделение.
      if (!feature) {
        dispatch(selectCamera(null))
        return
      }
      // Клик по кластеру — «разворачиваем» его: зумим до уровня, на котором
      // MapLibre разделит кластер на составляющие.
      if (feature.properties.cluster) {
        const clusterId = feature.properties.cluster_id as number
        const source = mapRef.current?.getSource(CAMERAS_SOURCE_ID) as
          GeoJSONSource | undefined
        if (!source) return
        const zoom = await source.getClusterExpansionZoom(clusterId)
        const [lng, lat] = (feature.geometry as Point).coordinates
        mapRef.current?.easeTo({ center: [lng, lat], zoom, duration: 500 })
        return
      }
      // Клик по одиночной камере — выбираем её (покажем попап и подсветку).
      const cameraId = feature.properties.id as string | undefined
      if (cameraId) dispatch(selectCamera(cameraId))
    },
    [dispatch],
  )

  // Курсор-«рука» над кликабельными фичами. Обновляем только при смене,
  // чтобы onMouseMove не дёргал ре-рендер на каждый пиксель.
  const onMouseMove = useCallback((event: MapLayerMouseEvent) => {
    const overFeature = (event.features?.length ?? 0) > 0
    setCursor((prev) => {
      const next = overFeature ? 'pointer' : 'grab'
      return prev === next ? prev : next
    })
  }, [])

  return (
    <Map
      ref={mapRef}
      initialViewState={{
        longitude: CITY.center.lng,
        latitude: CITY.center.lat,
        zoom: 10.8,
      }}
      minZoom={9}
      maxZoom={17}
      mapStyle={MAP_STYLES[theme]}
      style={{ width: '100%', height: '100%' }}
      interactiveLayerIds={INTERACTIVE_LAYERS}
      cursor={cursor}
      onClick={onClick}
      onMouseMove={onMouseMove}
    >
      <Source
        id={CAMERAS_SOURCE_ID}
        type="geojson"
        data={data}
        cluster
        clusterMaxZoom={14}
        clusterRadius={50}
      >
        <Layer {...clusterLayer} />
        <Layer {...clusterCountLayer} />
        <Layer {...unclusteredLayer} />
        <Layer {...selectedLayerStyle} />
      </Source>

      {/* Нарушения (с учётом фильтров): точки или тепловая карта.
          Разные key — чтобы React пересоздал слой при переключении, а не
          пытался сменить id у того же <Layer> (react-map-gl так не умеет). */}
      <Source id="violations" type="geojson" data={violationData}>
        {heatmap ? (
          <Layer key="violations-heat" {...violationHeatmapLayer} />
        ) : (
          <Layer key="violations-dots" {...violationLayer} />
        )}
      </Source>
      <ViolationPulses />

      {selectedCamera && (
        <Popup
          longitude={selectedCamera.lng}
          latitude={selectedCamera.lat}
          anchor="bottom"
          offset={16}
          closeButton
          closeOnClick={false}
          onClose={() => dispatch(selectCamera(null))}
          className="camera-popup"
        >
          <p className="camera-popup__name">{selectedCamera.name}</p>
          <p className="camera-popup__district">{selectedCamera.district}</p>
          <Link
            to={`/camera/${selectedCamera.id}`}
            className="camera-popup__link"
          >
            Подробнее →
          </Link>
        </Popup>
      )}
    </Map>
  )
}
