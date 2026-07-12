import api from './axios'

export interface Contact {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  jobTitle: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface PaginatedContacts {
  contacts: Contact[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface GetContactsParams {
  page?: number
  limit?: number
  search?: string
}

export async function getContacts(params: GetContactsParams): Promise<PaginatedContacts> {
  const response = await api.get('/contacts', { params })
  return response.data
}

export async function createContact(data: Partial<Contact>): Promise<{ contact: Contact }> {
  const response = await api.post('/contacts', data)
  return response.data
}

export async function updateContact(id: string, data: Partial<Contact>): Promise<{ contact: Contact }> {
  const response = await api.patch(`/contacts/${id}`, data)
  return response.data
}

export async function deleteContact(id: string): Promise<void> {
  await api.delete(`/contacts/${id}`)
}