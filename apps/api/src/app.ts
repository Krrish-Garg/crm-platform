import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.routes'
import leadRoutes from './routes/lead.routes'
import contactRoutes from './routes/contact.routes'
import appointmentRoutes from './routes/appointment.routes'

const app = express()
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://crm-platform-steel.vercel.app',
  ],
}))
app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/api/leads', leadRoutes)
app.use('/api/contacts', contactRoutes)
app.use('/api/appointments', appointmentRoutes)

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})
export default app