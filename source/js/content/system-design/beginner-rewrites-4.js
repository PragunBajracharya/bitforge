/* ===== Beginner-first rewrites — batch 4 (case studies: rate limiter, payments, Google Docs, Dropbox, Ticketmaster). ===== */

/* ---------------- Distributed rate limiter ---------------- */
SDX('case-ratelimiter', { name: 'Design a distributed rate limiter', cat: 'sdcase',
  blurb: `We’re building the bouncer that stands in front of an API and says “you’ve made enough requests for now — slow down.” For example: each customer may make 100 requests a minute. The tricky part is that the API runs on <b>hundreds</b> of servers, so they all have to share one running count per customer, the check has to add almost no delay, and if the bouncer itself ever falls over, the API must keep working anyway.`,
  facts: [['Requests to check', '≈ 1 million per second'], ['Different customers', '≈ 10 million keys'], ['Delay it may add', 'under 1 ms (almost nothing)'], ['Where the counts live', 'a shared fast store (Redis)']],
  dg: { w: 840, h: 360,
    n: [['c', 'Client', 80, 180, 'client'], ['gw', 'API gateway', 265, 180, 'gw', 'the bouncer'], ['rl', 'Limiter check', 470, 75, 'svc', 'bucket of tokens'], ['rd', 'Shared counts (Redis)', 700, 75, 'cache', 'one place, atomic'],
      ['cfg', 'Rules', 700, 280, 'db', 'limit per plan'], ['api', 'Backend services', 470, 285, 'svc']],
    e: [['c', 'gw', ''], ['gw', 'rl', 'allowed?'], ['rl', 'rd', 'take a token'], ['rl', 'cfg', 'the rules', 'd'], ['gw', 'api', 'only if allowed']] },
  cap: `Every request hits the gateway (the bouncer) first. The bouncer checks the customer’s “bucket of tokens” in one shared fast store using a single all-or-nothing operation, so hundreds of gateways can’t miscount. Only allowed requests pass through to the real services.`,
  walk: [[['c', 'gw', 'c>gw'], `A request comes in carrying a customer’s API key. It can land on <b>any</b> of the gateway servers — which is exactly why the count has to be shared.`],
    [['gw', 'rl', 'gw>rl'], `The gateway looks up this customer’s rule (say: 100 requests per minute, with small bursts allowed) and builds the key it’ll count against.`],
    [['rl', 'rd', 'rl>rd'], `It runs <b>one</b> tiny all-or-nothing operation in the shared store: “refill this customer’s bucket based on time passed, and if there’s a token left, take one.” Doing it as a single operation is what stops two gateways from both spending the last token.`],
    [['gw', 'api', 'gw>api'], `Token available → the request is forwarded to the real backend, with a header telling the client how many requests they have left. No token → the gateway immediately returns <b>429 Too Many Requests</b> and never bothers the backend.`],
    [['rl', 'cfg', 'rl>cfg'], `The limits themselves live in a small rules store and are cached in every gateway for a few seconds, so operators can change a limit without a redeploy and without a lookup on every request.`]],
  sections: [
    ['What are we building?', PLAIN(`A <b>rate limiter</b> caps how often someone can use your API — “100 requests per minute per key.” It protects you from abuse, from runaway scripts, and from one noisy customer hogging everything. On a single server this would be easy. The hard version is that your API runs across <b>many</b> servers at once, yet the limit is per-customer across all of them — so they must share one honest count, instantly, for millions of customers.`) +
      ANALOGY(`Picture a club with many doors. Each guest is allowed in a certain number of times an hour. If every door kept its own tally, a guest could slip in through all the doors and blow past the limit. So all the doors share one clipboard, and marking the clipboard has to be a single quick motion that no two bouncers can do at the exact same instant for the same guest. That shared clipboard is our shared counter; the single quick motion is the “atomic” operation.`)],
    ['Words you’ll need', KEYTERMS([
      ['Rate limit', 'A cap on how many requests are allowed in a time window — e.g. 100 per minute.'],
      ['API key', 'The identifier that says who’s calling, so we can count per customer.'],
      ['Token bucket', 'The most popular way to track a limit: imagine a bucket that holds, say, 100 tokens and refills a bit each second. Each request takes one token; no tokens left means “denied.” It naturally allows short bursts while enforcing the average rate.'],
      ['Atomic', 'An operation that happens all-at-once with no gap in the middle for someone else to sneak in. “Check tokens and take one” must be atomic, or two servers both see the last token and both take it.'],
      ['Redis', 'A very fast in-memory data store, used here as the one shared place where all the servers keep the counts.'],
      ['429 / Retry-After', 'The standard “Too Many Requests” response, plus a hint telling the client how long to wait before trying again.'],
      ['Fail open', 'If the limiter itself breaks, let requests through rather than blocking everything — the limiter must never take down the API it’s protecting.']])],
    ['How one check works', BSTEPS([
      ['Identify and look up the rule', PP(`Read the API key, find its plan’s limit (cached in memory so there’s no lookup cost), and form the counting key, e.g. <code>key + endpoint</code>.`)],
      ['Do the count atomically in the shared store', PP(`Run a single small script in Redis that refills the bucket based on how much time has passed, takes one token if available, and reports back “allowed?” and “tokens left.” Because it’s one atomic script, hundreds of gateways can hammer the same customer’s bucket without ever overspending.`)],
      ['Allow or deny', PP(`Allowed → forward the request and attach “requests remaining” headers so well-behaved clients can pace themselves. Denied → return <b>429</b> with <b>Retry-After</b> and stop — the backend is never touched.`)]])],
    ['Which counting method? (the short version)', PP(`There are a few ways to track a limit; here’s the plain-English comparison. For most APIs the <b>token bucket</b> wins because it allows natural bursts (a web page loading 20 images at once) while still holding the average rate, and it only needs to remember two numbers.`) +
      TBL(['Method', 'How it works', 'Catch'],
        [['Fixed window', 'Count requests in each clock-minute', 'Lets double through at the minute boundary'],
         ['Sliding window', 'Blend this minute and last minute', 'Accurate, still tiny state'],
         ['Token bucket', 'A refilling bucket of tokens; one per request', 'The usual choice — allows bursts, enforces the average'],
         ['Leaky bucket', 'Drip requests out at a steady rate', 'Smooth, but adds some delay']])],
    ['Making it never hurt the API it protects', WHY(`A rate limiter sits in front of <b>every single request</b>, so if it’s slow or down, your whole API is slow or down. That would be absurd — the safety device becoming the hazard. So the rules are: keep a short timeout on the shared store and, if it doesn’t answer in time, <b>fail open</b> (allow the request) and fall back to a rough local count. Also handle <b>hot keys</b> (one abusive customer pounding one shard) by blocking them further out at the edge, and avoid clock-drift bugs by using the store’s own clock inside the atomic script.`) +
      RECAP([
        `A rate limiter caps requests per customer; the hard part is sharing one honest count across many API servers with almost no added delay.`,
        `Keep the counts in one fast shared store and do “refill + take a token” as a single <b>atomic</b> operation, so no two servers overspend.`,
        `A <b>token bucket</b> is the usual method: it allows short bursts while holding the average rate, using just two numbers per customer.`,
        `Allowed requests pass through with “remaining” headers; denied ones get <b>429 + Retry-After</b> and never reach the backend.`,
        `Crucially, <b>fail open</b> with a local fallback if the limiter breaks — the protector must never become the outage.`])]
  ],
  code: null, prac: [],
  qs: [SQ('Why run the “refill the bucket and take a token” step as a single atomic operation in the shared store?', ['Atomic operations are faster', 'So two gateways can’t both see the last token and both take it — separate read-then-write would let extra requests through', 'The store requires it', 'To avoid storing any state'], 1, 'Concurrent read-modify-write races are exactly what atomicity prevents.'),
    SQ('The shared counter store becomes unreachable. What should a well-designed rate limiter usually do?', ['Reject every request until it recovers', 'Fail open — allow requests (with a short timeout and a rough local fallback) so the limiter never takes the API down', 'Retry forever and make clients wait', 'Shut the gateway down'], 1, 'The limiter must protect the API, not become its single point of failure.')]
});

