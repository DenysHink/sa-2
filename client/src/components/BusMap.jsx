import React, { useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const busEmojiIcon = L.divIcon({
  html: '🚌',
  className: 'bus-marker-emoji',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -10],
})

function FlyToSelected({ buses, selectedId }) {
  const map = useMap()
  React.useEffect(() => {
    if (!selectedId) return
    const b = buses.find(x => String(x.id) === String(selectedId))
    if (b) {
      map.flyTo([b.lat, b.lng], 14, { duration: 0.5 })
    }
  }, [selectedId, buses, map])
  return null
}

export default function BusMap({ buses = [], selectedId, center = [-23.5505, -46.6333], zoom = 12, points = [] }) {
  const markers = useMemo(() => buses, [buses])
  return (
    <div className="map-container">
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {Array.isArray(points) && points.length > 1 && (
          <Polyline positions={points.map(p => [p.lat, p.lng])} pathOptions={{ color: '#60a5fa', weight: 2, opacity: 0.7 }} />
        )}
        <FlyToSelected buses={markers} selectedId={selectedId} />
        {Array.isArray(points) && points.map((p, i) => (
          <Marker key={`pt-${i}`} position={[p.lat, p.lng]} icon={L.divIcon({ html: String(i+1), className: 'point-marker', iconSize: [22,22], iconAnchor: [11,11] })} />
        ))}
        {markers.map(bus => (
          <Marker key={bus.id} position={[bus.lat, bus.lng]} icon={busEmojiIcon}>
            <Popup>
              <div>
                <div><strong>Ônibus {bus.id}</strong></div>
                <div>Passageiros: {bus.currentPassengers} / {bus.maxCapacity}</div>
                {typeof bus.occupancyPercentage === 'number' && (
                  <div>Ocupação: {bus.occupancyPercentage}%</div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
        {(() => {
          const sb = markers.find(b => String(b.id) === String(selectedId))
          if (!sb || !Array.isArray(points)) return null
          const idx = typeof sb.targetPointIndex === 'number' ? sb.targetPointIndex : undefined
          if (typeof idx !== 'number' || idx < 0 || idx >= points.length) return null
          const tp = points[idx]
          return (
            <Polyline positions={[[sb.lat, sb.lng], [tp.lat, tp.lng]]} pathOptions={{ color: '#f97316', weight: 2, opacity: 0.9, dashArray: '6,8' }} />
          )
        })()}
      </MapContainer>
    </div>
  )
}
