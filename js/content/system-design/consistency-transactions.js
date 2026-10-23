/* ===== System design topics C: consistency, consensus, transactions ===== */

SDX('cap', { name: 'CAP & PACELC', cat: 'sdcons',
  blurb: `When the network between replicas breaks (a partition), a distributed system must choose: keep answering and risk returning stale or conflicting data (availability), or refuse some requests until it can guarantee up-to-date answers (consistency). PACELC adds: even without partitions, you trade latency for consistency.`,
  facts: [['C', 'Every read sees the latest write'], ['A', 'Every request gets a response'], ['P', 'Survive network partitions'], ['Reality', 'P is not optional: choose C or A']],
  dg: { w: 760, h: 320,
    n: [['u1', 'User in US', 95, 70, 'client'], ['u2', 'User in EU', 95, 250, 'client'], ['n1', 'Replica US', 360, 70, 'db', 'x = 5'], ['n2', 'Replica EU', 360, 250, 'db', 'x = 4 (old)'], ['cp', 'CP choice', 640, 70, 'box', 'EU refuses: “try later”'], ['ap', 'AP choice', 640, 250, 'box', 'EU answers x = 4']],
    e: [['u1', 'n1', 'write x = 5'], ['u2', 'n2', 'read x'], ['n1', 'n2', 'replication cut ✂', 'd'], ['n2', 'cp', 'consistent', 'd'], ['n2', 'ap', 'available', 'd']] },
  cap: `During a partition the EU replica cannot learn about the US write. It can either refuse to answer (consistent but unavailable) or answer with what it has (available but stale). No design gets both.`,
  walk: [[['u1', 'n1', 'u1>n1'], `A US user writes x = 5 to the US replica.`],
    [['n1', 'n2', 'n1>n2'], `The transatlantic link fails. Replication can’t reach the EU replica, which still has x = 4. Partitions like this happen in real networks: cut cables, misconfigured routers, overloaded switches, long garbage-collection pauses.`],
    [['u2', 'n2', 'u2>n2'], `An EU user reads x. The EU replica must decide right now.`],
    [['n2', 'cp', 'n2>cp'], `CP: refuse (or block) because it can’t confirm it has the latest value. Correct but unavailable for EU users. Banking ledgers, inventory counts and leader election make this choice.`],
    [['n2', 'ap', 'n2>ap'], `AP: answer x = 4, and reconcile when the link heals. Always available but temporarily inconsistent. Shopping carts, social feeds, DNS and caches make this choice.`]],
  sections: [
    ['What CAP really says', PP(`The CAP theorem (Brewer, proven by Gilbert and Lynch in 2002) says a distributed data store can’t simultaneously guarantee linearizable consistency, availability of every non-failed node, and tolerance of network partitions. Since partitions will happen, the real choice is how the system behaves during one: CP or AP. When there is no partition, a system can be both consistent and available.`)],
    ['PACELC', PP(`PACELC extends CAP: if there is a Partition, choose Availability or Consistency; Else (normal operation), choose Latency or Consistency. Strong consistency needs coordination between replicas (often across zones or regions), which costs round trips on every write or read. So even on a perfect network you trade latency for consistency.`) +
      TBL(['System', 'During partition', 'Normal operation'], [['DynamoDB, Cassandra (default settings)', 'A', 'L (fast, eventually consistent)'], ['Spanner, CockroachDB', 'C', 'C (pays latency)'], ['MongoDB (majority)', 'C', 'C'], ['PostgreSQL with async replicas', 'Depends on failover setup', 'Reads from replicas favor L']])],
    ['It is a spectrum', UL([`Many databases let you choose per request: Cassandra’s consistency levels (ONE, QUORUM, ALL), DynamoDB’s strongly consistent reads.`, `Different data in the same product can make different choices: balances CP, likes AP.`, `“Available” in CAP means every node answers; real systems often stay available on the majority side of a partition and unavailable on the minority side.`])],
    ['Interview guidance', PP(`Don’t just say “we choose AP”. Say which data needs which guarantee and why, and what users see during a failure: “If a region is cut off, users there can still read their feed (possibly stale) but checkout is disabled until it reconnects.”`)]
  ],
  qs: [SQ('Why is “CA” (consistent and available, no partition tolerance) not a real option for a distributed system?', ['It is too expensive', 'Networks can always partition, so the system must have a defined behavior when they do', 'CA systems can’t replicate', 'It is illegal'], 1, 'Partitions are a fact of networks; the only question is whether you sacrifice C or A while one lasts.'),
    SQ('A social network shows like counts. Which choice fits?', ['CP: block reads during partitions', 'AP: show possibly stale counts and reconcile later', 'Disable likes', 'Single global lock'], 1, 'Slightly stale like counts harm no one; unavailability would.')]
});

