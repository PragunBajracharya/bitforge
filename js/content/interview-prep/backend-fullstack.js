/* ===== Interview prep C: backend & full-stack ===== */
IPT('ip-rest-http', { name: 'HTTP & REST API cheat sheet', cat: 'ipbe', roles: ['be', 'fs', 'fe'],
  blurb: `Backend interviews assume you can design clean HTTP APIs: the right method and status code, idempotency, pagination, filtering, versioning, errors and caching headers. This is the quick-reference version; the System Design course goes deeper.`,
  facts: [['Safe', 'GET, HEAD, OPTIONS'], ['Idempotent', 'GET, PUT, DELETE (+ safe ones)'], ['Not idempotent', 'POST, PATCH (usually)'], ['Errors', 'Consistent JSON body']],
  cheat: [['GET /orders', 'List (paginate!)'], ['GET /orders/42', 'Read one'], ['POST /orders', 'Create → 201 + Location header'], ['PUT /orders/42', 'Replace whole resource'], ['PATCH /orders/42', 'Partial update'], ['DELETE /orders/42', 'Delete → 204'], ['200 / 201 / 204', 'OK / Created / No Content'], ['301 / 302 / 304', 'Moved permanently / Found / Not Modified'], ['400 / 422', 'Malformed / validation failed'], ['401 / 403', 'Not authenticated / authenticated but not allowed'], ['404 / 409', 'Not found / conflict (duplicate, version mismatch)'], ['429', 'Too many requests (+ Retry-After)'], ['500 / 502 / 503 / 504', 'Server error / bad gateway / unavailable / gateway timeout'], ['Caching', 'Cache-Control, ETag + If-None-Match → 304'], ['Concurrency', 'ETag + If-Match → 412 if changed'], ['Idempotency-Key', 'Safe retries for POST']],
  sections: [
    ['Resource design', UL([`Nouns, plural, nested only one level for ownership: /users/7/orders.`, `Actions that don’t fit CRUD become sub-resources or verbs on a resource: POST /orders/42/cancel.`, `Filtering, sorting, pagination as query parameters: /orders?status=paid&amp;sort=-created_at&amp;limit=20&amp;cursor=…`, `Consistent casing (snake_case or camelCase) and ISO-8601 UTC timestamps.`, `Version in the path (/v1) or a header; additive changes don’t need a new version.`])],
    ['Errors', PP(`Return the right status code and a predictable body, e.g. <code>{"error": {"code": "validation_failed", "message": "email is invalid", "details": [{"field": "email", "issue": "format"}], "request_id": "…"}}</code> (or RFC 9457 problem+json). Never leak stack traces; log them server-side with the request ID.`)],
    ['Idempotency and retries', PP(`Clients retry on timeouts. GET, PUT and DELETE can be repeated safely; POST can create duplicates. Accept an Idempotency-Key header, store the key with the result, and return the stored result for repeats (see System Design → API design).`)],
    ['Optimistic concurrency', PP(`To stop two users overwriting each other: return an ETag (version) with GET; require If-Match on PUT/PATCH; if the version changed, respond 412 Precondition Failed (or 409) so the client can reload and merge.`)]
  ],
  snips: [['Express', 'javascript', `const router = express.Router();

router.get("/orders", async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 20, 100);          // cap page size
  const { items, nextCursor } = await orders.list({ userId: req.user.id, cursor: req.query.cursor, limit });
  res.json({ data: items, next_cursor: nextCursor });
});

router.post("/orders", validate(orderSchema), async (req, res) => {
  const key = req.get("Idempotency-Key");
  if (key) { const prior = await idem.get(req.user.id, key); if (prior) return res.status(prior.status).json(prior.body); }
  const order = await orders.create(req.user.id, req.body);
  if (key) await idem.save(req.user.id, key, { status: 201, body: order });
  res.status(201).location("/orders/" + order.id).json(order);
});

router.patch("/orders/:id", async (req, res) => {
  const updated = await orders.update(req.params.id, req.user.id, req.body, req.get("If-Match"));
  if (updated === "not_found") return res.sendStatus(404);
  if (updated === "version_conflict") return res.sendStatus(412);
  res.set("ETag", updated.version).json(updated);
});`],
    ['FastAPI', 'python', `from fastapi import FastAPI, HTTPException, Header, Query
from pydantic import BaseModel, EmailStr, Field

app = FastAPI()

class OrderIn(BaseModel):
    product_id: int
    quantity: int = Field(gt=0, le=100)

@app.get("/v1/orders")
def list_orders(limit: int = Query(20, le=100), cursor: str | None = None):
    items, nxt = repo.list(limit=limit, cursor=cursor)
    return {"data": items, "next_cursor": nxt}

@app.post("/v1/orders", status_code=201)
def create_order(body: OrderIn, idempotency_key: str | None = Header(None)):
    if idempotency_key and (prior := idem.get(idempotency_key)):
        return prior
    order = repo.create(body)
    if idempotency_key:
        idem.save(idempotency_key, order)
    return order

@app.get("/v1/orders/{order_id}")
def get_order(order_id: int):
    order = repo.get(order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="order not found")
    return order`],
    ['Spring Boot', 'java', `@RestController @RequestMapping("/v1/orders")
class OrderController {
    private final OrderService service;
    OrderController(OrderService service) { this.service = service; }

    @GetMapping("/{id}")
    ResponseEntity<Order> get(@PathVariable long id) {
        return service.find(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    ResponseEntity<Order> create(@Valid @RequestBody CreateOrder body) {
        Order o = service.create(body);
        return ResponseEntity.created(URI.create("/v1/orders/" + o.id())).body(o);
    }
}`]],
  edge: [`Unbounded list endpoints: always cap limit and paginate.`, `Returning 200 with an error body breaks clients and monitoring.`, `401 vs 403: missing/invalid credentials vs insufficient permission.`, `Large IDs in JSON lose precision in JavaScript (> 2⁵³); send them as strings.`, `Time zones: store and return UTC; let clients localize.`, `Trailing slashes and case sensitivity in routes cause duplicate endpoints.`],
  faq: [['PUT vs PATCH?', PP(`PUT replaces the whole resource with the representation sent (idempotent: sending it twice leaves the same state). PATCH applies a partial change; it can be idempotent (“set status = shipped”) or not (“increment quantity”).`)],
    ['How do you version an API?', PP(`Path versioning (/v1/) is simplest and most visible; header or media-type versioning keeps URLs clean. Avoid breaking changes by only adding optional fields; when a break is unavoidable, run v1 and v2 in parallel, publish a deprecation date, and monitor v1 usage before removal.`)]],
  qs: [SQ('A logged-in user requests another user’s private order. Best status code?', ['401', '403 or 404', '500', '200 with empty body'], 1, '403 if you reveal it exists, 404 to avoid leaking existence; never 200.')]
});

