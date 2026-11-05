/* ===== Beginner-first rewrites — batch 9 (concept topics: object storage, search index, message queues, Kafka, batch/stream). SDPATCH. ===== */

SDPATCH('blob', {
  blurb: `Photos, videos, backups and big files don’t belong in a database. <b>Object storage</b> (Amazon S3, Google Cloud Storage, Azure Blob) is purpose-built for them: it stores files of any size as “objects” you fetch over plain HTTP, keeps them astonishingly safe, and costs just a few cents per gigabyte a month.`,
  sections: [
    ['What is object storage?', PLAIN(`Object storage is a service for keeping <b>files</b> — any size, any type — cheaply and extremely reliably. You give it a file and a key (a name), and later fetch it back by that key over HTTP. It isn’t a database you run queries against, and it isn’t a folder on a server’s disk; it’s a vast, shared bucket of files that scales to exabytes and survives entire data-centre failures.`) +
      ANALOGY(`Think of a giant self-storage facility. You rent space, drop off a box, and get a locker number; later you come back with the number and collect the box. The facility is cheap per square foot, keeps duplicate copies in multiple buildings so nothing is ever lost, and doesn’t care what’s in your box. What it <i>won’t</i> do is tell you “which boxes contain red shoes” — that’s what your filing cabinet (the database) is for. You keep the <i>index</i> in the database and the <i>boxes</i> in storage.`)],
    ['Words you’ll need', KEYTERMS([
      ['Object / blob', 'A stored file plus its metadata, addressed by a key. “Blob” = binary large object.'],
      ['Bucket & key', 'A bucket is a top-level container; the key is the object’s name within it (e.g. photos/u42/a1b2.jpg).'],
      ['Durability', 'The chance your data is never lost. S3 advertises “eleven nines” (99.999999999%) — effectively never.'],
      ['Immutable', 'Objects aren’t edited in place; you replace the whole object. No partial updates.'],
      ['Presigned URL', 'A temporary link that grants one specific action (like a single upload) for a few minutes — so clients can upload directly, safely.'],
      ['Erasure coding', 'A storage trick that splits data into fragments + parity so any N of M rebuild it — durability like 3 copies at ~1.4× the space.']])],
    ['Why not the database or a local disk?', WHY(`Databases charge a lot per gigabyte, and stuffing big binary files into rows bloats backups, replication and caches — all to store bytes the database never queries into. Local disks vanish when a server dies and can’t be shared by a fleet of stateless servers. Object storage sidesteps both: it’s cheap, it replicates across facilities automatically (reaching eleven nines of durability via erasure coding), and any server — or a CDN — can fetch any object by key. So the rule is: <b>blobs in object storage, a small reference (the key + metadata) in the database.</b>`)],
    ['The key pattern: direct uploads with presigned URLs', PP(`You don’t want gigabytes of user uploads flowing through your app servers. The standard flow:`) +
      BSTEPS([
        ['Ask for a presigned URL', PP(`The client asks your API to upload; the API checks permissions, picks a key, and returns a short-lived <b>presigned URL</b> that allows exactly one upload to that key.`)],
        ['Upload straight to storage', PP(`The client sends the file directly to object storage over HTTPS (large files use multipart upload — parts in parallel, each retryable). Your servers never touch the bytes.`)],
        ['Process on an event', PP(`Storage emits an “object created” event; a worker makes thumbnails/other sizes and records metadata (owner, key, size) in the database. Downloads go through a CDN, with signed expiring URLs for private files.`)]]) +
      RECAP([
        `Object storage keeps files of any size as <b>objects</b> fetched by key over HTTP — cheap, and astonishingly durable (eleven nines).`,
        `Keep <b>blobs in object storage, references in the database</b>: putting big files in a DB or on local disk is expensive and doesn’t scale.`,
        `Objects are <b>immutable</b> (replace, don’t edit) and higher-latency than a database — list keys via your own index, not by scanning buckets.`,
        `Use <b>presigned URLs</b> so clients upload/download directly, bypassing your app servers while access stays controlled.`,
        `Trigger processing with upload <b>events</b>, serve via a <b>CDN</b>, and use lifecycle rules to move old data to cheaper archive tiers.`])]
  ]
});

SDPATCH('searchindex', {
  blurb: `Databases are bad at “find the documents containing these words, ranked by how relevant they are.” Search engines are built for exactly that: they create an <b>inverted index</b> mapping each word to the documents that contain it, then score the matches. The search index is usually a <i>derived copy</i> of your main database, kept in sync via a stream of changes.`,
  sections: [
    ['What problem is this?', PLAIN(`A normal database query matches exact values (“email = this”). But “find products matching <i>red running shoes</i>, best matches first” is a different beast — it’s about words and relevance, not exact equality. Search engines like Elasticsearch handle it by pre-building an <b>inverted index</b>: for every word, a list of which documents contain it. Then a search is just looking up those lists and scoring the overlaps.`) +
      ANALOGY(`It’s the index at the back of a book, inverted from the usual direction. Instead of “page 412 → these words,” it stores “this word → pages 12, 88, 412.” To find pages about both “red” and “shoes,” you grab the two word-lists and see which pages appear on both. The library builds this catalogue once so that looking things up is instant — rebuilding it from the shelves (the database) whenever books change.`)],
    ['Words you’ll need', KEYTERMS([
      ['Inverted index', 'The core structure: each term → the sorted list of documents containing it (a “posting list”).'],
      ['Tokenize / stem', 'Breaking text into words and reducing them to a root ("running" → "run") so variations match.'],
      ['Ranking (BM25)', 'Scoring how relevant each matching document is — a term counts more if it’s frequent in the document but rare overall.'],
      ['Derived / source of truth', 'The database is the source of truth; the search index is a derived copy that can always be rebuilt from it.'],
      ['Change data capture (CDC)', 'Streaming each database change as an event, so the index stays in sync without the app writing to two places.'],
      ['Eventually consistent', 'The index lags the database by about a second — new data becomes searchable shortly after it’s written.']])],
    ['How the inverted index works', PP(`A tiny example. Documents: ①“red running shoes” ②“blue shoes” ③“red hat”. The index becomes: red → [①,③], run → [①], shoe → [①,②], blue → [②], hat → [③]. The query “red AND shoe” intersects [①,③] with [①,②] → ①. Because the lists are sorted, intersecting them is fast, and they compress well. Matches are then <b>ranked</b> (BM25 for text relevance, plus signals like popularity, recency, or personalization) so the best results come first.`)],
    ['Why it’s fed from a change stream', WHY(`A tempting mistake is to have the app write to the database <i>and</i> the search index at the same time (“dual writes”). But one write can succeed while the other fails, and now they disagree. The robust pattern is to treat the database as the single source of truth and feed the index from its <b>stream of changes</b> (change data capture): every create/edit becomes one ordered event the indexer consumes. The index is thus always rebuildable and only briefly behind (eventually consistent). Scale it by splitting into shards (each a mini-index over part of the data) with replicas: a query hits one copy of each shard and a coordinator merges the top results.`) +
      RECAP([
        `Search answers “find documents with these words, ranked by relevance” — something databases do poorly.`,
        `The engine builds an <b>inverted index</b> (word → documents) and <b>ranks</b> matches (BM25 plus popularity/recency signals).`,
        `The index is a <b>derived copy</b> of the database, kept in sync via a <b>change stream</b> — never dual writes, which can diverge.`,
        `It’s <b>eventually consistent</b> (lags ~a second) and scaled with shards + replicas (query each shard, merge top results).`,
        `Keep the database as the source of truth so the index can always be rebuilt.`])]
  ]
});

