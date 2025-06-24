import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '@/services/api'

interface User {
  id: string
  employee_id: string
  full_name: string
  department: string
  position: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const initializeApp = async () => {
    try {
      // Get CSRF token first
      await api.get('/auth/csrf/')
      // Then check if user is authenticated
      await checkAuth()
    } catch (error) {
      console.error('App initialization error:', error)
      setLoading(false)
    }
  }

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post('/auth/login/', { username, password })
      if (response.data.success) {
        setUser(response.data.employee)
        return true
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout/')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
    }
  }

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/status/')
      if (response.data.authenticated) {
        setUser(response.data.employee)
      } else {
        setUser(null)
      }
    } catch (error: any) {
      // Handle any errors gracefully
      console.error('Auth check error:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    initializeApp()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}