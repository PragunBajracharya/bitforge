/* ===== Beginner-first rewrites — batch 12 (concept topics: ratelimit, availability, retries, circuitbreaker, observability, deploys, microservices, auth). SDPATCH. ===== */

SDPATCH('ratelimit', {
  blurb: `A rate limiter caps how many requests a client may make in a given period (say 100 a minute). It shields your services from abuse and overload, enforces fair use and paid tiers, and stops one noisy customer from degrading everyone else. The most popular algorithm is the <b>token bucket</b>, which allows short bursts while holding a steady average.`,
  sections: [
    ['What is rate limiting?', PLAIN(`Rate limiting is putting a cap on how often someone can hit your system. Too many requests — whether from a buggy script, an abusive user, or just a popular feature — can overwhelm a service and hurt everyone. A rate limiter counts each client’s requests and, once they exceed their allowance, politely refuses the extra ones (with an HTTP <b>429 Too Many Requests</b>) until the allowance refills.`) +
      ANALOGY(`Think of a popular nightclub with a one-in-one-out policy once it’s full, and a bouncer with a clicker counter. Each guest (client) is allowed a certain rate of entries. The <b>token bucket</b> version: imagine a bucket by the door that refills with entry tokens at a steady rate; each entry takes a token. If a crowd arrives at once, they can use up the tokens sitting in the bucket (a short <i>burst</i> is fine), but once it’s empty they must wait for it to refill — so the long-run average stays capped.`)],
    ['Words you’ll need', KEYTERMS([
      ['Rate limit', 'A cap on requests per client per time window (e.g. 100/minute).'],
      ['Token bucket', 'The common algorithm: a bucket refills with tokens at a fixed rate; each request takes one; empty = denied. Allows bursts, enforces the average.'],
      ['429 / Retry-After', 'The “Too Many Requests” response and a hint for how long to wait before retrying.'],
      ['Burst', 'A short spike of requests allowed because tokens had accumulated — e.g. a page loading 20 images at once.'],
      ['Fail open / fail closed', 'If the limiter’s store is down: allow requests (open, favour availability) or deny them (closed, favour protection).']])],
    ['The algorithms', TBL(['Algorithm', 'How', 'Catch'], [
      ['Token bucket', 'A refilling bucket of tokens; one per request', 'The usual choice — allows bursts, holds the average'],
      ['Leaky bucket', 'Requests drain at a fixed steady rate', 'Perfectly smooth, but bursts wait or drop (adds latency)'],
      ['Fixed window', 'Count per calendar minute', 'Lets ~2× through at a window boundary'],
      ['Sliding window', 'Blend current and previous window', 'Accurate and cheap (slightly approximate)']]) +
      PP(`The fixed-window trap is worth seeing: a “100/minute” fixed window lets a client send 100 at 12:00:59 and another 100 at 12:01:00 — 200 in two seconds — because those fall in two different windows. Token buckets and sliding windows avoid that.`)],
    ['Where and by what to limit', WHY(`Rate limiters usually sit at the <b>API gateway</b> (so rejected requests never reach your real servers) and keep their counts in a shared fast store (Redis) with atomic operations, so all gateway instances agree on one count per client. You limit by different keys for different reasons: <b>per user/API key</b> for fairness and pricing tiers; <b>per IP</b> for anonymous abuse (careful — many users can share one IP); <b>per endpoint</b> so expensive operations (search, login, password reset) get stricter caps. And decide the failure mode up front: if the limiter’s store goes down, do you <b>fail open</b> (allow traffic, protect availability) or <b>fail closed</b> (deny, protect the backend)?`) +
      RECAP([
        `A rate limiter caps requests per client to prevent abuse/overload, enforce fairness and tiers, and contain noisy clients; over-limit requests get <b>429</b>.`,
        `The <b>token bucket</b> is the go-to: a refilling bucket allows short bursts while holding the average; fixed windows allow double bursts at boundaries.`,
        `Run it at the <b>gateway</b> with a shared atomic counter (Redis) so all instances share one count per client.`,
        `Limit by the right key: per user/API key (fairness, tiers), per IP (abuse), per endpoint (expensive ops stricter).`,
        `Choose a failure mode — <b>fail open</b> (availability) or <b>fail closed</b> (protection) — and return Retry-After so clients back off.`])]
  ]
});

