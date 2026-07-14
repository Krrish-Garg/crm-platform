import { Request, Response } from 'express'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

export async function globalSearch(req: Request, res: Response) {
  const q = req.query.q as string | undefined

  if (!q || q.trim().length === 0) {
    return res.status(200).json({ leads: [], contacts: [], appointments: [] })
  }

  const [leads, contacts, appointments] = await Promise.all([
    prisma.lead.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { company: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 5,
      select: { id: true, name: true, email: true, status: true },
    }),
    prisma.contact.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { company: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 5,
      select: { id: true, name: true, email: true, company: true },
    }),
    prisma.appointment.findMany({
      where: {
        title: { contains: q, mode: 'insensitive' },
      },
      take: 5,
      select: { id: true, title: true, startTime: true },
    }),
  ])

  return res.status(200).json({ leads, contacts, appointments })
}