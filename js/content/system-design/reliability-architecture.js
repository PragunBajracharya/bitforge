/* ===== System design topics D: reliability, operations, architecture ===== */

SDX('ratelimit', { name: 'Rate limiting', cat: 'sdrel',
  blurb: `A rate limiter caps how many requests a client can make in a period. It protects services from abuse and overload, enforces fair use and pricing tiers, and keeps one noisy customer from hurting everyone else. The token bucket is the most widely used algorithm.`,
  facts: [['Response', 'HTTP 429 + Retry-After'], ['Token bucket', 'Allows bursts, smooth average'], ['Where', 'Gateway, per service'], ['State', 'Redis, or local + sync']],
  dg: { w: 760, h: 330,
    n: [['c', 'Client', 100, 160, 'client', 'by user, IP or key'], ['gw', 'API gateway', 360, 160, 'gw', 'rate limiter'], ['r', 'Redis', 360, 295, 'cache', 'tokens per key'], ['api', 'API servers', 630, 160, 'svc']],
    e: [['c', 'gw', 'request', 'u'], ['gw', 'r', 'take 1 token (atomic)', 'b'], ['gw', 'api', 'allowed'], ['gw', 'c', '429 Too Many Requests', 'u', 'deny']] },
  cap: `The gateway checks a shared token bucket per client before forwarding. With tokens left, the request passes; with none, it is rejected immediately with 429, and the API servers never see it.`,
  walk: [[['c', 'gw', 'c>gw'], `A request arrives. The limiter identifies the client by API key, user ID or IP, and picks the rule (say 100 requests per minute with bursts up to 20).`],
    [['gw', 'r', 'gw>r'], `It runs an atomic script in Redis: refill the bucket for the time elapsed since the last request, then try to take one token. All gateway instances share the same counters.`],
    [['gw', 'api', 'gw>api'], `A token was available: forward the request, adding headers like X-RateLimit-Remaining.`],
    [['gw', 'c', 'deny'], `The bucket is empty: return 429 Too Many Requests with Retry-After, costing almost nothing.`]],
  sections: [
    ['Algorithms', TBL(['Algorithm', 'How', 'Pros', 'Cons'], [['Token bucket', 'Bucket of capacity b refills at r tokens/s; each request takes one', 'Allows short bursts, smooth average, tiny state', 'Two parameters to tune'], ['Leaky bucket', 'Requests queue and drain at a fixed rate', 'Perfectly smooth output', 'Bursts wait or are dropped; adds latency'], ['Fixed window counter', 'Count per calendar minute', 'Simplest', 'Up to 2× the limit across a window boundary'], ['Sliding window log', 'Store each request’s timestamp; count those in the last minute', 'Exact', 'Memory grows with request count'], ['Sliding window counter', 'Weighted mix of current and previous window counts', 'Accurate and cheap', 'Approximate (assumes even spread)']])],
    ['Distributed rate limiting', UL([`A shared store (Redis) with atomic operations (Lua scripts or INCR with EXPIRE) gives one global count per key.`, `Each check costs a network round trip; for very high rates, keep local buckets with a share of the limit and sync periodically, accepting slight overshoot.`, `Shard counters by key across Redis nodes; replicate for availability.`, `Decide on failure behavior: if the limiter’s store is down, fail open (allow) for availability or fail closed (deny) for protection.`])],
    ['What to limit by', UL([`Per user or API key for fairness and pricing tiers.`, `Per IP for anonymous traffic and abuse (beware of many users behind one NAT).`, `Per endpoint: expensive operations (search, login, password reset) get stricter limits.`, `Global limits to protect a fragile dependency.`])],
    ['Client experience', PP(`Return 429 with Retry-After and rate-limit headers so well-behaved clients back off. Clients should retry with exponential backoff and jitter. For internal services, prefer queueing or load shedding by priority over hard rejection.`)]
  ],
  code: null,
  qs: [SQ('A fixed-window limit of 100/minute lets a client send 200 requests in 2 seconds. How?', ['Redis lost the count', '100 at 12:00:59 and 100 at 12:01:00 fall in two different windows', 'Token buckets allow it', 'The client used two IPs'], 1, 'Window boundaries allow double bursts; sliding windows or token buckets fix it.')]
});

