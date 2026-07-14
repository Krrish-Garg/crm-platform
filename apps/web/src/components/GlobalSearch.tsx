import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { globalSearch } from '../lib/search.api'

function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const { data, isFetching } = useQuery({
    queryKey: ['globalSearch', debouncedQuery],
    queryFn: () => globalSearch(debouncedQuery),
    enabled: debouncedQuery.trim().length > 0,
  })

  const totalResults = (data?.leads.length || 0) + (data?.contacts.length || 0) + (data?.appointments.length || 0)

  return (
    <div className="relative w-64" ref={containerRef}>
      <input
        type="text"
        placeholder="Search everything..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
      />

      {isOpen && debouncedQuery.trim().length > 0 && (
        <div className="absolute left-0 mt-1 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
          {isFetching && <p className="p-4 text-sm text-gray-400">Searching...</p>}

          {!isFetching && totalResults === 0 && (
            <p className="p-4 text-sm text-gray-400">No results found</p>
          )}

          {!isFetching && data && data.leads.length > 0 && (
            <div>
              <div className="px-3 py-1 text-xs font-semibold text-gray-500 bg-gray-50">LEADS</div>
              {data.leads.map((lead) => (
                <div key={lead.id} className="px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-50">
                  <div className="text-gray-900">{lead.name}</div>
                  <div className="text-gray-500 text-xs">{lead.email} · {lead.status}</div>
                </div>
              ))}
            </div>
          )}

          {!isFetching && data && data.contacts.length > 0 && (
            <div>
              <div className="px-3 py-1 text-xs font-semibold text-gray-500 bg-gray-50">CONTACTS</div>
              {data.contacts.map((contact) => (
                <div key={contact.id} className="px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-50">
                  <div className="text-gray-900">{contact.name}</div>
                  <div className="text-gray-500 text-xs">{contact.email}</div>
                </div>
              ))}
            </div>
          )}

          {!isFetching && data && data.appointments.length > 0 && (
            <div>
              <div className="px-3 py-1 text-xs font-semibold text-gray-500 bg-gray-50">APPOINTMENTS</div>
              {data.appointments.map((appt) => (
                <div key={appt.id} className="px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-50">
                  <div className="text-gray-900">{appt.title}</div>
                  <div className="text-gray-500 text-xs">{new Date(appt.startTime).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default GlobalSearch