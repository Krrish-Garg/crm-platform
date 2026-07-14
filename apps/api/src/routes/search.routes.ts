import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { globalSearch } from '../controllers/search.controller'

const router = Router()

router.get('/', requireAuth, globalSearch)

export default router