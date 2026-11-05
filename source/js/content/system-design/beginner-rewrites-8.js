/* ===== Beginner-first rewrites — batch 8 (concept topics: SQL/NoSQL, indexes, transactions, replication, sharding, consistent hashing). SDPATCH. ===== */

SDPATCH('sqlnosql', {
  blurb: `Databases come in two broad camps. <b>Relational</b> (SQL) databases store data in neat tables with enforced structure, can cross-reference tables (joins), and guarantee all-or-nothing updates. <b>NoSQL</b> databases give up some of that in exchange for easier scaling, flexible structure, or a shape that fits one kind of access perfectly. Big systems usually use several, each for what it’s best at.`,
  sections: [
    ['What’s the choice here?', PLAIN(`Where do you actually <i>put</i> your data? The default is a <b>relational</b> database: data lives in tables (rows and columns) with a fixed structure, you can link tables together, and you get rock-solid all-or-nothing updates. <b>NoSQL</b> is an umbrella for other kinds that trade some of those guarantees for things like effortless scaling across many machines or a flexible shape. There’s no single winner — you match the store to how the data is used.`) +
      ANALOGY(`Think of ways to organise an office’s paperwork. A <b>relational</b> database is a strict, ruled spreadsheet where every row must have the right columns and you can cross-reference between sheets — perfect for accounts, where correctness is everything. NoSQL is a set of specialist filing systems: a <b>quick-lookup drawer</b> labelled by a single tag (key-value), <b>folders holding whole self-contained documents</b> (document store), a <b>giant append-only ledger</b> for a firehose of events (wide-column), and a <b>web of index cards connected by strings</b> for relationships (graph).`)],
    ['Words you’ll need', KEYTERMS([
      ['Relational / SQL', 'Data in tables with a fixed structure (schema); query with SQL; supports joins and transactions. PostgreSQL, MySQL.'],
      ['Schema', 'The defined structure — which columns exist and their types. Relational DBs enforce it; NoSQL often leaves it to your code.'],
      ['Join', 'Combining related rows from two tables at query time (e.g. a user with their orders). A relational strength.'],
      ['Key-value store', 'The simplest NoSQL: look up a value by a single key, extremely fast. Redis, DynamoDB.'],
      ['Document store', 'Stores flexible, nested JSON-like documents read as a whole. MongoDB.'],
      ['Wide-column store', 'Built for enormous write volumes, organised by a partition key. Cassandra.'],
      ['Denormalize', 'Deliberately storing the same data in several places (shaped per query) so each read hits one spot — common in NoSQL.'],
      ['Polyglot persistence', 'Using several different databases in one system, each for the job it suits.']])],
    ['The families at a glance', TBL(['Type', 'Shape', 'Best at', 'Weak at'], [
      ['Relational', 'Tables with a fixed schema', 'Joins, all-or-nothing transactions, flexible queries', 'Scaling writes past one machine (needs sharding)'],
      ['Key-value', 'key → value', 'Fastest possible lookups by key', 'Querying by anything but the key'],
      ['Document', 'JSON-like documents', 'Flexible structure, reading a whole object', 'Joins across documents'],
      ['Wide-column', 'Rows under a partition key', 'Massive write throughput, scaling out', 'Ad-hoc queries (must design per query)'],
      ['Graph', 'Nodes + connections', 'Multi-hop relationship questions', 'Scaling out']])],
    ['How to choose (and myths to drop)', PP(`Start from the <b>access patterns</b>: which queries run, how often, over how much data, how fast. Need transactions across rows or flexible queries? Relational. Simple key lookups at huge volume? Key-value. Self-contained objects of varying shape? Document. A firehose of events queried by key and time? Wide-column. <b>When unsure, default to PostgreSQL</b> — it scales far further than most products ever need, and even stores JSON.`) +
      WHY(`Three myths worth dropping. “SQL doesn’t scale” — replicas, partitioning and good indexes take relational databases a very long way, and sharded MySQL runs some of the biggest sites alive. “NoSQL means no schema” — the schema still exists, just in your application code rather than enforced by the database. “NoSQL is always eventually consistent” — many offer strong consistency when you ask for it. The real design move is <b>polyglot persistence</b>: money in a relational DB, sessions in a key-value store, events in a wide-column store — each where it fits.`) +
      RECAP([
        `Relational (SQL) = fixed-structure tables with joins and all-or-nothing transactions; NoSQL = other shapes (key-value, document, wide-column, graph) trading guarantees for scale or flexibility.`,
        `Choose from <b>access patterns</b>: transactions/flexible queries → relational; key lookups → key-value; whole objects → document; write firehose → wide-column; relationships → graph.`,
        `Default to <b>PostgreSQL</b> when unsure — it scales much further than most products need.`,
        `NoSQL usually means <b>denormalizing</b> — storing data shaped per query so each read hits one place (at the cost of updating copies).`,
        `Big systems mix stores (<b>polyglot persistence</b>); the myths that “SQL can’t scale” and “NoSQL = no schema / always eventual” are false.`])]
  ]
});

