import { Request, Response } from 'express'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { createContactSchema, updateContactSchema } from '../validators/contact.validator'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

export async function createContact(req: Request, res: Response) {
  const parsed = createContactSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten().fieldErrors })
  }
  const contact = await prisma.contact.create({ data: parsed.data })
  return res.status(201).json({ contact })
}

export async function getContacts(req: Request, res: Response) {
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 10
  const skip = (page - 1) * limit
  const search = req.query.search as string | undefined

  const where: any = {}
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { company: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [contacts, total] = await Promise.all([
    prisma.contact.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.contact.count({ where }),
  ])

  return res.status(200).json({
    contacts,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
}

export async function getContactById(req: Request, res: Response) {
  const id = req.params.id as string
  const contact = await prisma.contact.findUnique({ where: { id } })
  if (!contact) {
    return res.status(404).json({ error: 'Contact not found' })
  }
  return res.status(200).json({ contact })
}

export async function updateContact(req: Request, res: Response) {
  const id = req.params.id as string
  const parsed = updateContactSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten().fieldErrors })
  }
  const existing = await prisma.contact.findUnique({ where: { id } })
  if (!existing) {
    return res.status(404).json({ error: 'Contact not found' })
  }
  const contact = await prisma.contact.update({ where: { id }, data: parsed.data })
  return res.status(200).json({ contact })
}

export async function deleteContact(req: Request, res: Response) {
  const id = req.params.id as string
  const existing = await prisma.contact.findUnique({ where: { id } })
  if (!existing) {
    return res.status(404).json({ error: 'Contact not found' })
  }
  await prisma.contact.delete({ where: { id } })
  return res.status(204).send()
}