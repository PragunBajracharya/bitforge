/* ===== Beginner-first rewrites — batch 7 (concept topics: API design, RPC, scaling, LB, proxy, LRU, CDN). SDPATCH: prose only. ===== */

SDPATCH('apidesign', {
  blurb: `An API is the contract between the apps that call your system and the system itself — the exact set of requests they can make and what comes back. Good APIs are predictable, broken into sensible chunks (pagination), safe to retry when the network hiccups (idempotency), and versioned so you can change them without breaking everyone.`,
  sections: [
    ['What is an API, really?', PLAIN(`An <b>API</b> (application programming interface) is the menu of operations your system offers to other programs: “create an order,” “get user 42,” “list a user’s photos.” It’s a <i>contract</i> — if clients know the exact requests and responses, their code and yours can evolve independently. Designing one well is mostly about being consistent and predictable, and about surviving the messy reality that networks drop requests and clients retry them.`) +
      ANALOGY(`Think of a restaurant. The <b>menu</b> is the API: it lists exactly what you can order and how. The rules of ordering matter too — if your order gets lost and you reorder, you don’t want to be charged (or fed) twice; if the kitchen changes its recipes, regulars shouldn’t suddenly get the wrong dish. A good API is a clear menu with sensible, predictable ordering rules.`)],
    ['Words you’ll need', KEYTERMS([
      ['Endpoint', 'One callable operation, identified by a URL and an HTTP verb — e.g. GET /users/42.'],
      ['Resource', 'A “thing” the API exposes (a user, an order, a photo). REST models everything as resources you act on.'],
      ['REST', 'The common style: model the system as resources at URLs, acted on with standard verbs (GET read, POST create, PUT replace, DELETE remove).'],
      ['Pagination', 'Returning a long list in chunks (pages) instead of all at once.'],
      ['Cursor', 'A bookmark marking where the last page ended, so the next page continues from exactly there.'],
      ['Idempotent', 'An operation that, if repeated, has the same effect as doing it once — so retries are safe.'],
      ['Versioning', 'Offering /v1/, /v2/… so you can change the API without breaking existing clients.']])],
    ['REST in one table', PP(`REST gives each resource a URL and uses standard HTTP verbs to act on it. Use nouns (plural for collections), and the right status codes (2xx success, 4xx client error, 5xx server error).`) +
      TBL(['Request', 'Meaning'], [
        ['GET /v1/users/42', 'Read user 42'],
        ['GET /v1/users/42/orders?limit=20', 'List a user’s orders (a page of 20)'],
        ['POST /v1/orders', 'Create an order (server assigns the ID)'],
        ['PUT /v1/users/42', 'Replace user 42 with this new state'],
        ['DELETE /v1/orders/9', 'Delete order 9']]) +
      PP(`Keep it <b>stateless</b>: each request carries everything needed (including the auth token), so any server can handle it — which is what lets you run many identical servers.`)],
    ['Pagination: don’t return a million rows', PP(`A feed or a big list must come in pages. There are two ways, and the difference matters:`) +
      TBL(['Style', 'How', 'Trade-off'], [
        ['Offset', '?offset=40&limit=20 ("skip 40, give 20")', 'Simple and lets you jump to any page, but slow deep in the list, and items shift if new ones are inserted above'],
        ['Cursor', '?after=<bookmark>&limit=20', 'Fast at any depth and stable when new items arrive, because it continues from the last item seen — but no jumping to arbitrary pages']]) +
      WHY(`For an infinite scroll feed, use <b>cursors</b>: a cursor remembers the last item’s sort key and continues from there using an index, so it never re-scans skipped rows and never repeats or drops items when new posts appear at the top. Offset pagination gets slower the deeper you scroll and double-shows items when the list shifts.`)],
    ['Idempotency: surviving retries', PP(`When a client doesn’t hear back, it retries — but a timeout doesn’t tell it whether the server already acted. GET, PUT and DELETE are naturally idempotent (repeating them changes nothing extra). POST is not — a repeated “create order” could create two. The fix: the client sends a unique <b>Idempotency-Key</b> with the request; the server records it and, on a repeat with the same key, returns the <i>first</i> result instead of acting again. (This is exactly how payment APIs like Stripe avoid double charges.)`) +
      RECAP([
        `An API is the contract of requests clients can make — design it to be consistent and predictable.`,
        `<b>REST</b> models the system as <b>resources</b> at URLs, acted on with standard verbs and status codes; keep it <b>stateless</b>.`,
        `Return long lists in <b>pages</b>; prefer <b>cursor</b> pagination for feeds (fast and stable) over offset (slow deep, shifts under inserts).`,
        `Make writes safe to retry with <b>idempotency keys</b> for POST (GET/PUT/DELETE are already idempotent).`,
        `<b>Version</b> the API (/v1/) so you can evolve it; add fields freely, but don’t remove or rename them within a version.`])]
  ]
});

SDPATCH('rpc', {
  blurb: `REST isn’t the only way to build an API. <b>gRPC</b> gives fast, strongly-typed calls between your own internal services; <b>GraphQL</b> lets a client ask for exactly the data a screen needs in one request. Big systems often use all three — REST at the public edge, gRPC between services, GraphQL for flexible clients.`,
  sections: [
    ['Why more than one style?', PLAIN(`REST is great for public, simple APIs, but it has weak spots: internal service-to-service calls want something faster and strongly typed, and a mobile screen often needs bits of data from several places at once (where REST would mean many round trips, or one bloated response). <b>gRPC</b> and <b>GraphQL</b> each solve one of those problems, so real systems mix styles depending on who’s calling whom.`) +
      ANALOGY(`Three ways to order food. <b>REST</b> is a standard printed menu — universal, everyone understands it, works from anywhere. <b>gRPC</b> is the fast intercom between kitchen stations — terse, efficient, everyone speaks the same strict internal shorthand. <b>GraphQL</b> is telling a personal waiter “I want exactly these five things and nothing else,” and getting precisely that in one trip, no more, no less.`)],
    ['Words you’ll need', KEYTERMS([
      ['RPC', '“Remote procedure call” — making a call to another service feel like calling a normal function (you call a method, it runs elsewhere, you get a result).'],
      ['gRPC', 'A fast RPC framework using a compact binary format (Protocol Buffers) over HTTP/2, with auto-generated typed client code.'],
      ['Protocol Buffers (protobuf)', 'The compact binary message format gRPC uses — much smaller and faster to parse than JSON, defined in a .proto file.'],
      ['GraphQL', 'A query language where the client specifies exactly which fields it wants across related objects, in one request.'],
      ['Over-fetching / under-fetching', 'Getting more data than you need (wasteful) or too little (needing extra round trips). GraphQL avoids both.'],
      ['N+1 problem', 'When resolving a list of N items triggers N extra calls for a related field — a classic GraphQL pitfall, fixed by batching.']])],
    ['The three side by side', TBL(['', 'REST', 'gRPC', 'GraphQL'], [
      ['Shape', 'Resources + HTTP verbs', 'Method calls (procedures)', 'One endpoint, client writes the query'],
      ['Format', 'Usually JSON (text)', 'Protocol Buffers (binary)', 'JSON'],
      ['Speed', 'Fine', 'Fastest (compact + HTTP/2)', 'Fine'],
      ['Browser caching', 'Excellent', 'None', 'Hard'],
      ['Best for', 'Public APIs, simple CRUD', 'Service-to-service, low latency', 'Many client types with different data needs']])],
    ['When to pick which', PP(`<b>gRPC</b> shines for high-volume internal calls: binary messages are 3–10× smaller than JSON, HTTP/2 multiplexes many calls on one connection, and generated typed stubs catch mistakes at compile time. Downside: browsers can’t speak it directly (they need a proxy), and binary payloads are harder to eyeball. <b>GraphQL</b> shines when web, iOS, Android and TV apps all need different slices of data — each asks for exactly its fields. Watch the <b>N+1 problem</b> (resolving 50 posts’ authors with 50 separate calls — batch them instead) and cap query depth so nobody sends a monstrously nested query.`) +
      WHY(`A very common real-world mix: clients send one <b>GraphQL</b> query shaped to the screen → a gateway fans out to internal services over <b>gRPC</b> → external partners use a stable, cacheable <b>REST</b> API. Each style is used where its strengths pay off.`) +
      RECAP([
        `REST, gRPC and GraphQL are three API styles with different sweet spots; big systems use all three.`,
        `<b>REST</b>: resources + HTTP verbs, universal and cacheable — best for public APIs and simple CRUD.`,
        `<b>gRPC</b>: fast binary RPC over HTTP/2 with typed generated code — best for internal service-to-service calls.`,
        `<b>GraphQL</b>: client asks for exactly the fields it needs in one request — best for many client types; beware the N+1 problem and deep queries.`,
        `In interviews, name the style briefly but spend your time on the operations and data, which matter far more than the protocol.`])]
  ]
});

