import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import {
  createContact,
  getContacts,
  getContactById,
  updateContact,
  deleteContact,
} from '../controllers/contact.controller'

const router = Router()

router.post('/', requireAuth, createContact)
router.get('/', requireAuth, getContacts)
router.get('/:id', requireAuth, getContactById)
router.patch('/:id', requireAuth, updateContact)
router.delete('/:id', requireAuth, deleteContact)

export default router