import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { requireRole } from '../middleware/role.middleware'
import { createLead, getLeads, getLeadById, updateLead, deleteLead, getLeadStats, generateLeadEmail, analyzeLead, getLeadTrend } from '../controllers/lead.controller'

const router = Router()

router.post('/', requireAuth, createLead)
router.get('/', requireAuth, getLeads)
router.get('/stats', requireAuth, getLeadStats)
router.get('/trend', requireAuth, getLeadTrend)
router.get('/:id', requireAuth, getLeadById)
router.patch('/:id', requireAuth, updateLead)
router.delete('/:id', requireAuth, requireRole('ADMIN', 'MANAGER'), deleteLead)
router.post('/:id/generate-email', requireAuth, generateLeadEmail)
router.post('/:id/analyze', requireAuth, analyzeLead)

export default router