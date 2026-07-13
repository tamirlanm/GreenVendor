# GreenVendor

A B2B ESG-scoring platform for suppliers. Companies register, fill out an ESG questionnaire, get scored and graded (A–F), list products, and get discovered by buyers who can filter the catalog by ESG grade.

**Stack:** ASP.NET Core (.NET 10, Clean Architecture) · MS SQL Server · EF Core · FluentValidation · JWT Auth · React + TypeScript · nginx · Docker · GitHub Actions

---

## Table of contents

- [Architecture](#architecture)
- [Repository structure](#repository-structure)
- [Local setup](#local-setup)
- [Environment variables](#environment-variables)
- [API reference](#api-reference)
- [Testing](#testing)
- [CI](#ci)
- [Deploying under a shared domain path](#deploying-under-a-shared-domain-path)
- [Known limitations (MVP)](#known-limitations-mvp)

---

## Architecture

Backend follows Clean Architecture:

- **`GreenVendor.Domain`** — entities and enums, no external dependencies.
- **`GreenVendor.Application`** — business logic (services), DTOs, interfaces, FluentValidation validators. Depends only on `Domain`.
- **`GreenVendor.Infrastructure`** — EF Core `AppDbContext`, migrations. Implements `Application` interfaces.
- **`GreenVendor.Api`** — controllers, JWT middleware, `Program.cs`, Dockerfile.
- **`GreenVendor.Tests`** — xUnit + Moq + EF Core InMemory tests.

Roles: **Supplier** (fills questionnaire, lists products, uploads certificate), **Buyer** (browses catalog, places orders), **Admin** (verifies suppliers, views platform analytics, opens questionnaire access for a supplier).

### High-level flow

`Supplier registration -> Questionnaire submission -> ESG score calculation -> Admin verification -> Product publishing -> Buyer catalog filtering -> Order placement`


---

## Repository structure

```
GreenVendor/
├── backend/
│   ├── GreenVendor.Domain/
│   ├── GreenVendor.Application/
│   ├── GreenVendor.Infrastructure/
│   ├── GreenVendor.Api/            # Dockerfile lives here
│   └── GreenVendor.Tests/
├── frontend/                       # React + TypeScript (Vite), own Dockerfile
├── nginx/
│   └── nginx.conf
├── docker-compose.yml
├── .env.example
└── .github/workflows/ci.yml
```

### Backend folders

- **Domain** — core entities such as `Supplier`, `BuyerProfile`, `Product`, `Order`, `Question`, `EsgScore`.
- **Application** — services, interfaces, DTOs, validators, exceptions, scoring logic.
- **Infrastructure** — database access, migrations, persistence services, implementation details.
- **Api** — HTTP controllers, middleware, auth setup, program bootstrapping.
- **Tests** — unit and integration-style tests for business rules.

### Frontend folders

- **`src/api`** — HTTP client and API wrappers.
- **`src/components`** — layout, reusable UI, protected route.
- **`src/context`** — auth state and related context.
- **`src/pages`** — public, buyer, supplier, and admin pages.
- **`src/types`** — TypeScript types and DTO contracts.


---

## Core workflow

1. A supplier registers or logs in.
2. The admin opens questionnaire access for that supplier.
3. The supplier submits questionnaire answers.
4. The backend validates the request and calculates the ESG score.
5. The supplier uploads a compliance certificate.
6. The supplier creates products.
7. The buyer browses the catalog and filters by ESG grade.
8. The buyer opens supplier details and places an order.
9. The admin monitors platform analytics.

---

## Local setup

### Requirements
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/).

### Run with Docker

```bash
git clone https://github.com/tamirlanm/GreenVendor.git
cd GreenVendor
cp .env.example .env        # then fill in real values, see below
docker compose up --build
```

This starts five containers:

| Service | Purpose | Host port |
|---|---|---|
| `db` | MS SQL Server 2025 | `${DB_HOST_PORT}` (maps to `1433` inside) |
| `api` | ASP.NET Core backend | `5000` (maps to `8080` inside) |
| `nginx` | Reverse proxy, serves the SPA + proxies `/api/` | `80` |
| `frontend` | One-shot build container — compiles the React app into a shared volume, then exits | — |
| `adminer` | Lightweight DB admin UI | `8080` |

`db` and `api` have Docker healthchecks; `api` won't be considered ready until `db` responds, and `nginx` won't be considered ready until `api`'s `/health` endpoint responds. On the very first run, SQL Server needs 1–2 minutes to initialize its system databases — this is expected, not an error.

Once everything is `Up` (`docker compose ps`), open:

```
http://localhost/api/docs
```

This is the interactive API documentation (Scalar, built on the generated OpenAPI spec). You can authenticate with the "Bearer" button using a token obtained from `POST /api/auth/login`, and call any endpoint directly from the browser.

### Running the backend outside Docker (faster iteration)

```bash
docker compose up db -d
cd backend/GreenVendor.Api
dotnet run
```

The API listens on `http://localhost:5000` directly (no nginx in front). Note that `appsettings.json`'s connection string (`Server=localhost,1435;...`) is written for exactly this scenario — it reaches SQL Server through the port published to the host. When `api` runs *inside* Docker instead, it must reach the database by service name (`db`, not `localhost`) — that's exactly what the `ConnectionStrings__DefaultConnection` environment variable in `docker-compose.yml` overrides at container start.

---

## Environment variables

All secrets and environment-specific values live in `.env` (git-ignored). `.env.example` is the checked-in template:

```env
DB_SERVER=db
DB_NAME=GreenVendorDb
DB_PORT=1433
DB_HOST_PORT=1435
MSSQL_SA_PASSWORD=Change_this_strong_Password123
ACCEPT_EULA=Y

JWT_SECRET=Change_this_To_A_Long_Random_Secret_At_Least_32_Chars
JWT_ISSUER=GreenVendor
JWT_AUDIENCE=GreenVendorBackend
JWT_EXPIRY_MINUTES=15
JWT_REFRESH_EXPIRY_DAYS=7
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://esg.kbtu.kz
```

`docker-compose.yml` reads these and injects them into the `api` container as ASP.NET Core configuration overrides (`ConnectionStrings__DefaultConnection`, `JwtSettings__Secret`, etc. — the double-underscore syntax is how `IConfiguration` maps environment variables to nested `appsettings.json` keys, no code changes required).

**Never commit a real `.env` file or real production secrets inside `appsettings.json`.** The values currently in `appsettings.json` are local-dev-only placeholders, kept only so `dotnet run` works out of the box without Docker. `CORS_ALLOWED_ORIGINS` controls which frontend origins may call the backend.

---

## API reference

Base path: `/api`. All endpoints return JSON. Protected endpoints require `Authorization: Bearer <token>`.

### Auth (`/api/auth`) — public

| Method | Path | Description |
|---|---|---|
| POST | `/register` | Register as Supplier or Buyer |
| POST | `/login` | Returns access token + refresh token |
| POST | `/refresh` | Rotates the refresh token, returns a new access token |

### Suppliers catalog (`/api/supplier`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | public | Browse suppliers, filterable by name/industry/min ESG score |
| GET | `/{id}` | public | Supplier details by id |
| GET | `/top-esg?take=3` | public | Top-N suppliers by ESG score |
| GET | `/me` | Supplier | Own supplier profile |
| PUT | `/me` | Supplier | Update own profile |
| POST | `/certificate` | Supplier | Upload compliance certificate (pdf/jpg/png/pem/crt/cer/der, ≤10MB) |
| GET | `/{supplierId}/certificate` | any authenticated user | Download a supplier's certificate |

### Questionnaire (`/api/questionnaire`) — role: Supplier

| Method | Path | Description |
|---|---|---|
| GET | `/questions` | The 12-question ESG question bank (4 per E/S/G category) |
| GET | `/my` | Own questionnaire status + score (`null` if not yet submitted) |
| POST | `/submit` | Submit answers — scores the questionnaire and marks it `Submitted` (one-time; a questionnaire must first be opened by an Admin) |

### Products (`/api/products` / `/api/suppliers/me/products`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/products` | Buyer | Catalog with filters: name, category, price range, min ESG grade |
| GET | `/api/products/categories/count` | Non-Auth | Sum of products in every products category |
| GET | `/api/products/{id}` | Buyer | Product details |
| GET | `/api/suppliers/me/products` | Supplier | Own product listings |
| POST | `/api/suppliers/me/products` | Supplier | Create a product |
| PUT | `/api/suppliers/me/products/{id}` | Supplier | Update own product (ownership enforced) |
| DELETE | `/api/suppliers/me/products/{id}` | Supplier | Delete own product |
| POST | `/api/suppliers/me/products/{id}/photo` | Supplier | Upload product photo (multipart, ≤5MB) |
| DELETE | `/api/suppliers/me/products/{id}/photo` | Supplier | Remove product photo |

### Orders (`/api/orders` / `/api/suppliers/me/orders`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/orders` | Buyer | Place an order (price is computed server-side from the product's current price, never trusted from the request) |
| GET | `/api/orders/my` | Buyer | Own order history (paginated) |
| GET | `/api/suppliers/me/orders` | Supplier | Incoming orders on own products (paginated) |
| PATCH | `/api/suppliers/me/orders/{id}` | Supplier | Confirm or reject a pending order (one-time decision, ownership enforced) |

### Buyer profile (`/api/buyers`) — role: Buyer

| Method | Path | Description |
|---|---|---|
| GET | `/me` | Own buyer profile |
| PUT | `/me` | Update own profile |

### Admin (`/api/admin`) — role: Admin

| Method | Path | Description |
|---|---|---|
| GET | `/suppliers` | All suppliers (including unverified) |
| PATCH | `/suppliers/{id}/verify` | Mark a supplier as verified |
| POST | `/suppliers/{id}/questionnaire` | Open questionnaire access for a supplier |
| GET | `/analytics` | Platform-wide stats: total/verified suppliers, submitted questionnaires, average ESG score |

### System

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check used by Docker |
| GET | `/api/docs` | Interactive Scalar/OpenAPI documentation |

---

## ESG scoring

The ESG score is calculated by a deterministic weighted formula in `EsgScoringService`.

- **E** — 40%
- **S** — 35%
- **G** — 25%

The result is converted into a grade from **A** to **F**.

This keeps the scoring transparent, reproducible, and easy to explain during a defense or demo.

---

## Testing

```bash
cd backend
dotnet test
```

27 tests covering the core business rules:

| Test class | What it covers |
|---|---|
| `EsgScoringServiceTests` | Score formula (40/35/25 weights), grade thresholds, division-by-zero guard for empty categories |
| `AuthServiceTests` | Registration, login, refresh-token rotation, password hashing |
| `QuestionnaireServiceTests` | Submission flow, duplicate-submit guard, data passed into scoring |
| `OrderServiceTests` | Server-side price computation, inactive-product guard, order status machine |
| `ProductServiceTests` | Catalog filtering by minimum ESG grade, product-ownership checks |
| `AdminServiceTests` | Analytics (including empty-database edge case), delegation to other services |

Database dependencies aren't mocked directly — tests use a real `AppDbContext` backed by the EF Core InMemory provider (`TestDbContextFactory`), while Moq is reserved for genuinely external-facing interfaces (`ITokenService`, `IEsgScoringService`, `IValidator<T>`, `IQuestionnaireService`).

---

## CI

`.github/workflows/ci.yml` runs on every push/PR to `main`/`dev` that touches `backend/**`: restore → build (Release) → `dotnet test`. Status is visible under the repository's **Actions** tab. A separate frontend pipeline can be added the same way, filtered on `frontend/**`.

---

## Deploying under a shared domain path

The target environment serves every project from a single domain, path-scoped rather than subdomain-scoped:

```
esg.kbtu.kz/<project-path>/
```

This repository is not path-agnostic yet — the checklist below is what needs to change before requesting a deploy slot. Everything here assumes the assigned path is `/greenvendor` (replace with whatever path ops actually assigns).

### 1. Frontend — set the base path

Vite (this project's build tool) needs to know the app isn't served from domain root:

```ts
// frontend/vite.config.ts
export default defineConfig({
  base: "/greenvendor/",
});
```

If using React Router:

```tsx
<BrowserRouter basename="/greenvendor">
```

The API base URL the frontend calls should be **configurable**, not hardcoded to `localhost` — read it from a build-time env variable (e.g. `VITE_API_URL=/greenvendor/api`) so the same build works locally and in production without code changes.

### 2. Backend — no hardcoded paths, no hardcoded domains

The API already exposes everything under `/api/` relative paths — no controller hardcodes a host or scheme. `app.UseForwardedHeaders(...)` is already configured in `Program.cs`, so the API correctly reads `X-Forwarded-For` / `X-Forwarded-Proto` set by an upstream proxy. No backend code changes are expected to be required for path-based deployment — the prefix is handled entirely at the nginx layer (below), not inside the API itself.

### 3. nginx — handle the `/greenvendor` prefix

`nginx/nginx.conf` currently serves everything from domain root (`location /`, `location /api/`). For subpath deployment it needs to both **match** the prefix and **strip** it before proxying to the backend (the backend only knows about `/api/...`, not `/greenvendor/api/...`):

```nginx
server {
    listen 80;
    client_max_body_size 10M;

    location /greenvendor/api/ {
        rewrite ^/greenvendor/(api/.*)$ /$1 break;
        proxy_pass http://api:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /greenvendor/images/ {
        rewrite ^/greenvendor/(images/.*)$ /$1 break;
        proxy_pass http://api:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /greenvendor/ {
        alias /usr/share/nginx/html/;
        try_files $uri $uri/ /greenvendor/index.html;
    }
}
```

(Exact prefix and whether the campus edge proxy already strips it before reaching this container should be confirmed with ops — the block above assumes it reaches this container **with** the prefix still attached, which is the more common setup for this kind of shared-domain path routing.)

### 4. Docker — don't expose the backend port publicly

`docker-compose.yml` currently publishes the API port to the host (`ports: "5000:8080"`) for local development convenience. Before deployment this should switch to `expose` (container-to-container only, not reachable from outside the Docker network) since nginx is the only thing that needs to reach `api` directly:

```yaml
api:
  # ports:
  #   - "5000:8080"
  expose:
    - "8080"
```

Keep `db`'s port similarly unexposed in production (it's only exposed locally so you can inspect it via a SQL client or Adminer during development).

Each project should run in its own Compose project (own network, own named volumes, own database container) — this repo already isolates its network as `gv_net` and names its volumes explicitly (`mssql_data`, `frontend_dist`, `product_images`, `suppliers_certificates`), so it won't collide with another project's stack on the same host, as long as the Compose project name itself is unique (`docker compose -p greenvendor up -d`, or rely on the containing folder name).

### 5. What to hand off

- Working backend + frontend, confirmed locally via `docker compose up --build`.
- This repository's `Dockerfile`s (`backend/GreenVendor.Api/Dockerfile`, `frontend/Dockerfile`) and `docker-compose.yml`.
- GitHub repository access.
- The assigned path prefix, so the three changes above (Vite `base`, `nginx.conf`, `docker-compose.yml` port exposure) can be finalized with the real value instead of the `/greenvendor` placeholder used here.

---

## Known limitations (MVP)

- ESG scoring is rule-based, not AI-based.
- This is an MVP version, so some workflows are intentionally simple.
- Production hardening such as monitoring, backup automation, and audit logging can be added later.