SDPATCH('availability', {
  blurb: `Availability is the fraction of time a system actually works. You raise it by removing <b>single points of failure</b>: run redundant copies of everything across independent failure domains (machines, racks, data centres, regions), fail over automatically, and hold yourself to a measured target (an <b>SLO</b>). Each extra “nine” costs roughly ten times more effort.`,
  sections: [
    ['What is availability?', PLAIN(`Availability is simply: out of all the time, how much of it is the system up and serving? It’s quoted in “nines” — 99.9% (“three nines”) allows about 8.8 hours of downtime a year; 99.99% allows about 53 minutes. You improve it by making sure no single broken thing can take the whole system down: have spares, in separate places, that take over automatically.`) +
      ANALOGY(`Think of keeping the lights on in a hospital. One power line isn’t enough — a single fault would go dark — so you add a <b>backup generator</b> (and often two), fed from independent sources, that kick in automatically. Critical equipment is duplicated and spread across different parts of the building so one fire can’t knock it all out. Availability engineering is exactly this: no single failure should be able to stop the service, so you run <b>two of everything in separate places</b>.`)],
    ['Words you’ll need', KEYTERMS([
      ['Nines', 'Shorthand for availability: 99.9% = 8.8 h/yr down, 99.99% = 53 min/yr, 99.999% = 5 min/yr.'],
      ['Single point of failure (SPOF)', 'Any one component whose failure takes down the whole system — the thing to eliminate.'],
      ['Failure domain', 'A boundary within which things fail together (a machine, a rack, a data centre/zone, a region). Spread copies across them.'],
      ['Redundancy & failover', 'Running spare copies, and automatically switching to them when one fails.'],
      ['SLI / SLO / SLA', 'A measured metric / your internal target / a contract with consequences.'],
      ['Error budget', '1 − SLO: the small amount of allowed unreliability you can “spend” on risky changes.']])],
    ['The nines (and why chains are fragile)', TBL(['Availability', 'Downtime/year', 'Typical for'], [
      ['99%', '3.65 days', 'Internal tools'],
      ['99.9%', '8.8 hours', 'Many SaaS products'],
      ['99.99%', '53 minutes', 'Payments, core platforms'],
      ['99.999%', '5.3 minutes', 'Telecom, critical infra']]) +
      WHY(`Two bits of maths shape every design. Components <b>in series multiply</b>: if a request must pass through 3 independent services each 99.9% available, the best you can do is 0.999³ ≈ 99.7% — <i>every hard dependency lowers your ceiling</i>. But redundant components <b>in parallel</b> combine the other way: two independent 99% instances give 1 − (0.01)² = 99.99% — <i>if</i> failures are truly independent and failover works. That’s the whole game: minimise serial dependencies, and add parallel redundancy across <b>independent</b> failure domains.`)],
    ['Removing single points of failure', UL([
      `Run at least <b>two of everything</b> in different zones: load balancers, app servers, databases, caches, queues.`,
      `<b>Automate failover</b> and actually test it (game days, chaos engineering) — untested failover usually doesn’t work when you need it.`,
      `Hunt <b>hidden shared dependencies</b>: a single DNS provider, one config service, one certificate expiring everywhere on the same day.`,
      `<b>Degrade gracefully</b>: serve cached or partial results when a non-critical dependency is down, rather than failing entirely.`]) +
      RECAP([
        `Availability = fraction of time the system works, quoted in <b>nines</b>; each extra nine costs ~10× more effort.`,
        `Raise it by eliminating <b>single points of failure</b> — redundant copies across independent <b>failure domains</b>, with automatic failover.`,
        `Dependencies <b>in series multiply</b> (each one lowers your ceiling); redundancy <b>in parallel</b> raises it — but only if failures are independent and failover works.`,
        `Set a measured <b>SLO</b> and use the <b>error budget</b> to balance reliability against shipping speed.`,
        `Test failover, hunt hidden shared dependencies, and degrade gracefully instead of failing hard.`])]
  ]
});

