/**
 * migrate.js
 * Run with:  npm run migrate
 *
 * Creates all Scape OS tables if they don't already exist.
 * Safe to re-run (uses CREATE TABLE IF NOT EXISTS).
 */

import pool from './pool.js'

const SQL = `

-- ── STAFF ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS staff (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  role       VARCHAR(100) NOT NULL,
  email      VARCHAR(255) UNIQUE,
  phone      VARCHAR(30),
  active     BOOLEAN     NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── SERVICES ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(150) NOT NULL UNIQUE,
  duration    INT          NOT NULL,   -- minutes
  price       NUMERIC(8,2) NOT NULL,
  active      BOOLEAN      NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── CLIENTS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
  id         SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name  VARCHAR(100) NOT NULL,
  email      VARCHAR(255),
  phone      VARCHAR(30),
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── APPOINTMENTS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
  id           SERIAL PRIMARY KEY,
  client_id    INT          NOT NULL REFERENCES clients(id)  ON DELETE CASCADE,
  service_id   INT          NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  staff_id     INT          NOT NULL REFERENCES staff(id)    ON DELETE RESTRICT,
  appt_date    DATE         NOT NULL,
  appt_time    TIME         NOT NULL,
  duration_min INT          NOT NULL,
  status       VARCHAR(20)  NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending','confirmed','cancelled','completed')),
  notes        TEXT,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on appointments
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS appointments_updated_at ON appointments;
CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── SHIFTS ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shifts (
  id         SERIAL PRIMARY KEY,
  staff_id   INT          NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  shift_date DATE         NOT NULL,
  start_time TIME         NOT NULL,
  end_time   TIME         NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (staff_id, shift_date)   -- one shift per staff per day
);

-- ── INVENTORY ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inventory (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(150) NOT NULL UNIQUE,
  category      VARCHAR(100) NOT NULL,
  stock         INT          NOT NULL DEFAULT 0 CHECK (stock >= 0),
  unit          VARCHAR(50)  NOT NULL,
  reorder_level INT          NOT NULL DEFAULT 5,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS inventory_updated_at ON inventory;
CREATE TRIGGER inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── FEEDBACK ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS feedback (
  id             SERIAL PRIMARY KEY,
  appointment_id INT         REFERENCES appointments(id) ON DELETE SET NULL,
  client_id      INT         REFERENCES clients(id)      ON DELETE SET NULL,
  staff_id       INT         REFERENCES staff(id)        ON DELETE SET NULL,
  rating         SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment        TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── USERS (Firebase Auth mirror) ─────────────────────────────────────────────
-- Maps Firebase UIDs to internal roles.
CREATE TABLE IF NOT EXISTS users (
  id           SERIAL PRIMARY KEY,
  firebase_uid VARCHAR(128) NOT NULL UNIQUE,
  email        VARCHAR(255) NOT NULL,
  role         VARCHAR(20)  NOT NULL DEFAULT 'staff'
                            CHECK (role IN ('admin','staff')),
  staff_id     INT          REFERENCES staff(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

`

async function migrate() {
  const client = await pool.connect()
  try {
    console.log('▶  Running migrations...')
    await client.query(SQL)
    console.log('✓  All tables created / verified.')
  } catch (err) {
    console.error('✗  Migration failed:', err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

migrate()
