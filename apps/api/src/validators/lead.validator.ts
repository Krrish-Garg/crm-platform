import { z } from 'zod'

export const createLeadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  status: z.enum(['COLD', 'WARM', 'HOT', 'WON', 'LOST']).optional(),
  score: z.number().int().min(0).max(100).optional(),
  source: z.string().optional(),
  assignedToId: z.string().uuid().optional(),
})

export type CreateLeadInput = z.infer<typeof createLeadSchema>

export const updateLeadSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  status: z.enum(['COLD', 'WARM', 'HOT', 'WON', 'LOST']).optional(),
  score: z.number().int().min(0).max(100).optional(),
  source: z.string().optional(),
  assignedToId: z.string().uuid().optional(),
})

export type UpdateLeadInput = z.infer<typeof updateLeadSchema>