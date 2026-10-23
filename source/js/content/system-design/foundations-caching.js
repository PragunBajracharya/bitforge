/* ===== System design topics A: foundations, networking, scaling, caching ===== */

/* ---------- Foundations ---------- */
SDX('requirements', { name: 'Requirements & trade-offs', cat: 'sdfound',
  blurb: `Every design starts with two lists: what the system must do (functional requirements) and how well it must do it (non-functional requirements such as scale, latency, availability and consistency). The second list is what actually shapes the architecture.`,
  facts: [['Functional', 'What it does'], ['Non-functional', 'How well'], ['Output', 'Trade-offs, not answers']],
  dg: { w: 790, h: 280,
    n: [['fr', 'Functional requirements', 130, 70, 'box', 'users can post, follow, read'], ['nfr', 'Non-functional requirements', 140, 210, 'box', '100M DAU · p99 < 200 ms · 99.9%'],
      ['est', 'Estimates', 440, 210, 'box', 'QPS · storage · bandwidth'], ['api', 'API & data model', 430, 70, 'box'], ['arch', 'Architecture', 680, 140, 'svc', 'components + trade-offs']],
    e: [['fr', 'api', 'defines'], ['nfr', 'est', 'quantify'], ['api', 'arch', 'shapes'], ['est', 'arch', 'sizes']] },
  cap: `Functional requirements decide the API and data model; non-functional requirements, turned into numbers, decide how big and how redundant each component must be.`,
  walk: [[['fr'], `Start with functional requirements: the handful of user-visible features you will support. Write them as verbs: “users can shorten a URL”, “users can open a short URL”. Agree on what is out of scope.`],
    [['fr', 'api', 'fr>api'], `Features become an API (the operations clients call) and a data model (what you store). These are independent of scale: a URL shortener has the same API for 10 users and 10 billion.`],
    [['nfr'], `Non-functional requirements describe quality: how many users, how fast, how available, how consistent, how durable. They are where interviews and real projects are decided.`],
    [['nfr', 'est', 'nfr>est'], `Turn them into numbers: requests per second, data stored per year, bandwidth. A design for 100 QPS and a design for 1 million QPS are different systems.`],
    [['api', 'est', 'arch', 'api>arch', 'est>arch'], `Only now do you draw the architecture. Every box you add should exist because a requirement or a number demands it, and every choice is a trade-off you can name.`]],
  sections: [
    ['What system design is', PP(`System design is the process of deciding which components a software system needs, how they talk to each other, and where data lives, so that it meets its requirements at the scale it must handle. Algorithms ask “how do I compute this efficiently on one machine?”. System design asks “how do I serve this to millions of people, on many machines that fail, over a network that is slow and unreliable?”.`) +
      PP(`There is rarely one right answer. A good design is one whose trade-offs match the requirements, and a good designer is one who can say which trade-offs they made and why.`)],
    ['Functional requirements', PP(`Functional requirements are the features: what a user or another system can do. Keep the list short (three to five core features) and explicit about what is out of scope. For a chat app: send a one-to-one message, see message history, see whether a contact is online. Group chat, media and end-to-end encryption might be stated as later extensions.`) +
      CO('Tip:', `Ask who the users are and how they use the product. A read-heavy product (news, video) and a write-heavy product (logging, IoT telemetry) need very different designs even if their features sound similar.`)],
    ['Non-functional requirements', TBL(['Quality', 'Question to ask', 'Typical target'], [
      ['Scale', 'How many users, requests, bytes?', '10M DAU, 50K peak QPS'], ['Latency', 'How fast must responses be, at which percentile?', 'p99 &lt; 200 ms reads'],
      ['Availability', 'How much downtime is acceptable?', '99.9% (8.8 h/year) to 99.99% (53 min/year)'], ['Consistency', 'Must every reader see the latest write?', 'Strong for payments, eventual for likes'],
      ['Durability', 'Can we ever lose data?', '11 nines for stored files'], ['Security & privacy', 'Who may see what? Any regulations?', 'Encryption, access control, GDPR'],
      ['Cost', 'What is the budget?', 'Often the hidden constraint']]) +
      PP(`Percentiles matter more than averages. If the p99 latency is 2 seconds, one request in a hundred is slow, and a page that makes 50 backend calls will hit at least one slow call most of the time.`)],
    ['Trade-offs you will make again and again', UL([`<b>Consistency vs availability:</b> during a network partition, refuse requests or serve possibly stale data (the CAP theorem).`, `<b>Latency vs consistency:</b> waiting for more replicas to confirm a write is safer but slower.`, `<b>Read vs write performance:</b> indexes, caches and denormalized copies make reads faster and writes slower.`, `<b>Simplicity vs scalability:</b> a single database is easy to reason about; sharding scales but complicates queries and transactions.`, `<b>Cost vs everything:</b> more replicas, regions and headroom buy reliability and speed with money.`, `<b>Build vs buy:</b> a managed queue or database trades control for time and operational effort.`])],
    ['How to work through a design', OL([`Clarify requirements and scope (about 5 minutes in an interview).`, `Estimate scale: QPS, storage, bandwidth.`, `Define the API and the data model.`, `Draw a simple high-level design that works end to end.`, `Deep-dive into the hardest parts: the bottleneck, the hot spot, the consistency question.`, `Discuss failure modes, monitoring and how the design evolves at 10× scale.`]) +
      PP(`This order is the backbone of every case study at the end of this track.`)]
  ],
  qs: [SQ('Which of these is a non-functional requirement?', ['Users can upload a profile photo', 'The feed loads in under 300 ms at p99', 'Users can follow other users', 'Admins can delete posts'], 1, 'Latency targets describe how well the system works, not what it does.'),
    SQ('Why are percentiles (p99) preferred to averages for latency?', ['They are easier to compute', 'Averages hide the slow tail that many users actually hit', 'Percentiles are always lower', 'Averages ignore errors'], 1, 'A good average can hide a terrible p99, and requests that fan out to many services almost always hit the tail.')]
});

