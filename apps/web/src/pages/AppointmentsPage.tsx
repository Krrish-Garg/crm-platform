import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAppointments, createAppointment, deleteAppointment } from '../lib/appointments.api'

function AppointmentsPage() {
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [location, setLocation] = useState('')
  const [error, setError] = useState('')

  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => getAppointments(),
  })

  const createMutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      setTitle('')
      setStartTime('')
      setEndTime('')
      setLocation('')
      setError('')
      setShowForm(false)
    },
    onError: (err: any) => {
      const message = err.response?.data?.errors?.endTime?.[0]
        || err.response?.data?.errors?.title?.[0]
        || err.response?.data?.error
        || 'Something went wrong'
      setError(message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    createMutation.mutate({
      title,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      location: location || undefined,
    })
  }

  function handleDelete(id: string, title: string) {
    if (window.confirm(`Delete appointment "${title}"?`)) {
      deleteMutation.mutate(id)
    }
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading appointments...</div>
  }

  if (isError) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">Error loading appointments.</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Appointments</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            {showForm ? 'Cancel' : '+ New Appointment'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 mb-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded">{error}</div>
            )}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End</label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Saving...' : 'Save Appointment'}
            </button>
          </form>
        )}

        <div className="space-y-3">
          {data?.appointments.length === 0 && (
            <p className="text-gray-400 text-sm">No appointments yet.</p>
          )}
          {data?.appointments.map((appt) => (
            <div key={appt.id} className="bg-white rounded-lg shadow-sm p-4 flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900">{appt.title}</h3>
                <p className="text-sm text-gray-600">
                  {formatTime(appt.startTime)} — {formatTime(appt.endTime)}
                </p>
                {appt.location && <p className="text-sm text-gray-500">📍 {appt.location}</p>}
                {(appt.lead || appt.contact) && (
                  <p className="text-sm text-gray-500">
                    {appt.lead && `Lead: ${appt.lead.name}`}
                    {appt.contact && `Contact: ${appt.contact.name}`}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleDelete(appt.id, appt.title)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AppointmentsPage