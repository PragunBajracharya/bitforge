/* ===== Beginner-first rewrites — batch 6 (concept topics: foundations + networking). Patches blurb+sections, keeps diagrams/quizzes. ===== */

SDPATCH('requirements', {
  blurb: `Before you design anything, you make two lists: <b>what</b> the system must do (its features) and <b>how well</b> it must do them (how many users, how fast, how reliable). The second list is the one that actually shapes the design — it’s the difference between a toy and something that serves millions.`,
  sections: [
    ['What are we even doing?', PLAIN(`“System design” is deciding what pieces a software system needs, how they talk to each other, and where the data lives — so it works for lots of people, on many computers that sometimes fail, over a network that’s slow and flaky. An algorithm question asks “how do I compute this quickly on one machine?” A system design question asks “how do I serve this to millions of people reliably?” There’s rarely one right answer — a good design is one whose trade-offs match what’s actually needed.`) +
      ANALOGY(`It’s like designing a building. First you decide <b>what rooms</b> it needs (a kitchen, three bedrooms) — those are the features. Then you ask <b>how many people</b> will live there, whether it must survive an earthquake, and what the budget is — those decide how thick the walls are and how deep the foundation goes. Two houses with the same rooms can be completely different buildings once you know the “how well.”`)],
    ['Words you’ll need', KEYTERMS([
      ['Functional requirement', 'What the system <i>does</i> — a feature a user can see. “Users can post a photo,” “users can follow others.” Written as verbs.'],
      ['Non-functional requirement', 'How <i>well</i> it must do it — scale, speed, reliability. This is what shapes the architecture.'],
      ['QPS', '“Queries per second” — how many requests the system handles each second. The basic unit of scale.'],
      ['Latency', 'How long one request takes, from asking to getting an answer.'],
      ['p99 (99th percentile)', 'A fair way to measure speed: “p99 = 200 ms” means 99 out of 100 requests finish within 200 ms, and only the slowest 1% take longer. Averages hide that slow tail.'],
      ['Availability', 'The share of time the system is up and working. “99.9%” allows about 8.8 hours of downtime a year.'],
      ['Consistency', 'Whether every reader immediately sees the latest write. Strong (always current, e.g. your bank balance) vs eventual (catches up in a moment, e.g. a like count).'],
      ['Throughput', 'How much total work per second the system can get through (vs latency, which is one request’s time).']])],
    ['The two lists', PP(`<b>Functional requirements</b> are the features — keep the list short (three to five core ones) and be explicit about what’s out of scope. For a chat app: send a message, see history, see if a contact is online; group chat and encryption might be “later.” These don’t change with scale — a URL shortener has the same features for 10 users or 10 billion.`) +
      PP(`<b>Non-functional requirements</b> describe quality, and they’re where real projects (and interviews) are won or lost. Turn each into a number:`) +
      TBL(['Quality', 'Question to ask', 'Typical target'], [
        ['Scale', 'How many users, requests, bytes?', '10M daily users, 50K peak QPS'],
        ['Latency', 'How fast, at which percentile?', 'p99 &lt; 200 ms for reads'],
        ['Availability', 'How much downtime is OK?', '99.9% (8.8 h/yr) to 99.99% (53 min/yr)'],
        ['Consistency', 'Must every reader see the latest write?', 'Strong for payments, eventual for likes'],
        ['Durability', 'Can we ever lose stored data?', 'Effectively never for uploaded files'],
        ['Cost', 'What’s the budget?', 'Often the hidden constraint']])],
    ['Why percentiles beat averages', WHY(`If a page makes 50 backend calls and each has a p99 of 200 ms, then on most page loads at least one of those 50 calls lands in that slow 1% — so the <i>average</i> looking fine is cold comfort. Designing to the p99 (and p999) is designing for the experience real users actually get, not a flattering average that hides the slow tail.`)],
    ['How to work through any design', OL([`Clarify the requirements and scope (a few minutes — don’t skip it).`, `Estimate the scale: QPS, storage, bandwidth (next topics show how).`, `Define the API and the data model.`, `Draw a simple design that works end to end.`, `Deep-dive the hardest part: the bottleneck, the hot spot, the tricky consistency question.`, `Talk through what happens when things fail, and at 10× the traffic.`]) +
      RECAP([
        `System design decides the pieces, their connections, and where data lives — so a system works at scale, on failing machines, over a slow network.`,
        `<b>Functional</b> requirements = the features (what it does); <b>non-functional</b> = qualities like scale, latency, availability, consistency (how well) — and the non-functional ones shape the architecture.`,
        `Turn qualities into <b>numbers</b> (QPS, p99, % uptime); a design for 100 QPS and one for 100,000 QPS are different systems.`,
        `Measure speed by <b>percentiles</b> (p99), not averages, because fan-out means users hit the slow tail constantly.`,
        `Work top-down: requirements → estimates → API/data → simple design → deep-dive the hard part → failures and 10× growth.`])]
  ]
});

