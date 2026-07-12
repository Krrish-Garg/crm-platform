import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getContacts, createContact, deleteContact, type Contact } from '../lib/contacts.api'

function ContactsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [error, setError] = useState('')

  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['contacts', { page, search }],
    queryFn: () => getContacts({ page, limit: 10, search: search || undefined }),
  })

  const createMutation = useMutation({
    mutationFn: createContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      setName('')
      setEmail('')
      setCompany('')
      setJobTitle('')
      setError('')
      setShowForm(false)
    },
    onError: (err: any) => {
      const message = err.response?.data?.errors?.email?.[0]
        || err.response?.data?.error
        || 'Something went wrong'
      setError(message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    createMutation.mutate({ name, email, company: company || undefined, jobTitle: jobTitle || undefined })
  }

  function handleDelete(id: string, name: string) {
    if (window.confirm(`Delete contact "${name}"? This cannot be undone.`)) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading contacts...</div>
  }

  if (isError) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">Error loading contacts.</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Contacts</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            {showForm ? 'Cancel' : '+ New Contact'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 mb-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded">{error}</div>
            )}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="Company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="Job Title"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Saving...' : 'Save Contact'}
            </button>
          </form>
        )}

        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="px-3 py-2 border border-gray-300 rounded-md w-full mb-4"
        />

        <table className="w-full bg-white rounded-lg shadow-sm overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">Name</th>
              <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">Email</th>
              <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">Company</th>
              <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">Job Title</th>
              <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.contacts.map((contact) => (
              <tr key={contact.id} className="border-t border-gray-100">
                <td className="px-4 py-2 text-sm text-gray-900">{contact.name}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{contact.email}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{contact.company || '—'}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{contact.jobTitle || '—'}</td>
                <td className="px-4 py-2 text-sm">
                  <button
                    onClick={() => handleDelete(contact.id, contact.name)}
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
    </div>
  )
}

export default ContactsPage   