IPT('ip-be-arch', { name: 'Backend architecture & code structure', cat: 'ipbe', roles: ['be', 'fs'],
  blurb: `Interviewers look for well-structured backends: thin controllers, business logic in services, data access in repositories, cross-cutting concerns in middleware, validated inputs, consistent errors, structured logs and configuration from the environment.`,
  facts: [['Layers', 'Controller → service → repository'], ['Cross-cutting', 'Middleware'], ['Config', '12-factor, env vars'], ['Logs', 'Structured JSON + request ID']],
  dg: { w: 880, h: 250,
    n: [['c', 'Client', 70, 125, 'client'], ['mw', 'Middleware', 230, 125, 'gw', 'auth · logging · limits'], ['ctl', 'Controller', 400, 125, 'svc', 'HTTP in/out, validation'], ['svc', 'Service', 570, 125, 'svc', 'business rules'], ['repo', 'Repository', 740, 60, 'svc', 'queries'], ['ext', 'External APIs', 740, 195, 'ext', 'payments, email'], ['db', 'Database', 860, 60, 'db']],
    e: [['c', 'mw', 'request'], ['mw', 'ctl'], ['ctl', 'svc', 'DTO'], ['svc', 'repo'], ['svc', 'ext', 'adapter'], ['repo', 'db', 'SQL']] },
  cap: `A layered backend. Each layer has one job, depends only on the layer below, and can be tested in isolation.`,
  walk: [[['c', 'mw', 'c>mw'], `Middleware handles concerns every request shares: request IDs, authentication, rate limiting, logging, CORS, body parsing.`], [['ctl', 'mw>ctl'], `Controllers translate HTTP into function calls: parse and validate input, call a service, map the result or error to a response. No business logic.`], [['svc', 'ctl>svc'], `Services hold business rules and orchestrate work: transactions, calling repositories and external adapters, publishing events.`], [['repo', 'db', 'ext', 'svc>repo', 'repo>db', 'svc>ext'], `Repositories encapsulate data access; adapters wrap third-party APIs. Swapping a database or provider touches only these.`]],
  cheat: [['Controller', 'HTTP ↔ domain; validation; status codes'], ['Service', 'Business logic; transactions'], ['Repository / DAO', 'Persistence; queries'], ['DTO', 'Shapes for input/output, separate from DB entities'], ['Middleware', 'Auth, logging, CORS, rate limit, error handler'], ['Validation', 'Schemas at the boundary (Zod, Pydantic, Bean Validation)'], ['Error handling', 'Central handler maps exceptions → status + JSON'], ['Config', 'Environment variables; no secrets in code'], ['Logging', 'Structured JSON, levels, request/trace IDs'], ['Health checks', '/healthz (liveness), /readyz (readiness)'], ['Graceful shutdown', 'Stop accepting, finish in-flight, close pools'], ['Background jobs', 'Queue + workers (BullMQ, Celery, Sidekiq)']],
  sections: [
    ['Monolith first, modular inside', PP(`Most products start as a modular monolith: one deployable with clear internal modules (users, orders, billing), each with its own controllers, services and repositories, communicating through interfaces. It is fast to build and easy to split into services later along those module boundaries (see System Design → Microservices).`)],
    ['The twelve-factor checklist (highlights)', UL([`Config in the environment; one codebase, many deploys.`, `Backing services (DB, cache, queue) attached via URLs.`, `Stateless processes; state in backing services.`, `Logs as event streams to stdout.`, `Dev/prod parity: same dependencies (containers help).`, `Disposability: fast startup, graceful shutdown.`])],
    ['Error handling strategy', UL([`Throw domain errors (NotFound, Conflict, ValidationError) from services.`, `One error-handling middleware maps them to HTTP responses.`, `Unknown errors → 500 with a generic message and the request ID; full details in logs.`, `Retry only transient failures (timeouts, 503) with backoff; make operations idempotent.`])]
  ],
  snips: [['Express structure', 'javascript', `// routes/orders.js — controller
router.post("/orders", requireAuth, async (req, res, next) => {
  try {
    const input = OrderSchema.parse(req.body);                 // validate at the boundary (Zod)
    const order = await orderService.place(req.user.id, input);
    res.status(201).json(order);
  } catch (err) { next(err); }
});

// services/orderService.js — business rules
export async function place(userId, input) {
  return db.transaction(async tx => {
    const product = await productRepo.getForUpdate(tx, input.productId);
    if (!product) throw new NotFoundError("product");
    if (product.stock < input.quantity) throw new ConflictError("out of stock");
    await productRepo.decrementStock(tx, product.id, input.quantity);
    return orderRepo.create(tx, { userId, ...input, total: product.price * input.quantity });
  });
}

// middleware/errors.js — one place maps errors to responses
app.use((err, req, res, next) => {
  if (err instanceof ZodError) return res.status(422).json({ error: { code: "validation_failed", details: err.issues } });
  if (err instanceof NotFoundError) return res.status(404).json({ error: { code: "not_found", message: err.message } });
  if (err instanceof ConflictError) return res.status(409).json({ error: { code: "conflict", message: err.message } });
  req.log.error({ err, requestId: req.id }, "unhandled");
  res.status(500).json({ error: { code: "internal", request_id: req.id } });
});`],
    ['Graceful shutdown', 'javascript', `const server = app.listen(process.env.PORT || 3000);
process.on("SIGTERM", () => {
  server.close(async () => {          // stop accepting; wait for in-flight requests
    await db.end(); await redis.quit();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();   // force exit if stuck
});`]],
  edge: [`Async errors in Express 4 handlers aren’t caught automatically; wrap or use Express 5.`, `Long transactions holding row locks while calling external APIs.`, `Logging sensitive data (passwords, tokens, card numbers).`, `Configuration that silently falls back to defaults in production; fail fast on missing config.`, `N+1 queries hidden inside loops in services.`],
  faq: [['Where should business logic live and why?', PP(`In services (or domain objects), not controllers or SQL. That keeps it reusable from HTTP, jobs and CLI, testable without a web server, and independent of persistence details.`)],
    ['What happens during a deploy if you don’t handle SIGTERM?', PP(`The orchestrator kills the process with requests in flight: users see errors, and partial work may be lost. Handling SIGTERM lets the server stop accepting new connections, finish current ones and close pools, while the load balancer drains it.`)]],
  qs: [SQ('Which layer should decide “an order can’t exceed available stock”?', ['Controller', 'Service / domain layer', 'Database driver', 'Frontend only'], 1, 'Business rules belong in the service layer (with database constraints as a safety net).')]
});

