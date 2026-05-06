import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import {
  listStaff, createStaff, updateStaff,
  listServices, createService,
} from '../controllers/staff.js'

const router = Router()

router.use(requireAuth)

// Staff
router.get('/staff',        listStaff)
router.post('/staff',       requireRole('admin'), createStaff)
router.patch('/staff/:id',  requireRole('admin'), updateStaff)

// Services
router.get('/services',     listServices)
router.post('/services',    requireRole('admin'), createService)

export default router
