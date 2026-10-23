/* ===== X vs Y comparison pages ===== */
SD_CATS.push(['cmp', 'X vs Y'], ['cs', 'Cheat sheets']);

CMP('cmp-kafka-rabbit', { name: 'Kafka vs RabbitMQ', domain: 'Comparison · infrastructure',
  blurb: `Both move messages between services, but they are built on different ideas. Kafka is a distributed, replayable log that consumers read at their own pace; RabbitMQ is a message broker that routes messages to queues and deletes them once acknowledged.`,
  facts: [['Kafka model', 'partitioned log'], ['RabbitMQ model', 'queues + exchanges'], ['Replay', 'Kafka yes · RabbitMQ no'], ['Routing', 'RabbitMQ richer']],
  vs: { cols: ['Kafka', 'RabbitMQ'],
    rows: [['Core model', 'Append-only log split into partitions; messages kept for a retention period', 'Broker routes messages via exchanges to queues; removed after ack'],
      ['Consumers', 'Pull; each consumer group tracks its own offset', 'Push (or pull); competing consumers share a queue'],
      ['Replay / reprocessing', 'Yes: reset offsets and reread history', 'No (except streams plugin); once acked, gone'],
      ['Ordering', 'Per partition', 'Per queue (lost with multiple competing consumers)'],
      ['Throughput', 'Millions of msgs/s per cluster; sequential disk I/O', 'Tens of thousands of msgs/s per node typical'],
      ['Routing', 'By topic and partition key', 'Direct, topic, fanout and header exchanges; flexible patterns'],
      ['Per-message features', 'None built in (no per-message TTL, priority or delay)', 'TTL, priorities, dead-letter exchanges, delayed messages (plugin)'],
      ['Delivery', 'At-least-once; exactly-once within Kafka via transactions', 'At-most-once or at-least-once with acks and confirms'],
      ['Operations', 'Cluster with KRaft controllers; partition planning matters', 'Simpler to start; clustering with quorum queues'],
      ['Ecosystem', 'Kafka Connect, Kafka Streams, Flink, schema registry', 'AMQP, MQTT, STOMP clients; Celery, Spring AMQP']],
    pick: [['Kafka', ['You need an event log several consumers read independently (analytics, search indexing, cache updates).', 'You need replay: rebuild a projection or reprocess after a bug.', 'High throughput streams: clickstreams, logs, CDC from databases.', 'Ordering per key (all events for an order in one partition).']],
      ['RabbitMQ', ['Task queues: send email, resize image, call a slow API, with work spread across workers.', 'Complex routing, priorities, per-message TTL or delayed retries.', 'Request/reply and RPC-style messaging.', 'Lower volume where operational simplicity matters more than replay.']]],
    verdict: 'Kafka when the messages are a stream of facts many systems read and you may need to replay; RabbitMQ when the messages are jobs to be done once by a pool of workers.',
    ask: 'We need to send order events to other services. Kafka or RabbitMQ?',
    answer: PP(`It depends on how the events are used. If several services (fulfilment, analytics, search, notifications) each need every order event, and we want to replay history when we add a new consumer or fix a bug, Kafka fits: a topic partitioned by order ID gives per-order ordering, each service has its own consumer group, and retention lets us reprocess.`) +
      PP(`If the real need is to hand off work items, like “send the confirmation email”, processed once by any of several workers with retries and dead-lettering, RabbitMQ is simpler and has those features built in. Many companies run both: Kafka as the event backbone, a queue for task processing. Either way, consumers must be idempotent because both deliver at least once.`) },
  qs: [SQ('A new analytics service must process the last 30 days of order events. Which system supports this directly?', ['RabbitMQ', 'Kafka', 'Both equally', 'Neither'], 1, 'Kafka retains the log; a new consumer group can start from an old offset.'),
    SQ('You need per-message priorities and delayed retries for background jobs. Better fit?', ['Kafka', 'RabbitMQ'], 1, 'RabbitMQ supports priorities, TTLs and dead-letter exchanges natively.')]
});
DP('cmp-kafka-rabbit', {
  fu: [['How do you get ordering and parallelism at the same time in Kafka?', 'Partition by the key that needs ordering (order ID). Each partition is consumed by one consumer in a group, so events for one key stay ordered while different keys are processed in parallel across partitions.'],
    ['What happens in RabbitMQ when a consumer crashes before acking?', 'The broker requeues the unacknowledged message and delivers it to another consumer, so handlers must be idempotent; prefetch limits how many unacked messages each consumer holds.'],
    ['Would you consider a managed alternative?', 'Often: Amazon SQS/SNS or Google Pub/Sub for queues and fan-out with no operations, Amazon Kinesis or Confluent Cloud/MSK for Kafka-style streams.']],
  deep: [['Edge case', 'Kafka consumers that process slowly fall behind (lag) but lose nothing until retention expires; RabbitMQ queues that grow large use memory and can trigger flow control.'],
    ['Failure mode', 'Kafka with too few partitions caps consumer parallelism; too many slows recovery and metadata.'],
    ['In real systems', 'LinkedIn, Uber and Netflix use Kafka as the event backbone; RabbitMQ powers many Celery and Spring task queues.']],
  src: ['Apache Kafka documentation: Design', 'https://kafka.apache.org/documentation/#design'] });

