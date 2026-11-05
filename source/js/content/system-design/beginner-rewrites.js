/* ===== Beginner-first rewrites — these SDX calls load last and OVERRIDE the
   dense original definitions of the same topics (SDX does SD[key] = obj). ===== */

/* ---------------- Concept topic: Caching ---------------- */
SDX('caching', { name: 'Caching', cat: 'sdcache',
  blurb: `A cache is a small, very fast store that keeps copies of the answers your app looks up most often — so it can hand them back instantly instead of asking the slow database again and again. Done well, your app feels snappy. Done badly, people see old, wrong information. This lesson builds the whole idea up from zero.`,
  facts: [['Reading from a cache', '≈ 0.5 milliseconds'], ['Reading from a database', '≈ 1–10 ms, often more'], ['A good cache serves', '80–99% of reads'], ['Common tools', 'Redis, Memcached']],
  dg: { w: 740, h: 310,
    n: [['c', 'Client', 85, 110, 'client'], ['app', 'App server', 320, 110, 'svc'], ['ca', 'Cache', 610, 110, 'cache', 'Redis'], ['db', 'Database', 320, 255, 'db', 'source of truth']],
    e: [['c', 'app', 'GET /user/42'], ['app', 'ca', '1 · look in cache', 'U', 'get'], ['ca', 'app', '2 · not there', 'U', 'miss'], ['app', 'db', '3 · read it', '', 'read'], ['app', 'ca', '4 · save a copy', 'd', 'set']] },
  cap: `The most common setup, called “cache-aside”: the app looks in the cache first, only goes to the database when the cache doesn’t have the answer, and then saves a copy so the next person gets it instantly.`,
  walk: [[['c', 'app', 'c>app'], `Someone opens a profile page, so the app needs the data for user 42.`],
    [['app', 'ca', 'get'], `The app asks the cache first: “do you already have user 42?” Most of the time the answer is yes (a <b>cache hit</b>), it comes back in about half a millisecond, and the database is never bothered.`],
    [['ca', 'app', 'miss'], `Sometimes the cache doesn’t have it (a <b>cache miss</b>) — maybe nobody asked for user 42 recently.`],
    [['app', 'db', 'read'], `Only then does the app go to the database, the <b>source of truth</b> (the one place that always holds the real, correct data).`],
    [['app', 'ca', 'set'], `The app saves a copy in the cache before replying, so the next person who wants user 42 gets the fast path. When user 42 later changes their name, the app deletes that cached copy so nobody is served the old name.`]],
  sections: [
    ['Start here: what a cache actually is', PLAIN(`A cache is just a <b>copy of data kept somewhere faster to reach</b>. Your app normally keeps its real data in a <b>database</b> — reliable, but relatively slow to query. A cache sits in front of it holding copies of the most-asked-for answers in <b>memory (RAM)</b>, which is dramatically faster to read. When a request comes in, the app checks the cache first; if the answer is there, it skips the database entirely.`) +
      ANALOGY(`Think of a busy kitchen. The <b>pantry</b> (the database) has everything, but walking to it for every ingredient is slow. So the cook keeps the few things they grab constantly — salt, oil, pepper — right on the <b>counter</b> (the cache). Ninety-nine times out of a hundred, what they need is already within arm’s reach. Only occasionally do they walk to the pantry, and when they do, they bring a bit back to the counter for next time.`)],
    ['Why bother? The speed difference is huge', WHY(`Reading from a cache takes roughly <b>half a millisecond</b>; reading from a database often takes <b>5–10 milliseconds or more</b> — easily <b>10–50× slower</b>. (A millisecond is one-thousandth of a second; these sound tiny, but a single web page can trigger dozens of these look-ups, and a popular app serves millions of them per second.) A cache also <b>protects the database</b>: if 100,000 people per second want the same trending post, the cache answers almost all of them, so the database only sees a trickle instead of being flattened.`)],
    ['Words you’ll need', KEYTERMS([
      ['Cache hit', 'The data you wanted was already in the cache. Fast path. This should happen most of the time.'],
      ['Cache miss', 'The data wasn’t in the cache, so the app has to fetch it from the database (and usually save a copy for next time).'],
      ['Hit rate', 'The share of look-ups that are hits. 90% means 9 of every 10 requests never touch the database. Higher is better.'],
      ['Source of truth', 'The one authoritative place that always has the correct, up-to-date data — normally the database. The cache only holds copies.'],
      ['TTL (time-to-live)', 'An expiry timer on a cached copy — e.g. “keep this for 5 minutes, then throw it away.” Like a best-before date on food.'],
      ['Eviction', 'Removing something from the cache to make room (memory is limited), usually the least-recently-used item.'],
      ['Stale', 'A cached copy that no longer matches the real data because the real data changed. Serving stale data is the main danger of caching.'],
      ['Redis / Memcached', 'The two most popular ready-made cache servers. Think of them as a giant, shared, super-fast dictionary that all your app servers can talk to.']])],
    ['How a cache works, step by step', PP(`Here is the full round-trip for the most common pattern, called <b>cache-aside</b> (the app manages the cache “on the side” of the database). Follow it with the diagram above.`) +
      BSTEPS([
        ['A request arrives', PP(`Say the app needs user 42’s profile. The data is identified by a short <b>key</b> — a label like <code>user:42</code> — so everyone agrees on what to call it.`)],
        ['Look in the cache first', PP(`The app asks the cache for <code>user:42</code>. If it’s there (a <b>hit</b>), the app returns it immediately and we’re done in well under a millisecond. The database is never touched.`)],
        ['On a miss, go to the database', PP(`If the cache doesn’t have it (a <b>miss</b>), the app queries the database — the source of truth — to get the real data. This is the slow path, but it only happens occasionally.`)],
        ['Save a copy for next time', PP(`Before replying, the app writes the result into the cache under <code>user:42</code>, usually with a <b>TTL</b> (say 5 minutes). Now the next person who wants user 42 gets the fast path. This is why the first request after a gap is slow and the rest are fast.`)],
        ['Keep it fresh when data changes', PP(`When user 42 edits their profile, the app <b>deletes</b> <code>user:42</code> from the cache (rather than trying to update it). The next read misses, re-fetches the fresh data, and re-caches it. Deleting is safer than updating — more on that below.`)]])],
    ['The big decision: when do we put things in the cache?', PP(`“Cache-aside” (above) is the default, but there are a few named strategies for <i>how</i> and <i>when</i> data gets written. You don’t need to memorise them — just understand that the choice is a trade-off between <b>freshness</b>, <b>speed</b>, and <b>safety</b>.`) +
      TBL(['Strategy', 'In plain words', 'Good', 'Watch out'],
        [['Cache-aside (lazy)', 'App checks cache, loads from DB on a miss, saves a copy. The cache only ever holds things people actually asked for.', 'Simple; cache stays small', 'The first read after a change is a miss (slightly slow)'],
         ['Read-through', 'Same idea, but the cache itself knows how to load from the DB, so your app code is simpler.', 'Cleaner app code', 'Needs a cache that supports it'],
         ['Write-through', 'Every time you write data, you write it to the cache AND the database together.', 'Cache is always fresh', 'Writes are a bit slower; you cache things nobody reads'],
         ['Write-back', 'Write to the cache now, and let it save to the database a moment later.', 'Very fast writes', 'If the cache crashes before saving, you LOSE that data'],
         ['Write-around', 'Write only to the database; the cache fills up naturally on later reads.', 'Avoids caching write-once data', 'A freshly written item isn’t cached yet, so its first read misses']])],
    ['The hardest part: knowing when a copy is out of date', PP(`A cache holds <b>copies</b>, and the moment the real data changes, those copies are <b>stale</b> — they show the old value. Deciding when to throw a copy away is famously one of the trickiest problems in software. There are three common ways to handle it:`) +
      UL([`<b>TTL (expiry timer):</b> let each copy live for a set time, then auto-delete it. Simple and safe, but a copy can be wrong for up to that long. Good when a little staleness is fine (a product description, a follower count).`,
        `<b>Delete on change:</b> whenever the real data changes, delete the cached copy immediately so the next read re-fetches fresh. Fresher, but needs care — see the warning below.`,
        `<b>Listen for changes:</b> have the database announce every change, and let something delete the matching cache keys automatically. Most accurate, most machinery.`]) +
      ANALOGY(`TTL is a carton of milk with a best-before date: you trust it until the date, then toss it. “Delete on change” is pouring the milk out the instant you smell it’s off. The first is simpler; the second is fresher but you have to be watching.`) +
      PP(`A key tip: on a change, <b>delete</b> the cached copy rather than trying to <b>overwrite</b> it with the new value. If two updates happen at nearly the same moment, overwriting can accidentally leave the <i>older</i> value in the cache; deleting always forces a clean re-read.`)],
    ['What goes wrong (and how we fix it)', PP(`Caches are wonderful until a lot of people hit the same gap at the same time. These are the classic failure modes — each has a standard, well-known fix, so interviewers love asking about them.`) +
      TBL(['Problem', 'What actually happens', 'The fix'],
        [['Thundering herd (a “stampede”)', 'A very popular key expires, and in that instant thousands of requests all miss and all rush the database at once — which can crash it.', 'Let just ONE request rebuild the key while the others briefly wait or get the old value (called “request coalescing”), or refresh hot keys a little before they expire.'],
         ['Cache penetration', 'People (or bots) keep asking for things that don’t exist, so every request misses and hits the database.', 'Briefly cache “this doesn’t exist” too, or keep a lightweight list of which keys are real.'],
         ['Cache avalanche', 'A huge batch of keys all expire at the exact same second, so the database gets a sudden flood.', 'Add a little randomness to each TTL so expiries spread out instead of lining up.'],
         ['Hot key', 'One single key (a celebrity’s profile, a viral post) gets a massive share of all traffic.', 'Keep extra copies of it on several cache nodes, or a tiny copy inside each app server’s own memory.'],
         ['Cold start', 'After a restart the cache is empty, so everything misses and the database is overwhelmed until it fills back up.', 'Warm the cache gradually, or keep a backup cache node that still has the data.']])],
    ['When you should NOT use a cache', PP(`Caching is not free — every cache is a second copy that can be wrong, and more moving parts to reason about. Skip it (or be very careful) when: the data <b>must</b> be exactly right at all times (an account balance during a money transfer); the data is <b>rarely read twice</b>, so copies never pay off; or the data <b>changes faster than it’s read</b>, so your copies are stale almost immediately. The honest rule: add a cache when you can show that <b>reads greatly outnumber writes</b> and a little staleness is acceptable — not just because it sounds fast.`)],
    ['Putting it together', RECAP([
      `A cache is a fast copy of your most-used data, sitting in front of the slow database.`,
      `The flow (cache-aside): check cache → on a miss, read the database → save a copy for next time.`,
      `A <b>hit</b> is fast and skips the database; you want a high <b>hit rate</b> (80–99%).`,
      `The database stays the <b>source of truth</b>; the cache only holds copies.`,
      `The hard part is <b>staleness</b>: use a TTL for “a little old is fine”, delete-on-change for fresher data.`,
      `Watch for the stampede, penetration, avalanche, hot-key and cold-start problems — each has a standard fix.`,
      `Only cache when reads dominate writes and some staleness is acceptable.`])]
  ],
  qs: [SQ('What is a “cache hit”?', ['The cache crashed', 'The data you asked for was already in the cache, so the database wasn’t needed', 'The cache was full', 'A write went to the database'], 1, 'A hit means the fast path: the answer was in the cache.'),
    SQ('A very popular cached item expires and thousands of requests flood the database at once. What is this, and a common fix?', ['Cache penetration; use a Bloom filter', 'Thundering herd; let one request rebuild the key while others wait or get the old value', 'Write-back loss; use write-through', 'Cold start; restart the cache'], 1, 'This is a stampede/thundering herd; request coalescing (one rebuild) prevents the flood.'),
    SQ('Why delete a cached copy when data changes instead of overwriting it with the new value?', ['Deleting is faster to type', 'If two updates race, overwriting can leave the older value cached; deleting forces a clean re-read', 'Overwriting is not allowed in Redis', 'It saves memory'], 1, 'Delete-then-reload avoids a race where the stale value wins.')]
});

