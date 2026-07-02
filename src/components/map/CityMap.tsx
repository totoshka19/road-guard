import { useCallback, useMemo, useRef, useState } from 'react'
import { Layer, Map, Popup, Source } from 'react-map-gl/maplibre'
import type { MapLayerMouseEvent, MapRef } from 'react-map-gl/maplibre'
import type { GeoJSONSource } from 'maplibre-gl'
import type { Point } from 'geojson'
import 'maplibre-gl/dist/maplibre-gl.css'

import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { selectCamera } from '../../features/cameras/camerasSlice'
import { camerasToGeoJson } from '../../features/cameras/cameraGeoJson'
import { CITY } from '../../data/city'
import {
  clusterCountLayer,
  clusterLayer,
  selectedLayer,
  unclusteredLayer,
} from './layers'

// Тёмный векторный стиль без API-ключа (OpenFreeMap, схема OpenMapTiles).
const MAP_STYLE = 'https://tiles.openfreemap.org/styles/dark'
const CAMERAS_SOURCE_ID = 'cameras'
// Клики ловим только на кластерах и одиночных камерах, не на подложке.
const INTERACTIVE_LAYERS = ['clusters', 'unclustered-point']

export function CityMap() {
  const dispatch = useAppDispatch()
  const cameras = useAppSelector((s) => s.cameras.items)
  const selectedId = useAppSelector((s) => s.cameras.selectedId)
  const mapRef = useRef<MapRef>(null)
  const [cursor, setCursor] = useState('grab')

  const data = useMemo(() => camerasToGeoJson(cameras), [cameras])
  const selectedCamera = useMemo(
    () => cameras.find((camera) => camera.id === selectedId) ?? null,
    [cameras, selectedId],
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
      mapStyle={MAP_STYLE}
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
        </Popup>
      )}
    </Map>
  )
}
