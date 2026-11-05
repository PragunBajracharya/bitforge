/* ===== Beginner-first rewrites — batch 10 (concept topics: CAP, consistency, quorum, raft, clocks, idgen). SDPATCH. ===== */

SDPATCH('cap', {
  blurb: `When the network between copies of your data breaks (a “partition”), a distributed system is forced to choose: keep answering and risk giving out stale or conflicting data (<b>availability</b>), or refuse to answer until it can guarantee the latest data (<b>consistency</b>). You can’t have both during the break. PACELC adds: even on a healthy network, you still trade speed for consistency.`,
  sections: [
    ['What is CAP?', PLAIN(`The CAP theorem is about what happens to a system with multiple copies of data when the network between those copies <b>fails</b> (a partition). In that moment, a copy that can’t reach the others must pick one of two behaviours: answer with possibly-outdated data (stay <b>available</b>), or refuse to answer until it’s sure it has the latest (stay <b>consistent</b>). Since network failures <i>will</i> happen, the real design question is which of these you choose when they do.`) +
      ANALOGY(`Two branch offices of a bank share a customer ledger, kept in sync over a phone line. The line goes dead. A customer walks into the branch that <i>didn’t</i> get the latest update and asks their balance. The clerk must choose: say “I can’t confirm your balance right now, come back later” (consistent but unavailable), or say “as far as I know it’s $400” knowing it might be out of date (available but possibly wrong). With the line down, there’s no way to be both correct and responsive.`)],
    ['Words you’ll need', KEYTERMS([
      ['Partition (the "P")', 'A break in the network so some copies can’t talk to others. Not optional — real networks do this (cut cables, overloaded switches).'],
      ['Consistency (the "C")', 'Every read sees the latest write — all copies agree.'],
      ['Availability (the "A")', 'Every request gets an answer (even if possibly stale).'],
      ['CP system', 'During a partition, chooses consistency — refuses/blocks rather than serve stale data (banks, inventory).'],
      ['AP system', 'During a partition, chooses availability — answers with what it has and reconciles later (feeds, carts, DNS).'],
      ['PACELC', 'The fuller rule: during Partition pick A or C; Else (normal times) pick Latency or Consistency.']])],
    ['The real meaning: C or A during a partition', WHY(`The common phrasing “pick 2 of 3” is misleading. Partitions aren’t something you choose to tolerate — they just happen. So the honest statement is: <b>when a partition happens, you must sacrifice either consistency or availability.</b> When there’s no partition, you can have both. A CP system (a bank ledger) refuses rather than risk a wrong balance; an AP system (a social feed) serves a slightly stale like-count rather than show an error. Neither is “better” — it depends on the data.`) +
      TBL(['System', 'During a partition', 'Normal times'], [
        ['Cassandra / DynamoDB (default)', 'Available (may be stale)', 'Fast, eventually consistent'],
        ['Spanner / CockroachDB', 'Consistent (may refuse)', 'Consistent (pays latency)'],
        ['MongoDB (majority)', 'Consistent', 'Consistent']])],
    ['It’s a per-feature spectrum', PP(`You don’t pick one answer for a whole product. Different data makes different choices: a bank <b>balance</b> is CP (never show a wrong number), while <b>like counts</b> are AP (a stale count harms no one, an error does). Many databases even let you choose <i>per request</i> (Cassandra’s consistency levels, DynamoDB’s strongly-consistent reads).`) +
      WHY(`And PACELC’s “Else” half matters: strong consistency requires copies to coordinate (round trips across zones) on every operation — so <b>even on a perfect network you trade latency for consistency</b>. That’s why fast systems default to eventual consistency. In an interview, don’t just say “we choose AP” — say what the user sees during a failure: “if a region is cut off, users there can still read their feed (possibly stale), but checkout is disabled until it reconnects.”`) +
      RECAP([
        `CAP is about multi-copy systems during a network <b>partition</b>: you must sacrifice <b>consistency</b> (serve only latest data) or <b>availability</b> (always answer).`,
        `Partitions are unavoidable, so the choice is CP (refuse rather than be wrong) vs AP (answer, reconcile later) <i>while the partition lasts</i>; without a partition you can have both.`,
        `The choice is <b>per feature</b>: balances/inventory → CP; likes/feeds/carts → AP. Many databases let you choose per request.`,
        `<b>PACELC</b>: even in normal times, strong consistency costs latency (coordination round trips), so fast systems lean eventual.`,
        `Always describe it in terms of what users experience during a failure, not just a letter pair.`])]
  ]
});

