import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import {
  listInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from '../controllers/inventory.js'

const router = Router()

router.use(requireAuth)

router.get('/',       listInventory)                              // GET
router.post('/',      requireRole('admin'), createInventoryItem)  // POST
router.patch('/:id',  requireRole('admin'), updateInventoryItem)  // PATCH
router.delete('/:id', requireRole('admin'), deleteInventoryItem)  // DELETE

export default router