/* ---------------- Case study: URL shortener ---------------- */
SDX('case-url', { name: 'Design a URL shortener (beginner walkthrough)', cat: 'sdcase',
  blurb: `A URL shortener turns a long web address into a tiny one — paste a giant link, get back something like sho.rt/aZ3kQ9 that redirects to the original. It’s the classic “first” system design question because the features are simple but it quietly teaches scale, caching, ID generation and redirects. We’ll build it up from the simplest possible version and only add complexity when we can see why it’s needed.`,
  facts: [['New links per day', '≈ 100 million'], ['Reads vs writes', '≈ 100 reads for every 1 write'], ['Redirects per second (peak)', '≈ 115,000'], ['Short code length', '7 characters']],
  dg: { w: 820, h: 360,
    n: [['u', 'User', 80, 180, 'client'], ['lb', 'Load balancer', 255, 180, 'lb'], ['api', 'URL service', 455, 180, 'svc', 'many copies'], ['idg', 'ID allocator', 455, 50, 'svc', 'hands out number ranges'], ['ca', 'Cache', 690, 95, 'cache', 'code → long URL'], ['db', 'URL store', 690, 265, 'db', 'the real data'], ['q', 'Click events', 455, 315, 'queue', 'for analytics']],
    e: [['u', 'lb', ''], ['lb', 'api', ''], ['api', 'idg', 'get a number'], ['api', 'ca', 'check cache'], ['api', 'db', 'save / read'], ['api', 'q', 'log the click', 'd']] },
  cap: `The finished design. Creating a link grabs a unique number and turns it into a short code. Following a link looks it up (from the cache almost every time) and sends the visitor on with a redirect; clicks are logged separately so they never slow anyone down.`,
  walk: [[['u', 'lb', 'api', 'u>lb', 'lb>api'], `<b>Making a link:</b> you send the long URL. A load balancer hands your request to any one of the many identical URL-service copies.`],
    [['api', 'idg', 'api>idg'], `That copy grabs the next unused <b>number</b> from a block it reserved earlier (so it doesn’t have to coordinate with anyone for each link).`],
    [['api', 'db', 'api>db'], `It turns that number into a short code (explained below) and saves “code → your long URL” in the store.`],
    [['u', 'lb', 'api', 'ca', 'api>ca'], `<b>Following a link:</b> someone clicks sho.rt/aZ3kQ9. The service looks the code up in the <b>cache</b> first — popular links are almost always there.`],
    [['api', 'db', 'api>db'], `If it’s not cached, it reads the store and saves a copy. Then it replies with a <b>redirect</b> pointing the browser at the original URL.`],
    [['api', 'q', 'api>q'], `It also drops a note on a queue saying “this link was clicked” for analytics — off to the side, so following the link stays instant.`]],
  sections: [
    ['What are we building?', PLAIN(`A URL shortener does two things. <b>(1) Shorten:</b> you give it a long link like <code>https://example.com/articles/2026/the-really-long-title?ref=newsletter</code> and it gives you back a short one like <code>sho.rt/aZ3kQ9</code>. <b>(2) Redirect:</b> when anyone opens the short link, the shortener instantly sends their browser to the original long link. People also usually want a little <b>analytics</b> — how many times was my link clicked?`) +
      ANALOGY(`It’s a coat check. You hand over your bulky coat (the long URL) and get a small numbered ticket (the short code). Later you show the ticket and get your exact coat back. The shortener’s whole job is keeping that “ticket → coat” list and handing coats back fast.`)],
    ['First, let’s size it up (and why that matters)', PP(`Before designing anything, engineers estimate <b>how much traffic</b> the system must handle, because that decides whether one small server is fine or we need a serious setup. Let’s say the product gets <b>100 million new links per day</b>. Here’s how we turn that into useful numbers — each one explained.`) +
      KEYTERMS([
        ['QPS (queries per second)', 'How many requests hit the system each second. A day has 86,400 seconds, so we divide daily totals by that.'],
        ['Read vs write', 'A “write” is creating a new link; a “read” is following one. Shorteners are read-heavy — people click links far more than they make them (here, about 100 clicks per link).'],
        ['Latency', 'How long one request takes, from the user’s side. For a redirect we want this very low — ideally under ~50 milliseconds — or links feel sluggish.'],
        ['p99', 'The “99th-percentile” time: the slowest 1% of requests are still faster than this. We care about p99, not just the average, because the slow ones are what users complain about.']]) +
      TBL(['What', 'The maths', 'Result'],
        [['New links each second (writes)', '100,000,000 ÷ 86,400', '≈ 1,160 per second'],
         ['Clicks each second (reads)', '≈ 100 × the writes', '≈ 115,000 per second'],
         ['Links stored over 5 years', '100M × 365 × 5', '≈ 183 billion links'],
         ['Storage needed', '183 billion × ~500 bytes each', '≈ 90 TB (plus backups)'],
         ['How long must a code be?', '62⁷ ≈ 3.5 trillion combos, far more than 183 billion', '7 characters is plenty']]) +
      WHY(`Those numbers quietly decide the whole design. 115,000 reads a second is far too much for a single database, so we’ll need a <b>cache</b> and <b>copies of our servers</b>. And because reads hugely outnumber writes, it’s worth bending over backwards to make reads fast — which is exactly what the final design does.`)],
    ['Version 1: the simplest thing that could possibly work', PP(`<span class="vbadge v1">Start simple</span> Before scaling anything, let’s build the smallest version a beginner would write — one server and one database — just to get the logic right.`) +
      BSTEPS([
        ['Keep one table', PP(`A single database table with two columns: <code>code</code> (the short code) and <code>long_url</code> (where it points). That’s the entire “ticket → coat” list.`)],
        ['To shorten', PP(`Generate some short code, save a row <code>{code, long_url}</code>, and return <code>sho.rt/&lt;code&gt;</code>. We’ll figure out <i>how</i> to make the code in a moment.`)],
        ['To redirect', PP(`When someone opens <code>sho.rt/aZ3kQ9</code>, look up <code>aZ3kQ9</code> in the table, find the long URL, and tell the browser “go here instead” with an HTTP <b>redirect</b>.`)]]) +
      PP(`This genuinely works — for a small project it might be all you ever need. The logic is complete. The only thing it can’t do is handle <i>scale</i>, which is the next thing we’ll pressure-test.`)],
    ['Why Version 1 breaks at 115,000 clicks a second', PP(`Version 1 has two problems once it gets popular, and naming them tells us exactly what to add:`) +
      UL([`<b>One server isn’t enough, and it’s a single point of failure.</b> If that one machine is busy or crashes, every link is dead. We need <b>many identical copies</b> of the service with something spreading traffic across them.`,
        `<b>The database can’t take 115,000 reads a second.</b> Databases are reliable but not that fast. Since the same popular links are clicked over and over, we can keep their answers in a <b>cache</b> and serve almost everything from memory.`]) +
      PP(`Notice we didn’t add these pieces because they sounded clever — each one fixes a specific problem we just watched Version 1 hit. That’s the whole method of system design.`)],
    ['Version 2: add each piece, one at a time', PP(`<span class="vbadge v2">Now scale it</span> We’ll introduce each new box, say what it is in plain terms, and why Version 1 forced us to add it. This is the diagram at the top of the page.`) +
      BSTEPS([
        ['Make many copies of the service', PP(`Run the URL service on lots of machines at once. They’re <b>stateless</b> — each copy can handle any request because it keeps nothing special in its own memory; all the shared data lives in the database and cache. If one dies, the others carry on.`)],
        ['Put a load balancer in front', PP(`A <b>load balancer</b> is a traffic cop: every request hits it first, and it forwards each one to whichever service copy is least busy. Users only ever see one address; they never know there are 50 machines behind it.`)],
        ['Add a cache for reads', PP(`A <b>cache</b> (like Redis) sits in front of the database holding “code → long URL” for popular links. A click checks the cache first and almost always finds the answer in under a millisecond, so the database barely gets touched. (See the Caching lesson for exactly how this works.)`)],
        ['Pick a database that spreads out', PP(`90 TB is far too much for one machine, so we <b>shard</b> it — split the data across many database servers, each holding a slice. Because we always look up a link by its <code>code</code>, we split by code, which spreads the load evenly with no single hot machine. A simple key-value store (like DynamoDB or Cassandra) is ideal since we only ever look things up by one key.`)],
        ['Log clicks off to the side', PP(`We want click counts, but writing to the database on every one of 115,000 clicks a second would drown it. Instead each click drops a tiny “clicked!” message onto a <b>queue</b>, and a separate program adds those up later. The redirect never waits for analytics, so it stays instant.`)]])],
    ['The tricky part: how do we invent the short codes?', PP(`Every link needs a <b>unique</b> short code, and this is the most interesting decision in the whole design. First, a quick definition:`) +
      KEYTERMS([['base62', 'A way of writing a number using 62 symbols: 0–9, a–z and A–Z. It lets us pack a big number into very few characters — 7 base62 characters cover 3.5 trillion values. (Normal numbers use only 10 symbols, 0–9, so they need more digits.)']]) +
      PP(`Here are the common approaches, from worst to best for this problem:`) +
      TBL(['Approach', 'How it works', 'The catch'],
        [['Random characters', 'Pick 7 random base62 characters each time.', 'Two links might randomly get the same code (a “collision”), so you must check and retry on every create.'],
         ['Hash the URL', 'Run the long URL through a hashing function and take the first 7 characters.', 'The same URL always gives the same code (nice!), but different URLs can still collide and need handling.'],
         ['A counter + base62 (recommended)', 'Keep a single ever-increasing number (1, 2, 3, …) and write it in base62 to get the code.', 'Never collides and codes stay short — but the number-giver could become a bottleneck, which we fix next.']]) +
      PP(`We’ll use the <b>counter</b> approach. The obvious worry: if every new link has to ask one central counter “what’s the next number?”, that counter becomes a traffic jam. The fix is simple and clever: each service copy <b>reserves a block of numbers in advance</b> (say 1,000 at a time) and hands them out locally. It only talks to the central allocator once per 1,000 links, so there’s no per-request bottleneck.`) +
      PP(`One more polish: plain counters make codes sequential (…21, 22, 23…), which lets people guess other links. We scramble the number with a reversible shuffle before encoding, so the codes look random even though they’re still unique.`)],
    ['Redirects: 301 vs 302, explained simply', PP(`When someone opens a short link, the server replies with a <b>redirect</b> — an HTTP response that means “what you want is actually over here, go there.” There are two kinds, and the choice matters:`) +
      UL([`<b>301 — permanent:</b> the browser is told “this will always point here,” so it <b>remembers</b> and next time it jumps straight to the long URL without asking you again. That saves you work — but because the browser skips you, you <b>can’t count those repeat clicks</b>.`,
        `<b>302 — temporary:</b> the browser comes back to you <b>every time</b>. Slightly more load, but you see every single click.`]) +
      PP(`Most shorteners pick <b>302</b> on purpose: the analytics (knowing how many clicks a link got) are usually worth more than the small saving from 301.`)],
    ['The finished design, in one read-through', PP(`Putting it all together (the diagram at the top): a request arrives at the <b>load balancer</b>, which hands it to one of many <b>stateless service copies</b>. To create a link, the copy takes a number from its <b>reserved block</b>, base62-encodes it, and saves it to the <b>sharded store</b>. To follow a link, the copy checks the <b>cache</b> (a near-certain hit for popular links), falls back to the store on a miss, and replies with a <b>302 redirect</b>. Each click is logged onto a <b>queue</b> and counted elsewhere, so redirects never slow down. Every piece is there to solve a specific problem we watched the simple version hit.`)],
    ['Putting it together', RECAP([
      `A URL shortener keeps a “short code → long URL” list and redirects visitors fast.`,
      `Always size it up first: ~1,160 writes/s but ~115,000 reads/s — it’s hugely read-heavy.`,
      `Start with one server + one table to get the logic right; then add pieces only to fix real scaling problems.`,
      `Many stateless service copies behind a load balancer remove the single point of failure.`,
      `A cache absorbs the 100:1 read load so the database isn’t crushed.`,
      `Make codes with a counter + base62, handing out reserved number-blocks per server to avoid a bottleneck; scramble them so they’re not guessable.`,
      `Use 302 redirects to keep click analytics; log clicks on a queue so redirects stay instant.`])]
  ],
  code: null, prac: [271],
  qs: [SQ('Why is a URL shortener described as “read-heavy”, and why does that shape the design?', ['It writes more than it reads', 'Links are clicked far more than they’re created (~100:1), so we optimise hard for fast reads with caching and copies', 'Reading and writing are equal', 'It only matters for storage'], 1, 'Reads dominate, so caching and horizontal read scaling are the priorities.'),
    SQ('Why have each server reserve a block of numbers instead of asking a central counter for every new link?', ['To make codes longer', 'So servers don’t all queue at one central counter on every request — they only sync once per block', 'To allow duplicate codes', 'It has no benefit'], 1, 'Reserving blocks removes the per-request bottleneck at the counter.'),
    SQ('Why do most URL shorteners use a 302 (temporary) redirect rather than 301 (permanent)?', ['302 is faster', 'A 301 is remembered by the browser, so repeat clicks skip the service and its click analytics', '301 is insecure', '302 is required for HTTPS'], 1, 'Temporary redirects keep every click visible for analytics.')]
});
