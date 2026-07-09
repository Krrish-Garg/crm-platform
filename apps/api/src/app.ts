import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.routes'
import leadRoutes from './routes/lead.routes'

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/api/leads', leadRoutes)

app.get('/health', (req, res) => {
  app.get('/debug-db-host', (req, res) => {
  const url = process.env.DATABASE_URL || 'NOT SET'
  const hostMatch = url.match(/@([^:]+):/)
  res.json({ host: hostMatch ? hostMatch[1] : 'could not parse', length: url.length })
})
  res.json({ status: 'ok' })
})

export default app