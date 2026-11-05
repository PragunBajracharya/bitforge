/* ===== Beginner-first rewrites — batch 3 (case studies). Loads after originals, overrides them. ===== */

/* ---------------- Search autocomplete ---------------- */
SDX('case-typeahead', { name: 'Design search autocomplete', cat: 'sdcase',
  blurb: `We’re building the little dropdown of suggestions that appears as you type into a search box — the one that shows “system design” after you’ve typed just “sys”. It has to feel instant (under about a tenth of a second per keystroke) for a huge number of people typing at once. The whole trick is that it does almost no thinking when you type; all the hard work happened earlier, in the background.`,
  facts: [['How fast it must feel', 'under ~100 ms per keystroke'], ['Requests it handles', '100,000+ per second'], ['The structure behind it', 'a “trie” with the top answers baked in'], ['How fresh suggestions are', 'minutes to hours old — and that’s fine']],
  dg: { w: 780, h: 340,
    n: [['c', 'Search box', 85, 85, 'client', 'you typed “sys”'], ['sg', 'Suggest service', 340, 85, 'svc', 'answers in memory'], ['snap', 'Prebuilt answers', 620, 85, 'store'], ['lg', 'Search logs', 85, 265, 'queue'], ['ag', 'Counter', 340, 265, 'worker', 'tallies each query'], ['tb', 'Builder', 620, 265, 'worker', 'top 10 per prefix']],
    e: [['c', 'sg', 'what starts with “sys”?', 'u'], ['sg', 'c', 'top 10', 'u', 'ret'], ['c', 'lg', 'what people search', 'd'], ['lg', 'ag'], ['ag', 'tb', 'hourly'], ['tb', 'snap', 'publish'], ['snap', 'sg', 'load']] },
  cap: `Answering is a single instant lookup — the ten best completions for every prefix are already worked out and sitting in memory. A separate background pipeline watches what people actually search for and periodically rebuilds the list of answers.`,
  walk: [[['c', 'sg', 'c>sg'], `You type “sys”. Your browser waits for a tiny pause so it isn’t firing on every single letter (that pause is called <b>debounce</b>), then asks the suggest service “what completions start with sys?”`],
    [['sg', 'c', 'ret'], `The service already has the answer sitting ready — “system design”, “systemctl”, … — and hands back the top 10. It does <b>no searching or sorting</b> at this moment; that’s why it’s so fast.`],
    [['c', 'lg', 'lg', 'ag', 'c>lg', 'lg>ag'], `Separately, every search people actually submit is written to a log. A background counter tallies how often each query is searched, giving recent searches more weight so trends surface.`],
    [['ag', 'tb', 'tb', 'snap', 'ag>tb', 'tb>snap'], `Every hour or so, a builder uses those counts to work out the top 10 completions for every possible prefix and saves the whole set. It also strips out anything offensive.`],
    [['snap', 'sg', 'snap>sg'], `The suggest servers load the freshly built set and swap it in. Done — they’re ready to answer the next keystroke instantly.`]],
  sections: [
    ['What are we building?', PLAIN(`Autocomplete (also called <b>typeahead</b>) is the feature that, the moment you start typing in a search box, drops down a short list of likely completions ranked by how popular they are. Two things make it hard: it has to respond in well under a tenth of a second (or it feels laggy), and it fires on <b>every keystroke</b>, so the number of requests is enormous.`) +
      ANALOGY(`Imagine a mind-reading librarian. Before you’ve finished saying “I’m looking for sys…,” she’s already holding up the ten most-requested books that start with those letters. She can only be that fast because she prepared the lists in advance — she isn’t running to the shelves while you wait. Our autocomplete works exactly the same way: all the thinking is done <b>ahead of time</b>, so answering is instant.`)],
    ['Words you’ll need', KEYTERMS([
      ['Prefix', 'The letters typed so far — “s”, then “sy”, then “sys”. Each prefix has its own list of best completions.'],
      ['Trie (say “try”)', 'A tree where each step down spells one more letter. Follow the path s → y → s and you arrive at the node for “sys”. It’s the natural shape for “find everything starting with these letters”.'],
      ['Top-k', 'The best k answers (here, top 10). We pre-compute and store these at every node so there’s nothing to rank at type-time.'],
      ['Latency / p99', 'How long a response takes. “p99 under 100 ms” means even the slowest 1% of responses come back within a tenth of a second.'],
      ['Debounce', 'Waiting for a short typing pause before sending a request, so we don’t fire one for every single letter in a fast-typed word.'],
      ['Offline pipeline', 'The background machinery that counts searches and rebuilds the answers — it runs on its own schedule, completely separate from the fast path that answers you.']])],
    ['The one big idea: never think at type-time', WHY(`If, every time you typed a letter, the system searched millions of past queries and sorted them by popularity, it could never hit 100 ms at that scale. So we flip it around: <b>pre-compute the top 10 completions for every prefix</b> and store them ready to serve. Then answering a keystroke is just “walk to the node for these letters, hand back the list it’s already holding.” All the expensive work moves to a background job that runs every hour — and since nobody minds if a brand-new trending search takes an hour to show up, that trade is a bargain.`)],
    ['How the fast path works', BSTEPS([
      ['Store answers in a trie', PP(`Build a tree where each node is a prefix and each branch adds a letter. At <b>every</b> node, store that prefix’s top 10 completions already ranked. Looking up “sys” is just three steps down the tree — no searching.`)],
      ['Keep it all in memory', PP(`The trie for the most popular tens of millions of queries fits in a few tens of gigabytes, so each server can hold a <b>full copy</b> and answer from memory. No database trip per keystroke.`)],
      ['Answer instantly', PP(`A request walks to the prefix’s node and returns its stored list. That’s the whole read path, and it’s why server time is a few milliseconds.`)]])],
    ['How the background pipeline keeps it fresh', BSTEPS([
      ['Log what people search', PP(`Every submitted search is written to a log (a queue like Kafka). This is a firehose, but it’s off to the side — it never slows down the suggestions.`)],
      ['Count with recency weighting', PP(`A job tallies how often each query appears, giving recent searches more weight (<b>time decay</b>) so today’s trends can rise above last year’s.`)],
      ['Rebuild and publish', PP(`A builder constructs a fresh trie with each node’s new top 10, filters unsafe completions, and publishes the finished snapshot to storage. Servers load it and <b>swap it in atomically</b> (the old one keeps serving until the new one is fully ready, so there’s no blip).`)]])],
    ['Scaling and the finishing touches', UL([
      `Because the whole trie fits in memory, you simply run <b>many identical servers</b> behind a load balancer; if it ever grew too big, you’d split it by starting letter (a–f on one group, g–m on another), watching out for lopsided letters like “s”.`,
      `<b>Cache popular prefixes</b> at the CDN and in the browser — the suggestions for “a” or “face” barely change, so they can be reused.`,
      `On the client, <b>debounce</b> and cancel stale requests so a fast typist doesn’t leave old suggestions flickering.`,
      `A tiny <b>real-time layer</b> can inject breaking trends faster than the hourly rebuild, for things like live news.`]),
      RECAP([
        `Autocomplete must feel instant on every keystroke at huge volume, so it does <b>zero</b> ranking at type-time.`,
        `A <b>trie</b> stores the <b>top 10 completions pre-computed at every prefix</b>; answering is just a walk down the tree, served from memory.`,
        `A separate <b>background pipeline</b> logs real searches, counts them with recency weighting, rebuilds the trie, and hot-swaps a fresh copy every hour or so.`,
        `Suggestions being minutes-to-hours stale is perfectly acceptable, and that acceptance is exactly what buys the speed.`,
        `Scale by replicating the in-memory trie, caching popular prefixes, and debouncing on the client.`])]
  ],
  prac: [208],
  qs: [SQ('Why store the top 10 completions at every node of the trie instead of computing them when the user types?', ['To save memory', 'So answering a keystroke is just a walk to the prefix node with no ranking at request time — which is what makes it fast enough', 'Because tries require it', 'To support deleting queries'], 1, 'Pre-computing moves the expensive work to a background job and makes each lookup nearly free.'),
    SQ('Autocomplete suggestions here can be an hour out of date. Why is that a deliberate choice, not a flaw?', ['Freshness is impossible', 'Allowing staleness lets all the heavy counting and ranking happen in a background job, which is what keeps the type-time path instant', 'Users prefer old results', 'It saves money on servers only'], 1, 'Trading a little freshness for a hugely cheaper, faster read path is the core trade-off.')]
});