CMP('cmp-postgres-mysql', { name: 'PostgreSQL vs MySQL', domain: 'Comparison · data',
  blurb: `The two most popular open-source relational databases. Both are mature, fast and run some of the largest sites in the world; the differences are in features, defaults and operational tooling rather than raw capability.`,
  facts: [['Both', 'ACID, SQL, replication'], ['Postgres strength', 'features & extensibility'], ['MySQL strength', 'simple replication at scale'], ['Default isolation', 'PG read committed · MySQL repeatable read']],
  vs: { cols: ['PostgreSQL', 'MySQL (InnoDB)'],
    rows: [['SQL features', 'Very rich: CTEs, window functions, LATERAL, full outer join, partial and expression indexes, MERGE', 'Good and improving (CTEs and windows since 8.0); fewer advanced features'],
      ['Data types', 'JSONB with indexes, arrays, ranges, enums, geometric, custom types', 'JSON (stored binary), spatial; fewer types'],
      ['Extensions', 'PostGIS, pgvector, TimescaleDB, Citus, pg_stat_statements', 'Plugins exist but a much smaller ecosystem'],
      ['Concurrency / MVCC', 'Old row versions kept in the table; VACUUM cleans them', 'Undo log for old versions; no vacuum but purge lag can grow'],
      ['Default isolation', 'Read committed; true serializable (SSI) available', 'Repeatable read with gap locks'],
      ['Replication', 'Streaming physical replication; logical replication', 'Binlog replication, very widely operated; group replication'],
      ['Sharding at scale', 'Citus, application-level sharding', 'Vitess (YouTube, Slack, GitHub) is battle-tested'],
      ['Clustered index', 'Heap tables; indexes point to rows', 'Primary key is the clustered index; secondary indexes store the PK'],
      ['Connections', 'Process per connection; use a pooler (PgBouncer)', 'Thread per connection; handles many connections more cheaply'],
      ['Managed options', 'RDS, Aurora PostgreSQL, Cloud SQL, AlloyDB, Neon, Supabase', 'RDS, Aurora MySQL, Cloud SQL, PlanetScale']],
    pick: [['PostgreSQL', ['You want rich SQL, strong constraints and advanced types (JSONB, arrays, ranges).', 'Geospatial (PostGIS), vectors (pgvector) or time series in one database.', 'Complex analytical queries alongside transactions.', 'Most new projects: it is the default choice for many teams today.']],
      ['MySQL', ['Your team or stack already runs MySQL well (WordPress, many PHP and Rails apps).', 'Very high-scale, simple OLTP with a proven sharding layer (Vitess).', 'Read-heavy workloads with many replicas and lots of operational tooling.', 'You need many concurrent connections without a pooler.']]],
    verdict: 'For a new application with no constraints, PostgreSQL is the safer default because of its features and ecosystem; MySQL is an excellent choice where its tooling and scaling story (Vitess) or existing expertise matter.',
    ask: 'Why would you choose Postgres over MySQL for a new service?',
    answer: PP(`Both would work; at most scales the choice matters less than schema design and indexing. I’d lean to Postgres for a new service because of its richer SQL (window functions, partial and expression indexes, MERGE), strong typing and constraints, JSONB with GIN indexes for semi-structured data, and extensions such as PostGIS and pgvector that avoid adding another database.`) +
      PP(`I’d pick MySQL if the team already operates it, if we expect to need sharding at very large scale where Vitess is proven, or if the platform we use is built around it. I’d also mention operational differences: Postgres needs vacuum tuning and a connection pooler; MySQL’s clustered primary key makes random UUID keys more expensive.`) },
  qs: [SQ('Which needs a connection pooler like PgBouncer more urgently at thousands of connections?', ['MySQL', 'PostgreSQL'], 1, 'Postgres uses a process per connection.'),
    SQ('Which sharding layer is famous for scaling MySQL at YouTube and Slack?', ['Citus', 'Vitess', 'Spanner', 'Cassandra'], 1, 'Vitess was built at YouTube.')]
});
DP('cmp-postgres-mysql', {
  fu: [['What is VACUUM and why does it matter?', 'Postgres MVCC leaves dead row versions after updates and deletes; VACUUM reclaims them and updates visibility maps. Without it tables bloat and transaction ID wraparound can force downtime. Autovacuum must keep up with write-heavy tables.'],
    ['Why are random UUID primary keys costly in MySQL?', 'InnoDB clusters rows by primary key, so random keys insert all over the B-tree, causing page splits and poor cache use, and every secondary index stores the large key. Use sequential IDs or UUIDv7.'],
    ['How would you migrate from MySQL to Postgres?', 'Translate the schema and types, copy data with a tool (pgloader) or CDC (Debezium) to keep them in sync, run both and compare, switch reads then writes, and keep a rollback path.']],
  deep: [['Edge case', 'MySQL’s default collations are case-insensitive, so “A” = “a” in comparisons and unique indexes; Postgres is case-sensitive by default.'],
    ['Failure mode', 'Long-running transactions block vacuum (Postgres) or purge (MySQL) and degrade performance.'],
    ['In real systems', 'Instagram and Notion run sharded Postgres; GitHub, Shopify and Slack run MySQL (Vitess at Slack and GitHub).']],
  src: ['PostgreSQL documentation: Concurrency control (MVCC)', 'https://www.postgresql.org/docs/current/mvcc.html'] });