/* ---------------- Payment system ---------------- */
SDX('case-payments', { name: 'Design a payment system', cat: 'sdcase',
  blurb: `We’re building the part of an online store that takes people’s money — safely. It talks to a card processor (like Stripe) to actually move the funds, but its own job is to make sure a customer is <b>never charged twice</b>, a payment is <b>never lost</b>, and every penny is recorded in a way an accountant could audit years later. This is less about speed and entirely about correctness.`,
  facts: [['Payments a day', '≈ 1 million (not much traffic)'], ['The absolute rule', 'never charge twice, never lose one'], ['How money is recorded', 'a double-entry ledger (append-only)'], ['The safety net', 'nightly reconciliation']],
  dg: { w: 900, h: 440,
    n: [['u', 'Checkout', 80, 200, 'client'], ['api', 'Payment service', 300, 200, 'svc', 'dedupe keys'], ['psp', 'Card processor', 590, 200, 'ext', 'moves the money'],
      ['q', 'Event bus', 300, 60, 'queue', 'tells other services'], ['db', 'Payments DB', 300, 340, 'db', 'records + ledger'], ['wh', 'Callback handler', 590, 340, 'svc'], ['rec', 'Reconciler', 810, 340, 'worker', 'nightly check']],
    e: [['u', 'api', 'pay + key'], ['api', 'db', 'record it first'], ['api', 'psp', 'charge'], ['psp', 'wh', 'result callback'], ['wh', 'db', 'update status'], ['api', 'q', 'succeeded', 'd'], ['rec', 'psp', 'their report', 'd'], ['rec', 'db', 'compare', 'dU']] },
  cap: `The payment service writes down what it’s about to do <b>before</b> calling the processor, confirms the result from both the direct answer and a later callback, records the money in a balanced ledger, and every night a reconciler compares its own records against the processor’s report to catch anything that slipped.`,
  walk: [[['u', 'api', 'u>api'], `Checkout sends “charge this amount” along with an <b>idempotency key</b> — a unique ID generated once for this order attempt. (Real card numbers never touch your servers; you pass a safe token instead.)`],
    [['api', 'db', 'api>db'], `<b>First</b>, in one database transaction, the service records the key and a payment marked PENDING. If the same request is accidentally sent again with the same key, it finds this existing record and returns its result instead of charging again. This is the anti-double-charge trick.`],
    [['api', 'psp', 'api>psp'], `Then it asks the card processor to charge — passing its own derived key so even its <i>own</i> retries can’t double charge.`],
    [['psp', 'wh', 'wh>db', 'psp>wh'], `The result might come back right away, or arrive later as a <b>callback</b> (webhook) — for example after the bank asks the customer for extra verification. The callback handler checks it’s genuine and flips the payment to SUCCEEDED or FAILED.`],
    [['api', 'db', 'api>db'], `On success, in the <b>same</b> transaction as the status change, it writes balanced <b>ledger</b> entries recording where the money went.`],
    [['api', 'q', 'api>q'], `It announces “payment.succeeded” so the order, email, and analytics services can react — the payment service doesn’t call them directly.`],
    [['rec', 'psp', 'rec>psp', 'rec>db'], `Every night the <b>reconciler</b> downloads the processor’s official report and matches every transaction against the ledger, flagging any mismatch for a human.`]],
  sections: [
    ['What are we building?', PLAIN(`A payment system sits between your “Pay” button and a <b>card processor</b> (the company that actually moves money between banks). Your system doesn’t touch the card networks itself — it orchestrates the charge and, above all, <b>keeps perfect records</b>. The entire design is driven by one fear: money bugs. Charging someone twice, taking money but not recording it, or recording a payment that never happened are all unacceptable.`) +
      ANALOGY(`Think of a careful cashier with a bound notebook. Before taking your card she writes “about to charge order #42” in pen. She runs the card. If the machine hiccups and she’s not sure it went through, she does <b>not</b> just swipe again — she checks. At the end of the night she lines her notebook up against the card machine’s printout, line by line, and if even one entry disagrees, she stops and investigates. That caution is the whole system.`)],
    ['Words you’ll need', KEYTERMS([
      ['Card processor (PSP)', 'The outside service (Stripe, Adyen…) that actually charges the card. You call it; you don’t build it.'],
      ['Idempotency key', 'A unique ID attached to a payment attempt so that if the request is repeated, it’s recognised and <b>not</b> charged a second time. “Idempotent” just means “doing it again has no extra effect.”'],
      ['Webhook (callback)', 'A message the processor sends you later to report the final result, when it couldn’t all be settled in the first instant (e.g. extra bank verification).'],
      ['Ledger (double-entry)', 'The accountant’s way of recording money: every transaction is written as balanced entries (what left one account equals what entered another). It’s append-only — you never erase, you only add correcting entries.'],
      ['Reconciliation', 'Comparing your own records against the processor’s official report to catch anything missing or wrong — the final safety net.'],
      ['Minor units (cents)', 'Money is stored as whole numbers of cents, never as decimals, because decimals in a computer round badly (0.1 + 0.2 isn’t exactly 0.3).']])],
    ['The #1 rule: never charge twice (idempotency)', WHY(`Networks are unreliable, so clients and services <b>retry</b>. Without protection, a retry could charge the customer again. The fix is the <b>idempotency key</b>: the client generates one unique ID per order attempt, and the payment service records it the instant the request arrives. Any later request carrying the same key gets the <i>first</i> result handed back instead of a new charge. The payment service also uses its own derived key when calling the processor, so the protection holds end to end.`)],
    ['The scary case: the timeout', PP(`The single most dangerous moment is when the call to the processor <b>times out</b>. Did the charge go through or not? You genuinely don’t know.`) +
      PLAIN(`The rule: <b>never assume it failed.</b> Leave the payment PENDING, then find out for sure — ask the processor directly or wait for its webhook — before deciding. And anything still unresolved gets caught by the nightly reconciliation. Marking it failed and letting the user “try again” is how you double charge someone.`)],
    ['How the money is recorded: the double-entry ledger', PP(`Instead of a single “balance” number you can overwrite (and corrupt), accountants record every movement as <b>balanced entries</b> where debits equal credits. For a $100 charge with a $2.90 fee:`) +
      TBL(['Account', 'Debit', 'Credit'],
        [['Customer owes us', '$100.00', ''],
         ['Owed to merchant', '', '$97.10'],
         ['Our fee revenue', '', '$2.90']]) +
      UL([`Entries are <b>append-only</b>: you never edit or delete; a correction (like a refund) is a <i>new</i> reversing entry. That’s what makes the history auditable.`,
        `Any balance is just the sum of entries, and the rule “total debits = total credits” is a built-in alarm: if it’s ever off, there’s a bug.`,
        `Because this is about correctness, not volume (a million payments a day is tiny), a single well-run database handles it comfortably.`])],
    ['The safety net and the rest', UL([
      `<b>Reconciliation</b> each night compares your ledger to the processor’s settlement report and flags mismatches — it catches missing webhooks, bugs, and processor errors that everything else missed.`,
      `<b>Refunds and chargebacks</b> are new reversing transactions linked to the original, never edits.`,
      `<b>The event bus</b> lets other services (order fulfilment, receipts) react to “payment succeeded” without the payment service depending on them.`,
      `<b>Staying out of card-data trouble (PCI):</b> card details go straight from the browser to the processor, so your servers only ever hold a harmless token.`]),
      RECAP([
        `A payment system orchestrates a charge through a card processor and, above all, keeps flawless, auditable records — correctness over speed.`,
        `<b>Idempotency keys</b> make repeated requests safe, so retries never double charge; the service records the attempt <b>before</b> calling the processor.`,
        `On a <b>timeout</b>, never assume failure — confirm via the processor or its webhook; let reconciliation settle anything unknown.`,
        `Record money in an append-only <b>double-entry ledger</b> (debits = credits), store amounts as integer cents, and make corrections as new reversing entries.`,
        `A nightly <b>reconciliation</b> against the processor’s report is the final safety net that catches everything else.`])]
  ],
  code: null, prac: [],
  qs: [SQ('The call to the card processor times out and you don’t know if the charge happened. What should you do?', ['Mark it failed and let the customer try again', 'Leave it pending and confirm with the processor (direct query or webhook) before deciding', 'Immediately charge again with a fresh key', 'Refund straight away'], 1, 'A timeout is ambiguous; assuming failure and retrying is exactly how a double charge happens.'),
    SQ('Why record money in an append-only double-entry ledger instead of just updating a balance field?', ['It uses less storage', 'Every movement is a balanced, permanent entry, so history is auditable and “debits must equal credits” catches bugs', 'Balances are hard to compute', 'Processors require it'], 1, 'Append-only balanced entries give auditability and a built-in correctness check.')]
});

