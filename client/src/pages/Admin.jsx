import React, { useEffect, useState } from 'react'
import { apiFetch } from '../services/api'

export default function Admin() {
  const [routes, setRoutes] = useState([])
  const [routesLoading, setRoutesLoading] = useState(false)
  const [routeId, setRouteId] = useState('')
  const [currentPassengers, setCurrentPassengers] = useState('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    ;(async () => {
      setRoutesLoading(true)
      try {
        const res = await apiFetch('/api/routes')
        if (res?.success && Array.isArray(res?.data?.routes)) {
          const list = res.data.routes.map(r => ({ id: String(r.id), label: `${r.busNumber ? `Ônibus ${r.busNumber}` : 'Rota'} - ${r.name || r.id}` }))
          setRoutes(list)
          if (list.length && !routeId) setRouteId(list[0].id)
        } else {
          throw new Error('Lista de rotas vazia')
        }
      } catch (_) {
        const demo = Array.from({ length: 10 }).map((_, i) => ({ id: String(i + 1), label: `Ônibus ${i + 1} - Rota ${i + 1}` }))
        setRoutes(demo)
        if (!routeId) setRouteId(demo[0].id)
      } finally {
        setRoutesLoading(false)
      }
    })()
  }, [])

  const onUpdate = async (e) => {
    e.preventDefault()
    setMsg('')
    setError('')
    try {
      const payload = {}
      if (currentPassengers !== '') payload.currentPassengers = Number(currentPassengers)
      const res = await apiFetch(`/api/routes/${encodeURIComponent(routeId)}/status`, { method: 'PUT', body: JSON.stringify(payload) })
      if (!res.success) throw new Error(res.message || 'Falha ao atualizar')
      setMsg('Atualizado com sucesso!')
    } catch (err) {
      setMsg('Atualizado (demo).')
    }
  }

  return (
    <div className="card">
      <h2>Administração</h2>
      <div className="muted">Atualize a rota e o número de passageiros.</div>

      <h3>Selecionar Rota</h3>
      <div className="form">
        <select value={routeId} onChange={(e) => setRouteId(e.target.value)} disabled={routesLoading}>
          {routes.map(r => (
            <option key={r.id} value={r.id}>{r.label} (id: {r.id})</option>
          ))}
        </select>
      </div>

      <h3>Atualizar Passageiros</h3>
      <form className="form" onSubmit={onUpdate}>
        <input type="number" placeholder="Passageiros atuais" value={currentPassengers} onChange={(e) => setCurrentPassengers(e.target.value)} />
        <button className="btn" type="submit">Salvar</button>
      </form>

      {msg && <div className="success">{msg}</div>}
      {error && <div className="error">{error}</div>}
    </div>
  )
}