SDPATCH('consistency', {
  blurb: `“Consistent” isn’t one thing — it’s a ladder of guarantees about what a read can return after writes. At the top, <b>linearizable</b> (strong) behaves as if there’s a single copy; at the bottom, <b>eventual</b> only promises copies agree <i>eventually</i>. Stronger guarantees are easier to build on but cost more (coordination = latency), so you pick the weakest one each feature can tolerate.`,
  sections: [
    ['Why "consistency" needs a ladder', PLAIN(`When data has many copies that update at slightly different times, a read might see the newest value or a slightly old one, depending on which copy it hits. A <b>consistency model</b> is a precise promise about which of those answers are allowed. The strongest promise makes the system behave as if there were just one copy; the weakest only promises things settle down eventually. Stronger is nicer to program against but more expensive, because the copies must coordinate.`) +
      ANALOGY(`Think of news spreading through a group of friends. <b>Strong (linearizable)</b> consistency is everyone having a live group call — the instant something changes, all of them know, and nobody can be out of date. <b>Eventual</b> consistency is word-of-mouth: tell one friend and the news ripples out; for a while different people believe different things, but if you stop spreading new rumours, everyone eventually lands on the same story. In between are useful half-measures, like “you always remember what <i>you</i> just said” (read-your-writes).`)],
    ['Words you’ll need', KEYTERMS([
      ['Linearizable (strong)', 'Behaves like a single copy: once a write finishes, every later read everywhere sees it. Needed for balances, locks, uniqueness.'],
      ['Eventual', 'If writes stop, copies eventually agree — but meanwhile reads can be stale. Fine for likes, view counts, DNS.'],
      ['Read-your-writes', 'You always see your own latest writes (even if others don’t yet).'],
      ['Monotonic reads', 'You never see newer data and then older data — time doesn’t appear to go backwards for you.'],
      ['Causal', 'If B depends on A (a reply to a comment), everyone sees A before B.'],
      ['Conflict resolution', 'How concurrent writes to the same thing are reconciled (last-write-wins, keeping both, or CRDTs).']])],
    ['The ladder, strongest to weakest', TBL(['Model', 'Promise', 'Good for'], [
      ['Linearizable (strong)', 'Acts like one copy; latest write always visible', 'Balances, locks, unique usernames'],
      ['Causal', 'Cause is seen before effect', 'Comments, chat'],
      ['Read-your-writes', 'You see your own updates', 'Profile edits, your posts'],
      ['Monotonic reads', 'Never go backwards in time', 'Feeds, dashboards'],
      ['Eventual', 'Copies agree eventually', 'Likes, view counts, caches']])],
    ['Handling conflicts, and the practical rule', PP(`With weak consistency, two people can update the same thing at once on different copies. How you reconcile matters:`) +
      TBL(['Strategy', 'How', 'Risk'], [
        ['Last-write-wins', 'Keep the one with the latest timestamp', 'Silently drops the other; clock skew can pick wrong'],
        ['Keep both (siblings)', 'Detect the conflict, return both to merge', 'App must write merge logic'],
        ['CRDTs', 'Data types that always merge cleanly (counters, sets)', 'Only for supported types']]) +
      WHY(`The practical rule: <b>use the weakest model your feature can tolerate, but no weaker.</b> Most features are perfectly happy with “you see your own writes, everyone else catches up shortly.” Reserve expensive strong consistency for the invariants that must never break — money, inventory, uniqueness, locks — because that’s where a stale read actually causes harm.`) +
      RECAP([
        `Consistency is a <b>ladder</b> of guarantees, from <b>linearizable</b> (acts like one copy) down to <b>eventual</b> (agrees eventually).`,
        `Useful middle rungs: <b>read-your-writes</b> (see your own updates), <b>monotonic reads</b> (no going backwards), <b>causal</b> (cause before effect).`,
        `Stronger models are easier to build on but cost coordination (latency), so pick the <b>weakest each feature tolerates</b>.`,
        `Weak consistency needs <b>conflict resolution</b> — last-write-wins (lossy), keep-both siblings, or CRDTs.`,
        `Reserve strong consistency for invariants that must never break (money, inventory, uniqueness, locks).`])]
  ]
});