SDX('consistency', { name: 'Consistency models', cat: 'sdcons',
  blurb: `“Consistent” means different things. Consistency models describe what values a read may return after writes, from the strongest (linearizable: like a single copy) to the weakest (eventual: replicas converge sometime). Stronger models are easier to program against and more expensive to provide.`,
  facts: [['Strongest', 'Linearizable'], ['Common middle', 'Causal, read-your-writes'], ['Weakest', 'Eventual'], ['Cost', 'Coordination = latency']],
  dg: { w: 780, h: 320,
    n: [['w', 'Writer', 90, 160, 'client', 'sets x = 2'], ['L', 'Leader', 320, 160, 'db', 'x = 2'], ['r1', 'Replica 1', 560, 60, 'db', 'x = 2 (applied)'], ['r2', 'Replica 2', 560, 260, 'db', 'x = 1 (lagging)'], ['a', 'Reader A', 720, 160, 'client']],
    e: [['w', 'L', 'write'], ['L', 'r1', 'replicate'], ['L', 'r2', 'replicate (slow)', 'd'], ['a', 'r1', 'read → 2'], ['a', 'r2', 'read → 1 (stale)', 'd']] },
  cap: `The same reader can get different answers depending on which replica serves it. Consistency models define which of these answers are allowed.`,
  walk: [[['w', 'L', 'w>L'], `A writer sets x from 1 to 2 on the leader.`],
    [['L', 'r1', 'L>r1'], `Replica 1 applies the change quickly.`],
    [['L', 'r2', 'L>r2'], `Replica 2 is behind and still has x = 1.`],
    [['a', 'r1', 'a>r1'], `Reader A reads from replica 1 and sees 2.`],
    [['a', 'r2', 'a>r2'], `Then it reads from replica 2 and sees 1: time appears to go backwards. Eventual consistency allows this; monotonic reads forbid it; linearizability forbids both stale reads.`]],
  sections: [
    ['The ladder', TBL(['Model', 'Guarantee', 'Example use'], [['Linearizable (strong)', 'Behaves like one copy: once a write completes, every later read sees it', 'Leader election, locks, unique usernames, balances'], ['Sequential', 'All clients see operations in the same order, not necessarily real-time order', 'Some replicated state machines'], ['Causal', 'If B depends on A (a reply to a comment), everyone sees A before B', 'Comments, chat, collaborative apps'], ['Read-your-writes', 'You always see your own writes', 'Profile edits, posts'], ['Monotonic reads', 'You never see older data after newer data', 'Feeds, dashboards'], ['Eventual', 'If writes stop, replicas eventually agree', 'Likes, view counts, DNS, caches']])],
    ['How systems provide them', UL([`<b>Linearizable:</b> single leader with reads from the leader (or leases), consensus protocols (Raft, Paxos), or synchronized clocks with bounded uncertainty (Spanner’s TrueTime).`, `<b>Read-your-writes:</b> route a user to the leader after they write, or wait until a replica has caught up to the user’s last write position.`, `<b>Monotonic reads:</b> stick each user to one replica.`, `<b>Causal:</b> track dependencies with version vectors or keep related writes in one partition.`, `<b>Eventual:</b> asynchronous replication plus conflict resolution.`])],
    ['Resolving conflicts', TBL(['Strategy', 'How', 'Risk'], [['Last-write-wins (LWW)', 'Keep the value with the highest timestamp', 'Silently drops concurrent writes; clock skew picks the wrong one'], ['Version vectors + siblings', 'Detect concurrent versions and return both for the app to merge', 'App must write merge logic'], ['CRDTs', 'Data types whose merges always converge (counters, sets, text)', 'Limited to supported types'], ['Application rules', 'e.g. union shopping-cart items', 'Domain specific']])],
    ['Practical advice', PP(`Use the weakest model your feature tolerates, but no weaker. Most product features are fine with read-your-writes plus eventual consistency for others. Reserve strong consistency for invariants that must never break: money, inventory, uniqueness and locks.`)]
  ],
  qs: [SQ('Which guarantee ensures you see the comment you just posted when you refresh?', ['Eventual consistency', 'Read-your-writes', 'Last-write-wins', 'Monotonic writes'], 1, 'Read-your-writes guarantees a user observes their own updates.')]
});

SDX('quorum', { name: 'Quorums (N, R, W)', cat: 'sdcons',
  blurb: `In leaderless replication, each key is stored on N replicas. A write waits for W acknowledgments and a read asks R replicas. If R + W > N, every read overlaps at least one replica that has the latest write, so reads see it.`,
  facts: [['Typical', 'N = 3, W = 2, R = 2'], ['Overlap rule', 'R + W > N'], ['Fast writes', 'W = 1 (weaker)'], ['Used by', 'Dynamo, Cassandra, Riak']],
  dg: { w: 780, h: 360,
    n: [['c', 'Client', 85, 175, 'client'], ['co', 'Coordinator', 300, 175, 'svc', 'N = 3, W = 2, R = 2'], ['a', 'Replica A', 650, 45, 'db', 'v2'], ['b', 'Replica B', 650, 175, 'db', 'v2'], ['cc', 'Replica C', 650, 315, 'ext', 'v1 · missed write']],
    e: [['c', 'co', 'put / get'], ['co', 'a', 'write ✓', '', 'wa'], ['co', 'b', 'write ✓', 'u', 'wb'], ['co', 'cc', 'write ✗ timeout', 'd', 'wc'], ['co', 'b', 'read → v2', 'n', 'rb'], ['co', 'cc', 'read → v1 · repair', 'N', 'rc']] },
  cap: `With N = 3 and W = 2, a write succeeds once two replicas confirm it. A read of any two replicas must include at least one with v2, so the newest version wins and the stale replica is repaired.`,
  walk: [[['c', 'co', 'c>co'], `A client writes key k = v2. Any node can coordinate; it sends the write to all three replicas responsible for k.`],
    [['co', 'a', 'b', 'wa', 'wb'], `Replicas A and B acknowledge. With W = 2 the write is successful and the client is told so.`],
    [['co', 'cc', 'wc'], `Replica C was slow or partitioned and missed the write. It still has v1.`],
    [['co', 'b', 'cc', 'rb', 'rc'], `Later a read asks R = 2 replicas, B and C. Because 2 + 2 > 3, at least one of them (B) must have v2. The coordinator compares version numbers and returns v2.`],
    [['co', 'cc', 'rc'], `It also sends v2 to C (read repair). Background anti-entropy with Merkle trees and hinted handoff fix other stragglers.`]],
  sections: [
    ['The rule', PP(`Writes reach W replicas; reads consult R replicas. If R + W &gt; N, the read set and the write set must share at least one replica, so a read can always find the latest successful write (by comparing versions). Common settings: N = 3, W = 2, R = 2 for balanced reads and writes; W = 3, R = 1 for fast reads; W = 1, R = 3 for fast writes.`)],
    ['Choosing N, R and W', TBL(['Setting', 'Effect'], [['W = N', 'Writes fail if any replica is down; reads can use R = 1'], ['R = N', 'Reads fail if any replica is down'], ['W = 1, R = 1', 'Fastest and most available; no overlap, so reads can be stale (eventual consistency)'], ['W + R > N', 'Reads see the latest successful write, under normal conditions'], ['W > N/2', 'Two conflicting writes can’t both succeed with disjoint replica sets']])],
    ['Keeping replicas in sync', UL([`<b>Read repair:</b> fix stale replicas noticed during reads.`, `<b>Hinted handoff:</b> if a replica is down, another node holds its writes temporarily and hands them over when it returns (a “sloppy quorum”).`, `<b>Anti-entropy:</b> replicas compare Merkle trees of their data and exchange only the ranges that differ.`])],
    ['Caveats', UL([`Quorums alone are not linearizable: concurrent writes, sloppy quorums, partial failures and clock-based last-write-wins can still return surprising results.`, `Concurrent writes to the same key need conflict handling (version vectors, siblings or LWW).`, `Latency is set by the slowest of the W or R replicas you wait for, so tail latency matters; some systems send to extra replicas to cut the tail.`])]
  ],
  qs: [SQ('With N = 5, which settings guarantee read/write overlap?', ['W = 2, R = 2', 'W = 3, R = 3', 'W = 1, R = 3', 'W = 2, R = 1'], 1, '3 + 3 = 6 > 5. The others sum to 5 or less.')]
});