SDPATCH('retries', {
  blurb: `Remote calls fail and stall, so you need a disciplined way to cope: put a <b>timeout</b> on every call (never wait forever), <b>retry</b> transient failures — but with <b>exponential backoff and random jitter</b>, or a fleet of clients all retrying in lockstep will turn a brief blip into a self-inflicted outage.`,
  sections: [
    ['Why this needs care', PLAIN(`When one service calls another over the network, the call can fail or just hang. Two defences handle this: a <b>timeout</b> (give up waiting after, say, 300 ms, so a hung dependency doesn’t tie you up forever) and a <b>retry</b> (try again, since many failures are momentary). The subtlety is <i>how</i> you retry — do it naively and you can make a struggling service’s problems much worse.`) +
      ANALOGY(`Imagine knocking on a door that doesn’t answer. You wouldn’t stand there forever (that’s the timeout), and you’d knock again shortly (the retry). But now picture a thousand people all knocking on the same door at the exact same second, failing, and all knocking again a second later — a synchronized stampede that guarantees the door never gets a quiet moment to open. The fix is <b>jitter</b>: everyone waits a <i>random</i> extra moment, so the knocks spread out and the door can actually recover.`)],
    ['Words you’ll need', KEYTERMS([
      ['Timeout', 'The maximum time to wait for a call before giving up. Every network call needs one.'],
      ['Transient failure', 'A momentary error (overload, a blip) likely to succeed if retried — unlike a permanent one (bad request).'],
      ['Exponential backoff', 'Waiting longer between each retry (≈ double each time), so you don’t hammer a struggling service.'],
      ['Jitter', 'Adding randomness to the wait so many clients don’t retry at the same instant.'],
      ['Retry storm', 'When retries pile up and multiply load, often across layers — turning a blip into an outage.'],
      ['Idempotent', 'Safe to retry (same effect if done twice) — only retry non-idempotent operations with an idempotency key.']])],
    ['What to retry, and what not to', TBL(['Retry', 'Don’t retry'], [
      ['Timeouts, connection errors (if idempotent)', '400/401/403/404/422 — the request itself is wrong'],
      ['503 Service Unavailable, 429 (after Retry-After)', 'Non-idempotent operations without an idempotency key'],
      ['Throttling / leader-election blips', 'Errors that will obviously repeat (validation failures)']]) +
      PP(`And set timeouts from the dependency’s real latency (a bit above its p99), not an arbitrary large number — and <b>propagate deadlines</b>: if the user’s request has 300 ms left, a downstream call shouldn’t be allowed to wait 5 seconds.`)],
    ['Backoff, jitter, and avoiding retry storms', WHY(`The recommended formula is “full jitter”: wait a <b>random</b> time between 0 and a cap that doubles each attempt. This spreads retries evenly and (AWS showed) minimises total work. Cap both the maximum wait and the number of attempts (3–5). The big danger is <b>retry storms from stacking</b>: if 4 layers each retry 3 times, one user request can become 3⁴ = 81 calls to the bottom service — exactly when it’s already struggling. So retry at <b>one layer only</b> (usually closest to the user), use a <b>retry budget</b> (retries may add at most ~10% load, then fail fast), and combine with circuit breakers so a persistently-failing dependency isn’t hammered at all.`) +
      RECAP([
        `Every remote call needs a <b>timeout</b> (set from the dependency’s p99, and propagate deadlines) so a hung call can’t tie you up.`,
        `Retry only <b>transient</b> failures, and only <b>idempotent</b> operations (or use an idempotency key).`,
        `Use <b>exponential backoff with jitter</b> so clients that failed together don’t retry in synchronized waves.`,
        `Beware <b>retry storms</b> — retries stacked across layers multiply load; retry at one layer only and use a retry budget.`,
        `On final failure, <b>degrade</b> (cached data, queue, clear error) and pair retries with circuit breakers.`])]
  ]
});