SDX('availability', { name: 'Availability, SLOs & redundancy', cat: 'sdrel',
  blurb: `Availability is the fraction of time a system works. It is achieved by removing single points of failure: redundant instances across failure domains (machines, racks, availability zones, regions), automatic failover, and a clear, measured target (an SLO).`,
  facts: [['99.9%', '8.8 h downtime/year'], ['99.99%', '53 min/year'], ['99.999%', '5.3 min/year'], ['Failure domains', 'Host, rack, zone, region']],
  dg: { w: 820, h: 340,
    n: [['u', 'Users', 80, 170, 'user'], ['lb', 'Load balancer', 280, 170, 'lb', 'spans both zones'], ['a1', 'App ×3', 500, 80, 'svc'], ['a2', 'App ×3', 500, 260, 'svc'], ['d1', 'Primary DB', 710, 80, 'db'], ['d2', 'Standby DB', 710, 260, 'db']],
    e: [['u', 'lb'], ['lb', 'a1'], ['lb', 'a2'], ['a1', 'd1'], ['a2', 'd1', 'cross-zone'], ['d1', 'd2', 'sync replication', 'd']],
    z: [['Availability zone A', 420, 20, 385, 120], ['Availability zone B', 420, 200, 385, 120]] },
  cap: `Redundancy across two availability zones (separate buildings with independent power and networking). Losing a whole zone leaves a working copy of every component.`,
  walk: [[['u', 'lb', 'u>lb'], `The load balancer itself is redundant and spans both zones.`],
    [['lb', 'a1', 'a2', 'lb>a1', 'lb>a2'], `App servers run in both zones with enough capacity that either zone alone can carry peak traffic (N+1 or 2N capacity).`],
    [['d1', 'd2', 'd1>d2'], `The database primary replicates synchronously to a standby in the other zone, so no committed data is lost if zone A fails.`],
    [['a2', 'd2', 'lb', 'lb>a2'], `If zone A goes dark, health checks remove its servers and the standby is promoted. Users see a short blip instead of an outage. For regional disasters, the same pattern is repeated across regions.`]],
  sections: [
    ['The nines', TBL(['Availability', 'Downtime per year', 'Per month', 'Typical for'], [['99%', '3.65 days', '7.3 h', 'Internal tools'], ['99.9%', '8.8 h', '43.8 min', 'Many SaaS products'], ['99.95%', '4.4 h', '21.9 min', 'Cloud services’ SLAs'], ['99.99%', '52.6 min', '4.4 min', 'Payments, core platforms'], ['99.999%', '5.3 min', '26 s', 'Telecom, critical infrastructure']]) +
      PP(`Each extra nine costs roughly ten times more effort: more redundancy, automation, testing and on-call discipline.`)],
    ['Combining components', PP(`Components in series multiply: an app at 99.9% that needs a database at 99.9% is at most 99.8%. Redundant components in parallel combine as 1 − (1 − a)²: two independent 99% instances give 99.99%, if failures are truly independent and failover works. That is why redundancy only helps across independent failure domains, and why every hard dependency lowers your ceiling.`)],
    ['SLIs, SLOs and SLAs', TBL(['Term', 'Meaning', 'Example'], [['SLI (indicator)', 'A measured metric', '% of requests served successfully in under 300 ms'], ['SLO (objective)', 'Your internal target', '99.9% over 28 days'], ['SLA (agreement)', 'A contract with consequences', '99.5% or service credits'], ['Error budget', '1 − SLO: allowed unreliability', '0.1% ≈ 40 minutes per month to spend on risky launches']])],
    ['Removing single points of failure', UL([`Run at least two of everything, in different zones: load balancers, app servers, databases, caches, queues.`, `Automate failover, and test it regularly (game days, chaos engineering).`, `Avoid hidden shared dependencies: one DNS provider, one config service, one certificate that expires on the same day everywhere.`, `Degrade gracefully: serve cached or partial results when a non-critical dependency fails.`, `Plan disaster recovery with explicit RPO (how much data you may lose) and RTO (how long recovery may take).`])]
  ],
  qs: [SQ('A request must pass through 3 independent services, each 99.9% available. What is the best-case availability?', ['99.9%', '≈ 99.7%', '≈ 99.99%', '97%'], 1, '0.999³ ≈ 0.997: dependencies in series multiply their unavailability.')]
});