SDPATCH('scaling', {
  blurb: `When one machine isn’t enough, you have two choices: make that machine bigger (<b>vertical</b> scaling) or add more machines (<b>horizontal</b> scaling). Adding machines has no real ceiling and survives failures — but it only works if your servers are <b>stateless</b>, so that any server can handle any request.`,
  sections: [
    ['The two ways to grow', PLAIN(`A single server eventually hits a limit — too many users, too much data. <b>Vertical scaling</b> means upgrading that one server (more CPU, more RAM): simple, but there’s a biggest-machine-you-can-buy ceiling, and it’s still a single point of failure. <b>Horizontal scaling</b> means running many servers behind a load balancer: no real ceiling, and losing one server doesn’t take you down. The catch is that it only works if the servers don’t keep important information in their own memory.`) +
      ANALOGY(`A busy kitchen. <b>Vertical</b> scaling is hiring one superhuman chef who works faster and faster — until no single human can keep up, and if they call in sick, dinner stops. <b>Horizontal</b> scaling is hiring many ordinary line cooks: you can always add more, and if one is out, the others carry on. But it only works if <i>any</i> cook can pick up <i>any</i> order — which means the order details can’t live only in one cook’s head.`)],
    ['Words you’ll need', KEYTERMS([
      ['Vertical scaling (scale up)', 'Make one machine more powerful — more CPU/RAM. Simple, but limited and a single point of failure.'],
      ['Horizontal scaling (scale out)', 'Add more machines working together. Practically unlimited and fault-tolerant, but needs coordination.'],
      ['Stateless', 'A server that keeps nothing important between requests — so any server can serve any request. The key requirement for scaling out the app tier.'],
      ['State', 'Information that must survive between requests: login sessions, uploaded files, data. In a scaled-out system this lives in shared stores, not on the app servers.'],
      ['Load balancer', 'The component that spreads incoming requests across the many servers.'],
      ['Autoscaling', 'Automatically adding servers when load rises and removing them when it falls.']])],
    ['Vertical vs horizontal', TBL(['', 'Vertical (scale up)', 'Horizontal (scale out)'], [
      ['How', 'Bigger machine (more CPU/RAM)', 'More machines'],
      ['Ceiling', 'The largest machine you can buy', 'Practically none'],
      ['If a machine dies', 'Everything stops (single point of failure)', 'The rest carry on'],
      ['Complexity', 'None — same code', 'Load balancing, shared state, distributed data'],
      ['Best for', 'Databases early on, simple systems', 'Stateless web/API tiers, large systems']])],
    ['Making servers stateless (the key move)', PP(`A server is stateless if it keeps nothing another server would need. Move the state out:`) +
      UL([`<b>Login sessions</b> → a shared cache (Redis) or a signed token the client sends each time.`,
        `<b>Uploaded files</b> → object storage, never the server’s local disk.`,
        `<b>Scheduled jobs</b> → a shared job queue, so a job runs once, not once per server.`]) +
      WHY(`“Sticky sessions” (always sending a user back to the same server) are a tempting shortcut, but they’re a workaround, not a fix: when that server dies, those users’ sessions die with it, and load becomes uneven. Properly stateless servers let you grow from 3 to 300 machines freely, and let a controller <b>autoscale</b> — add servers when CPU or latency climbs, remove them when it drops.`) +
      RECAP([
        `Scale up (vertical) = one bigger machine: simple but capped and a single point of failure. Scale out (horizontal) = more machines: unlimited and fault-tolerant.`,
        `Scaling out the app tier requires <b>stateless</b> servers, so any server can handle any request.`,
        `Achieve that by moving state out: sessions to a shared cache or signed tokens, files to object storage, jobs to a queue.`,
        `Avoid sticky sessions as a crutch — a dead server then loses its users’ state.`,
        `With stateless servers you can <b>autoscale</b>; the usual growth path then shifts the bottleneck to the database (handled by caching, replicas, and sharding).`])]
  ]
});

