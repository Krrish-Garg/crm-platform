import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { register, login, me, refresh, logout, forgotPassword, resetPassword } from '../controllers/auth.controller'
import { authLimiter } from '../middleware/rateLimit.middleware'

const router = Router()

router.post('/register', authLimiter, register)
router.post('/login', authLimiter, login)
router.get('/me', requireAuth, me)
router.post('/refresh', refresh)
router.post('/logout', logout)
router.post('/forgot-password', authLimiter, forgotPassword)
router.post('/reset-password', authLimiter, resetPassword)

export default router