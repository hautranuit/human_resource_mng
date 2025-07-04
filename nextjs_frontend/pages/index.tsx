import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import Login from '@/components/Login'
import Dashboard from '@/components/Dashboard'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // Redirect admin users to admin dashboard on first login
  useEffect(() => {
    if (user && !loading) {
      const isAdmin = user.employee_id === 'ADMIN001' || (user.department === 'HR' && user.position === 'System Administrator')
      if (isAdmin && router.pathname === '/') {
        // Small delay to ensure smooth transition
        setTimeout(() => {
          router.push('/admin')
        }, 1000)
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          color: 'white',
          fontSize: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderTop: '2px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          Loading...
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {user ? <Dashboard /> : <Login />}
    </div>
  )
}