SDPATCH('quorum', {
  blurb: `In leaderless replication, each piece of data lives on <b>N</b> copies. A write waits for <b>W</b> of them to confirm; a read asks <b>R</b> of them. The magic rule is <b>R + W &gt; N</b>: if the read group and the write group always overlap on at least one copy, every read is guaranteed to touch a copy that has the latest write — so it never misses it.`,
  sections: [
    ['What is a quorum?', PLAIN(`When there’s no single leader and any copy can take a write, how do you avoid reading stale data? The answer is a <b>quorum</b> — a voting rule. Keep N copies of each item. Don’t require <i>all</i> of them to confirm a write (too slow, fails if one is down), and don’t ask only <i>one</i> on a read (might be the stale one). Instead require enough overlap: if the set of copies you wrote to and the set you read from always share at least one copy, that shared copy carries the latest value.`) +
      ANALOGY(`Imagine three friends who each keep a copy of the group’s plans. To “record” a new plan you make sure at least two of them write it down (W=2). Later, to “check” the plan you ask any two of them (R=2). With three friends, any two-you-told and any two-you-ask must share at least one person — so you always reach someone who has the latest plan. That overlap is the whole trick, and it’s exactly R + W > N.`)],
    ['Words you’ll need', KEYTERMS([
      ['N', 'How many copies (replicas) of each item exist. Commonly 3.'],
      ['W (write quorum)', 'How many copies must confirm before a write is considered successful.'],
      ['R (read quorum)', 'How many copies a read consults, comparing their versions to find the newest.'],
      ['R + W > N', 'The overlap rule: guarantees a read always includes at least one copy with the latest write.'],
      ['Read repair', 'When a read notices a stale copy, it updates it on the spot.'],
      ['Hinted handoff', 'If a copy is down during a write, another node holds the write and hands it over later.']])],
    ['The rule and common settings', PP(`Writes reach W copies; reads consult R copies and keep the version with the newest version number. If <b>R + W &gt; N</b>, the two groups must overlap, so a read always finds the latest successful write. You tune R and W to favour reads or writes:`) +
      TBL(['Setting (N=3)', 'Effect'], [
        ['W=2, R=2', 'Balanced — the usual default (2+2 > 3)'],
        ['W=3, R=1', 'Fast reads, but a write fails if any copy is down'],
        ['W=1, R=3', 'Fast writes, but reads must consult all copies'],
        ['W=1, R=1', 'Fastest and most available, but no overlap → stale reads (eventual consistency)']])],
    ['Keeping copies in sync (and the caveats)', PP(`Quorums are backed up by repair mechanisms so stragglers catch up:`) +
      UL([`<b>Read repair:</b> a read that spots a stale copy pushes the fresh value to it.`,
        `<b>Hinted handoff:</b> a copy that’s down during a write has it held by a stand-in and delivered when it returns.`,
        `<b>Anti-entropy:</b> copies periodically compare fingerprints and exchange only the differences.`]) +
      WHY(`Two honest caveats. Quorums alone are <b>not</b> perfectly strong consistency — concurrent writes, partial failures and clock-based last-write-wins can still surprise you, so concurrent writes to one key need conflict handling. And your latency is set by the <b>slowest</b> of the W or R copies you wait for, so the “tail” matters — some systems query extra copies to dodge a slow one.`) +
      RECAP([
        `Leaderless replication keeps <b>N</b> copies; a write waits for <b>W</b>, a read asks <b>R</b>.`,
        `The overlap rule <b>R + W &gt; N</b> guarantees every read touches at least one copy with the latest write.`,
        `Tune R/W to favour reads or writes (N=3, W=2, R=2 is the balanced default); W=R=1 is fastest but eventually consistent.`,
        `<b>Read repair</b>, <b>hinted handoff</b>, and anti-entropy keep stale copies catching up.`,
        `Quorums aren’t full strong consistency (concurrent writes still need conflict handling), and latency depends on the slowest copy you wait for.`])]
  ]
});

