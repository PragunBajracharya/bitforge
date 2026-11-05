/* ===== Beginner-first rewrites — batch 13 (concept topics: servicediscovery, distlock, deepdive-fail, deepdive-scale). SDPATCH. ===== */

SDPATCH('servicediscovery', {
  blurb: `In a busy system, copies of a service are constantly starting, stopping and moving (autoscaling, deploys, crashes), so their network addresses keep changing. <b>Service discovery</b> is how one service finds a <i>healthy</i> instance of another to call — without anyone hardcoding IP addresses that would be wrong minutes later.`,
  sections: [
    ['What problem is this?', PLAIN(`When you run many copies (instances) of a service, and those copies come and go all the time, how does a caller know which address to send a request to? Hardcoding an IP won’t work — it changes. Service discovery solves exactly this: it keeps a live <b>registry</b> of which instances exist and which are healthy, so a caller can always get a working address for “the orders service” right now.`) +
      ANALOGY(`It’s like a company phone directory that updates itself. People join, leave and change desks constantly, so you don’t memorise someone’s extension — you look them up in the directory, which is kept current (and marks who’s actually at their desk today). Service discovery is that directory for services: instances <b>add themselves</b> when they start, <b>remove themselves</b> when they stop, and health checks cross off any that have gone dark — so a lookup always returns someone who’ll actually answer.`)],
    ['Words you’ll need', KEYTERMS([
      ['Instance', 'One running copy of a service. A service usually has many, and the set changes constantly.'],
      ['Service registry', 'The live directory of which instances exist and are healthy (Consul, etcd, Eureka, or Kubernetes’ built-in).'],
      ['Register / deregister', 'An instance adds itself to the registry on startup and removes itself on shutdown.'],
      ['Health check / heartbeat', 'The registry probes instances (or they report “I’m alive”); failing ones are removed.'],
      ['Client-side discovery', 'The caller asks the registry for instances and picks one itself.'],
      ['Server-side discovery', 'The caller hits a stable address (a load balancer or Kubernetes Service) that looks up and forwards for it.']])],
    ['How it works, and the two styles', PP(`Instances <b>register</b> on startup and <b>deregister</b> on shutdown; the registry continuously <b>health-checks</b> them (or expires any whose heartbeat stops), so callers only ever receive live targets. That’s what lets a system autoscale and self-heal with no manual reconfiguration. There are two ways a caller uses it:`) +
      TBL(['', 'Client-side discovery', 'Server-side discovery'], [
        ['Who picks the instance', 'The caller (asks registry, chooses one)', 'A load balancer / proxy / k8s Service'],
        ['Client complexity', 'Every client needs discovery logic', 'Clients stay simple'],
        ['Cost', 'No extra hop, but coupled to the registry', 'One extra hop; the LB is a dependency'],
        ['Typical of', 'Netflix Eureka + Ribbon', 'Kubernetes (very common)']]) +
      WHY(`A common middle ground is <b>DNS-based</b> discovery: the service name resolves to the current instance addresses, so clients just use ordinary DNS while the platform keeps the records fresh (this is how Kubernetes Services work, via CoreDNS). Whatever the style, the registry is <b>critical infrastructure</b> — it’s run as a consensus-backed cluster (etcd/Consul) so discovery itself doesn’t become a single point of failure, and lookups are cached briefly on the client so a registry blip or a mass-restart “registration storm” doesn’t overwhelm it.`) +
      RECAP([
        `Service instances come and go, so service discovery maps a service <b>name</b> to a currently <b>healthy instance</b> — no hardcoded IPs.`,
        `A <b>registry</b> tracks instances; they <b>register/deregister</b>, and <b>health checks/heartbeats</b> remove dead ones, enabling autoscaling and self-healing.`,
        `<b>Client-side</b> discovery: the caller queries the registry and picks (fast, but every client needs the logic). <b>Server-side</b>: a load balancer/Service does it (simple clients, extra hop).`,
        `<b>DNS-based</b> discovery (e.g. Kubernetes Services) is a common blend.`,
        `The registry is critical — run it as a consensus-backed cluster and cache lookups so it isn’t a single point of failure.`])]
  ]
});