SDPATCH('latency', {
  blurb: `Having a rough feel for how long common operations take lets you predict where a design will spend its time before you build anything. The headline: reading from memory is about a thousand times faster than from an SSD, and a trip across the ocean is about a thousand times slower than a trip across the same data centre.`,
  sections: [
    ['What is this and why care?', PLAIN(`“Latency” just means how long something takes. Every operation a computer does — reading memory, reading a disk, sending data over the network — has a rough, predictable cost. If you carry a mental table of these costs, you can look at a proposed design and immediately see “that’s going to be slow” or “that part is basically free,” before writing a line of code.`) +
      ANALOGY(`Think of data living at different “distances” from the processor, like things in your life. Reading from RAM is grabbing something off your desk (instant). Reading an SSD is walking to a filing cabinet down the hall. Talking to another server in the same data centre is phoning a colleague in the next building. And a request across the ocean is mailing a physical letter overseas and waiting for the reply. Same task, wildly different waits — and good design keeps the hot stuff on your desk.`)],
    ['Words you’ll need', KEYTERMS([
      ['Nanosecond (ns) / microsecond (µs) / millisecond (ms)', 'Units of time: a microsecond is 1,000 ns, a millisecond is 1,000 µs. RAM is in ns; disks in µs–ms; network trips in ms.'],
      ['Round trip', 'One request out and the reply back. Across a network, this is the dominant cost — so fewer, batched round trips beat many small ones.'],
      ['Sequential vs random access', 'Reading data in order (sequential) is far faster than jumping around (random), especially on disks.'],
      ['Throughput', 'How much data per second a link or device can carry (vs latency, the time for one operation).']])],
    ['The numbers worth remembering', PP(`Don’t memorise exact values — hardware changes. Memorise the <b>ratios</b>: each step down this list is roughly 10–1000× slower than the one above.`) +
      TBL(['Operation', 'Rough time', 'Compared to RAM'], [
        ['Read from RAM (memory)', '≈ 100 ns', '1×'],
        ['Send 1 KB over a fast network', '≈ 1 µs', '10×'],
        ['Random read from an SSD', '≈ 16–100 µs', '≈ 500×'],
        ['Round trip in the same data centre', '≈ 0.5 ms', '≈ 5,000×'],
        ['Seek on a spinning hard disk', '≈ 2–10 ms', '≈ 50,000×'],
        ['Round trip across the world (US ↔ Europe)', '≈ 80–150 ms', '≈ 1,000,000×']])],
    ['What these numbers teach you', UL([
      `<b>Memory fast, network slow, disks slower, distance slowest.</b> Most performance work moves data <i>up</i> this list: into memory (caches), closer to users (CDNs), or into fewer round trips (batching).`,
      `<b>Round trips dominate.</b> Ten back-to-back 0.5 ms calls cost 5 ms; batching them into one call costs 0.5 ms. “Chatty” designs are slow designs.`,
      `<b>Sequential beats random.</b> Reading 1 MB in order from an SSD is faster than ten scattered small reads — which is why databases and logs are built to write sequentially.`,
      `<b>The speed of light is a hard wall.</b> A round trip across the Atlantic can’t beat about 60 ms no matter how much you spend — only moving servers closer helps.`])],
    ['Using it in practice', WHY(`Say a page runs 20 database queries at 2 ms each, one after another: 40 ms. Now suppose each also waits on a replica across the world (+80 ms): that’s 20 × 80 = 1,600 ms — over a second and a half. The arithmetic instantly tells you to run the queries in parallel, cache the results, or keep the data in the same region. A rough rule: a 200 ms budget buys you about one cross-continent round trip, or a few hundred in-data-centre round trips, or tens of thousands of memory reads — not much of all three.`) +
      RECAP([
        `Latency is how long an operation takes; knowing rough costs lets you spot slow designs before building.`,
        `Remember the <b>ratios</b>: RAM (ns) → network/SSD (µs) → same-datacentre round trip (~0.5 ms) → cross-world round trip (~100 ms), each step ~10–1000× slower.`,
        `Speed up by moving data <b>up</b> the list: into memory, closer to users, and into fewer <b>round trips</b> (batching).`,
        `Sequential access beats random; distance (speed of light) is a hard floor you can only fix by relocating servers.`,
        `Do the arithmetic on a request’s steps — it points straight at parallelising, caching, or co-locating.`])]
  ]
});

