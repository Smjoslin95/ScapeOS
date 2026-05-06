import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import {
  listAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  cancelAppointment,
} from '../controllers/appointments.js'

const router = Router()

router.use(requireAuth)                              // all appointment routes require login

router.get('/',      listAppointments)               // GET  /api/appointments?date=YYYY-MM-DD
router.get('/:id',   getAppointment)                 // GET  /api/appointments/:id
router.post('/',     createAppointment)              // POST /api/appointments
router.patch('/:id', updateAppointment)              // PATCH /api/appointments/:id
router.delete('/:id',requireRole('admin'), cancelAppointment) // DELETE (admin only)

export default router