SDX('latency', { name: 'Latency numbers', cat: 'sdfound',
  blurb: `Knowing roughly how long common operations take lets you predict where a design spends its time before you build it. Memory is about 1,000 times faster than an SSD read, and a same-datacenter round trip is about 1,000 times faster than a trip across an ocean.`,
  facts: [['RAM read', '≈ 100 ns'], ['SSD random read', '≈ 16–100 µs'], ['Datacenter round trip', '≈ 0.5 ms'], ['Cross-ocean round trip', '≈ 150 ms']],
  dg: { w: 720, h: 300,
    n: [['u', 'User in Sydney', 95, 150, 'client'], ['app', 'App server', 330, 150, 'svc', 'RAM ≈ 100 ns'], ['c', 'Cache', 580, 55, 'cache', 'in-memory'], ['db', 'Database', 580, 150, 'db', 'SSD ≈ 0.1 ms'], ['ar', 'Archive disk', 580, 250, 'store', 'seek ≈ 10 ms']],
    e: [['u', 'app', '≈ 150 ms round trip'], ['app', 'c', '≈ 0.5 ms'], ['app', 'db', '1–5 ms query'], ['app', 'ar', '10 ms+']],
    z: [['Datacenter in Virginia', 220, 12, 485, 280]] },
  cap: `Where time goes in one request: the trip across the ocean dwarfs everything inside the datacenter, and a cache hit is ten times cheaper than a database query.`,
  walk: [[['u', 'u>app'], `The user’s request crosses the Pacific: light in fiber covers about 200 km per millisecond, so Sydney to Virginia and back costs roughly 150–200 ms before any work is done. Only moving servers closer (CDNs, regional deployments) fixes this.`],
    [['app'], `Inside the app server, work in memory is nearly free: reading RAM takes about 100 ns, so even a million memory reads cost only 0.1 seconds.`],
    [['app', 'c', 'app>c'], `A cache lookup on another machine in the same datacenter costs one network round trip, about 0.5 ms.`],
    [['app', 'db', 'app>db'], `A database query adds parsing, planning and possibly disk reads: typically 1–5 ms, and much more for queries that scan.`],
    [['app', 'ar', 'app>ar'], `Spinning disks need a mechanical seek (2–10 ms) per random read. That is why random I/O on hard drives must be avoided and why logs and LSM trees write sequentially.`]],
  sections: [
    ['The numbers', TBL(['Operation', 'Time', 'Relative to RAM'], [
      ['L1 cache reference', '1 ns', '1/100'], ['Branch mispredict', '3 ns', ''], ['Main memory (RAM) reference', '100 ns', '1×'], ['Compress 1 KB (fast codec)', '2 µs', '20×'],
      ['Send 1 KB over a 10 Gbps network', '1 µs', '10×'], ['Read 1 MB sequentially from RAM', '3 µs', '30×'], ['Random 4 KB read from SSD', '16–100 µs', '≈ 500×'],
      ['Read 1 MB sequentially from SSD', '50 µs', '500×'], ['Round trip within a datacenter', '500 µs', '5,000×'], ['Read 1 MB sequentially from HDD', '1 ms', '10,000×'],
      ['HDD disk seek', '2–10 ms', '≈ 50,000×'], ['Round trip US ↔ Europe', '≈ 80–150 ms', '≈ 1,000,000×']]) +
      PP(`The exact values change with hardware generations; the ratios are what you remember. They come from Jeff Dean and Peter Norvig’s classic list, updated for modern hardware.`)],
    ['What the numbers teach', UL([`<b>Memory is fast, network is slow, disks are slower, distance is slowest.</b> Most performance work moves data up this list: into memory (caches), closer to the user (CDNs), or into fewer round trips (batching).`, `<b>Round trips dominate.</b> Ten sequential 0.5 ms calls cost 5 ms; one batched call costs 0.5 ms. Chatty designs are slow designs.`, `<b>Sequential beats random.</b> Reading 1 MB sequentially from an SSD is faster than 10 random 4 KB reads. Databases and logs are built around this.`, `<b>The speed of light is a hard limit.</b> About 5 µs per km in fiber. A round trip across the Atlantic can never be faster than about 60 ms, whatever you spend.`])],
    ['Using them in a design', PP(`Suppose a page needs 20 database queries at 2 ms each, run one after another: 40 ms. If each must also wait on a cross-region replica, add 20 × 80 ms = 1.6 seconds. The arithmetic immediately tells you to run the queries in parallel, cache the results, or keep the data in the same region as the servers.`) +
      CO('Rule of thumb:', `a request budget of 200 ms leaves room for about one cross-continent round trip, or a few hundred in-datacenter round trips, or tens of thousands of memory operations, but not much of all three.`)],
    ['Throughput, not just latency', PP(`Latency is how long one operation takes; throughput is how many complete per second. An SSD with 100 µs latency can still serve hundreds of thousands of reads per second because it processes many in parallel. A 1 Gbps link moves about 125 MB per second; 10 Gbps about 1.25 GB per second. Designs need both: low latency for user-facing paths and enough throughput for peak load.`)]
  ],
  qs: [SQ('Roughly how many times slower is a same-datacenter round trip than a RAM read?', ['10×', '100×', '5,000×', '1,000,000×'], 2, '0.5 ms ÷ 100 ns = 5,000.'),
    SQ('A user in Europe talks to servers in California. What most improves their latency?', ['A faster CPU', 'More RAM on the database', 'Serving them from a region or CDN edge in Europe', 'Compressing JSON'], 2, 'The transatlantic round trip (≈ 150 ms) dwarfs everything else and only distance reduction removes it.')]
});

SDX('estimation', { name: 'Back-of-the-envelope estimation', cat: 'sdfound',
  blurb: `Quick arithmetic that turns “100 million users” into requests per second, terabytes per year and servers needed. It tells you which parts of a design are hard before you draw a single box.`,
  facts: [['Seconds per day', '86,400 ≈ 10⁵'], ['Peak / average', '2–3×'], ['1 server', '≈ 1K–10K simple req/s'], ['Precision', 'Order of magnitude']],
  dg: { w: 760, h: 330,
    n: [['dau', 'Daily active users', 105, 60, 'user', '100 million'], ['req', 'Requests per day', 380, 60, 'box', '100M × 10 = 1B'], ['avg', 'Average QPS', 650, 60, 'box', '1B ÷ 86,400 ≈ 12K'],
      ['peak', 'Peak QPS', 650, 175, 'box', '12K × 3 ≈ 35K'], ['sto', 'Storage per year', 380, 175, 'store', '20% writes × 1 KB'], ['bw', 'Peak bandwidth', 650, 285, 'box', '35K × 10 KB ≈ 350 MB/s'], ['srv', 'Servers', 380, 285, 'svc', '35K ÷ 2K ≈ 18 (+ spare)']],
    e: [['dau', 'req', '× 10 actions'], ['req', 'avg', '÷ 86,400 s'], ['avg', 'peak', '× 3'], ['req', 'sto', '× 365 days'], ['peak', 'bw', '× response size'], ['peak', 'srv', '÷ per-server QPS']] },
  cap: `The estimation chain for a read-heavy social app: users become requests, requests become QPS, and QPS drives bandwidth and server count. Storage grows from the write fraction.`,
  walk: [[['dau'], `Start from users. 100 million daily active users is a large consumer app (think a mid-sized social network).`],
    [['dau', 'req', 'dau>req'], `Each user does about 10 requests a day, so 1 billion requests per day. Ask or assume the actions per user; say your assumption out loud.`],
    [['req', 'avg', 'req>avg'], `A day has 86,400 seconds, which you can round to 100,000. 1 billion ÷ 100,000 ≈ 10,000 requests per second on average (12K precisely).`],
    [['avg', 'peak', 'avg>peak'], `Traffic is not flat: evenings, events and time zones create peaks. Plan for 2–3× the average: about 35,000 QPS.`],
    [['req', 'sto', 'req>sto'], `If 20% of requests are writes of about 1 KB: 200 million × 1 KB = 200 GB per day, about 73 TB per year before replication. With 3 replicas, about 220 TB a year.`],
    [['peak', 'bw', 'peak>bw'], `If each response averages 10 KB, peak egress is 35,000 × 10 KB ≈ 350 MB/s, about 2.8 Gbps. Large media is usually served by a CDN rather than your servers.`],
    [['peak', 'srv', 'peak>srv'], `If one app server handles about 2,000 requests per second, you need roughly 18 at peak. Add headroom for failures and deploys: run about 25–30.`]],
  sections: [
    ['Why estimate', PP(`Estimates decide architecture. 100 writes per second fit on one database; 100,000 writes per second need sharding. 10 GB fits in memory on one machine; 100 TB needs distributed storage. Getting within a factor of 10 is enough to make these calls, so round aggressively and keep the arithmetic simple.`)],
    ['Numbers to memorize', TBL(['Quantity', 'Value'], [['Seconds in a day', '86,400 ≈ 10⁵'], ['Seconds in a month', '≈ 2.5 × 10⁶'], ['Seconds in a year', '≈ 3 × 10⁷'], ['1 million requests/day', '≈ 12 per second'], ['1 billion requests/day', '≈ 12,000 per second'],
      ['2¹⁰, 2²⁰, 2³⁰, 2⁴⁰', '≈ thousand (KB), million (MB), billion (GB), trillion (TB)'], ['A tweet / chat message', '≈ 100 B – 1 KB with metadata'], ['A photo', '≈ 200 KB – 2 MB'], ['A minute of HD video', '≈ 50–100 MB']])],
    ['The method', OL([`<b>Users:</b> daily active users (DAU), and how many actions each performs.`, `<b>Traffic:</b> requests per day ÷ 10⁵ = average QPS; × 2–3 for peak. Split reads from writes, since they scale differently.`, `<b>Storage:</b> new records per day × size × retention. Multiply by the replication factor (often 3).`, `<b>Bandwidth:</b> QPS × response size, separately for ingress (uploads) and egress (downloads).`, `<b>Memory for caching:</b> the 80/20 rule: caching the hottest 20% of a day’s reads often serves 80% of traffic.`, `<b>Machines:</b> peak load ÷ capacity per machine, plus headroom (typically run at 50–70% utilization).`])],
    ['Worked example: photo sharing', PP(`10 million DAU each view 50 photos and upload 0.1 photos a day. Reads: 500 million/day ≈ 6K QPS average, ≈ 18K peak. Uploads: 1 million/day × 1 MB = 1 TB/day ≈ 365 TB/year, ×3 replicas ≈ 1 PB/year. Egress: 18K × 200 KB (thumbnails) ≈ 3.6 GB/s at peak, far too much for app servers, which tells you photos must be served from object storage through a CDN.`) +
      CO('Notice:', `the arithmetic produced two design decisions (object storage plus CDN, and a multi-petabyte storage tier) without any guessing.`)],
    ['Common mistakes', UL([`Forgetting peak traffic and designing for the average.`, `Mixing bits and bytes: network links are quoted in bits per second (1 Gbps ≈ 125 MB/s).`, `Ignoring replication and indexes, which often double or triple raw storage.`, `Spending ten minutes on precise arithmetic. Round to powers of ten and move on.`])]
  ],
  qs: [SQ('About how many requests per second is 1 billion requests per day?', ['≈ 1,200', '≈ 12,000', '≈ 120,000', '≈ 1,000,000'], 1, '10⁹ ÷ 86,400 ≈ 11,600.'),
    SQ('Uploads are 2 TB per day, kept for 5 years with 3 replicas. Roughly how much raw storage?', ['≈ 3.6 PB', '≈ 11 PB', '≈ 30 TB', '≈ 110 PB'], 1, '2 TB × 365 × 5 ≈ 3.65 PB, × 3 replicas ≈ 11 PB.')]
});

