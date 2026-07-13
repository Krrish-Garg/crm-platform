import request from 'supertest'
import app from '../../app'
import { PrismaClient } from '../../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const repEmail = 'lead-test-rep@example.com'
const adminEmail = 'lead-test-admin@example.com'

let repToken: string
let adminToken: string

beforeAll(async () => {
  await request(app).post('/api/auth/register').send({ email: repEmail, password: 'password123' })
  const repLogin = await request(app).post('/api/auth/login').send({ email: repEmail, password: 'password123' })
  repToken = repLogin.body.accessToken

  await request(app).post('/api/auth/register').send({ email: adminEmail, password: 'password123' })
  await prisma.user.update({ where: { email: adminEmail }, data: { role: 'ADMIN' } })
  const adminLogin = await request(app).post('/api/auth/login').send({ email: adminEmail, password: 'password123' })
  adminToken = adminLogin.body.accessToken
})

afterAll(async () => {
  await prisma.lead.deleteMany({ where: { email: { contains: 'leadtest' } } })
  await prisma.user.deleteMany({ where: { email: { in: [repEmail, adminEmail] } } })
  await prisma.$disconnect()
})

describe('POST /api/leads', () => {
  it('creates a lead with valid data', async () => {
    const response = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${repToken}`)
      .send({ name: 'Test Lead', email: 'leadtest1@example.com' })

    expect(response.status).toBe(201)
    expect(response.body.lead.name).toBe('Test Lead')
    expect(response.body.lead.status).toBe('COLD')
  })

  it('rejects a lead with invalid email', async () => {
    const response = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${repToken}`)
      .send({ name: 'Bad Lead', email: 'not-an-email' })

    expect(response.status).toBe(400)
    expect(response.body.errors.email).toBeDefined()
  })

  it('rejects requests with no auth token', async () => {
    const response = await request(app)
      .post('/api/leads')
      .send({ name: 'No Auth', email: 'leadtest2@example.com' })

    expect(response.status).toBe(401)
  })
})

describe('GET /api/leads/:id', () => {
  it('returns 404 for a nonexistent lead', async () => {
    const response = await request(app)
      .get('/api/leads/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${repToken}`)

    expect(response.status).toBe(404)
  })
})

describe('DELETE /api/leads/:id — role enforcement', () => {
  it('rejects deletion by a SALES_REP', async () => {
    const created = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${repToken}`)
      .send({ name: 'Delete Me', email: 'leadtest3@example.com' })

    const response = await request(app)
      .delete(`/api/leads/${created.body.lead.id}`)
      .set('Authorization', `Bearer ${repToken}`)

    expect(response.status).toBe(403)
  })

  it('allows deletion by an ADMIN', async () => {
    const created = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${repToken}`)
      .send({ name: 'Delete Me Too', email: 'leadtest4@example.com' })

    const response = await request(app)
      .delete(`/api/leads/${created.body.lead.id}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(response.status).toBe(204)
  })
})