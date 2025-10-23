import React, { createContext, useState, useEffect } from 'react'
import API_BASE from '@/config/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const tokenKey = 'token'

  const getToken = () => localStorage.getItem(tokenKey)
  const setToken = (t) => { if (t) localStorage.setItem(tokenKey, t); else localStorage.removeItem(tokenKey) }

  const login = async ({ token, user: userPayload } = {}) => {
    if (token) setToken(token)
    if (userPayload) {
      setUser(userPayload)
      return { ok: true }
    }

    // try fetch profile with token
    const t = getToken()
    if (!t) return { ok: false }
    try {
      const res = await fetch(`${API_BASE}/api/profile`, { headers: { Authorization: `Bearer ${t}` } })
      if (!res.ok) {
        setToken(null)
        setUser(null)
        return { ok: false }
      }
      const data = await res.json()
      setUser(data)
      return { ok: true, user: data }
    } catch (e) {
      setToken(null)
      setUser(null)
      return { ok: false }
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
  }

  useEffect(() => {
    ;(async () => {
      const t = getToken()
      if (!t) { setLoading(false); return }
      try {
        const res = await fetch(`${API_BASE}/api/profile`, { headers: { Authorization: `Bearer ${t}` } })
        if (!res.ok) { setToken(null); setLoading(false); return }
        const data = await res.json()
        setUser(data)
      } catch (e) {
        setToken(null)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, token: getToken() }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