SDPATCH('indexes', {
  blurb: `Without an index, a database answers a query by reading <b>every single row</b> — fine for a hundred rows, ruinous for a hundred million. An index is a separate, sorted helper structure that jumps straight to the rows you want. <b>B-trees</b> are tuned for fast reads and in-place updates; <b>LSM trees</b> for absorbing a torrent of writes.`,
  sections: [
    ['What is an index and why?', PLAIN(`An index is a pre-sorted lookup structure the database keeps <i>alongside</i> your data so it can find rows fast. Ask for “the user with this email” on 100 million rows: without an index, the database scans all 100 million (seconds of work); with an index on email, it reads a handful of entries (under a millisecond). Most “why is this query slow?” problems are a missing or wrong index.`) +
      ANALOGY(`It’s the index at the back of a textbook. Want everything about “photosynthesis”? Without the index you’d read all 900 pages. With it, you flip to the alphabetical list, find “photosynthesis → p. 412,” and go straight there. The index is extra pages that must be kept up to date as the book changes — exactly the trade a database index makes.`)],
    ['Words you’ll need', KEYTERMS([
      ['Full table scan', 'Reading every row to answer a query — what happens with no useful index. Slow on big tables.'],
      ['Index', 'A separate sorted structure that lets the database find matching rows without scanning everything.'],
      ['O(log n)', 'The cost of an indexed lookup: it grows extremely slowly as data grows (a billion rows is only ~30 steps).'],
      ['B-tree', 'The classic index: a shallow, balanced tree of sorted pages. Great for reads, point lookups, and ranges. The default in PostgreSQL/MySQL.'],
      ['LSM tree', 'A write-optimised index: new writes are appended and batched in memory, then flushed as sorted files merged later. Used by Cassandra, RocksDB.'],
      ['Composite index', 'An index on several columns in order, e.g. (user_id, created_at) — serves queries that filter by the leading column(s).'],
      ['Compaction', 'The LSM background job that merges files and drops overwritten/deleted values.']])],
    ['B-trees vs LSM trees', PP(`Both make lookups fast; they differ in how they handle <b>writes</b>.`) +
      TBL(['', 'B-tree', 'LSM tree'], [
        ['How it stores', 'A balanced tree of sorted pages, updated in place', 'Appends to a log + memory, flushed as sorted files merged later'],
        ['Reads', 'Excellent — ~3–4 page reads even on a billion rows', 'Good — may check several files (Bloom filters skip most)'],
        ['Writes', 'Random page updates limit throughput', 'Very high — random writes become sequential appends'],
        ['Used by', 'PostgreSQL, MySQL (InnoDB)', 'Cassandra, RocksDB, HBase']])],
    ['Using indexes well', PP(`An index isn’t free — it slows every insert/update (the index must be maintained) and uses storage — so index for the queries you actually run, not every column.`) +
      UL([`A <b>composite index</b> on (user_id, created_at) is sorted by user_id, then by time within each user — so it serves “user 7’s recent posts” perfectly, and “by user_id” alone, but <i>not</i> “by created_at” alone.`,
        `Rule: put the <b>equality</b> column first, the <b>range</b> column last.`,
        `A column with few distinct values (a yes/no flag) rarely benefits from its own index.`,
        `Use your database’s <code>EXPLAIN</code> to check whether a query uses an index or falls back to a scan.`]) +
      RECAP([
        `Without an index, queries do a <b>full table scan</b> (read every row); an index jumps straight to matching rows in O(log n).`,
        `<b>B-trees</b> (balanced sorted pages, updated in place) are great for reads and ranges — the relational default.`,
        `<b>LSM trees</b> (append + batch + merge) turn random writes into sequential ones, giving very high write throughput — used by write-heavy NoSQL.`,
        `Indexes cost write speed and storage, so index for the queries you actually run; in a <b>composite index</b>, equality column first, range column last.`,
        `Most slow queries are a missing/wrong index — check with <code>EXPLAIN</code>.`])]
  ]
});

