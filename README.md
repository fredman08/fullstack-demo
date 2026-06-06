# Fullstack Demo — Customer Registry

A teaching-grade full-stack reference app: **Angular 17 SPA** ↔ **Node.js (Express + Apollo GraphQL)** ↔ **PostgreSQL**. Deployable to **Render** with a managed Postgres on **Neon**, fully tested (Jest + Karma + Playwright), and CI-gated via GitHub Actions.

[![CI](https://github.com/YOUR_GITHUB_USER/fullstack-demo/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/YOUR_GITHUB_USER/fullstack-demo/actions/workflows/ci.yml)

| | URL |
|---|---|
| **Frontend (live)** | https://fullstack-demo-frontend-bzzn.onrender.com |
| **Backend health** | https://fullstack-demo-backend-8ti1.onrender.com/api/health |
| **Backend GraphQL** | https://fullstack-demo-backend-8ti1.onrender.com/graphql |
| **Repo** | https://github.com/YOUR_GITHUB_USER/fullstack-demo |

> ⚠️ **Render free-tier cold start.** The backend sleeps after ~15 minutes of inactivity. The first request after a sleep can take **30–60 seconds** to wake the service. Subsequent requests are snappy.

---

## Architecture

See [docs/architecture.md](docs/architecture.md) for full C4 diagrams. High-level:

```
Browser ──▶ Angular SPA (Render static)
              │
              ▼
       Node API (Render web service)
        ├── REST   /api/customers
        └── GraphQL /graphql
              │
              ▼
       PostgreSQL (Neon, SSL)
        ├── customers
        ├── orders
        └── audit_log
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 17 (standalone components), TypeScript 5.4, RxJS |
| Backend | Node 20, Express 4, Apollo Server 4, helmet, `pg` |
| Database | PostgreSQL 16 (Neon in prod, Docker locally) |
| API styles | REST (CRUD) and GraphQL (read-heavy + mutations) |
| Testing | Jest + supertest (backend), Karma + Jasmine (frontend), Playwright (e2e) |
| CI | GitHub Actions: lint → build → unit tests → docker-compose → Playwright |
| Hosting | Render (apps), Neon (Postgres) |
| Containers | Docker + docker-compose for local development |

---

## Live Demo

Open https://fullstack-demo-frontend-bzzn.onrender.com — wait up to a minute for the backend to wake on the first request, then create a customer, view their detail page (orders + audit log), and delete them.

---

## Local Development

### Prerequisites
- Node.js 20+
- Docker Desktop (for Postgres + the full stack)
- Git

### One-shot: full stack via Docker

```sh
git clone https://github.com/YOUR_GITHUB_USER/fullstack-demo.git
cd fullstack-demo
cp .env.example .env       # local defaults are fine
docker compose up --build  # spins up postgres + backend + frontend
```

Then visit:
- Frontend: http://localhost
- Backend health: http://localhost:4000/api/health
- GraphQL sandbox: http://localhost:4000/graphql

### Without Docker — apps separately

Terminal 1 — Postgres only:
```sh
docker compose up -d postgres
```

Terminal 2 — Backend in watch mode:
```sh
cd backend
npm install
cp ../.env.example .env
npm run dev
```

Terminal 3 — Frontend dev server:
```sh
cd frontend
npm install
npm start              # http://localhost:4200
```

---

## Running Tests

### Backend unit + integration (Jest + supertest)
Tests use a real Postgres. The simplest path is to start the docker container first.

```sh
docker compose up -d postgres
cd backend
npm test                    # runs once
npm run test:watch          # watch mode
npm run test:ci             # CI mode (coverage, no watch)
```

### Frontend unit (Karma + Jasmine)
Headless Chrome required (installed by Karma when you have Chrome on your system).

```sh
cd frontend
npm test                    # ChromeHeadless, single run
npm run test:ci             # CI mode with coverage
```

### End-to-end (Playwright)
The e2e suite drives a real browser against the running stack. Start the stack first.

```sh
docker compose up -d --build --wait
cd e2e
npm install
npx playwright install --with-deps chromium
npx playwright test         # runs the suite
npx playwright show-report  # open the HTML report after a run
```

---

## Project Structure

```
fullstack-demo/
├── backend/                       Node.js Express + Apollo
│   ├── src/
│   │   ├── index.ts               createApp + bootstrap, helmet, CORS, error mw
│   │   ├── config/database.ts     pg Pool (DATABASE_URL or discrete vars), schema init
│   │   ├── routes/customers.ts    REST CRUD + inline validation
│   │   ├── graphql/               typeDefs + resolvers
│   │   ├── services/              customerService, auditService (Postgres audit_log)
│   │   ├── models/                shared TS interfaces
│   │   └── test/setupEnv.ts       jest env defaults
│   ├── jest.config.js
│   └── Dockerfile
├── frontend/                      Angular 17 SPA
│   ├── src/
│   │   ├── app/                   standalone components, service, models, specs
│   │   ├── environments/          dev + prod (fileReplacements at build)
│   │   ├── index.html · main.ts · styles.css
│   │   └── public/                static assets bundled with build
│   ├── angular.json · karma.conf.js · tsconfig*.json
│   └── Dockerfile · nginx.conf
├── e2e/                           Playwright suite
│   ├── tests/customer-flow.spec.ts
│   └── playwright.config.ts
├── docs/architecture.md           C4 diagrams + tech stack map
├── .github/workflows/ci.yml       CI: backend · frontend · e2e jobs
├── docker-compose.yml             Postgres + backend + frontend (with healthchecks)
├── render.yaml                    Render Blueprint (backend web service + frontend static)
└── .env.example                   Template env vars
```

---

## API Reference

### REST — `/api/customers`

| Method | Path | Description | Success |
|---|---|---|---|
| GET | `/api/health` | Health check | 200 `{ status: 'ok', timestamp }` |
| GET | `/api/customers` | List all customers | 200 `Customer[]` |
| GET | `/api/customers/:id` | Single customer | 200 `Customer` / 404 |
| POST | `/api/customers` | Create | 201 `Customer` / 400 (validation) |
| DELETE | `/api/customers/:id` | Delete | 204 / 404 |

POST body: `{ "name": "Juan dela Cruz", "email": "juan@example.com" }`. Server-side validation: non-empty trimmed name ≤ 100 chars; email must match `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`.

### GraphQL — `/graphql`

```graphql
type Customer { id: ID! name: String! email: String! created_at: String! orders: [Order!]! }
type Order    { id: ID! product: String! total: Float! status: String! created_at: String! }
type AuditEntry { action: String! timestamp: String! }

type Query {
  customers: [Customer!]!
  customer(id: ID!): Customer
  auditLog(customerId: ID!): [AuditEntry!]!
}

type Mutation {
  createCustomer(name: String!, email: String!): Customer!
  deleteCustomer(id: ID!): Boolean!
}
```

Sample query (paste into the Apollo sandbox at `/graphql`):

```graphql
query Detail($id: ID!) {
  customer(id: $id) {
    id name email
    orders { product total status }
  }
  auditLog(customerId: $id) { action timestamp }
}
```

---

## Deployment

This repo ships with a [`render.yaml`](render.yaml) Render Blueprint — one click deploys both services.

### One-time setup

1. **Create a Neon Postgres project** at https://neon.tech, then copy the **pooled connection string** (sslmode=require).
2. In **Render** → New → Blueprint → connect this GitHub repo.  Render reads `render.yaml` and proposes two services: `fullstack-demo-backend` (web service) and `fullstack-demo-frontend` (static).
3. Before the first deploy, set the backend's `DATABASE_URL` env var to your Neon string. `ALLOWED_ORIGINS` is pre-filled in `render.yaml` to the frontend's public URL.
4. Click **Apply**. Wait for both services green.

The frontend's `environment.prod.ts` is **pre-baked** to point at `https://fullstack-demo-backend-8ti1.onrender.com`, matching the service name in `render.yaml`. If you rename either service, update `environment.prod.ts` and `ALLOWED_ORIGINS` accordingly.

### Auto-deploy
Every push to `master` re-deploys both services. Render also auto-watches the linked branch.

### Cold-start note
Render's free web-service tier sleeps after 15 minutes of inactivity. The first request after a sleep takes 30–60 s. The frontend (static) is always-on; only the backend cold-starts.

---

## CI/CD

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs three jobs on every push and PR to `master`:

1. **backend** — spins up a Postgres service container, runs `npm ci → lint → build → test:ci` (Jest + supertest).
2. **frontend** — sets up headless Chrome, runs `npm ci → lint → build (prod) → test:ci` (Karma + Jasmine).
3. **e2e** — depends on the above; `docker compose up --wait` brings up the full stack, then Playwright runs the customer-flow suite against `http://localhost`. The HTML report is uploaded as an artifact on every run; backend logs dumped on failure.

---

## Local environment variables

See [`.env.example`](.env.example). Defaults are good for docker-compose. The backend will refuse to start (with a clear message) if neither `DATABASE_URL` nor the discrete `POSTGRES_*` vars are present.

In production, set `DATABASE_URL` (Neon) and `ALLOWED_ORIGINS` (the frontend URL).

---

## Contributing

PRs welcome. Keep the CI green (`npm run lint && npm test` on both apps, plus `npx playwright test` after `docker compose up`).

---

## License

MIT (see [LICENSE](LICENSE) if/when added — currently unlicensed by default).
