import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getNotifications } from '../lib/notifications.api'

function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    refetchInterval: 60000,
  })

  const count = data?.notifications.length || 0

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
      >
        🔔
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {count}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-3 border-b border-gray-100 font-medium text-sm text-gray-900">
            Notifications
          </div>
          {count === 0 ? (
            <p className="p-4 text-sm text-gray-400">No upcoming reminders</p>
          ) : (
            <ul className="max-h-64 overflow-y-auto">
              {data?.notifications.map((n) => (
                <li key={n.id} className="p-3 text-sm text-gray-700 border-b border-gray-50 last:border-0">
                  {n.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationBell