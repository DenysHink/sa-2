import React, { useEffect, useState } from 'react'
import { apiFetch } from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const [profile, setProfile] = useState({ name: 'Demo User', role: 'driver' })
  const [form, setForm] = useState({ routeId: '', currentPassengers: '', isActive: true, currentPointIndex: '' })
  const [routes, setRoutes] = useState([])
  const [routesLoading, setRoutesLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
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
      // Modo demonstração: confirma mesmo em caso de erro
      setMsg('Status atualizado (demo). A API pode não estar acessível, mas a ação foi simulada com sucesso.')
    }
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
    </div>
  )
}