SDX('raft', { name: 'Consensus & leader election (Raft)', cat: 'sdcons',
  blurb: `Consensus lets a group of machines agree on a sequence of values even if some crash. Raft does it by electing one leader that appends commands to a replicated log; an entry is committed once a majority stores it. etcd, Consul, ZooKeeper (ZAB) and distributed databases rely on it.`,
  facts: [['Cluster size', '3 or 5 nodes'], ['Tolerates', '(N − 1) / 2 failures'], ['Commit rule', 'Majority stored it'], ['Used in', 'etcd, Consul, CockroachDB, Kafka KRaft']],
  dg: { w: 780, h: 340,
    n: [['c', 'Client', 85, 170, 'client'], ['L', 'Node 1 · leader', 330, 170, 'svc', 'term 4'], ['f2', 'Node 2', 610, 40, 'svc', 'follower'], ['f3', 'Node 3', 610, 125, 'svc', 'follower'], ['f4', 'Node 4', 610, 215, 'svc', 'follower'], ['f5', 'Node 5', 610, 300, 'ext', 'crashed']],
    e: [['c', 'L', 'SET x = 5'], ['L', 'f2', 'AppendEntries'], ['L', 'f3', 'AppendEntries'], ['L', 'f4', 'AppendEntries'], ['L', 'f5', '', 'd']] },
  cap: `A five-node Raft cluster. The leader replicates each command to the followers; once three of five (a majority) have it, it is committed, even with Node 5 down.`,
  walk: [[['f2', 'f3', 'f4', 'f5', 'L'], `Election: every node starts as a follower with a randomized timeout (say 150–300 ms). If it hears nothing from a leader before its timeout, it becomes a candidate, increments the term, votes for itself and asks the others for votes.`],
    [['L'], `A node that collects votes from a majority (3 of 5) becomes leader for that term. Each node votes once per term and only for candidates whose log is at least as up to date as its own, so a new leader always has every committed entry.`],
    [['c', 'L', 'c>L'], `A client sends a command. The leader appends it to its log at index 42.`],
    [['L', 'f2', 'f3', 'f4', 'L>f2', 'L>f3', 'L>f4'], `It sends the entry to followers in AppendEntries messages (which double as heartbeats). Nodes 2 and 3 acknowledge first: together with the leader that is 3 of 5, a majority.`],
    [['L', 'c', 'c>L'], `Entry 42 is committed. The leader applies it to its state machine and replies to the client. Followers apply it when they learn the commit index. Node 5 catches up from the leader’s log when it returns.`]],
  sections: [
    ['Why consensus is needed', PP(`Many problems reduce to agreeing on one thing despite failures: who the leader is, who holds a lock, the order of writes, cluster membership, configuration. Without consensus, two nodes can both believe they are in charge (split brain). Consensus protocols guarantee safety (never disagree) under crashes and network delays, and make progress whenever a majority can communicate.`)],
    ['Majorities', PP(`Any two majorities of the same cluster overlap in at least one node, so a decision made by one majority is always visible to the next. A cluster of 2f + 1 nodes tolerates f failures: 3 nodes tolerate 1, 5 tolerate 2. Even sizes add cost without adding tolerance (4 nodes still tolerate only 1). The minority side of a partition can’t elect a leader or commit, which is exactly the CP choice.`)],
    ['Raft’s three parts', TBL(['Part', 'What happens'], [['Leader election', 'Randomized timeouts, terms, votes from a majority, up-to-date-log check'], ['Log replication', 'Leader appends, replicates, commits at majority, followers apply in order; inconsistent follower logs are overwritten by the leader’s'], ['Safety', 'Only nodes with all committed entries can win elections; leaders never overwrite their own committed entries']])],
    ['Using consensus in designs', UL([`You rarely implement Raft yourself; you use a coordination service (etcd, ZooKeeper, Consul) for leader election, distributed locks (with fencing tokens), service discovery and configuration.`, `Databases use it per shard: CockroachDB, TiDB and YugabyteDB run a Raft group per range of keys; Kafka uses KRaft for metadata.`, `Consensus is slow relative to a single machine (a majority round trip per commit) and doesn’t scale to many nodes, so keep the consensus group small and use it for metadata, not bulk data.`])],
    ['Paxos and friends', PP(`Paxos (Lamport, 1989) is the original; Multi-Paxos is what systems like Chubby and Spanner use. Raft (2014) was designed to be understandable and is now the most common. ZAB powers ZooKeeper. Byzantine fault-tolerant protocols (PBFT, and blockchain consensus) also handle nodes that lie, at much higher cost.`)]
  ],
  qs: [SQ('How many node failures can a 5-node Raft cluster tolerate while still committing writes?', ['1', '2', '3', '4'], 1, 'A majority of 5 is 3, so up to 2 nodes can be down.'),
    SQ('Why are Raft election timeouts randomized?', ['To save power', 'So nodes rarely start elections at the same moment and split the vote', 'To hide the leader', 'For security'], 1, 'Randomization makes it likely one candidate wins before others time out.')]
});