IPT('ip-db-interview', { name: 'Databases for backend interviews', cat: 'ipbe', roles: ['be', 'fs'],
  blurb: `Backend rounds probe practical database skill: modeling tables, choosing indexes, writing correct transactions, avoiding N+1 queries, pooling connections and running migrations without downtime.`,
  facts: [['Default', 'PostgreSQL'], ['Speed up reads', 'Indexes'], ['Correctness', 'Transactions & constraints'], ['ORM trap', 'N+1 queries']],
  cheat: [['Primary key', 'Unique row identity (bigint or UUIDv7)'], ['Foreign key', 'Referential integrity; index it'], ['Unique constraint', 'Enforce uniqueness (emails) at the DB'], ['Index', 'B-tree for equality/range; composite: equality columns first'], ['EXPLAIN ANALYZE', 'See the plan and real timing'], ['Transaction', 'BEGIN … COMMIT; all or nothing'], ['Isolation', 'Read committed (PG default) … serializable'], ['SELECT … FOR UPDATE', 'Lock rows you will change'], ['Optimistic locking', 'version column; UPDATE … WHERE version = ?'], ['N+1', '1 query for parents + N for children; use joins / IN / eager loading'], ['Connection pool', 'Reuse connections; size ≈ cores × 2–4 per instance'], ['Migrations', 'Versioned schema changes; expand → migrate → contract'], ['Soft delete', 'deleted_at column; filter everywhere'], ['JSONB', 'Flexible attributes inside PostgreSQL']],
  sections: [
    ['Modeling a schema in an interview', OL([`List entities and relationships (users 1–N orders; orders N–M products through order_items).`, `Pick keys and types; add NOT NULL, UNIQUE and CHECK constraints for invariants.`, `Write the main queries, then add indexes for them.`, `Say what you would denormalize or cache for hot paths.`])],
    ['N+1 queries', PP(`Loading 50 orders and then each order’s customer in a loop runs 51 queries. Fix with a JOIN, a single <code>WHERE id IN (…)</code> query, or the ORM’s eager loading (Django select_related/prefetch_related, Rails includes, JPA fetch joins, Prisma include). GraphQL resolvers solve it with DataLoader batching.`)],
    ['Safe migrations', UL([`Add columns as nullable or with defaults that don’t rewrite the table.`, `Create indexes concurrently (PostgreSQL CREATE INDEX CONCURRENTLY).`, `Rename with expand/contract: add new column, dual-write, backfill in batches, switch reads, drop old later.`, `Never run a long, locking migration during peak traffic; test on a production-sized copy.`])],
    ['SQL vs NoSQL answer template', PP(`“The data is relational with transactions across orders and inventory, so PostgreSQL. If one access pattern needs massive write throughput (activity events), I’d put that in a wide-column store or a log, keeping the source of truth relational.” See System Design → Databases.`)]
  ],
  snips: [['SQL', 'sql', `CREATE TABLE users (
  id          BIGSERIAL PRIMARY KEY,
  email       TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE orders (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id),
  status      TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'shipped', 'cancelled')),
  total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
  version     INTEGER NOT NULL DEFAULT 1,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX orders_user_created ON orders (user_id, created_at DESC);   -- "my orders, newest first"

-- Atomic stock decrement (no race)
UPDATE products SET stock = stock - 1 WHERE id = $1 AND stock >= 1 RETURNING stock;

-- Optimistic locking
UPDATE orders SET status = 'shipped', version = version + 1
WHERE id = $1 AND version = $2;             -- 0 rows updated → someone else changed it

EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 7 ORDER BY created_at DESC LIMIT 20;`],
    ['ORM (Django)', 'python', `# N+1: one query for orders, then one per order for the user
for o in Order.objects.all()[:50]:
    print(o.user.email)

# Fixed: JOIN in one query
for o in Order.objects.select_related("user")[:50]:
    print(o.user.email)

# Many-to-many / reverse relations: 2 queries total
orders = Order.objects.prefetch_related("items__product")[:50]

# Transaction + row lock
from django.db import transaction
with transaction.atomic():
    p = Product.objects.select_for_update().get(pk=pid)
    if p.stock < qty:
        raise OutOfStock()
    p.stock -= qty
    p.save()`]],
  edge: [`Indexes on low-selectivity columns (booleans) rarely help.`, `Functions on indexed columns (WHERE lower(email) = …) skip the index unless you index the expression.`, `LIKE '%term' can’t use a B-tree index; use full-text or trigram indexes.`, `Too-large connection pools overload the database; many app instances × pool size adds up (use PgBouncer).`, `Long-running transactions block vacuum and hold locks.`, `Money as floats; use integer cents or NUMERIC.`],
  faq: [['How would you find and fix a slow query?', PP(`Find it via slow-query logs or APM. Run EXPLAIN ANALYZE to see whether it scans instead of using an index, mis-estimates rows, or sorts in memory. Add or adjust an index matching the WHERE and ORDER BY, rewrite to avoid functions on indexed columns or N+1 patterns, limit selected columns, and cache if it is hot and read-mostly.`)],
    ['Optimistic vs pessimistic locking?', PP(`Pessimistic (SELECT … FOR UPDATE) locks rows up front: good for high contention and short transactions. Optimistic uses a version check at write time and retries on conflict: better for low contention and for long user “think time” (editing a form), since no locks are held.`)]],
  qs: [SQ('Listing 100 posts and their authors runs 101 queries. What is this and the fix?', ['A deadlock; add a lock', 'The N+1 problem; join or batch-load authors (eager loading)', 'A missing primary key', 'Replication lag'], 1, 'Load related rows in one query with a JOIN or IN.')]
});