SDPATCH('transactions', {
  blurb: `A transaction bundles several reads and writes so they all succeed or all fail — never halfway. <b>ACID</b> is the four promises a database makes about them; <b>isolation levels</b> control how much simultaneously-running transactions can see of each other’s half-finished work, trading safety for speed.`,
  sections: [
    ['What is a transaction?', PLAIN(`A transaction groups a set of database operations into one indivisible unit: either the whole group happens, or none of it does. The classic example is moving money — subtract from one account, add to another. If the system crashes between the two steps, you must <i>not</i> be left with money subtracted but never added. The transaction guarantees the pair happen together or not at all.`) +
      ANALOGY(`It’s a wedding “I do.” Two separate acts — each person saying yes — only count if <i>both</i> happen; if one backs out, neither is married. A bank transfer is the same: the debit and the credit are a package deal. A transaction is the officiant making sure it’s all-or-nothing, and that a power cut mid-ceremony doesn’t leave you half-married.`)],
    ['Words you’ll need', KEYTERMS([
      ['Transaction', 'A bundle of operations treated as one all-or-nothing unit.'],
      ['Commit / rollback', 'Commit = make the whole bundle permanent; rollback = undo it entirely (e.g. on error).'],
      ['Atomicity', 'The “A” in ACID: all of the transaction happens, or none of it.'],
      ['Consistency', 'The “C”: the database moves from one valid state to another (rules/constraints always hold).'],
      ['Isolation', 'The “I”: concurrent transactions don’t see each other’s half-done work — as if each ran alone.'],
      ['Durability', 'The “D”: once committed, the data survives crashes (written to a log on disk).'],
      ['Isolation level', 'How strictly isolation is enforced — stricter is safer but slower.'],
      ['MVCC', 'A common trick (multi-version concurrency control) where readers see a consistent snapshot and never block writers.']])],
    ['ACID in plain words', TBL(['Promise', 'Means', 'How it’s done'], [
      ['Atomicity', 'All or nothing', 'Undo/redo logs, rollback'],
      ['Consistency', 'Only valid states (rules hold)', 'Constraints + correct app logic'],
      ['Isolation', 'Concurrent transactions don’t collide', 'Locks or MVCC snapshots'],
      ['Durability', 'Survives a crash once committed', 'Write-ahead log flushed to disk']])],
    ['Isolation levels: safety vs speed', PP(`Running many transactions at once can cause subtle bugs. Isolation levels are dials from loose-and-fast to strict-and-safe:`) +
      TBL(['Level', 'Prevents', 'Still allows'], [
        ['Read committed', 'Seeing uncommitted ("dirty") data', 'A row changing between two reads'],
        ['Repeatable read', 'Rows changing mid-transaction', 'Write skew (two check-then-write races)'],
        ['Serializable', 'Everything — as if run one at a time', 'Nothing, but costs performance (retries/locks)']]) +
      WHY(`The classic real-world bug: two people book the last seat at once — both read “1 available,” both write “0 sold,” and it’s sold twice. Fixes: an atomic conditional update (<code>UPDATE seats SET sold=sold+1 WHERE sold &lt; capacity</code>), a <code>SELECT … FOR UPDATE</code> lock, an optimistic version check, or serializable isolation. Note too that transactions are easy and cheap <i>within one database</i>, but hard <i>across</i> services or shards — which is why designs often keep data that must change together in the same place.`) +
      RECAP([
        `A transaction makes several operations all-or-nothing (commit makes them permanent; rollback undoes them).`,
        `<b>ACID</b>: Atomicity (all or none), Consistency (rules hold), Isolation (no peeking at half-done work), Durability (survives crashes).`,
        `<b>Isolation levels</b> trade safety for speed: read committed → repeatable read → serializable (strictest, slowest).`,
        `Concurrency bugs like double-booking are fixed with atomic conditional updates, locks, version checks, or serializable isolation.`,
        `Transactions are cheap within one database but hard across shards/services — so co-locate data that must change together.`])]
  ]
});