SDX('clocks', { name: 'Time, clocks & ordering', cat: 'sdcons',
  blurb: `Machines’ clocks drift and jump, so timestamps from different servers can’t reliably order events. Logical clocks (Lamport clocks, vector clocks) order events by causality instead, and can tell when two updates happened concurrently and conflict.`,
  facts: [['NTP skew', 'Milliseconds, sometimes more'], ['Lamport clock', 'Total order consistent with causality'], ['Vector clock', 'Detects concurrency'], ['Spanner TrueTime', 'Bounded uncertainty, waits it out']],
  dg: { w: 800, h: 300,
    n: [['p', 'Phone', 90, 60, 'client', 'adds milk'], ['l', 'Laptop', 90, 240, 'client', 'adds eggs'], ['ra', 'Replica A', 350, 60, 'db', '{A:2, B:1}'], ['rb', 'Replica B', 350, 240, 'db', '{A:1, B:2}'], ['m', 'Compare clocks', 600, 150, 'box', 'neither ≥ other → concurrent'], ['res', 'Merged cart', 600, 270, 'box', '{A:2, B:2} milk + eggs']],
    e: [['p', 'ra', 'write'], ['l', 'rb', 'write'], ['ra', 'm', 'sync'], ['rb', 'm', 'sync'], ['m', 'res', 'merge siblings']] },
  cap: `Two devices update the same shopping cart on different replicas. Comparing vector clocks shows neither update saw the other, so they are concurrent; the system keeps both and merges, instead of silently dropping one.`,
  walk: [[['p', 'ra', 'p>ra'], `Starting from cart version {A:1, B:1}, the phone adds milk on replica A, which increments its own counter: {A:2, B:1}.`],
    [['l', 'rb', 'l>rb'], `Meanwhile the laptop adds eggs on replica B: {A:1, B:2}.`],
    [['ra', 'rb', 'm', 'ra>m', 'rb>m'], `When the replicas sync, they compare clocks entry by entry. A’s clock is larger in A but smaller in B, so neither version happened after the other: they are concurrent.`],
    [['m', 'res', 'm>res'], `Instead of last-write-wins (which would silently lose milk or eggs), both versions are kept as siblings and merged (union of items). The merged clock is the element-wise maximum, {A:2, B:2}.`]],
  sections: [
    ['Why wall clocks fail', UL([`Quartz clocks drift; NTP corrects them, but typical skew between servers is milliseconds and can be much larger after network trouble.`, `Clocks can jump backwards when corrected, and leap seconds cause anomalies.`, `So “the write with the later timestamp wins” can pick the wrong write, and “event A has an earlier timestamp than B” does not prove A happened first.`, `Use monotonic clocks for measuring durations (timeouts), never wall-clock time.`])],
    ['Lamport clocks', OL([`Each node keeps a counter.`, `Increment it before each local event or send; attach it to messages.`, `On receive, set counter = max(local, received) + 1.`, `Order events by (counter, node ID). If A caused B, A’s timestamp is smaller.`]) + PP(`Lamport clocks give a total order consistent with causality, but a smaller timestamp does not mean A caused B; they can’t detect concurrency.`)],
    ['Vector clocks', PP(`Each node keeps a vector of counters, one per node. A node increments its own entry on each update; on sync, vectors are merged by element-wise maximum. Comparing two vectors: if every entry of V1 ≤ V2, V1 happened before V2; if each is larger somewhere, they are concurrent and conflict. Amazon’s Dynamo and Riak use version vectors to detect conflicting writes.`)],
    ['Other tools', TBL(['Tool', 'Idea'], [['Hybrid logical clocks (HLC)', 'Physical time plus a logical counter: close to wall time, still causal (CockroachDB)'], ['TrueTime (Spanner)', 'GPS and atomic clocks give a time interval with bounded error; transactions wait out the uncertainty (≈ 7 ms) to get global ordering'], ['Sequence numbers from a leader', 'One node assigns order; simplest when there is a leader'], ['Fencing tokens', 'Monotonic numbers from a lock service, checked by storage, to reject stale lock holders']])]
  ],
  qs: [SQ('Vector clocks {A:3, B:1} and {A:2, B:4}: what is their relationship?', ['First happened before second', 'Second happened before first', 'Concurrent', 'Identical'], 2, 'Each is larger in one entry, so neither saw the other.')]
});

