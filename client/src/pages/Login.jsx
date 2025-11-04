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
    <div className="login-wrap">
      <div className="login-showcase">
        <div className="login-promo">
          <div className="promo-logo">SUA MARCA</div>
          <div>
            <div className="promo-heading">Sistema de Contagem de Ônibus</div>
            <div className="promo-desc">Acompanhe a localização e a ocupação dos ônibus em tempo real.</div>
            <div className="promo-list">
              <div className="promo-item">• Mapa com posição dos ônibus</div>
              <div className="promo-item">• Ocupação atual e capacidade máxima</div>
              <div className="promo-item">• Dashboard e painel administrativo</div>
              <div className="promo-item">• Consulta pública rápida por número</div>
            </div>
          </div>
          <img
            className="promo-bus-img"
            src={import.meta.env.VITE_LOGIN_BUS_IMAGE || '/bus-bw.png'}
            alt="Ônibus"
          />
        </div>
        <div className="login-form-panel">
          <h2>Login</h2>
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
            <label className="remember">
              <input type="checkbox" defaultChecked />
              Lembrar-me
            </label>
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
    </div>
  )
}
