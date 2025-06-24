import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import Layout from './Layout'

interface CurrentStatus {
  status: string
  record: any
}

export default function Dashboard() {
  const { user } = useAuth()
  const [currentStatus, setCurrentStatus] = useState<CurrentStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

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

  useEffect(() => {
    if (user) {
      fetchCurrentStatus()
      // Auto refresh every 30 seconds
      const interval = setInterval(fetchCurrentStatus, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  if (!user) return null

  const isCheckedIn = currentStatus?.status === 'CHECKED_IN'
  const currentTime = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.full_name}
              </h1>
              <p className="text-gray-600">
                {user.position} • {user.department} Department
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Check In/Out Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="text-center">
                {/* Current Time */}
                <div className="mb-6">
                  <div className="text-4xl font-mono font-bold text-gray-900 mb-1">
                    {currentTime.split(' ')[1]}
                  </div>
                  <div className="text-gray-600">
                    {currentTime.split(' ')[0]} • Vietnam Time
                  </div>
                </div>

                {/* Status */}
                <div className="mb-6">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    isCheckedIn 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      isCheckedIn ? 'bg-green-400' : 'bg-gray-400'
                    }`}></div>
                    {isCheckedIn ? 'Checked In' : 'Not Checked In'}
                  </span>
                </div>                {/* Check In/Out Button */}
                <button
                  onClick={handleCheckInOut}
                  disabled={loading}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] shadow-lg hover:shadow-xl ${
                    isCheckedIn
                      ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </div>
                  ) : (
                    isCheckedIn ? 'Check Out' : 'Check In'
                  )}
                </button>

                {/* Message */}
                {message && (
                  <div className={`mt-4 p-3 rounded-lg text-sm ${
                    message.includes('Checked') || message.includes('in') || message.includes('out')
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {message}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Today's Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Summary</h2>
              
              {currentStatus?.record ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Check In</span>
                    <span className="font-medium">
                      {currentStatus.record.check_in_time 
                        ? new Date(currentStatus.record.check_in_time).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : '—'
                      }
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Check Out</span>
                    <span className="font-medium">
                      {currentStatus.record.check_out_time 
                        ? new Date(currentStatus.record.check_out_time).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : '—'
                      }
                    </span>
                  </div>
                  
                  <div className="border-t pt-3 mt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Hours Worked</span>
                      <span className="font-semibold text-blue-600">
                        {currentStatus.record.working_hours?.toFixed(2) || '0.00'}h
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No records for today</p>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Employee ID</span>
                  <span className="font-medium">{user.employee_id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Department</span>
                  <span className="font-medium">{user.department}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Position</span>
                  <span className="font-medium">{user.position}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