SDPATCH('loadbalancer', {
  blurb: `A load balancer is the traffic cop in front of your servers: it spreads incoming requests across a pool of them, quietly stops sending traffic to any server that’s unhealthy, and lets you add capacity or deploy new code without downtime. It can work at the connection level (layer 4) or the request level (layer 7).`,
  sections: [
    ['What is it and why?', PLAIN(`Once you run many servers, something has to decide which server each request goes to — that’s the <b>load balancer</b>. It sits in front, hands each request to a server that’s healthy and not too busy, notices when a server stops responding and routes around it, and lets you take servers out for upgrades gracefully. It’s what makes “many servers” look like one reliable address to the outside world.`) +
      ANALOGY(`It’s the host at a busy restaurant. Guests arrive at one door; the host seats each at a table with a waiter who isn’t swamped, skips the waiter who just went home sick, and — when the kitchen swaps in a new cook — stops seating that section for a moment so the handover is seamless. Diners never see the churn; they just get seated and served.`)],
    ['Words you’ll need', KEYTERMS([
      ['Backend / server pool', 'The group of servers the load balancer distributes work across.'],
      ['Health check', 'A probe the load balancer sends every few seconds; a server that fails is pulled out of rotation until it recovers.'],
      ['Round robin', 'Simplest algorithm: hand requests to servers in turn, one after another.'],
      ['Least connections', 'Send the next request to the server currently handling the fewest — better when request durations vary.'],
      ['Layer 4 vs layer 7', 'Layer 4 routes whole connections by IP/port (very fast, dumb); layer 7 reads the HTTP request and can route by URL or header (smarter, slightly more work).'],
      ['Draining', 'Letting a server finish its in-flight requests before taking it out — the basis of zero-downtime deploys.']])],
    ['How it picks a server', TBL(['Algorithm', 'How it chooses', 'Use when'], [
      ['Round robin', 'Each server in turn', 'Servers and requests are all similar'],
      ['Least connections', 'The server with the fewest open requests', 'Request durations vary a lot'],
      ['Power of two choices', 'Pick two at random, use the less busy', 'Large fleets — near-optimal and cheap'],
      ['Hash (by user/key)', 'Same key always to the same server', 'Cache locality or stickiness (use consistent hashing so resizing moves few keys)']])],
    ['Layer 4 vs layer 7', PP(`A load balancer can operate at two levels:`) +
      TBL(['', 'Layer 4 (connections)', 'Layer 7 (requests)'], [
        ['Sees', 'IP addresses and ports only', 'The full HTTP request: path, headers, cookies'],
        ['Can route by', 'Nothing content-based — just spread connections', 'URL or header: /api → API servers, /img → image servers'],
        ['Extras', 'Very fast, works for any protocol', 'TLS termination, retries, compression, rate limiting'],
        ['Cost', 'Cheapest per byte', 'A bit more CPU per request']])],
    ['The things that actually matter', WHY(`Two subtleties decide whether a load balancer helps or hurts. First, <b>health checks</b> must test the right thing: a check that only confirms “the process is running” misses a server with a broken database connection, while a check that pings every dependency can pull the <i>whole</i> fleet out when one shared database blips — so check what’s needed to serve requests, and “fail open” if everything looks unhealthy. Second, the load balancer itself must not be a single point of failure — you run at least two (active–passive with a floating address, or active–active via DNS/anycast), which cloud load balancers handle for you across zones.`) +
      RECAP([
        `A load balancer spreads requests across a pool of servers, routes around unhealthy ones, and enables zero-downtime deploys (by draining).`,
        `It chooses a server by algorithm: <b>round robin</b> (uniform work), <b>least connections</b> (variable durations), hashing (stickiness/cache locality).`,
        `<b>Layer 4</b> routes whole connections fast by IP/port; <b>layer 7</b> reads the HTTP request and can route by URL/header and do TLS, retries, etc.`,
        `<b>Health checks</b> must test real readiness and fail open; otherwise one blip can empty the whole fleet.`,
        `Run at least two load balancers so the balancer itself isn’t a single point of failure.`])]
  ]
});