CMP('cmp-sql-nosql', { name: 'SQL vs NoSQL by workload', domain: 'Comparison · data',
  blurb: `“SQL or NoSQL?” is really “which data model and consistency guarantees fit this workload?”. NoSQL is not one thing: key-value, document, wide-column and graph databases each fit different access patterns. This page compares them workload by workload.`,
  facts: [['Relational', 'joins, transactions'], ['Key-value', 'simple, fast lookups'], ['Document', 'flexible nested records'], ['Wide-column', 'huge write volume']],
  vs: { cols: ['Relational (Postgres, MySQL)', 'Key-value / document (DynamoDB, MongoDB)', 'Wide-column (Cassandra, ScyllaDB)'],
    rows: [['Data model', 'Tables, rows, foreign keys', 'Items or JSON documents by key', 'Partition key → sorted rows of columns'],
      ['Queries', 'Ad hoc SQL, joins, aggregations', 'By key (and secondary indexes); limited joins', 'By partition key and clustering range only'],
      ['Transactions', 'Multi-row ACID', 'Single item; limited multi-item transactions', 'Single partition; lightweight transactions are slow'],
      ['Scaling writes', 'Vertical, then sharding', 'Horizontal and automatic', 'Horizontal, very high write throughput'],
      ['Schema', 'Enforced, migrations', 'Flexible per item', 'Table schema; design per query'],
      ['Consistency', 'Strong', 'Tunable (DynamoDB strong or eventual reads)', 'Tunable per query (ONE, QUORUM)'],
      ['Typical latency', 'ms; depends on query', 'Single-digit ms at any scale', 'Single-digit ms writes']],
    pick: [['Relational', ['Orders, payments, inventory: anything needing transactions across rows.', 'Many relationships and ad hoc reporting.', 'You don’t know all queries yet.', 'Most applications up to very large scale.']],
      ['Key-value / document', ['Access is mostly by ID: sessions, carts, user profiles, feature flags.', 'Unpredictable or huge scale with predictable latency (DynamoDB).', 'Records naturally nested and read whole (product catalogs).', 'Serverless apps wanting no database operations.']],
      ['Wide-column', ['Very write-heavy time-series or event data: messages, IoT readings, activity logs.', 'Multi-region, always-writable clusters.', 'Queries known in advance and keyed by partition (e.g. messages by channel and time).']]],
    verdict: 'Default to a relational database; reach for NoSQL when a specific access pattern (simple keys at huge scale, massive writes, flexible documents) clearly outgrows it, and design those tables around the queries.',
    ask: 'For a chat app’s messages, would you use SQL or NoSQL?',
    answer: PP(`Messages are write-heavy (billions per day at scale), append-only, and always read by conversation and time range. That fits a wide-column store: partition by conversation ID (plus a time bucket to keep partitions bounded), cluster by message timestamp, so “latest 50 messages in this chat” is one sequential read. Discord moved messages from MongoDB to Cassandra and then ScyllaDB for exactly this.`) +
      PP(`User accounts, billing and group membership still belong in a relational database, where we need constraints and transactions. So the answer is both, each for the workload it fits. At smaller scale, a single Postgres with a (conversation_id, created_at) index would be perfectly fine and simpler.`) },
  qs: [SQ('Which workload most clearly favors a relational database?', ['Session storage by ID', 'Bank transfers updating two accounts atomically', 'IoT sensor writes at 1M/s', 'Caching'], 1, 'Multi-row ACID transactions.'),
    SQ('In Cassandra, which query is efficient?', ['Any WHERE clause', 'Rows in one partition filtered by the clustering key range', 'Joins across tables', 'Full-table aggregations'], 1, 'Wide-column stores are designed around partition and clustering keys.')]
});
DP('cmp-sql-nosql', {
  fu: [['How do you model a one-to-many relationship in DynamoDB?', 'Single-table design: put parent and children under the same partition key (PK = USER#1) with different sort keys (SK = PROFILE, ORDER#2024-…), so one query fetches both.'],
    ['Can you do analytics on a NoSQL operational store?', 'Not efficiently: export or stream changes (DynamoDB Streams, CDC) into a warehouse and query there.'],
    ['What is NewSQL?', 'Distributed SQL databases (Spanner, CockroachDB, YugabyteDB, TiDB) that keep SQL and ACID transactions while scaling horizontally, at the cost of higher write latency from consensus.']],
  deep: [['Edge case', 'Hot partitions: a single popular key overloads one node in any key-partitioned store.'],
    ['Failure mode', 'Choosing NoSQL early, then needing joins and transactions and rebuilding them in application code.'],
    ['In real systems', 'Discord (Cassandra → ScyllaDB for messages), Amazon (DynamoDB for carts), Instagram (sharded Postgres).']],
  src: ['Kleppmann, Designing Data-Intensive Applications, ch. 2–3', null] });

