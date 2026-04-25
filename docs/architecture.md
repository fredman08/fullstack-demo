# Architecture — C4 Model

## Level 1 · System Context

```mermaid
graph TB
    User([👤 User])
    System[FullStack Demo\nCustomer Registry]
    AWS[(AWS Cloud)]

    User -->|Browser| System
    System -->|DynamoDB SDK| AWS
```

## Level 2 · Container Diagram

```mermaid
graph TB
    User([👤 Browser])

    subgraph System [FullStack Demo]
        FE["Angular 17 SPA\n(TypeScript / HTML)\n:4200"]
        BE["Node.js API\n(Express + Apollo Server)\n:4000"]
        PG[("PostgreSQL 16\ncustomers · orders\n:5432")]
        DY[("DynamoDB Local\ncustomer_audit\n:8000")]
    end

    User -->|HTTP| FE
    FE -->|REST  GET/POST/DELETE /api/customers| BE
    FE -->|GraphQL POST /graphql| BE
    BE -->|SQL via pg driver| PG
    BE -->|PutItem · Query via AWS SDK v3| DY
```

## Level 3 · Component Diagram (Backend)

```mermaid
graph TB
    subgraph Backend [Node.js API — src/]
        IDX[index.ts\nbootstrap]
        ER[routes/customers.ts\nExpress Router]
        GQL[graphql/schema + resolvers\nApollo Server]
        CS[services/customerService.ts\nbusiness logic]
        AS[services/auditService.ts\nDynamoDB ops]
        DB[config/database.ts\nPool + DynamoDBDocumentClient]
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

## Tech Stack Map

| Topic | Technology | File(s) |
|-------|-----------|---------|
| SDLC | Git + PRs | `.github/` |
| Eng. Standards | ESLint + Prettier | `.eslintrc.json`, `.prettierrc` |
| Architecture | Separation of concerns | `routes/`, `services/`, `config/` |
| C4 Modeling | Mermaid diagrams | `docs/architecture.md` |
| DevOps | GitHub Actions + Docker | `ci.yml`, `Dockerfile`, `docker-compose.yml` |
| JavaScript | Foundation of TS/Node | all `.ts` files compile to JS |
| TypeScript | Strict types throughout | `tsconfig.json`, interfaces, typed params |
| Node.js | Server runtime | `backend/src/index.ts` |
| Angular | Frontend SPA | `frontend/src/app/` |
| Full-Stack | All tiers connected | whole project |
| REST | CRUD API | `backend/src/routes/customers.ts` |
| GraphQL | Flexible query API | `backend/src/graphql/` |
| PostgreSQL | Relational data | `pgPool` in `database.ts` |
| DynamoDB | NoSQL audit log | `auditService.ts` |
| AWS | Cloud target | Docker → deployable to ECS/Lambda |