SDPATCH('mq', {
  blurb: `A message queue lets one service hand off work to another without waiting for it to finish. The first service drops a message on the queue and moves on; workers pull messages and process them at their own pace. Queues absorb traffic spikes, let services not depend on each other being up, and make slow work (emails, video encoding) happen in the background.`,
  sections: [
    ['What is a message queue?', PLAIN(`A queue is a buffer that sits between a service producing work and the workers doing it. The producer <b>enqueues</b> a message (“send this email,” “encode this video”) and immediately carries on; one of several <b>workers</b> later pulls the message and does the job. The producer never waits for the work to finish, and never even needs to know which worker will do it.`) +
      ANALOGY(`Think of a deli counter with a ticket machine. You take a ticket and sit down — you don’t stand frozen at the counter until your sandwich is made. Staff (the workers) call the next ticket when they’re free, and if it gets busy, tickets pile up but nobody is turned away; the line just takes a bit longer. Add more staff and it clears faster. The ticket queue decouples “placing an order” from “making it.”`)],
    ['Words you’ll need', KEYTERMS([
      ['Producer / consumer', 'The producer puts messages on the queue; the consumer (worker) takes them off and processes them.'],
      ['Enqueue / acknowledge (ack)', 'Enqueue = add a message; ack = a worker confirming it finished, so the message is removed.'],
      ['Decoupling', 'Producers and consumers don’t depend on each other being up or fast — the queue sits between them.'],
      ['At-least-once delivery', 'The usual guarantee: a message is never lost, but might be delivered twice (so processing must be safe to repeat).'],
      ['Idempotent', 'Safe to do twice with the same result — required because of at-least-once delivery.'],
      ['Dead-letter queue (DLQ)', 'Where a message goes after failing too many times, so it stops blocking others and humans can inspect it.'],
      ['Backpressure', 'When work arrives faster than it’s processed; the queue absorbs it (and you scale up or alert).']])],
    ['Why use one?', UL([
      `<b>Decoupling:</b> the producer doesn’t need the consumer to be up, or even know who it is.`,
      `<b>Load leveling:</b> a sudden burst piles up in the queue and is drained at a steady rate, instead of crashing the system.`,
      `<b>Responsiveness:</b> users get an instant reply while slow work happens in the background.`,
      `<b>Reliability:</b> work survives crashes and is retried; <b>scaling:</b> just add workers to go faster.`])],
    ['Delivery, duplicates, and order', PP(`The key subtlety: most queues give <b>at-least-once</b> delivery. A worker is handed a message, becomes busy (the message is hidden from others), and only when it <b>acks</b> is the message deleted. If the worker crashes first, the message reappears and another worker retries it — which means a message can be processed <b>twice</b>.`) +
      WHY(`That’s why consumers must be <b>idempotent</b>: design the work so doing it twice is harmless (e.g. dedupe by message ID, or “charge order #42” checks whether #42 was already charged). Two more essentials: always configure a <b>dead-letter queue</b> so a “poison” message that always fails stops blocking the line, and watch the <b>age of the oldest message</b> — a queue that grows forever is an outage in slow motion. If per-entity order matters (all events for order #123 in sequence), route them by a key so one worker handles that entity in order.`) +
      TBL(['', 'Work queue', 'Pub/sub', 'Log (Kafka)'], [
        ['Each message goes to', 'One worker', 'Every subscriber', 'Every consumer group'],
        ['After it’s read', 'Deleted', 'Deleted per subscriber', 'Kept (replayable)'],
        ['Example', 'SQS, RabbitMQ', 'SNS, Google Pub/Sub', 'Kafka, Kinesis']]) +
      RECAP([
        `A message queue buffers work between a producer and workers, so the producer doesn’t wait and services don’t depend on each other.`,
        `Benefits: decoupling, absorbing spikes (load leveling), instant responses, reliability, and easy scaling (add workers).`,
        `Delivery is usually <b>at-least-once</b> — messages can arrive twice, so consumers must be <b>idempotent</b>.`,
        `Always use a <b>dead-letter queue</b> for messages that keep failing, and alert on the oldest message’s age (backpressure).`,
        `For per-entity ordering, key messages so one worker handles each entity in sequence; a <b>log</b> (Kafka) differs from a queue by keeping messages for replay.`])]
  ]
});