IPT('ip-auth', { name: 'Authentication & authorization in practice', cat: 'ipbe', roles: ['be', 'fs', 'fe'],
  blurb: `Implementing login correctly is a classic interview topic: storing passwords, sessions vs JWTs, refresh tokens, OAuth social login, and enforcing permissions. Small mistakes here become breaches.`,
  facts: [['Passwords', 'Argon2id / bcrypt'], ['Web apps', 'HttpOnly session cookie'], ['APIs / mobile', 'Short JWT + refresh token'], ['Permissions', 'Check on every request']],
  cheat: [['Hash passwords', 'Argon2id or bcrypt with per-user salt; never encrypt or plain SHA'], ['Session', 'Random ID in HttpOnly cookie → server-side store'], ['JWT', 'Signed claims (sub, exp, scope); verify signature, exp, iss, aud'], ['Access token', 'Short-lived (5–15 min)'], ['Refresh token', 'Long-lived, rotated, revocable, stored securely'], ['OAuth 2.0 + OIDC', 'Authorization code + PKCE for login with Google/GitHub'], ['MFA', 'TOTP, WebAuthn/passkeys'], ['RBAC', 'Roles → permissions'], ['ABAC / ReBAC', 'Attributes / relationships decide access'], ['Logout', 'Delete session; revoke refresh token'], ['Brute force', 'Rate limit, lockout with backoff, CAPTCHA'], ['Password reset', 'Single-use, expiring, hashed token; don’t reveal if email exists']],
  sections: [
    ['Sessions vs JWT', TBL(['', 'Server session', 'JWT'], [['Stored', 'Server (Redis/DB); cookie holds a random ID', 'Client; server verifies signature'], ['Revocation', 'Instant (delete session)', 'Hard until expiry: keep short, use refresh tokens'], ['Scale', 'Needs shared session store', 'Stateless verification anywhere'], ['Best for', 'Browser apps on one domain', 'APIs, mobile, service-to-service']]) + PP(`A common hybrid: short-lived JWT access tokens plus a rotating refresh token in an HttpOnly cookie.`)],
    ['Login flow done right', OL([`Rate limit by IP and account.`, `Look up the user; verify the password hash with a constant-time function (the library does this). Use the same error for unknown email and wrong password.`, `Rehash if the stored parameters are outdated.`, `Create a session (regenerate the ID to prevent fixation) or issue tokens.`, `Set cookies with HttpOnly, Secure, SameSite.`, `Log the event (without the password).`])],
    ['Authorization', UL([`Authenticate once (middleware), authorize at every resource access: “can user X do action Y on object Z?”.`, `Scope queries by owner: <code>WHERE id = $1 AND user_id = $2</code> (prevents IDOR).`, `Centralize policy checks (a policy function or library like CASL, Pundit, OPA) instead of scattering ifs.`, `Deny by default.`])]
  ],
  snips: [['Node.js', 'javascript', `import argon2 from "argon2";
import jwt from "jsonwebtoken";

export async function register(email, password) {
  if (password.length < 12) throw new ValidationError("password too short");
  const hash = await argon2.hash(password, { type: argon2.argon2id });
  return users.create({ email: email.toLowerCase(), password_hash: hash });
}

export async function login(email, password) {
  const user = await users.findByEmail(email.toLowerCase());
  const ok = user && await argon2.verify(user.password_hash, password);
  if (!ok) throw new AuthError("invalid email or password");          // same message either way
  const access = jwt.sign({ sub: String(user.id), role: user.role }, process.env.JWT_SECRET,
                          { expiresIn: "15m", issuer: "api.example.com", audience: "web" });
  const refresh = await refreshTokens.issue(user.id);                  // random, stored hashed, rotated on use
  return { access, refresh };
}

export function requireAuth(req, res, next) {
  const token = (req.get("Authorization") || "").replace(/^Bearer /, "");
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET, { issuer: "api.example.com", audience: "web", algorithms: ["HS256"] });
    next();
  } catch { res.sendStatus(401); }
}

export const requireRole = role => (req, res, next) => req.user?.role === role ? next() : res.sendStatus(403);`],
    ['Python', 'python', `from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
import secrets, hashlib

ph = PasswordHasher()                      # Argon2id with safe defaults

def verify_login(user, password: str) -> bool:
    if user is None:
        ph.hash(password)                  # spend similar time to avoid user enumeration by timing
        return False
    try:
        ph.verify(user.password_hash, password)
    except VerifyMismatchError:
        return False
    if ph.check_needs_rehash(user.password_hash):
        user.password_hash = ph.hash(password)
    return True

def new_reset_token():
    token = secrets.token_urlsafe(32)                       # send this in the email link
    digest = hashlib.sha256(token.encode()).hexdigest()     # store only the hash, with an expiry
    return token, digest`]],
  edge: [`JWT alg=none or algorithm confusion attacks: always pin the expected algorithms.`, `Tokens in localStorage are exposed to XSS.`, `Not invalidating sessions after password change or logout everywhere.`, `User enumeration via different error messages or timing on login and password reset.`, `Email case sensitivity creating duplicate accounts.`, `Clock skew when validating exp/nbf; allow small leeway.`],
  faq: [['How would you implement “log out from all devices” with JWTs?', PP(`Keep access tokens short-lived and revoke all refresh tokens for the user (they are stored server-side). Optionally store a token_version on the user, include it in the JWT, and reject tokens whose version is older, at the cost of a lookup or cache check per request.`)],
    ['Why not encrypt passwords instead of hashing them?', PP(`Encryption is reversible: anyone who gets the key gets every password. Password hashing is one-way, salted per user and deliberately slow (Argon2id, bcrypt), so stolen hashes are expensive to crack.`)]],
  qs: [SQ('A user changes their password. What should happen to their other sessions?', ['Nothing', 'Invalidate other sessions / refresh tokens', 'Extend them', 'Email them the new password'], 1, 'Otherwise an attacker with a stolen session keeps access.')]
});

