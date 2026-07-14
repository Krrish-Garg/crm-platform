import api from './axios'

export interface SearchResults {
  leads: { id: string; name: string; email: string; status: string }[]
  contacts: { id: string; name: string; email: string; company: string | null }[]
  appointments: { id: string; title: string; startTime: string }[]
}

export async function globalSearch(q: string): Promise<SearchResults> {
  const response = await api.get('/search', { params: { q } })
  return response.data
}