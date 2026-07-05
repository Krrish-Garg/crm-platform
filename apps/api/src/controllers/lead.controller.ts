import { Request, Response } from 'express'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { createLeadSchema, updateLeadSchema } from '../validators/lead.validator'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

export async function createLead(req: Request, res: Response) {
  const parsed = createLeadSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten().fieldErrors })
  }

  const data = parsed.data

  if (data.assignedToId) {
    const assignedUser = await prisma.user.findUnique({
      where: { id: data.assignedToId },
    })
    if (!assignedUser) {
      return res.status(400).json({ error: 'assignedToId does not match any existing user' })
    }
  }

  const lead = await prisma.lead.create({
    data,
  })

  return res.status(201).json({ lead })
}

export async function getLeads(req: Request, res: Response) {
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 10
  const skip = (page - 1) * limit

  const status = req.query.status as string | undefined
  const search = req.query.search as string | undefined

  const where: any = {}

  if (status) {
    where.status = status
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { company: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.lead.count({ where }),
  ])

  return res.status(200).json({
    leads,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}


export async function getLeadById(req: Request, res: Response) {
  const id = req.params.id as string

  const lead = await prisma.lead.findUnique({
    where: { id },
  })

  if (!lead) {
    return res.status(404).json({ error: 'Lead not found' })
  }

  return res.status(200).json({ lead })
}

export async function updateLead(req: Request, res: Response) {
  const id = req.params.id as string
  const parsed = updateLeadSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten().fieldErrors })
  }

  const data = parsed.data

  const existingLead = await prisma.lead.findUnique({ where: { id } })
  if (!existingLead) {
    return res.status(404).json({ error: 'Lead not found' })
  }

  if (data.assignedToId) {
    const assignedUser = await prisma.user.findUnique({
      where: { id: data.assignedToId },
    })
    if (!assignedUser) {
      return res.status(400).json({ error: 'assignedToId does not match any existing user' })
    }
  }

  const updatedLead = await prisma.lead.update({
    where: { id },
    data,
  })

  return res.status(200).json({ lead: updatedLead })
}

export async function deleteLead(req: Request, res: Response) {
  const id = req.params.id as string

  const existingLead = await prisma.lead.findUnique({ where: { id } })
  if (!existingLead) {
    return res.status(404).json({ error: 'Lead not found' })
  }

  await prisma.lead.delete({ where: { id } })

  return res.status(204).send()
}