/* ---------------- Video streaming (YouTube) ---------------- */
SDX('case-video', { name: 'Design video streaming (YouTube)', cat: 'sdcase',
  blurb: `We’re building a service where creators upload videos and anyone can watch them smoothly — on a phone on patchy 4G, or a TV on fast fibre. The two hard parts are turning one uploaded file into many versions the world can actually play, and delivering a truly enormous amount of video data cheaply. We’ll build it in three clear stages: upload, convert, and serve.`,
  facts: [['Uploaded every minute', '≈ 500 hours of video'], ['Data sent to viewers', 'tens of terabits per second'], ['How video is chopped up', 'small segments (HLS / DASH)'], ['How quality adapts', 'the player picks quality per segment']],
  dg: { w: 900, h: 390,
    n: [['cr', 'Creator', 80, 70, 'client'], ['up', 'Upload service', 300, 70, 'svc', 'in resumable chunks'], ['raw', 'Original files', 540, 70, 'store'], ['tq', 'Convert queue', 540, 195, 'queue'], ['tw', 'Converters', 780, 195, 'worker', '240p … 4K'], ['seg', 'Segments', 780, 325, 'store', 'short clips'], ['cdn', 'CDN (edges)', 540, 325, 'cdn'], ['vw', 'Viewer', 300, 325, 'client', 'adapts quality'], ['md', 'Metadata DB', 300, 195, 'db', 'title · status']],
    e: [['cr', 'up', 'upload'], ['up', 'raw', 'store once'], ['up', 'md', 'create', 'd'], ['raw', 'tq', 'new video'], ['tq', 'tw'], ['tw', 'seg', 'all qualities'], ['seg', 'cdn', 'copy to edges'], ['vw', 'cdn', 'fetch clips'], ['tw', 'md', 'mark ready', 'd']] },
  cap: `Three stages: upload the original once, convert it into every quality cut into short clips, and serve those clips from the nearest edge server. The viewer’s player fetches one short clip at a time and switches quality as the network speeds up or slows down.`,
  walk: [[['cr', 'up', 'raw', 'cr>up', 'up>raw'], `A creator uploads a video. It’s sent in <b>chunks</b> (so a dropped connection can resume rather than restart) straight into cheap bulk storage. A metadata record is created with status “processing”.`],
    [['raw', 'tq', 'tw', 'raw>tq', 'tq>tw'], `Finishing the upload kicks off <b>converting</b>. The video is split into pieces and many machines convert the pieces in parallel into lots of qualities (240p up to 4K) and formats, and generate thumbnails.`],
    [['tw', 'seg', 'md', 'tw>seg', 'tw>md'], `Each quality is written out as a string of <b>short clips</b> (2–6 seconds each) plus a little index file that lists them. The video flips to “ready”.`],
    [['vw', 'cdn', 'seg', 'vw>cdn', 'seg>cdn'], `A viewer presses play. Their player reads the index, then downloads clips one at a time from the <b>nearest edge server</b>. It watches how fast clips arrive and picks the best quality for the next clip — grab a blurry clip if the network dips, a crisp one when it recovers. Popular videos are pushed to edges ahead of time; rare ones are fetched on first request.`]],
  sections: [
    ['What are we building?', PLAIN(`A video platform has two sides. <b>Uploading:</b> a creator sends a video file, and we have to turn it into something every device and network can play. <b>Watching:</b> millions of viewers stream videos that start fast and don’t stall, wherever they are. The scary number is how much data goes <i>out</i> to viewers — far more than any single data centre could ever push — which shapes the whole design.`) +
      ANALOGY(`Think of a film studio with a worldwide chain of local cinemas. You hand in one master tape. The studio makes copies at several picture qualities, cuts each copy into short reels, and ships those reels to a cinema in every town. When you watch, the reels come from the cinema <i>nearest you</i> (fast and cheap), and if the projector struggles, it quietly switches to a lower-quality reel so the film never stops.`)],
    ['Words you’ll need', KEYTERMS([
      ['Transcoding (converting)', 'Turning the one uploaded file into many versions at different qualities and in different formats, so every device can play one of them.'],
      ['Resolution & bitrate', 'Resolution is the picture size (240p … 4K); bitrate is how much data per second it uses. Higher = sharper but needs faster internet.'],
      ['Segment (clip)', 'Each version is chopped into short 2–6 second clips, so the player can fetch a little at a time and change quality between clips.'],
      ['Manifest', 'A small index file listing all the qualities and all the clips, so the player knows what’s available and where to get each piece.'],
      ['CDN / edge server', 'A worldwide network of caching servers close to users. Serving video from a nearby edge is far faster and cheaper than from one central place.'],
      ['Adaptive bitrate', 'The player automatically picks the quality of each next clip based on your current internet speed — the magic that avoids buffering.']])],
    ['Why the “data out” number decides everything', WHY(`Do the rough maths: around a billion hours watched a day, at a few megabits per second each, is on the order of a hundred-plus terabits per second flowing out — continuously. No single building can do that. The only affordable way is a huge <b>CDN</b>, often with caching servers placed <i>inside</i> internet providers’ own networks (Netflix’s “Open Connect” works this way). That one constraint is why “serve from the edge” is the backbone of every video system.`)],
    ['Stage 1 — Upload', BSTEPS([
      ['Send in resumable chunks', PP(`A two-hour 4K file is huge, and a dropped connection mustn’t mean starting over. So the file is uploaded in small <b>chunks</b>, in parallel, straight into cheap bulk (“object”) storage; if chunk 37 fails, only chunk 37 is retried.`)],
      ['Create a metadata record', PP(`A database row is created for the video (title, owner, status “processing”) so the rest of the system can track it while conversion runs.`)]])],
    ['Stage 2 — Convert (the transcoding pipeline)', BSTEPS([
      ['Split, then convert in parallel', PP(`The original is split into pieces and a crowd of machines converts them at once. Splitting is what turns a job that would take hours into one that takes minutes, and because each piece is independent you can use cheap interruptible machines and just retry any that fail.`)],
      ['Produce every quality, as clips', PP(`Each piece is encoded into many resolutions and formats, then packaged as <b>short clips</b> with a <b>manifest</b>. Popular videos get extra effort (better, smaller encodes) because you pay the conversion once but save bandwidth on every single view.`)]])],
    ['Stage 3 — Serve (playback)', UL([
      `The player first downloads the <b>manifest</b>, then streams <b>clips</b> from the nearest CDN edge.`,
      `<b>Adaptive bitrate</b>: before each clip, the player checks your measured speed and buffer and picks the quality it can deliver without stalling — so a fast start and no buffering beat always-perfect picture.`,
      `<b>Private or paid videos</b> use signed links (and DRM for premium content) so only authorised viewers can fetch the clips.`,
      `<b>View counts and watch-time</b> are sent as events into a data pipeline, not written to a database on every single view (that would never keep up).`]),
      RECAP([
        `A video platform is upload → convert → serve, and the gigantic “data out to viewers” number forces a CDN-first design.`,
        `<b>Upload</b> in resumable chunks to cheap bulk storage; create a metadata record with a “processing” status.`,
        `<b>Convert</b> by splitting the file and transcoding pieces in parallel into many qualities, packaged as short <b>clips</b> plus a <b>manifest</b>.`,
        `<b>Serve</b> clips from the nearest <b>edge</b>; the player uses <b>adaptive bitrate</b> to pick each clip’s quality and avoid buffering.`,
        `Store originals cheaply, give popular videos better encodes, and treat views/watch-time as a stream of events, not per-view database writes.`])]
  ],
  qs: [SQ('What does “adaptive bitrate” streaming actually do?', ['Compresses the video live inside the CDN', 'The player picks the quality of each next short clip based on your current internet speed and buffer, so playback doesn’t stall', 'Sends every quality at once and lets the TV choose', 'Lowers the frame rate when you pause'], 1, 'Chopping each quality into clips lets the player switch quality smoothly between clips as your bandwidth changes.'),
    SQ('Why must the heavy delivery of video run through a CDN rather than a central data centre?', ['CDNs are easier to code', 'The total data sent to viewers (tens of terabits per second) is far more than one location could push, and edges near users are far cheaper and faster', 'Central data centres can’t store video', 'Copyright law requires it'], 1, 'The egress number alone dictates a globally distributed, edge-based delivery network.')]
});