SDPATCH('replication', {
  blurb: `Replication keeps copies of the same data on several machines — so you survive a machine dying (availability), can serve reads from many copies (scaling), and can keep copies near users (lower latency). The big decisions: <b>who</b> is allowed to accept writes, and whether a write <b>waits</b> for the copies to confirm before it’s acknowledged.`,
  sections: [
    ['What is replication and why?', PLAIN(`Replication means storing the same data on more than one server. You do it for three reasons: if one machine fails, a copy keeps you running (availability); many copies can share the read load (scaling reads); and a copy in each region answers local users fast (latency). The interesting choices are about <i>writes</i> — where they go and how long you wait for copies to catch up.`) +
      ANALOGY(`Imagine an important ledger kept as photocopies in several branch offices. If head office burns down, the branches still have the data. Staff can read from their nearest copy (fast). But updates are the tricky bit: do you wait for a branch to confirm it filed the update before telling the customer “done” (safe but slower), or tell them immediately and let the copy catch up later (fast, but a crash could lose the last update)?`)],
    ['Words you’ll need', KEYTERMS([
      ['Replica', 'One of the copies of the data on a separate machine.'],
      ['Leader / follower', 'In the common setup, one replica (the leader) accepts all writes and streams them to the others (followers), which serve reads.'],
      ['Synchronous vs asynchronous', 'Sync = the write waits for a follower to confirm (no data loss, slower); async = don’t wait (fast, but can lose the last writes on a crash).'],
      ['Replication lag', 'How far behind a follower is — usually milliseconds, sometimes seconds under load.'],
      ['Failover', 'Promoting a follower to leader when the leader dies.'],
      ['Read-your-writes', 'The expectation that right after you write something, you can read it back — easily broken by lag.'],
      ['Split brain', 'A failure where two nodes both think they’re leader and both accept writes — must be prevented.']])],
    ['The three architectures', TBL(['', 'Single-leader', 'Multi-leader', 'Leaderless'], [
      ['Who accepts writes', 'One leader', 'Several leaders (often one per region)', 'Any replica'],
      ['Conflicts', 'None (one order)', 'Concurrent writes can conflict', 'Resolved by versions/quorums'],
      ['Strength', 'Simple, consistent order', 'Local writes everywhere; survives region loss', 'High availability, no failover needed'],
      ['Examples', 'PostgreSQL, MySQL', 'Multi-region active–active', 'Cassandra, DynamoDB']])],
    ['The lag problems (and failover dangers)', PP(`Asynchronous followers lag, which causes surprising bugs:`) +
      TBL(['Problem', 'What the user sees', 'Fix'], [
        ['Read-your-writes', 'You post a comment, refresh, it’s gone', 'Read your own recent data from the leader'],
        ['Monotonic reads', 'A comment appears, then vanishes on refresh', 'Pin a user to one replica'],
        ['Consistent prefix', 'You see a reply before the question', 'Keep causally-related data on one partition']]) +
      WHY(`Failover has its own traps. <b>Split brain</b>: the old leader revives thinking it’s still in charge, and now two nodes accept writes — prevented with fencing (epoch numbers) and consensus-based election. <b>Lost writes</b>: promoting a lagging follower discards writes the old leader had already acknowledged (the cost of async). And a failover timeout that’s too short causes needless failovers during load spikes, while too long means long outages. One bonus: the same replication log can feed search indexes, caches and analytics via <b>change data capture</b>, keeping them in sync without the app doing dual writes.`) +
      RECAP([
        `Replication keeps copies on several machines for availability, read scaling, and lower latency near users.`,
        `Most common is <b>single-leader</b>: all writes to the leader, streamed to read-serving followers; alternatives are multi-leader and leaderless.`,
        `<b>Synchronous</b> replication waits for a copy (no data loss, slower); <b>asynchronous</b> is fast but can lose the last writes on a crash.`,
        `<b>Replication lag</b> breaks read-your-writes and similar — fix by reading your own recent data from the leader or pinning to one replica.`,
        `Guard failover against <b>split brain</b> (fencing/consensus) and lost writes; reuse the replication log for search/caches via change data capture.`])]
  ]
});