SDPATCH('distlock', {
  blurb: `When processes on <b>different machines</b> must take turns on a shared resource, a normal in-memory lock is useless (there’s no shared memory). A <b>distributed lock</b> grants one holder at a time across the whole cluster — but it has sharp edges (expiry, pauses, fencing) that make it something to use carefully, and usually to avoid.`,
  sections: [
    ['What is a distributed lock?', PLAIN(`A regular lock (mutex) works because threads share one program’s memory. Across many machines there’s no shared memory, so to make sure only one process does something at a time — run a job once, or elect a single leader — you need a lock backed by an <b>external store everyone agrees on</b> (Redis, ZooKeeper, etcd). It must survive the holder <b>crashing</b> (so it carries a time limit that auto-releases it) and must only be releasable by its real <b>owner</b> (so a confused process can’t free someone else’s lock).`) +
      ANALOGY(`Think of a “talking stick” shared across several rooms in different buildings: whoever holds it may speak, and only one stick exists. To stop someone who grabbed the stick and then vanished from holding it forever, the stick is on a <b>timer</b> — if they don’t renew it, it’s released. The danger: if the holder merely <i>froze</i> (didn’t vanish) past the timer, the stick gets handed to someone else, and now <b>two people think they hold it</b> and talk over each other. Fixing that needs numbered tickets (fencing tokens) that the room checks.`)],
    ['Words you’ll need', KEYTERMS([
      ['Mutual exclusion', 'Only one holder at a time — the whole point of a lock.'],
      ['TTL / lease', 'A time limit on the lock so a crashed holder can’t keep it forever (auto-expires).'],
      ['Ownership token', 'A unique value proving who holds the lock, so only the owner can release it.'],
      ['Fencing token', 'A monotonically increasing number handed out with each grant; the protected resource rejects writes carrying an older one.'],
      ['GC pause / stall', 'A holder freezing (garbage collection, network stall) past the TTL — the scenario that causes two holders.'],
      ['Efficiency vs correctness lock', 'A lock that just avoids duplicate work (occasional double-run is fine — TTL enough) vs one that must never allow two holders (needs fencing).']])],
    ['The dangerous edge, and why to avoid locks', WHY(`The subtle, data-corrupting failure: holder A takes a lock with a 10-second TTL, then suffers a <b>garbage-collection pause</b> or network stall for 12 seconds. The lock <b>expires</b> at 10s while A is frozen, holder B legitimately acquires it, and at 12s A wakes up <i>still believing it holds the lock</i> — now two processes act on the resource at once. No TTL value prevents this, because you can’t tell “A crashed” from “A is paused and about to wake.” The only robust fix is a <b>fencing token</b>: each grant includes an ever-increasing number, and the resource <b>records the highest it’s seen and rejects any lower one</b>, so A’s stale write is refused.`) +
      PP(`Because they’re this tricky — and the lock service is an extra dependency and bottleneck — the best advice is to <b>avoid distributed locks</b> where you can. Prefer: make operations <b>idempotent</b> (safe to run twice, so you don’t need exclusivity); use the database’s <b>atomic operations</b> (conditional <code>UPDATE … WHERE</code>, unique constraints, compare-and-set); or <b>partition</b> work so each key is owned by exactly one worker. Reserve real distributed locks for genuine needs like <b>leader election</b> or a <b>single-runner</b> scheduled job — and then use a battle-tested, consensus-backed system (ZooKeeper/etcd) with fencing.`) +
      RECAP([
        `A distributed lock gives one holder at a time across machines, backed by an external store (Redis/ZooKeeper/etcd).`,
        `It needs a <b>TTL</b> (so a crashed holder doesn’t lock forever) and an <b>ownership token</b> (so only the owner releases it).`,
        `A TTL handles crashes but <b>not pauses</b>: a stall past the TTL lets two processes hold the lock — fix correctness with a <b>fencing token</b> the resource enforces.`,
        `Locks are hard and add a dependency/bottleneck, so <b>avoid them</b> via idempotency, atomic DB operations, or partitioning.`,
        `Reserve them for leader election / single-runner jobs, using a consensus-backed system plus fencing.`])]
  ]
});

