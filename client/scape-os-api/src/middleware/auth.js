/**
 * auth.js  —  Firebase Admin SDK middleware
 *
 * Every protected route calls:
 *   router.use(requireAuth)            — any logged-in user
 *   router.use(requireRole('admin'))   — admin only
 *
 * Setup:
 *   1. Firebase Console → Project Settings → Service Accounts → Generate new private key
 *   2. Copy the downloaded JSON
 *   3. In Railway: set FIREBASE_SERVICE_ACCOUNT_JSON to the entire JSON string (one line)
 */

import admin from 'firebase-admin'
import dotenv from 'dotenv'

dotenv.config()

// ── Initialise once ──────────────────────────────────────────────────────────
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
}

// ── Middleware: require a valid Firebase ID token ────────────────────────────
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' })
  }

  const token = header.split('Bearer ')[1]
  try {
    const decoded = await admin.auth().verifyIdToken(token)
    req.user = decoded   // uid, email, role (custom claim), etc.
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

// ── Middleware: require a specific role (custom claim) ───────────────────────
export function requireRole(role) {
  return (req, res, next) => {
    if (req.user?.role !== role) {
      return res.status(403).json({ error: `Requires role: ${role}` })
    }
    next()
  }
}

// ── Helper: set a custom role claim on a user ─────────────────────────────────
// Call this after creating a new user in your admin panel:
//   await setUserRole(uid, 'admin')
export async function setUserRole(uid, role) {
  await admin.auth().setCustomUserClaims(uid, { role })
}