/* ---------------- Collaborative editing (Google Docs) ---------------- */
SDX('case-docs', { name: 'Design collaborative editing (Google Docs)', cat: 'sdcase',
  blurb: `We’re building the magic where several people type in the same document at the same time, each sees the others’ changes and cursors within a fraction of a second, and nobody’s edits get lost or scrambled — everyone ends up looking at exactly the same text. The heart of the problem is merging edits that happen at the same instant.`,
  facts: [['People editing one doc', 'up to ~100'], ['How fast edits must appear', 'under ~200 ms'], ['The connection used', 'an always-open WebSocket'], ['The merge technique', 'OT or CRDT (explained below)']],
  dg: { w: 860, h: 400,
    n: [['a', 'Editor A', 80, 110, 'client'], ['b', 'Editor B', 80, 290, 'client'], ['gw', 'Connection gateway', 290, 200, 'gw'], ['col', 'Collab service', 520, 200, 'svc', 'one owner per doc'],
      ['log', 'Edit log', 740, 90, 'db', 'ordered edits'], ['snap', 'Snapshots', 740, 310, 'store', 'now and then'], ['pres', 'Cursors', 520, 345, 'cache', 'who’s where']],
    e: [['a', 'gw', 'edits', 'b'], ['b', 'gw', 'edits', 'b'], ['gw', 'col', 'route by doc', 'b'], ['col', 'log', 'append'], ['col', 'snap', 'save', 'd'], ['col', 'pres', 'cursors', 'd']] },
  cap: `Each person keeps an always-open connection and sends tiny edits as they type. One server “owns” each open document: it puts everyone’s edits into a single agreed order, adjusts them so they don’t clash, saves them to a log, and broadcasts them to everyone — so all copies end up identical.`,
  walk: [[['a', 'gw', 'a>gw'], `Editor A types “x”. A’s screen updates <b>immediately</b> (no waiting for the server — that’s what makes it feel instant), and A sends a tiny edit: “insert ‘x’ at position 5, based on version 41.”`],
    [['gw', 'col', 'gw>col'], `The gateway routes that edit by document ID to the <b>one</b> server that owns this document, so a single place decides the order of edits.`],
    [['b', 'gw', 'b>gw'], `At the very same moment, Editor B deleted a character at position 2, also based on version 41. The two edits are <b>concurrent</b> — neither knew about the other.`],
    [['col', 'log', 'col>log'], `The owner accepts A’s edit as version 42. B’s edit arrived based on 41, so the server <b>adjusts</b> it to account for A’s change (B’s delete was before A’s insert, so positions still line up) and records it as version 43. Both go into the log.`],
    [['gw', 'col', 'a', 'b'], `The server broadcasts each edit with its version number. Each person’s app adjusts incoming edits against its own not-yet-confirmed edits — and every copy converges to the exact same text.`],
    [['col', 'pres', 'col>pres'], `Cursors and selections ride a separate lightweight channel (they’re constantly changing and don’t need to be saved).`],
    [['col', 'snap', 'col>snap'], `Every so often the server saves a full <b>snapshot</b>, so opening the doc later means loading one snapshot plus a short tail of recent edits — not replaying all of history.`]],
  sections: [
    ['What are we building (and the one hard idea)', PLAIN(`Collaborative editing lets many people edit one document live. Your own typing must feel <b>instant</b>, and everyone else’s changes should show up within a blink. The genuinely hard part is what happens when two people change the same place at the same time: somehow, every single person’s screen has to end up showing the <b>identical</b> final document, with nobody’s edit lost. Making all those copies agree is called <b>convergence</b>, and it’s the whole game.`) +
      ANALOGY(`Imagine several people writing on one shared whiteboard — except each is really writing on their own copy, and a referee is constantly reconciling them. If Ann inserts a word near the start while Ben deletes a word near the end, the referee has to re-aim Ben’s delete (everything after Ann’s insert shifted over) so it still lands on the right word. Do that correctly for every simultaneous edit and all the whiteboards stay identical.`)],
    ['Words you’ll need', KEYTERMS([
      ['Operation (edit)', 'One small change — “insert this character here” or “delete the character there.” People send streams of these, not whole documents.'],
      ['Concurrent edits', 'Two edits made at nearly the same time, each unaware of the other. These are what must be merged carefully.'],
      ['Convergence', 'The guarantee that after all edits are exchanged, every copy of the document is exactly the same.'],
      ['WebSocket', 'An always-open two-way connection, so edits can flow both ways the instant they happen (same idea as in the chat design).'],
      ['Operational Transformation (OT)', 'One way to merge: when a concurrent edit arrives, “transform” it (adjust its positions) so it still makes sense after the other edits. Usually needs one server to decide the order. Google Docs uses this.'],
      ['CRDT', 'Another way to merge: design the data so that edits can be combined in <b>any order</b> and always give the same result (each character gets a unique ID). Works peer-to-peer and offline, at the cost of more bookkeeping. Figma and apps like Apple Notes use CRDT-style approaches.']])],
    ['Why typing feels instant', WHY(`If your letters only appeared after a round-trip to the server, typing would feel laggy and horrible. So each client applies your edit to <b>your</b> copy immediately, then sends it off to be reconciled. The reconciliation (transforming against others’ concurrent edits) happens behind the scenes. This “act locally now, agree globally soon” split is why it feels instant yet everyone still converges.`)],
    ['The key design choice: one owner per document', PP(`How do a hundred people’s simultaneous edits get a single agreed order? The simplest reliable answer: route <b>every</b> edit for a given document to <b>one</b> server that owns it. That one server stamps edits with version numbers in order — no need for a slow group vote on every keystroke.`) +
      BSTEPS([
        ['Route by document', PP(`The gateway sends all edits for document X to the single server that owns X (picked by hashing the doc ID, with a short “lease” marking ownership).`)],
        ['Order and adjust', PP(`That owner assigns each edit the next version number and transforms concurrent edits so they don’t clash, then appends them to the edit log and broadcasts them.`)],
        ['Survive a crash', PP(`If the owner dies, another server takes the lease, loads the latest snapshot plus log, and clients reconnect and resend any edits that weren’t yet confirmed — nothing is lost.`)]])],
    ['OT vs CRDT, in plain terms', PP(`Both solve the same puzzle (merge concurrent edits so everyone converges); they just make different trade-offs. In an interview, either is fine as long as you can explain <i>why</i> it converges.`) +
      TBL(['', 'OT (transform edits)', 'CRDT (commutative data)'],
        [['The idea', 'Adjust each incoming edit to fit edits it didn’t know about', 'Build the data so merges work in any order'],
         ['Needs a central server?', 'Usually yes, to order edits', 'No — peers can merge directly, even offline'],
         ['Extra bookkeeping', 'Little', 'More (hidden markers), needs tidying up'],
         ['Used by', 'Google Docs', 'Figma, Apple Notes, Yjs, Automerge']]) +
      PLAIN(`Rough rule of thumb: a central server with <b>OT</b> is simpler to reason about; <b>CRDTs</b> shine when you need offline editing or no central authority.`)],
    ['The rest of the system', UL([
      `<b>Version history</b> falls out for free — it’s just the edit log plus periodic snapshots.`,
      `<b>Offline edits</b> queue up on your device and get transformed or merged when you reconnect.`,
      `<b>Cursors/presence</b> for a doc with hundreds of viewers are throttled (sent every 50–100 ms) and summarised (“+940 others”) rather than drawn one by one.`]),
      RECAP([
        `Collaborative editing lets many people edit one doc live; the hard part is merging simultaneous edits so every copy <b>converges</b> to identical text with nothing lost.`,
        `Each client applies your edit <b>locally and instantly</b>, then sends it to be reconciled — that’s why typing feels immediate.`,
        `Route all of a document’s edits to <b>one owning server</b>, which puts them in a single order and adjusts concurrent edits (no per-keystroke voting).`,
        `<b>OT</b> transforms edits to fit (needs a central server; Google Docs); <b>CRDTs</b> make merges work in any order (great offline/peer-to-peer).`,
        `Version history is the <b>edit log + snapshots</b>; cursors use a separate throttled channel.`])]
  ],
  code: null, prac: [],
  qs: [SQ('Why route all edits of one document through a single owning server?', ['To save bandwidth', 'To give edits one agreed order so merges converge, without a slow group agreement on every keystroke', 'Because WebSockets require it', 'To encrypt the document'], 1, 'A single sequencer per document is what makes ordering and transformation tractable.'),
    SQ('Why does each client apply your keystroke locally before the server confirms it?', ['To reduce server load', 'So typing feels instant; the behind-the-scenes merge still makes every copy converge afterward', 'Because the server is unreliable', 'To avoid using a log'], 1, '“Act locally now, agree globally soon” gives instant feel without sacrificing convergence.')]
});

