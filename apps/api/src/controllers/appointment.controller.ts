import { Request, Response } from 'express'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { createAppointmentSchema, updateAppointmentSchema } from '../validators/appointment.validator'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

export async function createAppointment(req: Request, res: Response) {
  const parsed = createAppointmentSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten().fieldErrors })
  }

  const { leadId, contactId, ...rest } = parsed.data

  if (leadId) {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead) {
      return res.status(400).json({ error: 'leadId does not match any existing lead' })
    }
  }

  if (contactId) {
    const contact = await prisma.contact.findUnique({ where: { id: contactId } })
    if (!contact) {
      return res.status(400).json({ error: 'contactId does not match any existing contact' })
    }
  }

  const appointment = await prisma.appointment.create({
    data: {
      ...rest,
      startTime: new Date(rest.startTime),
      endTime: new Date(rest.endTime),
      leadId,
      contactId,
    },
  })

  return res.status(201).json({ appointment })
}

export async function getAppointments(req: Request, res: Response) {
  const from = req.query.from as string | undefined
  const to = req.query.to as string | undefined

  const where: any = {}

  if (from || to) {
    where.startTime = {}
    if (from) where.startTime.gte = new Date(from)
    if (to) where.startTime.lte = new Date(to)
  }

  const appointments = await prisma.appointment.findMany({
    where,
    orderBy: { startTime: 'asc' },
    include: {
      lead: { select: { id: true, name: true } },
      contact: { select: { id: true, name: true } },
    },
  })

  return res.status(200).json({ appointments })
}

export async function getAppointmentById(req: Request, res: Response) {
  const id = req.params.id as string
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      lead: { select: { id: true, name: true } },
      contact: { select: { id: true, name: true } },
    },
  })
  if (!appointment) {
    return res.status(404).json({ error: 'Appointment not found' })
  }
  return res.status(200).json({ appointment })
}

export async function updateAppointment(req: Request, res: Response) {
  const id = req.params.id as string
  const parsed = updateAppointmentSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten().fieldErrors })
  }

  const existing = await prisma.appointment.findUnique({ where: { id } })
  if (!existing) {
    return res.status(404).json({ error: 'Appointment not found' })
  }

  const { startTime, endTime, ...rest } = parsed.data

  const appointment = await prisma.appointment.update({
    where: { id },
    data: {
      ...rest,
      ...(startTime && { startTime: new Date(startTime) }),
      ...(endTime && { endTime: new Date(endTime) }),
    },
  })

  return res.status(200).json({ appointment })
}

export async function deleteAppointment(req: Request, res: Response) {
  const id = req.params.id as string
  const existing = await prisma.appointment.findUnique({ where: { id } })
  if (!existing) {
    return res.status(404).json({ error: 'Appointment not found' })
  }
  await prisma.appointment.delete({ where: { id } })
  return res.status(204).send()
}