SDX('retries', { name: 'Timeouts, retries & backoff', cat: 'sdrel',
  blurb: `Remote calls fail and stall. Every call needs a timeout, transient failures deserve a retry, and retries must back off exponentially with random jitter, or a fleet of clients retrying in lockstep turns a brief blip into a self-inflicted outage.`,
  facts: [['Timeout', 'Always set one'], ['Backoff', 'base × 2ⁿ, capped'], ['Jitter', 'Randomize the wait'], ['Budget', 'Limit retries per request']],
  dg: { w: 760, h: 380,
    n: [['c', 'Client', 90, 190, 'client'], ['s', 'Inventory service', 600, 190, 'svc', 'overloaded']],
    e: [['c', 's', '1 · try → 503', 'U', 'a1'], ['c', 's', '2 · wait ≈ 100 ms + jitter', 'u', 'a2'], ['c', 's', '3 · wait ≈ 200 ms + jitter', '', 'a3'], ['c', 's', '4 · wait ≈ 400 ms → 200 OK', 'n', 'a4'], ['s', 'c', 'give up → fallback', 'dU', 'gu']] },
  cap: `Exponential backoff with jitter: each retry waits about twice as long as the previous one, randomized so thousands of clients don’t retry at the same instant.`,
  walk: [[['c', 's', 'a1'], `The first attempt fails with 503 because the service is briefly overloaded. A timeout (say 300 ms) would be treated the same way.`],
    [['c', 's', 'a2'], `Wait about 100 ms, randomized (for example, a random value between 0 and 100 ms: “full jitter”), then retry.`],
    [['c', 's', 'a3'], `Still failing: double the base wait to 200 ms, again randomized.`],
    [['c', 's', 'a4'], `The service has recovered and the fourth attempt succeeds. Without jitter, every client that failed at the same moment would have retried at the same moments, creating synchronized spikes.`],
    [['s', 'c', 'gu'], `After the maximum attempts (or when the overall deadline is reached), give up and degrade: show cached data, queue the work, or return a clear error.`]],
  sections: [
    ['Timeouts', UL([`Without a timeout, a hung dependency ties up a thread or connection forever, and the caller runs out of them: one slow service takes down its callers.`, `Set timeouts from the dependency’s observed latency (a bit above its p99), not arbitrary large numbers.`, `Propagate deadlines: if the user request has 1 s left, a downstream call shouldn’t wait 5 s (gRPC deadlines do this automatically).`])],
    ['What to retry', TBL(['Retry', 'Don’t retry'], [['Timeouts and connection errors (if the operation is idempotent)', '400, 401, 403, 404, 422: the request itself is wrong'], ['503 Service Unavailable, 429 (after Retry-After)', 'Non-idempotent operations without an idempotency key'], ['Throttling and leader-election blips', 'Errors that will obviously repeat (validation, missing data)']])],
    ['Backoff and jitter', PP(`wait = random(0, min(cap, base × 2^attempt)) — “full jitter” — spreads retries evenly and was shown by AWS to minimize total work and completion time. Cap the maximum wait (for example 10 s) and the number of attempts (3–5).`)],
    ['Retry storms and budgets', UL([`Retries multiply: if each of 4 layers retries 3 times, one user request can become 3⁴ = 81 calls to the bottom service, exactly when it is struggling.`, `Retry at one layer only (usually the one closest to the user, or the client library).`, `Use a retry budget: retries may add at most, say, 10% extra load; beyond that, fail fast.`, `Combine with circuit breakers so persistently failing dependencies are not hammered.`, `Hedged requests (send a second copy after the p95 latency, take whichever answers first) cut tail latency for idempotent reads, within a budget.`])]
  ],
  code: null,
  qs: [SQ('Why add random jitter to exponential backoff?', ['To make retries faster', 'So clients that failed together don’t retry in synchronized waves', 'To encrypt requests', 'Because HTTP requires it'], 1, 'Jitter desynchronizes clients, spreading retry load over time.')]
});

