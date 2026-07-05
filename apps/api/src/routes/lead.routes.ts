import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { createLead, getLeads, getLeadById, updateLead, deleteLead } from '../controllers/lead.controller'

const router = Router()

router.post('/', requireAuth, createLead)
router.get('/', requireAuth, getLeads)
router.get('/:id', requireAuth, getLeadById)
router.patch('/:id', requireAuth, updateLead)
router.delete('/:id', requireAuth, deleteLead)
export default router