SDPATCH('estimation', {
  blurb: `A little quick arithmetic turns a vague “100 million users” into concrete numbers — requests per second, terabytes per year, servers needed — and those numbers tell you which parts of a design are actually hard before you draw a single box. You only need to be right within about 10×, so round aggressively.`,
  sections: [
    ['What is this and why bother?', PLAIN(`Back-of-the-envelope estimation is rough maths you do on the spot to size a system. It converts user counts into the quantities that decide the design: how many requests per second, how much you store, how much bandwidth, how many machines. The goal isn’t precision — being within a factor of ten is plenty to make the big calls (one database vs. a hundred).`) +
      ANALOGY(`It’s exactly like a party planner sanity-checking a venue before booking. “200 guests, each eats ~3 plates, over 4 hours… that’s 600 plates, ~150 an hour — can this kitchen do that?” You don’t need the exact number; you need to know whether it’s 150 plates an hour (fine) or 15,000 (a different venue entirely). Same with systems: the rough number tells you which problems are real.`)],
    ['Words you’ll need', KEYTERMS([
      ['DAU (daily active users)', 'How many distinct people use the product in a day — the usual starting point.'],
      ['QPS (queries per second)', 'Requests per second. Average QPS = requests per day ÷ ~100,000 (seconds in a day).'],
      ['Peak vs average', 'Traffic isn’t flat — evenings and events spike it. Plan for 2–3× the average.'],
      ['Read-heavy vs write-heavy', 'Whether most requests are reads (viewing) or writes (posting). They scale very differently, so split them.'],
      ['Replication factor', 'How many copies of the data you keep (often 3), which multiplies storage.']])],
    ['Numbers worth memorising', TBL(['Quantity', 'Handy value'], [
      ['Seconds in a day', '86,400 ≈ 100,000 (10⁵)'],
      ['1 million requests/day', '≈ 12 per second'],
      ['1 billion requests/day', '≈ 12,000 per second'],
      ['A short text post', '≈ 100 bytes – 1 KB'],
      ['A photo', '≈ 200 KB – 2 MB'],
      ['A minute of HD video', '≈ 50–100 MB']])],
    ['The method, step by step', BSTEPS([
      ['Users → requests', PP(`Start from DAU and how many actions each person takes per day. 100M users × ~10 actions = 1 billion requests/day. Say your assumptions out loud.`)],
      ['Requests → QPS', PP(`Divide by ~100,000 (seconds in a day): 1 billion ÷ 100,000 ≈ 10,000 QPS average. Multiply by 2–3 for <b>peak</b> → ~30,000 QPS. Split reads from writes.`)],
      ['Writes → storage', PP(`New records/day × size × how long you keep them, then × replication. E.g. 200M writes/day × 1 KB = 200 GB/day ≈ 73 TB/year, × 3 copies ≈ 220 TB/year.`)],
      ['QPS → bandwidth & servers', PP(`Bandwidth = peak QPS × response size (watch bits vs bytes!). Servers = peak load ÷ per-server capacity, plus headroom for failures and deploys.`)]])],
    ['A worked example (and why it’s useful)', WHY(`Photo app: 10M users each view 50 photos and upload 0.1/day. Reads ≈ 500M/day ≈ 6K QPS average, ~18K peak. Uploads = 1M/day × 1 MB = 1 TB/day ≈ 365 TB/year × 3 ≈ 1 PB/year. Egress ≈ 18K × 200 KB ≈ 3.6 GB/s at peak — far too much for app servers. That single number <i>forces</i> two design decisions with no guessing: photos must live in object storage served by a CDN, and you need a multi-petabyte storage tier.`) +
      RECAP([
        `Estimation turns user counts into QPS, storage, bandwidth, and server counts — the numbers that decide architecture.`,
        `Chain: <b>DAU → requests/day → average QPS (÷100,000) → peak QPS (×2–3) → bandwidth and servers</b>; separately, <b>writes → storage</b> (× size × retention × replication).`,
        `Memorise a few constants (86,400 ≈ 10⁵ seconds/day; 1B req/day ≈ 12K QPS) and round hard — within 10× is enough.`,
        `Always plan for <b>peak</b>, split reads from writes, and remember replication/indexes multiply storage.`,
        `The resulting numbers point straight at the hard parts (e.g. “that bandwidth means CDN + object storage”).`])]
  ]
});