/* ---------- Networking & APIs ---------- */
SDX('dns', { name: 'DNS', cat: 'sdnet',
  blurb: `The Domain Name System turns names like example.com into IP addresses. It is a globally distributed, heavily cached database, and also a simple traffic-routing tool: it can send users to the nearest or healthiest datacenter.`,
  facts: [['Cached lookup', '≈ 0 ms'], ['Uncached lookup', '≈ 20–120 ms'], ['Record lifetime', 'TTL (seconds–days)'], ['Transport', 'UDP / TCP port 53, DoH']],
  dg: { w: 740, h: 310,
    n: [['c', 'Browser', 85, 155, 'client', 'OS cache'], ['r', 'Resolver', 320, 155, 'dns', 'ISP or 1.1.1.1'], ['root', 'Root server', 600, 50, 'dns', '“.”'], ['tld', 'TLD server', 600, 155, 'dns', '“.com”'], ['auth', 'Authoritative', 600, 262, 'dns', 'example.com']],
    e: [['c', 'r', 'lookup', 'u'], ['r', 'c', 'IP + TTL', 'u', 'r>c'], ['r', 'root', 'ask .com?'], ['r', 'tld', 'ask example.com?'], ['r', 'auth', 'get A record']] },
  cap: `A recursive resolver walks the hierarchy from the root to the authoritative server, then caches the answer for its TTL so later lookups skip all three hops.`,
  walk: [[['c'], `The browser first checks its own cache and the operating system’s cache. Most lookups end here, costing nothing.`],
    [['c', 'r', 'c>r'], `On a miss it asks a recursive resolver, usually run by the ISP or a public service such as 1.1.1.1 or 8.8.8.8. The resolver also has a large shared cache.`],
    [['r', 'root', 'r>root'], `If the resolver has nothing cached, it asks a root server, which only knows who runs each top-level domain. There are 13 root server names backed by over a thousand anycast instances.`],
    [['r', 'tld', 'r>tld'], `The .com TLD server replies with the name servers responsible for example.com.`],
    [['r', 'auth', 'r>auth'], `The authoritative server holds the actual records and answers: example.com A 93.184.216.34, TTL 300.`],
    [['r', 'c', 'r>c'], `The resolver returns the address and caches it for 300 seconds. Every user of that resolver now gets the answer instantly until the TTL expires.`]],
  sections: [
    ['Record types you will use', TBL(['Record', 'Maps', 'Example'], [['A / AAAA', 'Name → IPv4 / IPv6 address', 'api.example.com → 203.0.113.7'], ['CNAME', 'Name → another name', 'www → example.cdnprovider.net'], ['MX', 'Domain → mail servers', 'example.com → mail.example.com'], ['TXT', 'Name → text', 'domain verification, SPF'], ['NS', 'Zone → its name servers', 'example.com → ns1.dnshost.com'], ['SRV', 'Service → host + port', 'used by some service discovery']])],
    ['Why it scales', PP(`DNS is hierarchical (no single server knows everything), delegated (each organization runs its own zone), and cached at every level (browser, OS, resolver). A popular name is resolved by its authoritative server only once per TTL per resolver, no matter how many users ask. Root and big DNS providers use anycast: the same IP address is announced from many locations, and the network routes each query to the nearest one.`)],
    ['DNS as a load balancer', UL([`<b>Round-robin DNS:</b> return several A records; clients spread across them. Crude: no health awareness, and clients cache results.`, `<b>GeoDNS / latency-based routing:</b> answer with the address of the datacenter nearest the resolver.`, `<b>Failover:</b> health checks remove a dead region’s address. Recovery speed is limited by the TTL, so failover records use short TTLs (30–60 s).`]) +
      CO('Trade-off:', `short TTLs mean faster failover and traffic shifts but more DNS queries and slower first requests; long TTLs are cheap but make changes slow to propagate.`)],
    ['Pitfalls', UL([`Some clients and resolvers ignore TTLs and cache longer than told, so plan migrations to keep old addresses working for a while.`, `DNS is a dependency of everything. Large outages have been caused by DNS providers failing; critical services use two providers.`, `Plain DNS is unencrypted and spoofable. DNSSEC signs records; DNS over HTTPS or TLS encrypts queries.`])]
  ],
  qs: [SQ('You switch your site to a new IP but some users keep hitting the old one for an hour. Why?', ['DNS is eventually consistent by design: cached records live until their TTL expires', 'The root servers are slow', 'Browsers never cache DNS', 'Anycast routing failed'], 0, 'Resolvers and clients keep cached records until the TTL runs out. Lower the TTL well before a migration.')]
});

SDX('http', { name: 'TCP, UDP & HTTP', cat: 'sdnet',
  blurb: `Almost every request in a system travels as HTTP over TCP (or, increasingly, over QUIC on UDP). Knowing what each layer costs, especially round trips for connection setup, explains connection pooling, keep-alive, and why HTTP/2 and HTTP/3 exist.`,
  facts: [['TCP setup', '1 round trip'], ['TLS 1.3 setup', '+1 round trip'], ['HTTP/3 (QUIC)', '1 RTT total, 0 on resume'], ['Default ports', '80 / 443']],
  dg: { w: 720, h: 300,
    n: [['c', 'Client', 105, 150, 'client'], ['s', 'Server', 610, 150, 'svc', 'port 443']],
    e: [['c', 's', '1 · TCP handshake: SYN, SYN-ACK, ACK', 'bU', 'tcp'], ['c', 's', '2 · TLS 1.3 handshake: keys + certificate', 'bu', 'tls'], ['c', 's', '3 · HTTP request', '', 'req'], ['s', 'c', '4 · HTTP response', 'u', 'resp'], ['c', 's', '5 · reuse connection (keep-alive)', 'dN', 'reuse']] },
  cap: `A fresh HTTPS request costs two round trips of setup before the first byte of the request is sent. Reusing connections removes that cost for every later request.`,
  walk: [[['c', 's', 'tcp'], `TCP opens a connection with a three-way handshake (SYN, SYN-ACK, ACK). That costs one full round trip before any data flows: 150 ms if the server is across an ocean.`],
    [['c', 's', 'tls'], `TLS 1.3 then negotiates encryption keys and verifies the server’s certificate in one more round trip (TLS 1.2 needed two).`],
    [['c', 's', 'req'], `Only now does the HTTP request go out: a method (GET, POST), a path, headers and an optional body.`],
    [['s', 'c', 'resp'], `The server replies with a status code (200, 404, 503), headers and a body. For a far-away server this first request has cost three round trips in total.`],
    [['c', 's', 'reuse'], `Keep-alive and connection pools reuse the open, encrypted connection, so later requests cost one round trip each. That is why services keep pools of warm connections to databases and to each other.`]],
  sections: [
    ['TCP vs UDP', TBL(['', 'TCP', 'UDP'], [['Connection', 'Handshake first', 'None, just send'], ['Delivery', 'Reliable, ordered, retransmits', 'Best effort: may drop or reorder'], ['Flow / congestion control', 'Yes', 'No (application decides)'], ['Head-of-line blocking', 'Yes: one lost packet stalls the stream', 'No'], ['Used for', 'HTTP/1.1, HTTP/2, databases, SSH', 'DNS, video calls, games, QUIC (HTTP/3)']]) +
      PP(`Use TCP when every byte must arrive in order. Use UDP when fresh data beats complete data: in a video call, a late frame is useless, so it is better to skip it than wait for a retransmission.`)],
    ['HTTP versions', TBL(['Version', 'What changed', 'Remaining problem'], [['HTTP/1.1 (1997)', 'Keep-alive connections; one request at a time per connection', 'Browsers open 6 connections per host to parallelize'], ['HTTP/2 (2015)', 'Many concurrent streams multiplexed on one TCP connection; header compression', 'A lost TCP packet blocks all streams'], ['HTTP/3 (2022)', 'Runs over QUIC on UDP; streams are independent; TLS built in; 0-RTT resumption', 'Some networks block or throttle UDP']])],
    ['Methods, status codes and caching headers', UL([`<b>Safe and idempotent methods:</b> GET and HEAD don’t change state; PUT and DELETE can be repeated with the same result; POST is not idempotent. This matters for retries.`, `<b>Status codes:</b> 2xx success, 3xx redirect, 4xx client error (400 bad request, 401 unauthenticated, 403 forbidden, 404 not found, 429 rate limited), 5xx server error (500, 502 bad gateway, 503 unavailable, 504 gateway timeout).`, `<b>Caching:</b> Cache-Control (max-age, no-store, private), ETag with If-None-Match for revalidation (304 Not Modified).`])],
    ['Why this matters in design', UL([`Connection setup is expensive across distance, so terminate TLS close to users (at a CDN or edge load balancer) and keep long-lived connections from there to your servers.`, `Pool connections to databases and other services; opening one per request wastes round trips and server resources.`, `Timeouts are mandatory on every network call. Without them one slow dependency can exhaust every thread.`])]
  ],
  qs: [SQ('Why does HTTP/3 run over UDP (QUIC) instead of TCP?', ['UDP is encrypted by default', 'To avoid TCP’s head-of-line blocking and to combine transport and TLS setup into fewer round trips', 'UDP guarantees delivery', 'TCP cannot carry HTTP headers'], 1, 'QUIC implements reliable, independent streams in user space on top of UDP, so one lost packet only stalls its own stream.'),
    SQ('Which HTTP method is safe to retry automatically after a timeout without extra protection?', ['POST /payments', 'PUT /users/42 with the full new state', 'POST /orders', 'PATCH /counter (increment)'], 1, 'PUT replaces state with the same value each time, so repeating it is harmless. POST and increments need idempotency keys.')]
});

