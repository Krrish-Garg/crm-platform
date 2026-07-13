import request from 'supertest'
import app from '../../app'
import { PrismaClient } from '../../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const testEmail = 'contact-test-user@example.com'
let token: string

beforeAll(async () => {
  await request(app).post('/api/auth/register').send({ email: testEmail, password: 'password123' })
  const login = await request(app).post('/api/auth/login').send({ email: testEmail, password: 'password123' })
  token = login.body.accessToken
})

afterAll(async () => {
  await prisma.contact.deleteMany({ where: { email: { contains: 'contacttest' } } })
  await prisma.user.deleteMany({ where: { email: testEmail } })
  await prisma.$disconnect()
})

describe('POST /api/contacts', () => {
  it('creates a contact with valid data', async () => {
    const response = await request(app)
      .post('/api/contacts')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Contact', email: 'contacttest1@example.com' })

    expect(response.status).toBe(201)
    expect(response.body.contact.name).toBe('Test Contact')
  })

  it('rejects a contact with invalid email', async () => {
    const response = await request(app)
      .post('/api/contacts')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Bad Contact', email: 'not-an-email' })

    expect(response.status).toBe(400)
  })

  it('rejects requests with no auth token', async () => {
    const response = await request(app)
      .post('/api/contacts')
      .send({ name: 'No Auth', email: 'contacttest2@example.com' })

    expect(response.status).toBe(401)
  })
})

describe('GET /api/contacts', () => {
  it('returns paginated results', async () => {
    const response = await request(app)
      .get('/api/contacts')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body.pagination).toBeDefined()
    expect(Array.isArray(response.body.contacts)).toBe(true)
  })
})

describe('PATCH /api/contacts/:id', () => {
  it('partially updates a contact without touching other fields', async () => {
    const created = await request(app)
      .post('/api/contacts')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Update Me', email: 'contacttest3@example.com', company: 'OriginalCo' })

    const response = await request(app)
      .patch(`/api/contacts/${created.body.contact.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ company: 'UpdatedCo' })

    expect(response.status).toBe(200)
    expect(response.body.contact.company).toBe('UpdatedCo')
    expect(response.body.contact.name).toBe('Update Me')
  })
})

describe('DELETE /api/contacts/:id', () => {
  it('deletes a contact and returns 204', async () => {
    const created = await request(app)
      .post('/api/contacts')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Delete Me', email: 'contacttest4@example.com' })

    const response = await request(app)
      .delete(`/api/contacts/${created.body.contact.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(204)
  })

  it('returns 404 when deleting a nonexistent contact', async () => {
    const response = await request(app)
      .delete('/api/contacts/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(404)
  })
})