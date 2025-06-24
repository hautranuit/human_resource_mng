import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import Layout from './Layout'

interface CurrentStatus {
  status: string
  record: any
  is_admin?: boolean
  message?: string
}

export default function Dashboard() {
  const { user } = useAuth()
  const [currentStatus, setCurrentStatus] = useState<CurrentStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [currentTime, setCurrentTime] = useState('')

  // Update current time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false  // Force 24-hour format
      })
      setCurrentTime(now)
    }

    // Update immediately
    updateTime()
    
    // Then update every second
    const timeInterval = setInterval(updateTime, 1000)
    
    // Cleanup interval on unmount
    return () => clearInterval(timeInterval)
  }, [])

  // Separate useEffect for fetching status to avoid conflicts
  useEffect(() => {
    if (user) {
      fetchCurrentStatus()
      // Update status every 30 seconds
      const statusInterval = setInterval(fetchCurrentStatus, 30000)
      return () => clearInterval(statusInterval)
    }
  }, [user])

  const fetchCurrentStatus = async () => {
    try {
      const response = await api.get('/timerecords/current_status/')
      setCurrentStatus(response.data)
    } catch (error) {
      console.error('Error fetching status:', error)
    }
  }

  const handleCheckInOut = async () => {
    try {
      setLoading(true)
      const response = await api.post('/timerecords/checkin_checkout/')
      if (response.data.success) {
        setMessage(response.data.message)
        await fetchCurrentStatus()
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error with check-in/out:', error)
      setMessage('An error occurred, please try again')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  // Check if user is admin
  const isAdmin = user.employee_id === 'ADMIN001' || (user.department === 'HR' && user.position === 'System Administrator')
  
  // If admin, show admin-specific dashboard message
  if (isAdmin) {
    return (
      <Layout>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          {/* Header */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '24px',
                boxShadow: '0 8px 25px rgba(220, 38, 38, 0.4)'
              }}>
                <svg width="40" height="40" fill="white" viewBox="0 0 24 24">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM16 5.9C17.3 5.9 18.4 6.9 18.4 8.1C18.4 9.2 17.3 10.1 16 10.1S13.6 9.2 13.6 8.1C13.6 6.9 14.7 5.9 16 5.9M8 5.9C9.3 5.9 10.4 6.9 10.4 8.1C10.4 9.2 9.3 10.1 8 10.1S5.6 9.2 5.6 8.1C5.6 6.9 6.7 5.9 8 5.9Z"/>
                </svg>
              </div>
              <div>
                <h1 style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  margin: '0 0 8px 0'
                }}>
                  Welcome back, <span style={{
                    background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>{user.full_name}</span>
                </h1>
                <p style={{
                  fontSize: '18px',
                  color: '#6b7280',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  🛡️ {user.position} • {user.department} Department
                </p>
              </div>
            </div>
          </div>

          {/* Admin Message Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '48px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            textAlign: 'center',
            marginBottom: '32px'
          }}>
            <div style={{
              fontSize: '80px',
              marginBottom: '24px'
            }}>
              🛡️
            </div>
            <h2 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '16px'
            }}>
              Administrator Dashboard
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#6b7280',
              marginBottom: '32px',
              maxWidth: '600px',
              margin: '0 auto 32px'
            }}>
              As a system administrator, you don't need to track time. Use the Admin Dashboard to manage all employee data, view system statistics, and generate comprehensive reports.
            </p>
            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <a
                href="/admin"
                style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                  color: 'white',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLAnchorElement).style.transform = 'translateY(-2px)'
                  ;(e.target as HTMLAnchorElement).style.boxShadow = '0 8px 25px rgba(220, 38, 38, 0.4)'
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLAnchorElement).style.transform = 'translateY(0)'
                  ;(e.target as HTMLAnchorElement).style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)'
                }}
              >
                🛡️ Go to Admin Dashboard
              </a>
              <a
                href="/reports"
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  color: '#374151',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: '2px solid #e5e7eb',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLAnchorElement).style.transform = 'translateY(-2px)'
                  ;(e.target as HTMLAnchorElement).style.borderColor = '#9ca3af'
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLAnchorElement).style.transform = 'translateY(0)'
                  ;(e.target as HTMLAnchorElement).style.borderColor = '#e5e7eb'
                }}
              >
                📈 View Reports
              </a>
            </div>
          </div>

          {/* Quick Stats for Admin */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #93c5fd',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>👥</div>
              <p style={{ fontSize: '14px', color: '#1e40af', fontWeight: '600', margin: '0 0 4px 0' }}>
                System Role
              </p>
              <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563eb', margin: 0 }}>
                Administrator
              </p>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #86efac',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>🛡️</div>
              <p style={{ fontSize: '14px', color: '#065f46', fontWeight: '600', margin: '0 0 4px 0' }}>
                Access Level
              </p>
              <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#059669', margin: 0 }}>
                Full Access
              </p>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #fb923c',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>📊</div>
              <p style={{ fontSize: '14px', color: '#9a3412', fontWeight: '600', margin: '0 0 4px 0' }}>
                Time Tracking
              </p>
              <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#ea580c', margin: 0 }}>
                Not Required
              </p>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  const isCheckedIn = currentStatus?.status === 'CHECKED_IN'

  return (
    <Layout>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '24px',
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
            }}>
              <svg width="40" height="40" fill="white" viewBox="0 0 24 24">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7C14.5 7 14 7.2 13.6 7.6L11 10.2V15H13V22H11V15H9V10.2L11.4 7.8C11.8 7.4 12.3 7.2 12.8 7.2L18 7.2V9M7 10V8H5V10H7Z"/>
              </svg>
            </div>
            <div>
              <h1 style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: '0 0 8px 0'
              }}>
                Welcome back, <span style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>{user.full_name}</span>
              </h1>
              <p style={{
                fontSize: '18px',
                color: '#6b7280',
                margin: 0,
                display: 'flex',
                alignItems: 'center'
              }}>
                🏢 {user.position} • {user.department} Department
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '32px'
        }}>
          {/* Check In/Out Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background decoration */}
            <div style={{
              position: 'absolute',
              top: '0',
              right: '0',
              width: '120px',
              height: '120px',
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              borderRadius: '50%',
              transform: 'translate(40px, -40px)'
            }}></div>
            
            <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
              {/* Current Time */}
              <div style={{ marginBottom: '40px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <span style={{ fontSize: '18px', fontWeight: '600', color: '#667eea', marginRight: '8px' }}>🕐</span>
                  <span style={{ fontSize: '18px', fontWeight: '600', color: '#4b5563' }}>Current Time</span>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    marginLeft: '12px',
                    animation: 'pulse 1s infinite'
                  }}></div>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    fontSize: '56px',
                    fontWeight: 'bold',
                    fontFamily: 'monospace',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '2px',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    position: 'relative'
                  }}>
                    {currentTime ? currentTime.split(' ')[1] : '--:--:--'}
                  </div>
                </div>
                <div style={{
                  fontSize: '18px',
                  color: '#6b7280'
                }}>
                  {currentTime ? currentTime.split(' ')[0] : '--/--/----'} • Vietnam Time
                </div>
              </div>

              {/* Add CSS for pulse and blink animations */}
              <style jsx>{`
                @keyframes pulse {
                  0%, 100% {
                    opacity: 1;
                    transform: scale(1);
                  }
                  50% {
                    opacity: 0.5;
                    transform: scale(1.1);
                  }
                }
                @keyframes blink-colon {
                  0%, 50% { opacity: 1; }
                  51%, 100% { opacity: 0.3; }
                }
              `}</style>

              {/* Status */}
              <div style={{ marginBottom: '40px' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '16px 32px',
                  borderRadius: '50px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                  ...(isCheckedIn ? {
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white'
                  } : {
                    background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                    color: 'white'
                  })
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    marginRight: '12px',
                    backgroundColor: isCheckedIn ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.6)',
                    ...(isCheckedIn && {
                      animation: 'pulse 2s infinite'
                    })
                  }}></div>
                  {isCheckedIn ? '✅ Currently Working' : '⏸️ Not Working'}
                </div>
              </div>

              {/* Check In/Out Button */}
              <button
                onClick={handleCheckInOut}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '20px 32px',
                  borderRadius: '16px',
                  fontWeight: 'bold',
                  fontSize: '20px',
                  color: 'white',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
                  ...(loading ? {
                    background: '#9ca3af',
                    opacity: 0.7
                  } : isCheckedIn ? {
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                  } : {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  })
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)'
                    ;(e.target as HTMLButtonElement).style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    (e.target as HTMLButtonElement).style.transform = 'translateY(0)'
                    ;(e.target as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)'
                  }
                }}
              >
                {loading ? (
                  <>
                    <span style={{ marginRight: '12px' }}>⏳</span>
                    Processing...
                  </>
                ) : (
                  <>
                    <span style={{ marginRight: '12px' }}>
                      {isCheckedIn ? '⏹️' : '▶️'}
                    </span>
                    {isCheckedIn ? 'Check Out' : 'Check In'}
                  </>
                )}
              </button>

              {/* Message */}
              {message && (
                <div style={{
                  marginTop: '24px',
                  padding: '16px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '500',
                  ...(message.includes('Checked') || message.includes('in') || message.includes('out') ? {
                    background: '#dcfce7',
                    color: '#166534',
                    border: '1px solid #bbf7d0'
                  } : {
                    background: '#fee2e2',
                    color: '#dc2626',
                    border: '1px solid #fecaca'
                  })
                }}>
                  {message}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Today's Summary */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: '0 0 20px 0',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{ marginRight: '8px' }}>📊</span>
                Today's Summary
              </h2>
              
              {currentStatus?.record ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #93c5fd'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#1e40af', fontWeight: '600' }}>🕘 Check In</span>
                      <span style={{ fontWeight: 'bold', color: '#2563eb', fontSize: '16px' }}>
                        {currentStatus.record.check_in_time 
                          ? new Date(currentStatus.record.check_in_time).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false
                            })
                          : '—'
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div style={{
                    background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #f9a8d4'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#be185d', fontWeight: '600' }}>🕔 Check Out</span>
                      <span style={{ fontWeight: 'bold', color: '#db2777', fontSize: '16px' }}>
                        {currentStatus.record.check_out_time 
                          ? new Date(currentStatus.record.check_out_time).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false
                            })
                          : '—'
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div style={{
                    background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #86efac'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#065f46', fontWeight: '600' }}>⏱️ Hours Worked</span>
                      <span style={{
                        fontWeight: 'bold',
                        fontSize: '20px',
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>
                        {currentStatus.record.working_hours?.toFixed(2) || '0.00'}h
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{
                    fontSize: '48px',
                    marginBottom: '16px'
                  }}>
                    📅
                  </div>
                  <p style={{ color: '#6b7280', margin: 0 }}>No records for today</p>
                </div>
              )}
            </div>

            {/* Employee Info */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: '0 0 20px 0',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{ marginRight: '8px' }}>👤</span>
                Employee Info
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #fb923c'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#9a3412', fontWeight: '600' }}>🆔 Employee ID</span>
                    <span style={{ fontWeight: 'bold', color: '#ea580c' }}>{user.employee_id}</span>
                  </div>
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #f87171'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#991b1b', fontWeight: '600' }}>🏢 Department</span>
                    <span style={{ fontWeight: 'bold', color: '#dc2626' }}>{user.department}</span>
                  </div>
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, #e9d5ff 0%, #ddd6fe 100%)',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #c4b5fd'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#581c87', fontWeight: '600' }}>💼 Position</span>
                    <span style={{ fontWeight: 'bold', color: '#7c3aed' }}>{user.position}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