IPT('ip-be-perf', { name: 'Backend performance & scalability', cat: 'ipbe', roles: ['be', 'fs'],
  blurb: `“The API is slow. What do you do?” Interviewers want a methodical answer: measure, find the bottleneck, then apply the right fix: query tuning, caching, batching, async processing, horizontal scaling. This page is the checklist; System Design covers each building block in depth.`,
  facts: [['Step 1', 'Measure (APM, traces)'], ['Usual culprit', 'Database'], ['Biggest lever', 'Caching'], ['Slow work', 'Move to a queue']],
  cheat: [['Measure', 'p50/p95/p99 latency, throughput, error rate, saturation'], ['Profile', 'Traces show where time goes per request'], ['DB', 'Indexes, avoid N+1, select fewer columns, read replicas'], ['Cache', 'In-process, Redis, HTTP caching, CDN'], ['Batch', 'Combine many small calls into one'], ['Async jobs', 'Emails, reports, video → queue + workers'], ['Pagination', 'Never return unbounded lists'], ['Compression', 'gzip/brotli responses'], ['Connection reuse', 'Keep-alive, pools'], ['Concurrency', 'Parallelize independent I/O'], ['Scale out', 'Stateless app servers behind a LB'], ['Protect', 'Timeouts, rate limits, circuit breakers']],
  sections: [
    ['A methodical answer', OL([`Reproduce and quantify: which endpoint, how slow (p95, p99), since when, for whom?`, `Look at traces and metrics: time in DB, external calls, CPU, GC, lock waits.`, `Fix the biggest contributor first (Amdahl’s law).`, `Typical fixes in order of effort: add an index, remove N+1, cache, parallelize independent calls, paginate, move work to background jobs, denormalize, scale out, then shard.`, `Verify with a load test and keep the dashboard to catch regressions.`])],
    ['Caching layers', TBL(['Layer', 'Example', 'Invalidation'], [['HTTP / CDN', 'Cache-Control on public GETs', 'TTL, versioned URLs, purge'], ['Application', 'Redis cache-aside for product pages', 'TTL + delete on write'], ['In-process', 'LRU map for config or hot keys', 'Short TTL; per-instance'], ['Database', 'Materialized views, buffer pool', 'Refresh schedules']])],
    ['Load testing', PP(`Use k6, Locust, Gatling or JMeter against a production-like environment. Ramp traffic, watch latency percentiles and error rates, and find the saturation point. Test the realistic mix of endpoints, warm caches, and realistic data sizes.`)]
  ],
  snips: [['Node.js', 'javascript', `// Parallelize independent I/O
const [user, orders, recs] = await Promise.all([getUser(id), getOrders(id), getRecommendations(id)]);

// Cache-aside with Redis and a stampede guard
async function getProduct(id) {
  const key = "product:" + id;
  const hit = await redis.get(key);
  if (hit) return JSON.parse(hit);
  const lock = await redis.set(key + ":lock", "1", { NX: true, PX: 5000 });
  if (!lock) { await sleep(50); return getProduct(id); }          // someone else is rebuilding
  try {
    const p = await db.product.findUnique({ where: { id } });
    await redis.set(key, JSON.stringify(p), { EX: 300 + Math.floor(Math.random() * 60) });   // jittered TTL
    return p;
  } finally { await redis.del(key + ":lock"); }
}

// Offload slow work to a queue (BullMQ)
await reportQueue.add("monthly-report", { userId }, { attempts: 5, backoff: { type: "exponential", delay: 1000 } });
res.status(202).json({ status: "queued" });`],
    ['k6 load test', 'javascript', `import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [{ duration: "1m", target: 50 }, { duration: "3m", target: 200 }, { duration: "1m", target: 0 }],
  thresholds: { http_req_duration: ["p(95)<300"], http_req_failed: ["rate<0.01"] },
};
export default function () {
  const res = http.get("https://staging.example.com/api/products?limit=20");
  check(res, { "status is 200": r => r.status === 200 });
  sleep(1);
}`]],
  edge: [`Caching per-user data under a shared key leaks data between users.`, `Cache stampede when a hot key expires; use locks, early refresh or stale-while-revalidate.`, `Load tests from one machine measure the load generator, not the server.`, `Optimizing averages while p99 stays bad.`, `Unbounded in-memory caches cause out-of-memory crashes; bound size and TTL.`],
  faq: [['Your API’s p99 latency spikes every few minutes. How do you investigate?', PP(`Correlate the spikes with other signals: GC pauses, cron jobs, cache expiry waves, database checkpoints or autovacuum, deploys, noisy neighbors. Look at traces from the slow requests to see which span grows. Typical fixes: jitter TTLs, reschedule batch jobs, tune GC/heap, add capacity headroom.`)]],
  qs: [SQ('A page calls three independent services sequentially, each 100 ms. Quickest improvement?', ['Bigger servers', 'Call them in parallel (≈ 100 ms total)', 'Add a CDN', 'Use UDP'], 1, 'Independent I/O should run concurrently.')]
});

/* ---------- Full-stack ---------- */
IPT('ip-fs-flow', { name: 'What happens when you type a URL', cat: 'ipfs', roles: ['fs', 'fe', 'be', 'swe'],
  blurb: `The most famous open-ended interview question. A strong answer walks the whole stack (DNS, TCP and TLS, CDN, load balancer, server, database, response, rendering) and goes deep wherever the interviewer steers.`,
  facts: [['Network', 'DNS → TCP → TLS → HTTP'], ['Edge', 'CDN, load balancer'], ['Server', 'App, cache, database'], ['Browser', 'Parse, render, run JS']],
  dg: { w: 920, h: 290,
    n: [['b', 'Browser', 70, 145, 'client', 'cache? HSTS?'], ['dns', 'DNS', 230, 50, 'dns', 'name → IP'], ['cdn', 'CDN edge', 230, 220, 'cdn', 'TLS, cached assets'], ['lb', 'Load balancer', 420, 145, 'lb'], ['app', 'App server', 610, 145, 'svc', 'route, auth, render'], ['ca', 'Cache', 790, 60, 'cache'], ['db', 'Database', 790, 230, 'db']],
    e: [['b', 'dns', '1 · resolve'], ['b', 'cdn', '2 · TCP + TLS, GET'], ['cdn', 'lb', '3 · miss / dynamic'], ['lb', 'app'], ['app', 'ca', '4 · read'], ['app', 'db', 'query'], ['app', 'b', '5 · HTML', 'U', 'resp']] },
  cap: `The journey of one page load. Each hop is a place to optimize and a place things fail.`,
  walk: [[['b'], `The browser parses the URL, checks HSTS (force HTTPS), and checks its caches (HTTP cache, service worker) for the page.`], [['b', 'dns', 'b>dns'], `It resolves the domain via the OS cache and a recursive resolver; the answer may point to the nearest CDN edge.`], [['b', 'cdn', 'b>cdn'], `It opens a TCP connection and negotiates TLS (or uses QUIC/HTTP/3), then sends GET / with cookies and headers.`], [['cdn', 'lb', 'lb', 'app', 'cdn>lb', 'lb>app'], `The CDN serves cached static content; dynamic requests go to a load balancer, which picks a healthy app server.`], [['app', 'ca', 'db', 'app>ca', 'app>db'], `The server routes the request, authenticates the session, reads from cache or database, and renders HTML (or returns JSON for a SPA).`], [['app', 'b', 'resp'], `The browser receives the response, parses HTML into the DOM, fetches CSS/JS/images (often in parallel over HTTP/2), builds the render tree, lays out, paints and runs JavaScript, which may fetch more data.`]],
  cheat: [['URL parsing', 'scheme, host, port, path, query, fragment'], ['HSTS', 'Browser upgrades to HTTPS'], ['DNS', 'Browser → OS → resolver → root → TLD → authoritative'], ['TCP', '3-way handshake'], ['TLS 1.3', '1 RTT; certificate validation'], ['HTTP/2, /3', 'Multiplexed streams; QUIC over UDP'], ['CDN', 'Edge cache, TLS termination'], ['Load balancer', 'Health checks, routing'], ['Server', 'Middleware → controller → service → DB'], ['Response', 'Status, headers (cache, cookies), body'], ['Rendering', 'DOM, CSSOM, layout, paint, composite'], ['After load', 'JS hydration, API calls, analytics']],
  sections: [
    ['How to answer', PP(`Give a two-minute overview end to end, then ask “where would you like me to go deeper?”. Good deep dives: DNS caching and TTLs, TLS handshake and certificates, HTTP caching headers, how the load balancer chooses servers, how the server handles the request (threads vs event loop), database indexes, and the browser rendering pipeline. Each links to a topic in this site.`)],
    ['Where it goes wrong (and what you would check)', TBL(['Symptom', 'Likely layer'], [['“Site can’t be reached”', 'DNS, network, TLS certificate'], ['Slow first byte', 'Server/DB time, cold caches, no CDN'], ['Fast HTML, slow page', 'Large JS bundles, render-blocking CSS, images'], ['Works for some users only', 'DNS propagation, CDN region, caching of personalized pages'], ['Intermittent 502/504', 'Unhealthy instances, timeouts between LB and app']])]
  ],
  faq: [['Why does a second visit load faster?', PP(`DNS answers, TLS session tickets and open connections may be reused; static assets come from the browser cache (long max-age with hashed file names) or the CDN; service workers can serve the app shell offline.`)]],
  qs: [SQ('Which step can be skipped entirely for a site served with HSTS on a later visit?', ['DNS', 'The insecure HTTP request before redirecting to HTTPS', 'TLS', 'Rendering'], 1, 'HSTS makes the browser go straight to HTTPS.')]
});

