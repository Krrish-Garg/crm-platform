import api from './axios'

export interface Lead {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  status: 'COLD' | 'WARM' | 'HOT' | 'WON' | 'LOST'
  score: number
  source: string | null
  createdAt: string
  updatedAt: string
  assignedToId: string | null
}

export interface PaginatedLeads {
  leads: Lead[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface GetLeadsParams {
  page?: number
  limit?: number
  status?: string
  search?: string
}

export async function getLeads(params: GetLeadsParams): Promise<PaginatedLeads> {
  const response = await api.get('/leads', { params })
  return response.data
}

export async function createLead(data: Partial<Lead>): Promise<{ lead: Lead }> {
  const response = await api.post('/leads', data)
  return response.data
}

export async function updateLead(id: string, data: Partial<Lead>): Promise<{ lead: Lead }> {
  const response = await api.patch(`/leads/${id}`, data)
  return response.data
}

export async function deleteLead(id: string): Promise<void> {
  await api.delete(`/leads/${id}`)
}


export interface LeadStats {
  total: number
  byStatus: Record<string, number>
  averageScore: number
}

export async function getLeadStats(): Promise<LeadStats> {
  const response = await api.get('/leads/stats')
  return response.data
}

export async function generateLeadEmail(id: string): Promise<{ email: string }> {
  const response = await api.post(`/leads/${id}/generate-email`)
  return response.data
}

export async function analyzeLead(id: string): Promise<{ lead: Lead; reasoning: string }> {
  const response = await api.post(`/leads/${id}/analyze`)
  return response.data
}