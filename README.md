# Hnoss-Atelier-Ecommerce
E-Commerce Semester Project – Hnoss Atelier Online Clothing Store
## Sprint 2 — Catalog Data Foundation

### Local setup

```bash
cd backend
cp .env.example .env                    # fill in real values
npm install
createdb hnoss_atelier
createdb hnoss_atelier_test
npm run migrate
npm run seed
npm start                               # API on http://localhost:4000
```

### Tests

```bash
cd backend
npm test
```

### Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Dev database connection string |
| `TEST_DATABASE_URL` | Test database connection string (wiped each test run) |
| `JWT_SECRET` | HS256 signing key, min 32 chars |
| `PORT` | API port (default 4000) |
| `NODE_ENV` | `development` / `test` / `production` |

**Do not commit `.env`.** Only `.env.example` is tracked.

### Sprint 2 deliverables

- Migrations: `backend/src/db/migrations/`
- Seed: `backend/src/db/seeds/seed.sql`
- Admin routes: `backend/src/routes/admin/`
- Tests: `backend/tests/`
- Design doc: `docs/SPRINT_2.md`