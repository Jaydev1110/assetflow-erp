# AssetFlow — Backend Implementation Plan

**Stack:** Node.js + Express + TypeScript
**Storage:** In-memory data store (seeded on server start), optional JSON-file persistence — no database for now
**Goal:** Give the existing React/TS frontend (already built via Stitch + AI Studio) a real API that enforces business rules server-side, not just in the UI.

---

## 1. Why a backend even without a DB

Right now all business rules (double-allocation block, booking overlap, status transitions) live only inside React state. That's fine for a UI mockup, but a hackathon judge testing edge cases live will break it. A backend — even with in-memory storage — lets us:

- Enforce rules server-side (source of truth, not just a red banner in the UI)
- Persist state across page refreshes during the demo (via JSON snapshot)
- Prove "real ERP architecture" instead of a static prototype

Data can be migrated to Postgres/Mongo later in ~30 min if time allows, since the shapes below are already DB-ready.

---

## 2. Data Models (reuse from frontend `types.ts`)

Reuse these types as-is on the backend (share the file or duplicate it):

- `Asset` — tag, name, category, status, location, serialNumber, acquisitionDate, acquisitionCost, condition, isShared, isBookable, owner, department
- `Department` — id, name, head, parentDept, assetsCount, status
- `Booking` — id, title, timeFrom, timeTo, date, teamName, isConflict, isLocked
- `MaintenanceTicket` — id, assetTag, title, description, status, technicianName, eta, priority
- `NotificationLog` — id, type, title, description, isRead, timeAgo, category

Add two new backend-only types:
- `Allocation` — id, assetTag, employeeName, department, allocatedDate, expectedReturnDate, status (Active/Returned)
- `TransferRequest` — id, assetTag, fromEmployee, toEmployee, reason, status (Requested/Approved/Rejected), requestedDate

---

## 3. API Endpoints

```
AUTH
POST   /api/auth/login              → mock auth, returns user + role (no real password check needed)
POST   /api/auth/signup             → creates Employee-only account (no role selection)

DEPARTMENTS
GET    /api/departments
POST   /api/departments
PATCH  /api/departments/:id

CATEGORIES
GET    /api/categories
POST   /api/categories

EMPLOYEES
GET    /api/employees
PATCH  /api/employees/:id/role      → Admin-only: promote to Dept Head / Asset Manager

ASSETS
GET    /api/assets                  → supports query filters: category, status, department
POST   /api/assets                  → register new asset (auto-generate Asset Tag e.g. AF-0001)
PATCH  /api/assets/:tag             → update status/location/condition

ALLOCATION & TRANSFER
GET    /api/allocations
POST   /api/allocations             → allocate asset to employee/dept
                                        ⚠️ MUST check asset.status === 'Available'
                                        → if already allocated, reject with 409 + current holder info
POST   /api/transfers               → create transfer request (Requested)
PATCH  /api/transfers/:id/approve   → Approved → re-allocate → update allocation history
POST   /api/allocations/:id/return  → mark returned, capture condition notes, asset → Available

RESOURCE BOOKING
GET    /api/bookings?resource=&date=
POST   /api/bookings                → ⚠️ MUST run server-side overlap check against existing bookings
                                        for same resource/date — reject with 409 if conflict
PATCH  /api/bookings/:id/cancel

MAINTENANCE
GET    /api/maintenance
POST   /api/maintenance             → raise request (Pending)
PATCH  /api/maintenance/:id/status  → Pending→Approved→Technician Assigned→In Progress→Resolved
                                        ⚠️ Approving → asset.status = 'Under Maintenance'
                                        ⚠️ Resolving → asset.status = 'Available'

AUDIT
GET    /api/audits
POST   /api/audits                  → create audit cycle (scope, date range, auditors)
PATCH  /api/audits/:id/verify       → mark asset Verified/Missing/Damaged
PATCH  /api/audits/:id/close        → locks cycle, auto-generates discrepancy report,
                                        updates asset status (e.g. Missing → Lost)

NOTIFICATIONS
GET    /api/notifications
PATCH  /api/notifications/:id/read
PATCH  /api/notifications/read-all

REPORTS
GET    /api/reports/utilization     → by department
GET    /api/reports/cost-pools      → by category
GET    /api/reports/idle-assets
GET    /api/reports/maintenance-due
```

**Rule of thumb:** every endpoint that mutates state should also push a `NotificationLog` entry — this gives the Notifications screen real data for free and creates an audit trail.

---

## 4. Build Priority Order

1. **Scaffold** — Express + TypeScript project, seed in-memory store with the same mock data already in the frontend's `seedData.ts`. Get all `GET` endpoints live first so the frontend can fetch instead of reading localStorage.
2. **The two "smart" endpoints (highest demo value):**
   - `POST /api/allocations` — double-allocation block
   - `POST /api/bookings` — time-slot overlap validation
3. **Replace frontend localStorage calls with real `fetch()` calls** to the new API — should be a fairly quick refactor since data shapes already match `types.ts`.
4. **Maintenance status-sync** — approving/resolving a ticket must flip the linked asset's status server-side.
5. **If time remains:** Audit close-cycle logic, Reports aggregation computed server-side instead of in React.

**Explicitly skip for now** (not worth the time in an 8-hour build): real JWT auth, role-based middleware enforcement, file uploads for photos/proof docs. Fake these client-side — visually present, not deeply wired.

---

## 5. Demo-Day Safety Nets (cheap, high impact)

- **"Reset Demo Data" button/endpoint** (`POST /api/admin/reset`) — restores seed data instantly if something breaks live in front of judges.
- **Seed data with a built-in conflict** — pre-load one asset that's already allocated, and one resource booking that's already active, so you can demo the block/conflict rules immediately without manual setup during the pitch.
- **JSON file snapshot on each mutation** — cheap insurance so a server restart mid-demo doesn't wipe your state.

---

## 6. Repo & Folder Structure

The repo is split into two sibling folders at the root — this keeps the frontend and backend fully independent (separate `package.json`, separate `node_modules`, separate dev servers), which is the simplest setup for a hackathon with no monorepo tooling.

```
assetflow-erp/                          (repo root)
├── frontend/                           (existing AI-Studio-generated React app — already built)
│   ├── src/
│   │   ├── data/seedData.ts
│   │   ├── types.ts
│   │   └── ...
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                            (new — everything below is scaffolded here)
│   ├── src/
│   │   ├── data/
│   │   │   └── seedData.ts             (mirrors frontend/src/data/seedData.ts)
│   │   ├── models/
│   │   │   └── types.ts                (same shapes as frontend/src/types.ts)
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── departments.routes.ts
│   │   │   ├── assets.routes.ts
│   │   │   ├── allocations.routes.ts
│   │   │   ├── bookings.routes.ts
│   │   │   ├── maintenance.routes.ts
│   │   │   ├── audits.routes.ts
│   │   │   ├── notifications.routes.ts
│   │   │   └── reports.routes.ts
│   │   ├── services/                   (business rule logic, kept separate from routes)
│   │   │   ├── allocation.service.ts   (conflict-check logic)
│   │   │   └── booking.service.ts      (overlap-check logic)
│   │   ├── store.ts                    (in-memory data store, single source of truth)
│   │   └── index.ts                    (Express app entry point, port 5000)
│   ├── package.json
│   └── tsconfig.json
│
├── AssetFlow_Backend_Plan.md           (this file — repo root, not inside either folder)
└── README.md
```

Frontend stays untouched while the backend is being scaffolded. Wiring the frontend to the new API (replacing localStorage calls with `fetch()`) is a separate follow-up step, not part of the initial backend build.