SDX('idgen', { name: 'Unique ID generation', cat: 'sdcons',
  blurb: `A single database’s auto-increment doesn’t work across many shards and services. Distributed ID schemes generate unique IDs without coordination: random UUIDs, or Twitter’s Snowflake, which packs a timestamp, a machine ID and a counter into 64 bits so IDs are also roughly time-sorted.`,
  facts: [['Snowflake', '64 bits, time-sortable'], ['Per machine', '4,096 IDs per ms'], ['UUIDv4', '128 random bits'], ['UUIDv7', 'Time-ordered UUID']],
  dg: { w: 800, h: 290,
    n: [['b0', 'sign', 70, 50, 'box', '1 bit', 56], ['b1', 'timestamp', 270, 50, 'box', '41 bits · ms since epoch', 344], ['b2', 'machine', 530, 50, 'box', '10 bits', 176], ['b3', 'sequence', 705, 50, 'box', '12 bits', 174],
      ['s1', 'ID server 1', 150, 200, 'svc', 'machine 1'], ['s2', 'ID server 2', 400, 200, 'svc', 'machine 2'], ['db', 'Sharded tables', 660, 200, 'db', 'sorted by ID ≈ time']],
    e: [['s1', 'db', '1723… | 1 | 0'], ['s2', 'db', '1723… | 2 | 0', 'n'], ['b1', 's1', '', 'ds'], ['b2', 's2', '', 'ds']] },
  cap: `A Snowflake ID: 41 bits of milliseconds (≈ 69 years), 10 bits of machine ID (1,024 generators) and a 12-bit per-millisecond counter. Each generator makes unique IDs independently, and IDs sort by creation time.`,
  walk: [[['b0', 'b1'], `The top bit is 0 (keeps the number positive). The next 41 bits are milliseconds since a custom epoch, so IDs created later are larger.`],
    [['b2'], `10 bits identify the generator (assigned at deploy time or from a coordination service), so two machines can never produce the same ID.`],
    [['b3'], `12 bits count IDs within the same millisecond on one machine: up to 4,096 per ms. If exhausted, wait for the next millisecond.`],
    [['s1', 's2', 'db', 's1>db', 's2>db'], `Every service instance generates IDs locally, with no network call, and the IDs are unique, 64-bit and roughly ordered by time, which keeps B-tree inserts sequential and lets you sort by ID instead of by timestamp.`]],
  sections: [
    ['Requirements', UL([`Unique across all machines, forever.`, `Often: fits in 64 bits (fast to index, smaller than strings).`, `Often: roughly sortable by time, for pagination and index locality.`, `Generated with high throughput and no single point of failure.`])],
    ['Options compared', TBL(['Scheme', 'Size', 'Sorted?', 'Coordination', 'Notes'], [['DB auto-increment', '64-bit', 'Yes', 'One database', 'Single point of failure and bottleneck; leaks counts'], ['Multi-master step (server k of n uses k, k+n, …)', '64-bit', 'Roughly', 'Fixed server count', 'Hard to add servers'], ['UUIDv4', '128-bit', 'No', 'None', 'Random inserts fragment B-tree indexes'], ['UUIDv7 / ULID', '128-bit', 'Yes (ms)', 'None', 'Modern default when 128 bits are acceptable'], ['Snowflake', '64-bit', 'Yes (ms)', 'Unique machine IDs', 'Twitter, Discord, Instagram variants'], ['Ticket server / ranges', '64-bit', 'Yes', 'Central allocator hands out blocks of 1,000', 'Flickr; cheap and simple']])],
    ['Clock issues', PP(`Snowflake depends on the clock moving forward. If NTP moves it backwards, a generator could repeat timestamps; implementations refuse to generate (or wait) until the clock passes the last used timestamp. IDs from different machines are only roughly ordered, within clock skew.`)],
    ['Design notes', UL([`Don’t expose sequential IDs publicly if counts are sensitive (competitors can estimate your order volume); use random or encoded IDs at the edge.`, `Short public IDs (URL shorteners, invite codes) are a different problem: base62-encode a unique number.`])]
  ],
  qs: [SQ('Why do random UUIDv4 primary keys hurt write performance in B-tree databases?', ['They are too short', 'Inserts land in random pages, causing page splits and poor cache locality', 'They aren’t unique', 'They need a central server'], 1, 'Time-ordered IDs append near the end of the index; random ones scatter across it.')]
});

SDX('twopc', { name: 'Two-phase commit', cat: 'sdtxn',
  blurb: `Two-phase commit (2PC) makes a transaction atomic across several databases: a coordinator first asks every participant to prepare (promise they can commit), and only if all say yes tells them to commit. It is correct but blocking, and slow.`,
  facts: [['Phases', 'Prepare, then commit'], ['Round trips', '2 + log writes'], ['Weakness', 'Blocks if coordinator dies'], ['Used in', 'XA transactions, inside distributed DBs']],
  dg: { w: 760, h: 320,
    n: [['co', 'Coordinator', 140, 160, 'svc', 'order service'], ['pa', 'Payments DB', 560, 60, 'db', 'participant'], ['in', 'Inventory DB', 560, 260, 'db', 'participant']],
    e: [['co', 'pa', '1 · PREPARE', 'U', 'p1'], ['co', 'in', '1 · PREPARE', 'N', 'p2'], ['pa', 'co', '2 · YES (locked)', 'u', 'v1'], ['in', 'co', '2 · YES (locked)', 'n', 'v2'], ['co', 'pa', '3 · COMMIT', '', 'c1'], ['co', 'in', '3 · COMMIT', '', 'c2']] },
  cap: `Phase 1 collects promises; phase 2 broadcasts the decision. A participant that voted yes must wait for the decision, holding its locks, however long the coordinator takes.`,
  walk: [[['co', 'pa', 'in', 'p1', 'p2'], `Prepare: the coordinator asks each participant whether it can commit its part (charge $40; reserve 1 item).`],
    [['pa', 'in', 'co', 'v1', 'v2'], `Each participant does the work, writes it durably to its log, locks the affected rows and votes YES. After voting yes it may not change its mind.`],
    [['co'], `The coordinator writes its decision (commit, since everyone said yes) to its own log. That record is the moment the transaction commits.`],
    [['co', 'pa', 'in', 'c1', 'c2'], `Commit: it tells every participant, which make the changes visible and release locks. If any participant had voted NO or timed out, the decision would be abort everywhere.`]],
  sections: [
    ['Why it works', PP(`Every participant promises before anyone commits, and the single decision is recorded durably before it is sent. So either all participants commit or all abort, even across crashes: a recovering participant that voted yes asks the coordinator for the outcome.`)],
    ['Why people avoid it', UL([`<b>Blocking:</b> if the coordinator crashes after participants vote yes, they hold locks and can’t decide alone until it recovers.`, `<b>Latency:</b> at least two round trips and several forced log writes per transaction.`, `<b>Availability:</b> any participant being down aborts the transaction; availability is the product of all participants’ availability.`, `<b>Heterogeneity:</b> XA across different databases and brokers is poorly supported and operationally painful.`])],
    ['Where it is used well', PP(`Inside distributed databases that control all participants and make the coordinator itself fault-tolerant with consensus: Spanner and CockroachDB run 2PC across shards, where each participant and the coordinator is a Raft or Paxos group, so a single machine failure doesn’t block. Between independent microservices, prefer sagas.`)],
    ['Variants', UL([`<b>Three-phase commit</b> adds a pre-commit phase to reduce blocking but assumes bounded network delays, so it is rarely used.`, `<b>Percolator-style transactions</b> (TiDB, Google’s Percolator) implement 2PC on top of a key-value store with timestamps.`])]
  ],
  qs: [SQ('What happens in 2PC if the coordinator crashes after all participants vote YES but before sending the decision?', ['Participants commit automatically', 'Participants abort automatically', 'Participants block, holding locks, until they learn the decision', 'The transaction is half applied'], 2, 'A yes-voter can’t safely decide alone: the coordinator might have decided either way.')]
});

