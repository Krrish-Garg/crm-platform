import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { register, login, me, refresh, logout } from '../controllers/auth.controller'
const router = Router()

router.post('/register', register)
router.post('/login', login)
router.get('/me', requireAuth, me)
router.post('/refresh', refresh)
router.post('/logout', logout)

export default router