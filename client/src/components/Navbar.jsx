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
        <Link to="/login" className="brand">Login</Link>
      </div>
      <div className="nav-right">
        {token ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/bus-locator">Localizar Ônibus</Link>
          </>
        ) : null}
      </div>
    </nav>
  )
}