SDX('realtime', { name: 'Real-time: polling, SSE & WebSockets', cat: 'sdnet',
  blurb: `Plain HTTP is request–response: the server can only answer. Chat, notifications, live scores and collaborative editing need the server to push data. Four techniques do this, with very different costs.`,
  facts: [['Short polling', 'Simple, wasteful'], ['Long polling', 'Near real-time over HTTP'], ['SSE', 'Server → client stream'], ['WebSocket', 'Full duplex']],
  dg: { w: 720, h: 330,
    n: [['c', 'Client', 105, 165, 'client'], ['s', 'Server', 610, 165, 'svc', 'holds open connections']],
    e: [['c', 's', 'short poll: “anything new?” every 5 s', 'dU', 'poll'], ['c', 's', 'long poll: request held until data arrives', 'u', 'long'], ['s', 'c', 'SSE: one-way event stream', '', 'sse'], ['c', 's', 'WebSocket: messages both ways', 'bN', 'ws']] },
  cap: `Four ways to get updates from the server, from the least to the most efficient. All but short polling keep a connection open, so the server must handle many idle connections.`,
  walk: [[['c', 's', 'poll'], `<b>Short polling:</b> the client asks every few seconds. Easy, works everywhere, but most requests return nothing and updates arrive up to one interval late. A million clients polling every 5 s is 200,000 QPS of mostly empty responses.`],
    [['c', 's', 'long'], `<b>Long polling:</b> the client asks, and the server holds the request open until it has data (or a timeout of about 30 s), then the client immediately asks again. Near real-time with plain HTTP.`],
    [['s', 'c', 'sse'], `<b>Server-Sent Events:</b> one long HTTP response that the server keeps writing events into. Simple, automatically reconnects, but one-way (server to client) and text only.`],
    [['c', 's', 'ws'], `<b>WebSockets:</b> an HTTP request upgrades to a persistent, full-duplex connection. Both sides send small framed messages at any time with almost no overhead. The standard choice for chat, games and collaboration.`]],
  sections: [
    ['Comparing the options', TBL(['', 'Latency', 'Overhead', 'Direction', 'Good for'], [['Short polling', 'Up to the interval', 'High: many empty requests', 'Client pulls', 'Rare updates, simplicity'], ['Long polling', 'Low', 'Medium: a request per message', 'Server push (emulated)', 'Fallback when WebSockets are blocked'], ['SSE', 'Low', 'Low', 'Server → client', 'Feeds, notifications, live dashboards, LLM token streaming'], ['WebSocket', 'Lowest', 'Lowest per message', 'Both ways', 'Chat, games, collaborative editing, trading']])],
    ['Scaling persistent connections', UL([`Each open connection uses memory and a file descriptor. Event-driven servers (Node.js, Go, Netty, Erlang) hold hundreds of thousands per machine; thread-per-connection servers cannot.`, `Connections are stateful: a message for user B must reach the specific gateway server holding B’s socket. Keep a mapping user → gateway (in Redis, for example) or use pub/sub between gateways.`, `Load balancers must support long-lived connections and upgrades; deploys must drain connections gradually, and clients must reconnect with backoff and resume from the last message they saw.`, `Mobile apps in the background lose their sockets; use push notifications (APNs, FCM) to wake them.`])],
    ['Which to choose', PP(`Default to WebSockets when the client also sends frequent messages, SSE when updates flow one way, and long polling only as a fallback. Short polling is fine for data that changes every few minutes and for very small user counts. In system design interviews, mention how you route a message to the right connection: that is usually the real question.`)]
  ],
  qs: [SQ('A dashboard shows live metrics that only the server updates. Which is the simplest efficient choice?', ['Short polling every second', 'Server-Sent Events', 'A raw TCP socket', 'Email'], 1, 'SSE gives a one-way push stream over plain HTTP with automatic reconnection.')]
});