SDPATCH('deepdive-fail', {
  blurb: `Interviewers (and real on-call shifts) push on “what happens if X goes down?” — because understanding failure modes, not just the happy path, is what separates a robust design from a fragile one. This collects the most common failures — cache down, cache stampede, queue unavailable, duplicate messages, database failover, replication lag, partial failures — with the standard playbook for each.`,
  sections: [
    ['Why design for failure?', PLAIN(`It’s easy to design the “happy path” where everything works. But at scale, something is <b>always</b> broken — a cache node dies, a queue hiccups, a database primary fails over, one of ten downstream services is slow. A good design assumes this and has an answer for each case: it <b>bends</b> (degrades, retries, serves stale) instead of <b>breaking</b> (cascading into a full outage). This topic is the catalogue of the usual failures and their standard responses.`) +
      ANALOGY(`It’s a <b>fire drill</b> for your system. You don’t wait for a real fire to discover the exits are locked — you walk through “what if the kitchen catches fire? what if the main stairwell is blocked?” in advance, and agree the plan. Here the “fires” are specific component failures, and each has a rehearsed response so that when it happens for real, the system calmly reroutes instead of panicking.`)],
    ['Words you’ll need', KEYTERMS([
      ['Fall through', 'When the cache is down, reads go straight to the database — which may now take load it was shielded from.'],
      ['Cache stampede', 'A hot key expires and thousands of requests hit the database to rebuild it at once.'],
      ['Request coalescing (single-flight)', 'Letting only one request rebuild a given key while the rest wait or get stale — the stampede fix.'],
      ['Idempotent consumer', 'A message handler safe to run twice — essential because queues deliver at-least-once.'],
      ['Failover', 'Promoting a replica to primary when the database primary dies (a brief write-unavailable window).'],
      ['Graceful degradation', 'Serving stale or partial results when a dependency fails, instead of failing entirely.']])],
    ['The common failures and their playbook', PP(`<b>Cache goes down:</b> the danger isn’t the miss, it’s the <b>database suddenly taking the full load</b> the cache was absorbing — so protect the DB with request coalescing, rate-limiting the fallback, and serving stale data, and run the cache as a cluster so losing one node isn’t total. <b>Cache stampede</b> (a hot key expires): let one request rebuild it while others wait (single-flight), refresh early, and jitter TTLs so keys don’t all expire together.`) +
      PP(`<b>Queue unavailable:</b> don’t let it take the whole request path down — decouple so the core write succeeds and the event is buffered or best-effort. <b>Duplicate messages</b> are inevitable with at-least-once delivery, so make consumers <b>idempotent</b> (dedupe by message ID, or use naturally idempotent effects like upserts).`) +
      PP(`<b>Database primary fails:</b> a replica is <b>promoted</b> (a brief write-unavailable window; sync vs async replication decides whether the last writes survive). <b>Replication lag</b> means a read replica can be stale, so a user may not see their own just-made change — fix with <b>read-your-writes</b> (read from the primary briefly after writing). <b>Partial failures</b> (one downstream slow/down) are contained with <b>timeouts, retries with backoff+jitter, circuit breakers, bulkheads,</b> and <b>sagas</b> for multi-step work.`) +
      WHY(`The thread running through all of these: a cache is a <b>performance optimization, not a source of truth</b>, so correctness must survive without it; queues deliver <b>at-least-once</b>, so idempotency is the universal safety tool; and auxiliary systems must be <b>decoupled</b> so their outage degrades a feature rather than taking down the whole request. Design so the system sheds load and serves something, rather than cascading to zero.`) +
      RECAP([
        `Assume something is always broken; a good design <b>degrades</b> rather than cascading into a full outage.`,
        `<b>Cache down</b> → shield the DB (coalescing, rate-limit, stale, clustered cache); <b>stampede</b> → single-flight rebuild + jittered TTLs.`,
        `<b>Queue down</b> → decouple so core writes still succeed; <b>duplicate messages</b> → idempotent consumers (dedupe keys / upserts).`,
        `<b>Primary fails</b> → failover a replica (brief write gap); <b>replication lag</b> → read-your-writes; <b>partial failures</b> → timeouts, retries+jitter, breakers, bulkheads, sagas.`,
        `Universal tools: treat caches as non-authoritative, make everything <b>idempotent</b>, and <b>decouple</b> auxiliary systems.`])]
  ]
});