CMP('cmp-rest-grpc-graphql', { name: 'REST vs gRPC vs GraphQL', domain: 'Comparison · APIs',
  blurb: `Three ways to design an API. REST exposes resources over plain HTTP and JSON; gRPC calls typed remote procedures with Protobuf over HTTP/2; GraphQL lets clients ask for exactly the fields they need from one endpoint.`,
  facts: [['REST', 'resources + HTTP verbs'], ['gRPC', 'Protobuf + HTTP/2'], ['GraphQL', 'client-shaped queries'], ['Browser native', 'REST, GraphQL']],
  vs: { cols: ['REST', 'gRPC', 'GraphQL'],
    rows: [['Contract', 'OpenAPI (optional)', 'Protobuf .proto (required, codegen)', 'GraphQL schema (required)'],
      ['Payload', 'JSON (text)', 'Protobuf (binary, compact)', 'JSON'],
      ['Transport', 'HTTP/1.1 or 2', 'HTTP/2 (streams)', 'HTTP POST (usually); subscriptions over WebSockets'],
      ['Fetching', 'Fixed responses per endpoint; over- or under-fetching', 'Fixed per method', 'Client picks fields; one round trip for nested data'],
      ['Streaming', 'SSE / WebSockets separately', 'Built in: server, client and bidirectional', 'Subscriptions'],
      ['Caching', 'HTTP caching and CDNs work naturally', 'No HTTP caching', 'Hard at HTTP level; client caches (Apollo, Relay)'],
      ['Browser support', 'Native', 'Needs gRPC-Web or Connect', 'Native'],
      ['Errors', 'HTTP status codes', 'gRPC status codes', 'Usually 200 with an errors array'],
      ['Best at', 'Public APIs, simplicity', 'Internal service-to-service, low latency, polyglot', 'Many client types with varied data needs']],
    pick: [['REST', ['Public or partner APIs that anyone should be able to call with curl.', 'Resources map cleanly to CRUD.', 'You want CDN and HTTP caching.', 'Small teams and simple services.']],
      ['gRPC', ['Internal microservice calls where latency and payload size matter.', 'Strong typed contracts across many languages with generated clients.', 'Streaming (telemetry, chat backends, long-running jobs).']],
      ['GraphQL', ['Several clients (web, iOS, Android) need different shapes of the same data.', 'Screens aggregate data from many backends (GraphQL as a gateway or BFF).', 'Rapidly evolving frontends that shouldn’t wait for new endpoints.']]],
    verdict: 'REST outside, gRPC inside, GraphQL at the edge for complex clients is a common, defensible combination.',
    ask: 'Our mobile app makes 8 REST calls to render the home screen. Would you switch to GraphQL?',
    answer: PP(`Eight sequential calls on a mobile network is a real latency problem, and GraphQL would let the app fetch exactly the fields it needs in one round trip, with the server resolving them in parallel. It also helps when web and mobile need different shapes of the same data.`) +
      PP(`But it adds cost: a schema and resolver layer, N+1 risks (solved with DataLoader batching), query cost limits, and harder HTTP caching. A lighter alternative is a backend-for-frontend REST endpoint that aggregates the home screen. I’d choose GraphQL if many screens and clients have this problem; for one screen, a BFF endpoint is simpler.`) },
  qs: [SQ('Which option gives bidirectional streaming out of the box?', ['REST', 'gRPC', 'GraphQL', 'None'], 1, 'gRPC over HTTP/2 supports client, server and bidirectional streams.'),
    SQ('Which is easiest to cache at a CDN?', ['REST GET endpoints', 'gRPC', 'GraphQL POST queries'], 0, 'HTTP caching keys on URL and headers.')]
});
DP('cmp-rest-grpc-graphql', {
  fu: [['How do you avoid the N+1 problem in GraphQL?', 'Batch and cache lookups per request with a DataLoader: resolvers request IDs, and the loader issues one query per type per tick.'],
    ['How do you version each style?', 'REST: path or header versions and additive changes. gRPC: add fields with new tag numbers, never reuse tags, new services for breaking changes. GraphQL: evolve the schema additively and deprecate fields with @deprecated.'],
    ['How do you secure a public GraphQL API?', 'Persisted (allow-listed) queries, depth and cost limits, timeouts, field-level authorization in resolvers, and rate limiting by query cost.']],
  deep: [['Edge case', 'gRPC through some load balancers and proxies needs HTTP/2 end to end; L4 balancing pins long-lived connections to one backend.'],
    ['Failure mode', 'GraphQL returning partial data with errors confuses clients that only check HTTP status.'],
    ['In real systems', 'Google and Netflix use gRPC internally; GitHub and Shopify publish GraphQL APIs; Stripe’s public API is REST.']],
  src: ['gRPC documentation: Core concepts', 'https://grpc.io/docs/what-is-grpc/core-concepts/'] });

