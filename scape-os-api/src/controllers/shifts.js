import pool from '../db/pool.js'

// ── GET /api/shifts?week=2025-04-14 ──────────────────────────────────────────
// Returns shifts for the 7-day window starting from `week` (Monday).
export async function listShifts(req, res) {
  try {
    const week = req.query.week || new Date().toISOString().slice(0, 10)
    const { rows } = await pool.query(
      `SELECT
         s.id,
         s.shift_date,
         s.start_time,
         s.end_time,
         st.id   AS staff_id,
         st.name AS staff,
         st.role
       FROM shifts s
       JOIN staff st ON st.id = s.staff_id
       WHERE s.shift_date BETWEEN $1::date AND ($1::date + interval '6 days')
       ORDER BY s.shift_date ASC, s.start_time ASC`,
      [week]
    )
    res.json(rows)
  } catch (err) {
    console.error('listShifts:', err)
    res.status(500).json({ error: 'Failed to fetch shifts' })
  }
}

// ── POST /api/shifts ──────────────────────────────────────────────────────────
export async function createShift(req, res) {
  const { staff_id, shift_date, start_time, end_time } = req.body
  if (!staff_id || !shift_date || !start_time || !end_time) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO shifts (staff_id, shift_date, start_time, end_time)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (staff_id, shift_date)
       DO UPDATE SET start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time
       RETURNING id`,
      [staff_id, shift_date, start_time, end_time]
    )
    res.status(201).json({ id: rows[0].id, message: 'Shift saved' })
  } catch (err) {
    console.error('createShift:', err)
    res.status(500).json({ error: 'Failed to save shift' })
  }
}

// ── DELETE /api/shifts/:id ────────────────────────────────────────────────────
export async function deleteShift(req, res) {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM shifts WHERE id = $1',
      [req.params.id]
    )
    if (!rowCount) return res.status(404).json({ error: 'Shift not found' })
    res.json({ message: 'Shift deleted' })
  } catch (err) {
    console.error('deleteShift:', err)
    res.status(500).json({ error: 'Failed to delete shift' })
  }
}
