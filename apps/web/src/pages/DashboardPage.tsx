import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import api from '../lib/axios'
import { getLeadStats } from '../lib/leads.api'
import { useAuthStore } from '../store/auth.store'

const STATUS_COLORS: Record<string, string> = {
  COLD: '#60a5fa',
  WARM: '#fbbf24',
  HOT: '#f87171',
  WON: '#34d399',
  LOST: '#9ca3af',
}

function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const refreshToken = useAuthStore((state) => state.refreshToken)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const navigate = useNavigate()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['leadStats'],
    queryFn: getLeadStats,
  })

  async function handleLogout() {
    try {
      await api.post('/auth/logout', { refreshToken })
    } catch (err) {
      console.error('Logout request failed:', err)
    } finally {
      clearAuth()
      navigate('/login')
    }
  }

  const chartData = stats
    ? Object.entries(stats.byStatus)
        .filter(([, count]) => count > 0)
        .map(([status, count]) => ({ name: status, value: count }))
    : []

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.email}</p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/leads"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              View Leads
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
            >
              Log out
            </button>
          </div>
        </div>

        {isLoading && <p className="text-gray-600">Loading stats...</p>}

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-sm font-medium text-gray-500 mb-1">Total Leads</h2>
              <p className="text-3xl font-semibold text-gray-900">{stats.total}</p>
              <h2 className="text-sm font-medium text-gray-500 mt-4 mb-1">Average Score</h2>
              <p className="text-3xl font-semibold text-gray-900">{stats.averageScore}</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-sm font-medium text-gray-500 mb-4">Leads by Status</h2>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={40}
                      outerRadius={70}
                    >
                      {chartData.map((entry) => (
                        <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-400 text-sm">No leads yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage