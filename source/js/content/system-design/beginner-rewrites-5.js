/* ===== Beginner-first rewrites — batch 5 (case studies: Instagram, food delivery, Netflix, Maps, logging). ===== */

/* ---------------- Instagram ---------------- */
SDX('case-instagram', { name: 'Design Instagram', cat: 'sdcase',
  blurb: `We’re building a photo-and-video sharing app with a home feed: people post pictures, follow others, and open the app to a stream of recent posts from everyone they follow. Almost everything is <b>viewing</b> rather than posting, so the two things we have to nail are serving images fast and cheaply, and building each person’s feed without melting when a celebrity posts.`,
  facts: [['The traffic shape', 'hugely more viewing than posting'], ['Where photos live', 'bulk storage + a CDN (never the database)'], ['How feeds are built', 'hybrid fan-out (push + pull)'], ['The scaling headache', 'celebrity accounts']],
  sections: [
    ['What are we building?', PLAIN(`Instagram lets people upload photos/videos, follow accounts, and scroll a <b>home feed</b> of recent posts from those accounts (plus likes and comments). The design is dominated by two realities: it’s overwhelmingly <b>read-heavy</b> (far more people looking than posting), and a little staleness is fine (a new post showing up a few seconds late is no problem). That gives us freedom to make viewing cheap at the cost of a bit of delay.`) +
      ANALOGY(`Think of a giant magazine stand with a personalised magazine for every reader. When an ordinary person posts, helpers slip a copy of that post into the magazine of each of their followers, so opening your magazine is instant — it’s already assembled. The trouble is a megastar with 50 million followers: you can’t slip 50 million copies in every time they post. For those few, you fetch their latest posts on the spot when a follower opens their magazine. That mix is the whole trick.`)],
    ['Words you’ll need', KEYTERMS([
      ['Read-heavy', 'Far more reads (views) than writes (posts). It tells us to make reading cheap, even if that makes posting do more work.'],
      ['Object storage', 'Cheap, effectively infinite bulk storage for large files (photos, videos) — an S3-style blob store. Files go here, not in the database.'],
      ['CDN', 'A network of caches near users that serve the actual image bytes, so most views never reach your servers.'],
      ['Metadata', 'The small facts about a post — who posted it, the caption, and a link to where the image lives. This is what the database holds.'],
      ['Fan-out', 'Delivering one new post to many followers. “On write” = do it when posting; “on read” = do it when a follower opens the app.'],
      ['Feed cache', 'A ready-made list of recent post IDs per user, kept in fast memory (Redis), so loading a feed is one quick lookup.']])],
    ['Serving media: three layers, not the database', WHY(`Photos and videos are large, unchanging blobs — totally unlike the small records a database is good at. Stuffing them into the database would bloat it, slow every query, and cost a fortune. So we split into three layers: the <b>database</b> holds only tiny <b>metadata</b> (post, author, caption, and a URL); the <b>object store</b> holds the actual files, once each; and a <b>CDN</b> caches those files near users so the vast majority of views are served from a nearby edge in milliseconds. Thumbnails and resized versions are generated <b>in the background</b> so uploads stay fast.`)],
    ['Building the feed: hybrid fan-out', PP(`How do you make opening the app instant when you follow hundreds of accounts? You don’t gather posts at read time for everyone — that’s too slow. Instead:`) +
      BSTEPS([
        ['Push for normal accounts (fan-out on write)', PP(`When an ordinary user posts, background workers <b>push</b> that post’s ID into each follower’s <b>feed cache</b> — a ready-made list. Reading a feed is then a single cheap lookup. Perfect for the read-heavy common case.`)],
        ['Pull for celebrities (fan-out on read)', PP(`A megastar with millions of followers would trigger millions of writes per post. So their posts are <b>not</b> pushed. Instead, when you open your feed, the system <b>pulls</b> the recent posts of the few celebrities you follow and merges them in by time.`)],
        ['Merge and show', PP(`Your feed = your pre-built list (normal follows) + freshly pulled celebrity posts, sorted by time. Instant for the common case, bounded cost for the rare one.`)]])],
    ['Keeping it correct and cheap', UL([
      `Feeds are <b>eventually consistent</b> — a few seconds’ delay is fine and far cheaper than guaranteeing instant consistency.`,
      `<b>Likes and comments</b> are high-write and can create a hot spot on one popular post; keep them as split (“sharded”) counters summed on read, not one row everyone fights over.`,
      `The <b>social graph</b> (who follows whom) is itself big and hot — it gets sharded and its follower counts cached.`]),
      RECAP([
        `Instagram is read-heavy with relaxed consistency, so the design makes <b>viewing</b> cheap at the cost of extra work when posting.`,
        `Media uses <b>three layers</b>: small metadata in the database, the actual files in <b>object storage</b>, and delivery via a <b>CDN</b> — never blobs in the DB.`,
        `Feeds use a <b>hybrid fan-out</b>: push posts into followers’ ready-made feeds for normal accounts, pull-and-merge for celebrities.`,
        `Thumbnails are generated in the background; feeds are eventually consistent.`,
        `Watch out for hot spots — popular posts’ like/comment counts and the follower graph both need sharding/caching.`])]
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
    ['feed', 'Feed cache', 690, 140, 'cache', 'ready-made timelines'] ],
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
  cap: 'Uploading writes the photo to object storage and only a small record to the database; a fan-out queue pushes new posts into followers’ ready-made feeds; reading serves images from the CDN and the feed from the feed cache.',
  walk: [
    [['u', 'lb', 'api'], 'A request comes in: images are fetched through the CDN, and app actions go through the load balancer to the app servers.'],
    [['api', 'media', 'api>media'], 'On upload, the photo itself goes to object storage — cheap, unchanging blobs — never into the database.'],
    [['api', 'meta', 'api>meta'], 'Only a small record (author, caption, image URL) is written to the metadata database.'],
    [['api', 'q', 'q', 'work', 'api>q'], 'A fan-out job is queued; background workers push the new post’s ID into each follower’s ready-made feed.'],
    [['work', 'feed', 'work>feed'], 'For ordinary accounts this “push on write” fills the feed cache ahead of time, so reads are instant.'],
    [['u', 'cdn', 'api', 'feed', 'api>feed'], 'Reading is cheap: images come from the CDN and the feed from the feed cache — celebrity posts are pulled and merged at read time.'] ],
  qs: [SQ('How does Instagram handle a celebrity with tens of millions of followers in the feed?', ['Push each post to all millions of followers (fan-out on write)', 'Don’t push — pull and merge their recent posts at read time (fan-out on read)', 'Block celebrity posts', 'Store feeds in a SQL database'], 1, 'Pure push is far too expensive for millions of followers; pull-and-merge bounds the cost.'),
    SQ('Where should uploaded photos and videos be stored?', ['In the relational database as blobs', 'In object storage, served through a CDN, with only small metadata in the database', 'In the feed cache', 'On each app server’s local disk'], 1, 'Blobs go to object storage + CDN; the database keeps a tiny record and a URL.')]
});

