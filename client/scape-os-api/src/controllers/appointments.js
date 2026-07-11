import pool from '../db/pool.js'

// ── GET /api/appointments ─────────────────────────────────────────────────────
// Query params: ?date=2025-04-12  (optional — defaults to today)
export async function listAppointments(req, res) {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10)
    const { rows } = await pool.query(
      `SELECT
         a.id,
         a.appt_date,
         a.appt_time,
         a.duration_min,
         a.status,
         a.notes,
         a.created_at,
         c.first_name || ' ' || c.last_name  AS client,
         c.email   AS client_email,
         c.phone   AS client_phone,
         sv.name   AS service,
         sv.price,
         st.name   AS staff
       FROM appointments a
       JOIN clients  c  ON c.id  = a.client_id
       JOIN services sv ON sv.id = a.service_id
       JOIN staff    st ON st.id = a.staff_id
       WHERE a.appt_date = $1
       ORDER BY a.appt_time ASC`,
      [date]
    )
    res.json(rows)
  } catch (err) {
    console.error('listAppointments:', err)
    res.status(500).json({ error: 'Failed to fetch appointments' })
  }
}

// ── GET /api/appointments/:id ─────────────────────────────────────────────────
export async function getAppointment(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT
         a.*,
         c.first_name || ' ' || c.last_name AS client,
         c.email AS client_email,
         c.phone AS client_phone,
         sv.name AS service,
         sv.price,
         st.name AS staff
       FROM appointments a
       JOIN clients  c  ON c.id  = a.client_id
       JOIN services sv ON sv.id = a.service_id
       JOIN staff    st ON st.id = a.staff_id
       WHERE a.id = $1`,
      [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Appointment not found' })
    res.json(rows[0])
  } catch (err) {
    console.error('getAppointment:', err)
    res.status(500).json({ error: 'Failed to fetch appointment' })
  }
}

// ── POST /api/appointments ────────────────────────────────────────────────────
export async function createAppointment(req, res) {
  const {
    first_name, last_name, email, phone,   // client fields
    service_id, staff_id,
    appt_date, appt_time,
    notes, status = 'pending',
  } = req.body

  // Basic validation
  if (!first_name || !last_name || !service_id || !staff_id || !appt_date || !appt_time) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Upsert client (match on email if provided)
    let clientId
    if (email) {
      const existing = await client.query(
        'SELECT id FROM clients WHERE email = $1',
        [email]
      )
      if (existing.rows.length) {
        clientId = existing.rows[0].id
      }
    }

    if (!clientId) {
      const { rows } = await client.query(
        `INSERT INTO clients (first_name, last_name, email, phone)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [first_name, last_name, email || null, phone || null]
      )
      clientId = rows[0].id
    }

    // Fetch duration from service
    const svcResult = await client.query(
      'SELECT duration FROM services WHERE id = $1',
      [service_id]
    )
    if (!svcResult.rows.length) {
      await client.query('ROLLBACK')
      return res.status(400).json({ error: 'Invalid service_id' })
    }
    const duration_min = svcResult.rows[0].duration

    // Conflict check — same staff, same date, overlapping time
    const conflict = await client.query(
      `SELECT id FROM appointments
       WHERE staff_id  = $1
         AND appt_date = $2
         AND status   != 'cancelled'
         AND appt_time < ($3::time + ($4 || ' minutes')::interval)
         AND (appt_time + (duration_min || ' minutes')::interval) > $3::time`,
      [staff_id, appt_date, appt_time, duration_min]
    )
    if (conflict.rows.length) {
      await client.query('ROLLBACK')
      return res.status(409).json({ error: 'Staff already booked at this time' })
    }

    // Insert appointment
    const { rows } = await client.query(
      `INSERT INTO appointments
         (client_id, service_id, staff_id, appt_date, appt_time, duration_min, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [clientId, service_id, staff_id, appt_date, appt_time, duration_min, status, notes || null]
    )

    await client.query('COMMIT')
    res.status(201).json({ id: rows[0].id, message: 'Appointment created' })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('createAppointment:', err)
    res.status(500).json({ error: 'Failed to create appointment' })
  } finally {
    client.release()
  }
}

// ── PATCH /api/appointments/:id ───────────────────────────────────────────────
export async function updateAppointment(req, res) {
  const allowed = ['status', 'appt_date', 'appt_time', 'staff_id', 'notes']
  const updates = Object.entries(req.body).filter(([k]) => allowed.includes(k))
  if (!updates.length) {
    return res.status(400).json({ error: 'No valid fields to update' })
  }

  const setClauses = updates.map(([k], i) => `${k} = $${i + 2}`).join(', ')
  const values     = [req.params.id, ...updates.map(([, v]) => v)]

  try {
    const { rowCount } = await pool.query(
      `UPDATE appointments SET ${setClauses} WHERE id = $1`,
      values
    )
    if (!rowCount) return res.status(404).json({ error: 'Appointment not found' })
    res.json({ message: 'Appointment updated' })
  } catch (err) {
    console.error('updateAppointment:', err)
    res.status(500).json({ error: 'Failed to update appointment' })
  }
}

// ── DELETE /api/appointments/:id (soft delete = cancel) ───────────────────────
export async function cancelAppointment(req, res) {
  try {
    const { rowCount } = await pool.query(
      `UPDATE appointments SET status = 'cancelled' WHERE id = $1`,
      [req.params.id]
    )
    if (!rowCount) return res.status(404).json({ error: 'Appointment not found' })
    res.json({ message: 'Appointment cancelled' })
  } catch (err) {
    console.error('cancelAppointment:', err)
    res.status(500).json({ error: 'Failed to cancel appointment' })
  }
}
