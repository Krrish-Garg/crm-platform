import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { registerSchema, loginSchema, refreshSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/auth.validator'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, generateResetToken } from '../lib/jwt'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten().fieldErrors })
  }

  const { password } = parsed.data
  const email = parsed.data.email.toLowerCase().trim()

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return res.status(409).json({ error: 'Email already in use' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
    },
  })

  return res.status(201).json({ user })
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten().fieldErrors })
  }

  const { password } = parsed.data
  const email = parsed.data.email.toLowerCase().trim()

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  const passwordMatches = await bcrypt.compare(password, user.password)

  if (!passwordMatches) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  const accessToken = generateAccessToken(user.id)
  const refreshToken = generateRefreshToken(user.id)

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })

  return res.status(200).json({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  })
}

export async function me(req: Request & { userId?: string }, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
    },
  })

  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  return res.status(200).json({ user })
}


export async function refresh(req: Request, res: Response) {
  const parsed = refreshSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten().fieldErrors })
  }

  const { refreshToken } = parsed.data

  let payload: { sub: string }
  try {
    payload = verifyRefreshToken(refreshToken)
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' })
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  })

  if (!storedToken || storedToken.revokedAt) {
    return res.status(401).json({ error: 'Refresh token has been revoked' })
  }

  const newAccessToken = generateAccessToken(payload.sub)

  return res.status(200).json({ accessToken: newAccessToken })
}

export async function logout(req: Request, res: Response) {
  const parsed = refreshSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten().fieldErrors })
  }

  const { refreshToken } = parsed.data

  await prisma.refreshToken.updateMany({
    where: { token: refreshToken, revokedAt: null },
    data: { revokedAt: new Date() },
  })

  return res.status(200).json({ message: 'Logged out successfully' })
}

export async function forgotPassword(req: Request, res: Response) {
  const parsed = forgotPasswordSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten().fieldErrors })
  }

  const email = parsed.data.email.toLowerCase().trim()
  const user = await prisma.user.findUnique({ where: { email } })

  // Always return the same generic response, regardless of whether the user exists —
  // same enumeration-protection principle as login.
  if (!user) {
    return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' })
  }

  const token = generateResetToken()
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt },
  })

  // In a real app, this token would be emailed, never returned directly.
  // Returning it here only for local testing purposes.
  return res.status(200).json({
    message: 'If that email exists, a reset link has been sent.',
    devToken: token,
  })
}

export async function resetPassword(req: Request, res: Response) {
  const parsed = resetPasswordSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten().fieldErrors })
  }

  const { token, password } = parsed.data

  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } })

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return res.status(400).json({ error: 'Invalid or expired reset token' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ])

  return res.status(200).json({ message: 'Password reset successfully' })
}