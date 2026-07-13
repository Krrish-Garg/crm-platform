import request from 'supertest'
import app from '../../app'
import { PrismaClient } from '../../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const testEmail = 'appt-test-user@example.com'
let token: string

beforeAll(async () => {
  await request(app).post('/api/auth/register').send({ email: testEmail, password: 'password123' })
  const login = await request(app).post('/api/auth/login').send({ email: testEmail, password: 'password123' })
  token = login.body.accessToken
})

afterAll(async () => {
  await prisma.appointment.deleteMany({ where: { title: { contains: 'ApptTest' } } })
  await prisma.user.deleteMany({ where: { email: testEmail } })
  await prisma.$disconnect()
})

describe('POST /api/appointments', () => {
  it('creates an appointment with valid, correctly-ordered times', async () => {
    const response = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'ApptTest Valid',
        startTime: '2026-08-01T14:00:00.000Z',
        endTime: '2026-08-01T15:00:00.000Z',
      })

    expect(response.status).toBe(201)
    expect(response.body.appointment.title).toBe('ApptTest Valid')
  })

  it('rejects an appointment where endTime is before startTime', async () => {
    const response = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'ApptTest Invalid',
        startTime: '2026-08-01T15:00:00.000Z',
        endTime: '2026-08-01T14:00:00.000Z',
      })

    expect(response.status).toBe(400)
    expect(response.body.errors.endTime).toBeDefined()
  })
})

describe('GET /api/appointments', () => {
  it('filters appointments by date range', async () => {
    await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'ApptTest InRange',
        startTime: '2026-09-15T10:00:00.000Z',
        endTime: '2026-09-15T11:00:00.000Z',
      })

    const response = await request(app)
      .get('/api/appointments?from=2026-09-01T00:00:00.000Z&to=2026-09-30T23:59:59.000Z')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    const titles = response.body.appointments.map((a: any) => a.title)
    expect(titles).toContain('ApptTest InRange')
  })
})