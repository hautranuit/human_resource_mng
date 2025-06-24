import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 50%, #f3e8ff 100%)'
    }}>
      <nav style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '64px'
          }}>
            {/* Logo */}
            <Link href="/" style={{ 
              display: 'flex', 
              alignItems: 'center',
              textDecoration: 'none'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
              }}>
                <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7C14.5 7 14 7.2 13.6 7.6L11 10.2V15H13V22H11V15H9V10.2L11.4 7.8C11.8 7.4 12.3 7.2 12.8 7.2L18 7.2V9M7 10V8H5V10H7Z"/>
                </svg>
              </div>
              <div>
                <h1 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: 0
                }}>
                  HRMS TimeTrack
                </h1>
                <p style={{
                  fontSize: '12px',
                  color: '#666',
                  margin: 0
                }}>
                  Human Resource Management
                </p>
              </div>
            </Link>
            
            {/* Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link
                href="/"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  ...(router.pathname === '/' ? {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                  } : {
                    color: '#666',
                    background: 'transparent'
                  })
                }}
              >
                📊 Dashboard
              </Link>
              
              <Link
                href="/reports"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  ...(router.pathname === '/reports' ? {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                  } : {
                    color: '#666',
                    background: 'transparent'
                  })
                }}
              >
                📈 Reports
              </Link>
              
              {/* User Info */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginLeft: '24px',
                paddingLeft: '24px',
                borderLeft: '1px solid rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}>
                    {user?.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p style={{ 
                      margin: 0, 
                      fontWeight: '600', 
                      fontSize: '14px',
                      color: '#333'
                    }}>
                      {user?.full_name}
                    </p>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '12px',
                      color: '#666'
                    }}>
                      {user?.employee_id} • {user?.department}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#fee2e2',
                    color: '#dc2626',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#fecaca'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#fee2e2'
                  }}
                  title="Sign out"
                >
                  🚪
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      <main style={{ padding: '32px 0' }}>{children}</main>
    </div>
  )
}