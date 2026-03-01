# Booking API — Production‑Credible Example

This repository is a production‑credible booking API built with Node.js + Express. It demonstrates engineering patterns expected from a senior backend engineer: concurrency controls, failure handling, observability, horizontal scale thinking, and explicit trade‑offs.

## Quick Overview
- REST API for hotels, rooms, inventory and bookings
- Idempotent booking flow with inventory adjustments
- Structured logging using Pino (`utils/logger.js`)
- Redis caching for search (`utils/redis.js`, `services/searchService.js`)
- Rate limiting (booking and GET endpoints) (`middlewares/rateLimit.js`)
- Zod validation for request schemas (`middlewares/validate.js`)
- Docker + docker‑compose for local full‑stack runs
- Health endpoint: `GET /health`

## Why this project is senior‑level
- **Concurrency:** idempotency keys and transactional changes protect booking consistency under retries and concurrent requests. Read/write boundaries (cache for read, DB for writes) reduce contention.
- **Failure handling:** graceful cache fallback, structured errors, idempotency for safe retries, and health checks for monitoring.
- **Scale thinking:** stateless API design, containerization, separate caching layer for read traffic, and middleware‑level protections (rate limiting).
- **Trade‑off awareness:** explicit decisions (e.g. TTL cache for searches vs. strongly consistent booking writes) are documented and implemented.

## Features to call out (resume bullets)
- Containerized app with `Dockerfile` and `docker-compose.yml` (app + MongoDB + Redis).
- Observability: structured JSON logs (Pino) with request IDs and response times.
- Search caching: Redis cache with 5‑minute TTL to reduce DB load on repeated searches.
- Protection: express‑rate‑limit applied to booking endpoints and GET/read endpoints.
- Validation: Zod schemas at the API boundary to fail fast on bad input.

## Run locally (development)

Install dependencies:

```bash
npm install
```

Run with nodemon (development):

```bash
npm start
# app runs on port 8800
```

Seed demo data (if needed):

```bash
npm run seed-all
```

Health check:

```bash
curl http://localhost:8800/health
```

## Run with Docker (recommended demo)

Build and run full stack:

```bash
docker-compose up --build -d
```

Then test:

```bash
curl http://localhost:8800/health
curl "http://localhost:8800/api/hotels/search?city=Paris&checkIn=2026-03-05&checkOut=2026-03-10"
```

To stop:

```bash
docker-compose down
```

## Important files
- `index.js` — app entry point, middleware and routes
- `Dockerfile`, `docker-compose.yml` — containerization
- `utils/logger.js` — structured logging (Pino)
- `utils/redis.js` — ioredis client
- `middlewares/rateLimit.js` — rate limits (bookingLimiter, getLimiter)
- `middlewares/validate.js` — Zod validation middleware
- `services/searchService.js` — search logic + caching
- `routes/*` and `controllers/*` — routes and controllers

## Design notes (concise talking points)
- Concurrency: use idempotency at the booking boundary; use DB transactions or repository-level checks when updating inventory. Keep the app stateless so replicas can be added without coordination.
- Failure handling: cache fallback (if Redis fails, query DB); structured logging for quick triage; health endpoints for orchestration and alerting.
- Scaling: containerize, separate read cache from write DB, use load balancer with multiple stateless instances, and add read replicas or sharding for the DB at high scale.
- Tradeoffs: TTL caching introduces acceptable staleness; bookings remain strongly consistent at the cost of some write complexity.

## Next steps (good talking points for interviews)
- Add OpenAPI/Swagger docs
- Add Prometheus metrics and OpenTelemetry tracing
- Add automated integration tests and CI pipeline
- Add Kubernetes manifests for production deployment
- Implement cache invalidation hooks when inventory updates

---

If you want, I can also:
- Add a `CONTRIBUTING.md` and `CHANGELOG.md` to show process maturity
- Create `swagger.yaml` and a `docs/` page for API docs
- Add GitHub Actions to run unit/integration tests and linting

If you want the README shorter or targeted to a specific employer/technology stack, tell me and I’ll tailor it.