SDX('circuitbreaker', { name: 'Circuit breakers & bulkheads', cat: 'sdrel',
  blurb: `When a dependency is failing, continuing to call it wastes resources and slows everyone down. A circuit breaker tracks failures and, past a threshold, “opens” to fail fast for a while, then lets a few trial requests through to see whether the dependency has recovered.`,
  facts: [['Closed', 'Calls flow, failures counted'], ['Open', 'Fail fast, no calls'], ['Half-open', 'A few trial calls'], ['Pairs with', 'Timeouts, fallbacks, bulkheads']],
  dg: { w: 760, h: 320,
    n: [['cl', 'Closed', 150, 160, 'box', 'calls pass · count failures'], ['op', 'Open', 600, 60, 'box', 'fail fast · no calls'], ['ho', 'Half-open', 600, 260, 'box', 'allow a few trial calls']],
    e: [['cl', 'op', 'failure rate ≥ 50%'], ['op', 'ho', 'after 30 s', 'U'], ['ho', 'cl', 'trials succeed'], ['ho', 'op', 'a trial fails', 'U', 'hoop']] },
  cap: `The circuit breaker’s three states. It protects both sides: the struggling dependency gets breathing room, and callers stop waiting on calls that will fail anyway.`,
  walk: [[['cl'], `Closed (normal): calls go through. The breaker records outcomes over a sliding window (last 20 calls, or last 10 seconds).`],
    [['cl', 'op', 'cl>op'], `When the failure or timeout rate crosses the threshold, the breaker opens.`],
    [['op'], `Open: calls fail immediately without touching the network, and the caller returns a fallback (cached data, a default, a friendly error). Threads and connections are no longer tied up waiting.`],
    [['op', 'ho', 'op>ho'], `After a cooldown, the breaker moves to half-open and lets a small number of trial calls through.`],
    [['ho', 'cl', 'ho>cl', 'hoop'], `If the trials succeed, it closes and traffic resumes; if one fails, it opens again for another cooldown.`]],
  sections: [
    ['Why fail fast', PP(`Suppose the recommendations service is down and every call waits 2 s for a timeout. At 1,000 requests per second, the caller holds 2,000 threads in waiting calls: it runs out of threads and fails too, and the failure cascades upstream. A breaker turns 2-second failures into microsecond failures and lets the page render without recommendations.`)],
    ['Fallbacks', UL([`Serve stale data from a cache.`, `Return a sensible default (empty recommendations, standard shipping estimate).`, `Hide the feature on the page.`, `Queue the request for later.`, `Fail with a clear error only when there is no acceptable degraded answer.`])],
    ['Bulkheads', PP(`Named after a ship’s watertight compartments: isolate resources so one failing dependency can only exhaust its own pool. Give each dependency its own connection pool or thread pool with a fixed size, so a slow payments API can’t consume the threads needed to serve the product page. Apply the same idea to tenants (one customer’s load can’t starve others) and to infrastructure (cell-based architecture: independent copies of the whole stack, each serving a slice of users).`)],
    ['Other overload defenses', UL([`<b>Load shedding:</b> reject low-priority work early when queues grow (return 503 quickly instead of timing out slowly).`, `<b>Backpressure:</b> bounded queues signal producers to slow down.`, `<b>Adaptive concurrency limits:</b> automatically lower in-flight limits when latency rises.`, `Libraries: Resilience4j (Java), Polly (.NET), Envoy and service meshes provide breakers and outlier ejection without code changes.`])]
  ],
  code: null,
  qs: [SQ('What does a circuit breaker do in the half-open state?', ['Blocks all calls', 'Lets a few trial calls through to test recovery', 'Retries every call twice', 'Sends calls to a backup region'], 1, 'Successful trials close the circuit; a failure reopens it.')]
});

