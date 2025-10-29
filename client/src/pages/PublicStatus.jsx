import React, { useState } from 'react'
import { apiFetch, getBaseUrl, isDemo } from '../services/api'

export default function PublicStatus() {
  const [busNumber, setBusNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)

  const onSearch = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setData(null)
    try {
      const res = await apiFetch(`/api/public/bus/${encodeURIComponent(busNumber)}`)
      if (!res.success) throw new Error(res.message || 'Erro ao buscar status')
      setData(res.data)
    } catch (err) {
      if (isDemo()) {
        // Fallback de demonstração: dados simulados
        const num = Number(busNumber) || 1
        const maxCapacity = 50
        const currentPassengers = Math.min( Math.max(num * 3 % maxCapacity, 0), maxCapacity )
        const currentPointIndex = num % 5
        const points = Array.from({ length: 6 }).map((_, i) => ({
          id: i + 1,
          name: `Ponto ${i + 1}`,
          address: `Endereço ${i + 1}`,
          order: i,
          isPassed: i <= currentPointIndex,
          estimatedTime: `${10 + i * 3} min`
        }))
        setData({
          busNumber: String(num),
          routeName: `Rota ${num}`,
          isActive: true,
          currentPassengers,
          maxCapacity,
          occupancyPercentage: Math.round((currentPassengers / maxCapacity) * 100),
          currentPoint: points.find(p => p.order === currentPointIndex) || null,
          nextPoint: points.find(p => p.order === currentPointIndex + 1) || null,
          allPoints: points
        })
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const quickSelect = async (n) => {
    setBusNumber(String(n))
    // Disparar busca imediatamente sem formulário
    setLoading(true)
    setError('')
    setData(null)
    try {
      const res = await apiFetch(`/api/public/bus/${n}`)
      if (!res.success) throw new Error(res.message || 'Erro ao buscar status')
      setData(res.data)
    } catch (err) {
      if (isDemo()) {
        // Fallback igual ao onSearch
        const num = n
        const maxCapacity = 50
        const currentPassengers = Math.min( Math.max(num * 3 % maxCapacity, 0), maxCapacity )
        const currentPointIndex = num % 5
        const points = Array.from({ length: 6 }).map((_, i) => ({
          id: i + 1,
          name: `Ponto ${i + 1}`,
          address: `Endereço ${i + 1}`,
          order: i,
          isPassed: i <= currentPointIndex,
          estimatedTime: `${10 + i * 3} min`
        }))
        setData({
          busNumber: String(num),
          routeName: `Rota ${num}`,
          isActive: true,
          currentPassengers,
          maxCapacity,
          occupancyPercentage: Math.round((currentPassengers / maxCapacity) * 100),
          currentPoint: points.find(p => p.order === currentPointIndex) || null,
          nextPoint: points.find(p => p.order === currentPointIndex + 1) || null,
          allPoints: points
        })
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2>Status Público do Ônibus</h2>
      <form onSubmit={onSearch} className="form">
        <input
          placeholder="Número do ônibus"
          value={busNumber}
          onChange={(e) => setBusNumber(e.target.value)}
          required
        />
        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      <div className="form" style={{marginTop: 0}}>
        {Array.from({ length: 10 }).map((_, i) => (
          <button
            key={i}
            className="btn"
            type="button"
            disabled={loading}
            onClick={() => quickSelect(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {error && <div className="error">{error}</div>}

      {data && (
        <div className="result">
          <div className="grid">
            <div className="tile">
              <span className="label">Ônibus</span>
              <strong>{data.busNumber}</strong>
            </div>
            <div className="tile">
              <span className="label">Rota</span>
              <strong>{data.routeName}</strong>
            </div>
            <div className="tile">
              <span className="label">Ativo</span>
              <strong>{data.isActive ? 'Sim' : 'Não'}</strong>
            </div>
            <div className="tile">
              <span className="label">Passageiros</span>
              <strong>{data.currentPassengers} / {data.maxCapacity} ({data.occupancyPercentage}%)</strong>
            </div>
          </div>

          <div className="points">
            <h3>Pontos</h3>
            <ul>
              {data.allPoints?.sort((a,b) => a.order - b.order).map(p => (
                <li key={p.id} className={p.isPassed ? 'passed' : ''}>
                  <div>
                    <strong>{p.order}. {p.name}</strong>
                    {p.address && <div className="muted">{p.address}</div>}
                  </div>
                  {p.estimatedTime && <span className="muted">ETA: {p.estimatedTime}</span>}
                </li>
              ))}
            </ul>

            <div className="current-next">
              <div>
                <span className="label">Ponto Atual</span>
                <strong>{data.currentPoint ? data.currentPoint.name : '-'}</strong>
              </div>
              <div>
                <span className="label">Próximo Ponto</span>
                <strong>{data.nextPoint ? data.nextPoint.name : '-'}</strong>
              </div>
            </div>
          </div>

          <div className="muted">API: {getBaseUrl()}</div>
        </div>
      )}
    </div>
  )
}