SDPATCH('raft', {
  blurb: `<b>Consensus</b> lets a group of machines agree on a single sequence of decisions even when some crash or the network is flaky. <b>Raft</b> does it by electing one <b>leader</b> that appends commands to a shared log; a command is official once a <b>majority</b> of machines has stored it. It’s what powers coordination services like etcd, Consul and ZooKeeper, and many distributed databases.`,
  sections: [
    ['What problem does consensus solve?', PLAIN(`Lots of hard problems reduce to one thing: getting a group of machines to <b>agree</b> on something despite failures — who’s the leader, who holds a lock, the exact order of writes, what the cluster’s membership is. Without agreement, two machines might both think they’re in charge and corrupt things (“split brain”). Consensus protocols like Raft guarantee the group never disagrees, and keep making progress as long as a <b>majority</b> can talk to each other.`) +
      ANALOGY(`Picture a committee that must keep one shared, correct minute-book even though members sometimes step out of the room. They elect a <b>chairperson</b> to propose each entry. An entry only becomes official once a <b>majority</b> of members has copied it into their books. If the chair leaves, the remaining majority elects a new one — and because any two majorities share at least one member, the new chair is guaranteed to have every official entry. So the book never loses a decision, even with people coming and going.`)],
    ['Words you’ll need', KEYTERMS([
      ['Consensus', 'Getting a group of machines to agree on one value/sequence despite failures.'],
      ['Leader / follower', 'Raft elects one leader that takes all commands; the others are followers that copy them.'],
      ['Replicated log', 'The shared, ordered list of commands every node applies in the same order.'],
      ['Majority (quorum)', 'More than half the nodes. A command commits once a majority has it; any two majorities overlap.'],
      ['Term', 'A numbered period with at most one leader — bumped on each election, used to reject stale leaders.'],
      ['2f+1', 'A cluster of 2f+1 nodes tolerates f failures: 3 tolerate 1, 5 tolerate 2.'],
      ['Split brain', 'Two nodes both believing they’re leader — exactly what consensus prevents.']])],
    ['How Raft works', BSTEPS([
      ['Elect a leader', PP(`Each node waits a random time for a heartbeat from a leader; if none comes, it becomes a candidate, bumps the <b>term</b>, and asks others for votes. Whoever gets a <b>majority</b> wins. Randomized timeouts make it unlikely two candidates tie. A node only votes for a candidate whose log is at least as up-to-date as its own — so the winner has every committed entry.`)],
      ['Replicate the log', PP(`Clients send commands to the leader, which appends each to its log and forwards it to followers. Once a <b>majority</b> has stored an entry, it’s <b>committed</b> — the leader applies it and replies. Crashed/behind followers catch up from the leader later.`)],
      ['Stay safe', PP(`Because only up-to-date nodes can win elections and leaders never overwrite their own committed entries, the group never loses or reorders a committed decision.`)]])],
    ['Why majorities, and how you actually use it', WHY(`The majority rule is the heart of it: any two majorities of the same cluster share at least one node, so a decision one majority made is always visible to the next — that’s why no committed entry is ever lost. A cluster of <b>2f+1</b> tolerates f failures (3→1, 5→2), and the minority side of a partition simply can’t elect a leader or commit (that’s the CP choice from CAP). In practice you <b>don’t implement Raft yourself</b> — you use a coordination service (etcd, ZooKeeper, Consul) for leader election, distributed locks (with fencing tokens), service discovery and config; and databases run a Raft group per shard. Keep consensus groups small (3–5) and use them for <b>metadata</b>, not bulk data, because every commit costs a majority round trip.`) +
      RECAP([
        `<b>Consensus</b> makes a group agree on one ordered sequence of decisions despite crashes — preventing split brain.`,
        `<b>Raft</b> elects a <b>leader</b> that appends commands to a <b>replicated log</b>; an entry commits once a <b>majority</b> stores it.`,
        `Majorities overlap, so no committed entry is ever lost; a cluster of <b>2f+1</b> tolerates f failures, and the minority side can’t make progress (CP).`,
        `Randomized election timeouts avoid split votes; only up-to-date nodes can win, guaranteeing safety.`,
        `You use it via etcd/ZooKeeper/Consul (leader election, locks, config) and per-shard in databases — keep groups small and for metadata, since each commit costs a round trip.`])]
  ]
});

