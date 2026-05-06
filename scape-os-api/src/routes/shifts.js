import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { listShifts, createShift, deleteShift } from '../controllers/shifts.js'

const router = Router()

router.use(requireAuth)

router.get('/',       listShifts)                          // GET  /api/shifts?week=YYYY-MM-DD
router.post('/',      requireRole('admin'), createShift)   // POST /api/shifts
router.delete('/:id', requireRole('admin'), deleteShift)   // DELETE /api/shifts/:id

export default router
