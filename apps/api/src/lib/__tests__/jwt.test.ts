import jwt from 'jsonwebtoken'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../jwt'

describe('JWT utilities', () => {
  it('generateAccessToken produces a valid, decodable token', () => {
    const userId = 'test-user-id-123'
    const token = generateAccessToken(userId)

    expect(typeof token).toBe('string')

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as { sub: string }
    expect(decoded.sub).toBe(userId)
  })

  it('generateRefreshToken produces a token verifiable by verifyRefreshToken', () => {
    const userId = 'test-user-id-456'
    const token = generateRefreshToken(userId)

    const payload = verifyRefreshToken(token)
    expect(payload.sub).toBe(userId)
  })

  it('verifyRefreshToken throws on a token signed with the wrong secret', () => {
    const fakeToken = jwt.sign({ sub: 'someone' }, 'wrong-secret')

    expect(() => verifyRefreshToken(fakeToken)).toThrow()
  })
})