SDPATCH('proxy', {
  blurb: `A reverse proxy sits in front of your servers and handles the cross-cutting chores every request needs — encryption, compression, caching, routing — so your servers don’t each reimplement them. An API gateway is a reverse proxy specialised for APIs, adding authentication, rate limiting, and routing requests to the right microservice.`,
  sections: [
    ['What is a proxy here?', PLAIN(`A <b>reverse proxy</b> is a server that stands in front of your real servers and receives requests on their behalf — clients talk to it, not knowing (or caring) which server actually answers. That single front position is the perfect place to do the chores every request needs: terminate encryption, compress responses, cache, and route to the right server. An <b>API gateway</b> is the same idea tuned for APIs, also handling who’s allowed in and how often.`) +
      ANALOGY(`It’s a building’s front desk. Visitors don’t wander in and find the right office themselves — they go to reception, which checks their ID (authentication), tells them they can only visit so many times today (rate limiting), directs them to the right floor (routing), and handles mail and security for everyone. The offices behind can focus on their actual work because reception handles all the shared front-door duties.`)],
    ['Words you’ll need', KEYTERMS([
      ['Forward proxy vs reverse proxy', 'A forward proxy acts for <i>clients</i> (e.g. a corporate web filter); a reverse proxy acts for <i>servers</i> (clients don’t know which server answers). Load balancers, CDNs and gateways are reverse proxies.'],
      ['TLS termination', 'Decrypting HTTPS at the proxy so the servers behind it handle plain HTTP and certificates live in one place.'],
      ['Cross-cutting concern', 'Something every request needs regardless of what it does — auth, logging, rate limiting, compression. Best handled once, centrally.'],
      ['API gateway', 'A reverse proxy for APIs that adds authentication, rate limiting/quotas, and routing to microservices.'],
      ['Service mesh', 'A system of small proxies beside each service that handle secure service-to-service traffic (the internal counterpart to a gateway).']])],
    ['What each one does', PP(`A plain <b>reverse proxy</b> handles the shared mechanics of serving traffic:`) +
      UL([`TLS termination and speaking modern HTTP to clients.`, `Compression and serving static files.`, `Caching responses.`, `Load balancing, retries, timeouts.`, `Basic protection: request size limits, hiding your internal layout.`]) +
      PP(`An <b>API gateway</b> adds the API-specific front-door duties on top:`) +
      UL([`<b>Authentication and authorization</b> — verify the token/API key once, so each service doesn’t redo it.`, `<b>Rate limiting and quotas</b> per client or plan.`, `<b>Routing</b> requests by path to the microservice that owns them, and API versioning.`, `<b>Aggregation</b> — one client call fans out to several services and comes back as one response.`])],
    ['North–south vs east–west', WHY(`A useful mental split: the gateway handles <b>north–south</b> traffic (requests coming in from the outside world), authenticating and routing each one. Traffic <i>between</i> your internal services — <b>east–west</b> — is handled by a <b>service mesh</b>: a small proxy (sidecar) runs next to each service and takes care of encryption, retries, timeouts and metrics, without changing the application code. Keep the gateway to cross-cutting concerns only; the moment business logic creeps into it, it becomes a bottleneck everyone owns and no one can change safely.`) +
      RECAP([
        `A <b>reverse proxy</b> fronts your servers and handles shared chores (TLS, compression, caching, routing, load balancing) so servers don’t each reimplement them.`,
        `An <b>API gateway</b> is a reverse proxy for APIs, adding authentication, rate limiting/quotas, routing to microservices, and request aggregation.`,
        `Doing these once at the front means each service can trust the identity passed to it and focus on its own logic.`,
        `The gateway handles external (north–south) traffic; a <b>service mesh</b> of sidecar proxies handles internal (east–west) service-to-service traffic.`,
        `Keep gateways to cross-cutting concerns — business logic there turns the shared front door into a bottleneck.`])]
  ]
});

