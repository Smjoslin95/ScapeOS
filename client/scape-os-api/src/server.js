import express from 'express'
import cors    from 'cors'
import dotenv  from 'dotenv'

import appointmentRoutes from './routes/appointments.js'
import shiftRoutes       from './routes/shifts.js'
import inventoryRoutes   from './routes/inventory.js'
import feedbackRoutes    from './routes/feedback.js'
import staffRoutes       from './routes/staff.js'

dotenv.config()

const app  = express()
const PORT = process.env.PORT || 8080

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json())

// ── Health check (Railway uses this) ─────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/appointments', appointmentRoutes)
app.use('/api/shifts',       shiftRoutes)
app.use('/api/inventory',    inventoryRoutes)
app.use('/api/feedback',     feedbackRoutes)
app.use('/api',              staffRoutes)       // /api/staff and /api/services

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` })
})

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✓  Scape OS API running on port ${PORT}`)
  console.log(`   ENV: ${process.env.NODE_ENV || 'development'}`)
})
