import request from 'supertest'
import app from '../../app'
import { PrismaClient } from '../../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const testEmail = 'integration-test-user@example.com'

afterEach(async () => {
  await prisma.user.deleteMany({ where: { email: testEmail } })
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('POST /api/auth/register', () => {
  it('creates a new user with valid input', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: testEmail, password: 'password123' })

    expect(response.status).toBe(201)
    expect(response.body.user.email).toBe(testEmail)
    expect(response.body.user.password).toBeUndefined()
  })

  it('rejects an invalid email', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'password123' })

    expect(response.status).toBe(400)
    expect(response.body.errors.email).toBeDefined()
  })

  it('rejects a duplicate email', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: testEmail, password: 'password123' })

    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: testEmail, password: 'password123' })

    expect(response.status).toBe(409)
    expect(response.body.error).toBe('Email already in use')
  })
})