SDPATCH('circuitbreaker', {
  blurb: `When a dependency is failing, continuing to call it just wastes resources and slows everyone down. A <b>circuit breaker</b> watches the failure rate and, past a threshold, “opens” to <b>fail fast</b> for a while — then lets a few trial requests through to check whether the dependency has recovered. <b>Bulkheads</b> add isolation so one sick dependency can’t drown the rest.`,
  sections: [
    ['What is a circuit breaker?', PLAIN(`A circuit breaker is a wrapper around calls to a dependency that tracks how they’re going. While things are healthy it does nothing. But once the dependency starts failing a lot, the breaker <b>trips open</b>: for a cooldown period it stops making calls entirely and instantly returns a fallback, instead of letting every caller wait on a doomed request. After the cooldown it cautiously tries a few requests to see if the dependency is back.`) +
      ANALOGY(`It’s exactly an electrical circuit breaker (or a fuse). When something downstream keeps drawing fault current, the breaker <b>trips</b> and cuts the circuit — protecting the whole house from a fire — rather than letting the fault keep burning. Later you flip it back on to test; if it trips again, there’s still a problem. In software, “the fault” is a failing service, and tripping the breaker stops your callers from piling up on calls that will just fail anyway.`)],
    ['Words you’ll need', KEYTERMS([
      ['Closed / Open / Half-open', 'The three states: closed = calls flow normally; open = fail fast, no calls; half-open = allow a few trial calls to test recovery.'],
      ['Fail fast', 'Return an error (or fallback) immediately instead of waiting on a call that will fail.'],
      ['Fallback', 'The degraded answer when the breaker is open: cached data, a default, or hiding the feature.'],
      ['Cascading failure', 'When one failing service drags down its callers (threads all stuck waiting), then theirs — the thing to prevent.'],
      ['Bulkhead', 'Isolating resources (separate connection/thread pools) so one dependency’s failure can’t exhaust everything.']])],
    ['The three states', PP(`A breaker moves between three states based on recent outcomes:`) +
      BSTEPS([
        ['Closed (normal)', PP(`Calls pass through; the breaker records successes and failures over a sliding window. If the failure rate crosses the threshold (say 50%), it opens.`)],
        ['Open (failing fast)', PP(`Calls return immediately with a fallback — no network call, no waiting. The struggling dependency gets breathing room and callers stop tying up threads.`)],
        ['Half-open (testing)', PP(`After a cooldown, a few trial calls are allowed. If they succeed, the breaker closes and traffic resumes; if one fails, it opens again for another cooldown.`)]])],
    ['Why fail fast, and bulkheads', WHY(`Here’s the disaster a breaker prevents. Say a recommendations service is down and each call waits 2 seconds to time out. At 1,000 requests/second, the caller soon has ~2,000 threads all stuck waiting — it runs out of threads and fails too, and the failure <b>cascades</b> upstream. A breaker turns those 2-second failures into instant ones and lets the page render without recommendations. <b>Bulkheads</b> add a second layer of protection, named after a ship’s watertight compartments: give each dependency its own fixed-size connection/thread pool, so a slow payments API can only exhaust <i>its own</i> pool, never the threads needed to serve the product page.`) +
      RECAP([
        `A circuit breaker stops calling a failing dependency (fails fast with a <b>fallback</b>) so callers don’t pile up on doomed calls.`,
        `Three states: <b>closed</b> (normal, counting failures), <b>open</b> (fail fast during cooldown), <b>half-open</b> (a few trial calls to test recovery).`,
        `It prevents <b>cascading failure</b> — without it, waiting threads pile up and the caller fails too, spreading upstream.`,
        `<b>Bulkheads</b> isolate resources (separate pools per dependency/tenant) so one failure can’t exhaust everything.`,
        `Pair with timeouts, fallbacks, and load shedding; libraries (Resilience4j, Polly, Envoy) provide breakers without custom code.`])]
  ]
});