CMP('cmp-state-mgmt', { name: 'Redux vs Zustand vs Context', domain: 'Comparison · frontend',
  blurb: `Three ways to share state in a React app. Context passes values down the tree without prop drilling; Zustand is a tiny external store with selector subscriptions; Redux (with Redux Toolkit) is a structured store with actions, reducers, middleware and devtools. Server data usually belongs in none of them.`,
  facts: [['Context', 'built in, no library'], ['Zustand', '~1 KB, hooks API'], ['Redux Toolkit', 'structure + devtools'], ['Server state', 'TanStack Query / SWR']],
  vs: { cols: ['React Context', 'Zustand', 'Redux Toolkit'],
    rows: [['What it is', 'Dependency injection for the component tree', 'Minimal external store with hooks', 'Predictable global store: actions → reducers'],
      ['Re-renders', 'Every consumer re-renders when the value changes', 'Only components whose selected slice changes', 'Only components whose useSelector result changes'],
      ['Boilerplate', 'Minimal', 'Minimal', 'Moderate (slices reduce it a lot)'],
      ['Devtools / time travel', 'React devtools only', 'Optional Redux devtools middleware', 'Excellent: action log, time travel'],
      ['Async / side effects', 'Your own hooks', 'Plain async functions in the store', 'Thunks, RTK Query, listeners, sagas'],
      ['Use outside React', 'No', 'Yes (vanilla store)', 'Yes'],
      ['Bundle size', '0', '≈ 1 KB', '≈ 10–15 KB with React-Redux'],
      ['Best for', 'Rarely changing values: theme, locale, current user, injected services', 'Small to medium apps wanting simple global state', 'Large apps and teams wanting conventions, middleware and traceability']],
    pick: [['Context', ['Values change rarely (theme, auth user, feature flags).', 'You want to inject dependencies (API client) for testing.', 'You can split contexts so updates stay narrow.']],
      ['Zustand', ['You need shared client state that changes often (editor state, filters, UI panels).', 'You want fine-grained subscriptions without boilerplate.', 'Small team, fast iteration.']],
      ['Redux Toolkit', ['Large codebase with many developers needing one pattern.', 'Complex state transitions you want to log, replay and test as pure reducers.', 'You already use RTK Query for data fetching.']]],
    verdict: 'Keep server data in a query cache (TanStack Query, RTK Query), local state in components, rare globals in Context, and add Zustand or Redux only for genuinely shared, frequently changing client state.',
    ask: 'Would you use Context or Redux for global state in a new React app?',
    answer: PP(`First I’d separate kinds of state. Server data (lists, details) goes in TanStack Query, which handles caching, refetching and deduplication. URL state (filters, page) goes in the router. Form and UI state stays local. What remains global is usually small: the current user, theme, maybe a cart.`) +
      PP(`For that, Context is fine when values change rarely; split contexts and memoize the value to avoid re-rendering the whole tree. If shared state changes often, for example a dashboard editor, I’d use Zustand for selector-based subscriptions with little code, or Redux Toolkit if the team wants strong conventions, middleware and time-travel debugging across a big codebase.`) },
  qs: [SQ('A context value holding a frequently updated object causes slow renders. Why?', ['Context is slow to read', 'Every consumer re-renders whenever the value changes', 'It leaks memory', 'It disables hooks'], 1, 'Context has no selectors; split contexts or use a store with selectors.'),
    SQ('Where should a list of products fetched from the API usually live?', ['Redux slice', 'Context', 'A server-state cache like TanStack Query', 'localStorage'], 2, 'Server-state libraries handle caching, staleness and refetching.')]
});
DP('cmp-state-mgmt', {
  fu: [['How do you stop Context re-rendering everything?', 'Split state and dispatch into separate contexts, memoize the provider value with useMemo, keep frequently changing values out of Context, or use use-context-selector / a store with selectors.'],
    ['How do Zustand selectors avoid re-renders?', 'useStore(s => s.count) subscribes to the store and re-renders only when the selected value changes by reference (or a custom equality function such as shallow).'],
    ['What did Redux Toolkit change compared with classic Redux?', 'createSlice generates actions and reducers, Immer allows “mutating” syntax safely, configureStore sets good defaults, and RTK Query handles data fetching, removing most boilerplate.']],
  deep: [['Edge case', 'Server-side rendering: global stores must be created per request to avoid sharing state between users.'],
    ['Failure mode', 'Copying server data into a global store and then hand-writing cache invalidation.'],
    ['In real systems', 'Many teams pair TanStack Query with Zustand; large enterprise apps standardize on Redux Toolkit.']],
  src: ['Redux docs: Redux Toolkit overview and “When should I use Redux?”', 'https://redux.js.org/faq/general#when-should-i-use-redux'] });