SDPATCH('lru', {
  blurb: `A cache has limited room, so when it fills up it must throw something out — that’s an <b>eviction policy</b>. The most common is <b>Least Recently Used (LRU)</b>: evict whatever hasn’t been touched for the longest. A neat combination of a hash map and a doubly linked list makes every cache operation instant (O(1)).`,
  sections: [
    ['What problem is this?', PLAIN(`A cache deliberately holds only a limited amount of data in fast memory. Once it’s full, adding a new item means removing an old one — but <i>which</i> one? That decision is the <b>eviction policy</b>, and it hugely affects how often the cache helps. LRU bets that what you’ve used recently you’ll likely use again soon, so it throws out whatever’s been idle longest.`) +
      ANALOGY(`Picture a small desk that only fits ten documents. When you need to add an eleventh, you glance over the pile and toss whichever one you haven’t touched in the longest time — surely you’re done with that one. Each time you use a document, you move it to the top of the pile. That “used it → move to top, out of room → drop the bottom” habit is exactly LRU.`)],
    ['Words you’ll need', KEYTERMS([
      ['Eviction', 'Removing an item from a full cache to make room for a new one.'],
      ['LRU (Least Recently Used)', 'Evict the item that hasn’t been accessed for the longest time.'],
      ['LFU (Least Frequently Used)', 'Evict the item accessed the fewest times — keeps long-term favourites, but old hits linger.'],
      ['O(1)', '“Constant time” — the operation takes the same tiny amount of time no matter how big the cache is. The goal for get and put.'],
      ['Hash map', 'A structure giving instant lookup of a value by its key — but it has no notion of order.'],
      ['Doubly linked list', 'A chain of nodes each pointing to both neighbours, so you can unlink any node instantly — it keeps the recency order.']])],
    ['Why a hash map AND a linked list', WHY(`Each structure alone falls short: a hash map gives instant lookup but no sense of “what was used least recently”; a linked list keeps order but finding an item means scanning it. Combine them — the <b>map</b> points directly to each item’s <b>node</b> in the list, and the list is kept in recency order (most-recent at the front, least-recent at the back). Now a lookup is instant via the map, moving an item to the front is a couple of pointer swaps, and evicting the least-recent is just dropping the back node. Every operation is O(1). (Java’s LinkedHashMap and Python’s OrderedDict are built-in versions of exactly this.)`)],
    ['Choosing a policy', TBL(['Policy', 'Evicts', 'Good at', 'Weak at'], [
      ['LRU', 'Least recently used', 'Recency-heavy workloads; simple', 'One big scan can flush all the useful items'],
      ['LFU', 'Least frequently used', 'Keeping long-term favourites', 'Old popular items overstay; needs decaying counters'],
      ['FIFO', 'Oldest inserted', 'Trivially simple', 'Ignores actual usage'],
      ['TTL-based', 'Expired items', 'Bounding staleness', 'Not a size limit on its own']]) +
      PP(`Real systems often approximate: Redis doesn’t keep a perfect global LRU list (too costly) — it samples a few random keys and evicts the oldest among them, which is nearly as good for a fraction of the bookkeeping.`) +
      RECAP([
        `A full cache must <b>evict</b> something; the policy decides which item, and it strongly affects the hit rate.`,
        `<b>LRU</b> evicts the least-recently-used item, betting that recently-used data will be used again soon.`,
        `Implement O(1) LRU with a <b>hash map</b> (instant lookup) plus a <b>doubly linked list</b> (recency order): lookup via the map, move-to-front and evict-from-back via pointer swaps.`,
        `Alternatives: <b>LFU</b> (favour frequently-used), FIFO, TTL-based — each with trade-offs.`,
        `Real caches like Redis <b>approximate</b> LRU by sampling, avoiding the cost of a perfect global ordering.`])]
  ]
});