SDX('apidesign', { name: 'API design: REST, pagination & idempotency', cat: 'sdnet',
  blurb: `An API is the contract between clients and your system. Good APIs are resource-oriented, predictable, paginated, versioned and safe to retry, because networks fail and clients will send the same request twice.`,
  facts: [['Style', 'Resources + HTTP verbs'], ['Large lists', 'Cursor pagination'], ['Retries', 'Idempotency keys'], ['Change', 'Versioning']],
  dg: { w: 760, h: 300,
    n: [['c', 'Mobile app', 95, 150, 'client'], ['api', 'Payments API', 360, 150, 'svc', 'POST /v1/payments'], ['ik', 'Idempotency store', 630, 60, 'cache', 'key → stored response'], ['db', 'Payments DB', 630, 240, 'db']],
    e: [['c', 'api', 'Idempotency-Key: 7f3a…', 'u'], ['c', 'api', 'retry, same key', 'dN', 'retry'], ['api', 'ik', 'seen this key?'], ['api', 'db', 'charge once']] },
  cap: `An idempotency key lets a client safely retry a payment: the server remembers the key and returns the stored result instead of charging twice.`,
  walk: [[['c', 'api', 'c>api'], `The app sends POST /v1/payments with a unique Idempotency-Key header it generated (a UUID) for this one logical payment.`],
    [['api', 'ik', 'api>ik'], `The API checks the idempotency store. The key is new, so it records it as “in progress”.`],
    [['api', 'db', 'api>db'], `It performs the charge, then saves the response under the key (typically kept for 24 hours).`],
    [['c', 'api', 'retry'], `The response is lost to a network timeout, so the app retries with the same key.`],
    [['api', 'ik', 'api>ik'], `The API finds the key and returns the stored response. The customer is charged exactly once.`]],
  sections: [
    ['REST basics', PP(`REST models the system as resources identified by URLs, manipulated with standard HTTP methods:`) +
      TBL(['Request', 'Meaning'], [['GET /v1/users/42', 'Read user 42'], ['GET /v1/users/42/orders?limit=20', 'List a user’s orders'], ['POST /v1/orders', 'Create an order (server assigns the ID)'], ['PUT /v1/users/42', 'Replace user 42'], ['PATCH /v1/users/42', 'Update some fields'], ['DELETE /v1/orders/9', 'Delete order 9']]) +
      PP(`Use nouns for resources, plural collections, and the right status codes. Keep the API stateless: every request carries everything needed (including the auth token), so any server can handle it.`)],
    ['Pagination', TBL(['Style', 'How', 'Trade-off'], [['Offset', '?offset=40&limit=20', 'Simple and supports jumping to a page, but slow for deep pages (the database still scans skipped rows) and items shift when new ones are inserted'], ['Cursor (keyset)', '?after=eyJpZCI6MTIzfQ&limit=20', 'Fast at any depth and stable under inserts; the cursor encodes the last seen sort key. No random page access']]) +
      PP(`Feeds and large lists should use cursors: WHERE (created_at, id) &lt; (:t, :id) ORDER BY created_at DESC, id DESC LIMIT 20 uses an index and never scans skipped rows.`)],
    ['Idempotency', PP(`Clients retry when they don’t hear back, but a timeout doesn’t tell them whether the server acted. GET, PUT and DELETE are naturally idempotent. For POST, accept an Idempotency-Key header, store key → result atomically with the operation (or with a unique constraint), and replay the result on repeats. Stripe, PayPal and most payment APIs work this way.`)],
    ['Versioning and evolution', UL([`Put a version in the path (/v1/) or a header. Breaking changes go in a new version; old versions live until clients migrate.`, `Additive changes (new optional fields, new endpoints) are safe; removing or renaming fields is not.`, `Clients should ignore unknown fields so the server can add them freely.`])],
    ['Other essentials', UL([`<b>Errors:</b> a consistent error body (code, message, details) plus the right status code.`, `<b>Rate limits:</b> return 429 with Retry-After and limit headers.`, `<b>Filtering and sorting:</b> explicit query parameters, with server-side limits on page size.`, `<b>Long-running work:</b> return 202 Accepted with a status URL to poll, or send a webhook when done.`])]
  ],
  qs: [SQ('Why is cursor pagination better than offset pagination for an infinite feed?', ['It supports jumping to page 500', 'It stays fast at any depth and doesn’t skip or repeat items when new posts arrive', 'It needs no index', 'It returns more items per page'], 1, 'The cursor continues from the last seen key using an index, unaffected by inserts above it.'),
    SQ('A client times out on POST /orders and retries. How do you prevent a duplicate order?', ['Make the timeout longer', 'Use GET instead', 'Require an idempotency key and return the stored result for repeated keys', 'Delete duplicates nightly'], 2, 'Idempotency keys turn a non-idempotent POST into a safely retryable operation.')]
});

SDX('rpc', { name: 'gRPC, GraphQL & REST', cat: 'sdnet',
  blurb: `REST is not the only API style. gRPC gives fast, typed calls between internal services; GraphQL lets clients ask for exactly the data a screen needs. Many systems use all three in different places.`,
  facts: [['REST', 'Public APIs, simple'], ['gRPC', 'Internal service calls'], ['GraphQL', 'Client-shaped queries'], ['gRPC encoding', 'Protocol Buffers over HTTP/2']],
  dg: { w: 760, h: 320,
    n: [['c', 'Mobile app', 95, 160, 'client'], ['gql', 'GraphQL gateway', 340, 160, 'gw', 'one query per screen'], ['us', 'Users service', 630, 55, 'svc'], ['po', 'Posts service', 630, 160, 'svc'], ['cm', 'Comments service', 630, 265, 'svc'], ['pub', 'Partner', 95, 285, 'ext', 'public REST']],
    e: [['c', 'gql', 'query { feed … }'], ['gql', 'us', 'gRPC'], ['gql', 'po', 'gRPC'], ['gql', 'cm', 'gRPC'], ['pub', 'gql', 'GET /v1/posts', 'd']] },
  cap: `A common real-world mix: clients send one GraphQL query shaped to the screen, the gateway fans out to internal services over gRPC, and partners use a stable REST API.`,
  walk: [[['c', 'gql', 'c>gql'], `The app asks for exactly what the feed screen shows: post text, author name and avatar, and the first two comments, in one request.`],
    [['gql', 'us', 'po', 'cm', 'gql>us', 'gql>po', 'gql>cm'], `The gateway’s resolvers call the services that own each piece, in parallel, over gRPC: compact binary messages on long-lived HTTP/2 connections with generated, typed client code.`],
    [['gql', 'c', 'c>gql'], `The gateway assembles one response with exactly the requested fields: no over-fetching of unused fields, and no under-fetching that would need extra round trips from a slow mobile network.`],
    [['pub', 'gql', 'pub>gql'], `External partners use a conventional versioned REST API, which is simple, cacheable and familiar.`]],
  sections: [
    ['Side by side', TBL(['', 'REST', 'gRPC', 'GraphQL'], [['Shape', 'Resources + HTTP verbs', 'Remote procedure calls (methods)', 'One endpoint, client-written queries'], ['Encoding', 'Usually JSON', 'Protocol Buffers (binary)', 'JSON'], ['Contract', 'OpenAPI (optional)', '.proto file, code generated', 'Schema with types'], ['Streaming', 'Via SSE/WebSockets', 'Built in, both directions', 'Subscriptions'], ['HTTP caching', 'Excellent', 'None', 'Hard (POST, varying queries)'], ['Best for', 'Public APIs, simple CRUD', 'Service-to-service, low latency', 'Many client types with different data needs']])],
    ['gRPC in more depth', PP(`You define services and messages in a .proto file; tooling generates client and server stubs in every major language. Protocol Buffers are compact and fast to parse (often 3–10× smaller than JSON), and HTTP/2 multiplexes many calls on one connection. It supports deadlines that propagate across calls, which is excellent for timeouts in deep call chains. Downsides: browsers need a proxy (gRPC-Web), and binary payloads are harder to inspect.`)],
    ['GraphQL in more depth', PP(`Clients write queries naming exactly the fields they need, across related objects. The server resolves each field, often by calling other services. Pitfalls: the N+1 problem (resolving 50 posts’ authors with 50 separate calls; fix with batching via DataLoader), expensive or deeply nested queries (limit query depth and cost), and harder caching (use persisted queries).`)],
    ['How to choose', UL([`Public, third-party APIs: REST, because everyone can use it and HTTP caching works.`, `High-volume internal calls between services: gRPC.`, `Several frontends (web, iOS, Android, TV) with different data needs: a GraphQL or backend-for-frontend layer.`, `In interviews, name the style briefly and focus on the operations and data, which matter far more than the protocol.`])]
  ],
  qs: [SQ('What is the N+1 problem in GraphQL?', ['Queries can have at most N+1 fields', 'Resolving a list of N items triggers N extra calls for a related field', 'Each request needs N+1 servers', 'The schema needs N+1 types'], 1, 'Batch the related lookups (DataLoader) so 50 authors are fetched in one call.')]
});

