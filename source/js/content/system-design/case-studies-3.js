/* ===== System design: additional case studies ===== */

SDX('case-instagram', { name: 'Design Instagram', cat: 'sdcase',
  blurb: `Instagram is a photo/video sharing app with a home feed. The design centers on storing media cheaply and serving it fast (object store + CDN), storing post/graph metadata, and building each user’s feed with a hybrid fan-out that handles both normal users and celebrities.`,
  facts: [['Read:write', 'very read-heavy'], ['Media', 'object store + CDN'], ['Feed', 'hybrid fan-out'], ['Scale pain', 'celebrity accounts']],
  cheat: [['Upload path', 'App → object store (media) + DB (metadata)'], ['Media store', 'S3-style blob storage; immutable objects'], ['CDN', 'Caches images/videos near users'], ['Metadata DB', 'Posts, users, follows (sharded)'], ['Feed build', 'Fan-out on write (push) for most users'], ['Celebrity', 'Fan-out on read (pull) for huge accounts'], ['Feed cache', 'Precomputed timelines in Redis'], ['Graph', 'Follower/following relationships'], ['Thumbnails', 'Generated async in multiple sizes'], ['Consistency', 'Eventual for feeds is fine']],
  sections: [
    ['Requirements & scale', PP(`<b>Functional:</b> upload photos/videos, follow users, view a <b>home feed</b> of followed accounts, like/comment. <b>Non-functional:</b> very <b>read-heavy</b> (far more views than posts), low-latency media, feeds that load fast, high availability; strict consistency is <b>not</b> required (a feed can be a little stale). The two hard parts are <b>serving media at scale</b> and <b>building feeds efficiently</b>.`)],
    ['Media storage and delivery', PP(`Media is <b>not</b> stored in the database. On upload, the app writes the file to <b>object storage</b> (immutable blobs) and records <b>metadata</b> (post id, author, caption, media URL) in a sharded DB. A <b>CDN</b> caches the images/videos at the edge so most views never hit origin. <b>Thumbnails/transcodes</b> in several sizes are generated <b>asynchronously</b> by workers. This separation keeps the DB small and makes delivery fast and cheap.`)],
    ['Feed generation: hybrid fan-out', PP(`For most users, use <b>fan-out on write</b>: when someone posts, workers <b>push</b> the post id into each follower’s <b>precomputed feed</b> (a list in Redis), so reading a feed is a cheap cache lookup. But a <b>celebrity</b> with millions of followers would trigger millions of writes per post — so for high-follower accounts switch to <b>fan-out on read</b>: don’t push; instead, at read time <b>pull</b> the celebrity’s recent posts and merge them into the feed. This <b>hybrid</b> keeps normal feeds instant while bounding the cost of celebrities.`)]
  ],
  snipTitle: 'Feed read (hybrid merge)', snipNote: 'Precomputed feed for normal follows, merged with pulled celebrity posts.',
  snips: [['feed.py', 'python', `def get_feed(user_id, feed_cache, graph, posts, celeb_threshold=100_000):
    # 1) precomputed part (fan-out on write): cheap cache read
    feed = feed_cache.get_timeline(user_id)          # list of post ids

    # 2) celebrities this user follows are NOT pushed; pull at read time
    celebs = [f for f in graph.following(user_id)
              if graph.follower_count(f) > celeb_threshold]
    pulled = []
    for c in celebs:
        pulled += posts.recent_by_author(c, limit=10)

    # 3) merge by timestamp, dedupe, paginate
    merged = sorted(set(feed + [p.id for p in pulled]),
                    key=posts.timestamp, reverse=True)
    return merged[:50]`]],
  dg: { w: 780, h: 340, n: [
    ['u', 'User', 70, 180, 'user'],
    ['cdn', 'CDN', 210, 80, 'cdn'],
    ['lb', 'Load balancer', 210, 250, 'lb'],
    ['api', 'App / API', 370, 250, 'svc'],
    ['media', 'Object store', 370, 100, 'store', 'photos/videos'],
    ['meta', 'Metadata DB', 560, 100, 'db', 'posts, graph'],
    ['q', 'Fan-out queue', 540, 250, 'queue'],
    ['work', 'Fan-out workers', 690, 250, 'worker'],
    ['feed', 'Feed cache', 690, 140, 'cache', 'timelines'] ],
    e: [
      ['u', 'cdn', 'view media'],
      ['u', 'lb', 'requests'],
      ['lb', 'api', ''],
      ['api', 'media', 'upload', 'u'],
      ['cdn', 'media', 'origin', 'd'],
      ['api', 'meta', 'write post', 'n'],
      ['api', 'q', 'enqueue', 'n'],
      ['q', 'work', ''],
      ['work', 'feed', 'push', 'u'],
      ['api', 'feed', 'read feed'] ] },
  cap: 'Upload writes media to object storage and metadata to the DB; a fan-out queue pushes new posts into followers’ feed caches; reads serve media from the CDN and the timeline from the feed cache.',
  walk: [
    [['u', 'lb', 'api'], 'A request enters through the CDN (for media) and the load balancer (for API calls), reaching the app servers.'],
    [['api', 'media', 'api>media'], 'On upload, the media file goes to object storage (cheap, immutable blobs) — never into the database.'],
    [['api', 'meta', 'api>meta'], 'Post metadata (author, caption, media URL) is written to the sharded metadata DB.'],
    [['api', 'q', 'q', 'work', 'api>q'], 'A fan-out job is enqueued; workers push the new post id into each follower’s precomputed timeline.'],
    [['work', 'feed', 'work>feed'], 'For normal users the feed is pushed on write (fan-out on write) into the feed cache.'],
    [['u', 'cdn', 'api', 'feed', 'api>feed'], 'Reads are cheap: media comes from the CDN and the timeline from the feed cache — celebrity posts are pulled and merged at read time.'] ],
  edge: [`<b>Celebrity fan-out</b> would write millions of feed entries per post — switch high-follower accounts to fan-out on read (pull + merge) to bound cost.`, `Store media in <b>object storage, not the DB</b>; putting blobs in the database bloats it and kills performance.`, `<b>Thumbnail/transcode</b> work must be <b>async</b> — doing it inline makes uploads slow and fragile.`, `Feeds are <b>eventually consistent</b>; a new post appearing a few seconds late is fine and far cheaper than strong consistency.`, `The <b>social graph</b> (followers) is itself large and hot — shard it and cache follower counts/lists.`],
  faq: [['How do you generate each user’s home feed efficiently?', PP(`With a <b>hybrid fan-out</b> strategy, because neither pure approach works alone at Instagram scale. <b>Fan-out on write (push)</b> precomputes feeds: when a user posts, background workers append the post id to the <b>materialized timeline</b> of every follower (stored in a fast cache like Redis). Reading a feed is then a trivial, low-latency cache lookup — ideal given the read-heavy workload. The problem is <b>celebrities</b>: a post by someone with 50 million followers would trigger 50 million feed writes, a massive, bursty, expensive fan-out. So for <b>high-follower accounts</b> you switch to <b>fan-out on read (pull)</b>: their posts are <i>not</i> pushed; instead, when a user loads their feed, the system <b>pulls the recent posts of the celebrities they follow and merges</b> them (by timestamp) with their precomputed timeline. This <b>hybrid</b> gives the best of both — instant feeds for the common case via push, and bounded cost for the rare celebrity case via pull — and it’s the canonical answer for Instagram/Twitter feed design.`)],
    ['Why store media in object storage and serve it via a CDN instead of from the database?', PP(`Because images and videos are <b>large, immutable binary blobs</b> with access patterns completely different from relational data, and databases are the wrong tool for them. Putting media <b>in the database</b> would bloat it enormously, blow up backup/replication times, waste expensive DB storage and memory, and make queries slow — all to store bytes the DB never needs to query <i>into</i>. Instead you store each file once in <b>object storage</b> (S3-style): cheap, effectively infinite, durable, and purpose-built for large immutable objects, while the database holds only small <b>metadata</b> (the post record and a URL pointer to the object). Then you put a <b>CDN</b> in front so the actual bytes are cached at <b>edge locations near users</b> — the vast majority of views are served from a nearby CDN node in milliseconds, never touching your origin, which both slashes latency and offloads enormous bandwidth from your infrastructure. This three-layer split — small metadata in the DB, blobs in object storage, delivery via CDN — is the standard pattern for any media-heavy product and is exactly why it loads fast and stays cheap at scale.`)]],
  qs: [SQ('Instagram handles celebrity accounts in the feed by…', ['Pushing posts to all millions of followers (fan-out on write)', 'Pulling and merging their posts at read time (fan-out on read)', 'Blocking celebrity posts', 'Storing feeds in the SQL database'], 1, 'Pure push is too expensive for millions of followers; pull-and-merge bounds the cost.'),
    SQ('Where should uploaded photos/videos be stored?', ['In the relational database as blobs', 'In object storage, with a CDN in front and only metadata in the DB', 'In the feed cache', 'On the app server’s disk'], 1, 'Object store + CDN for bytes; DB holds small metadata and a URL.')]
});
DP('case-instagram', {
  fu: [['How are likes/comments counted at scale?', 'Counts are high-write and hot; use sharded/approximate counters (split a counter into sub-counters summed on read) or a stream that aggregates, rather than a single row everyone updates — avoiding a hot key.'],
    ['How do stories (ephemeral) differ from posts?', 'Stories have a 24h TTL and are even more read-heavy and bursty; they’re cached aggressively and expired automatically, often with a separate, simpler pipeline than permanent posts.'],
    ['How do you keep feeds fresh without pushing everything?', 'Combine precomputed feeds with read-time merge of recently-active/celebrity sources, and cap how far back feeds materialize; older content is paginated from the posts store.']],
  deep: [['Technique', 'Separate media (object store + CDN) from metadata (sharded DB); build feeds with hybrid fan-out (push for most, pull-merge for celebrities); process thumbnails async.'],
    ['Failure mode', 'Celebrity write-amplification from pure push, blobs in the DB, synchronous media processing, and hot counters.'],
    ['In interviews', 'Lead with read-heaviness and the two hard parts (media delivery, feed build); the hybrid fan-out is the signature answer.']],
  src: ['Fan-out on write vs read (feed design)', 'https://www.educative.io/answers/what-is-the-fan-out-service-in-system-design'] });