SDPATCH('observability', {
  blurb: `You can’t fix what you can’t see. The three signals work together: <b>metrics</b> tell you <i>that</i> something is wrong, <b>traces</b> show <i>where</i> in a chain of services it’s wrong, and <b>logs</b> explain <i>why</i>. Good alerts fire on the symptoms users actually feel, and wake the right person with something actionable.`,
  sections: [
    ['What is observability?', PLAIN(`Observability is your ability to understand what a running system is doing from the outside — crucial when something breaks at 3am across a dozen services. It rests on three kinds of signal. <b>Metrics</b> are cheap numbers over time (request rate, error rate, latency) — great for dashboards and alerts. <b>Traces</b> follow a single request as it hops across services, showing where the time went. <b>Logs</b> are detailed event records that explain the specifics.`) +
      ANALOGY(`Think of your car. The <b>dashboard warning lights</b> (metrics) tell you <i>something</i> is wrong — the engine light is on. Plugging in the <b>diagnostic scanner</b> (traces) tells you <i>which</i> part — cylinder 3. The <b>detailed fault log</b> (logs) tells you <i>why</i> — a specific sensor reading out of range. You need all three: the light alone won’t fix the car, and reading every sensor log without the warning light would be hopeless.`)],
    ['Words you’ll need', KEYTERMS([
      ['Metrics', 'Numeric time series (counters, latency histograms). Cheap, perfect for dashboards and alerts; no per-request detail.'],
      ['Logs', 'Timestamped records of individual events. Rich detail, but expensive at volume.'],
      ['Traces & spans', 'A trace follows one request across services; each timed step is a span, tied together by a shared trace ID.'],
      ['Trace ID', 'An identifier attached to a request at the edge and passed to every downstream call, so you can correlate all its signals.'],
      ['SLO burn / alert', 'An alert that fires when you’re using up your error budget too fast.'],
      ['The golden signals', 'Latency, traffic, errors, saturation — the core things to measure per service.']])],
    ['The three signals compared', TBL(['Signal', 'Tells you', 'Strength', 'Cost'], [
      ['Metrics', 'That something is wrong', 'Cheap, fast, great for alerts', 'No per-request detail'],
      ['Traces', 'Where (which service/step)', 'Pinpoints latency and errors in a request', 'Usually sampled (e.g. 1% + all errors)'],
      ['Logs', 'Why (the specifics)', 'Rich debugging context', 'Expensive at volume; sample/tier']]) +
      PP(`They connect through one <b>trace ID</b>: a request gets one at the edge, carries it to every service, and tags its metrics, spans and logs with it — so from an alert you can jump to the slow traces and then read those exact requests’ logs.`)],
    ['Alerting well', WHY(`The classic mistake is alerting on <b>causes</b> (“CPU at 80%!”) instead of <b>symptoms users feel</b> (“5% of checkouts are failing”). CPU being high might be totally fine; a failing checkout never is. So alert on user-facing SLOs (error rate, latency, SLO burn-rate), make every page urgent and actionable with a runbook, and send everything non-urgent to dashboards or tickets rather than someone’s pager. A concrete flow: an SLO burn alert fires → the on-call opens the dashboard → finds slow <b>traces</b> → sees the time is spent in the payment call → reads that span’s <b>logs</b> → “payment provider certificate expired.” Three signals, minutes to root cause.`) +
      RECAP([
        `Observability = understanding a running system from outside, via three signals: <b>metrics</b> (that it’s wrong), <b>traces</b> (where), <b>logs</b> (why).`,
        `<b>Metrics</b> are cheap and drive dashboards/alerts; <b>traces</b> follow one request across services; <b>logs</b> give detail — all tied by a shared <b>trace ID</b>.`,
        `Measure the <b>golden signals</b> (latency, traffic, errors, saturation) plus business metrics.`,
        `Alert on <b>user-facing symptoms</b> (SLO burn), not every cause; every page should be urgent, actionable, and have a runbook.`,
        `Correlating signals by trace ID takes you from “something’s wrong” to root cause in minutes.`])]
  ]
});

