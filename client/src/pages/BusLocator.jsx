import React, { useMemo, useState, useEffect } from 'react'
import BusMap from '../components/BusMap'

export default function BusLocator() {
  const [buses, setBuses] = useState([])
  const [selectedId, setSelectedId] = useState('1')
  const [points, setPoints] = useState([])
  const selectedBus = useMemo(() => buses.find(b => String(b.id) === String(selectedId)), [buses, selectedId])

  useEffect(() => {
    const base = { lat: -27.5945, lng: -48.5477 }
    const deltas = [
      [ 0.000,  0.000],
      [ 0.015, -0.080],
      [ 0.040, -0.100],
      [ 0.060, -0.120],
      [-0.060, -0.090],
      [-0.030, -0.060],
      [ 0.020,  0.060],
      [ 0.000,  0.090],
      [-0.020,  0.050],
      [ 0.045,  0.010],
    ]
    const routePoints = deltas.map(([dlat, dlng]) => ({ lat: base.lat + dlat, lng: base.lng + dlng }))
    setPoints(routePoints)
    const list = Array.from({ length: 10 }).map((_, i) => {
      const id = i + 1
      const maxCapacity = 40 + ((id % 3) * 10)
      const currentPassengers = Math.min(((id * 7) % maxCapacity), maxCapacity)
      const occupancyPercentage = Math.round((currentPassengers / maxCapacity) * 100)
      const p = routePoints[i % routePoints.length]
      return {
        id,
        lat: p.lat,
        lng: p.lng,
        maxCapacity,
        currentPassengers,
        occupancyPercentage,
        targetPointIndex: (i + 1) % routePoints.length,
      }
    })
    setBuses(list)
  }, [])

  const onPick = (id) => {
    setSelectedId(String(id))
  }

  return (
    <div className="card">
      <h2>Localizar Ônibus</h2>
      <div className="muted">Selecione um número de 1 a 10 para visualizar no mapa.</div>

      <div className="chips">
        {Array.from({ length: 10 }).map((_, i) => {
          const id = String(i + 1)
          const active = selectedId === id
          return (
            <button
              key={id}
              type="button"
              className={`chip ${active ? 'active' : ''}`}
              onClick={() => onPick(id)}
            >
              {id}
            </button>
          )
        })}
      </div>

      <div className="form" style={{ marginTop: 8 }}>
        <input
          type="number"
          min={1}
          max={10}
          placeholder="Número do ônibus (1-10)"
          value={selectedId}
          onChange={(e) => {
            const v = e.target.value
            if (!v) return setSelectedId('')
            const n = Number(v)
            if (n >= 1 && n <= 10) setSelectedId(String(n))
          }}
        />
      </div>

      <div className="map-section">
        <div className="map-container">
          <BusMap buses={buses} selectedId={selectedId} center={[-27.5945, -48.5477]} zoom={11} points={points} />
        </div>
      </div>

      {selectedBus && (
        <div className="grid" style={{ marginTop: 12 }}>
          <div className="tile">
            <span className="label">Ônibus</span>
            <strong>{selectedBus.id}</strong>
          </div>
          <div className="tile">
            <span className="label">Ocupação</span>
            <strong>{selectedBus.currentPassengers} / {selectedBus.maxCapacity} ({selectedBus.occupancyPercentage}%)</strong>
          </div>
          <div className="tile">
            <span className="label">Localização</span>
            <strong>{selectedBus.lat.toFixed(4)}, {selectedBus.lng.toFixed(4)}</strong>
          </div>
        </div>
      )}
    </div>
  )
}
