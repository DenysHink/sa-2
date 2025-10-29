import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import PublicStatus from './pages/PublicStatus'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import { getToken } from './services/api'

function PrivateRoute({ children }) {
  const token = getToken()
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <div className="container">
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="/public" element={<PublicStatus />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
