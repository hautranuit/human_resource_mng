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
      setMessage('Có lỗi xảy ra, vui lòng thử lại')
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
  const currentTime = new Date().toLocaleString('vi-VN', {
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
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Chào mừng, {user.full_name}!
              </h1>
              <p className="text-gray-600 mb-4">
                {user.position} - {user.department}
              </p>
              <div className="text-lg font-mono text-primary-600 mb-6">
                {currentTime}
              </div>
              
              <div className="mb-6">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                  isCheckedIn 
                    ? 'bg-success-100 text-success-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    isCheckedIn ? 'bg-success-500' : 'bg-gray-500'
                  }`}></div>
                  {isCheckedIn ? 'Đang làm việc' : 'Chưa check-in'}
                </div>
              </div>

              <button
                onClick={handleCheckInOut}
                disabled={loading}
                className={`px-8 py-3 rounded-lg font-semibold text-white transition-colors ${
                  isCheckedIn
                    ? 'bg-danger-600 hover:bg-danger-700'
                    : 'bg-success-600 hover:bg-success-700'
                } disabled:opacity-50`}
              >
                {loading ? 'Đang xử lý...' : (isCheckedIn ? 'Check-out' : 'Check-in')}
              </button>

              {message && (
                <div className={`mt-4 p-3 rounded-md ${
                  message.includes('thành công') || message.includes('check-in') || message.includes('check-out')
                    ? 'bg-success-100 text-success-800'
                    : 'bg-danger-100 text-danger-800'
                }`}>
                  {message}
                </div>
              )}
            </div>
          </div>

          {currentStatus?.record && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Thông tin hôm nay
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Ngày</p>
                  <p className="font-medium">
                    {new Date(currentStatus.record.date).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Check-in</p>
                  <p className="font-medium">
                    {currentStatus.record.check_in_time 
                      ? new Date(currentStatus.record.check_in_time).toLocaleTimeString('vi-VN')
                      : '-'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Check-out</p>
                  <p className="font-medium">
                    {currentStatus.record.check_out_time 
                      ? new Date(currentStatus.record.check_out_time).toLocaleTimeString('vi-VN')
                      : '-'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Giờ làm việc</p>
                  <p className="font-medium">
                    {currentStatus.record.working_hours?.toFixed(2) || 0} giờ
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}