CMP('cmp-mono-micro', { name: 'Monolith vs microservices', domain: 'Comparison · architecture',
  blurb: `A monolith deploys the whole application as one unit; microservices split it into independently deployable services that own their data. The real trade-off is organizational speed and independent scaling against distributed-systems complexity.`,
  facts: [['Monolith', 'one deployable'], ['Microservices', 'many, independently deployed'], ['Middle ground', 'modular monolith'], ['Deciding factor', 'team size & boundaries']],
  vs: { cols: ['Monolith (modular)', 'Microservices'],
    rows: [['Deployment', 'One build, one deploy', 'Each service deploys independently'],
      ['Team scaling', 'Coordination grows with team size; merge and release contention', 'Teams own services end to end; less coordination'],
      ['Data', 'One database; transactions and joins are easy', 'Database per service; consistency via events, sagas'],
      ['Calls between parts', 'In-process function calls', 'Network calls: latency, failures, retries, versioning'],
      ['Scaling', 'Scale the whole app', 'Scale hot services independently'],
      ['Failure isolation', 'A bug or memory leak can take down everything', 'Failures contained if designed with timeouts and bulkheads'],
      ['Tech diversity', 'One stack', 'Different languages and databases per service'],
      ['Operations', 'Simple: one pipeline, one set of dashboards', 'Needs CI/CD per service, service discovery, tracing, mesh, on-call per team'],
      ['Testing', 'End-to-end tests are straightforward', 'Contract tests, environments, harder integration testing']],
    pick: [['Monolith', ['Early-stage product or a team under ~20–30 engineers.', 'Domain boundaries are still changing.', 'Strong consistency across features matters.', 'You lack mature CI/CD, observability and on-call practices.']],
      ['Microservices', ['Many teams blocked by each other in one codebase and release train.', 'Parts with very different scaling or reliability needs (payments vs recommendations).', 'Clear, stable domain boundaries.', 'Mature platform: automated deploys, tracing, service templates.']]],
    verdict: 'Start with a well-structured modular monolith; extract a service when a specific boundary, team or scaling need justifies the operational cost.',
    ask: 'We are a 15-person startup. Should we build microservices from day one?',
    answer: PP(`Probably not. With 15 engineers and a product still finding its shape, the costs of microservices (network calls, distributed transactions, per-service pipelines, tracing, on-call) would slow us down more than the coordination they save. I’d build a modular monolith: clear modules with explicit interfaces, no reaching into other modules’ tables, and one deployment.`) +
      PP(`That keeps the option open. When a module has a clear boundary and a reason to be separate (independent scaling, a different team, a different reliability requirement), we extract it with the strangler pattern behind the same interface. Shopify runs one of the largest Rails monoliths this way, and Amazon Prime Video moved a monitoring system back to a monolith to cut costs.`) },
  qs: [SQ('Which problem do microservices mainly solve?', ['Code runs faster', 'Many teams can develop, deploy and scale parts independently', 'They remove the need for databases', 'They simplify testing'], 1, 'The benefit is organizational and scaling independence.'),
    SQ('A “distributed monolith” is…', ['A monolith on many servers', 'Services that must be deployed together because they are tightly coupled', 'A modular monolith', 'A serverless app'], 1, 'All the costs of microservices with none of the independence.')]
});
DP('cmp-mono-micro', {
  fu: [['How do you find service boundaries?', 'Use domain-driven design: bounded contexts with their own language and data (billing, catalog, shipping). Boundaries should minimize chatty calls and shared data, and align with team ownership (Conway’s law).'],
    ['How do microservices keep data consistent without distributed transactions?', 'Each service updates its own database and publishes events via an outbox; other services react, and multi-step workflows use sagas with compensating actions. Accept eventual consistency where the business allows.'],
    ['What platform capabilities must exist before going to microservices?', 'Automated CI/CD per service, centralized logging, metrics and distributed tracing, service discovery, secrets management, and a service template so new services start with all of it.']],
  deep: [['Edge case', 'Shared libraries with business logic recouple services; share only infrastructure code.'],
    ['Failure mode', 'Synchronous call chains (A → B → C → D) multiply latency and failure probability.'],
    ['In real systems', 'Amazon, Netflix and Uber run thousands of services; Shopify and Basecamp run modular monoliths.']],
  src: ['Fowler, “MonolithFirst” (2015)', 'https://martinfowler.com/bliki/MonolithFirst.html'] });