SDPATCH('dns', {
  blurb: `DNS is the internet’s address book: it turns a name you can remember, like example.com, into the numeric IP address computers actually use. It’s a giant, heavily cached, worldwide directory — and it doubles as a simple traffic director that can send you to the nearest or healthiest data centre.`,
  sections: [
    ['What is it and why does it exist?', PLAIN(`Computers find each other by numeric <b>IP addresses</b> (like 93.184.216.34), but humans can’t remember those. <b>DNS</b> (the Domain Name System) is the lookup service that translates a friendly name into the right number, every time you open a site or an app makes a request. It has to work for the entire internet, so it’s built to be distributed and cached rather than one giant list somewhere.`) +
      ANALOGY(`It’s old-fashioned directory assistance. You know the name (“Joe’s Pizza”) but not the number. You call directory assistance, they look it up and tell you, and — crucially — you jot it down so you don’t have to call again next time. DNS works the same way, with layers of “jotting down” (caching) at every level so popular names are answered instantly.`)],
    ['Words you’ll need', KEYTERMS([
      ['IP address', 'The numeric address of a server on the internet. DNS’s job is to give you this from a name.'],
      ['Resolver', 'The helper (run by your ISP, or a public one like 1.1.1.1) that does the lookup legwork for you and caches the answers.'],
      ['Authoritative server', 'The server that holds the real, official records for a domain — the final source of truth.'],
      ['TTL (time to live)', 'How long an answer may be cached before it must be looked up again — seconds to days. Short TTL = changes propagate fast but more lookups.'],
      ['A record / CNAME', 'An A record maps a name to an IP; a CNAME maps a name to another name (an alias).'],
      ['Caching', 'Keeping a looked-up answer for a while so repeat lookups are instant — done at the browser, the OS, and the resolver.']])],
    ['How a lookup actually works', PP(`The clever part is the hierarchy: no single server knows everything, and every level caches. Here’s the journey of one uncached lookup (your diagram shows it):`) +
      BSTEPS([
        ['Check local caches first', PP(`Your browser and operating system remember recent lookups. Most of the time the answer is already here and costs nothing.`)],
        ['Ask a resolver', PP(`On a miss, you ask a <b>resolver</b> (your ISP’s, or 1.1.1.1 / 8.8.8.8), which has its own big shared cache that already holds popular names.`)],
        ['Walk the hierarchy', PP(`If the resolver has nothing, it asks a <b>root</b> server (who runs .com?), then the <b>.com</b> server (who runs example.com?), then the <b>authoritative</b> server for example.com, which gives the real IP and a TTL.`)],
        ['Cache and reuse', PP(`The resolver caches that answer for its TTL, so every other user of that resolver now gets it instantly until it expires.`)]])],
    ['DNS as a traffic director', PP(`Because DNS decides which address a name resolves to, it can also <b>route</b> users:`) +
      UL([`<b>Round-robin:</b> hand out several addresses so clients spread across them (crude — no health awareness).`,
        `<b>Geo / latency routing:</b> answer with the data centre nearest the user.`,
        `<b>Failover:</b> health checks pull a dead region’s address out of the answers — but recovery is only as fast as the TTL, so failover records use short TTLs (30–60 s).`]) +
      WHY(`This is why, after you move a site to a new server, some users keep hitting the old one for a while: their resolver cached the old address and won’t look again until the TTL expires. Lower the TTL <i>before</i> a planned move so the switch propagates quickly. It’s also why DNS is a dependency of everything — big outages have been caused by DNS providers failing, which is why critical services use two.`) +
      RECAP([
        `DNS translates human-friendly names into the numeric IP addresses computers use.`,
        `It’s <b>hierarchical and cached at every level</b> (browser → OS → resolver → root → TLD → authoritative), so popular names are answered instantly.`,
        `A <b>TTL</b> controls how long answers are cached: short = fast to change but more lookups; long = cheap but slow to propagate.`,
        `DNS also <b>directs traffic</b> — round-robin, nearest-region routing, and health-based failover (with short TTLs).`,
        `Cached old answers explain slow migrations; lower TTLs beforehand, and treat DNS as a critical dependency worth duplicating.`])]
  ]
});