SDPATCH('deepdive-scale', {
  blurb: `The other half of the “what happens if” questions is about <b>scale and change</b>: one partition or key getting hammered, a sudden 10× traffic spike, migrating data while the system stays live, keeping messages in order, and holding millions of connections. These test whether your design <b>bends</b> under pressure instead of breaking.`,
  sections: [
    ['What are these questions really testing?', PLAIN(`“What if this one key goes viral?” “What if traffic suddenly 10×s?” “How do you change the database without downtime?” These probe whether your design has <b>headroom and escape hatches</b> — whether it can absorb, buffer, shed, and reshape load — rather than having one rigid happy path that shatters the moment reality gets lumpy.`) +
      ANALOGY(`It’s <b>stress-testing a bridge</b>. A bridge that only works under perfectly even traffic is dangerous; a good one handles a truck parked on one spot (a hot key), rush-hour surges (10× traffic), and even being <b>repaired while cars keep crossing</b> (a live migration). The design questions here are the engineer asking “show me it bends and holds, not that it looks fine on a calm day.”`)],
    ['Words you’ll need', KEYTERMS([
      ['Hot partition', 'One shard getting disproportionate load because the partition key spreads unevenly (e.g. sharding by date).'],
      ['Hot key / celebrity problem', 'A single key (a viral post, a megastar user) getting huge traffic — sharding can’t help one key.'],
      ['Load shedding', 'Deliberately rejecting or queuing excess work to protect the core when overloaded.'],
      ['Live migration (expand-contract)', 'Changing schema/store with zero downtime via dual-write → backfill → verify → cutover → drop old.'],
      ['Per-key ordering', 'Keeping events for one key in order by routing them to one partition with a sequence number (global ordering is avoided).'],
      ['Backpressure', 'Signalling producers to slow down when the system can’t keep up, instead of collapsing.']])],
    ['Hot keys, spikes, and live change', PP(`<b>Hot partition:</b> caused by an uneven key — fix by choosing a high-cardinality, evenly-distributed key (hash or composite). <b>Hot key/celebrity:</b> one specific key no sharding can split — mitigate by <b>replicating</b> it and reading any copy, a <b>local/edge cache</b> in front, <b>splitting</b> the value (a counter into N sub-counters summed on read), or a <b>separate path</b> for celebrities (the fan-out-on-read trick from the feed design).`) +
      PP(`<b>Sudden 10× traffic:</b> the question is <i>what breaks first</i> — usually the database or a stateful component, since stateless tiers autoscale (with lag) but data stores don’t. Levers: <b>cache/CDN</b> to absorb reads, <b>queues</b> to buffer writes (accept fast, process async), <b>load shedding/rate limiting</b> to protect the core, and <b>graceful degradation</b> (turn off expensive features, serve stale). Protect the database specifically, and make sure a spike <b>sheds load</b> rather than cascading.`) +
      PP(`<b>Live migration</b> uses <b>expand-contract with dual writes</b>: write to both old and new, backfill history, verify they match, shift reads behind a flag, then drop the old — zero downtime, reversible at each step. <b>Ordering</b> is kept <b>per key</b> (route a key’s events to one partition with a sequence number), never globally. <b>Millions of connections</b> are held by many stateless <b>gateway</b> nodes plus a <b>registry</b> (user→gateway) and a <b>pub/sub</b> layer to fan a message to the right gateway.`) +
      WHY(`The senior instinct these questions reward: name the <b>likely first bottleneck</b> (usually the stateful layer), and show the system <b>bends</b> — absorbs with caches, buffers with queues, sheds with rate limits, degrades features — instead of breaking. And never do a big-bang migration or rely on global ordering; both are traps that a careful design routes around with dual-writes and per-key ordering.`) +
      RECAP([
        `These questions test headroom and escape hatches — whether the design bends under pressure instead of breaking.`,
        `<b>Hot partition</b> → better key; <b>hot/celebrity key</b> → replicate, cache, split the value, or a separate path (can’t be resharded away).`,
        `<b>10× traffic</b> → name the first bottleneck (usually the DB), then absorb (cache/CDN), buffer (queues), shed (rate limit), and degrade gracefully.`,
        `<b>Live migration</b> → expand-contract with dual-write → backfill → verify → flagged cutover → drop old (zero downtime, reversible).`,
        `Keep ordering <b>per key</b> (partition + sequence), and hold millions of connections with horizontal gateways + a registry + pub/sub.`])]
  ]
});
