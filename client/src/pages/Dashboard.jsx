import React, { useEffect, useState } from 'react'
import { apiFetch } from '../services/api'
import { useNavigate } from 'react-router-dom'
import BusMap from '../components/BusMap'

export default function Dashboard() {
  const [profile, setProfile] = useState({ name: 'Demo User', role: 'driver' })
  const [form, setForm] = useState({ routeId: '', currentPassengers: '', isActive: true, currentPointIndex: '' })
  const [routes, setRoutes] = useState([])
  const [routesLoading, setRoutesLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [buses, setBuses] = useState([])
  const [selectedId, setSelectedId] = useState('1')
  const [points, setPoints] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    // Modo demonstração: não bloqueia sem token e não falha se perfil não carregar
    (async () => {
      try {
        const res = await apiFetch('/api/auth/profile')
        if (res?.success && res?.data?.user) setProfile(res.data.user)
      } catch (_) {
        // Ignora erro no modo demo
      }
    })()
  }, [navigate])

  useEffect(() => {
    // Carregar rotas (real ou demo)
    ;(async () => {
      setRoutesLoading(true)
      try {
        const res = await apiFetch('/api/routes')
        if (res?.success && Array.isArray(res?.data?.routes)) {
          const list = res.data.routes.map(r => ({
            id: r.id,
            label: `${r.busNumber ? `Ônibus ${r.busNumber}` : 'Rota'} - ${r.name || r.id}`
          }))
          setRoutes(list)
          if (list.length && !form.routeId) setForm(f => ({ ...f, routeId: String(list[0].id) }))
          return
        }
        throw new Error('Lista de rotas vazia')
      } catch (_) {
        // Fallback demo: 10 rotas fictícias
        const demo = Array.from({ length: 10 }).map((_, i) => ({
          id: String(i + 1),
          label: `Ônibus ${i + 1} - Rota ${i + 1}`
        }))
        setRoutes(demo)
        if (!form.routeId) setForm(f => ({ ...f, routeId: demo[0].id }))
      } finally {
        setRoutesLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    const base = { lat: -27.5945, lng: -48.5477 }
    const deltas = [[0,0],[0.015,-0.08],[0.04,-0.10],[0.06,-0.12],[-0.06,-0.09],[-0.03,-0.06],[0.02,0.06],[0,0.09],[-0.02,0.05],[0.045,0.01]]
    const routePoints = deltas.map(([dlat, dlng]) => ({ lat: base.lat + dlat, lng: base.lng + dlng }))
    setPoints(routePoints)
    const list = Array.from({ length: 10 }).map((_, i) => {
      const id = i + 1
      const maxCapacity = 40 + ((id % 3) * 10)
      const currentPassengers = Math.min(((id * 7) % maxCapacity), maxCapacity)
      const occupancyPercentage = Math.round((currentPassengers / maxCapacity) * 100)
      const p = routePoints[i % routePoints.length]
      return { id, lat: p.lat, lng: p.lng, maxCapacity, currentPassengers, occupancyPercentage, targetPointIndex: i % routePoints.length }
    })
    setBuses(list)
  }, [])

  const onUpdate = async (e) => {
    e.preventDefault()
    setMsg('')
    setError('')
    try {
      const payload = {}
      if (form.currentPassengers !== '') payload.currentPassengers = Number(form.currentPassengers)
      if (form.isActive !== '') payload.isActive = Boolean(form.isActive)
      if (form.currentPointIndex !== '') payload.currentPointIndex = Number(form.currentPointIndex)

      const res = await apiFetch(`/api/routes/${encodeURIComponent(form.routeId)}/status`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      })
      if (!res.success) throw new Error(res.message || 'Falha ao atualizar rota')
      setMsg('Status atualizado com sucesso!')
    } catch (err) {
      setMsg('Status atualizado (demo). A API pode não estar acessível, mas a ação foi simulada com sucesso.')
    }

    const idToUpdate = Number(form.routeId)
    setBuses(list => list.map(b => {
      if (Number(b.id) !== idToUpdate) return b
      let currentPassengers = b.currentPassengers
      if (form.currentPassengers !== '') {
        const n = Number(form.currentPassengers)
        currentPassengers = Math.max(0, Math.min(n, b.maxCapacity))
      }
      let lat = b.lat, lng = b.lng
      let targetPointIndex = b.targetPointIndex
      if (form.currentPointIndex !== '') {
        const idx = Number(form.currentPointIndex)
        const safeIdx = ((idx % points.length) + points.length) % points.length
        targetPointIndex = safeIdx
        if (points[safeIdx]) {
          lat = points[safeIdx].lat
          lng = points[safeIdx].lng
        }
      }
      const occupancyPercentage = Math.round((currentPassengers / b.maxCapacity) * 100)
      return { ...b, currentPassengers, occupancyPercentage, lat, lng, targetPointIndex }
    }))
  }

  return (
    <div className="card">
      <h2>Dashboard</h2>
      {profile && (
        <div className="muted">Logado como: {profile.name} ({profile.role})</div>
      )}

      <h3>Selecionar Rota</h3>
      <div className="form">
        <select
          value={form.routeId}
          onChange={(e) => setForm({ ...form, routeId: e.target.value })}
          disabled={routesLoading}
        >
          {routes.map(r => (
            <option key={r.id} value={r.id}>{r.label} (id: {r.id})</option>
          ))}
        </select>
      </div>

      <h3>Atualizar Status da Rota</h3>
      <form className="form" onSubmit={onUpdate}>
        <input
          type="number"
          placeholder="Passageiros atuais"
          value={form.currentPassengers}
          onChange={(e) => setForm({ ...form, currentPassengers: e.target.value })}
        />
        <select
          value={String(form.isActive)}
          onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
        >
          <option value="true">Ativo</option>
          <option value="false">Inativo</option>
        </select>
        <input
          type="number"
          placeholder="Índice do ponto atual"
          value={form.currentPointIndex}
          onChange={(e) => setForm({ ...form, currentPointIndex: e.target.value })}
        />
        <button className="btn" type="submit">Atualizar</button>
      </form>

      {msg && <div className="success">{msg}</div>}
      {error && <div className="error">{error}</div>}

      <details>
        <summary>Como encontrar o ID da rota?</summary>
        <p>Esta tela já tenta listar rotas automaticamente via <code>GET /api/routes</code>. Se a API não responder, uma lista de demonstração é exibida.</p>
      </details>

      <h3>Pesquisar Ônibus</h3>
      <div className="muted">Selecione um número de 1 a 10 para visualizar no mapa e ver a ocupação.</div>
      <div className="chips">
        {Array.from({ length: 10 }).map((_, i) => {
          const id = String(i + 1)
          const active = selectedId === id
          return (
            <button
              key={id}
              type="button"
              className={`chip ${active ? 'active' : ''}`}
              onClick={() => setSelectedId(id)}
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
      {(() => {
        const b = buses.find(x => String(x.id) === String(selectedId))
        return b ? (
          <div className="grid" style={{ marginTop: 12 }}>
            <div className="tile">
              <span className="label">Ônibus</span>
              <strong>{b.id}</strong>
            </div>
            <div className="tile">
              <span className="label">Ocupação</span>
              <strong>{b.currentPassengers} / {b.maxCapacity} ({b.occupancyPercentage}%)</strong>
            </div>
            <div className="tile">
              <span className="label">Localização</span>
              <strong>{b.lat.toFixed(4)}, {b.lng.toFixed(4)}</strong>
            </div>
          </div>
        ) : null
      })()}
    </div>
  )
}