SDPATCH('clocks', {
  blurb: `Each machine’s clock drifts and occasionally jumps, so you <b>can’t</b> reliably order events across servers just by comparing timestamps. <b>Logical clocks</b> (Lamport and vector clocks) order events by <i>causality</i> — what happened before what — instead of by wall-clock time, and vector clocks can even detect when two updates happened at the same time and conflict.`,
  sections: [
    ['Why not just use timestamps?', PLAIN(`It’s tempting to order events by “which has the earlier timestamp.” But every server’s clock is slightly off (and gets corrected, sometimes jumping backwards), so two servers’ timestamps can disagree by milliseconds or more. That means “the write with the later timestamp wins” can pick the <i>wrong</i> write, and an earlier timestamp doesn’t prove an event actually happened first. To order events reliably across machines, you track <b>causality</b> — who had seen what before acting — rather than trusting clocks.`) +
      ANALOGY(`Imagine piecing together a group chat from everyone’s phones, but every phone’s clock is a bit wrong. You can’t just sort messages by their timestamps — you’d get nonsense like a reply appearing before the message it answers. Instead you track <i>what each person had already seen</i> when they wrote. If Bob’s message says “re: Ann’s idea,” you know Ann’s came first regardless of the clocks. Logical clocks are exactly this bookkeeping of “what had been seen.”`)],
    ['Words you’ll need', KEYTERMS([
      ['Clock skew', 'The difference between two machines’ clocks — usually milliseconds, sometimes much more.'],
      ['Causality', 'The “happened-before” relationship: if A influenced B, A came first. More reliable than timestamps.'],
      ['Lamport clock', 'A single counter per node that gives a total order consistent with causality (but can’t detect concurrency).'],
      ['Vector clock', 'A counter per node, bundled together — can tell whether one event came before another or they’re concurrent.'],
      ['Concurrent', 'Two events where neither saw the other — a potential conflict to resolve.'],
      ['Monotonic clock', 'A clock that only moves forward — use it for measuring durations/timeouts, never wall-clock time.']])],
    ['Lamport vs vector clocks', PP(`<b>Lamport clocks:</b> each node keeps one counter, increments it on every event, attaches it to messages, and on receiving sets its counter to max(local, received)+1. This gives a consistent <i>total order</i> — but a smaller number doesn’t prove causation, and it can’t tell you two events were concurrent.`) +
      PP(`<b>Vector clocks</b> fix that: each node keeps a counter <i>per node</i>. Compare two vectors entry by entry — if every entry of one is ≤ the other, it happened before; if each is bigger somewhere, they’re <b>concurrent</b> (a conflict). Amazon’s Dynamo and Riak use these to catch conflicting writes.`) +
      WHY(`This is how two devices editing the same shopping cart on different replicas don’t silently lose data: comparing their vector clocks shows neither update saw the other, so instead of last-write-wins (which would drop one item), the system keeps both and merges them. The alternative — trusting timestamps — would quietly throw away someone’s change because of a few milliseconds of clock skew.`)],
    ['The industrial-strength options', TBL(['Tool', 'Idea'], [
      ['Hybrid logical clocks', 'Physical time + a logical counter: close to real time, still causal (CockroachDB)'],
      ['TrueTime (Spanner)', 'GPS + atomic clocks give a time interval with bounded error; transactions wait out the uncertainty (~7 ms) for global ordering'],
      ['Leader sequence numbers', 'One node assigns the order — simplest when you have a leader'],
      ['Fencing tokens', 'Monotonic numbers from a lock service, checked by storage, to reject a stale lock holder']]) +
      RECAP([
        `Machine clocks drift and jump, so comparing wall-clock <b>timestamps</b> can’t reliably order events across servers.`,
        `Order by <b>causality</b> instead: <b>Lamport clocks</b> give a total order consistent with cause-and-effect (but can’t detect concurrency).`,
        `<b>Vector clocks</b> (a counter per node) can tell whether one event preceded another or they’re <b>concurrent</b> — catching conflicts.`,
        `Detecting concurrency lets systems keep and merge both updates instead of silently dropping one via last-write-wins.`,
        `Heavy-duty options: hybrid logical clocks, Spanner’s TrueTime, leader sequence numbers, and fencing tokens for locks. Use monotonic clocks for durations.`])]
  ]
});