/* ---------------- Ride sharing (Uber) ---------------- */
SDX('case-rides', { name: 'Design ride sharing (Uber)', cat: 'sdcase',
  blurb: `We’re building the service that matches a rider with a nearby driver in a few seconds. Millions of drivers are constantly moving, each shouting their location every few seconds, so the real puzzles are: swallow that flood of location updates, find the closest free drivers to a rider almost instantly, and hand out the trip without accidentally giving the same driver to two people.`,
  facts: [['How often a driver reports position', 'about every 4 seconds'], ['Location updates at peak', '≈ 1 million per second'], ['How “nearby” is found fast', 'the map is cut into cells'], ['Match target', 'within a few seconds']],
  dg: { w: 820, h: 330,
    n: [['dr', 'Driver app', 90, 70, 'client', 'GPS every 4 s'], ['ls', 'Location service', 330, 70, 'svc'], ['gi', 'Live map index', 590, 70, 'cache', 'cell → free drivers'], ['ri', 'Rider app', 90, 260, 'client'], ['mt', 'Matching service', 330, 260, 'svc'], ['tr', 'Trip service', 590, 260, 'svc'], ['tdb', 'Trips DB', 760, 165, 'db']],
    e: [['dr', 'ls', 'I’m here'], ['ls', 'gi', 'update cell'], ['ri', 'mt', 'I need a ride'], ['mt', 'gi', 'who’s nearby?'], ['mt', 'dr', 'offer trip', 'd'], ['mt', 'tr', 'accepted'], ['tr', 'tdb', 'save trip']] },
  cap: `Drivers continuously report where they are; the location service drops each one into a live map index keyed by which cell of the map they’re in. A ride request looks up the rider’s cell and its neighbours, offers the trip to the best driver, and only when they accept does it create a durable trip record.`,
  walk: [[['dr', 'ls', 'dr>ls'], `Every ~4 seconds, each active driver’s phone reports its position. With a few million drivers online, that’s up to a million updates a second pouring in.`],
    [['ls', 'gi', 'ls>gi'], `The location service figures out which <b>cell</b> of the map the driver is in and updates a fast in-memory index: “cell → the free drivers in it.” It just <b>overwrites</b> the old position — there’s no need to keep a driver’s history here.`],
    [['ri', 'mt', 'mt', 'gi', 'ri>mt', 'mt>gi'], `A rider taps “request.” The matching service finds the rider’s cell plus the neighbouring cells, gathers the candidate drivers, and ranks them by how long they’d actually take to arrive <b>by road</b> (not as the crow flies).`],
    [['mt', 'dr', 'mt>dr'], `It offers the trip to the best driver and waits ~10–15 seconds. No answer? Offer the next one. Meanwhile it <b>locks</b> that driver so nobody else can be offered the same one.`],
    [['mt', 'tr', 'tr', 'tdb', 'mt>tr', 'tr>tdb'], `The driver accepts. Now — and only now — the trip service writes a durable trip record, and both apps switch to live trip mode with location sharing.`]],
  sections: [
    ['What are we building?', PLAIN(`A ride-hailing backend does one headline thing: when a rider asks, it finds a good nearby driver and connects them, fast. Underneath that sit three challenges — coping with a <b>torrent of location updates</b> from moving drivers, <b>finding who’s nearby</b> in milliseconds, and <b>matching</b> one driver to one rider without clashes.`) +
      ANALOGY(`Picture an old-fashioned taxi dispatcher staring at a huge wall map where every cab is a magnet that keeps nudging as it drives. When you phone for a cab, the dispatcher doesn’t scan the whole city — they glance at the few map squares around you and radio the closest free cab. If that driver doesn’t answer in a few seconds, they try the next. Our system is that dispatcher, just automated and scaled to millions.`)],
    ['Words you’ll need', KEYTERMS([
      ['Location update', 'A driver’s app reporting “I’m at this latitude/longitude” — sent every few seconds, which at scale is a firehose of writes.'],
      ['Geospatial index', 'A way of organising positions so “who is near this point?” is fast. The trick is to chop the map into cells and index drivers by cell.'],
      ['Cell (geohash / H3)', 'A small tile of the map. A geohash turns a location into a short code where nearby places share a prefix; H3 uses hexagons. Either way, “find nearby” becomes “look in this cell and its neighbours”.'],
      ['ETA', 'Estimated time of arrival — how long a driver would take to reach the rider by road, which is what we rank on (not straight-line distance).'],
      ['Lock', 'A temporary “reserved” flag on a driver while a trip is offered, so two riders can’t be matched to the same driver at once.'],
      ['Ephemeral', 'Short-lived and not worth saving permanently — like a driver’s current position, which we keep in fast memory and simply overwrite.']])],
    ['Challenge 1 — swallowing a million updates a second', PP(`A few million drivers each reporting every ~4 seconds is up to a million writes per second. The key realisation: <b>these positions are ephemeral</b>. You only ever need a driver’s <i>latest</i> location, so there’s no point writing every update to a durable database. Keep it in fast memory (overwriting the old value) and, separately, stream a copy to a log for later analytics and ETA models — well off the critical path.`)],
    ['Challenge 2 — finding nearby drivers instantly', WHY(`Checking the distance to every driver in the city for each request would be hopeless. So we cut the map into <b>cells</b> and index drivers by which cell they’re in. Now “find nearby” is just “look up the rider’s cell.”`) +
      PP(`One subtlety: a driver just across a cell boundary might be closer than drivers inside your cell, so we always search the rider’s cell <b>plus its neighbours</b>, and widen the search if too few drivers turn up.`) +
      TBL(['Way to cut the map', 'The idea', 'Good to know'],
        [['Geohash', 'Turn a location into a short code; nearby places share a prefix', 'Simple string keys; cells are rectangles, so check edge neighbours'],
         ['Quadtree', 'Split busy areas into four, again and again', 'Adapts to how crowded an area is'],
         ['H3 (Uber’s)', 'Cover the map in hexagons', 'Neighbours are all equal distance — neat for pricing zones'],
         ['S2 (Google’s)', 'Cells wrapped onto a sphere', 'Used by Google Maps and many databases']])],
    ['Challenge 3 — matching without double-booking', BSTEPS([
      ['Gather candidates', PP(`From the rider’s cell and its neighbours, collect the free drivers and rank them by <b>road ETA</b>, not straight-line distance (a driver 200m away across a river is useless).`)],
      ['Offer with a timeout and a lock', PP(`Offer the trip to the best driver and give them ~10–15 seconds. Crucially, put a <b>lock</b> on that driver so no other request can grab them. If they decline or time out, release the lock and offer the next candidate.`)],
      ['Commit the trip', PP(`On acceptance, write a durable trip record (this is the part we <i>do</i> save permanently) and flip both apps into trip mode with live tracking.`)]])],
    ['Scaling and the rest of the system', UL([
      `<b>Cities are independent</b>, so run the whole thing region by region — a problem in one city can’t take down another, and it keeps each dataset small.`,
      `Keep the live positions in memory (e.g. Redis with geo commands), and write the location <b>stream</b> to a log (Kafka) for trip history, analytics and ETA training — never on the hot path.`,
      `A driver’s state (free → offered → on trip) must change <b>atomically</b>; that’s what the per-driver lock guarantees.`,
      `<b>ETA and routing</b> run shortest-path algorithms on a road graph with live traffic; <b>surge pricing</b> compares riders-wanting vs drivers-available per hexagon in near real time.`]),
      RECAP([
        `Ride-hailing = ingest a flood of driver locations, find nearby drivers fast, and match one-to-one without clashes.`,
        `Driver positions are <b>ephemeral</b>: keep only the latest in fast memory (overwrite), and stream a copy to a log for analytics.`,
        `Cut the map into <b>cells</b> (geohash / H3) and index drivers by cell, so “who’s nearby?” is a quick lookup of the rider’s cell <b>plus neighbours</b>.`,
        `Rank candidates by <b>road ETA</b>, offer with a <b>timeout and a lock</b> to prevent double-booking, and only write a durable <b>trip record</b> on acceptance.`,
        `Run <b>per city/region</b> for isolation; do routing, ETAs and surge pricing off the hot path.`])]
  ],
  code: null,
  qs: [SQ('Why search the neighbouring cells, not just the rider’s own cell, when looking for drivers?', ['Geohashes are inaccurate', 'A driver just over a cell boundary can be closer than drivers inside the rider’s cell, so neighbours must be checked', 'Neighbours are cheaper to read', 'To find more riders'], 1, 'Sharing a cell prefix doesn’t capture closeness across edges, so adjacent cells are always included.'),
    SQ('Why keep drivers’ live locations in memory and overwrite them, instead of saving every update to a database?', ['Databases can’t store coordinates', 'You only ever need each driver’s latest position, so the data is ephemeral — durable writes at a million per second would be wasteful and slow', 'To hide locations from riders', 'Memory is always free'], 1, 'Recognising the data as ephemeral is what lets the hot path stay fast; history goes to a log off to the side.')]
});

