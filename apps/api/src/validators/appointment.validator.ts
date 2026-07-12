import { z } from 'zod'

export const createAppointmentSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    startTime: z.string().datetime('Invalid start time'),
    endTime: z.string().datetime('Invalid end time'),
    location: z.string().optional(),
    leadId: z.string().uuid().optional(),
    contactId: z.string().uuid().optional(),
  })
  .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
    message: 'End time must be after start time',
    path: ['endTime'],
  })

export const updateAppointmentSchema = z
  .object({
    title: z.string().min(1, 'Title is required').optional(),
    description: z.string().optional(),
    startTime: z.string().datetime('Invalid start time').optional(),
    endTime: z.string().datetime('Invalid end time').optional(),
    location: z.string().optional(),
    leadId: z.string().uuid().optional(),
    contactId: z.string().uuid().optional(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return new Date(data.endTime) > new Date(data.startTime)
      }
      return true
    },
    { message: 'End time must be after start time', path: ['endTime'] }
  )

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>