IPT('ip-fs-data', { name: 'Data flow across the stack', cat: 'ipfs', roles: ['fs', 'fe', 'be'],
  blurb: `Full-stack engineers own the contract between UI and server: how data is fetched, cached, mutated and kept fresh. Know REST vs GraphQL vs RPC trade-offs, pagination, optimistic updates, real-time sync, validation on both sides, and type sharing.`,
  facts: [['Fetch', 'REST, GraphQL, tRPC'], ['Cache', 'Query library on the client'], ['Mutations', 'Optimistic + rollback'], ['Validate', 'Client for UX, server for truth']],
  cheat: [['REST', 'Simple, cacheable; risk of over/under-fetching'], ['GraphQL', 'Client chooses fields; one endpoint; needs batching'], ['tRPC / RPC', 'End-to-end types in TypeScript monorepos'], ['Server state cache', 'TanStack Query / SWR: dedupe, stale-while-revalidate'], ['Invalidation', 'After mutation: invalidate or update affected queries'], ['Optimistic update', 'Update UI first, roll back on error'], ['Pagination', 'Cursor + infinite query'], ['Real-time', 'WebSocket/SSE events update the cache'], ['Validation', 'Shared schema (Zod) on client and server'], ['Types', 'OpenAPI/GraphQL codegen or shared TS types'], ['Errors', 'Map API errors to field errors and toasts'], ['Uploads', 'Presigned URLs direct to storage']],
  sections: [
    ['Choosing the API style', TBL(['Situation', 'Choice'], [['Public API, many unknown clients', 'REST + OpenAPI'], ['Many screens needing different shapes of related data', 'GraphQL (or a BFF)'], ['One TypeScript team owning both ends', 'tRPC or typed REST with shared schemas'], ['High-volume service-to-service', 'gRPC']])],
    ['Mutation lifecycle', OL([`Validate on the client for instant feedback (same schema as the server).`, `Optimistically update the cache so the UI responds immediately.`, `Send the request with an idempotency key.`, `On success, reconcile with the server response (real IDs, timestamps).`, `On failure, roll back and show the error next to the relevant field.`, `Invalidate related queries (e.g., counts, lists) so they refetch.`])],
    ['Keeping data fresh', UL([`Stale-while-revalidate: show cached data instantly, refetch in the background.`, `Refetch on window focus / reconnect for dashboards.`, `Push updates over WebSockets/SSE and patch the cache by ID.`, `For collaborative editing, use CRDTs or operational transforms.`])]
  ],
  snips: [['React + TanStack Query', 'javascript', `const todosKey = ["todos"];

function useTodos() {
  return useQuery({ queryKey: todosKey, queryFn: () => api.get("/todos"), staleTime: 30_000 });
}

function useToggleTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: todo => api.patch("/todos/" + todo.id, { done: !todo.done }),
    onMutate: async todo => {                         // optimistic update
      await qc.cancelQueries({ queryKey: todosKey });
      const previous = qc.getQueryData(todosKey);
      qc.setQueryData(todosKey, old => old.map(t => t.id === todo.id ? { ...t, done: !t.done } : t));
      return { previous };
    },
    onError: (_err, _todo, ctx) => qc.setQueryData(todosKey, ctx.previous),   // roll back
    onSettled: () => qc.invalidateQueries({ queryKey: todosKey }),            // re-sync with server
  });
}`],
    ['Shared validation (Zod)', 'typescript', `// shared/schemas.ts — imported by both client and server
import { z } from "zod";
export const TodoInput = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  dueDate: z.coerce.date().optional(),
});
export type TodoInput = z.infer<typeof TodoInput>;

// server
app.post("/todos", (req, res) => {
  const parsed = TodoInput.safeParse(req.body);
  if (!parsed.success) return res.status(422).json({ errors: parsed.error.flatten().fieldErrors });
  /* ... */
});

// client (react-hook-form)
const form = useForm<TodoInput>({ resolver: zodResolver(TodoInput) });`]],
  edge: [`Optimistic updates racing with real-time events can double-apply; dedupe by ID and version.`, `Client-side validation can be bypassed: always validate on the server.`, `Date handling across time zones and serialization (dates become strings in JSON).`, `Large numbers lose precision in JS; IDs as strings.`, `Partial failures in batch mutations need per-item results.`],
  faq: [['How do you keep the UI in sync after a mutation?', PP(`Either update the cache directly with the server’s response (precise, fast) or invalidate the affected queries so they refetch (simple, slightly slower). For lists affected by a create/delete, invalidation is usually safest; for single-item edits, setQueryData with the response avoids a round trip.`)]],
  qs: [SQ('Why validate on the server if the client already validates?', ['It’s faster', 'Clients can be bypassed or outdated; the server is the source of truth', 'Browsers require it', 'For SEO'], 1, 'Client validation is UX; server validation is security and integrity.')]
});