SDPATCH('sharding', {
  blurb: `When data or write traffic outgrows a single machine, you split it into <b>shards</b> — each holding a slice of the rows on its own server. The <b>shard key</b> is the rule that decides which shard owns each row, and picking it well is the single most important decision in a sharded design.`,
  sections: [
    ['What is sharding?', PLAIN(`Replication copies the <i>whole</i> dataset to several machines. <b>Sharding</b> is different: it <i>splits</i> the dataset so each machine holds only a slice. You do it when one machine can’t hold all the data, or can’t keep up with all the writes (replication doesn’t help with write load — every copy still takes every write). The hard part is the <b>shard key</b>: the field used to decide which slice a row belongs to.`) +
      ANALOGY(`One library has outgrown its building. So you open branches and split the books among them — say, authors A–F in branch 1, G–M in branch 2, and so on. A central catalogue tells you which branch has a given book. The rule you split by (author surname) is the shard key. Get it right and most trips need one branch; get it wrong — like splitting by a field nobody searches on — and every lookup means phoning all the branches.`)],
    ['Words you’ll need', KEYTERMS([
      ['Shard (partition)', 'One slice of the data, living on its own server.'],
      ['Shard key', 'The field used to decide which shard a row goes to. The most important choice.'],
      ['Hash sharding', 'shard = hash(key) mod N — spreads data evenly, but range queries hit every shard.'],
      ['Range sharding', 'Contiguous ranges per shard (A–F, G–M…) — great for range scans, but risks hot spots.'],
      ['Scatter-gather', 'A query that doesn’t include the shard key must ask every shard and merge results — slow.'],
      ['Hot spot', 'One shard getting a disproportionate share of data or traffic (e.g. a celebrity account).'],
      ['Rebalancing', 'Moving data between shards when you add or remove machines.']])],
    ['Strategies for splitting', TBL(['Strategy', 'How', 'Good', 'Bad'], [
      ['Hash', 'shard = hash(key) mod N (or consistent hashing)', 'Even spread of data and load', 'Range queries hit every shard'],
      ['Range', 'Contiguous key ranges per shard', 'Efficient range scans', 'Hot spots (e.g. timestamps → all writes on the newest shard)'],
      ['Directory', 'A lookup service maps each key/tenant to a shard', 'Full control, easy to move tenants', 'The directory is an extra dependency'],
      ['Geographic', 'By user region', 'Data near users; residency laws', 'Uneven sizes; travelling users']])],
    ['Choosing the key (and the costs)', PP(`A good shard key has <b>high cardinality</b> (many distinct values so data spreads), <b>even access</b> (no single value hogs traffic), and <b>matches your main queries</b> (so common requests include the key and hit one shard). Example: shard a chat app’s messages by <code>conversation_id</code>, so a whole conversation lives together and loads from one shard.`) +
      WHY(`Two things bite people. <b>Hot spots:</b> a viral product or celebrity overloads one shard even with perfect hashing — fix by splitting the hot key (append a random 0–9 suffix to spread its writes, merge on read) or caching it hard. <b>Scatter-gather:</b> if you shard orders by <code>order_id</code> but your main page lists a <i>customer’s</i> orders, every page view must query every shard — sharding by <code>customer_id</code> makes it one shard. And sharding has real costs: cross-shard joins/transactions get hard, operations multiply per shard, rebalancing moves live data. So <b>shard as late as you reasonably can</b> — replicas and caching often go further than expected.`) +
      RECAP([
        `Sharding splits a dataset across machines (each holds a slice) — used when one machine can’t hold the data or keep up with writes.`,
        `The <b>shard key</b> is the crucial choice: high cardinality, even access, and matching your main queries (so common requests hit one shard).`,
        `Strategies: <b>hash</b> (even spread, bad for ranges), <b>range</b> (good scans, hot-spot risk), <b>directory</b>, <b>geographic</b>.`,
        `Watch for <b>hot spots</b> (split/cache the hot key) and <b>scatter-gather</b> (queries without the shard key hit every shard).`,
        `Sharding costs complexity (cross-shard joins, rebalancing, per-shard ops) — shard as late as you can.`])]
  ]
});

