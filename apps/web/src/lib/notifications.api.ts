import api from './axios'

export interface Notification {
  id: string
  type: string
  message: string
  relatedId: string
}

export async function getNotifications(): Promise<{ notifications: Notification[] }> {
  const response = await api.get('/notifications')
  return response.data
}