SDX('observability', { name: 'Observability: metrics, logs & traces', cat: 'sdrel',
  blurb: `You can’t fix what you can’t see. Metrics tell you that something is wrong, traces show where in a chain of services it is wrong, and logs explain why. Alerts on user-facing symptoms wake the right person.`,
  facts: [['Metrics', 'Cheap numbers over time'], ['Logs', 'Detailed events'], ['Traces', 'One request across services'], ['Standard', 'OpenTelemetry']],
  dg: { w: 820, h: 330,
    n: [['a', 'Checkout service', 105, 90, 'svc'], ['b', 'Payment service', 105, 245, 'svc'], ['col', 'Collector', 340, 165, 'worker', 'OpenTelemetry'], ['m', 'Metrics DB', 560, 60, 'db', 'Prometheus'], ['l', 'Log store', 560, 165, 'db', 'Loki / Elasticsearch'], ['t', 'Trace store', 560, 270, 'db', 'Jaeger / Tempo'], ['al', 'Alerts', 740, 60, 'user', 'on-call']],
    e: [['a', 'b', 'trace-id: 4bf9…'], ['a', 'col', ''], ['b', 'col', ''], ['col', 'm', 'metrics'], ['col', 'l', 'logs'], ['col', 't', 'spans'], ['m', 'al', 'SLO burn']] },
  cap: `Services emit metrics, logs and trace spans tagged with a shared trace ID. A collector routes each signal to its store; alerts fire from metrics, and engineers jump from an alert to the traces and logs of the failing requests.`,
  walk: [[['a', 'b', 'a>b'], `A checkout request gets a trace ID at the edge. Every downstream call carries it in a header (W3C traceparent).`],
    [['a', 'b', 'col', 'a>col', 'b>col'], `Each service records spans (timed operations), increments metrics (requests, errors, latency histograms) and writes structured logs that include the trace ID.`],
    [['col', 'm', 'l', 't', 'col>m', 'col>l', 'col>t'], `A collector batches and forwards each signal to a store optimized for it.`],
    [['m', 'al', 'm>al'], `An alert fires when the error budget is burning too fast (for example, 5% of checkouts failing for 5 minutes). The on-call engineer opens the dashboard, finds slow traces, sees the time is spent in the payment call, and reads that span’s logs: a certificate expired on the payment provider.`]],
  sections: [
    ['The three signals', TBL(['Signal', 'What', 'Strength', 'Cost'], [['Metrics', 'Numeric time series: counters, gauges, histograms', 'Cheap, fast queries, ideal for dashboards and alerts', 'No per-request detail; high-cardinality labels (user ID) explode cost'], ['Logs', 'Timestamped records of events', 'Rich context for debugging', 'Expensive at volume; sample or tier'], ['Traces', 'A tree of spans for one request across services', 'Shows where latency and errors come from', 'Usually sampled (e.g. 1%, plus all errors)']])],
    ['What to measure', UL([`<b>RED</b> for services: Rate, Errors, Duration (as percentiles from histograms).`, `<b>USE</b> for resources: Utilization, Saturation, Errors (CPU, memory, disk, connection pools).`, `<b>The four golden signals</b> (Google SRE): latency, traffic, errors, saturation.`, `Business metrics: orders per minute, signups, payment success rate. They often catch problems technical metrics miss.`])],
    ['Alerting well', UL([`Alert on symptoms users feel (error rate, latency SLO burn), not on every cause (CPU at 80%).`, `Every page should be urgent, actionable and have a runbook.`, `Use multi-window burn-rate alerts on SLOs to catch both fast and slow burns.`, `Send non-urgent signals to tickets or dashboards, not pagers.`])],
    ['Practices', UL([`Structured (JSON) logs with request and trace IDs.`, `Correlate everything by trace ID across services.`, `Health checks: liveness (restart me) vs readiness (don’t send me traffic yet).`, `Post-incident reviews that are blameless and produce fixes.`])]
  ],
  qs: [SQ('Latency rose for checkout, which calls 6 services. Which signal pinpoints the slow service fastest?', ['CPU metrics of each host', 'Distributed traces of slow requests', 'Total log volume', 'Uptime checks'], 1, 'A trace shows each downstream span’s duration within one request.')]
});

