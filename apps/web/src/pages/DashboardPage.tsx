import { useNavigate } from 'react-router-dom'
import api from '../lib/axios'
import { useAuthStore } from '../store/auth.store'

function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const refreshToken = useAuthStore((state) => state.refreshToken)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      await api.post('/auth/logout', { refreshToken })
    } catch (err) {
      // Even if this fails (e.g., token already expired), we still want to log the user out locally
      console.error('Logout request failed:', err)
    } finally {
      clearAuth()
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Logged in as: {user?.email}</p>
        <p className="text-gray-600">Role: {user?.role}</p>
        <button
          onClick={handleLogout}
          className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
        >
          Log out
        </button>
      </div>
    </div>
  )
}

export default DashboardPage