SDPATCH('eventlog', {
  blurb: `A distributed log like Apache Kafka stores a stream of events durably and in order, split into partitions, and lets many independent teams read them at their own pace — and re-read history whenever they want. Unlike a queue (where a message is consumed once and deleted), a log keeps events so any number of consumers can replay them. It’s the backbone of event-driven systems and real-time data pipelines.`,
  sections: [
    ['How is a log different from a queue?', PLAIN(`A message queue hands each message to <i>one</i> worker and then deletes it. A <b>log</b> (Kafka) is different: it’s an append-only record of events that <b>stays</b> for a retention period, and <i>many</i> independent consumers can each read through it at their own speed, keeping their own bookmark. Add a new team next month and they can replay everything from the beginning. It’s less “to-do inbox,” more “shared, permanent ledger that everyone reads.”`) +
      ANALOGY(`Think of a newspaper of record rather than a stack of memos. A memo (queue message) is read once and binned. The newspaper (the log) is printed in order, kept in the archive, and anyone can subscribe, read at their own pace, and go back to re-read last year’s issues. Many different readers (an email team, an analytics team) each keep their own bookmark in the same paper, entirely independently.`)],
    ['Words you’ll need', KEYTERMS([
      ['Topic', 'A named stream of events (e.g. “orders”, “clicks”).'],
      ['Partition', 'A topic is split into partitions — each an ordered, append-only log. Partitions are the unit of both ordering and parallelism.'],
      ['Offset', 'An event’s position in its partition — effectively a bookmark.'],
      ['Producer / broker', 'Producers append events; brokers are the servers storing partitions (each replicated for safety).'],
      ['Consumer group', 'A set of consumers sharing the work of reading a topic. Every group sees every event; within a group, each partition is read by exactly one consumer.'],
      ['Retention', 'How long events are kept — hours, days, forever, or “compacted” to the latest value per key.'],
      ['Replay', 'Re-reading events from an earlier offset — impossible with a plain queue, easy with a log.']])],
    ['Ordering and parallelism via partitions', PP(`This is the heart of Kafka. Events are routed to partitions by a <b>key</b>: all events with key “order-17” go to the same partition, so they stay in order relative to each other. Within a <b>consumer group</b>, each partition is read by exactly one consumer — so the number of partitions caps how many consumers can work in parallel.`) +
      WHY(`Two consequences worth internalising. First, to guarantee <b>all events for one user/order are processed in order</b>, use that entity’s ID as the key — same key → same partition → ordered — while different entities still spread across partitions for parallelism. Second, if a topic has 6 partitions and you put 8 consumers in a group, 6 each get a partition and <b>2 sit idle</b> — parallelism is capped by partition count, so choose it with growth in mind. Different groups (email, analytics) read the same events completely independently from their own offsets, and a brand-new group can replay months of history.`) +
      PP(`Kafka is fast because it writes and reads <b>sequentially</b> to disk (cheap even on spinning disks), batches and compresses, and makes consumers track their own offsets so brokers hold almost no per-consumer state.`) +
      RECAP([
        `A <b>log</b> (Kafka) stores events durably, in order, and keeps them — so many consumers can read independently and <b>replay</b> history, unlike a one-and-done queue.`,
        `A <b>topic</b> is split into <b>partitions</b> (ordered append-only logs); partitions are the unit of ordering and parallelism, and each event has an <b>offset</b>.`,
        `Events are keyed to partitions: same key → same partition → ordered. Use an entity’s ID as the key to keep its events in order.`,
        `Within a <b>consumer group</b> each partition goes to one consumer, so partition count caps parallelism; different groups read the same events independently.`,
        `It underpins event-driven services, change data capture, and stream processing — and it’s fast thanks to sequential disk I/O, batching, and consumer-tracked offsets.`])]
  ]
});