SDPATCH('deploys', {
  blurb: `Most outages are caused by changes. Safe deployment strategies release a new version <b>gradually</b>, watch the metrics, and roll back automatically — so a bad release affects a few users for a few minutes instead of everyone all at once. The key techniques are rolling, blue-green and canary deploys, plus feature flags.`,
  sections: [
    ['Why deployment strategy matters', PLAIN(`If most outages come from changes, then <i>how</i> you ship changes is a reliability decision. Rather than swap the whole system to a new version at once (and pray), safe strategies expose the new version to a <b>small slice</b> of traffic first, compare its health against the old version, and either expand gradually or roll back automatically. The goal: when a release is bad — and some will be — only a few users notice, briefly.`) +
      ANALOGY(`It’s the <b>canary in the coal mine</b>. Miners didn’t send everyone into a possibly-toxic shaft at once — they sent a canary first, and watched it. If the canary was fine, they proceeded; if not, they got out, with no one harmed. A <b>canary deploy</b> sends 5% of traffic to the new version and watches its error and latency metrics; healthy → expand to 25%, 50%, 100%; unhealthy → shift that traffic straight back to the old version.`)],
    ['Words you’ll need', KEYTERMS([
      ['Rolling deploy', 'Replace instances a batch at a time; cheap, but old and new versions run mixed during the rollout.'],
      ['Blue-green', 'Run a full second environment on the new version, then switch all traffic at once — instant rollback by switching back.'],
      ['Canary', 'Send a small % of traffic to the new version first, watch metrics, then expand or roll back.'],
      ['Feature flag', 'Ship code “off,” then enable it per user or percentage later — decoupling deploying from releasing.'],
      ['Rollback', 'Reverting to the previous version when metrics go bad (ideally automatic on SLO breach).'],
      ['Expand–migrate–contract', 'The pattern for zero-downtime database changes so old and new code both work during a rollout.']])],
    ['The strategies', TBL(['Strategy', 'How', 'Rollback', 'Cost'], [
      ['Rolling', 'Replace instances batch by batch', 'Roll forward/back gradually', 'Cheap; versions mixed mid-rollout'],
      ['Blue-green', 'Full new environment, switch the router', 'Switch back instantly', '2× capacity during the switch'],
      ['Canary', 'Small slice first, expand on good metrics', 'Shift the slice back', 'Needs good metrics + routing'],
      ['Feature flags', 'Ship off, enable per user/%', 'Turn the flag off', 'Flag cleanup later']])],
    ['Database changes without downtime', WHY(`The trickiest part of a gradual rollout is the <b>database</b>, because old and new code run <i>at the same time</i> and must share one schema. You can’t just rename a column. The safe recipe is <b>expand–migrate–contract</b>: (1) <b>expand</b> — add the new column/table as nullable, removing nothing; (2) deploy code that writes both old and new shapes; (3) <b>backfill</b> existing rows in batches; (4) switch reads to the new shape; (5) <b>contract</b> — stop writing the old shape, then drop it in a <i>later</i> release. Every intermediate step is compatible with both versions, so a rollback is always safe. And generally: small, frequent deploys beat big rare ones (fewer changes to blame), automate rollback on SLO breach, and roll out one zone/region at a time.`) +
      RECAP([
        `Most outages come from changes, so release <b>gradually</b>, watch metrics, and roll back fast.`,
        `<b>Rolling</b> (batch by batch), <b>blue-green</b> (switch environments, instant rollback), <b>canary</b> (small slice first, expand on good metrics).`,
        `<b>Feature flags</b> separate deploying code from releasing a feature — enable per user/% and toggle off instantly.`,
        `Change databases with <b>expand–migrate–contract</b> so old and new code share one schema safely throughout.`,
        `Prefer small frequent deploys, automate rollback on SLO breach, and progress one failure domain at a time.`])]
  ]
});