/* ---------- Scaling ---------- */
SDX('scaling', { name: 'Vertical vs horizontal scaling', cat: 'sdscale',
  blurb: `You can make one machine bigger (vertical scaling) or add more machines (horizontal scaling). Horizontal scaling has no ceiling and survives failures, but only works if servers are stateless, so that any server can handle any request.`,
  facts: [['Vertical', 'Bigger machine'], ['Horizontal', 'More machines'], ['Requirement', 'Stateless app tier'], ['State lives in', 'DB, cache, object store']],
  dg: { w: 760, h: 330,
    n: [['u', 'Users', 80, 165, 'user'], ['lb', 'Load balancer', 270, 165, 'lb'], ['a1', 'App 1', 470, 60, 'svc', 'stateless'], ['a2', 'App 2', 470, 165, 'svc', 'stateless'], ['a3', 'App 3', 470, 270, 'svc', 'stateless'],
      ['ss', 'Session store', 670, 85, 'cache', 'Redis'], ['db', 'Database', 670, 245, 'db']],
    e: [['u', 'lb'], ['lb', 'a1'], ['lb', 'a2'], ['lb', 'a3'], ['a1', 'ss', '', 'd'], ['a2', 'ss', 'sessions', 'd'], ['a3', 'db'], ['a2', 'db'], ['a1', 'db', 'data']] },
  cap: `Horizontal scaling: identical stateless app servers behind a load balancer, with all state moved to shared stores. Add or remove app servers freely.`,
  walk: [[['u', 'lb', 'u>lb'], `All users hit one address: the load balancer.`],
    [['lb', 'a1', 'a2', 'a3', 'lb>a1', 'lb>a2', 'lb>a3'], `It spreads requests across identical app servers. Because no server stores anything user-specific in memory, consecutive requests from the same user can go to different servers.`],
    [['a1', 'a2', 'ss', 'a1>ss', 'a2>ss'], `Session data (login state, shopping carts) lives in a shared store such as Redis, or in a signed token the client sends with each request.`],
    [['a1', 'a2', 'a3', 'db', 'a1>db', 'a2>db', 'a3>db'], `Durable data lives in the database. The app tier can now grow from 3 to 300 servers by adding machines, and losing one server loses nothing.`],
    [['db'], `The database is now the part that is hard to scale. The next units cover how: caching, read replicas and sharding.`]],
  dg2: { w: 620, h: 170, n: [['u', 'Users', 80, 85, 'user'], ['big', 'One big server', 320, 85, 'svc', '96 cores · 1 TB RAM'], ['db', 'Local database', 540, 85, 'db']], e: [['u', 'big', 'all traffic'], ['big', 'db', 'same machine']] },
  dg2t: 'Compare: vertical scaling', cap2: `Vertical scaling: one bigger machine. Simple, no distributed-systems problems, but it has a hard size limit, a single point of failure, and upgrades usually need downtime.`,
  sections: [
    ['The two directions', TBL(['', 'Vertical (scale up)', 'Horizontal (scale out)'], [['How', 'More CPU, RAM, faster disks', 'More machines'], ['Limit', 'The largest machine you can buy', 'Practically none'], ['Failure', 'Single point of failure', 'Survives machine loss'], ['Complexity', 'None: same code', 'Load balancing, shared state, distributed data'], ['Cost curve', 'Grows steeply at the high end', 'Roughly linear with commodity machines'], ['Good for', 'Databases early on, simple systems', 'Stateless web and API tiers, large systems']])],
    ['Making servers stateless', PP(`A server is stateless if it keeps nothing between requests that another server would need. Move state out:`) +
      UL([`Sessions → a shared cache (Redis) or self-contained signed tokens (JWTs).`, `Uploaded files → object storage (S3), never the local disk.`, `Scheduled jobs → a job queue, so they run once, not once per server.`, `In-memory caches → fine as an optimization, as long as correctness doesn’t depend on them.`]) +
      PP(`Sticky sessions (the load balancer always sends a user to the same server) are a workaround, not a solution: a server failure still loses those sessions, and load becomes uneven.`)],
    ['Autoscaling', PP(`With stateless servers, a controller can add instances when CPU, latency or queue depth crosses a threshold and remove them when load drops. Scale out quickly and in slowly, keep a minimum for redundancy, and remember that new instances take time to boot and warm caches, so predictable peaks are better handled with scheduled scaling.`)],
    ['Interview guidance', PP(`Start simple (one server, one database), then scale the bottleneck the estimates point to. The usual path: separate the database, add a load balancer and more app servers, add caching, add read replicas, then shard or move to a distributed database, and add a CDN for static content.`)]
  ],
  qs: [SQ('Which change is required before you can add app servers behind a load balancer freely?', ['Use a bigger database', 'Move session and file state out of the app servers', 'Enable HTTP/3', 'Use sticky sessions for everyone'], 1, 'Any server must be able to serve any request, so state must live in shared stores.')]
});

SDX('loadbalancer', { name: 'Load balancers', cat: 'sdscale',
  blurb: `A load balancer spreads incoming requests across a pool of servers, removes unhealthy ones, and lets you add capacity or deploy without downtime. It works at layer 4 (TCP connections) or layer 7 (HTTP requests).`,
  facts: [['Layer 4', 'Routes connections'], ['Layer 7', 'Routes requests by URL, header'], ['Health checks', 'Every few seconds'], ['Examples', 'NGINX, HAProxy, Envoy, AWS ALB/NLB']],
  dg: { w: 740, h: 320,
    n: [['c1', 'Client', 85, 100, 'client'], ['c2', 'Client', 85, 220, 'client'], ['lb', 'Load balancer', 330, 160, 'lb', 'TLS termination'], ['s1', 'Server A', 610, 55, 'svc', '12 active'], ['s2', 'Server B', 610, 160, 'svc', '9 active'], ['s3', 'Server C', 610, 265, 'ext', 'failing checks']],
    e: [['c1', 'lb', 'HTTPS'], ['c2', 'lb', 'HTTPS'], ['lb', 's1', 'req 1, 3'], ['lb', 's2', 'req 2, 4'], ['lb', 's3', 'GET /health ✗', 'd']] },
  cap: `The load balancer terminates TLS, spreads requests over healthy servers, and stops sending traffic to Server C after it fails its health checks.`,
  walk: [[['c1', 'c2', 'lb', 'c1>lb', 'c2>lb'], `Clients connect to the load balancer’s address (often several load balancers behind one DNS name, for redundancy). It terminates TLS, so servers behind it handle plain HTTP and certificates live in one place.`],
    [['lb', 's1', 's2', 'lb>s1', 'lb>s2'], `For each request it picks a server using its algorithm: round robin, least connections, or a hash of some key.`],
    [['lb', 's3', 'lb>s3'], `It probes every server’s health endpoint every few seconds. After a few consecutive failures Server C is taken out of rotation; after a few successes it is put back.`],
    [['s1', 's2'], `Deploys work the same way: drain a server (stop sending new requests, let in-flight ones finish), upgrade it, then add it back. Users never notice.`]],
  sections: [
    ['Algorithms', TBL(['Algorithm', 'How it picks', 'Use when'], [['Round robin', 'Next server in turn', 'Servers and requests are uniform'], ['Weighted round robin', 'In turn, proportional to weights', 'Servers have different capacity'], ['Least connections', 'Server with fewest open requests', 'Request durations vary a lot'], ['Least response time', 'Fastest recent responses', 'Latency-sensitive traffic'], ['Power of two choices', 'Sample two random servers, take the less loaded', 'Large fleets: near-optimal and cheap'], ['Hash (IP, user, key)', 'Same key → same server', 'Cache locality or stickiness; use consistent hashing so resizing moves few keys']])],
    ['Layer 4 vs layer 7', TBL(['', 'Layer 4 (transport)', 'Layer 7 (application)'], [['Sees', 'IPs and ports', 'Full HTTP: path, headers, cookies'], ['Routing', 'Per connection', 'Per request: /api → API servers, /img → image servers'], ['Features', 'Very fast, any protocol', 'TLS termination, retries, compression, auth, rate limiting'], ['Cost', 'Cheapest per byte', 'More CPU per request']])],
    ['Avoiding a single point of failure', PP(`The load balancer itself must not be a single point of failure. Run at least two in active–passive (a floating virtual IP moves to the standby when the active fails) or active–active (DNS or anycast spreads traffic across all of them). Cloud load balancers do this for you across availability zones.`)],
    ['Global load balancing', PP(`To spread traffic across regions, use GeoDNS or anycast to send users to the nearest healthy region, then a regional load balancer inside it. If a region fails, its DNS entries or anycast routes are withdrawn and traffic flows to the next nearest region.`)],
    ['Pitfalls', UL([`Health checks that only test “process is up” miss broken dependencies; checks that test every dependency can take the whole fleet out when one database blips. Check what the server needs to serve requests, and fail open if all servers look unhealthy.`, `Long-lived connections (WebSockets, gRPC) defeat per-connection balancing: rebalance by periodically closing connections or by balancing per request at layer 7.`, `Retries at the load balancer plus retries in clients can multiply load during an incident; cap them.`])]
  ],
  qs: [SQ('Requests vary from 5 ms to 5 s in duration. Which algorithm balances load best?', ['Round robin', 'Least connections', 'Random', 'Hash on client IP'], 1, 'Least connections accounts for servers that are busy with slow requests; round robin ignores it.')]
});

