import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { apiFetch } from './api'

type User = { id: string; name: string; email: string; role: string }
type AuthCtx = {
  token: string | null
  user: User | null
  ready: boolean
  login: (email: string, password: string) => Promise<string>
  logout: () => void
}

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const [t, u] = await Promise.all([
          AsyncStorage.getItem('sv_token'),
          AsyncStorage.getItem('sv_user'),
        ])
        if (t) setToken(t)
        if (u) setUser(JSON.parse(u))
      } finally {
        setReady(true)
      }
    })()
  }, [])

  async function login(email: string, password: string) {
    const res = await apiFetch('/auth/login', null, { method: 'POST', body: JSON.stringify({ email, password }) })
    setToken(res.token)
    setUser(res.user)
    await AsyncStorage.setItem('sv_token', res.token)
    await AsyncStorage.setItem('sv_user', JSON.stringify(res.user))
    return res.token as string
  }

  function logout() {
    setToken(null)
    setUser(null)
    AsyncStorage.multiRemove(['sv_token', 'sv_user']).catch(() => {})
  }

  return <Ctx.Provider value={{ token, user, ready, login, logout }}>{children}</Ctx.Provider>
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