SDX('deploys', { name: 'Deployments: rolling, blue-green & canary', cat: 'sdrel',
  blurb: `Most outages are caused by changes. Safe deployment strategies release new versions gradually, watch the metrics, and roll back automatically, so a bad release affects a few users for a few minutes instead of everyone.`,
  facts: [['Rolling', 'Replace instances in batches'], ['Blue-green', 'Switch all traffic at once, instant rollback'], ['Canary', 'Small % first, then expand'], ['Feature flags', 'Decouple deploy from release']],
  dg: { w: 780, h: 320,
    n: [['u', 'Users', 85, 160, 'user'], ['lb', 'Load balancer', 300, 160, 'lb', 'weighted routing'], ['v1', 'v1 fleet', 560, 70, 'svc', '19 servers · 95%'], ['v2', 'v2 canary', 560, 250, 'svc', '1 server · 5%'], ['mon', 'Canary analysis', 300, 290, 'worker', 'compare errors, latency']],
    e: [['u', 'lb'], ['lb', 'v1', '95%'], ['lb', 'v2', '5%'], ['v2', 'mon', 'metrics', 'd'], ['v1', 'mon', 'baseline', 'd'], ['mon', 'lb', 'promote or roll back']] },
  cap: `A canary release: 5% of traffic goes to the new version while an automated comparison against the old version decides whether to continue to 25%, 50% and 100%, or to roll back.`,
  walk: [[['lb', 'v2', 'lb>v2'], `Deploy v2 to one server and send it 5% of traffic (or only internal users first).`],
    [['v1', 'v2', 'mon', 'v1>mon', 'v2>mon'], `Compare the canary’s error rate, latency and business metrics with the baseline v1 servers over, say, 15 minutes.`],
    [['mon', 'lb', 'mon>lb'], `If they match, increase the share step by step. If the canary is worse, shift its traffic back to v1 automatically: only a small fraction of users saw the problem, briefly.`],
    [['v1', 'v2'], `Database changes are done separately and backward compatibly (expand, migrate, contract) so both versions can run side by side.`]],
  sections: [
    ['Strategies', TBL(['Strategy', 'How', 'Rollback', 'Cost'], [['Recreate', 'Stop old, start new', 'Redeploy old', 'Downtime'], ['Rolling', 'Replace instances a batch at a time', 'Roll forward or back gradually', 'Cheap; versions mixed during rollout'], ['Blue-green', 'Run a full new environment, switch the router', 'Switch back instantly', '2× capacity during the switch'], ['Canary', 'Small slice first, expand on good metrics', 'Shift the slice back', 'Needs good metrics and routing'], ['Feature flags / dark launches', 'Ship code off, enable per user or %', 'Turn the flag off', 'Flag debt to clean up']])],
    ['Database migrations without downtime', OL([`<b>Expand:</b> add new columns or tables, nullable, without removing anything.`, `Deploy code that writes both old and new shapes and reads the old.`, `Backfill existing rows in batches.`, `Switch reads to the new shape.`, `<b>Contract:</b> stop writing the old shape, then drop it in a later release.`]) + PP(`Each step is independently deployable and reversible, so old and new code can run at the same time.`)],
    ['Practices', UL([`Small, frequent deploys are safer than big, rare ones: fewer changes per release, easier to find the cause.`, `Automate rollback on SLO breach.`, `Deploy one zone or region at a time (progressive delivery across failure domains).`, `Keep configuration changes under the same process: many outages are config pushes.`])]
  ],
  qs: [SQ('Why add a new column as nullable, deploy, backfill, and only later enforce or drop old columns?', ['To save disk space', 'So old and new code versions work against the same schema during rollout and rollback', 'Databases require it', 'To speed up queries'], 1, 'Expand–migrate–contract keeps every intermediate state compatible with both versions.')]
});