/* ---------------- File sync (Dropbox) ---------------- */
SDX('case-dropbox', { name: 'Design file sync (Dropbox)', cat: 'sdcase',
  blurb: `We’re building the service that keeps a folder identical across your laptop, your phone, and the web — so a file you change on one device appears on the others in seconds. The clever parts: upload only the bit that actually changed (not the whole file), store identical content just once, and sort out what happens when two devices edit the same file.`,
  facts: [['Users', '≈ 500 million'], ['Total data', 'enormous (exabytes)'], ['Files are cut into', '≈ 4 MB chunks'], ['How duplicates are spotted', 'by a fingerprint of each chunk']],
  dg: { w: 900, h: 380,
    n: [['cl', 'Your laptop', 90, 190, 'client', 'watches + chunks'], ['api', 'Metadata API', 330, 85, 'svc', 'the file list'], ['blk', 'Chunk service', 330, 295, 'svc', 'the file contents'], ['mdb', 'Metadata DB', 580, 85, 'db', 'files · versions · chunk lists'],
      ['s3', 'Chunk store', 580, 295, 'store', 'named by fingerprint'], ['nt', 'Notifier', 800, 85, 'svc', 'tells devices'], ['dev', 'Your phone', 800, 295, 'client']],
    e: [['cl', 'blk', 'changed chunks'], ['blk', 's3', 'store if new'], ['cl', 'api', 'commit version'], ['api', 'mdb', ''], ['api', 'nt', 'something changed', 'd'], ['nt', 'dev', 'come sync'], ['dev', 's3', 'fetch chunks', 'd']] },
  cap: `Files are split into chunks, each named by a fingerprint of its content. A device uploads only the chunks the server doesn’t already have, then records a new version listing all the file’s chunks. Other devices are told “something changed,” grab the new chunk list, and download only the chunks they’re missing.`,
  walk: [[['cl'], `You save a 40 MB slide deck. The laptop app notices the change, splits the file into 4 MB <b>chunks</b>, and computes a <b>fingerprint</b> (a hash) of each chunk.`],
    [['cl', 'blk', 'cl>blk'], `It asks the server “which of these fingerprints do you already have?” Say only 2 chunks actually changed — the other 8 are already stored (from the previous version, or even from someone else’s identical file).`],
    [['blk', 's3', 'blk>s3'], `Only the 2 new chunks are uploaded (resumably, so a dropped connection doesn’t restart everything) and stored under their fingerprint. Identical content is never stored twice.`],
    [['cl', 'api', 'api>mdb', 'cl>api'], `The laptop <b>commits</b>: “deck.pptx, version 7 = [chunk1, chunk2, … chunk10], based on version 6.” The metadata database accepts it <i>if</i> version 6 is still the latest (that check is how conflicts are caught).`],
    [['api', 'nt', 'api>nt'], `The metadata service announces that this user’s folder changed.`],
    [['nt', 'dev', 'nt>dev'], `Your phone, which keeps a waiting connection open, wakes up and asks “what changed since I last checked?”`],
    [['dev', 's3', 'dev>s3'], `It downloads only the chunks it doesn’t already have and rebuilds the file. Done — both devices match.`]],
  sections: [
    ['What are we building?', PLAIN(`File sync keeps a set of folders <b>identical</b> across all your devices and the web. Change a file anywhere and the change propagates everywhere, quickly and reliably — even over flaky connections, and even if two devices change things at once. The non-obvious insight is that re-uploading whole files would be madly wasteful, so the whole design is about moving and storing only what truly changed.`) +
      ANALOGY(`Imagine a book that exists in several houses, and you want every copy to stay word-for-word the same. Instead of mailing the entire book whenever you fix a typo, you tear each book into numbered pages, and only mail the <b>pages that changed</b>. A central library keeps one copy of every distinct page, labelled by what’s printed on it — so if two books share a page, it’s only stored once. To rebuild a book, you just need its list of page labels.`)],
    ['Words you’ll need', KEYTERMS([
      ['Chunk', 'A file is split into pieces (around 4 MB). We sync pieces, not whole files, so a small edit moves only a piece or two.'],
      ['Content hash / fingerprint', 'A short code computed from a chunk’s exact contents. Two chunks with the same contents get the same fingerprint — which is how we spot duplicates.'],
      ['Deduplication (dedupe)', 'Storing identical content only once. Because chunks are named by fingerprint, duplicates across versions and even across users collapse into one stored copy.'],
      ['Metadata vs blocks', 'Two separate things: the <b>metadata</b> (the list of your files, their versions, and which chunks make each one) and the <b>blocks</b> (the actual chunk contents). Splitting them lets each scale on its own.'],
      ['Commit', 'Recording a new version of a file as “this ordered list of chunk fingerprints, based on the previous version.”'],
      ['Conflict', 'When two devices both change a file from the same starting version — the system must resolve this without silently throwing an edit away.']])],
    ['The big idea: sync pieces, not files', WHY(`Re-uploading a 40 MB file because you changed one slide would waste bandwidth and time. So files are split into <b>chunks</b>, each named by a <b>fingerprint</b> of its content. To sync, a device just asks “which of these fingerprints are new to you?” and uploads only those. Naming chunks by content gives two gifts at once: <b>deduplication</b> (identical chunks — across your own versions or even other users — are stored a single time) and <b>integrity</b> (on download you can re-check the fingerprint to be sure the chunk arrived uncorrupted).`) +
      PP(`A refinement: instead of cutting at fixed 4 MB boundaries (where inserting one byte at the start would shift every later boundary and change every chunk), smart sync cuts boundaries based on the content itself, so a small insertion changes only a chunk or two.`)],
    ['Two services, because metadata and data behave differently', BSTEPS([
      ['The chunk (block) service', PP(`Handles the heavy, dumb job: “store this chunk,” “do you have this fingerprint?,” “give me this chunk.” Backed by cheap bulk storage that keeps one copy per unique fingerprint.`)],
      ['The metadata service', PP(`Handles the brainy, small job: the tree of folders and files, each file’s version history, and the chunk list for every version. This is the hot path, so it’s sharded by user/folder so one folder’s history lives together.`)],
      ['The notifier', PP(`Holds a waiting connection from each device and pokes it the moment something in its folders changes, so sync feels near-instant instead of relying on slow periodic checks.`)]])],
    ['Handling conflicts (without losing edits)', PP(`Every commit says which version it’s based on. If someone else committed in between, your commit is rejected — the server never lets two people’s edits silently overwrite each other.`) +
      UL([`For ordinary files, the client keeps <b>both</b>: your version and a “Ana’s conflicted copy,” so no edit is ever lost — a human decides.`,
        `Renames and moves are recorded as <b>metadata</b> changes, so they don’t needlessly re-upload the file’s contents.`,
        `After being offline, a device sends a “here’s where I left off” marker and receives just the changes since then.`]),
      RECAP([
        `File sync keeps folders identical across devices by moving and storing only what actually changed.`,
        `Files are split into <b>chunks</b> named by a <b>content fingerprint</b>; a device uploads only chunks the server lacks, giving free <b>deduplication</b> and integrity checks.`,
        `<b>Metadata</b> (file list, versions, chunk lists) and <b>block</b> storage (chunk contents) are separate services because they scale differently; metadata is sharded by user/folder.`,
        `A <b>commit</b> records a new version as a list of chunk fingerprints “based on version N”; a <b>notifier</b> pushes changes to other devices for near-instant sync.`,
        `<b>Conflicts</b> are caught by the “based on version N” check and resolved by keeping both copies — never by silently overwriting.`])]
  ],
  code: null, prac: [],
  qs: [SQ('Why name each chunk by a fingerprint (hash) of its contents?', ['The names are shorter', 'Identical chunks automatically collapse to one stored copy (dedupe), and you can verify a chunk downloaded correctly', 'The fingerprint encrypts the data', 'It keeps files sorted'], 1, 'Content addressing gives deduplication and integrity verification for free.'),
    SQ('How does the system catch a conflict when two devices edit the same file?', ['It compares timestamps', 'Each commit says which version it is based on; if someone committed in between, the commit is rejected and both copies are kept', 'It locks the file for one device', 'It merges the bytes automatically'], 1, 'The “based on version N” check prevents silent overwrites; conflicts become “conflicted copies.”')]
});