SDPATCH('idgen', {
  blurb: `A single database’s auto-increment (1, 2, 3…) doesn’t work once data is spread across many machines and services — they’d hand out the same numbers. Distributed ID schemes let every machine mint unique IDs with <b>no coordination</b>: either big random UUIDs, or Twitter’s <b>Snowflake</b>, which packs a timestamp, a machine number and a counter into 64 bits so IDs are unique <i>and</i> roughly sorted by time.`,
  sections: [
    ['What is the problem?', PLAIN(`Every record needs a unique ID. On one database, auto-increment is easy — the database just counts up. But once you have many machines generating records at once, a shared counter becomes a bottleneck and a single point of failure, and letting each machine count independently would produce clashes. So you need a way for <i>any</i> machine to generate an ID that’s guaranteed unique without asking anyone else — and ideally one that’s also roughly time-ordered, which keeps database indexes efficient.`) +
      ANALOGY(`Imagine many ticket booths that must never print the same ticket number, but can’t phone a central office for each ticket (too slow). The clever fix: each ticket number is built from the current <b>time</b>, plus the <b>booth’s own number</b>, plus a little <b>counter</b> for tickets printed in the same instant. Two booths can’t clash (different booth numbers), one booth can’t clash with itself (the counter), and because time leads the number, newer tickets sort after older ones. That’s a Snowflake ID.`)],
    ['Words you’ll need', KEYTERMS([
      ['Auto-increment', 'A single database counting up (1,2,3…). Simple, but doesn’t work across many machines.'],
      ['UUID', 'A 128-bit ID. UUIDv4 is random (no coordination, but not time-sorted); UUIDv7 is time-ordered.'],
      ['Snowflake', 'A 64-bit ID = timestamp + machine ID + per-millisecond counter. Unique without coordination and time-sortable.'],
      ['Time-sortable', 'IDs created later are numerically larger, so sorting by ID ≈ sorting by creation time.'],
      ['Index locality', 'Why time-ordering matters: time-ordered IDs append to the end of a B-tree index (fast); random ones scatter (slow).']])],
    ['The options compared', TBL(['Scheme', 'Size', 'Time-sorted?', 'Needs coordination?', 'Notes'], [
      ['DB auto-increment', '64-bit', 'Yes', 'One database', 'Bottleneck + single point of failure; leaks counts'],
      ['UUIDv4', '128-bit', 'No', 'None', 'Random inserts fragment indexes (slow writes)'],
      ['UUIDv7 / ULID', '128-bit', 'Yes', 'None', 'Modern default when 128 bits is fine'],
      ['Snowflake', '64-bit', 'Yes', 'Just a unique machine ID', 'Twitter/Discord/Instagram use variants']])],
    ['How Snowflake packs 64 bits (and the catch)', PP(`A Snowflake ID is one 64-bit number split into fields: 1 sign bit (0), then ~41 bits of <b>milliseconds</b> since a custom start date (~69 years’ worth), then ~10 bits of <b>machine ID</b> (1,024 generators), then ~12 bits of <b>counter</b> (up to 4,096 IDs per millisecond per machine). Every service instance generates IDs locally with no network call — unique because machine IDs differ, and unique within a machine because of the counter.`) +
      WHY(`Putting the timestamp first is the clever part: it makes IDs <b>roughly time-sorted</b>, so new rows append near the end of a B-tree index (fast, sequential) instead of scattering across it like random UUIDv4 keys (which cause page splits and poor cache locality). The catch: Snowflake depends on the clock moving forward — if it jumps backwards, a generator could repeat a timestamp, so implementations wait rather than reuse one. Also, don’t expose sequential IDs publicly if your counts are sensitive (competitors could estimate your order volume) — encode or randomize public-facing IDs.`) +
      RECAP([
        `Auto-increment doesn’t scale across machines; you need IDs minted with <b>no coordination</b>.`,
        `Options: random <b>UUIDv4</b> (no coordination, not sorted), time-ordered <b>UUIDv7/ULID</b>, or 64-bit <b>Snowflake</b> (timestamp + machine + counter).`,
        `<b>Snowflake</b> puts the timestamp first so IDs are unique <i>and</i> roughly time-sorted — which keeps B-tree index inserts fast and sequential.`,
        `Random UUIDv4 keys hurt write performance by scattering inserts across the index.`,
        `Watch the clock (don’t reuse a timestamp if it jumps back), and don’t expose sequential IDs when counts are sensitive.`])]
  ]
});