SDX('proxy', { name: 'Reverse proxies & API gateways', cat: 'sdscale',
  blurb: `A reverse proxy sits in front of your servers and handles cross-cutting work: TLS, compression, caching, routing. An API gateway is a reverse proxy specialized for APIs: authentication, rate limiting, request routing to microservices, and API keys.`,
  facts: [['Forward proxy', 'Acts for clients'], ['Reverse proxy', 'Acts for servers'], ['Gateway adds', 'Auth, quotas, routing'], ['Examples', 'NGINX, Envoy, Kong, AWS API Gateway']],
  dg: { w: 760, h: 330,
    n: [['c', 'Clients', 90, 165, 'client'], ['gw', 'API gateway', 330, 165, 'gw', 'TLS · auth · limits'], ['au', 'Auth service', 330, 290, 'svc', 'validates tokens'], ['us', 'Users service', 630, 60, 'svc', '/users/*'], ['or', 'Orders service', 630, 165, 'svc', '/orders/*'], ['se', 'Search service', 630, 270, 'svc', '/search']],
    e: [['c', 'gw', 'HTTPS'], ['gw', 'au', 'verify token', 'b'], ['gw', 'us', '/users'], ['gw', 'or', '/orders'], ['gw', 'se', '/search']] },
  cap: `An API gateway is the single front door: it authenticates each request once, enforces quotas, and routes by path to the service that owns it.`,
  walk: [[['c', 'gw', 'c>gw'], `Every external request enters through the gateway, which terminates TLS and attaches a request ID used for tracing across services.`],
    [['gw', 'au', 'gw>au'], `It authenticates the request (validating a JWT locally or asking an auth service) and checks rate limits and API-key quotas. Rejected requests never reach the services.`],
    [['gw', 'us', 'or', 'se', 'gw>us', 'gw>or', 'gw>se'], `It routes by path, header or version to the owning service and may transform requests, aggregate several calls, or retry safely.`],
    [['us', 'or', 'se'], `Services stay focused on business logic: they trust the identity the gateway passes along and don’t each reimplement auth, logging and throttling.`]],
  sections: [
    ['Forward vs reverse proxy', PP(`A forward proxy sits in front of clients and makes requests on their behalf (corporate proxies, VPN egress). A reverse proxy sits in front of servers and receives requests on their behalf; clients don’t know which server answers. Load balancers, CDNs and API gateways are all reverse proxies with different specialties.`)],
    ['What a reverse proxy does', UL([`TLS termination and HTTP/2 or HTTP/3 to clients.`, `Compression (gzip, Brotli) and serving static files.`, `Caching responses.`, `Load balancing, retries and timeouts.`, `Protection: request size limits, slow-client buffering, basic DDoS filtering, hiding internal topology.`])],
    ['What an API gateway adds', UL([`Authentication and authorization (OAuth tokens, API keys, mTLS).`, `Rate limiting and quotas per client or plan.`, `Routing to microservices and API versioning.`, `Request and response transformation, protocol translation (REST → gRPC).`, `Aggregation: one client call fans out to several services (a backend-for-frontend pattern).`, `Analytics, logging and tracing headers.`])],
    ['Service mesh', PP(`For traffic between internal services, a service mesh (Istio, Linkerd) runs a small proxy (a sidecar such as Envoy) next to every service. The sidecars handle mutual TLS, retries, timeouts, load balancing and metrics without changing application code. The gateway handles north–south (external) traffic; the mesh handles east–west (internal) traffic.`)],
    ['Pitfalls', UL([`The gateway is on every request path: it must be horizontally scaled and highly available.`, `Putting business logic in the gateway turns it into a bottleneck owned by everyone; keep it to cross-cutting concerns.`, `Each hop adds a little latency (usually under a millisecond in-datacenter).`])]
  ],
  qs: [SQ('Which responsibility belongs in an API gateway rather than in each microservice?', ['Calculating order totals', 'Validating access tokens and enforcing rate limits', 'Writing to the orders table', 'Ranking search results'], 1, 'Cross-cutting concerns like auth and rate limiting are done once at the edge.')]
});

/* ---------- Caching ---------- */
SDX('caching', { name: 'Caching strategies', cat: 'sdcache',
  blurb: `A cache keeps copies of frequently used data in fast storage (usually memory) so most reads skip the slow database. The hard parts are deciding when to write to the cache, when its copy is stale, and what happens when many requests miss at once.`,
  facts: [['Memory read', '≈ 0.5 ms via network'], ['DB query', '≈ 1–10 ms+'], ['Typical hit rate', '80–99%'], ['Tools', 'Redis, Memcached']],
  dg: { w: 740, h: 310,
    n: [['c', 'Client', 85, 110, 'client'], ['app', 'App server', 320, 110, 'svc'], ['ca', 'Cache', 610, 110, 'cache', 'Redis · TTL 5 min'], ['db', 'Database', 320, 255, 'db', 'source of truth']],
    e: [['c', 'app', 'GET /user/42'], ['app', 'ca', '1 · get user:42', 'U', 'get'], ['ca', 'app', '2 · miss', 'U', 'miss'], ['app', 'db', '3 · SELECT …', '', 'read'], ['app', 'ca', '4 · set + TTL', 'd', 'set']] },
  cap: `Cache-aside, the most common pattern: the application checks the cache, falls back to the database on a miss, and fills the cache for the next reader.`,
  walk: [[['c', 'app', 'c>app'], `A request for user 42 arrives.`],
    [['app', 'ca', 'get'], `The app first asks the cache for key user:42. On a hit (most of the time) it returns in about half a millisecond and the database is never touched.`],
    [['ca', 'app', 'miss'], `On a miss the cache returns nothing.`],
    [['app', 'db', 'read'], `The app reads from the database, the source of truth.`],
    [['app', 'ca', 'set'], `It writes the result to the cache with a time-to-live, so the next reader hits. When user 42 is updated, the app deletes the key so the stale copy disappears.`]],
  sections: [
    ['Where caches live', UL([`<b>Client:</b> browser cache, mobile app memory (HTTP Cache-Control, ETags).`, `<b>CDN:</b> static files and cacheable API responses near users.`, `<b>Application memory:</b> fastest, but per-server and lost on restart.`, `<b>Distributed cache:</b> Redis or Memcached shared by all app servers.`, `<b>Database:</b> its own buffer pool and query caches.`])],
    ['Write strategies', TBL(['Pattern', 'How writes work', 'Pros', 'Cons'], [['Cache-aside (lazy)', 'App writes the DB, then deletes the cache key', 'Simple; cache holds only what is read', 'First read after a write misses; small race windows'], ['Read-through', 'Cache itself loads from the DB on a miss', 'App code is simpler', 'Needs a cache that supports loaders'], ['Write-through', 'Write cache and DB together, synchronously', 'Cache always fresh', 'Slower writes; caches data nobody reads'], ['Write-back (write-behind)', 'Write cache now, flush to DB later', 'Very fast writes, absorbs bursts', 'Data loss if the cache dies before flushing'], ['Write-around', 'Write DB only; cache fills on reads', 'Avoids caching write-once data', 'Recent writes always miss']])],
    ['Invalidation and staleness', PP(`“There are only two hard things in computer science: cache invalidation and naming things.” Options: a TTL (bounded staleness, simplest), delete-on-write (fresh, but races exist: a slow reader can put an old value back after a delete; versioned keys or short TTLs limit the damage), or change-data-capture events from the database that evict keys. Prefer deleting keys over updating them on writes, because concurrent updates can leave the cache with the wrong one.`)],
    ['Failure modes', TBL(['Problem', 'What happens', 'Fix'], [['Thundering herd / stampede', 'A hot key expires and thousands of requests hit the DB at once', 'Request coalescing (one loader per key, others wait), locks, early probabilistic refresh'], ['Cache penetration', 'Requests for keys that don’t exist always miss', 'Cache negative results briefly; Bloom filter of valid keys'], ['Cache avalanche', 'Many keys expire at the same moment', 'Add random jitter to TTLs'], ['Hot key', 'One key gets a huge share of traffic', 'Replicate it, add a local in-process cache, split the key'], ['Cold start', 'Empty cache after restart overloads the DB', 'Warm the cache gradually, keep replicas']])],
    ['When not to cache', PP(`Data that must be strongly consistent (account balances during a transfer), data that is rarely re-read, or data that changes faster than it is read. Every cache adds a second copy that can be wrong; add one when the numbers show reads dominate and some staleness is acceptable.`)]
  ],
  qs: [SQ('A popular product page’s cache key expires and the database is flooded. What is this called and what fixes it?', ['Cache penetration; Bloom filter', 'Thundering herd; let one request reload the key while others wait or get the old value', 'Write-back loss; use write-through', 'Hot partition; shard the DB'], 1, 'Request coalescing or early refresh ensures one reload instead of thousands.'),
    SQ('Which write strategy risks losing data if the cache node crashes?', ['Cache-aside', 'Write-through', 'Write-back', 'Write-around'], 2, 'Write-back acknowledges writes before they reach the database.')]
});

