# Architecture — C4 Model

## Level 1 · System Context

```mermaid
graph TB
    User([👤 User])
    System[FullStack Demo<br/>Customer Registry]
    Cloud[(Neon Postgres<br/>managed cloud DB)]

    User -->|Browser| System
    System -->|SQL via pg driver| Cloud
```

## Level 2 · Container Diagram

```mermaid
graph TB
    User([👤 Browser])

    subgraph System [FullStack Demo]
        FE["Angular 17 SPA<br/>(TypeScript / HTML)<br/>:4200 dev · static in prod"]
        BE["Node.js API<br/>(Express + Apollo Server + helmet)<br/>:4000"]
        PG[("PostgreSQL 16<br/>customers · orders · audit_log<br/>:5432")]
    end

    User -->|HTTP| FE
    FE -->|REST GET/POST/DELETE /api/customers| BE
    FE -->|GraphQL POST /graphql| BE
    BE -->|SQL via pg driver| PG
```

## Level 3 · Component Diagram (Backend)

```mermaid
graph TB
    subgraph Backend [Node.js API — src/]
        IDX[index.ts<br/>bootstrap + createApp]
        ER[routes/customers.ts<br/>Express Router + validation]
        GQL[graphql/schema + resolvers<br/>Apollo Server]
        CS[services/customerService.ts<br/>business logic]
        AS[services/auditService.ts<br/>audit_log inserts + queries]
        DB[config/database.ts<br/>pg Pool · env-driven SSL]
    end

    IDX --> ER
    IDX --> GQL
    ER --> CS
    ER --> AS
    GQL --> CS
    GQL --> AS
    CS --> DB
    AS --> DB
```

## Deployment Topology

```mermaid
graph LR
    User([👤 User])
    subgraph Render
        FEStatic[fullstack-demo-frontend<br/>static site]
        BERender[fullstack-demo-backend<br/>web service]
    end
    Neon[(Neon Postgres<br/>managed)]
    GH[GitHub<br/>master branch]
    Actions[GitHub Actions CI<br/>lint · build · jest · karma · playwright]

    User --> FEStatic
    FEStatic -->|REST + GraphQL| BERender
    BERender -->|SSL pg connection| Neon
    GH --> Actions
    GH -.->|auto-deploy on push| FEStatic
    GH -.->|auto-deploy on push| BERender
```

## Tech Stack Map

| Topic | Technology | File(s) |
|-------|-----------|---------|
| SDLC | Git + PRs + GitHub Actions | `.github/workflows/ci.yml` |
| Eng. Standards | ESLint + Prettier | `.eslintrc.json`, `.prettierrc` |
| Architecture | Separation of concerns | `routes/`, `services/`, `config/` |
| C4 Modeling | Mermaid diagrams | `docs/architecture.md` |
| DevOps | GitHub Actions + Docker + Render Blueprint | `ci.yml`, `Dockerfile`, `docker-compose.yml`, `render.yaml` |
| JavaScript | Foundation of TS/Node | all `.ts` files compile to JS |
| TypeScript | Strict types throughout | `tsconfig.json`, interfaces, typed params |
| Node.js | Server runtime | `backend/src/index.ts` |
| Angular | Frontend SPA | `frontend/src/app/` |
| Full-Stack | All tiers connected | whole project |
| REST | CRUD API | `backend/src/routes/customers.ts` |
| GraphQL | Flexible query API | `backend/src/graphql/` |
| PostgreSQL | Relational data + audit log | `pgPool` in `database.ts`, `auditService.ts` |
| Unit testing | Jest (backend) + Karma/Jasmine (frontend) | `*.test.ts`, `*.spec.ts` |
| E2E testing | Playwright | `e2e/tests/` |
| Cloud hosting | Render (apps) + Neon (DB) | `render.yaml` |
| Security | helmet, CORS allowlist, parameterized SQL | `backend/src/index.ts`, `routes/customers.ts` |
