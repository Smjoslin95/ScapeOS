import pool from '../db/pool.js'

// ── STAFF ─────────────────────────────────────────────────────────────────────

export async function listStaff(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, role, email, phone, active
       FROM staff WHERE active = true ORDER BY name ASC`
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch staff' })
  }
}

export async function createStaff(req, res) {
  const { name, role, email, phone } = req.body
  if (!name || !role) return res.status(400).json({ error: 'name and role required' })
  try {
    const { rows } = await pool.query(
      `INSERT INTO staff (name, role, email, phone) VALUES ($1,$2,$3,$4) RETURNING id`,
      [name, role, email || null, phone || null]
    )
    res.status(201).json({ id: rows[0].id })
  } catch (err) {
    res.status(500).json({ error: 'Failed to create staff member' })
  }
}

export async function updateStaff(req, res) {
  const allowed = ['name', 'role', 'email', 'phone', 'active']
  const updates = Object.entries(req.body).filter(([k]) => allowed.includes(k))
  if (!updates.length) return res.status(400).json({ error: 'No valid fields' })

  const set    = updates.map(([k], i) => `${k} = $${i + 2}`).join(', ')
  const values = [req.params.id, ...updates.map(([, v]) => v)]
  try {
    const { rowCount } = await pool.query(
      `UPDATE staff SET ${set} WHERE id = $1`, values
    )
    if (!rowCount) return res.status(404).json({ error: 'Staff not found' })
    res.json({ message: 'Staff updated' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update staff' })
  }
}

// ── SERVICES ──────────────────────────────────────────────────────────────────

export async function listServices(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, duration, price, active
       FROM services WHERE active = true ORDER BY name ASC`
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch services' })
  }
}

export async function createService(req, res) {
  const { name, duration, price } = req.body
  if (!name || !duration || !price) {
    return res.status(400).json({ error: 'name, duration, and price required' })
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO services (name, duration, price) VALUES ($1,$2,$3) RETURNING id`,
      [name, duration, price]
    )
    res.status(201).json({ id: rows[0].id })
  } catch (err) {
    res.status(500).json({ error: 'Failed to create service' })
  }
}