SDX('microservices', { name: 'Monoliths & microservices', cat: 'sdarch',
  blurb: `A monolith is one deployable application; microservices split a system into small services that own their data and deploy independently. Microservices let many teams move independently at the cost of network calls, distributed data and operational complexity.`,
  facts: [['Monolith', 'Simple, one deploy'], ['Microservices', 'Independent teams & scaling'], ['Rule', 'Each service owns its data'], ['Often best', 'Start modular monolith']],
  dg: { w: 820, h: 340,
    n: [['c', 'Clients', 80, 170, 'client'], ['gw', 'API gateway', 270, 170, 'gw'], ['us', 'Users', 480, 50, 'svc'], ['or', 'Orders', 480, 170, 'svc'], ['ct', 'Catalog', 480, 290, 'svc'], ['du', 'Users DB', 700, 50, 'db'], ['do', 'Orders DB', 700, 170, 'db'], ['dc', 'Catalog DB', 700, 290, 'db'], ['bus', 'Event bus', 270, 295, 'queue']],
    e: [['c', 'gw'], ['gw', 'us'], ['gw', 'or'], ['gw', 'ct'], ['us', 'du'], ['or', 'do'], ['ct', 'dc'], ['or', 'bus', 'OrderPlaced', 'd'], ['bus', 'ct', 'update stock', 'd']] },
  cap: `Microservices: each service owns its database and exposes an API. Services never read each other’s tables; they call APIs or react to events.`,
  walk: [[['c', 'gw', 'c>gw'], `Clients talk to one gateway, which routes to the owning service.`],
    [['us', 'or', 'ct', 'du', 'do', 'dc', 'us>du', 'or>do', 'ct>dc'], `Each service owns its data store, chosen for its needs, and is deployed, scaled and on-called by one team.`],
    [['or', 'bus', 'bus', 'ct', 'or>bus', 'bus>ct'], `When an order is placed, Orders publishes an event; Catalog reacts by decrementing stock. Neither needs the other to be up at that moment.`],
    [['gw', 'us', 'or', 'ct'], `The cost: what was a function call is now a network call that can fail, data spans databases (no joins, no transactions across them), and you need tracing, service discovery and per-service pipelines.`]],
  dg2: { w: 620, h: 200, n: [['c', 'Clients', 80, 100, 'client'], ['m', 'Monolith', 300, 100, 'svc', 'users · orders · catalog'], ['db', 'One database', 530, 100, 'db']], e: [['c', 'm', 'HTTP'], ['m', 'db', 'joins + transactions']] },
  dg2t: 'Compare: monolith', cap2: `A monolith: all modules in one process sharing one database. Calls are function calls and transactions span everything, but every change ships together.`,
  sections: [
    ['Trade-offs', TBL(['', 'Monolith', 'Microservices'], [['Development', 'Simple locally, one codebase', 'Many repos/services, contracts between them'], ['Deploys', 'All or nothing', 'Independent, frequent'], ['Scaling', 'Whole app', 'Per service'], ['Data', 'One DB: joins and transactions', 'Per-service DBs: eventual consistency, sagas'], ['Failure', 'A bug can crash everything', 'Partial failures, cascading timeouts'], ['Team fit', 'Small teams', 'Many teams that need autonomy'], ['Operations', 'Low', 'High: discovery, tracing, CI/CD per service']])],
    ['Drawing service boundaries', UL([`Split by business capability or domain (bounded contexts in domain-driven design): payments, catalog, shipping. Not by technical layer (a “database service”).`, `A service should own all the data it needs to make its decisions.`, `If two services must always change and deploy together, they are one service.`, `Too many tiny services (nanoservices) give you the costs of distribution without the benefits.`])],
    ['Communication', TBL(['Style', 'Use for', 'Watch out for'], [['Synchronous (REST/gRPC)', 'Queries needing an immediate answer', 'Chains of calls multiply latency and failure; use timeouts and breakers'], ['Asynchronous (events/queues)', 'Notifying others of facts; long workflows', 'Eventual consistency, ordering, duplicate events']])],
    ['Service discovery', PP(`Instances come and go, so services find each other through a registry (Consul, etcd, Kubernetes DNS) or a service mesh. Client-side discovery lets the caller pick an instance; server-side discovery puts a load balancer in front.`)],
    ['Advice', PP(`Most products should start as a well-modularized monolith and extract services when a clear need appears: a team boundary, a component with very different scaling needs, or a part with different reliability or security requirements. Amazon, Netflix and Uber moved to microservices to let hundreds of teams ship independently, not because monoliths were slow.`)]
  ],
  qs: [SQ('Why should microservices not share one database schema?', ['Databases can’t handle it', 'Shared tables couple services: one team’s schema change breaks others, defeating independent deploys', 'It is slower', 'It costs more'], 1, 'Data ownership is what makes services independently deployable.')]
});