SDX('saga', { name: 'Sagas', cat: 'sdtxn',
  blurb: `A saga splits a business transaction across services into a sequence of local transactions. Each step commits on its own; if a later step fails, earlier steps are undone by compensating actions (refund, release stock). It trades atomic isolation for availability and loose coupling.`,
  facts: [['Each step', 'Local transaction'], ['On failure', 'Compensations in reverse'], ['Styles', 'Orchestration, choreography'], ['Gives up', 'Isolation (intermediate states visible)']],
  dg: { w: 920, h: 260,
    n: [['o', 'Order service', 95, 110, 'svc', 'order PENDING'], ['p', 'Payment service', 350, 110, 'svc', 'charge $40'], ['i', 'Inventory service', 610, 110, 'svc', 'reserve 1'], ['s', 'Shipping service', 840, 110, 'ext', 'no courier ✗']],
    e: [['o', 'p', '1 · charge'], ['p', 'i', '2 · reserve'], ['i', 's', '3 · book'], ['i', 'p', 'release stock', 'dU', 'ci'], ['p', 'o', 'refund', 'dU', 'cp']] },
  cap: `A saga for placing an order. When shipping fails at step 3, compensations run backwards: release the reserved stock, refund the payment, mark the order cancelled.`,
  walk: [[['o', 'p', 'o>p'], `The order is created as PENDING and the payment service charges the card in its own database transaction.`],
    [['p', 'i', 'p>i'], `Inventory reserves the item in its own transaction.`],
    [['i', 's', 'i>s'], `Shipping fails: no courier is available for that address.`],
    [['i', 'p', 'ci'], `Compensate in reverse order. Inventory releases the reservation.`],
    [['p', 'o', 'cp'], `Payment refunds the charge and the order becomes CANCELLED. The system is consistent again, though for a moment a user could have seen a charge for an order that was later cancelled.`]],
  sections: [
    ['Orchestration vs choreography', TBL(['', 'Orchestration', 'Choreography'], [['Control', 'A central orchestrator tells each service what to do next', 'Each service listens for events and reacts'], ['Visibility', 'Flow in one place; easy to monitor and change', 'Flow scattered across services'], ['Coupling', 'Orchestrator knows all steps', 'Looser, but cyclic event dependencies can creep in'], ['Tools', 'Temporal, AWS Step Functions, Camunda', 'Kafka or a message bus']])],
    ['Designing compensations', UL([`Every step needs a semantic undo: refund (not delete) a payment, release a reservation, send a cancellation email.`, `Compensations must be idempotent and retryable, since they can be delivered more than once.`, `Some actions can’t be undone (an email already sent); put them last, after the steps that can fail (the “pivot” step).`, `Use states such as PENDING and APPROVED so other requests can see a step is in progress.`])],
    ['Isolation problems', PP(`Because each step commits independently, other transactions can see intermediate states (an order charged but not yet reserved) or act on data a later compensation will undo. Countermeasures: semantic locks (mark records as pending), commutative updates, re-reading values before acting, and ordering steps so the risky ones come first.`)],
    ['Reliability', PP(`Each step’s local write and its outgoing event must happen together; use the transactional outbox. Track saga state durably so a crashed orchestrator resumes where it stopped. Workflow engines like Temporal provide durable state, retries and timers out of the box.`)]
  ],
  qs: [SQ('What replaces rollback in a saga?', ['Two-phase commit', 'Compensating transactions that semantically undo completed steps', 'Deleting the database', 'Retrying forever'], 1, 'Each completed local transaction is undone by its own compensating action, in reverse order.')]
});

