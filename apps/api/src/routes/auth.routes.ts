import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { register, login, me, refresh, logout } from '../controllers/auth.controller'
import { authLimiter } from '../middleware/rateLimit.middleware'

const router = Router()

router.post('/register', authLimiter, register)
router.post('/login', authLimiter, login)
router.get('/me', requireAuth, me)
router.post('/refresh', refresh)
router.post('/logout', logout)

export default router