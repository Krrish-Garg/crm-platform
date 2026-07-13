import api from './axios'

export interface Appointment {
  id: string
  title: string
  description: string | null
  startTime: string
  endTime: string
  location: string | null
  leadId: string | null
  contactId: string | null
  lead: { id: string; name: string } | null
  contact: { id: string; name: string } | null
  createdAt: string
  updatedAt: string
}

export interface GetAppointmentsParams {
  from?: string
  to?: string
}

export async function getAppointments(params: GetAppointmentsParams = {}): Promise<{ appointments: Appointment[] }> {
  const response = await api.get('/appointments', { params })
  return response.data
}

export async function createAppointment(data: {
  title: string
  description?: string
  startTime: string
  endTime: string
  location?: string
}): Promise<{ appointment: Appointment }> {
  const response = await api.post('/appointments', data)
  return response.data
}

export async function deleteAppointment(id: string): Promise<void> {
  await api.delete(`/appointments/${id}`)
}