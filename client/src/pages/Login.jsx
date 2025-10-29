import React, { useState } from 'react'
import { saveToken, apiFetch, isDemo } from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isDemo()) {
        // Modo demonstração: aceita qualquer login
        saveToken('demo-token')
      } else {
        // Modo real: chamar API
        const res = await apiFetch('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        })
        if (!res.success) throw new Error(res.message || 'Falha no login')
        saveToken(res.data.token)
      }
      navigate('/dashboard')
    } catch (err) {
      setError('Não foi possível prosseguir')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-grid">
      <div className="login-left">
        <div className="login-card">
          <h2>Entrar</h2>
          <form className="login-form" onSubmit={onSubmit}>
            <label className="login-label">Email</label>
            <input
              className="login-input"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label className="login-label">Senha</label>
            <input
              className="login-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Acessar'}
            </button>
            <button type="button" className="login-link" onClick={() => alert('Recuperação de senha (demo)')}>
              Esqueceu a senha?
            </button>
          </form>
          {error && <div className="error" style={{marginTop: 8}}>{error}</div>}
        </div>
      </div>
      <div className="login-right">
        <div className="bus-hero">
          <img
            className="bus-img"
            src={import.meta.env.VITE_BUS_IMAGE || '/bus.png'}
            alt="Ilustração de ônibus"
          />
          <h3>Gestão de Passageiros</h3>
          <p className="muted">Monitore a lotação e o progresso das rotas em tempo real.</p>
        </div>
      </div>
    </div>
  )
}