SDPATCH('microservices', {
  blurb: `A <b>monolith</b> is one deployable application; <b>microservices</b> split a system into small services that each own their data and deploy independently. Microservices let many teams move independently — at the cost of network calls between services, data split across many databases, and a lot more operational complexity. Most products should start as a well-organised monolith.`,
  sections: [
    ['What is the choice?', PLAIN(`You can build a system as one big application (a <b>monolith</b>) where all the features share one codebase and one database, or split it into many small <b>microservices</b>, each owning a slice of the functionality and its own data, talking over the network. The monolith is simpler to build and reason about; microservices let separate teams develop, deploy and scale their parts independently — but introduce the hard problems of distributed systems.`) +
      ANALOGY(`Think of a restaurant. A <b>monolith</b> is one big kitchen where every chef shares the same stoves, fridge and pantry — simple to coordinate when the team is small, but everyone trips over each other as it grows, and you can’t renovate one station without closing the whole kitchen. <b>Microservices</b> are like a food hall of independent stalls, each with its own kitchen and supplies: a pizza stall and a sushi stall can renovate, restock and scale up on their own schedules — but now they must coordinate across the hall, and a shared walkway problem can affect everyone.`)],
    ['Words you’ll need', KEYTERMS([
      ['Monolith', 'One deployable app; features share a codebase and a database. Calls are in-process; transactions span everything.'],
      ['Microservice', 'A small independently-deployable service owning its own data and exposing an API.'],
      ['Data ownership', 'The core rule: each service owns its database; others never read its tables, only call its API or react to its events.'],
      ['Service boundary', 'Where you split — by business capability/domain, not by technical layer.'],
      ['Synchronous vs async', 'Services talk by direct calls (REST/gRPC) for immediate answers, or by events/queues for notifications and workflows.'],
      ['Service discovery', 'How services find each other’s changing instances (a registry or service mesh).']])],
    ['Monolith vs microservices', TBL(['', 'Monolith', 'Microservices'], [
      ['Deploys', 'All or nothing', 'Independent, frequent'],
      ['Scaling', 'Whole app together', 'Per service'],
      ['Data', 'One DB — joins & transactions', 'Per-service DBs — eventual consistency, sagas'],
      ['Failure', 'A bug can crash everything', 'Partial failures, cascading timeouts to manage'],
      ['Best for', 'Small teams, simpler systems', 'Many teams needing autonomy'],
      ['Operations', 'Low', 'High (discovery, tracing, CI/CD per service)']])],
    ['Drawing boundaries, and when to split', WHY(`The rule that makes microservices work is <b>data ownership</b>: each service owns its data and others reach it only through its API or events — because the moment two services share a database schema, one team’s change breaks another, and you’ve lost the independent-deploy benefit that justified the split. Draw boundaries by <b>business capability</b> (payments, catalog, shipping), not technical layers; a service should own all the data it needs to make its decisions; and if two services must always change and deploy together, they’re really one service. The honest advice: <b>start as a well-modularised monolith</b> and extract a service only when there’s a clear reason — a team boundary, a part with very different scaling needs, or different reliability/security requirements. Amazon and Netflix moved to microservices to let <i>hundreds</i> of teams ship independently, not because monoliths were slow.`) +
      RECAP([
        `A <b>monolith</b> is one app with one database (simple); <b>microservices</b> are many small services, each owning its data and deploying independently.`,
        `Microservices buy team/scaling independence at the cost of network calls, split data (no cross-DB joins/transactions), and heavy operations.`,
        `The enabling rule is <b>data ownership</b>: never share databases across services — only APIs and events.`,
        `Draw boundaries by <b>business domain</b>, not technical layer; services that always change together are one service.`,
        `Start with a modular <b>monolith</b> and extract services only for a clear reason (team, scaling, or reliability/security need).`])]
  ]
});

