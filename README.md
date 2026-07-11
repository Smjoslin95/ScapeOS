# ScapeOS

**Modern operations software for resource-intensive facilities — scheduling, coordination, and management in one platform.**

Built solo by [Sam Joslin](https://smjoslin95.github.io) · [samuncached.dev](https://samuncached.dev)

---

![Dashboard](screenshots/dashboard.png)

![Scheduling View](screenshots/scheduling.png)

---

## What It Does

ScapeOS is a full-stack SaaS platform for businesses that juggle shared resources, staff schedules, and client bookings. Born from 9+ years of hands-on operations management in Maui's hospitality industry, it solves coordination problems the way an operator would — because it was built by one.

**Core capabilities:**

- **Resource scheduling** — book and manage shared rooms, equipment, and assets without conflicts
- **Staff coordination** — shift scheduling and availability management across teams
- **Operational dashboard** — a single real-time picture of the day's operations
- **Client management** — bookings, history, and communication in one place

## Repository Structure

```
ScapeOS/
├── client/          # React frontend
└── scape-os-api/    # Node.js + Express REST API
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React |
| Backend API | Node.js + Express |
| Database | PostgreSQL |
| Auth / Services | Firebase |
| Cloud | AWS-ready architecture |

## Getting Started

**Backend:**

```bash
cd scape-os-api
npm install
cp .env.example .env   # set DATABASE_URL and Firebase credentials
npm run dev
```

**Frontend** (in a second terminal):

```bash
cd client
npm install
npm start
```

The app runs at `http://localhost:3000` and expects the API to be running locally.

## Roadmap

- **GroundScape** — adapting the ScapeOS platform for ground-based space infrastructure: coordinating shared sensor and telescope scheduling, maintenance tracking, and multi-site crew operations for observatories and ground stations. *Currently in customer discovery.*
- Reporting and analytics module
- Mobile-responsive refinements

## About the Builder

I'm a Maui-based software developer with 9+ years of operations management experience, two AWS certifications (Cloud Practitioner, AI Practitioner — Solutions Architect in progress), and a B.S. in Computer Science completing December 2026. ScapeOS is designed, built, and maintained solo.

📫 [Portfolio](https://smjoslin95.github.io) · [samuncached.dev](https://samuncached.dev)

## License

MIT