CMP('cmp-gcm-chacha', { name: 'AES-GCM vs ChaCha20-Poly1305', domain: 'Comparison · cryptography',
  blurb: `The two authenticated encryption (AEAD) algorithms used by TLS 1.3, SSH, WireGuard and most modern libraries. Both are secure; the choice is about hardware support, performance and how forgiving they are of nonce mistakes.`,
  facts: [['Both', 'AEAD, 256-bit keys'], ['AES-GCM', 'fast with AES-NI'], ['ChaCha20-Poly1305', 'fast in pure software'], ['Nonce', '96-bit (XChaCha: 192-bit)']],
  vs: { cols: ['AES-GCM', 'ChaCha20-Poly1305'],
    rows: [['Construction', 'AES block cipher in counter mode + GHASH (polynomial MAC over GF(2¹²⁸))', 'ChaCha20 stream cipher (add-rotate-xor) + Poly1305 MAC'],
      ['Key / nonce / tag', '128 or 256-bit key, 96-bit nonce, 128-bit tag', '256-bit key, 96-bit nonce (192-bit for XChaCha20), 128-bit tag'],
      ['Speed with hardware support', 'Fastest (AES-NI + carry-less multiply): several GB/s per core', 'Fast'],
      ['Speed without hardware support', 'Slow, and table-based software AES leaks timing', 'Fast and constant-time on any CPU'],
      ['Nonce reuse', 'Catastrophic: leaks plaintext XOR and the authentication key (forgeries)', 'Catastrophic for those messages (plaintext XOR, one-time Poly1305 key)'],
      ['Random nonces', '96 bits: limit ~2³² messages per key', 'XChaCha20: random 192-bit nonces safe for effectively unlimited messages'],
      ['Standards & compliance', 'NIST (SP 800-38D), FIPS 140 validated modules', 'IETF (RFC 8439); not FIPS-approved'],
      ['Used by', 'TLS (default on servers), IPsec, cloud KMS, disk and database encryption', 'TLS on mobile, WireGuard, OpenSSH, libsodium, Signal']],
    pick: [['AES-GCM', ['Servers and desktops with AES-NI (virtually all x86 and modern ARM).', 'FIPS or government compliance is required.', 'Cloud KMS and HSM integrations (they speak AES).']],
      ['ChaCha20-Poly1305', ['Devices without AES hardware (older phones, IoT, some embedded).', 'You want constant-time behavior with a pure software implementation.', 'You need random nonces at large scale: use XChaCha20-Poly1305.', 'You use libsodium, WireGuard-style protocols, or SSH.']]],
    verdict: 'Both are excellent; let TLS negotiate. In your own code, use AES-256-GCM on servers with hardware AES or when compliance requires it, and XChaCha20-Poly1305 when you want random nonces or portable constant-time software.',
    ask: 'Which would you use to encrypt records in our application, AES-GCM or ChaCha20-Poly1305?',
    answer: PP(`Both are secure authenticated encryption, so the decision is practical. On our servers, which have AES-NI, AES-256-GCM is the fastest and is what our KMS and any FIPS requirement expect; I’d use envelope encryption with a data key from KMS and a fresh 96-bit nonce per record, rotating data keys well before 2³² encryptions.`) +
      PP(`If we can’t guarantee unique nonces with counters, or we’re encrypting on mobile devices without AES hardware, I’d choose XChaCha20-Poly1305 from libsodium, whose 192-bit random nonces make collisions negligible. Either way, I’d include the record ID as associated data so ciphertexts can’t be swapped between records, and never reuse a nonce with the same key.`) },
  qs: [SQ('Why might a mobile app prefer ChaCha20-Poly1305?', ['It has larger keys', 'It is fast and constant-time without AES hardware', 'It is FIPS-approved', 'It needs no nonce'], 1, 'ChaCha uses only add, rotate and XOR.'),
    SQ('What makes XChaCha20-Poly1305 attractive for random nonces?', ['Shorter tags', '192-bit nonces make random collisions negligible', 'It needs no key', 'It is a hash function'], 1, 'Random 96-bit nonces collide after about 2⁴⁸ messages (birthday); 192-bit don’t.')]
});
DP('cmp-gcm-chacha', {
  fu: [['Why is a GCM nonce collision worse than “just” leaking two plaintexts?', 'GHASH’s key H can be solved from two messages under the same nonce, after which the attacker can forge valid tags for arbitrary ciphertexts under that key.'],
    ['What is AES-GCM-SIV?', 'A nonce-misuse-resistant AEAD (RFC 8452): reusing a nonce only reveals whether two messages were identical, instead of breaking confidentiality and authenticity.'],
    ['How does TLS choose between them?', 'Clients list cipher suites in preference order; many mobile clients put ChaCha20 first when they lack AES hardware, and servers can honor client preference for ChaCha20.']],
  deep: [['Edge case', 'GCM with 128-bit key vs 256-bit: both safe today; 256 adds post-quantum margin against Grover’s algorithm.'],
    ['Failure mode', 'Counter-based nonces reset after a restart or a VM snapshot restore, silently reusing nonces.'],
    ['In real systems', 'Cloudflare and Google serve both in TLS; WireGuard uses ChaCha20-Poly1305 only; AWS KMS uses AES-256-GCM.']],
  src: ['RFC 8439: ChaCha20 and Poly1305; NIST SP 800-38D: GCM', 'https://www.rfc-editor.org/rfc/rfc8439'] });
