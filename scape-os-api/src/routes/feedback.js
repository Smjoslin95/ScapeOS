import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { listFeedback, feedbackStats, createFeedback } from '../controllers/feedback.js'

const router = Router()

router.use(requireAuth)

router.get('/',        listFeedback)    // GET  /api/feedback?staff_id=&limit=
router.get('/stats',   feedbackStats)  // GET  /api/feedback/stats
router.post('/',       createFeedback) // POST /api/feedback

export default router
