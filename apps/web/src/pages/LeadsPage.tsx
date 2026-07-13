import { useState } from 'react'
import CreateLeadModal from '../components/CreateLeadModal'
import GeneratedEmailModal from '../components/GeneratedEmailModal'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getLeads, updateLead, deleteLead, generateLeadEmail, analyzeLead, type Lead } from '../lib/leads.api'

function LeadsPage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [generatedEmail, setGeneratedEmail] = useState<string | null>(null)
  const [emailError, setEmailError] = useState('')

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['leads', { page, status: statusFilter, search }],
    queryFn: () =>
      getLeads({
        page,
        limit: 10,
        status: statusFilter || undefined,
        search: search || undefined,
      }),
  })
  const queryClient = useQueryClient()

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Lead['status'] }) =>
      updateLead(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })

  const emailMutation = useMutation({
    mutationFn: generateLeadEmail,
    onSuccess: (data) => {
      setGeneratedEmail(data.email)
      setEmailError('')
    },
    onError: () => {
      setEmailError('Failed to generate email. Please try again.')
    },
  })

  const analyzeMutation = useMutation({
    mutationFn: analyzeLead,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      alert(`New score: ${data.lead.score}\n\nReasoning: ${data.reasoning}`)
    },
    onError: () => {
      alert('Failed to analyze lead. Please try again.')
    },
  })

  function handleStatusChange(id: string, newStatus: Lead['status']) {
    statusMutation.mutate({ id, status: newStatus })
  }

  function handleDelete(id: string, name: string) {
    if (window.confirm(`Delete lead "${name}"? This cannot be undone.`)) {
      deleteMutation.mutate(id)
    }
  }

  function handleGenerateEmail(id: string) {
    setGeneratedEmail(null)
    setEmailError('')
    setEmailModalOpen(true)
    emailMutation.mutate(id)
  }

  function handleAnalyze(id: string) {
    analyzeMutation.mutate(id)
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading leads...</div>
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Error loading leads: {(error as Error).message}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Leads</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            + New Lead
          </button>
        </div>

        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="px-3 py-2 border border-gray-300 rounded-md flex-1"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">All statuses</option>
            <option value="COLD">Cold</option>
            <option value="WARM">Warm</option>
            <option value="HOT">Hot</option>
            <option value="WON">Won</option>
            <option value="LOST">Lost</option>
          </select>
        </div>

        <table className="w-full bg-white rounded-lg shadow-sm overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">Name</th>
              <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">Email</th>
              <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">Company</th>
              <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">Status</th>
              <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">Score</th>
              <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.leads.map((lead) => (
              <tr key={lead.id} className="border-t border-gray-100">
                <td className="px-4 py-2 text-sm text-gray-900">{lead.name}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{lead.email}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{lead.company || '—'}</td>
                <td className="px-4 py-2 text-sm">
                  <select
                    value={lead.status}
                    onChange={(e) => handleStatusChange(lead.id, e.target.value as Lead['status'])}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    <option value="COLD">Cold</option>
                    <option value="WARM">Warm</option>
                    <option value="HOT">Hot</option>
                    <option value="WON">Won</option>
                    <option value="LOST">Lost</option>
                  </select>
                </td>
                <td className="px-4 py-2 text-sm text-gray-600">{lead.score}</td>
                <td className="px-4 py-2 text-sm">
                  <button
                    onClick={() => handleGenerateEmail(lead.id)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm mr-3"
                  >
                    ✨ AI Email
                  </button>
                  <button
                    onClick={() => handleAnalyze(lead.id)}
                    disabled={analyzeMutation.isPending}
                    className="text-purple-600 hover:text-purple-800 text-sm mr-3 disabled:opacity-50"
                  >
                    📊 Analyze
                  </button>
                  <button
                    onClick={() => handleDelete(lead.id, lead.name)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data && (
          <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
            <span>
              Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} total)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                disabled={page === data.pagination.totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <CreateLeadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {emailModalOpen && (
        <GeneratedEmailModal
          email={generatedEmail}
          isLoading={emailMutation.isPending}
          error={emailError}
          onClose={() => setEmailModalOpen(false)}
        />
      )}
    </div>
  )
}

export default LeadsPage