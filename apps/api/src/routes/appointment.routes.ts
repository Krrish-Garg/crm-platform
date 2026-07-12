import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
} from '../controllers/appointment.controller'

const router = Router()

router.post('/', requireAuth, createAppointment)
router.get('/', requireAuth, getAppointments)
router.get('/:id', requireAuth, getAppointmentById)
router.patch('/:id', requireAuth, updateAppointment)
router.delete('/:id', requireAuth, deleteAppointment)

export default router