/* ---------------- Ticket booking (Ticketmaster) ---------------- */
SDX('case-tickets', { name: 'Design ticket booking (Ticketmaster)', cat: 'sdcase',
  blurb: `We’re building the system that sells seats for a wildly popular concert — where 10 million fans all pounce in the same minute for 50,000 seats. It must <b>never</b> sell the same seat twice, stay standing under an enormous sudden rush, and be fair about who actually gets to buy.`,
  facts: [['Fans at on-sale', '≈ 10 million'], ['Seats available', '≈ 50,000'], ['How long a seat is held', '≈ 10 minutes'], ['Overselling', 'never, under any circumstances']],
  dg: { w: 860, h: 400,
    n: [['u', 'Fan', 80, 200, 'user'], ['cdn', 'CDN', 270, 70, 'cdn', 'event page · seat map'], ['wr', 'Waiting room', 270, 320, 'gw', 'virtual queue'], ['bk', 'Booking service', 500, 200, 'svc', 'holds seats'],
      ['rd', 'Seat holds', 740, 90, 'cache', 'expire after 10 min'], ['db', 'Inventory DB', 740, 310, 'db', 'the truth: seats · orders'], ['pay', 'Payments', 500, 355, 'ext']],
    e: [['u', 'cdn', 'browse'], ['u', 'wr', 'join queue'], ['wr', 'bk', 'let in a batch'], ['bk', 'rd', 'hold seat'], ['bk', 'db', 'confirm sold'], ['bk', 'pay', 'charge']] },
  cap: `The event page and seat map come from the CDN so the rush barely touches your servers. A waiting room lets fans in a few thousand at a time — only as fast as checkout can cope. A chosen seat is held with a lock that expires on its own, and it’s only marked SOLD in the database, guarded by a hard rule, after payment succeeds.`,
  walk: [[['u', 'cdn', 'u>cdn'], `Before the sale, fans load the event page and seat map from the <b>CDN</b> (cached copies near them), so your own servers aren’t swamped just by people looking.`],
    [['u', 'wr', 'u>wr'], `At on-sale time, everyone is put into a <b>waiting room</b> and given a <b>random</b> place in line (randomising is fairer than rewarding whoever’s bot clicks fastest).`],
    [['wr', 'bk', 'wr>bk'], `The waiting room releases fans in small batches — only as fast as checkout can actually handle — each with a short-lived pass.`],
    [['bk', 'rd', 'bk>rd'], `A fan picks a seat. The booking service places a <b>hold</b>: a lock that succeeds only if nobody else holds that seat, and that <b>expires by itself</b> after 10 minutes if they don’t finish.`],
    [['bk', 'pay', 'bk>pay'], `The fan pays within that window (safely, so a retry can’t double charge).`],
    [['bk', 'db', 'bk>db'], `On payment success, the seat is marked SOLD in the inventory database — guarded by a rule that only lets it go from AVAILABLE to SOLD once. Even a bug elsewhere physically cannot oversell it.`]],
  sections: [
    ['What are we building?', PLAIN(`A ticketing system sells a fixed, small number of seats to a possibly <b>enormous</b> crowd arriving all at once. The volume of actual sales is tiny (50,000 seats), but the volume of <b>people trying</b> is staggering (millions in a minute), and they’re all fighting over the <b>same</b> seats. So the two real enemies are the traffic spike and the contention — many people reaching for one seat at the same instant.`) +
      ANALOGY(`Think of a tiny box office with 50,000 tickets and a crowd of millions stampeding the doors. If you let everyone in at once, the office is crushed and chaos decides who gets served. Instead you set up a <b>roped-off queue</b> outside, let people in a manageable handful at a time, and when someone reaches the counter you put their chosen ticket <b>on hold</b> for ten minutes while they pay. If they dawdle, the hold drops and the ticket goes back. And the ledger at the counter is the final word — a ticket can only be stamped “sold” once.`)],
    ['Words you’ll need', KEYTERMS([
      ['Waiting room (virtual queue)', 'A holding area that lets fans through to checkout a controlled few thousand at a time, so the downstream systems are never overwhelmed.'],
      ['Seat hold', 'A temporary reservation on a seat while a fan pays — it stops anyone else grabbing it, and it expires on its own if they don’t finish.'],
      ['Lock (mutual exclusion)', 'A “this is taken” marker that only one person can obtain at a time, so two fans can’t both grab the same seat.'],
      ['Overselling', 'Selling the same seat to two people — the one thing that must never happen, no matter what breaks.'],
      ['CDN', 'The network of edge caches that serves the (unchanging) event page and seat map to millions, keeping that load off your servers.'],
      ['Database constraint', 'A hard rule enforced by the database itself (e.g. “a seat can be sold only once”). It’s the final, unbreakable guard against overselling.']])],
    ['Enemy 1 — the traffic spike', WHY(`Millions of people loading the event page and refreshing the seat map would flatten your servers before a single ticket sold. Two defences handle it: serve all the <b>unchanging</b> stuff (event page, seat map images) from the <b>CDN</b> so your origin barely notices; and put everyone through a <b>waiting room</b> that admits fans only as fast as checkout can truly process (maybe a few thousand a second). The waiting room is mostly static pages plus a pass-issuing service, so it scales easily — it absorbs the stampede so the fragile parts never see it.`)],
    ['Enemy 2 — never sell a seat twice', PP(`This is the correctness heart of the design, and it uses <b>two</b> layers working together:`) +
      BSTEPS([
        ['Layer 1 — expiring holds (for the experience)', PP(`When a fan selects a seat, place a <b>hold</b>: a lock in a fast store that succeeds only if the seat is free and <b>auto-expires</b> after ~10 minutes. This gives the fan time to pay and automatically frees abandoned seats — no cleanup job needed.`)],
        ['Layer 2 — a database rule (for correctness)', PP(`When payment succeeds, mark the seat SOLD with a <b>conditional update</b> (“set to SOLD only if it’s currently AVAILABLE or held by this fan”) plus a <b>unique constraint</b>. This is the unbreakable guard: even if the fast-store hold were lost or buggy, the database physically refuses to sell the same seat twice.`)]]) +
      PLAIN(`The pattern worth remembering: the fast hold makes the <b>experience</b> smooth; the database constraint makes it <b>correct</b>. Never rely on the cache alone for correctness.`)],
    ['Enemy 3 — fairness, and the rest', UL([
      `<b>Fairness:</b> randomise positions in the first rush rather than rewarding the fastest clicker (which just rewards bots); add verified-fan presale codes, CAPTCHAs, and per-account/per-card ticket limits.`,
      `<b>General-admission</b> (no seat numbers) is modelled as a <b>counter</b> you atomically decrement, rather than individual seat locks.`,
      `<b>Seat-map freshness:</b> push availability updates or poll every few seconds, rather than hitting the database on every view.`,
      `<b>Pre-scale</b> everything before a known on-sale time — this is a planned spike, so there’s no excuse to be caught small.`]),
      RECAP([
        `Ticketing sells a tiny number of seats to a massive simultaneous crowd; the enemies are the <b>traffic spike</b> and <b>contention</b> over the same seats.`,
        `Tame the spike by serving static pages/seat maps from the <b>CDN</b> and funnelling fans through a <b>waiting room</b> that admits only as fast as checkout can handle.`,
        `Prevent double-selling with <b>two layers</b>: an auto-expiring <b>hold</b> for a smooth experience, and a database <b>conditional update + unique constraint</b> as the unbreakable correctness guard.`,
        `Be <b>fair</b> by randomising the rush and limiting per account; model general admission as an atomic counter.`,
        `It’s a planned spike — <b>pre-scale</b> and keep the seat map fresh via push/polling, not per-view database hits.`])]
  ],
  code: null, prac: [],
  qs: [SQ('Why hold a seat with a lock that expires on its own after ~10 minutes?', ['To encrypt the seat', 'It reserves the seat only if nobody else holds it, and automatically frees it if the fan never finishes paying — no cleanup job needed', 'Because it is faster than reading', 'The store requires expiry times'], 1, 'The “only if free” part gives mutual exclusion; the auto-expiry releases abandoned seats.'),
    SQ('What ultimately guarantees a seat can never be sold to two people, even if the cache misbehaves?', ['The CDN', 'A conditional update plus a unique constraint in the inventory database — the final, unbreakable source of truth', 'The waiting room', 'The fan’s browser'], 1, 'Caches and queues ease contention, but only the database constraint guarantees correctness.')]
});