SDX('auth', { name: 'Authentication & authorization', cat: 'sdarch',
  blurb: `Authentication proves who a user is; authorization decides what they may do. Modern systems delegate login to an identity provider with OAuth 2.0 and OpenID Connect, then pass short-lived signed tokens (JWTs) that every service can verify without a database lookup.`,
  facts: [['AuthN', 'Who are you?'], ['AuthZ', 'What may you do?'], ['Protocol', 'OAuth 2.0 + OIDC'], ['Tokens', 'Short-lived access + refresh']],
  dg: { w: 800, h: 290,
    n: [['u', 'Browser', 90, 215, 'client'], ['app', 'Web app', 380, 215, 'svc', 'OAuth client'], ['idp', 'Identity provider', 380, 55, 'svc', 'login · MFA · tokens'], ['api', 'Orders API', 680, 215, 'svc', 'verifies JWT']],
    e: [['u', 'app', '1 · sign in'], ['u', 'idp', '2 · log in, consent'], ['idp', 'app', '3 · code → tokens', '', 'tok'], ['app', 'api', '4 · Bearer token'], ['idp', 'api', 'public keys (JWKS)', 'd', 'jwks']] },
  cap: `The OAuth 2.0 authorization-code flow with OpenID Connect: the user logs in at the identity provider, the app exchanges a one-time code for tokens, and APIs verify the token’s signature locally.`,
  walk: [[['u', 'app', 'u>app'], `The user clicks “Sign in”. The app redirects the browser to the identity provider with its client ID, requested scopes and a PKCE challenge.`],
    [['u', 'idp', 'u>idp'], `The user authenticates at the provider (password, passkey, MFA). The app never sees the password.`],
    [['idp', 'app', 'tok'], `The provider redirects back with a one-time authorization code, which the app exchanges (with the PKCE verifier) for an ID token (who the user is), a short-lived access token and a refresh token.`],
    [['app', 'api', 'app>api'], `The app calls APIs with Authorization: Bearer &lt;access token&gt;.`],
    [['idp', 'api', 'jwks'], `The API verifies the JWT’s signature with the provider’s published public keys and checks expiry, audience and scopes, with no call to the provider per request. Then it applies authorization rules: may this user read this order?`]],
  sections: [
    ['Sessions vs tokens', TBL(['', 'Server sessions', 'Signed tokens (JWT)'], [['Where state lives', 'Session store (Redis); browser holds a random ID cookie', 'Inside the token, signed by the issuer'], ['Validation', 'Look up the session ID', 'Verify signature locally'], ['Revocation', 'Delete the session: instant', 'Hard until expiry: keep tokens short-lived (5–15 min), use refresh tokens and deny lists'], ['Best for', 'Classic web apps', 'APIs, microservices, mobile']])],
    ['OAuth 2.0 and OpenID Connect', UL([`OAuth 2.0 is for delegated authorization: an app gets a token to act on a user’s behalf with limited scopes.`, `OpenID Connect adds authentication on top: an ID token describing the user.`, `Use the authorization-code flow with PKCE for web and mobile apps; the client-credentials flow for service-to-service calls.`, `The implicit flow and password grant are deprecated.`])],
    ['Authorization models', TBL(['Model', 'Idea', 'Example'], [['RBAC', 'Permissions attached to roles', 'admin, editor, viewer'], ['ABAC', 'Rules on attributes of user, resource and context', 'Managers can approve expenses under $5,000 in their department'], ['ReBAC', 'Permissions from relationships', 'Can view a doc if member of a folder shared with your team (Google Zanzibar, OpenFGA)'], ['ACLs', 'Per-resource lists of who can do what', 'File permissions']])],
    ['Security essentials', UL([`Store passwords only as Argon2id or bcrypt hashes (see the Cryptography track).`, `HTTPS everywhere; HttpOnly, Secure, SameSite cookies; CSRF protection for cookie-based sessions.`, `Validate every token’s signature, issuer, audience and expiry; never accept unsigned (alg=none) tokens.`, `Authorize on every request at the service that owns the data, not only at the gateway.`, `Service-to-service: mutual TLS or signed service tokens, with least privilege.`])]
  ],
  qs: [SQ('Why are JWT access tokens usually short-lived?', ['They are expensive to sign', 'They can’t easily be revoked before expiry, so a stolen token should stop working soon', 'Browsers delete them', 'JWTs can’t store expiry'], 1, 'Short lifetimes plus refresh tokens limit the damage of a leaked token while keeping validation local.')]
});
