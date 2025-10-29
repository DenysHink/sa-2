const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const TOKEN_KEY = 'bus_counter_token'
const DEMO_KEY = 'bus_counter_demo_mode'

export const getBaseUrl = () => BASE_URL
export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const saveToken = (token) => localStorage.setItem(TOKEN_KEY, token)
export const logout = () => localStorage.removeItem(TOKEN_KEY)

export const isDemo = () => {
  const v = localStorage.getItem(DEMO_KEY)
  // Default: demo ON
  return v === null ? true : v === 'true'
}
export const setDemo = (val) => localStorage.setItem(DEMO_KEY, String(Boolean(val)))

export async function apiFetch(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    ...options,
    headers,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message = data?.message || `Erro HTTP ${res.status}`
    throw new Error(message)
  }
  return data
}