SDX('lru', { name: 'Eviction policies & LRU cache', cat: 'sdcache',
  blurb: `A cache has limited memory, so when it is full it must evict something. Least Recently Used (LRU) evicts the item untouched for the longest time, and a hash map plus a doubly linked list makes every operation O(1).`,
  facts: [['get / put', 'O(1)'], ['Memory', 'O(capacity)'], ['Structure', 'Hash map + doubly linked list'], ['Redis default', 'Approximated LRU / LFU']],
  dg: { w: 760, h: 270,
    n: [['map', 'Hash map', 380, 55, 'box', 'key → list node'], ['h', 'head', 85, 190, 'box', 'most recent'], ['a', 'C', 245, 190, 'box', 'just used'], ['b', 'A', 380, 190, 'box'], ['d', 'B', 515, 190, 'box', 'least recent'], ['t', 'tail', 675, 190, 'box', 'evict here']],
    e: [['h', 'a', '', 'b'], ['a', 'b', '', 'b'], ['b', 'd', '', 'b'], ['d', 't', '', 'b'], ['map', 'a', '', 'd'], ['map', 'b', '', 'd'], ['map', 'd', '', 'd']] },
  cap: `An LRU cache: the hash map finds any node in O(1); the doubly linked list keeps nodes in recency order, so moving a node to the front and evicting from the back are both O(1).`,
  walk: [[['map'], `get(key): look the key up in the hash map. A miss returns nothing.`],
    [['map', 'b', 'map>b'], `A hit gives the list node directly, here A, without scanning the list.`],
    [['h', 'a', 'b', 'h>a'], `Unlink A from its neighbors and insert it right after head: it is now the most recently used. Both are pointer updates, O(1).`],
    [['d', 't', 'd>t'], `put(key) on a full cache: the node just before tail is the least recently used (B). Remove it from the list and its key from the map, then insert the new node at the front.`]],
  sections: [
    ['Eviction policies', TBL(['Policy', 'Evicts', 'Strength', 'Weakness'], [['LRU', 'Least recently used', 'Great for recency-heavy workloads; simple', 'A one-off scan of many keys flushes the useful ones'], ['LFU', 'Least frequently used', 'Keeps long-term favorites', 'Old popular items linger; needs counters with decay'], ['FIFO', 'Oldest inserted', 'Trivial', 'Ignores usage entirely'], ['Random', 'Any item', 'No bookkeeping', 'Unpredictable'], ['TTL-based', 'Expired items', 'Bounds staleness', 'Not a size policy on its own'], ['W-TinyLFU / ARC', 'Adaptive mixes of recency and frequency', 'Best hit rates in practice (Caffeine, ZFS)', 'More complex']])],
    ['Why a linked list and a map', PP(`The map alone gives O(1) lookup but no order; a list alone gives order but O(n) lookup. Together: the map points into the list, the list keeps recency order, and sentinel head and tail nodes remove edge cases. Java’s LinkedHashMap with access order, and Python’s OrderedDict with move_to_end, are built-in versions of exactly this structure.`)],
    ['LRU in real systems', UL([`Redis approximates LRU by sampling a few keys and evicting the oldest among them, which avoids the memory cost of a global list.`, `Memcached uses a segmented LRU per slab class.`, `Database buffer pools use LRU variants that protect pages from one-off scans (MySQL inserts new pages in the middle of the list).`, `CPU caches use pseudo-LRU in hardware.`])],
    ['Sizing a cache', PP(`Estimate the working set: if 20% of 10 million products get 80% of views and each cached entry is 2 KB, caching 2 million entries needs 4 GB, which fits on one Redis node with room to spare. Measure the hit rate after launch: each percentage point of hit rate removes a slice of database load.`)]
  ],
  code: null, prac: [146],
  qs: [SQ('Why does an O(1) LRU cache need a doubly (not singly) linked list?', ['To store values twice', 'To unlink a node in O(1) given only a pointer to it', 'To iterate faster', 'Singly linked lists can’t have sentinels'], 1, 'Removing a node needs its predecessor; a doubly linked node knows it directly.')]
});

SDX('cdn', { name: 'Content delivery networks', cat: 'sdcache',
  blurb: `A CDN is a network of edge servers in hundreds of cities that cache your content close to users. It cuts latency from hundreds of milliseconds to tens, absorbs most traffic before it reaches your servers, and shields you from traffic spikes and attacks.`,
  facts: [['Edge locations', 'Hundreds of cities'], ['Typical hit ratio', '90–99% for static files'], ['Latency saved', '≈ 50–200 ms per request'], ['Examples', 'Cloudflare, Akamai, CloudFront, Fastly']],
  dg: { w: 760, h: 320,
    n: [['u1', 'User in Paris', 95, 70, 'client'], ['u2', 'User in Tokyo', 95, 250, 'client'], ['e1', 'Edge: Paris', 350, 70, 'cdn', 'cache hit'], ['e2', 'Edge: Tokyo', 350, 250, 'cdn', 'cache miss'], ['o', 'Origin', 640, 160, 'svc', 'us-east-1'], ['s3', 'Object storage', 640, 280, 'store']],
    e: [['u1', 'e1', '≈ 8 ms'], ['u2', 'e2', '≈ 10 ms'], ['e2', 'o', 'fetch once ≈ 160 ms'], ['e1', 'o', 'revalidate (304)', 'd'], ['o', 's3', 'files']] },
  cap: `Each user talks to a nearby edge. Hits are served locally; a miss fetches the object from the origin once, and every later user in that region gets the cached copy.`,
  walk: [[['u1', 'e1', 'u1>e1'], `DNS or anycast sends the Paris user to the Paris edge, a few milliseconds away. The image is cached there, so it is served immediately.`],
    [['u2', 'e2', 'u2>e2'], `The Tokyo user hits the Tokyo edge, which doesn’t have the file yet.`],
    [['e2', 'o', 'o', 's3', 'e2>o', 'o>s3'], `The edge fetches it from the origin across the Pacific, once, and caches it according to Cache-Control headers.`],
    [['e1', 'o', 'e1>o'], `When an object’s TTL expires, the edge revalidates with a conditional request; if nothing changed, the origin answers 304 Not Modified with no body.`]],
  sections: [
    ['What to put on a CDN', UL([`Static assets: JavaScript, CSS, fonts, images, with long TTLs and content-hashed file names (app.3f9a2c.js), so a new version gets a new URL instead of needing invalidation.`, `Media: video segments and audio, which make up most internet traffic.`, `Cacheable API responses (public product data, for seconds or minutes).`, `Whole pages for anonymous users.`])],
    ['Push vs pull', TBL(['', 'Pull CDN', 'Push CDN'], [['How content arrives', 'Edge fetches from origin on first request', 'You upload content to the CDN ahead of time'], ['Good for', 'Most websites and APIs', 'Large files, predictable releases'], ['Downside', 'First request per edge is slow', 'You manage uploads and storage']])],
    ['Invalidation', PP(`Prefer versioned URLs, which never need invalidation. Otherwise use short TTLs or explicit purge APIs (which take seconds to propagate globally). For dynamic content, stale-while-revalidate lets the edge serve a slightly old copy while it fetches a fresh one in the background.`)],
    ['More than caching', UL([`TLS termination near users, saving the setup round trips.`, `Optimized long-haul connections back to the origin.`, `DDoS absorption and web application firewall rules.`, `Edge compute: running small functions at the edge for redirects, A/B tests, auth checks or personalization.`, `Image resizing and format conversion (WebP, AVIF).`])],
    ['Design notes', PP(`In estimates, if egress is more than a few hundred MB/s of mostly static content, a CDN is the answer. Make sure private content uses signed URLs or tokens with expiry, so the CDN can serve it without making it public.`)]
  ],
  qs: [SQ('Why do builds name files like app.3f9a2c.js?', ['To compress them better', 'So each version has a new URL and can be cached forever without invalidation', 'To hide source code', 'Because CDNs require it'], 1, 'The content hash changes when the file changes, so old cached copies are never served for the new version.')]
});
