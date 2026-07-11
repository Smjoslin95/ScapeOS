import pool from '../db/pool.js'

// ── GET /api/inventory ────────────────────────────────────────────────────────
export async function listInventory(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT
         id, name, category, stock, unit, reorder_level,
         CASE
           WHEN stock = 0             THEN 'critical'
           WHEN stock <= reorder_level THEN 'low'
           ELSE 'ok'
         END AS status,
         updated_at
       FROM inventory
       ORDER BY category ASC, name ASC`
    )
    res.json(rows)
  } catch (err) {
    console.error('listInventory:', err)
    res.status(500).json({ error: 'Failed to fetch inventory' })
  }
}

// ── POST /api/inventory ───────────────────────────────────────────────────────
export async function createInventoryItem(req, res) {
  const { name, category, stock = 0, unit, reorder_level = 5 } = req.body
  if (!name || !category || !unit) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO inventory (name, category, stock, unit, reorder_level)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [name, category, stock, unit, reorder_level]
    )
    res.status(201).json({ id: rows[0].id, message: 'Item created' })
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Item with this name already exists' })
    }
    console.error('createInventoryItem:', err)
    res.status(500).json({ error: 'Failed to create item' })
  }
}

// ── PATCH /api/inventory/:id ──────────────────────────────────────────────────
export async function updateInventoryItem(req, res) {
  const allowed = ['name', 'category', 'stock', 'unit', 'reorder_level']
  const updates = Object.entries(req.body).filter(([k]) => allowed.includes(k))
  if (!updates.length) {
    return res.status(400).json({ error: 'No valid fields to update' })
  }

  const setClauses = updates.map(([k], i) => `${k} = $${i + 2}`).join(', ')
  const values     = [req.params.id, ...updates.map(([, v]) => v)]

  try {
    const { rowCount } = await pool.query(
      `UPDATE inventory SET ${setClauses} WHERE id = $1`,
      values
    )
    if (!rowCount) return res.status(404).json({ error: 'Item not found' })
    res.json({ message: 'Item updated' })
  } catch (err) {
    console.error('updateInventoryItem:', err)
    res.status(500).json({ error: 'Failed to update item' })
  }
}

// ── DELETE /api/inventory/:id ─────────────────────────────────────────────────
export async function deleteInventoryItem(req, res) {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM inventory WHERE id = $1',
      [req.params.id]
    )
    if (!rowCount) return res.status(404).json({ error: 'Item not found' })
    res.json({ message: 'Item deleted' })
  } catch (err) {
    console.error('deleteInventoryItem:', err)
    res.status(500).json({ error: 'Failed to delete item' })
  }
}