SDX('idempotency', { name: 'Exactly-once effects: idempotency & outbox', cat: 'sdtxn',
  blurb: `Networks and queues deliver messages at least once, so duplicates are normal. Exactly-once effects come from idempotent consumers (processing a message twice has the same result as once) and the transactional outbox (never losing an event when you save data).`,
  facts: [['Delivery reality', 'At least once'], ['Consumer side', 'Dedupe by message ID'], ['Producer side', 'Transactional outbox'], ['Result', 'Effectively once']],
  dg: { w: 860, h: 300,
    n: [['svc', 'Order service', 95, 75, 'svc'], ['db', 'Orders DB', 340, 75, 'db', 'orders + outbox, one txn'], ['rel', 'Outbox relay', 340, 235, 'worker', 'polls or reads log'], ['br', 'Broker', 590, 235, 'queue'], ['cons', 'Email consumer', 590, 75, 'worker'], ['dd', 'Processed IDs', 790, 75, 'db', 'unique event_id']],
    e: [['svc', 'db', 'one txn'], ['db', 'rel', 'new outbox rows'], ['rel', 'br', 'publish'], ['br', 'cons', 'deliver (maybe twice)'], ['cons', 'dd', 'dedupe']] },
  cap: `The outbox makes saving data and publishing its event atomic; the processed-IDs table makes handling a duplicate delivery harmless. Together they give exactly-once effects over at-least-once delivery.`,
  walk: [[['svc', 'db', 'svc>db'], `The service writes the order and an “OrderPlaced” row in an outbox table in the same database transaction. Either both are saved or neither is.`],
    [['db', 'rel', 'rel', 'br', 'db>rel', 'rel>br'], `A relay process reads new outbox rows (by polling or from the database log via change data capture) and publishes them to the broker, marking them sent. If it crashes mid-way it republishes: at least once.`],
    [['br', 'cons', 'br>cons'], `The broker may deliver the event more than once (retries, rebalances).`],
    [['cons', 'dd', 'cons>dd'], `The consumer records the event ID in a processed table with a unique constraint, in the same transaction as its own side effects. A duplicate hits the constraint and is skipped, so the email is sent once.`]],
  sections: [
    ['The dual-write problem', PP(`“Save the order, then publish an event” fails if the process crashes between the two: the order exists but no one hears about it. “Publish, then save” fails the other way. Distributed transactions between a database and a broker are rarely available. The outbox pattern turns two writes into one local transaction plus a reliable, retryable relay.`)],
    ['Making consumers idempotent', TBL(['Technique', 'How'], [['Dedupe table', 'Store processed message IDs with a unique constraint, in the same transaction as the effect'], ['Natural idempotency', 'Use set-style operations: SET status = PAID instead of balance += 40'], ['Conditional writes', 'UPDATE … WHERE version = 7, so a replay of an old message does nothing'], ['Upserts', 'INSERT … ON CONFLICT DO NOTHING keyed on a business ID'], ['Idempotency keys', 'For external APIs (payments), pass a key the provider deduplicates on']])],
    ['Exactly once, precisely', PP(`True exactly-once delivery across a network is impossible in general (a sender can’t distinguish a lost message from a lost acknowledgment). What systems provide is exactly-once processing or effects: Kafka’s idempotent producers and transactions within Kafka, Flink’s checkpoints with transactional sinks, or at-least-once delivery plus idempotent consumers, which works everywhere.`)],
    ['Checklist', UL([`Give every message a unique ID at creation.`, `Make every handler safe to run twice.`, `Store side effects and the dedupe record atomically.`, `Expire dedupe records after the maximum redelivery window if storage matters.`])]
  ],
  qs: [SQ('Why insert the outbox row in the same transaction as the order?', ['It is faster', 'So the order and its event are saved atomically and the event can’t be lost', 'Brokers require it', 'To avoid indexes'], 1, 'The relay can then publish every committed event, retrying as needed.')]
});

SDX('bloom', { name: 'Bloom filters', cat: 'sdtxn',
  blurb: `A Bloom filter answers “have I seen this key?” using a small bit array and k hash functions. It can return false positives (“maybe yes”) but never false negatives (“definitely no”), so it is used to skip expensive lookups for keys that don’t exist.`,
  facts: [['Memory', '≈ 10 bits per key for 1% FP'], ['Add / check', 'O(k)'], ['False negatives', 'Never'], ['Used in', 'Cassandra, RocksDB, CDNs, Chrome']],
  dg: { w: 800, h: 300,
    n: [['k', 'add “alice”', 95, 60, 'box'], ['h1', 'h₁ → 1', 280, 60, 'box'], ['h2', 'h₂ → 4', 420, 60, 'box'], ['h3', 'h₃ → 8', 560, 60, 'box'],
      ['b0', '0', 160, 220, 'box', '', 44], ['b1', '1', 210, 220, 'box', '', 44], ['b2', '0', 260, 220, 'box', '', 44], ['b3', '1', 310, 220, 'box', '', 44], ['b4', '1', 360, 220, 'box', '', 44], ['b5', '0', 410, 220, 'box', '', 44], ['b6', '1', 460, 220, 'box', '', 44], ['b7', '0', 510, 220, 'box', '', 44], ['b8', '1', 560, 220, 'box', '', 44], ['b9', '0', 610, 220, 'box', '', 44]],
    e: [['k', 'h1'], ['k', 'h2', '', 'u'], ['k', 'h3', '', 'U'], ['h1', 'b1', 'set'], ['h2', 'b4', 'set'], ['h3', 'b8', 'set']],
    t: [['bit array (m = 10)', 640, 260, 'start'], ['positions 0 … 9', 160, 268, 'middle']] },
  cap: `Adding a key sets the bits chosen by its k hash functions. Checking a key reads the same bits: any 0 means “definitely not present”; all 1s means “probably present”.`,
  walk: [[['k'], `To add “alice”, compute k = 3 hash functions of it.`],
    [['h1', 'h2', 'h3', 'k>h1', 'k>h2', 'k>h3'], `They point to positions 1, 4 and 8 of a 10-bit array (real filters have millions of bits).`],
    [['h1', 'h2', 'h3', 'b1', 'b4', 'b8', 'h1>b1', 'h2>b4', 'h3>b8'], `Set those three bits to 1. Bits only ever turn on.`],
    [['b1', 'b3', 'b4'], `To check “bob”, hash it the same way. If any of its positions holds 0, bob was never added: skip the database. If all are 1 (perhaps set by other keys), bob might be present, so do the real lookup.`]],
  sections: [
    ['How it works', OL([`Allocate m bits, all 0, and choose k independent hash functions.`, `add(x): set bits h₁(x) … hₖ(x).`, `mightContain(x): return true only if all k bits are 1.`, `There is no delete in a plain Bloom filter (clearing a bit could remove other keys); counting Bloom filters or cuckoo filters support deletion.`])],
    ['Sizing', PP(`For n keys and false-positive rate p: m ≈ −n ln p / (ln 2)² bits and k ≈ (m/n) ln 2 hash functions. Rules of thumb: about 9.6 bits per key and 7 hashes for 1% false positives; 14.4 bits per key for 0.1%. A filter for 100 million keys at 1% is about 120 MB, far smaller than the keys themselves.`)],
    ['Where they are used', UL([`LSM-tree databases keep one per SSTable so reads skip files that can’t contain the key.`, `Caches use one to avoid caching one-hit wonders (only cache a URL the second time it is seen) and to stop cache penetration from nonexistent keys.`, `Web crawlers track visited URLs; recommendation systems avoid showing already-seen items.`, `Browsers once checked malicious URLs against a local filter before asking a server.`])],
    ['Trade-offs', PP(`Bloom filters trade a tunable false-positive rate for enormous memory savings and constant-time checks. They suit cases where a false positive just costs an extra lookup, never where it would cause a wrong answer.`)]
  ],
  code: null,
  qs: [SQ('A Bloom filter says a key is not present. How sure is that?', ['About 99%', 'Certain', 'It depends on k', 'Never reliable'], 1, 'If any of the key’s bits is 0, the key was never added: no false negatives.')]
});

