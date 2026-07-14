import { Request, Response } from 'express'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

export async function getNotifications(req: Request, res: Response) {
  const now = new Date()
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  const upcomingAppointments = await prisma.appointment.findMany({
    where: {
      startTime: {
        gte: now,
        lte: in24Hours,
      },
    },
    orderBy: { startTime: 'asc' },
    select: {
      id: true,
      title: true,
      startTime: true,
    },
  })

  const notifications = upcomingAppointments.map((appt) => ({
    id: `appt-${appt.id}`,
    type: 'appointment_upcoming',
    message: `"${appt.title}" starts at ${appt.startTime.toLocaleString()}`,
    relatedId: appt.id,
  }))

  return res.status(200).json({ notifications })
}