SDPATCH('consistenthash', {
  blurb: `The naive way to spread keys across N servers is <code>hash(key) mod N</code> — but change N (add or remove a server) and almost every key moves, which is catastrophic for a cache or a database. <b>Consistent hashing</b> places servers and keys on a ring; each key belongs to the next server clockwise, so adding or removing a server moves only about 1/N of the keys.`,
  sections: [
    ['What problem does this solve?', PLAIN(`You have lots of keys to spread across some servers. The obvious formula, <code>server = hash(key) mod N</code>, works fine — until N changes. Go from 4 servers to 5 and roughly <b>80% of keys</b> suddenly map to a different server. For a cache that means almost every entry is now in the “wrong” place and misses at once (hammering your database); for a database it means moving almost all your data. Consistent hashing is the fix: resizing moves only a small slice of keys.`) +
      ANALOGY(`Picture a clock face. You place each server at some position around the clock, and each key also lands at a position; a key is owned by the first server you meet going clockwise. Now add a new server — it drops into one spot on the clock and only takes over the slice of keys in the arc just behind it. Every other key stays exactly where it was. Compare that to renumbering everyone when a new person joins: consistent hashing only reshuffles one small neighbourhood.`)],
    ['Words you’ll need', KEYTERMS([
      ['Hash', 'A function turning a key into a number — here, a position on the ring.'],
      ['The "mod N" problem', 'With hash(key) mod N, changing N remaps almost all keys — the thing we’re avoiding.'],
      ['Ring', 'The circular space (say 0 to 2³²) where both servers and keys are placed.'],
      ['Clockwise ownership', 'A key belongs to the first server clockwise from its position.'],
      ['Virtual nodes', 'Giving each physical server many positions on the ring so load spreads evenly and failures don’t dump everything on one neighbour.'],
      ['Rebalancing', 'The data movement when servers join or leave — kept small by this scheme (~1/N of keys).']])],
    ['How it works', BSTEPS([
      ['Place servers on a ring', PP(`Hash each server’s name to a position on a big circle, and keep the positions sorted.`)],
      ['Place keys, walk clockwise', PP(`Hash each key to a position too; its owner is the first server clockwise from it. Finding that is a quick binary search.`)],
      ['Add/remove moves only a slice', PP(`Add a server and it only steals the keys in the arc just behind its new position (~1/N of them); every other key is untouched. Remove one and its keys pass to the next server clockwise. Compare: mod N would have moved most keys.`)],
      ['Smooth it with virtual nodes', PP(`With few servers, random positions make lopsided arcs (one server might own half the ring). Give each server <b>many</b> positions (say 150), and the load evens out to within a few percent — and a failed server’s many small arcs spread across <i>all</i> the others, not one unlucky neighbour.`)]])],
    ['Where it’s used', PP(`Consistent hashing is everywhere data must be spread across a changing set of machines:`) +
      UL([`Partitioning in <b>Amazon Dynamo, Cassandra</b> and similar stores.`,
        `<b>Distributed caches</b> (memcached client libraries), so adding a node doesn’t empty the whole cache.`,
        `<b>Load balancers</b> routing a user or URL consistently to the same backend.`,
        `<b>CDNs</b> choosing which edge server caches each object.`]) +
      RECAP([
        `<code>hash(key) mod N</code> is simple but remaps almost all keys when N changes — disastrous for caches and databases.`,
        `<b>Consistent hashing</b> puts servers and keys on a ring; each key is owned by the next server clockwise.`,
        `Adding or removing a server moves only ~1/N of keys (the affected arc); everything else stays put.`,
        `<b>Virtual nodes</b> (many ring positions per server) even out the load and spread a failed server’s keys across all others.`,
        `It underpins Dynamo/Cassandra partitioning, distributed caches, consistent load-balancer routing, and CDN object placement.`])]
  ]
});
