# Scape OS — API

Express + PostgreSQL backend for the Scape OS hospitality operations platform.  
Deployed on Railway. Protected with Firebase Auth.

## Stack

| Layer    | Tech                          |
|----------|-------------------------------|
| Runtime  | Node.js 18+                   |
| Framework| Express 4                     |
| Database | PostgreSQL (Railway managed)  |
| Auth     | Firebase Admin SDK            |

---

## Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your .env
cp .env.example .env
# Fill in DATABASE_URL and FIREBASE_SERVICE_ACCOUNT_JSON

# 3. Run migrations (creates all tables)
npm run migrate

# 4. Seed starter data
npm run seed

# 5. Start dev server (with hot reload)
npm run dev
```

---

## API Reference

All routes require a Firebase ID token in the `Authorization` header:
```
Authorization: Bearer <firebase_id_token>
```

Routes marked `[admin]` also require the `admin` custom claim.

### Appointments
| Method | Path | Description |
|--------|------|-------------|
| GET    | `/api/appointments?date=YYYY-MM-DD` | List appointments for a date |
| GET    | `/api/appointments/:id`             | Get single appointment |
| POST   | `/api/appointments`                 | Create appointment |
| PATCH  | `/api/appointments/:id`             | Update appointment |
| DELETE | `/api/appointments/:id` [admin]     | Cancel appointment |

**POST body:**
```json
{
  "first_name": "Maya",
  "last_name": "Rivera",
  "email": "maya@example.com",
  "phone": "808-555-0001",
  "service_id": 1,
  "staff_id": 2,
  "appt_date": "2025-04-12",
  "appt_time": "09:00",
  "status": "pending",
  "notes": "Prefers light pressure"
}
```

### Shifts
| Method | Path | Description |
|--------|------|-------------|
| GET    | `/api/shifts?week=YYYY-MM-DD` | Week of shifts |
| POST   | `/api/shifts` [admin]         | Create/upsert shift |
| DELETE | `/api/shifts/:id` [admin]     | Delete shift |

### Inventory
| Method | Path | Description |
|--------|------|-------------|
| GET    | `/api/inventory`        | All items with status |
| POST   | `/api/inventory` [admin]| Add item |
| PATCH  | `/api/inventory/:id` [admin] | Update item |
| DELETE | `/api/inventory/:id` [admin] | Delete item |

### Feedback
| Method | Path | Description |
|--------|------|-------------|
| GET    | `/api/feedback?staff_id=&limit=` | List reviews |
| GET    | `/api/feedback/stats`            | Aggregate stats by staff |
| POST   | `/api/feedback`                  | Submit review |

### Staff & Services
| Method | Path | Description |
|--------|------|-------------|
| GET    | `/api/staff`         | All active staff |
| POST   | `/api/staff` [admin] | Add staff member |
| PATCH  | `/api/staff/:id` [admin] | Update staff |
| GET    | `/api/services`      | All active services |
| POST   | `/api/services` [admin] | Add service |

---

## Deploy to Railway

1. Create a new Railway project
2. Add a **PostgreSQL** plugin — Railway auto-sets `DATABASE_URL`
3. Connect your GitHub repo
4. Set environment variables in Railway dashboard:
   - `NODE_ENV=production`
   - `CLIENT_ORIGIN=https://your-vercel-app.vercel.app`
   - `FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}`
5. Railway auto-detects `npm start` from `package.json`
6. After first deploy, run migrations via Railway shell:
   ```bash
   npm run migrate
   npm run seed
   ```

---

## Firebase Auth Setup

1. Firebase Console → Project Settings → Service Accounts
2. Click **Generate new private key** → download JSON
3. Paste the entire JSON as `FIREBASE_SERVICE_ACCOUNT_JSON` in Railway
4. To give a user the `admin` role after they sign up:
   ```js
   import { setUserRole } from './src/middleware/auth.js'
   await setUserRole('firebase-uid-here', 'admin')
   ```

---

## Project Structure

```
scape-os-api/
├── src/
│   ├── controllers/
│   │   ├── appointments.js
│   │   ├── shifts.js
│   │   ├── inventory.js
│   │   ├── feedback.js
│   │   └── staff.js
│   ├── db/
│   │   ├── pool.js        PostgreSQL connection pool
│   │   ├── migrate.js     Table creation script
│   │   └── seed.js        Starter data
│   ├── middleware/
│   │   └── auth.js        Firebase token verification
│   ├── routes/
│   │   ├── appointments.js
│   │   ├── shifts.js
│   │   ├── inventory.js
│   │   ├── feedback.js
│   │   └── staff.js
│   └── server.js
├── .env.example
├── .gitignore
└── package.json
```

## Author

Sam Joslin — [smjoslin95.github.io](https://smjoslin95.github.io)
