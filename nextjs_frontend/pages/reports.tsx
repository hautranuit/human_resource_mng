import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import Layout from '@/components/Layout'

interface TimeRecord {
  id: string
  date: string
  check_in_time: string | null
  check_out_time: string | null
  working_hours: number
  status: string
  forgot_checkout: boolean
}

export default function Reports() {
  const { user } = useAuth()
  const [records, setRecords] = useState<TimeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [downloading, setDownloading] = useState(false)

  const fetchMonthlyRecords = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/timerecords/monthly_records/?year=${selectedYear}&month=${selectedMonth}`)
      setRecords(response.data)
    } catch (error) {
      console.error('Error fetching records:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadExcelReport = async () => {
    try {
      setDownloading(true)
      const response = await api.get(`/reports/monthly_excel/?year=${selectedYear}&month=${selectedMonth}`, {
        responseType: 'blob'
      })
      
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `monthly_report_${selectedMonth}_${selectedYear}.xlsx`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading report:', error)
    } finally {
      setDownloading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchMonthlyRecords()
    }
  }, [user, selectedMonth, selectedYear])

  if (!user) return null

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const totalWorkingHours = records.reduce((sum, record) => sum + record.working_hours, 0)
  const workingDays = records.filter(record => record.check_in_time).length
  const forgottenCheckouts = records.filter(record => record.forgot_checkout).length

  return (
    <Layout>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 8px 0'
          }}>
            📈 Reports
          </h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '16px' }}>
            View your monthly attendance and working hours
          </p>
        </div>

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
              onClick={downloadExcelReport}
              disabled={downloading}
              style={{
                background: downloading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                opacity: downloading ? 0.7 : 1
              }}
            >
              <span>{downloading ? '⏳' : '📥'}</span>
              {downloading ? 'Downloading...' : 'Download Excel'}
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #93c5fd',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '40px',
              marginBottom: '8px'
            }}>
              📊
            </div>
            <p style={{
              fontSize: '14px',
              color: '#1e40af',
              fontWeight: '600',
              margin: '0 0 4px 0'
            }}>
              Working Days
            </p>
            <p style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#2563eb',
              margin: 0
            }}>
              {workingDays}
            </p>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #86efac',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '40px',
              marginBottom: '8px'
            }}>
              ⏰
            </div>
            <p style={{
              fontSize: '14px',
              color: '#065f46',
              fontWeight: '600',
              margin: '0 0 4px 0'
            }}>
              Total Hours
            </p>
            <p style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#059669',
              margin: 0
            }}>
              {totalWorkingHours.toFixed(1)}h
            </p>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #f87171',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '40px',
              marginBottom: '8px'
            }}>
              ⚠️
            </div>
            <p style={{
              fontSize: '14px',
              color: '#991b1b',
              fontWeight: '600',
              margin: '0 0 4px 0'
            }}>
              Missed Checkouts
            </p>
            <p style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#dc2626',
              margin: 0
            }}>
              {forgottenCheckouts}
            </p>
          </div>
        </div>

        {/* Records Table */}
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
              📋 {months[selectedMonth - 1]} {selectedYear} Records
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
              Loading...
            </div>
          ) : records.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '48px',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
              <p style={{ margin: 0 }}>No records found for this period</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f9fafb' }}>
                  <tr>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      DATE
                    </th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      CHECK IN
                    </th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      CHECK OUT
                    </th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      HOURS
                    </th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      STATUS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, index) => (
                    <tr key={record.id} style={{
                      borderTop: '1px solid #f3f4f6',
                      background: index % 2 === 0 ? 'white' : '#fafafa'
                    }}>
                      <td style={{
                        padding: '16px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#1f2937'
                      }}>
                        {new Date(record.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td style={{
                        padding: '16px',
                        fontSize: '14px',
                        color: '#6b7280'
                      }}>
                        {record.check_in_time 
                          ? new Date(record.check_in_time).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : '—'
                        }
                      </td>
                      <td style={{
                        padding: '16px',
                        fontSize: '14px',
                        color: '#6b7280'
                      }}>
                        {record.check_out_time 
                          ? new Date(record.check_out_time).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : '—'
                        }
                      </td>
                      <td style={{
                        padding: '16px',
                        fontSize: '14px',
                        color: '#6b7280'
                      }}>
                        {record.working_hours.toFixed(2)}h
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          padding: '4px 12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          borderRadius: '20px',
                          ...(record.status === 'CHECKED_IN' ? {
                            background: '#d1fae5',
                            color: '#065f46',
                            border: '1px solid #86efac'
                          } : record.forgot_checkout ? {
                            background: '#fee2e2',
                            color: '#991b1b',
                            border: '1px solid #f87171'
                          } : {
                            background: '#f3f4f6',
                            color: '#374151',
                            border: '1px solid #d1d5db'
                          })
                        }}>
                          {record.status === 'CHECKED_IN' ? '🟢 Working' : 
                           record.forgot_checkout ? '🔴 Missed Checkout' : '✅ Completed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