SDPATCH('cdn', {
  blurb: `A CDN (content delivery network) is a fleet of “edge” servers in hundreds of cities that keep copies of your content close to users. It cuts latency from hundreds of milliseconds to tens, serves the vast majority of requests before they ever reach your own servers, and shields you from traffic spikes and attacks.`,
  sections: [
    ['What is a CDN and why?', PLAIN(`If all your servers live in one place (say Virginia), a user in Tokyo waits for data to cross the Pacific on every request — slow, and it piles load onto your servers. A <b>CDN</b> fixes both: it caches copies of your content on <b>edge servers</b> scattered across hundreds of cities, so each user is served from somewhere nearby. Most requests never reach your origin at all, which makes things fast <i>and</i> takes enormous load off you.`) +
      ANALOGY(`It’s the difference between every online order shipping from one central warehouse versus a network of local warehouses near every city (how Amazon gets you next-day delivery). The popular items sit in the warehouse near you, so they arrive in hours instead of a week — and the central warehouse only gets involved when a local one doesn’t have something yet.`)],
    ['Words you’ll need', KEYTERMS([
      ['Edge server', 'A CDN server in a city near users that caches and serves your content locally.'],
      ['Origin', 'Your own server (or storage) that holds the original content — the source the edges pull from.'],
      ['Cache hit / miss', 'A hit = the edge already has the content and serves it instantly; a miss = it must fetch from the origin once, then caches it.'],
      ['TTL', 'How long an edge may keep a cached copy before checking the origin again.'],
      ['Static vs dynamic content', 'Static = unchanging files (images, JS, video) — ideal for a CDN. Dynamic = personalised/changing responses — cacheable only briefly or not at all.'],
      ['Versioned URL', 'Naming a file by its contents (app.3f9a2c.js) so a new version gets a new URL and can be cached essentially forever.']])],
    ['How it works', PP(`Each user is sent (by DNS or anycast) to a nearby edge. If that edge has the content (<b>hit</b>), it serves it in a few milliseconds. If not (<b>miss</b>), it fetches from the <b>origin</b> once, caches it, and every later user in that region gets the local copy. When the cached copy’s <b>TTL</b> expires, the edge checks the origin — often getting a cheap “nothing changed” reply.`)],
    ['What to put on it, and how to update it', UL([
      `<b>Great fits:</b> images, CSS, JavaScript, fonts, and especially video (which is most internet traffic), with long cache lifetimes.`,
      `<b>Also:</b> cacheable API responses (public data, for seconds/minutes) and whole pages for logged-out users.`,
      `<b>Updating content:</b> prefer <b>versioned URLs</b> — since the filename changes when the content changes, old copies are simply never requested again, so you never have to “invalidate” anything. Otherwise use short TTLs or an explicit purge.`]) +
      WHY(`This is why build tools produce filenames like <code>app.3f9a2c.js</code>: the gibberish is a hash of the file’s contents. Change the file and the name changes, so the CDN treats it as a brand-new URL and there’s no risk of serving a stale cached version — you get “cache forever” safety for free. CDNs also do more than cache: they terminate TLS near users, absorb DDoS attacks, and can even run small bits of code at the edge.`) +
      RECAP([
        `A CDN caches your content on <b>edge servers</b> near users, cutting latency and offloading most traffic from your origin.`,
        `Each user hits a nearby edge: a <b>hit</b> is served locally in milliseconds; a <b>miss</b> fetches from the <b>origin</b> once, then caches it.`,
        `Put <b>static</b> content on it (images, JS, CSS, fonts, video); dynamic content only briefly if at all.`,
        `Update content with <b>versioned URLs</b> (content-hash filenames) so new versions get new URLs and old copies are never served — no invalidation needed.`,
        `CDNs also terminate TLS near users, absorb attacks, and can run edge compute — rules of thumb: heavy static egress means “use a CDN,” and protect private content with signed URLs.`])]
  ]
});