SDX('case-fooddelivery', { name: 'Design a food delivery system', cat: 'sdcase',
  blurb: `A food delivery platform (DoorDash/Uber Eats/Swiggy) connects customers, restaurants, and couriers. The core challenges are geospatial matching of orders to nearby couriers, real-time order/location tracking, and an order lifecycle state machine spanning three parties.`,
  facts: [['Three sides', 'customer, restaurant, courier'], ['Core', 'geospatial courier matching'], ['Realtime', 'order status + live tracking'], ['Lifecycle', 'order state machine']],
  cheat: [['Order service', 'Owns the order lifecycle state machine'], ['Geo index', 'Find couriers near a restaurant (geohash/quadtree)'], ['Matching', 'Assign best nearby courier (ETA, load)'], ['Location stream', 'Couriers push GPS; tracked in real time'], ['Realtime', 'WebSockets/push for status + map'], ['Restaurant service', 'Menus, availability, prep time'], ['Payments', 'Authorize at order, capture on delivery'], ['Status', 'placed→confirmed→prepping→picked→delivered'], ['Notifications', 'Each transition pushes updates'], ['Surge/ETA', 'Demand-based pricing & estimates']],
  sections: [
    ['Requirements & entities', PP(`<b>Functional:</b> browse restaurants/menus, place an order, pay, have a <b>courier</b> assigned, and <b>track</b> the order live on a map. <b>Three parties</b> — customer, restaurant, courier — each with their own app and view. <b>Services:</b> an <b>Order service</b> (the lifecycle), a <b>Restaurant service</b> (menus, availability), a <b>Matching/Dispatch service</b> (couriers), a <b>Location service</b> (GPS streams), plus payments and notifications.`)],
    ['Geospatial matching', PP(`The signature problem: when an order is ready (or placed), find the <b>best nearby courier</b>. Couriers continuously push their GPS to a <b>Location service</b> that maintains a <b>geospatial index</b> (geohash, quadtree, or Redis GEO) so you can efficiently query "couriers within X km of this restaurant." <b>Dispatch</b> then ranks candidates by <b>ETA to restaurant, current load, direction, and rating</b> and assigns one, re-trying if declined. This is the same core as ride-matching.`)],
    ['Order lifecycle and real-time tracking', PP(`An order is a <b>state machine</b>: <code>placed → confirmed → preparing → ready → picked-up → en-route → delivered</code> (with cancel paths). Each transition is driven by one of the three parties and <b>pushes real-time updates</b> to the others (the customer sees "preparing," then the courier’s moving dot). Live tracking streams the courier’s location over <b>WebSockets/push</b>. <b>Payment</b> is typically <b>authorized at order time and captured on delivery</b>. Notifications fire on each transition.`)]
  ],
  snipTitle: 'Geospatial courier lookup', snipNote: 'Geohash-based "nearby couriers" query feeding the dispatch ranker.',
  snips: [['dispatch.py', 'python', `import geohash   # conceptual: encode lat/lng into a prefix string

class LocationIndex:
    def __init__(self, precision=6):
        self.precision = precision
        self.cells: dict[str, set[str]] = {}       # geohash cell -> courier ids
    def update(self, courier_id, lat, lng):
        cell = geohash.encode(lat, lng, self.precision)
        # (remove from old cell, add to new) ...
        self.cells.setdefault(cell, set()).add(courier_id)
    def nearby(self, lat, lng):
        cell = geohash.encode(lat, lng, self.precision)
        # neighbors cover edge cases at cell borders
        candidates = set()
        for c in [cell] + geohash.neighbors(cell):
            candidates |= self.cells.get(c, set())
        return candidates

def dispatch(order, index, couriers):
    cands = index.nearby(order.restaurant_lat, order.restaurant_lng)
    # rank by ETA to restaurant, current load, rating
    ranked = sorted(cands, key=lambda c: couriers[c].eta_to(order.restaurant))
    return ranked[0] if ranked else None           # offer to best; retry on decline`]],
  dg: { w: 780, h: 340, n: [
    ['cust', 'Customer', 70, 90, 'user'],
    ['cour', 'Courier', 70, 260, 'user'],
    ['gw', 'API gateway', 220, 175, 'gw'],
    ['order', 'Order service', 390, 90, 'svc'],
    ['dispatch', 'Dispatch', 390, 260, 'svc'],
    ['loc', 'Location service', 560, 260, 'svc', 'GPS stream'],
    ['geo', 'Geo index', 700, 260, 'cache', 'geohash'],
    ['db', 'Orders DB', 560, 90, 'db'],
    ['notify', 'Notifications', 700, 90, 'queue'] ],
    e: [
      ['cust', 'gw', 'order/track'],
      ['cour', 'gw', 'GPS/status'],
      ['gw', 'order', ''],
      ['gw', 'dispatch', '', 'n'],
      ['order', 'db', 'persist'],
      ['order', 'dispatch', 'ready', 'n'],
      ['dispatch', 'loc', 'who’s near?'],
      ['loc', 'geo', 'query'],
      ['cour', 'loc', 'push GPS', 'N'],
      ['order', 'notify', 'status', 'u'] ] },
  cap: 'Orders flow through the Order service (lifecycle + DB); when ready, Dispatch queries the Location service’s geo index for nearby couriers and assigns one; couriers stream GPS and status updates push to all parties.',
  walk: [
    [['cust', 'gw', 'order', 'db'], 'The customer places an order; the Order service records it and starts the lifecycle state machine.'],
    [['order', 'dispatch', 'order>dispatch'], 'When the restaurant marks the food ready, the Order service asks Dispatch to find a courier.'],
    [['dispatch', 'loc', 'geo', 'loc>geo'], 'Dispatch queries the Location service’s geospatial index (geohash) for couriers near the restaurant.'],
    [['cour', 'loc', 'cour>loc'], 'Couriers continuously stream their GPS to the Location service, keeping the geo index fresh.'],
    [['dispatch', 'cour'], 'Dispatch ranks candidates by ETA, load and rating and offers the order to the best courier (retrying on decline).'],
    [['order', 'notify', 'cust', 'cour', 'order>notify'], 'Every state transition pushes real-time updates — the customer sees status and the courier’s live location.'] ],
  edge: [`<b>Geo-queries at cell borders</b> miss couriers just across a boundary — always search the cell <b>plus its neighbors</b> (or use a radius query).`, `A courier <b>declining/timeout</b> must re-dispatch quickly; design the offer with a short TTL and a fallback ranking, or orders stall.`, `<b>Location write volume</b> is huge (every courier every few seconds) — use an in-memory geo store (Redis GEO), sample sensibly, and don’t persist every ping to the main DB.`, `The order lifecycle spans <b>three parties</b>; model it as an explicit <b>state machine</b> with valid transitions, or you get inconsistent states ("delivered" before "picked up").`, `<b>Payment</b> should authorize up front and capture on delivery; handle cancellations/refunds as part of the state machine.`],
  faq: [['How do you match an order to a nearby courier efficiently?', PP(`You turn "find couriers near this restaurant" into a <b>geospatial index lookup</b> rather than scanning all couriers. Couriers continuously stream their GPS to a <b>Location service</b>, which indexes them by location using a structure built for proximity queries — a <b>geohash</b> (encode lat/lng into a short string whose shared prefixes mean physical closeness), a <b>quadtree</b>, or a ready-made geo store like <b>Redis GEO</b>. To find candidates you compute the restaurant’s cell and query that cell <b>plus its neighboring cells</b> (critical, since a courier just across a cell boundary is still nearby), giving you a small candidate set in roughly O(1)/O(log n) instead of O(couriers). Then <b>Dispatch ranks</b> those candidates by the factors that actually matter — <b>ETA to the restaurant</b> (not just straight-line distance, ideally road-network travel time), the courier’s <b>current load</b> (are they already carrying an order?), <b>direction</b> of travel, and <b>rating/acceptance</b> — and <b>offers</b> the order to the best one with a short acceptance timeout, falling back to the next candidate on decline or timeout. This is the same geospatial-matching core as ride-hailing, and keeping the hot location index in memory is what makes it fast at scale.`)],
    ['Why model the order as a state machine, and how do updates reach all three parties in real time?', PP(`An order in food delivery is manipulated by <b>three independent actors</b> — the customer (places/cancels), the restaurant (confirms, marks preparing/ready), and the courier (picks up, delivers) — so without a disciplined model you get <b>invalid or conflicting states</b> (an order marked "delivered" before "picked up," or confirmed after being cancelled). Modeling it as an explicit <b>state machine</b> — <code>placed → confirmed → preparing → ready → picked-up → en-route → delivered</code>, with defined cancel/refund paths — makes the <b>valid transitions explicit</b>, lets you reject illegal ones, and gives every service a single, consistent source of truth for "where is this order." Each transition is also the natural trigger for <b>notifications</b>: when the Order service applies a transition, it <b>publishes an event</b> that fans out real-time updates to whoever needs them — the customer’s app updates its status screen, the courier gets the pickup assignment, the restaurant sees new orders. Delivery of these updates uses <b>push channels</b>: persistent <b>WebSockets</b> (or server-sent events / mobile push) so the customer sees "preparing → on the way" and the courier’s <b>live location dot</b> moving on the map without polling. The courier’s GPS stream flows continuously through the Location service and is forwarded to the tracking customer over the same real-time channel. So the state machine guarantees <i>correctness</i> of the shared order, and the event-driven push layer guarantees <i>timeliness</i> of what each party sees.`)]],
  qs: [SQ('The core technique for assigning orders to couriers is…', ['Random assignment', 'Geospatial indexing (geohash/quadtree) + ranking by ETA/load', 'Alphabetical by courier name', 'Round-robin across all couriers'], 1, 'A geo index finds nearby couriers fast; dispatch ranks and offers to the best.'),
    SQ('When querying a geohash cell for nearby couriers, you must also check…', ['Only that one cell', 'Neighboring cells (to catch couriers just across a boundary)', 'The entire country', 'The courier database table scan'], 1, 'Border cases are missed unless you include neighboring cells (or use a radius query).')]
});
DP('case-fooddelivery', {
  fu: [['How is ETA estimated?', 'Using road-network routing (like the Maps case) plus historical travel times, current traffic, and restaurant prep-time estimates; ML models refine delivery-time predictions from past data.'],
    ['How do you handle surge pricing and demand spikes (e.g. dinner rush)?', 'Monitor supply (available couriers) vs demand per area; apply surge pricing to balance them, pre-position couriers, and queue/stagger orders when restaurants are overloaded.'],
    ['How do you store and scale courier location updates?', 'Keep live locations in an in-memory geo store (Redis GEO) with frequent updates; sample/throttle pings, and don’t write every GPS point to the durable DB — persist trips/summaries instead.']],
  deep: [['Technique', 'Separate services (order lifecycle, dispatch, location); index couriers geospatially; rank-and-offer with timeouts; drive real-time updates off an order state machine.'],
    ['Failure mode', 'Border-cell misses, stalled orders on courier decline, persisting every GPS ping, and inconsistent order states without a state machine.'],
    ['In interviews', 'Call out the geospatial matching and the three-party order state machine with real-time push — the two defining elements.']],
  src: ['Uber: geospatial indexing (H3) overview', 'https://www.uber.com/blog/h3/'] });

