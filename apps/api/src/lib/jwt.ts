import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!

export function generateAccessToken(userId: string) {
  return jwt.sign({ sub: userId }, ACCESS_SECRET, { expiresIn: '15m' })
}

export function generateRefreshToken(userId: string) {
  return jwt.sign({ sub: userId }, REFRESH_SECRET, { expiresIn: '7d' })
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, REFRESH_SECRET) as { sub: string }
}

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex')
}