/* ---------------- Web crawler ---------------- */
SDX('case-crawler', { name: 'Design a web crawler', cat: 'sdcase',
  blurb: `We’re building the robot that downloads billions of web pages so a search engine has something to search. It has to be <b>polite</b> (never hammer any one website), <b>efficient</b> (never download the same page twice, never fall into traps), and <b>never-ending</b> (come back and re-check pages as they change). The heart of it is a cleverly organised to-do list of URLs called the frontier.`,
  facts: [['Pages to fetch', '≈ 1 billion a month'], ['That’s roughly', '≈ 400 pages every second'], ['How it avoids repeats', 'a Bloom filter + content fingerprint'], ['How it stays polite', 'a separate queue per website']],
  dg: { w: 900, h: 300,
    n: [['sd', 'Starting URLs', 80, 70, 'box'], ['fr', 'The frontier', 300, 70, 'queue', 'to-do list, per-site'], ['fe', 'Fetchers', 560, 70, 'worker', 'obey robots.txt'], ['web', 'The web', 790, 70, 'ext'], ['cs', 'Page store', 790, 225, 'store', 'HTML + fingerprint'], ['pa', 'Parser', 560, 225, 'worker', 'find the links'], ['dd', 'Seen-it filter', 300, 225, 'box', 'tidy up · Bloom filter']],
    e: [['sd', 'fr'], ['fr', 'fe', 'next URL'], ['fe', 'web', 'download'], ['fe', 'cs', 'save page'], ['fe', 'pa', 'the HTML'], ['pa', 'dd', 'links found'], ['dd', 'fr', 'new URLs']] },
  cap: `A loop: the frontier hands out the next URL (while making sure no site is hit too often), fetchers download the page, parsers pull out the links on it, and a “seen-it” filter throws away any link already crawled before it goes back onto the to-do list.`,
  walk: [[['sd', 'fr', 'sd>fr'], `We prime the to-do list (the <b>frontier</b>) with some well-known starting URLs. The frontier keeps URLs in priority order and, importantly, keeps a <b>separate line per website</b>.`],
    [['fr', 'fe', 'fe', 'web', 'fr>fe', 'fe>web'], `Fetchers pull URLs, but only from sites whose “cool-down” has passed (say, no more than one request per second to the same site). They first check the site’s <b>robots.txt</b> rules and reuse a cached DNS lookup.`],
    [['fe', 'cs', 'fe>cs'], `Each downloaded page is saved along with a <b>fingerprint</b> of its content, so the same page living at a different URL (mirrors, tracking links) can be spotted and skipped.`],
    [['fe', 'pa', 'pa', 'dd', 'fe>pa', 'pa>dd'], `A parser reads the HTML and extracts every link, turning them into full, tidy URLs (lowercasing the host, stripping the “#section” and tracking bits).`],
    [['dd', 'fr', 'dd>fr'], `Each link is checked against a fast “have we seen this?” filter. Brand-new ones get a priority and join the frontier; the loop repeats, forever.`]],
  sections: [
    ['What are we building?', PLAIN(`A <b>web crawler</b> is an automated program that starts from a few web addresses, downloads those pages, finds the links on them, downloads <i>those</i> pages, and keeps going — fanning out across the whole web. Search engines run crawlers to collect the pages they later index. The challenge isn’t downloading one page; it’s doing it a billion times without being rude to websites, without wasting effort on duplicates, and without ever truly finishing (the web keeps changing).`) +
      ANALOGY(`Imagine an army of extremely polite research assistants. Each takes an address off a shared to-do list, visits that page, jots down every address it links to, files a copy of the page, and adds the new addresses to the list. They follow two rules religiously: never knock on the same building’s door more than once a second (politeness), and keep a master checklist so nobody ever visits the same page twice (no duplicates).`)],
    ['Words you’ll need', KEYTERMS([
      ['Frontier', 'The crawler’s to-do list of URLs waiting to be fetched — but a smart one that handles priority and politeness, not just a plain queue.'],
      ['Fetcher', 'A worker that actually downloads a page. You run thousands at once because most of the time is spent waiting on remote servers.'],
      ['Politeness', 'Not overloading any single website — a minimum delay between requests to the same site, and obeying its stated rules.'],
      ['robots.txt', 'A file every website publishes saying which pages crawlers may and may not fetch, and how slowly. Well-behaved crawlers obey it.'],
      ['Deduplication (dedupe)', 'Making sure you don’t crawl or store the same thing twice — both the same URL, and the same content living at different URLs.'],
      ['Bloom filter', 'A compact memory structure that can answer “have I seen this URL already?” for billions of URLs using very little space (it may rarely say “maybe” for a new one, which is a fine trade here).']])],
    ['The crawl loop (the whole thing in one picture)', PP(`Everything the crawler does is one loop repeated forever: <b>take a URL → download it → extract its links → drop the links you’ve already seen → put the new ones back on the list.</b> Get that loop right, at scale and politely, and you have a crawler. The rest of the design is just making each step robust.`)],
    ['The clever bit: the URL frontier', WHY(`A plain queue won’t do, because of two competing needs: you want to crawl <b>important pages first</b> (priority), but you must <b>never hammer one site</b> (politeness). The frontier solves both at once.`) +
      BSTEPS([
        ['Front queues = priority', PP(`Several queues ordered by importance (a page’s rank, how often it changes) decide <i>what</i> is worth crawling next.`)],
        ['Back queues = politeness', PP(`One queue <b>per website</b>, each with a “not before this time” stamp, so a site is only hit after its cool-down passes. You crawl thousands of <i>different</i> sites in parallel while being gentle with each one.`)],
        ['Keep it on disk', PP(`Billions of URLs won’t fit in memory, so the frontier lives on disk with small in-memory buffers at the ends. And you <b>partition by website</b> across crawler machines, so one machine owns all of a site’s URLs and politeness stays simple.`)]])],
    ['Avoiding duplicates and traps', UL([
      `<b>Same URL twice:</b> before a URL enters the frontier, check a <b>Bloom filter</b> (backed by a stored seen-set). Already crawled? Drop it. This keeps the “have I seen this?” check in memory even for billions of URLs.`,
      `<b>Same content, different URL:</b> mirrors and tracking parameters create many URLs for identical pages. Store a <b>content fingerprint</b> and skip pages whose fingerprint you’ve already got (near-duplicate detection uses techniques like SimHash).`,
      `<b>Spider traps:</b> some sites generate infinite pages (a calendar with a “next month” link forever, or endless session IDs). Defend with limits on URL length and depth, a cap on pages per site, and pattern detection.`,
      `<b>Re-crawling:</b> the web changes, so estimate each page’s change rate and revisit accordingly — news sites hourly, a static page monthly.`]),
      PP(`A practical note: because each fetch spends most of its time <i>waiting</i> on a remote server (100 ms to several seconds), you don’t use one machine-thread per page. You use <b>asynchronous I/O</b> to juggle thousands of in-flight downloads at once — that’s how a modest number of machines hits hundreds of pages a second.`),
      RECAP([
        `A web crawler downloads the web for a search engine via one endless loop: fetch a URL → extract links → drop seen ones → enqueue new ones.`,
        `The <b>frontier</b> is the smart to-do list: <b>front queues</b> give priority (crawl important pages first), <b>back queues</b> (one per site) enforce <b>politeness</b>, and it lives on disk, partitioned by site.`,
        `Stay polite with per-site delays and <b>robots.txt</b>; crawl many <i>different</i> sites in parallel so you’re fast overall without hammering anyone.`,
        `Avoid repeats with a <b>Bloom filter</b> for seen URLs and a <b>content fingerprint</b> for duplicate pages; defend against <b>spider traps</b> with depth/length/count limits.`,
        `Use <b>async I/O</b> (not a thread per page) because fetching is mostly waiting, and re-crawl pages based on how often they change.`])]
  ],
  qs: [SQ('How does a crawler stay polite to each individual website while still being fast overall?', ['It uses a single fetcher', 'It keeps a separate queue per website with a minimum delay between hits to that site, while fetching thousands of different sites in parallel', 'It ignores robots.txt to save time', 'It only ever fetches home pages'], 1, 'Parallelism is across many sites; the rate limit applies within each site.'),
    SQ('Why use a Bloom filter for the “have I already crawled this URL?” check?', ['It stores the full URLs for later', 'It can answer that question for billions of URLs using very little memory, so the check stays fast and in-memory', 'It guarantees a perfect yes/no with no trade-offs', 'It replaces the content store'], 1, 'A Bloom filter trades a rare harmless “maybe” for huge memory savings, which is exactly what billions of URLs need.')]
});
