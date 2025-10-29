import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getToken, logout, isDemo, setDemo } from '../services/api'

export default function Navbar() {
  const navigate = useNavigate()
  const token = getToken()
  const [demo, setDemoState] = React.useState(isDemo())

  const onLogout = () => {
    logout()
    navigate('/login')
  }

  const toggleDemo = () => {
    const next = !demo
    setDemo(next)
    setDemoState(next)
  }

  return (
    <nav className="nav">
      <div className="nav-left">
        <Link to="/" className="brand">🚌 Contador</Link>
      </div>
      <div className="nav-right">
        <Link to="/">Status Público</Link>
        {token ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <button className="btn" onClick={onLogout}>Sair</button>
          </>
        ) : (
          <Link to="/login">Entrar</Link>
        )}
        <button className="btn" onClick={toggleDemo} title="Alternar modo Demonstração">
          Demo: {demo ? 'ON' : 'OFF'}
        </button>
      </div>
    </nav>
  )
}