SDX('case-netflix', { name: 'Design Netflix (video streaming)', cat: 'sdcase',
  blurb: `Netflix streams pre-recorded video to huge global audiences. The design is dominated by a video processing pipeline (transcoding into many formats/bitrates), massive CDN distribution (serving the bytes), and adaptive bitrate streaming — plus recommendations and a metadata catalog.`,
  facts: [['Workload', 'read-heavy, bandwidth-dominated'], ['Pipeline', 'transcode into many renditions'], ['Delivery', 'CDN is everything'], ['Playback', 'adaptive bitrate (ABR)']],
  cheat: [['Upload/ingest', 'Master video enters the pipeline'], ['Transcoding', 'Encode into many resolutions/bitrates/codecs'], ['Segmenting', 'Split into small chunks (HLS/DASH)'], ['Object store', 'Store all renditions + manifests'], ['CDN', 'Serve chunks from the edge (Open Connect)'], ['ABR', 'Player picks bitrate by bandwidth'], ['Manifest', 'Lists available renditions/segments'], ['Catalog/metadata', 'Titles, episodes, artwork'], ['Recommendations', 'Offline ML + online ranking'], ['Playback service', 'Auth, licensing (DRM), which CDN']],
  sections: [
    ['Requirements & the shape of the problem', PP(`<b>Functional:</b> browse a catalog, play a title, resume where you left off, get recommendations. <b>Non-functional:</b> extremely <b>read-heavy and bandwidth-dominated</b> (streaming video is the vast majority of internet traffic), global low-latency start, smooth playback on any device/network, high availability. Unlike YouTube, content is <b>pre-recorded and curated</b>, so the upload path is <b>offline batch</b> — the hard real-time part is <b>delivery</b>, not ingest.`)],
    ['The transcoding pipeline', PP(`A single master file can’t serve every device and network, so each title is run through a <b>transcoding pipeline</b>: it’s encoded into <b>many renditions</b> (resolutions like 240p→4K, multiple bitrates, several codecs) and <b>split into short segments</b> (a few seconds each) for <b>HLS/DASH</b> streaming, plus a <b>manifest</b> listing what’s available. This is massive <b>parallel batch</b> work (chunk the video, transcode chunks across a worker fleet, reassemble). All renditions and manifests land in <b>object storage</b> and are pushed out to the CDN.`)],
    ['CDN delivery and adaptive bitrate', PP(`<b>Delivery is the whole game.</b> Video chunks are served from a <b>CDN</b> with points of presence close to users (Netflix runs its own, <b>Open Connect</b>, with appliances inside ISPs). The player uses <b>adaptive bitrate (ABR)</b>: it starts at a modest bitrate and, segment by segment, <b>measures available bandwidth</b> and switches up or down so playback stays smooth without buffering. A <b>playback service</b> handles auth, <b>DRM licensing</b>, and tells the player which CDN/renditions to use. Metadata (catalog) and <b>recommendations</b> (offline-trained models, ranked online per user) are separate, much smaller systems.`)]
  ],
  snipTitle: 'Adaptive bitrate, conceptually', snipNote: 'The player picks the next segment’s rendition from measured throughput.',
  snips: [['abr.py', 'python', `# Manifest: available renditions (bitrate in kbps -> segment URL template)
renditions = [240, 480, 720, 1080, 4000]   # kbps tiers

class ABRPlayer:
    def __init__(self, manifest):
        self.manifest = manifest
        self.buffer = []
        self.current = 240                   # start conservative for fast start

    def pick_rendition(self, measured_kbps: float) -> int:
        # choose the highest rendition comfortably below measured bandwidth
        safe = measured_kbps * 0.8           # headroom to avoid rebuffering
        chosen = max((r for r in renditions if r <= safe), default=renditions[0])
        self.current = chosen
        return chosen

    def next_segment(self, idx, measured_kbps):
        r = self.pick_rendition(measured_kbps)
        return self.manifest.url(rendition=r, segment=idx)   # fetch from CDN
# As bandwidth drops, the player steps down a tier; as it recovers, it steps up.`]],
  dg: { w: 780, h: 340, n: [
    ['master', 'Master video', 70, 90, 'store', 'source'],
    ['pipe', 'Transcoding pipeline', 240, 90, 'worker', 'many renditions'],
    ['obj', 'Object store', 430, 90, 'store', 'renditions+manifest'],
    ['cdn', 'CDN (Open Connect)', 600, 90, 'cdn'],
    ['user', 'Player', 600, 260, 'user'],
    ['play', 'Playback service', 360, 260, 'svc', 'auth/DRM/steering'],
    ['meta', 'Catalog DB', 180, 260, 'db', 'titles'],
    ['rec', 'Recommendations', 70, 175, 'svc'] ],
    e: [
      ['master', 'pipe', 'ingest'],
      ['pipe', 'obj', 'store renditions'],
      ['obj', 'cdn', 'distribute'],
      ['user', 'play', 'start playback'],
      ['play', 'meta', 'metadata', 'u'],
      ['play', 'cdn', 'which CDN', 'n'],
      ['user', 'cdn', 'stream chunks (ABR)', 'N'],
      ['rec', 'play', 'ranked titles', 'u'] ] },
  cap: 'Master videos are transcoded offline into many renditions stored in object storage and distributed to the CDN; at playback the playback service authorizes and steers the player, which then streams segments directly from the nearest CDN using adaptive bitrate.',
  walk: [
    [['master', 'pipe', 'master>pipe'], 'A master video enters the transcoding pipeline — an offline, massively parallel batch job.'],
    [['pipe', 'obj', 'pipe>obj'], 'It is encoded into many resolutions/bitrates and split into short segments, with a manifest, all stored in object storage.'],
    [['obj', 'cdn', 'obj>cdn'], 'All renditions are distributed to the CDN (Netflix’s Open Connect appliances sit inside ISPs, close to users).'],
    [['user', 'play', 'meta', 'rec'], 'When a user hits play, the playback service authorizes them (DRM), pulls catalog metadata, and factors in recommendations.'],
    [['play', 'cdn', 'play>cdn'], 'The playback service steers the player to the best CDN and tells it which renditions/manifest to use.'],
    [['user', 'cdn', 'user>cdn'], 'The player streams short segments directly from the nearest CDN, using adaptive bitrate to match the current network speed.'] ],
  edge: [`Transcoding is <b>offline batch</b>, not real-time — the hard problem is delivery; don’t design the pipeline as a live path.`, `Without a <b>CDN</b> (and ideally ISP-embedded appliances), streaming at this scale is impossible — origin bandwidth alone can’t serve it.`, `<b>ABR requires multiple renditions and segmented video</b>; a single file can’t adapt to changing bandwidth and causes buffering.`, `<b>DRM/licensing</b> is a real requirement for paid content — the playback service must issue licenses, not just serve bytes.`, `<b>Resume/continue-watching</b> is per-user state (playback position) — small, frequent writes kept separate from the heavy delivery path.`],
  faq: [['How is designing Netflix different from designing YouTube?', PP(`They share the big pieces — a <b>transcoding pipeline</b>, <b>object storage</b>, a <b>CDN</b>, and <b>adaptive bitrate</b> playback — but the emphasis differs because of the content model. <b>YouTube</b> has <b>user-generated uploads at massive volume and velocity</b>: anyone can upload at any time, so the <b>ingest/transcoding path must be scalable, continuous, and fast</b> (creators expect their video processable quickly), content is unpredictable and long-tail, and moderation matters. <b>Netflix</b> has a <b>curated, pre-recorded catalog</b>: titles are added in controlled batches, so transcoding is <b>offline batch work done ahead of time</b> and the real-time ingest pressure is low. What Netflix optimizes instead is <b>delivery quality and cost at enormous bandwidth</b> — it famously runs its <b>own CDN (Open Connect)</b> with appliances placed <b>inside ISP networks</b> so popular titles are served from within the user’s own ISP, and it <b>pre-positions</b> content to edges based on predicted demand. Netflix also leans heavily on <b>recommendations</b> (a curated catalog makes personalization central to the product) and on <b>DRM</b> for paid content. So: YouTube’s hard part skews toward <b>scalable ingest + storage of unbounded UGC</b>; Netflix’s hard part skews toward <b>global, cost-efficient, high-quality delivery of a known catalog</b>.`)],
    ['What is adaptive bitrate streaming and why is it essential?', PP(`<b>Adaptive bitrate (ABR)</b> streaming lets the video <b>continuously adjust its quality to the viewer’s current network conditions</b> so playback stays smooth instead of freezing to buffer. It works because each title is encoded into <b>multiple renditions</b> (different resolutions/bitrates — say 240p up to 4K) and each rendition is <b>split into short segments</b> of a few seconds, all described by a <b>manifest</b> (the HLS/DASH playlist). The <b>player</b>, not the server, drives adaptation: it typically starts at a <b>conservative bitrate</b> for a fast start, then for <b>each segment measures the throughput</b> it just achieved and the health of its buffer, and <b>picks the highest rendition it can sustain</b> with some safety headroom — stepping <b>down</b> when bandwidth drops (so it keeps playing, just softer) and <b>up</b> when it recovers. This is essential because real networks are <b>variable</b> (mobile, congested Wi-Fi, shared links) and devices differ: a single fixed-bitrate file would either constantly rebuffer on slow connections or waste bandwidth and look bad on fast ones. ABR maximizes quality subject to whatever bandwidth is available moment to moment, which is why it’s the backbone of all modern streaming and why the design must produce <b>segmented, multi-rendition</b> output and serve those segments from a <b>CDN</b> close to the user.`)]],
  qs: [SQ('The dominant challenge in a Netflix-style design is…', ['Real-time upload ingest', 'Global bandwidth/delivery via a CDN', 'Writing to a SQL database', 'User authentication'], 1, 'Content is pre-recorded; serving the bytes at scale (CDN) is the hard part.'),
    SQ('Adaptive bitrate streaming requires the video to be…', ['A single high-resolution file', 'Encoded into multiple renditions and split into short segments', 'Stored only in the database', 'Streamed without a CDN'], 1, 'Multiple renditions + segments let the player switch quality as bandwidth changes.')]
});
DP('case-netflix', {
  fu: [['How does Open Connect reduce cost and latency?', 'Netflix places caching appliances inside ISP data centers; popular titles are served from within the ISP, so traffic never traverses the public internet backbone — cutting latency, rebuffering, and transit costs dramatically.'],
    ['How are recommendations served?', 'Models are trained offline on viewing history and ranked online per user/session; results are cached and personalized. It’s a separate, much smaller system than delivery, but central to engagement.'],
    ['How is continue-watching handled?', 'The player periodically reports playback position; a small, write-optimized service stores per-user per-title progress, read on home-screen load. It’s decoupled from the heavy streaming path.']],
  deep: [['Technique', 'Offline transcode into many segmented renditions → object store → CDN; player-driven ABR; a playback service for auth/DRM/steering; separate catalog and recommendation systems.'],
    ['Failure mode', 'Treating transcoding as real-time, under-investing in CDN, single-rendition files (no ABR), and ignoring DRM.'],
    ['In interviews', 'Contrast with YouTube (curated vs UGC), emphasize CDN/ABR as the core, and mention Open Connect for cost/latency.']],
  src: ['Netflix Open Connect', 'https://openconnect.netflix.com/en/'] });