SDPATCH('http', {
  blurb: `Almost every request in a system travels as HTTP, usually riding on top of TCP (and increasingly on QUIC, which rides on UDP). Understanding what each layer costs — especially the round trips just to set up a connection — explains why systems pool and reuse connections, and why HTTP/2 and HTTP/3 exist.`,
  sections: [
    ['What are these layers?', PLAIN(`When your app talks to a server, the message is wrapped in layers. <b>HTTP</b> is the language of the request (“GET me this page”). <b>TCP</b> is the delivery service underneath that makes sure every byte arrives, in order. <b>UDP</b> is a faster, no-guarantees alternative. Before any HTTP message can flow over TCP, the two sides must shake hands — and those handshakes cost round trips, which is where a lot of “why is this slow?” comes from.`) +
      ANALOGY(`<b>TCP is a phone call:</b> you dial, the other person picks up and says “hello?”, you say “hi, can you hear me?” — that back-and-forth (the handshake) happens <i>before</i> you talk, and the call guarantees you hear every word in order. <b>UDP is shouting postcards:</b> you just fling them out, no dialing, no confirmation — fast, but some may get lost or arrive out of order. Encryption (TLS) adds one more “let’s agree on a secret code” exchange before the real conversation.`)],
    ['Words you’ll need', KEYTERMS([
      ['TCP', 'The reliable delivery service: it sets up a connection, then guarantees every byte arrives in order (resending lost ones). Used by most web traffic and databases.'],
      ['UDP', 'The fast, best-effort alternative: no setup, no guarantees. Used for video calls, games, DNS, and QUIC.'],
      ['Handshake', 'The initial back-and-forth to establish a connection (TCP) or agree on encryption keys (TLS). Each handshake costs a round trip.'],
      ['TLS', 'The encryption layer (the “S” in HTTPS). It verifies the server and sets up a secret code so nobody can eavesdrop.'],
      ['Keep-alive / connection pooling', 'Reusing an already-open connection for many requests, so you pay the handshake cost once, not every time.'],
      ['Idempotent', 'An operation safe to repeat with the same effect (GET, PUT) — important for deciding what’s safe to auto-retry.']])],
    ['Why a fresh HTTPS request is “expensive”', PP(`Opening a brand-new secure connection costs <b>two round trips</b> of setup before your request even goes out — the TCP handshake, then the TLS handshake. If the server is across an ocean (150 ms per round trip), that’s ~300 ms of waiting before the first useful byte. That single fact explains a huge amount of design:`) +
      UL([`<b>Reuse connections</b> (keep-alive / pools): pay the handshake once, then every later request costs just one round trip.`,
        `<b>Terminate TLS close to users</b> (at a CDN or edge) so the expensive handshakes happen nearby, with long-lived connections onward to your servers.`,
        `<b>Always set timeouts</b> on network calls — without them, one slow dependency can tie up every thread.`])],
    ['TCP vs UDP, and the HTTP versions', TBL(['', 'TCP', 'UDP'], [
      ['Setup', 'Handshake first', 'None — just send'],
      ['Delivery', 'Reliable, in order, resends lost data', 'Best effort — may drop or reorder'],
      ['One lost packet', 'Stalls the whole stream', 'Only affects that packet'],
      ['Used for', 'Web, databases, SSH', 'Video calls, games, DNS, QUIC/HTTP3']]) +
      PP(`Use TCP when every byte must arrive in order; use UDP when fresh data beats complete data (in a video call, a late frame is useless — better to skip it). The HTTP versions are a story of reducing these costs: <b>HTTP/1.1</b> reuses connections but does one request at a time; <b>HTTP/2</b> multiplexes many requests on one connection; <b>HTTP/3</b> runs over QUIC (on UDP) so one lost packet no longer stalls everything and setup takes fewer round trips.`) +
      RECAP([
        `HTTP (the request language) usually rides on <b>TCP</b> (reliable, ordered delivery); <b>UDP</b> is the fast, no-guarantees alternative.`,
        `Connections need <b>handshakes</b> (TCP, then TLS), costing ~2 round trips before the first request — painful across long distances.`,
        `So systems <b>reuse connections</b> (keep-alive/pools) and terminate <b>TLS near users</b>, and always set <b>timeouts</b>.`,
        `TCP guarantees order (one lost packet stalls the stream); UDP doesn’t (good when fresh data beats complete data).`,
        `HTTP/2 multiplexes requests on one connection; HTTP/3 (QUIC over UDP) removes TCP’s head-of-line blocking and cuts setup round trips.`])]
  ]
});