SDX('sketches', { name: 'Count-min sketch & HyperLogLog', cat: 'sdtxn',
  blurb: `At scale, exact counting is expensive. Probabilistic sketches give approximate answers in tiny, fixed memory: a count-min sketch estimates how often each item appears (heavy hitters), and HyperLogLog estimates how many distinct items there are (unique visitors) with about 1% error in 12 KB.`,
  facts: [['Count-min', 'Frequencies, overestimates only'], ['HyperLogLog', 'Distinct counts ≈ ±0.8%'], ['HLL memory', '12 KB for billions'], ['Mergeable', 'Yes, both']],
  dg: { w: 800, h: 300,
    n: [['s', 'Click stream', 90, 150, 'queue', 'billions of events'], ['cms', 'Count-min sketch', 360, 60, 'box', 'd = 4 rows × w = 2,000'], ['hll', 'HyperLogLog', 360, 245, 'box', '16,384 registers · 12 KB'], ['tk', 'Top-K heap', 640, 60, 'box', 'trending pages'], ['uv', 'Unique visitors', 640, 245, 'box', '≈ 48.2M ± 0.8%']],
    e: [['s', 'cms', '+1 in 4 counters'], ['s', 'hll', 'update 1 register'], ['cms', 'tk', 'estimate counts'], ['hll', 'uv', 'estimate']] },
  cap: `Two sketches over the same stream: count-min estimates each page’s frequency to keep a top-K list; HyperLogLog estimates the number of distinct users. Both use fixed memory however long the stream runs.`,
  walk: [[['s', 'cms', 's>cms'], `Count-min: for each event, hash the item with d hash functions and increment one counter in each of d rows.`],
    [['cms', 'tk', 'cms>tk'], `To estimate an item’s count, read its d counters and take the minimum. Collisions only add, so the estimate is never below the true count; with w = 2,000 the error is at most about 0.1% of the total, with high probability.`],
    [['s', 'hll', 's>hll'], `HyperLogLog: hash each user ID; use the first bits to pick a register and count the leading zeros of the rest. Long runs of zeros are rare, so the maximum seen hints at how many distinct values passed by.`],
    [['hll', 'uv', 'hll>uv'], `A harmonic mean across registers gives the estimate. Merging two HLLs (register-wise max) gives the union, so daily sketches combine into weekly ones.`]],
  sections: [
    ['Count-min sketch', UL([`A d × w table of counters with d hash functions.`, `update(x): for each row i, increment table[i][hᵢ(x) mod w].`, `estimate(x): the minimum of those d counters.`, `Error ≤ (e / w) × total count with probability 1 − e^(−d). Choose w for accuracy and d for confidence.`, `Pair with a heap to track heavy hitters: trending hashtags, top URLs, abusive IPs.`])],
    ['HyperLogLog', UL([`Uses m registers (2¹⁴ = 16,384 in Redis), each storing the maximum leading-zero run seen.`, `Standard error ≈ 1.04 / √m: about 0.81% with 16,384 registers.`, `Redis PFADD / PFCOUNT / PFMERGE implement it in 12 KB per key; BigQuery and Presto use it for APPROX_COUNT_DISTINCT.`, `Exact distinct counting of 1 billion IDs would need gigabytes.`])],
    ['Other sketches', TBL(['Sketch', 'Answers'], [['Bloom filter', 'Membership: seen before?'], ['t-digest, KLL', 'Quantiles: p50, p99 latency over huge streams'], ['MinHash', 'Similarity between sets (near-duplicate detection)'], ['Reservoir sampling', 'A uniform random sample of a stream of unknown length']])],
    ['When to use them', PP(`Analytics, monitoring and abuse detection, where a 1% error is fine and the alternative is storing everything. Not for billing or anything that must be exact. A common design is approximate real-time counts from sketches plus exact counts from a slower batch job.`)]
  ],
  code: null,
  qs: [SQ('Why does a count-min sketch never underestimate a count?', ['It stores exact counts', 'Hash collisions can only add other items’ increments to a counter, and taking the minimum removes as much of that as possible', 'It uses one hash', 'It resets every second'], 1, 'Every counter for x includes all of x’s increments plus possibly others.')]
});