SDX('case-maps', { name: 'Design Google Maps', cat: 'sdcase',
  blurb: `Google Maps serves map tiles, finds places, and computes routes with live traffic. The design combines pre-rendered map tiles on a CDN, a geospatial place index, and a routing engine over a road graph that incorporates real-time traffic from aggregated user location data.`,
  facts: [['Pieces', 'tiles, search, routing, traffic'], ['Tiles', 'pre-rendered, zoom levels, CDN'], ['Routing', 'graph + Dijkstra/A* + contraction'], ['Traffic', 'aggregated live GPS → edge weights']],
  cheat: [['Map tiles', 'Pre-rendered images per zoom/x/y, on CDN'], ['Geo index', 'Find places near a point (geohash/S2/quadtree)'], ['Road graph', 'Nodes=intersections, edges=roads (weights=time)'], ['Routing', 'Dijkstra/A*; precomputed (contraction hierarchies)'], ['Live traffic', 'Aggregate user GPS → update edge weights'], ['ETA', 'Sum edge times incl. current traffic'], ['Tiles @ scale', 'Serve from CDN; render offline'], ['Search', 'Geocoding: text ↔ coordinates'], ['Sharding', 'By geography (region)'], ['Privacy', 'Aggregate/anonymize location data']],
  sections: [
    ['Requirements & the three subsystems', PP(`<b>Functional:</b> display the map (pan/zoom), <b>search</b> for places/addresses, and get <b>directions with an ETA</b> that reflects current traffic. These are three fairly independent subsystems: <b>tile serving</b> (the map imagery), a <b>geospatial place index</b> (search/geocoding), and a <b>routing engine</b> over a road graph. It’s very <b>read-heavy</b>, latency-sensitive, and global.`)],
    ['Map tiles and place search', PP(`The map is divided into <b>tiles</b> — small images for each <b>zoom level</b> and (x, y) grid cell. Tiles are <b>pre-rendered offline</b> and served from a <b>CDN</b> (they rarely change), so panning/zooming is just fetching cached images — the base map needs almost no real-time computation. <b>Search/geocoding</b> uses a <b>geospatial index</b> (geohash, Google’s S2, or a quadtree) to answer "places near here" and to translate text ↔ coordinates.`)],
    ['Routing and live traffic', PP(`Directions run over a <b>road graph</b>: <b>nodes</b> are intersections, <b>edges</b> are road segments weighted by <b>travel time</b>. A shortest-path algorithm (<b>Dijkstra/A*</b>) finds the best route, but on a continent-sized graph that’s too slow per request, so the graph is <b>preprocessed</b> (e.g. <b>contraction hierarchies</b>) to answer queries in milliseconds. <b>Live traffic</b> comes from <b>aggregating anonymized GPS</b> from many users’ devices to estimate current speeds, which <b>update the edge weights</b> — so routes and <b>ETAs</b> reflect real conditions and reroute around jams.`)]
  ],
  snipTitle: 'Routing on a weighted road graph', snipNote: 'A* over edges whose weights are travel times updated by live traffic.',
  snips: [['routing.py', 'python', `import heapq

# edges[u] = list of (v, base_time); traffic[(u,v)] multiplies the weight.
def travel_time(u, v, edges_weight, traffic):
    return edges_weight[(u, v)] * traffic.get((u, v), 1.0)   # live multiplier

def a_star(start, goal, graph, edges_weight, traffic, heuristic):
    pq = [(0, start)]
    best = {start: 0}
    while pq:
        est, u = heapq.heappop(pq)
        if u == goal:
            return best[goal]                  # ETA in minutes
        for v in graph[u]:
            t = best[u] + travel_time(u, v, edges_weight, traffic)
            if t < best.get(v, float("inf")):
                best[v] = t
                # heuristic = straight-line time to goal (admissible)
                heapq.heappush(pq, (t + heuristic(v, goal), v))
    return None
# Real systems precompute contraction hierarchies so this runs in ~ms on huge graphs.`]],
  dg: { w: 780, h: 320, n: [
    ['user', 'User', 70, 160, 'user'],
    ['gw', 'API gateway', 210, 160, 'gw'],
    ['tiles', 'Tile service', 370, 70, 'svc'],
    ['cdn', 'CDN', 540, 70, 'cdn', 'map tiles'],
    ['search', 'Place search', 370, 160, 'svc', 'geo index'],
    ['route', 'Routing engine', 370, 250, 'svc', 'road graph'],
    ['traffic', 'Traffic aggregator', 560, 250, 'worker', 'live GPS'],
    ['store', 'Tile store', 690, 70, 'store'] ],
    e: [
      ['user', 'gw', ''],
      ['gw', 'tiles', 'map', 'u'],
      ['tiles', 'cdn', ''],
      ['cdn', 'store', 'origin', 'd'],
      ['gw', 'search', 'places'],
      ['gw', 'route', 'directions', 'n'],
      ['traffic', 'route', 'edge weights', 'b'],
      ['user', 'traffic', 'anon GPS', 'N'] ] },
  cap: 'Pre-rendered map tiles are served from a CDN; place search uses a geospatial index; the routing engine computes paths over a weighted road graph whose edge weights are continuously updated by a traffic aggregator fed by anonymized user GPS.',
  walk: [
    [['user', 'gw'], 'All requests enter through the API gateway, which routes to the right subsystem.'],
    [['gw', 'tiles', 'cdn', 'tiles>cdn'], 'Panning/zooming the map fetches pre-rendered tiles — served from the CDN, rendered offline, so the base map needs no live computation.'],
    [['gw', 'search', 'gw>search'], 'Searching for a place or address hits the geospatial place index (geocoding).'],
    [['gw', 'route', 'gw>route'], 'Requesting directions goes to the routing engine, which runs shortest-path over the road graph.'],
    [['user', 'traffic', 'user>traffic'], 'Meanwhile, anonymized GPS from many users is aggregated to estimate current road speeds.'],
    [['traffic', 'route', 'traffic>route'], 'Live traffic updates the graph’s edge weights, so routes and ETAs reflect real conditions and reroute around jams.'] ],
  edge: [`<b>Tiles are pre-rendered and cached</b>, not drawn per request — treating the base map as real-time rendering would never scale.`, `Naive <b>Dijkstra on a continent-sized graph</b> is too slow per query — real routing <b>preprocesses</b> the graph (contraction hierarchies/ALT) for millisecond responses.`, `<b>Live traffic</b> requires aggregating huge volumes of GPS; it must be <b>anonymized/aggregated</b> for privacy and sampled, not stored per-user forever.`, `<b>ETA ≠ distance</b> — weight edges by <b>time</b> under current traffic, including turn costs and road types, or ETAs are wrong.`, `The road graph <b>changes</b> (closures, new roads); updates and traffic make edge weights dynamic, so precomputation must be refreshable.`],
  faq: [['How does Google Maps compute routes fast on a graph with hundreds of millions of roads?', PP(`By <b>preprocessing the road graph offline</b> so that online queries don’t have to explore the whole map. A plain <b>Dijkstra</b> or even <b>A*</b> search over a continent-scale graph would touch far too many nodes to answer in the tens of milliseconds users expect. The standard techniques <b>precompute shortcuts and hierarchy</b> so queries skip over vast regions. <b>Contraction Hierarchies (CH)</b> are the best-known: nodes are ranked by "importance," and the graph is augmented with <b>shortcut edges</b> that summarize paths through less-important nodes, so a query only climbs up to important (highway-like) nodes and back down — turning a cross-country route into a search over a tiny fraction of the graph. Related methods (ALT with landmarks, highway hierarchies, and partition-based approaches used by Google) achieve the same goal. At query time you still run an A*-style search, but over the <b>contracted graph with its shortcuts</b>, which returns in milliseconds. The cost is the <b>preprocessing</b> (expensive, done offline) and the need to <b>refresh</b> it as the map and, importantly, <b>traffic</b> change — which is why production systems combine precomputed hierarchies with mechanisms to incorporate dynamic edge weights without fully recomputing everything.`)],
    ['How does live traffic get into the ETA?', PP(`Live traffic is produced by <b>aggregating anonymized location data from a huge number of devices</b> and folding the result into the routing graph as <b>dynamic edge weights</b>. Phones running Maps (and Android devices that opt in) continuously report <b>anonymized GPS traces</b>; the system matches these traces to road segments and <b>aggregates</b> them to estimate the <b>current average speed</b> on each segment — crucially in aggregate, not per individual, for privacy. Those estimates become a <b>traffic multiplier (or absolute time)</b> on each edge of the road graph, so a segment that normally takes 2 minutes but is congested might now weight 6. The <b>routing engine weights edges by travel <i>time</i> under current traffic</b> (not static distance), so the shortest-path/A* search naturally prefers faster roads and <b>reroutes around jams</b>, and the <b>ETA</b> is just the sum of the (traffic-adjusted) edge times along the chosen route — optionally corrected by ML models trained on historical actual-vs-predicted times. Because weights change continuously, the engine must incorporate these dynamic updates on top of its precomputed hierarchy, and it can also use predicted future traffic for long routes (what the roads will be like when you actually reach them). This feedback loop — users’ own movement data improving everyone’s ETAs — is what makes the traffic layer both accurate and self-sustaining.`)]],
  qs: [SQ('Map tiles are…', ['Rendered live on every request', 'Pre-rendered per zoom/x/y and served from a CDN', 'Stored in a SQL database and drawn with queries', 'Computed by the routing engine'], 1, 'Tiles are pre-rendered offline and cached on a CDN, so the base map needs no live compute.'),
    SQ('To answer routing queries in milliseconds on a huge road graph, you…', ['Run plain Dijkstra each time', 'Preprocess the graph (e.g. contraction hierarchies) for fast queries', 'Store all routes in a cache', 'Use a relational JOIN'], 1, 'Precomputed shortcuts/hierarchy let queries skip most of the graph.')]
});
DP('case-maps', {
  fu: [['What is S2 / geohashing used for here?', 'They map 2D locations to 1D sortable cells so "nearby" becomes a range/prefix query — used for place search, spatial indexing, and sharding map data by region. Google uses S2 cells specifically.'],
    ['How are turn restrictions and road types modeled?', 'As edge attributes and turn costs in the graph (one-ways, no-left-turns, speed limits, road class); the weight function accounts for them so routes are legal and realistic, not just shortest distance.'],
    ['How does predictive ETA work for long trips?', 'For a route that takes hours, current traffic isn’t enough; models predict future traffic per segment based on time-of-day/day-of-week patterns, so the ETA reflects conditions when you’ll actually arrive at each segment.']],
  deep: [['Technique', 'Pre-render tiles to a CDN; index places geospatially (S2/geohash); route over a weighted road graph with precomputed hierarchies; feed anonymized aggregated GPS into dynamic edge weights for traffic/ETA.'],
    ['Failure mode', 'Live-rendering tiles, naive Dijkstra per request, distance-based (not time-based) weights, and mishandling location privacy.'],
    ['In interviews', 'Separate the three subsystems, emphasize precomputation (tiles, routing hierarchies) and the aggregated-GPS traffic loop.']],
  src: ['Google S2 geometry (overview)', 'https://s2geometry.io/'] });