SDPATCH('realtime', {
  blurb: `Plain HTTP is one-way by nature: the client asks, the server answers. But chat, notifications, live scores, and collaborative editing need the server to <b>push</b> data to the client the moment something happens. Four techniques make that possible, with very different efficiency — from crude polling to always-open WebSockets.`,
  sections: [
    ['What problem are we solving?', PLAIN(`Normally your app only receives data when it <i>asks</i> for it. That’s fine for loading a page, but useless for a chat message that should pop up the instant it’s sent — the server has no way to reach you unless you ask. “Real-time” techniques are the different ways to let the server deliver updates to the client as they happen, rather than making the client constantly check.`) +
      ANALOGY(`Imagine a kid in the back seat wanting to know when you arrive. <b>Short polling</b> is asking “are we there yet?” every minute — annoying and mostly pointless. <b>Long polling</b> is asking once and the driver only answering when you actually arrive. <b>Server-Sent Events</b> is the driver narrating the trip over the car radio — one-way, continuous. <b>WebSockets</b> is an open intercom both of you can talk through anytime. Same goal (know what’s happening), wildly different efficiency.`)],
    ['Words you’ll need', KEYTERMS([
      ['Polling', 'The client repeatedly asks “anything new?” Simple, but most answers are “no,” which wastes requests.'],
      ['Long polling', 'The client asks and the server <i>holds</i> the request open until it has something, then the client immediately asks again. Near real-time over plain HTTP.'],
      ['Server-Sent Events (SSE)', 'One long-lived HTTP response the server keeps writing updates into. One-way (server → client), simple, auto-reconnects.'],
      ['WebSocket', 'An always-open, two-way connection. Both sides can send messages anytime with tiny overhead — the standard for chat and games.'],
      ['Persistent connection', 'A connection kept open rather than closed after one reply — needed for SSE and WebSockets, and the main scaling cost.']])],
    ['The four techniques', PP(`From least to most efficient (your diagram shows all four):`) +
      TBL(['', 'Latency', 'Overhead', 'Direction', 'Good for'], [
        ['Short polling', 'Up to the interval', 'High (many empty asks)', 'Client pulls', 'Rare updates, simplicity'],
        ['Long polling', 'Low', 'Medium', 'Server push (faked)', 'Fallback when WebSockets are blocked'],
        ['SSE', 'Low', 'Low', 'Server → client', 'Feeds, notifications, live dashboards'],
        ['WebSocket', 'Lowest', 'Lowest per message', 'Both ways', 'Chat, games, collaborative editing']])],
    ['The real challenge: scaling open connections', WHY(`Short polling needs no open connections but wastes huge effort (a million clients polling every 5 s = 200,000 requests/s of mostly “nothing new”). The other three keep a connection <b>open</b> per client, which is efficient per message but means the server holds millions of idle connections — each using a bit of memory. That takes event-driven servers (Node, Go, Erlang) that handle hundreds of thousands of connections per machine. And connections are <b>stateful</b>: a message for user B must reach the exact server holding B’s connection, so you keep a “user → server” map (e.g. in Redis). This routing question — how a message finds the right open connection — is usually the real heart of a real-time design.`) +
      PP(`Rule of thumb: default to <b>WebSockets</b> when the client also sends frequently; use <b>SSE</b> when updates only flow one way; keep <b>long polling</b> as a fallback; and <b>short polling</b> only for data that changes every few minutes.`) +
      RECAP([
        `Plain HTTP can’t push, so real-time features need a way for the server to send updates as they happen.`,
        `Four options, least to most efficient: <b>short polling</b> (ask repeatedly), <b>long polling</b> (held request), <b>SSE</b> (one-way server stream), <b>WebSocket</b> (always-open, two-way).`,
        `Pick by direction and frequency: WebSockets for chat/games, SSE for one-way feeds, long polling as a fallback, short polling only for rarely-changing data.`,
        `The hard part is <b>scaling persistent connections</b>: millions of open connections need event-driven servers.`,
        `Connections are <b>stateful</b> — routing a message to the specific server holding a user’s connection (via a user→server map) is usually the real design challenge.`])]
  ]
});