SDPATCH('batchstream', {
  blurb: `<b>Batch processing</b> crunches a large, fixed pile of data on a schedule (yesterday’s logs, overnight). <b>Stream processing</b> computes continuously over events as they arrive (a fraud score in milliseconds). They trade latency for simplicity in opposite directions, and most real data platforms use both.`,
  sections: [
    ['The two ways to process data', PLAIN(`Once you’re collecting lots of data, you process it in one of two styles. <b>Batch</b>: wait until you have a big, complete chunk (a day’s worth), then run a job over all of it at once — high throughput, but the answer is hours old. <b>Stream</b>: process each event the instant it arrives, keeping running results — answers in seconds, but you must cope with events arriving late or out of order. Many systems run both: stream for “what’s happening now,” batch to recompute exact numbers later.`) +
      ANALOGY(`It’s the difference between doing laundry and washing dishes. <b>Batch</b> is laundry: you let it pile up and run one big efficient load — cheap per item, but your favourite shirt might be dirty for a day. <b>Stream</b> is washing each dish right after you use it: always up to date, a little more effort per item, and you have to deal with dishes showing up at odd times. A busy kitchen does both — wash critical items immediately, run the big pots overnight.`)],
    ['Words you’ll need', KEYTERMS([
      ['Batch processing', 'Running a job over a large, bounded dataset, usually on a schedule. High throughput, high latency.'],
      ['Stream processing', 'Computing continuously over an unbounded flow of events as they arrive. Low latency.'],
      ['Window', 'A slice of the stream to aggregate over — e.g. “views per minute” (tumbling), or a session of activity.'],
      ['Event time vs processing time', 'When something actually happened vs when you processed it — they differ because events arrive late.'],
      ['Watermark', 'A stream processor’s estimate of “we’ve probably now seen all events up to time T,” used to close windows despite late arrivals.'],
      ['Data lake / warehouse', 'Cheap columnar storage of raw data (lake) and a SQL system optimised for analytics (warehouse).']])],
    ['Batch vs stream', TBL(['', 'Batch', 'Stream'], [
      ['Input', 'A large, complete, fixed dataset', 'An endless flow of events'],
      ['Latency', 'Hours (scheduled)', 'Seconds (continuous)'],
      ['Strength', 'Simple to reason about; rerun for the same result', 'Up-to-the-second results'],
      ['Tools', 'Spark, SQL warehouses', 'Flink, Kafka Streams'],
      ['Good for', 'Daily reports, model training, backfills', 'Fraud detection, alerts, live dashboards']])],
    ['Using both together', WHY(`A common pattern: the <b>same</b> events feed a stream processor (for live numbers, shown on a dashboard within seconds) <i>and</i> get archived cheaply. A nightly <b>batch</b> job then scans the complete day — correctly handling events that arrived late or twice — and overwrites the day’s totals with exact figures. You get fast-but-approximate now, and exact-but-slow later. The tricky part of streaming is <b>time</b>: because events arrive late and out of order, you aggregate by <b>event time</b> (when it happened) using <b>windows</b>, and use <b>watermarks</b> to decide when a window has probably seen all its events and can be closed. Batch’s great virtue, by contrast, is simplicity: rerun the same job on the same input and you get the same answer, so fixing a bug is “fix the code, rerun.”`) +
      RECAP([
        `<b>Batch</b> processes a large, complete dataset on a schedule (high throughput, hours of latency); <b>stream</b> processes events as they arrive (low latency, continuous).`,
        `Choose batch for daily reports, model training and backfills; stream for fraud detection, alerts and live dashboards.`,
        `Many systems do both: stream for live approximate numbers, a nightly batch to recompute exact totals from complete data.`,
        `Streaming’s hard part is <b>time</b> — aggregate by <b>event time</b> in <b>windows</b>, using <b>watermarks</b> to handle late, out-of-order events.`,
        `Batch’s strength is reproducibility: same input, same output, so fixing bugs is just rerun.`])]
  ]
});
