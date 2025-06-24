import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import Layout from './Layout'

interface SystemStats {
  total_employees: number
  checked_in_today: number
  checked_out_today: number
  total_working_hours_this_month: number
  forgotten_checkouts_this_month: number
  month_year: string
}

interface Employee {
  id: string
  employee_id: string
  full_name: string
  department: string
  position: string
  is_active: boolean
}

interface EmployeeStats {
  total_working_days: number
  total_working_hours: number
  days_forgot_checkout: number
  days_off: number
}

interface AllEmployeesData {
  employee: Employee
  stats: EmployeeStats
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null)
  const [allEmployees, setAllEmployees] = useState<Employee[]>([])
  const [employeesData, setEmployeesData] = useState<AllEmployeesData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [downloading, setDownloading] = useState(false)

  // Check if user is admin
  const isAdmin = user?.employee_id === 'ADMIN001' || user?.department === 'HR'

  const fetchSystemStats = async () => {
    try {
      const response = await api.get('/admin/system_stats/')
      setSystemStats(response.data)
    } catch (error) {
      console.error('Error fetching system stats:', error)
    }
  }

  const fetchAllEmployees = async () => {
    try {
      const response = await api.get('/admin/all_employees/')
      setAllEmployees(response.data)
    } catch (error) {
      console.error('Error fetching all employees:', error)
    }
  }

  const fetchEmployeesRecords = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/admin/all_employees_records/?year=${selectedYear}&month=${selectedMonth}`)
      setEmployeesData(response.data.employees_data)
    } catch (error) {
      console.error('Error fetching employees records:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadComprehensiveReport = async () => {
    try {
      setDownloading(true)
      const response = await api.get(`/admin/comprehensive_excel/?year=${selectedYear}&month=${selectedMonth}`, {
        responseType: 'blob'
      })
      
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `admin_comprehensive_report_${selectedMonth}_${selectedYear}.xlsx`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading comprehensive report:', error)
    } finally {
      setDownloading(false)
    }
  }

  useEffect(() => {
    if (user && isAdmin) {
      fetchSystemStats()
      fetchAllEmployees()
      fetchEmployeesRecords()
    }
  }, [user, isAdmin, selectedMonth, selectedYear])

  if (!user) return null

  if (!isAdmin) {
    return (
      <Layout>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '48px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>🚫</div>
            <h2 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#dc2626',
              marginBottom: '16px'
            }}>
              Access Denied
            </h2>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>
              You need administrator privileges to access this page.
            </p>
          </div>
        </div>
      </Layout>
    )
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return (
    <Layout>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 24px'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
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
                Admin Dashboard
              </h1>
              <p style={{
                fontSize: '18px',
                color: '#6b7280',
                margin: 0,
                display: 'flex',
                alignItems: 'center'
              }}>
                🛡️ System Administration & Employee Management
              </p>
            </div>
          </div>
        </div>

        {/* System Stats Cards */}
        {systemStats && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px',
            marginBottom: '32px'
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
                Total Employees
              </p>
              <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#2563eb', margin: 0 }}>
                {systemStats.total_employees}
              </p>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #86efac',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>✅</div>
              <p style={{ fontSize: '14px', color: '#065f46', fontWeight: '600', margin: '0 0 4px 0' }}>
                Checked In Today
              </p>
              <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#059669', margin: 0 }}>
                {systemStats.checked_in_today}
              </p>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #fb923c',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>⏰</div>
              <p style={{ fontSize: '14px', color: '#9a3412', fontWeight: '600', margin: '0 0 4px 0' }}>
                Monthly Hours
              </p>
              <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#ea580c', margin: 0 }}>
                {systemStats.total_working_hours_this_month}h
              </p>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #f87171',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>⚠️</div>
              <p style={{ fontSize: '14px', color: '#991b1b', fontWeight: '600', margin: '0 0 4px 0' }}>
                Missed Checkouts
              </p>
              <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#dc2626', margin: 0 }}>
                {systemStats.forgotten_checkouts_this_month}
              </p>
            </div>
          </div>
        )}

        {/* Controls */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#374151',
                  fontSize: '14px'
                }}>
                  📅 Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  style={{
                    padding: '8px 12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    background: 'white',
                    fontSize: '14px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {months.map((month, index) => (
                    <option key={index + 1} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#374151',
                  fontSize: '14px'
                }}>
                  📆 Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  style={{
                    padding: '8px 12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    background: 'white',
                    fontSize: '14px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {Array.from({ length: 5 }, (_, i) => (
                    <option key={2023 + i} value={2023 + i}>
                      {2023 + i}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={downloadComprehensiveReport}
              disabled={downloading}
              style={{
                background: downloading ? '#9ca3af' : 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: downloading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: downloading ? 0.7 : 1,
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
              }}
            >
              <span>{downloading ? '⏳' : '📥'}</span>
              {downloading ? 'Generating...' : 'Download Comprehensive Report'}
            </button>
          </div>
        </div>

        {/* All Employees Table */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{
            padding: '24px',
            borderBottom: '1px solid #f3f4f6',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: 0
            }}>
              📊 All Employees Report - {months[selectedMonth - 1]} {selectedYear}
            </h3>
          </div>
          
          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '48px',
              fontSize: '18px',
              color: '#6b7280'
            }}>
              <span style={{ marginRight: '8px' }}>⏳</span>
              Loading employee data...
            </div>
          ) : employeesData.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '48px',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
              <p style={{ margin: 0 }}>No employee data found for this period</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f9fafb' }}>
                  <tr>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      EMPLOYEE
                    </th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      DEPARTMENT
                    </th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      WORKING DAYS
                    </th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      TOTAL HOURS
                    </th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      MISSED CHECKOUTS
                    </th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      STATUS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {employeesData.map((data, index) => {
                    const statusColor = data.stats.days_forgot_checkout > 3 ? '#dc2626' : 
                                       data.stats.total_working_hours < 40 ? '#f59e0b' : '#10b981'
                    const statusText = data.stats.days_forgot_checkout > 3 ? 'Needs Attention' :
                                      data.stats.total_working_hours < 40 ? 'Low Hours' : 'Good'
                    
                    return (
                      <tr key={data.employee.id} style={{
                        borderTop: '1px solid #f3f4f6',
                        background: index % 2 === 0 ? 'white' : '#fafafa'
                      }}>
                        <td style={{ padding: '16px' }}>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                              {data.employee.full_name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                              {data.employee.employee_id} • {data.employee.position}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>
                          {data.employee.department}
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                          {data.stats.total_working_days}
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                          {data.stats.total_working_hours}h
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: data.stats.days_forgot_checkout > 0 ? '#dc2626' : '#6b7280' }}>
                          {data.stats.days_forgot_checkout}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            display: 'inline-flex',
                            padding: '4px 12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            borderRadius: '20px',
                            color: statusColor,
                            backgroundColor: `${statusColor}20`,
                            border: `1px solid ${statusColor}40`
                          }}>
                            {statusText}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}