IPT('ip-devops', { name: 'Docker, CI/CD & deployment', cat: 'ipfs', roles: ['fs', 'be'],
  blurb: `Full-stack and backend roles expect you to ship: containerize an app, run it with its dependencies locally, build a CI pipeline, deploy to a cloud platform with zero downtime, and manage configuration and secrets.`,
  facts: [['Package', 'Docker image'], ['Local stack', 'docker compose'], ['Pipeline', 'Lint → test → build → deploy'], ['Run', 'Kubernetes / PaaS / serverless']],
  dg: { w: 900, h: 220,
    n: [['dev', 'Developer', 70, 110, 'user', 'git push'], ['ci', 'CI', 240, 110, 'worker', 'lint · test · build'], ['reg', 'Image registry', 420, 110, 'store', 'app:3f9a2c'], ['stg', 'Staging', 600, 50, 'svc', 'smoke tests'], ['prod', 'Production', 780, 110, 'svc', 'rolling / canary'], ['mon', 'Monitoring', 600, 180, 'worker', 'errors, latency']],
    e: [['dev', 'ci', 'PR'], ['ci', 'reg', 'push image'], ['reg', 'stg', 'deploy'], ['stg', 'prod', 'promote'], ['prod', 'mon', 'metrics', 'd'], ['mon', 'prod', 'auto-rollback', 'du']] },
  cap: `A CI/CD pipeline: every change is tested and built into an immutable image, promoted through staging, rolled out gradually and rolled back automatically if metrics degrade.`,
  walk: [[['dev', 'ci', 'dev>ci'], `A push or pull request triggers CI: install, lint, type-check, test.`], [['ci', 'reg', 'ci>reg'], `CI builds one Docker image tagged with the commit SHA and pushes it to a registry. The same image goes everywhere: no “works on my machine”.`], [['reg', 'stg', 'reg>stg'], `It deploys to staging and runs smoke and end-to-end tests.`], [['stg', 'prod', 'mon', 'stg>prod', 'prod>mon', 'mon>prod'], `Production rollout is gradual (rolling or canary) with health checks; monitoring triggers rollback on error spikes.`]],
  cheat: [['Image', 'Immutable package: code + runtime + deps'], ['Container', 'Running instance of an image'], ['Dockerfile', 'Build recipe; order layers for caching'], ['Multi-stage build', 'Build with dev deps, ship a slim runtime image'], ['docker compose', 'Run app + DB + Redis locally'], ['Environment config', 'Env vars; secrets from a secret manager'], ['CI', 'Automated checks on every change'], ['CD', 'Automated deploys of main'], ['Blue-green / canary', 'Zero-downtime releases with fast rollback'], ['Kubernetes', 'Deployments, Services, Ingress, ConfigMaps, Secrets, HPA'], ['PaaS', 'Render, Fly.io, Heroku, App Engine: less ops'], ['Serverless', 'Functions (Lambda), pay per request, cold starts'], ['IaC', 'Terraform / Pulumi: infrastructure as code'], ['Observability', 'Logs, metrics, traces, alerts']],
  sections: [
    ['Dockerfile best practices', UL([`Use a small, pinned base image (node:20-alpine, python:3.12-slim, distroless).`, `Copy dependency manifests first and install, then copy source: dependency layers stay cached.`, `Multi-stage builds keep compilers and dev dependencies out of production.`, `Run as a non-root user; add a HEALTHCHECK or rely on orchestrator probes.`, `.dockerignore node_modules, .git, secrets.`])],
    ['Where to deploy', TBL(['Option', 'Good for', 'Trade-off'], [['PaaS', 'Small teams, fast shipping', 'Less control, cost at scale'], ['Containers on Kubernetes', 'Many services, fine control', 'Operational complexity'], ['Serverless functions', 'Spiky, event-driven workloads', 'Cold starts, execution limits, vendor lock-in'], ['Static hosting + CDN', 'Frontends, SSG sites', 'Needs an API elsewhere']])],
    ['Secrets and config', PP(`Keep secrets out of code and images; inject them at runtime from a secret manager (AWS Secrets Manager, Vault, Kubernetes Secrets) or the platform’s encrypted env vars. Different values per environment; rotate regularly; least-privilege credentials per service.`)]
  ],
  snips: [['Dockerfile', 'dockerfile', `# --- build stage ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

# --- runtime stage ---
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]`],
    ['docker-compose.yml', 'yaml', `services:
  api:
    build: .
    ports: ["3000:3000"]
    environment:
      DATABASE_URL: postgres://app:app@db:5432/app
      REDIS_URL: redis://cache:6379
    depends_on:
      db: { condition: service_healthy }
  db:
    image: postgres:16
    environment: { POSTGRES_USER: app, POSTGRES_PASSWORD: app, POSTGRES_DB: app }
    healthcheck: { test: ["CMD", "pg_isready", "-U", "app"], interval: 5s, retries: 10 }
    volumes: [pgdata:/var/lib/postgresql/data]
  cache:
    image: redis:7
volumes:
  pgdata: {}`],
    ['Kubernetes', 'yaml', `apiVersion: apps/v1
kind: Deployment
metadata: { name: api }
spec:
  replicas: 3
  strategy: { rollingUpdate: { maxUnavailable: 0, maxSurge: 1 } }   # zero-downtime
  selector: { matchLabels: { app: api } }
  template:
    metadata: { labels: { app: api } }
    spec:
      containers:
        - name: api
          image: registry.example.com/api:3f9a2c
          ports: [{ containerPort: 3000 }]
          envFrom: [{ secretRef: { name: api-secrets } }]
          readinessProbe: { httpGet: { path: /readyz, port: 3000 } }
          livenessProbe:  { httpGet: { path: /healthz, port: 3000 } }
          resources: { requests: { cpu: 250m, memory: 256Mi }, limits: { memory: 512Mi } }`]],
  edge: [`Using latest tags makes deploys non-reproducible; tag by commit SHA.`, `Database migrations must be backward compatible with the old version during rolling deploys.`, `Liveness probes that check dependencies can restart healthy pods during a DB blip.`, `Containers write to ephemeral disks; persist data in volumes or external stores.`, `Secrets baked into images or committed .env files.`],
  faq: [['How do you deploy with zero downtime?', PP(`Run several instances behind a load balancer; roll out new versions gradually (rolling, blue-green or canary) with readiness checks so traffic only reaches ready instances; drain connections on shutdown (SIGTERM handling); keep database changes backward compatible; automate rollback on error metrics.`)],
    ['Container vs virtual machine?', PP(`A VM virtualizes hardware and runs a full guest OS: strong isolation, heavier, slower to start. A container shares the host kernel and isolates processes with namespaces and cgroups: lightweight, starts in milliseconds, but weaker isolation.`)]],
  qs: [SQ('Why copy package.json and install dependencies before copying the rest of the source in a Dockerfile?', ['Docker requires it', 'So the dependency layer is cached and reused when only source code changes', 'To reduce security risk', 'To run tests'], 1, 'Layer caching makes rebuilds much faster.')]
});

