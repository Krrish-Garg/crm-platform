import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

export function requireRole(...allowedRoles: string[]) {
  return async (req: Request & { userId?: string }, res: Response, next: NextFunction) => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { role: true },
    })

    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }

    next()
  }
}