SDPATCH('auth', {
  blurb: `<b>Authentication</b> proves <i>who</i> a user is; <b>authorization</b> decides <i>what</i> they’re allowed to do. Modern systems delegate login to an <b>identity provider</b> using OAuth 2.0 / OpenID Connect, then pass short-lived <b>signed tokens</b> (JWTs) that every service can verify on its own, without a database lookup per request.`,
  sections: [
    ['Two different questions', PLAIN(`These two words are constantly confused but mean different things. <b>Authentication (AuthN)</b> answers “who are you?” — proving identity, by password, passkey, or multi-factor. <b>Authorization (AuthZ)</b> answers “what may you do?” — deciding whether <i>this</i> identity is allowed <i>this</i> action. You authenticate once; you authorize on every sensitive action.`) +
      ANALOGY(`Think of a hotel. <b>Authentication</b> is checking in at the front desk with your ID — they confirm you are who you say. <b>Authorization</b> is what your <b>keycard</b> then opens: your own room, yes; the gym, yes; other guests’ rooms or the manager’s office, no. The same card (token) encodes what you’re permitted to do, and each door (service) checks it. Logging in once and getting a keycard that many doors can independently check is exactly how OAuth tokens work.`)],
    ['Words you’ll need', KEYTERMS([
      ['Authentication (AuthN)', 'Proving who the user is (password, passkey, MFA).'],
      ['Authorization (AuthZ)', 'Deciding what the authenticated user may do.'],
      ['Identity provider (IdP)', 'The service that handles login and issues tokens (e.g. Google, Okta, Auth0) — your app never sees the password.'],
      ['OAuth 2.0 / OpenID Connect', 'The standard protocols: OAuth for delegated access, OIDC adds “who the user is.”'],
      ['JWT (signed token)', 'A token carrying the user’s identity/claims, cryptographically signed so any service can verify it locally.'],
      ['Access vs refresh token', 'A short-lived access token used on each request, plus a longer-lived refresh token to get new ones.'],
      ['RBAC / ABAC', 'Authorization models: by role (admin/editor/viewer) or by attributes/rules (department, amount, context).']])],
    ['Sessions vs tokens', TBL(['', 'Server sessions', 'Signed tokens (JWT)'], [
      ['Where state lives', 'In a session store; browser holds a random ID', 'Inside the token itself, signed'],
      ['To validate', 'Look up the session ID', 'Verify the signature locally — no lookup'],
      ['Revocation', 'Delete the session (instant)', 'Hard before expiry → keep tokens short-lived + refresh tokens'],
      ['Best for', 'Classic web apps', 'APIs, microservices, mobile']]) +
      PP(`The token approach is popular for microservices because each service can verify a request’s token with the provider’s public key <b>locally</b>, with no database or network call per request — but that’s also why tokens are kept short-lived (you can’t easily cancel one early).`)],
    ['How OAuth login flows, and authorization models', WHY(`The modern login flow (OAuth 2.0 authorization-code with PKCE + OpenID Connect): the user clicks “sign in” → the app redirects to the <b>identity provider</b> → the user authenticates there (the app never sees the password) → the provider hands back a one-time code the app swaps for an <b>ID token</b> (who the user is), a short-lived <b>access token</b>, and a <b>refresh token</b> → the app calls APIs with the access token → each API <b>verifies the token’s signature</b> with the provider’s public keys and checks expiry/audience/scopes, then applies <b>authorization</b> rules. Those rules follow a model: <b>RBAC</b> (permissions by role), <b>ABAC</b> (rules on attributes — “managers can approve expenses under $5,000 in their department”), or relationship-based (“can view this doc if it’s shared with your team”). Crucial habit: authorize on <b>every</b> request at the service that owns the data, not just at the gateway.`) +
      RECAP([
        `<b>Authentication</b> = who you are (login, MFA); <b>authorization</b> = what you may do. Authenticate once, authorize on every sensitive action.`,
        `Delegate login to an <b>identity provider</b> via OAuth 2.0 + OpenID Connect; your app never handles the password.`,
        `After login, services get a short-lived <b>signed token (JWT)</b> they verify <b>locally</b> with the provider’s public key — no per-request lookup.`,
        `Tokens are kept short-lived (hard to revoke early) and refreshed; server sessions are the easily-revoked alternative for classic web apps.`,
        `Apply an authorization model (<b>RBAC/ABAC</b>) and enforce it at the service that owns the data, not only at the gateway.`])]
  ]
});