IPT('ip-fs-design', { name: 'Full-stack design exercise: a task board', cat: 'ipfs', roles: ['fs'],
  blurb: `A typical full-stack design round: “Build a Trello-like task board”. You define features, data model, API, frontend architecture, real-time collaboration, auth, deployment and scaling, connecting every topic in this course.`,
  facts: [['Entities', 'User, Board, List, Card'], ['Ordering', 'Fractional ranks'], ['Collaboration', 'WebSocket events'], ['Stack', 'React + API + PostgreSQL + Redis']],
  dg: { w: 920, h: 290,
    n: [['ui', 'React SPA', 80, 145, 'client', 'board view, drag & drop'], ['cdn', 'CDN', 80, 260, 'cdn', 'static assets'], ['api', 'REST API', 320, 90, 'svc', 'auth, CRUD'], ['ws', 'Realtime gateway', 320, 220, 'svc', 'WebSockets'], ['db', 'PostgreSQL', 580, 90, 'db', 'boards, lists, cards'], ['rd', 'Redis', 580, 220, 'cache', 'pub/sub, sessions'], ['s3', 'Object storage', 820, 90, 'store', 'attachments'], ['q', 'Job queue', 820, 220, 'queue', 'notifications']],
    e: [['ui', 'api', 'HTTPS'], ['ui', 'ws', 'subscribe board'], ['api', 'db', 'SQL'], ['api', 'rd', 'publish event'], ['rd', 'ws', 'fan out', 'd'], ['api', 's3', 'presigned URL', 'd'], ['api', 'q', 'email jobs', 'd'], ['cdn', 'ui', '', 'd']] },
  cap: `The task board architecture. Writes go through the API to PostgreSQL; each change is published through Redis to the realtime gateway, which pushes it to everyone viewing the board.`,
  walk: [[['ui', 'cdn', 'cdn>ui'], `The SPA loads from a CDN, authenticates with a session cookie, and fetches the board: GET /boards/7 returns lists and cards in one response.`], [['ui', 'ws', 'ui>ws'], `It opens a WebSocket and subscribes to board 7.`], [['ui', 'api', 'db', 'ui>api', 'api>db'], `Dragging a card sends PATCH /cards/42 {list_id, rank}. The UI updates optimistically; the API checks permissions and saves.`], [['api', 'rd', 'ws', 'api>rd', 'rd>ws'], `The API publishes “card moved” to Redis; every gateway instance with subscribers to board 7 pushes it to their clients, which patch their caches.`], [['api', 's3', 'q', 'api>s3', 'api>q'], `Attachments upload directly to object storage; mentions and due-date reminders become background jobs.`]],
  cheat: [['Features', 'Boards, lists, cards, drag & drop, members, comments, attachments, real-time'], ['Tables', 'users, boards, board_members(role), lists, cards, comments, attachments'], ['Ordering', 'rank (fractional or LexoRank strings) → O(1) reorders'], ['API', 'GET /boards/:id, POST /lists, PATCH /cards/:id, POST /cards/:id/comments'], ['Permissions', 'board_members role check on every request'], ['Real-time', 'WebSocket rooms per board; Redis pub/sub across instances'], ['Conflicts', 'Last-write-wins per field + version for card text'], ['Frontend', 'Query cache + optimistic updates; dnd-kit for drag & drop'], ['Scale', 'Read replicas, cache board snapshots, shard by board'], ['Offline', 'Queue mutations; replay on reconnect']],
  sections: [
    ['Ordering cards without rewriting everything', PP(`Storing positions as 1, 2, 3… means moving one card renumbers many. Instead store a sortable rank: a card dropped between ranks 1.0 and 2.0 gets 1.5. With floats, repeated inserts eventually run out of precision, so production systems use string ranks (LexoRank: “0|hzzzzz:”) and occasionally rebalance. Each move is then a single-row update.`)],
    ['Data model', TBL(['Table', 'Key columns'], [['boards', 'id, name, owner_id, created_at'], ['board_members', 'board_id, user_id, role (admin/member/viewer), PK(board_id, user_id)'], ['lists', 'id, board_id, name, rank'], ['cards', 'id, list_id, board_id, title, description, rank, due_at, version'], ['comments', 'id, card_id, author_id, body, created_at'], ['attachments', 'id, card_id, storage_key, size, content_type']]) + PP(`Indexes: cards(list_id, rank), lists(board_id, rank), board_members(user_id).`)],
    ['Scaling and reliability', UL([`Most boards are small: one query loads a whole board; cache it in Redis and invalidate on change.`, `Gateways are stateless apart from sockets; Redis pub/sub (or a broker) fans events out across instances.`, `Clients reconnect with backoff and fetch changes since their last event ID.`, `Rate limit writes per user; audit log for changes.`, `Deploy API and gateway separately; scale gateways by connection count.`])]
  ],
  faq: [['Two users edit the same card title at once. What happens?', PP(`With last-write-wins, the later save overwrites the earlier one silently. Better: include the card’s version in the PATCH (If-Match); if it changed, return 409 so the client can show “this card was updated” and merge. For rich text collaboration, use CRDTs (Yjs) instead.`)],
    ['How do you scale WebSockets across many servers?', PP(`Each gateway holds a subset of connections. When a change happens, publish it to a shared channel (Redis pub/sub, NATS, Kafka) keyed by board; every gateway subscribed to that board forwards it to its local sockets. Sticky sessions aren’t needed for delivery, only for long-polling fallbacks.`)]],
  qs: [SQ('Why store a rank like 1.5 instead of integer positions for card order?', ['Floats are faster', 'Moving a card becomes a single-row update instead of renumbering many cards', 'Databases can’t sort integers', 'It saves storage'], 1, 'A rank between neighbors avoids rewriting every following position.')]
});
