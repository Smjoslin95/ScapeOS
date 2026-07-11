/**
 * seed.js
 * Run with:  npm run seed
 *
 * Inserts starter data — safe to re-run (uses INSERT ... ON CONFLICT DO NOTHING).
 */

import pool from './pool.js'

async function seed() {
  const client = await pool.connect()
  try {
    console.log('▶  Seeding database...')

    // ── STAFF ────────────────────────────────────────────────────────────────
    await client.query(`
      INSERT INTO staff (name, role, email) VALUES
        ('Leilani K.', 'Lead Therapist', 'leilani@scapemaui.com'),
        ('Noelani P.', 'Esthetician',    'noelani@scapemaui.com'),
        ('Kai H.',     'Therapist',      'kai@scapemaui.com'),
        ('Malia T.',   'Front Desk',     'malia@scapemaui.com')
      ON CONFLICT (email) DO NOTHING;
    `)
    console.log('  ✓ staff')

    // ── SERVICES ─────────────────────────────────────────────────────────────
    await client.query(`
      INSERT INTO services (name, duration, price) VALUES
        ('Swedish Massage',      60,  120.00),
        ('Deep Tissue Massage',  60,  135.00),
        ('Hot Stone Massage',    75,  155.00),
        ('Lomi Lomi Massage',    90,  175.00),
        ('Couples Massage',      90,  280.00),
        ('Hot Stone Facial',     75,  145.00),
        ('Volcanic Clay Facial', 60,  130.00),
        ('Body Wrap',            90,  160.00),
        ('Exfoliation Scrub',    60,  110.00)
      ON CONFLICT (name) DO NOTHING;
    `)
    console.log('  ✓ services')

    // ── INVENTORY ────────────────────────────────────────────────────────────
    await client.query(`
      INSERT INTO inventory (name, category, stock, unit, reorder_level) VALUES
        ('Lomi Lomi Oil',       'Oils',         8,  'bottles', 5),
        ('Volcanic Clay Mask',  'Facial',        3,  'jars',    5),
        ('Bamboo Towels (sm)',  'Linens',       42,  'units',  20),
        ('Eucalyptus Mist',     'Aromatherapy',  2,  'bottles', 6),
        ('Exfoliant Scrub',     'Body',         11,  'jars',    8),
        ('Hot Stones Set',      'Equipment',     4,  'sets',    2)
      ON CONFLICT (name) DO NOTHING;
    `)
    console.log('  ✓ inventory')

    // ── SAMPLE CLIENT ────────────────────────────────────────────────────────
    await client.query(`
      INSERT INTO clients (first_name, last_name, email, phone) VALUES
        ('Maya',  'R.', 'maya@example.com',  '808-555-0001'),
        ('Jess',  'T.', 'jess@example.com',  '808-555-0002'),
        ('Sara',  'M.', 'sara@example.com',  '808-555-0003'),
        ('Kim',   'A.', 'kim@example.com',   '808-555-0004'),
        ('Priya', 'S.', 'priya@example.com', '808-555-0005')
      ON CONFLICT DO NOTHING;
    `)
    console.log('  ✓ clients')

    console.log('✓  Seed complete.')
  } catch (err) {
    console.error('✗  Seed failed:', err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

seed()