SDX('case-logging', { name: 'Design a distributed logging system', cat: 'sdcase',
  blurb: `A distributed logging/observability system collects logs from thousands of services, ships them through a buffer, indexes them for search, and stores them cost-effectively with retention tiers. It’s a high-throughput, write-heavy pipeline (think ELK or Loki) where ingestion and search are in tension.`,
  facts: [['Workload', 'write-heavy, huge volume'], ['Pipeline', 'agent → buffer → index → store'], ['Buffer', 'Kafka absorbs spikes'], ['Tension', 'index for search vs cheap storage']],
  cheat: [['Agent/shipper', 'Runs on each host; tails and forwards logs'], ['Buffer', 'Kafka/queue decouples producers from indexers'], ['Ingestion pipeline', 'Parse, enrich, structure (JSON)'], ['Index', 'Inverted index for search (Elasticsearch)'], ['Hot/warm/cold', 'Tiered storage by age'], ['Object store', 'Cheap long-term log archive'], ['Retention', 'TTL/rollups; logs are mostly write-once'], ['Query', 'Search by service/time/trace id'], ['Backpressure', 'Buffer + drop/sample under overload'], ['Scale', 'Partition by service/time; shard the index']],
  sections: [
    ['Requirements & the pipeline', PP(`<b>Functional:</b> collect logs from thousands of services/hosts, make them <b>searchable</b> (by service, time range, level, trace id), and <b>retain</b> them for a configurable window. <b>Non-functional:</b> extremely <b>write-heavy and bursty</b>, must not lose important logs, must not slow down the apps producing them, and must be <b>cost-efficient</b> at petabyte scale. The system is a <b>pipeline</b>: <code>agent → buffer → process/index → store → query</code>.`)],
    ['Ingestion: agents and a buffer', PP(`An <b>agent/shipper</b> on each host (Fluentd, Filebeat, Vector) tails log files/stdout and forwards them — asynchronously, so logging never blocks the app. All logs flow into a <b>buffer</b> (<b>Kafka</b> or similar) that <b>absorbs spikes</b> and <b>decouples</b> producers from the slower indexing stage; if indexing falls behind, the buffer holds the backlog instead of dropping logs or stalling services. A <b>processing</b> stage parses/structures the logs (into JSON), enriches them (host, service, trace id), and routes them.`)],
    ['Indexing, storage tiers, and the core trade-off', PP(`The central tension: <b>searching</b> logs wants an <b>inverted index</b> (Elasticsearch/OpenSearch) which is fast to query but <b>expensive</b> to build and store; <b>cheap storage</b> wants plain compressed files in <b>object storage</b> which are cheap but slow to search. The usual answer is <b>tiered retention</b>: recent logs go to a <b>hot</b> indexed tier (fast search, days), then roll to a <b>warm</b> tier, then to a <b>cold</b> object-store archive (cheap, searchable slowly, weeks–months), with <b>TTL</b> deleting the oldest. You also <b>partition</b> by service/time and <b>shard</b> the index, and under extreme load you <b>sample or drop</b> low-value logs (backpressure) to protect the pipeline.`)]
  ],
  snipTitle: 'The ingestion pipeline, conceptually', snipNote: 'Agents produce to Kafka; indexers consume, structure, and route to tiers.',
  snips: [['pipeline.py', 'python', `# Producer side: the agent forwards structured log lines to Kafka (async).
def agent_forward(producer, raw_line, host, service):
    event = {
        "ts": now_iso(), "host": host, "service": service,
        "level": parse_level(raw_line), "msg": raw_line,
        "trace_id": extract_trace_id(raw_line),
    }
    producer.send("logs", key=service, value=event)   # partition by service

# Consumer side: indexers pull from Kafka and route by age/importance.
def index_worker(consumer, hot_index, cold_store):
    for event in consumer:                 # Kafka buffers spikes for us
        enrich(event)                      # add geo, deployment, etc.
        hot_index.add(event)               # inverted index: fast recent search
        cold_store.append(event["service"], event)   # cheap archive (compressed)
# A lifecycle job later rolls hot -> warm -> cold and applies TTL deletion.`]],
  dg: { w: 780, h: 320, n: [
    ['svcs', 'Services', 70, 90, 'svc', 'many hosts'],
    ['agent', 'Log agents', 220, 90, 'worker', 'tail+ship'],
    ['kafka', 'Kafka buffer', 380, 90, 'queue', 'absorbs spikes'],
    ['idx', 'Indexers', 540, 90, 'worker', 'parse+enrich'],
    ['hot', 'Hot index', 690, 90, 'db', 'search (days)'],
    ['cold', 'Object store', 690, 240, 'store', 'cold archive'],
    ['user', 'Engineer', 380, 240, 'user'],
    ['query', 'Query service', 540, 240, 'svc'] ],
    e: [
      ['svcs', 'agent', 'logs'],
      ['agent', 'kafka', 'produce'],
      ['kafka', 'idx', 'consume'],
      ['idx', 'hot', 'index recent'],
      ['idx', 'cold', 'archive', 'n'],
      ['user', 'query', 'search'],
      ['query', 'hot', 'recent', 'u'],
      ['query', 'cold', 'old', 'n'] ] },
  cap: 'Agents on each host ship logs into a Kafka buffer that absorbs spikes; indexers parse and route recent logs to a hot searchable index and archive everything cheaply to object storage; a query service searches the right tier by age.',
  walk: [
    [['svcs', 'agent', 'svcs>agent'], 'Agents on each host tail logs and forward them asynchronously, so logging never blocks the application.'],
    [['agent', 'kafka', 'agent>kafka'], 'All logs flow into a Kafka buffer that absorbs bursts and decouples producers from the slower indexing stage.'],
    [['kafka', 'idx', 'kafka>idx'], 'Indexer workers consume from Kafka, parse and enrich the logs into structured events.'],
    [['idx', 'hot', 'idx>hot'], 'Recent logs go into a hot inverted index for fast search (retained for days).'],
    [['idx', 'cold', 'idx>cold'], 'Everything is also archived cheaply to object storage; a lifecycle job rolls hot → warm → cold and applies TTL.'],
    [['user', 'query', 'hot', 'cold', 'query>hot', 'query>cold'], 'Engineers search via the query service, which hits the hot index for recent logs and the cold archive for older ones.'] ],
  edge: [`<b>Logging must never block the app</b> — agents forward asynchronously and a buffer absorbs spikes; synchronous shipping couples app latency to the logging pipeline.`, `<b>Indexing everything is expensive</b> — use tiered retention (hot index for recent, cheap object store for old) rather than keeping all logs hot.`, `Under <b>overload</b>, protect the pipeline with <b>backpressure</b>: buffer, then <b>sample or drop</b> low-value logs rather than falling over or losing critical ones.`, `<b>Structure logs</b> (JSON with service/level/trace id) at ingestion — unstructured text is slow and painful to search and correlate.`, `Correlating a request across services needs a <b>trace id</b> propagated through calls; without it, searching is guesswork (this is where tracing complements logging).`],
  faq: [['Why put a buffer like Kafka between the log agents and the indexers?', PP(`Because log volume is <b>enormous, bursty, and spiky</b>, while the <b>indexing stage is slower and has limited capacity</b> — and you can’t let either the apps or the indexers be the bottleneck. A <b>buffer (Kafka)</b> sits in the middle and provides three things. First, <b>decoupling</b>: agents just need to produce to Kafka (fast, append-only), and indexers consume at their own pace; neither has to match the other’s speed in real time. Second, <b>spike absorption / backpressure</b>: when a traffic surge or an incident causes a flood of logs (exactly when logs matter most), Kafka <b>holds the backlog durably</b> and the indexers drain it as fast as they can — instead of dropping logs or, worse, slowing down the applications that are emitting them. Third, <b>durability and replay</b>: if an indexer crashes or you need to re-index into a new store, the logs are still in Kafka (within its retention) to be re-consumed. Without the buffer, a slow or down indexer would force agents to either block (coupling app latency to logging — unacceptable) or discard data. Partitioning the Kafka topic (e.g. by service) also lets you <b>scale consumers horizontally</b>. This producer → buffer → consumer shape is the backbone of essentially every large logging/metrics pipeline.`)],
    ['How do you make petabytes of logs both searchable and affordable?', PP(`By recognizing that <b>search speed and storage cost are in direct tension</b> and resolving it with <b>tiered retention</b> rather than treating all logs the same. Fast search needs an <b>inverted index</b> (Elasticsearch/OpenSearch-style): it makes "find errors for service X with this trace id in the last hour" return in milliseconds, but building and storing that index is <b>expensive</b> (CPU to index, lots of RAM/SSD to keep it hot) — far too costly to keep every log of all time indexed. Cheap storage is the opposite: compressed log files in <b>object storage</b> (S3-style) cost almost nothing per terabyte but are <b>slow to search</b>. The standard resolution is a <b>hot/warm/cold lifecycle</b> based on log age and access patterns: <b>hot</b> = recent logs (hours to days) fully indexed for fast interactive search, since that’s what engineers query during incidents; <b>warm</b> = somewhat older logs on cheaper hardware with reduced indexing; <b>cold</b> = older logs rolled to compressed object storage, searchable but slowly, for compliance/forensics; and finally <b>TTL deletion</b> of anything past the retention window. Logs are essentially <b>write-once, read-rarely-and-recently</b>, so this matches cost to value. You further control cost with <b>sampling/dropping</b> low-value logs under load, <b>rollups/aggregation</b> of repetitive lines, compression, and <b>partitioning by service and time</b> so queries and lifecycle operations only touch relevant shards. Newer systems (e.g. Grafana Loki) push this further by <b>indexing only metadata/labels</b> and storing the raw log bodies cheaply, trading some query flexibility for big cost savings — the same principle of "index the little you need to find things, store the bulk cheaply."`)]],
  qs: [SQ('Why place Kafka between log agents and indexers?', ['To encrypt logs', 'To absorb spikes and decouple fast producers from slower indexing (backpressure + durability)', 'To render dashboards', 'To replace the index'], 1, 'The buffer holds bursts durably so apps never block and logs aren’t dropped.'),
    SQ('To keep petabytes of logs affordable while searchable, you…', ['Index all logs forever', 'Use tiered retention: hot index for recent, cheap object store for old, with TTL', 'Store everything in RAM', 'Never index anything'], 1, 'Match cost to value: index recent logs; archive/delete old ones cheaply.')]
});
DP('case-logging', {
  fu: [['How do logs, metrics, and traces differ?', 'Logs are discrete event records (text/JSON); metrics are numeric time series (counts, latencies) cheap to store/aggregate; traces follow one request across services via a trace id. Observability combines all three; this design is the logs pipeline.'],
    ['What does Grafana Loki do differently from ELK?', 'Loki indexes only labels/metadata (not full log text) and stores raw logs cheaply in object storage, drastically cutting cost at the expense of full-text search flexibility — a different point on the search-vs-cost trade-off.'],
    ['How do you handle sudden log floods during incidents?', 'The buffer absorbs the burst; apply sampling/rate-limiting for noisy sources, prioritize error-level logs, and scale indexer consumers. Never let the logging pipeline degrade the services it monitors.']],
  deep: [['Technique', 'agent → Kafka buffer → indexers → hot index + cold object store, with tiered retention/TTL, structured logs, trace-id correlation, and backpressure/sampling under load.'],
    ['Failure mode', 'Synchronous shipping blocking apps, indexing everything (cost blowout), unstructured logs, and dropping critical logs under overload.'],
    ['In interviews', 'Draw the pipeline, justify the Kafka buffer (spikes/decoupling), and resolve the search-vs-cost tension with tiered retention.']],
  src: ['Grafana Loki: architecture', 'https://grafana.com/docs/loki/latest/get-started/architecture/'] });
