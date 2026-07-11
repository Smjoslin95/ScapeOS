import pool from '../db/pool.js'

// ── GET /api/feedback ─────────────────────────────────────────────────────────
// Query params: ?staff_id=2  ?limit=20
export async function listFeedback(req, res) {
  try {
    const { staff_id, limit = 50 } = req.query
    const params = []
    let where = ''

    if (staff_id) {
      params.push(staff_id)
      where = `WHERE f.staff_id = $${params.length}`
    }

    params.push(parseInt(limit))
    const { rows } = await pool.query(
      `SELECT
         f.id,
         f.rating,
         f.comment,
         f.created_at,
         c.first_name || ' ' || c.last_name AS client,
         st.name AS staff,
         sv.name AS service
       FROM feedback f
       LEFT JOIN clients      c  ON c.id  = f.client_id
       LEFT JOIN staff        st ON st.id = f.staff_id
       LEFT JOIN appointments a  ON a.id  = f.appointment_id
       LEFT JOIN services     sv ON sv.id = a.service_id
       ${where}
       ORDER BY f.created_at DESC
       LIMIT $${params.length}`,
      params
    )
    res.json(rows)
  } catch (err) {
    console.error('listFeedback:', err)
    res.status(500).json({ error: 'Failed to fetch feedback' })
  }
}

// ── GET /api/feedback/stats ───────────────────────────────────────────────────
export async function feedbackStats(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT
         COUNT(*)                                   AS total,
         ROUND(AVG(rating), 2)                      AS avg_rating,
         COUNT(*) FILTER (WHERE rating = 5)         AS five_star,
         COUNT(*) FILTER (WHERE rating <= 2)        AS low_rating,
         st.name                                    AS staff,
         st.id                                      AS staff_id
       FROM feedback f
       JOIN staff st ON st.id = f.staff_id
       GROUP BY st.id, st.name
       ORDER BY avg_rating DESC`
    )
    res.json(rows)
  } catch (err) {
    console.error('feedbackStats:', err)
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
}

// ── POST /api/feedback ────────────────────────────────────────────────────────
export async function createFeedback(req, res) {
  const { appointment_id, client_id, staff_id, rating, comment } = req.body
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' })
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO feedback (appointment_id, client_id, staff_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [appointment_id || null, client_id || null, staff_id || null, rating, comment || null]
    )
    res.status(201).json({ id: rows[0].id, message: 'Feedback submitted' })
  } catch (err) {
    console.error('createFeedback:', err)
    res.status(500).json({ error: 'Failed to submit feedback' })
  }
}