/* ---------------- Food delivery ---------------- */
SDX('case-fooddelivery', { name: 'Design a food delivery system', cat: 'sdcase',
  blurb: `We’re building a food-delivery platform (think DoorDash or Uber Eats) that ties together three kinds of people: customers ordering, restaurants cooking, and couriers delivering. The hard parts are finding a good nearby courier fast, tracking the order live on a map, and keeping one shared “where is my order” truth that three different apps all agree on.`,
  facts: [['Three sides', 'customer · restaurant · courier'], ['The core problem', 'find a nearby courier fast'], ['Live updates', 'order status + a moving map dot'], ['The shared truth', 'an order “state machine”']],
  sections: [
    ['What are we building?', PLAIN(`A food-delivery app coordinates <b>three independent parties</b>, each with their own app: the <b>customer</b> browses and orders, the <b>restaurant</b> confirms and cooks, and the <b>courier</b> picks up and delivers. Behind them sit a few services — one that owns the <b>order’s life story</b>, one that <b>finds and assigns couriers</b>, and one that tracks everyone’s <b>GPS</b> — plus payments and notifications.`) +
      ANALOGY(`Picture an old-school dispatcher with a radio and a map of taxis. When a meal is ready, they glance at the map squares near the restaurant, radio the closest free driver, and if that driver doesn’t answer, try the next. All the while, three people want to know what’s happening — the hungry customer, the busy kitchen, and the driver — so the dispatcher keeps one clear status (“ordered → cooking → on the way → delivered”) that everyone can see update live.`)],
    ['Words you’ll need', KEYTERMS([
      ['Geospatial matching', 'Finding who (a courier) is physically near a point (the restaurant), quickly, without checking everyone.'],
      ['Geohash / quadtree', 'Ways to chop the map into cells and index couriers by cell, so “who’s nearby?” becomes “look in this cell and its neighbours.” (Same idea as the ride-hailing design.)'],
      ['Dispatch', 'The step that takes the nearby candidates and picks the best one — by how soon they’d arrive, how busy they are, their rating — then offers them the job.'],
      ['ETA', 'Estimated time of arrival by road, used to rank couriers (not straight-line distance).'],
      ['State machine', 'A strict model of an order’s stages and which moves between them are legal, so you can never reach a nonsense state like “delivered before picked up.”'],
      ['Push channel (WebSocket)', 'An always-open connection used to stream live status and the courier’s moving location to the apps, without them constantly asking.']])],
    ['The core problem: matching an order to a nearby courier', WHY(`When an order is ready, you must find a good courier <b>near the restaurant</b> — and scanning every courier in the city per order would be hopeless. So couriers continuously stream their GPS into a <b>location service</b> that keeps a <b>geospatial index</b> (couriers grouped by map cell). Finding candidates is then “look in the restaurant’s cell <b>plus neighbouring cells</b>” (neighbours matter — a courier just over a boundary is still close). <b>Dispatch</b> ranks those few candidates by road ETA, current load and rating, and <b>offers</b> the job with a short timeout, falling back to the next on a decline.`)],
    ['The order’s life story: a state machine', PP(`Because three parties all touch one order, you need a disciplined model or you get contradictions. An order is a <b>state machine</b>:`) +
      PP(`<code>placed → confirmed → preparing → ready → picked-up → en-route → delivered</code> (with cancel/refund paths).`) +
      BSTEPS([
        ['Each move is triggered by one party', PP(`The restaurant moves it to “preparing” and “ready”; the courier moves it to “picked-up” and “delivered.” Only legal moves are allowed, so you can’t mark “delivered” before “picked-up.”`)],
        ['Each move notifies the others', PP(`Every transition <b>publishes an event</b> that pushes real-time updates: the customer sees “preparing → on the way,” the courier gets the pickup assignment, the restaurant sees new orders.`)],
        ['Live tracking rides the same channel', PP(`The courier’s GPS streams through the location service and out to the watching customer as a moving dot on the map — over a push connection, so there’s no polling.`)]])],
    ['The practical details', UL([
      `<b>Location writes are huge</b> (every courier every few seconds): keep them in an in-memory geo store (Redis GEO), throttle the pings, and don’t save every GPS point to the main database.`,
      `A courier <b>declining or timing out</b> must re-dispatch instantly, or orders stall — give offers a short time-to-live and a fallback ranking.`,
      `<b>Payment</b> is usually authorized when the order is placed and captured on delivery; cancellations and refunds are part of the state machine.`]),
      RECAP([
        `A food-delivery system coordinates three parties (customer, restaurant, courier) through a few services: orders, dispatch, location, payments, notifications.`,
        `Match orders to couriers with a <b>geospatial index</b> (search the restaurant’s cell <b>plus neighbours</b>), then <b>dispatch</b> ranks by ETA/load/rating and offers with a timeout.`,
        `Model the order as a <b>state machine</b> so three parties can’t create contradictory states; each transition <b>pushes real-time updates</b>.`,
        `Stream the courier’s live location over a push channel for the moving-map experience.`,
        `Keep live locations in memory (don’t persist every ping), re-dispatch quickly on declines, and authorize payment up front, capture on delivery.`])]
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
  cap: 'Orders flow through the order service (life story + database); when food is ready, dispatch asks the location service’s geo index for nearby couriers and offers the job to the best; couriers stream GPS, and every status change pushes updates to all three parties.',
  walk: [
    [['cust', 'gw', 'order', 'db'], 'The customer places an order; the order service records it and starts the state machine.'],
    [['order', 'dispatch', 'order>dispatch'], 'When the restaurant marks the food ready, the order service asks dispatch to find a courier.'],
    [['dispatch', 'loc', 'geo', 'loc>geo'], 'Dispatch asks the location service’s geo index for couriers near the restaurant (that cell plus its neighbours).'],
    [['cour', 'loc', 'cour>loc'], 'Couriers continuously stream GPS to the location service, keeping the index fresh.'],
    [['dispatch', 'cour'], 'Dispatch ranks candidates by ETA, load and rating and offers the job to the best one, retrying on a decline.'],
    [['order', 'notify', 'cust', 'cour', 'order>notify'], 'Every state change pushes real-time updates — the customer sees status and a moving map dot; the courier gets the assignment.'] ],
  qs: [SQ('What’s the core technique for assigning an order to a courier?', ['Random assignment', 'A geospatial index (geohash/quadtree) to find nearby couriers, then ranking by ETA/load/rating', 'Alphabetical by courier name', 'Round-robin through every courier'], 1, 'A geo index finds nearby couriers fast; dispatch ranks and offers to the best.'),
    SQ('Why model the order as a strict state machine?', ['It looks neater in diagrams', 'Three different parties change the order, so explicit legal transitions prevent contradictory states like “delivered before picked up”', 'It makes the database smaller', 'It encrypts the order'], 1, 'With three actors touching one order, only defined transitions keep a single consistent truth.')]
});

/* ---------------- Netflix ---------------- */
SDX('case-netflix', { name: 'Design Netflix (video streaming)', cat: 'sdcase',
  blurb: `We’re building a service that streams a <b>curated, pre-recorded</b> catalogue of films and shows to a huge global audience. Unlike YouTube, nobody’s uploading at random — content is added in controlled batches — so the real-time pressure isn’t on taking videos <i>in</i>, it’s on getting enormous amounts of video <i>out</i> smoothly and cheaply. Delivery is the whole game.`,
  facts: [['The workload', 'read-heavy, bandwidth-dominated'], ['Preparing a title', 'convert it into many versions, ahead of time'], ['What makes it possible', 'a massive CDN (Netflix’s Open Connect)'], ['Smooth playback', 'adaptive bitrate — the player adjusts quality']],
  sections: [
    ['What are we building?', PLAIN(`A streaming service lets people browse a catalogue, press play, resume where they left off, and get recommendations. It is extremely <b>read-heavy</b> and <b>bandwidth-dominated</b> — streaming video is a giant share of all internet traffic. Because the catalogue is <b>curated and pre-recorded</b>, preparing a title is <b>offline work done ahead of time</b>; the hard, real-time challenge is <b>delivery</b> — pushing the bytes to millions of screens without buffering, affordably.`) +
      ANALOGY(`Imagine a film studio that, long before anyone watches, makes copies of each film at several picture qualities, cuts them into short reels, and ships them to a little cinema inside every town (often literally inside your internet provider’s building). When you press play, the reels come from the cinema nearest you, and if your connection dips, the projector quietly switches to a slightly blurrier reel so the film never stops. All the hard work happened earlier; watching is just fetching nearby reels.`)],
    ['Words you’ll need', KEYTERMS([
      ['Transcoding', 'Converting one master file into many versions (resolutions, bitrates, formats) so every device and network can play one of them.'],
      ['Rendition', 'One such version — e.g. the 480p version or the 4K version.'],
      ['Segment', 'Each rendition is cut into short clips (a few seconds) so the player can fetch a little at a time and switch quality between clips.'],
      ['Manifest', 'A small index file listing the available renditions and segments, so the player knows what to request.'],
      ['CDN (Open Connect)', 'The worldwide network of caches that actually serve the video. Netflix runs its own and places boxes inside internet providers, right next to viewers.'],
      ['Adaptive bitrate (ABR)', 'The player measures your current speed and picks the best quality for each next segment — the mechanism that avoids buffering.'],
      ['DRM', 'Digital rights management — the licensing that lets only paying subscribers actually decode and play a title.']])],
    ['Stage 1 — preparing a title (offline)', PP(`A single master file can’t serve every device, so each title runs through a <b>transcoding pipeline</b>: encode it into many <b>renditions</b> (240p up to 4K, several bitrates and formats) and cut each into short <b>segments</b>, with a <b>manifest</b> describing them. This is big, parallel <b>batch</b> work done well before anyone watches — split the video, convert pieces across a fleet, reassemble. Everything lands in <b>object storage</b> and is pushed out to the CDN.`)],
    ['Stage 2 — delivery (the whole game)', WHY(`At this scale the bytes-out number is staggering, and no central data centre can push it. So video segments are served from a <b>CDN</b> with caches close to users — Netflix’s <b>Open Connect</b> puts appliances <i>inside</i> internet providers, so a popular show is served from within your own ISP. Popular titles are <b>pre-positioned</b> to edges based on predicted demand. This edge-everywhere delivery is why it’s fast and affordable; it’s the defining design choice.`)],
    ['Stage 3 — playback and adaptive bitrate', PP(`When you press play, a <b>playback service</b> checks your subscription and <b>DRM</b> licence, looks up catalogue metadata, and steers your player to the best CDN and manifest. Then the player streams segments and runs <b>adaptive bitrate</b>:`) +
      BSTEPS([
        ['Start conservative', PP(`Begin at a modest quality so playback starts fast.`)],
        ['Measure and adapt per segment', PP(`Before each segment, the player checks the speed it just achieved and how full its buffer is, then picks the highest quality it can sustain with a little safety headroom.`)],
        ['Step down and up', PP(`If bandwidth drops, step down a quality tier (keep playing, just softer); when it recovers, step back up. A single fixed-quality file couldn’t do this — hence segments and multiple renditions.`)]]) +
      PP(`Separately and much smaller: the <b>catalogue</b> (titles, artwork) and <b>recommendations</b> (models trained offline, ranked per user) — important to the product, but tiny next to delivery.`)],
    ['Netflix vs YouTube (a useful contrast)', PP(`They share the pieces (transcode → object store → CDN → ABR), but the emphasis differs. <b>YouTube</b> takes unlimited user uploads, so its hard part is a fast, continuous <b>ingest</b> pipeline. <b>Netflix</b> has a known catalogue, so ingest is relaxed and the hard part is <b>global, cost-efficient delivery</b> — which is exactly why it invested in its own ISP-embedded CDN.`) +
      RECAP([
        `Netflix streams a curated, pre-recorded catalogue; preparing titles is offline, and the real challenge is getting enormous video out smoothly and cheaply.`,
        `<b>Transcode</b> each title offline into many segmented <b>renditions</b> with a manifest; store them and push to the CDN.`,
        `<b>Delivery is everything</b>: serve segments from a CDN with caches close to (even inside) users’ ISPs, and pre-position popular titles.`,
        `The player uses <b>adaptive bitrate</b> — measure speed, pick each segment’s quality, step down/up — to avoid buffering; a playback service handles auth and <b>DRM</b>.`,
        `Versus YouTube: YouTube’s hard part is scalable <b>ingest</b> of user uploads; Netflix’s is cost-efficient <b>delivery</b> of a known catalogue.`])]
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
  cap: 'Master videos are transcoded offline into many renditions, stored, and pushed to the CDN; at play time the playback service authorizes and steers the player, which then streams short segments from the nearest CDN using adaptive bitrate.',
  walk: [
    [['master', 'pipe', 'master>pipe'], 'A master video enters the transcoding pipeline — an offline, massively parallel batch job done ahead of time.'],
    [['pipe', 'obj', 'pipe>obj'], 'It’s encoded into many qualities, cut into short segments with a manifest, and stored in object storage.'],
    [['obj', 'cdn', 'obj>cdn'], 'All renditions are distributed to the CDN — Netflix’s Open Connect boxes sit inside ISPs, close to viewers.'],
    [['user', 'play', 'meta', 'rec'], 'When a user presses play, the playback service checks their subscription and DRM, pulls catalogue info, and factors in recommendations.'],
    [['play', 'cdn', 'play>cdn'], 'It steers the player to the best CDN and tells it which manifest/renditions to use.'],
    [['user', 'cdn', 'user>cdn'], 'The player streams short segments from the nearest CDN, using adaptive bitrate to match the current network speed.'] ],
  qs: [SQ('What is the dominant challenge in a Netflix-style design?', ['Real-time upload ingest', 'Getting enormous amounts of video out to viewers cheaply and smoothly — i.e. CDN delivery', 'Writing to a SQL database', 'User login'], 1, 'Content is pre-recorded; serving the bytes at global scale is the hard part.'),
    SQ('Adaptive bitrate streaming requires each title to be…', ['A single high-resolution file', 'Encoded into multiple renditions and cut into short segments', 'Stored only in a database', 'Streamed without a CDN'], 1, 'Multiple renditions + segments let the player switch quality as bandwidth changes.')]
});

/* ---------------- Google Maps ---------------- */
SDX('case-maps', { name: 'Design Google Maps', cat: 'sdcase',
  blurb: `We’re building a maps service that does three fairly separate jobs: draw the map as you pan and zoom, let you search for places and addresses, and give you driving directions with an ETA that reacts to live traffic. The neat part is how each job uses a different trick — cached images, a geospatial index, and a routing engine over a road graph.`,
  facts: [['The three jobs', 'map tiles · search · routing + traffic'], ['The map images', 'pre-drawn tiles served from a CDN'], ['Directions', 'a road graph + shortest-path, pre-processed'], ['Live traffic', 'anonymised GPS → road speeds → ETAs']],
  sections: [
    ['What are we building?', PLAIN(`A maps app really is <b>three loosely connected systems</b>: <b>showing the map</b> (the imagery you pan and zoom), <b>searching</b> for places and addresses, and <b>routing</b> — giving directions and an <b>ETA</b> that reflects current traffic. It’s very read-heavy, latency-sensitive, and global. Treating the three jobs separately is what makes it tractable.`) +
      ANALOGY(`Think of three specialists sharing a desk. The first is an artist who has <b>already painted</b> every corner of the world at every zoom level onto little tiles, so showing the map is just handing you the right pre-painted tiles. The second is a librarian with a well-organised index of every place, who can instantly point to what’s near you. The third is a navigator with a huge road map who’s cleverly pre-computed shortcuts, and who keeps erasing and re-writing the “minutes” on each road as live traffic reports come in.`)],
    ['Words you’ll need', KEYTERMS([
      ['Map tile', 'A small image of one square of the map at one zoom level. The whole map is a grid of these, pre-drawn and cached.'],
      ['Geospatial index', 'A structure (geohash, Google’s S2, or a quadtree) that answers “what places are near this point?” quickly.'],
      ['Geocoding', 'Translating between text and coordinates — “1600 Amphitheatre Pkwy” ↔ a latitude/longitude.'],
      ['Road graph', 'The road network as a graph: <b>nodes</b> are intersections, <b>edges</b> are road segments, and each edge’s weight is how long it takes to drive.'],
      ['Shortest path (Dijkstra / A*)', 'The classic algorithms for finding the lowest-cost route through a weighted graph.'],
      ['Contraction hierarchies', 'A way to pre-process the road graph (adding shortcut edges) so routing queries skip most of the map and answer in milliseconds.'],
      ['ETA', 'Estimated time of arrival — the sum of the (traffic-adjusted) travel times along the chosen route.']])],
    ['Job 1 — drawing the map (tiles + CDN)', WHY(`Re-drawing the map on every request would be impossibly expensive. Instead the map is cut into <b>tiles</b> — one small image per zoom level and (x, y) cell — which are <b>pre-drawn offline</b> (they rarely change) and served from a <b>CDN</b>. So panning and zooming is just fetching cached images from a nearby edge; the base map needs almost no live computation.`)],
    ['Job 2 — searching for places', PP(`Search and address lookup (<b>geocoding</b>) use a <b>geospatial index</b> to answer “places near here” and to translate text ↔ coordinates. It’s the same family of indexing as the ride-hailing and food-delivery designs — organise things by location so nearby lookups are fast.`)],
    ['Job 3 — directions with live traffic', PP(`Directions run over the <b>road graph</b> (intersections and road segments, each weighted by driving time). The challenge is that a plain shortest-path search over a continent-sized graph is far too slow per request, and that real travel times change constantly.`) +
      BSTEPS([
        ['Pre-process the graph for speed', PP(`Offline, the graph is augmented with <b>shortcut edges</b> and a hierarchy (e.g. <b>contraction hierarchies</b>), so a query only climbs up to “important” highway-like roads and back down — turning a cross-country route into a search over a tiny fraction of the graph, answered in milliseconds.`)],
        ['Fold in live traffic', PP(`Anonymised GPS from many phones is <b>aggregated</b> to estimate the current speed on each road, which updates the edge weights. A congested segment that normally takes 2 minutes might now weight 6.`)],
        ['Compute the route and ETA', PP(`The engine weights edges by <b>time under current traffic</b> (not distance), so it naturally prefers faster roads and <b>reroutes around jams</b>; the <b>ETA</b> is just the sum of those traffic-adjusted times. For long trips it can even use <i>predicted</i> future traffic for roads you’ll reach later.`)]])],
    ['Why it holds together', UL([
      `<b>ETA ≠ distance:</b> weighting edges by time (with traffic, turn costs, road types) is what makes ETAs believable.`,
      `<b>Privacy:</b> the traffic layer uses GPS <b>in aggregate</b> and anonymised, never tracking an individual, and sampled rather than stored forever.`,
      `The road graph <b>changes</b> (closures, new roads), so the pre-computation must be refreshable, and dynamic traffic sits on top of it.`]),
      RECAP([
        `Maps is three loosely connected systems: drawing the map, searching places, and routing with live traffic — each with its own trick.`,
        `The map is <b>pre-drawn tiles</b> served from a <b>CDN</b>, so panning/zooming needs almost no live computation.`,
        `Place search uses a <b>geospatial index</b> for “near here” and geocoding (text ↔ coordinates).`,
        `Routing runs shortest-path over a <b>road graph</b>, but <b>pre-processed</b> (contraction hierarchies) so queries answer in milliseconds.`,
        `<b>Live traffic</b> comes from aggregated, anonymised GPS that updates edge weights, so routes and <b>ETAs</b> reflect real conditions and reroute around jams.`])]
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
  cap: 'Pre-drawn map tiles are served from a CDN; place search uses a geospatial index; the routing engine computes paths over a weighted road graph whose edge weights are continuously updated by a traffic aggregator fed by anonymised user GPS.',
  walk: [
    [['user', 'gw'], 'Every request enters through the API gateway, which routes it to the right one of the three subsystems.'],
    [['gw', 'tiles', 'cdn', 'tiles>cdn'], 'Panning/zooming fetches pre-drawn tiles — served from the CDN, drawn offline — so the base map needs no live computation.'],
    [['gw', 'search', 'gw>search'], 'Searching for a place or address hits the geospatial place index (geocoding).'],
    [['gw', 'route', 'gw>route'], 'Requesting directions goes to the routing engine, which runs shortest-path over the road graph.'],
    [['user', 'traffic', 'user>traffic'], 'Meanwhile, anonymised GPS from many users is aggregated to estimate current road speeds.'],
    [['traffic', 'route', 'traffic>route'], 'Live traffic updates the graph’s edge weights, so routes and ETAs reflect real conditions and reroute around jams.'] ],
  qs: [SQ('How are the map images (tiles) handled?', ['Drawn fresh on every request', 'Pre-drawn per zoom/x/y and served from a CDN', 'Stored in a SQL database and drawn with queries', 'Computed by the routing engine'], 1, 'Tiles are pre-rendered offline and cached on a CDN, so the base map needs no live compute.'),
    SQ('How does routing answer in milliseconds on a continent-sized road graph?', ['Run plain Dijkstra from scratch each time', 'Pre-process the graph (e.g. contraction hierarchies) so queries skip most of it', 'Store every possible route in a cache', 'Use a relational JOIN'], 1, 'Pre-computed shortcuts/hierarchy let a query explore a tiny fraction of the graph.')]
});

/* ---------------- Distributed logging ---------------- */
SDX('case-logging', { name: 'Design a distributed logging system', cat: 'sdcase',
  blurb: `We’re building the system that collects the log messages pouring out of thousands of services, makes them searchable when an engineer is debugging an incident, and stores them without the bill spiralling. It’s a firehose — write-heavy and bursty — and its central tension is that fast search is expensive while cheap storage is slow to search.`,
  facts: [['The workload', 'write-heavy, enormous volume'], ['The pipeline', 'agent → buffer → index → store'], ['The buffer', 'Kafka soaks up sudden floods'], ['The tension', 'fast search vs cheap storage']],
  sections: [
    ['What are we building?', PLAIN(`A logging (or <b>observability</b>) system gathers the stream of log lines that every service emits — “request failed,” “user logged in,” stack traces — and does three things with them: collects them from thousands of hosts, makes them <b>searchable</b> (by service, time, level, or a trace ID), and <b>keeps</b> them for a configurable window. It’s overwhelmingly <b>write-heavy</b> and <b>bursty</b> (floods arrive exactly during incidents, when you need logs most), it must never slow down the apps producing the logs, and it must stay affordable at petabyte scale.`) +
      ANALOGY(`Picture thousands of busy workers each scribbling notes non-stop. You can’t have them stop work to file each note, so each worker just tosses notes onto a fast conveyor belt (the buffer). At the end of the belt, filing clerks pick notes up at their own pace. The most recent notes go into a well-organised, instantly searchable cabinet (expensive to run), while older notes get boxed up cheaply in the basement — still there if you need them, just slower to dig out. And if the belt ever overflows, you’d rather box up the boring notes than make the workers wait.`)],
    ['Words you’ll need', KEYTERMS([
      ['Log', 'A single timestamped event record — often a line of text or JSON — describing something that happened in a service.'],
      ['Agent / shipper', 'A small program on each host (Fluentd, Filebeat, Vector) that tails the logs and forwards them onward, asynchronously.'],
      ['Buffer (Kafka)', 'A durable waiting line between the producers (agents) and the slower consumers (indexers), which absorbs sudden spikes.'],
      ['Inverted index', 'The structure (Elasticsearch/OpenSearch) that makes full-text search fast — it maps each word to the logs containing it. Fast to query, but costly to build and store.'],
      ['Hot / warm / cold tiers', 'Storage tiers by age: hot = recent and fully searchable; cold = old, cheaply archived, slower to search.'],
      ['Backpressure', 'What a pipeline does under overload — buffer, then sample or drop low-value data — so it protects itself instead of collapsing or hurting the apps.'],
      ['Trace ID', 'An ID attached to a request as it hops across services, so you can search for all the logs of one request.']])],
    ['The shape: a pipeline', PP(`Everything is a pipeline: <code>agent → buffer → process/index → store → query</code>. Each stage has one job, and the design is really about getting two of those stages right — the <b>buffer</b> (so floods don’t hurt anyone) and the <b>storage tiers</b> (so search is both possible and affordable).`)],
    ['Stage 1 — collect, and never block the app', WHY(`The number-one rule: <b>logging must never slow down the service doing the work.</b> So an <b>agent</b> on each host forwards logs <b>asynchronously</b>, and everything flows into a <b>buffer</b> (Kafka). The buffer earns its place three times over: it <b>decouples</b> fast producers from slower indexers; it <b>absorbs spikes</b> durably (when an incident triggers a log flood, the backlog waits in Kafka instead of being dropped or stalling apps); and it allows <b>replay</b> (re-index into a new store if an indexer crashes). A processing step then parses each line into a structured event (JSON) and enriches it with host, service, and trace ID.`)],
    ['Stage 2 — the core trade-off: searchable vs cheap', PP(`Here’s the tension at the heart of the system. Fast search wants an <b>inverted index</b> — brilliant for “show me all errors for service X with this trace ID in the last hour,” but <b>expensive</b> to build and keep (lots of CPU and memory). Cheap storage wants plain compressed files in <b>object storage</b> — almost free per terabyte, but <b>slow</b> to search. You can’t afford to index everything forever, and you can’t afford to make all search slow.`) +
      BSTEPS([
        ['Resolve it with tiered retention', PP(`Recent logs (hours–days) live in a <b>hot</b>, fully-indexed tier for fast interactive search — that’s what engineers hit during incidents. Older logs roll to a <b>warm</b> tier, then to a <b>cold</b> object-store archive (cheap, searchable slowly), and a <b>TTL</b> finally deletes the oldest. This matches cost to value, because logs are mostly write-once and read-recently.`)],
        ['Partition and shard', PP(`Partition by service and time, and shard the index, so queries and cleanup only touch the relevant slice.`)],
        ['Protect the pipeline under load', PP(`Under extreme floods, apply <b>backpressure</b>: buffer, then <b>sample or drop</b> low-value logs (keep the errors), rather than letting the pipeline fall over or lose critical data.`)]])],
    ['The finishing touches', UL([
      `<b>Structure logs at ingestion</b> (JSON with service, level, trace ID) — unstructured text is slow and painful to search and correlate.`,
      `Correlating one request across services needs a <b>trace ID</b> propagated through calls; this is where tracing complements logging.`,
      `Newer systems (like Grafana Loki) index <b>only labels/metadata</b> and store raw log bodies cheaply — a different point on the same search-vs-cost trade-off.`]),
      RECAP([
        `A logging system is a write-heavy, bursty pipeline: <code>agent → buffer → index → store → query</code>.`,
        `Agents forward logs <b>asynchronously</b> so logging never blocks the app; a <b>Kafka buffer</b> decouples producers from indexers, absorbs spikes durably, and allows replay.`,
        `The core tension is <b>fast search (expensive inverted index)</b> vs <b>cheap storage (slow object store)</b>.`,
        `Resolve it with <b>tiered retention</b>: hot indexed tier for recent logs, cold cheap archive for old ones, and TTL deletion — matching cost to value.`,
        `Structure logs with a <b>trace ID</b>, partition by service/time, and under overload apply <b>backpressure</b> (sample/drop low-value logs) to protect the pipeline.`])]
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
  cap: 'Agents on each host ship logs into a Kafka buffer that absorbs spikes; indexers parse and route recent logs to a hot searchable index while archiving everything cheaply to object storage; a query service searches the right tier by age.',
  walk: [
    [['svcs', 'agent', 'svcs>agent'], 'Agents on each host tail logs and forward them asynchronously, so logging never blocks the application.'],
    [['agent', 'kafka', 'agent>kafka'], 'All logs flow into a Kafka buffer that absorbs bursts and decouples producers from the slower indexing stage.'],
    [['kafka', 'idx', 'kafka>idx'], 'Indexer workers consume from Kafka and parse/enrich each line into a structured event.'],
    [['idx', 'hot', 'idx>hot'], 'Recent logs go into a hot inverted index for fast search (kept for days).'],
    [['idx', 'cold', 'idx>cold'], 'Everything is also archived cheaply to object storage; a lifecycle job rolls hot → warm → cold and applies TTL.'],
    [['user', 'query', 'hot', 'cold', 'query>hot', 'query>cold'], 'Engineers search via the query service, which hits the hot index for recent logs and the cold archive for older ones.'] ],
  qs: [SQ('Why put a buffer like Kafka between the log agents and the indexers?', ['To encrypt the logs', 'To absorb bursts durably and decouple fast producers from slower indexers, so apps never block and logs aren’t dropped', 'To render dashboards', 'To replace the search index'], 1, 'The buffer holds floods durably and lets each side run at its own pace (backpressure + replay).'),
    SQ('How do you keep petabytes of logs both searchable and affordable?', ['Index every log forever', 'Use tiered retention: a hot index for recent logs, a cheap object-store archive for old ones, with TTL deletion', 'Keep everything in RAM', 'Never index anything at all'], 1, 'Match cost to value: index the recent logs people actually query; archive or delete the rest cheaply.')]
});
