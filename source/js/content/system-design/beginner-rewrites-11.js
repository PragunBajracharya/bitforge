/* ===== Beginner-first rewrites — batch 11 (concept topics: two-phase commit, sagas, idempotency/outbox, bloom, sketches). SDPATCH. ===== */

SDPATCH('twopc', {
  blurb: `Two-phase commit (2PC) makes a single transaction span several databases, all-or-nothing. A <b>coordinator</b> first asks every participant to <i>prepare</i> (promise they can commit), and only if <b>all</b> say yes does it tell them to <i>commit</i>. It’s correct, but slow and fragile: a participant that said yes is stuck waiting (holding locks) if the coordinator vanishes.`,
  sections: [
    ['What is this trying to do?', PLAIN(`Within one database, a transaction is naturally all-or-nothing. But what if one business action must update <b>two separate databases</b> — charge a payment in one and reserve stock in another — and you need both or neither? Two-phase commit is the classic protocol for that: a coordinator runs a careful two-step handshake so the two databases either both commit or both abort, even across crashes.`) +
      ANALOGY(`It’s organising a dinner where everyone must be able to make it or it’s cancelled. <b>Phase 1 (prepare):</b> the organiser phones each friend — “can you definitely make Friday? Block it off.” Each friend checks, blocks their calendar, and says yes or no. <b>Phase 2 (commit):</b> only if <i>everyone</i> said yes does the organiser call back “it’s on!” The catch: after a friend has blocked their calendar and said yes, if the organiser’s phone dies, that friend is stuck — calendar blocked, unable to decide alone whether the dinner is on.`)],
    ['Words you’ll need', KEYTERMS([
      ['Coordinator', 'The component that runs the protocol and makes the final commit/abort decision.'],
      ['Participant', 'Each database/service taking part in the transaction.'],
      ['Prepare phase', 'Phase 1: every participant does the work, locks the rows, and promises it <i>can</i> commit (votes yes/no).'],
      ['Commit phase', 'Phase 2: if all voted yes, the coordinator tells everyone to commit; otherwise, to abort.'],
      ['Blocking', 'The fatal flaw: a participant that voted yes must wait (holding locks) for the decision if the coordinator dies.'],
      ['XA', 'The standard for 2PC across different databases/brokers — correct in theory, painful in practice.']])],
    ['The two phases', BSTEPS([
      ['Prepare (collect promises)', PP(`The coordinator asks each participant “can you commit your part?” Each does the work, writes it durably, <b>locks</b> the affected rows, and votes YES (after which it may not change its mind) or NO.`)],
      ['Decide and commit', PP(`The coordinator records its decision durably (commit if all said yes, otherwise abort) — that record <i>is</i> the commit point — then tells every participant to commit (make changes visible, release locks) or abort.`)]]) +
      PP(`Because everyone promises before anyone commits, and the single decision is logged before it’s sent, the outcome is the same everywhere even across crashes — a recovering participant just asks the coordinator what was decided.`)],
    ['Why people avoid it (and where it fits)', WHY(`The deal-breaker is <b>blocking</b>: if the coordinator crashes <i>after</i> participants voted yes but <i>before</i> it sends the decision, those participants can’t safely decide alone — the coordinator might have chosen either way — so they sit holding their locks until it recovers. On top of that, 2PC needs multiple round trips and forced log writes (slow), and it aborts if <i>any</i> participant is down (so overall availability is the product of everyone’s). That’s why between independent microservices people prefer <b>sagas</b>. 2PC works well only <i>inside</i> distributed databases (Spanner, CockroachDB) where the system controls all participants and makes the coordinator itself fault-tolerant with consensus (Raft/Paxos), so no single machine can block it.`) +
      RECAP([
        `Two-phase commit makes one transaction span several databases all-or-nothing, via a coordinator.`,
        `<b>Phase 1 (prepare):</b> participants lock rows and promise to commit; <b>phase 2 (commit):</b> if all said yes, everyone commits, else everyone aborts.`,
        `It’s correct across crashes (the logged decision is authoritative) but <b>blocking</b>: a yes-voter holds locks until the coordinator recovers.`,
        `Also slow (round trips + log writes) and fragile (any participant down → abort), so independent microservices use <b>sagas</b> instead.`,
        `It shines <i>inside</i> distributed databases that control all participants and make the coordinator fault-tolerant with consensus.`])]
  ]
});

SDPATCH('saga', {
  blurb: `A saga carries out a business transaction that spans several services as a <b>sequence of local transactions</b> — each service commits its own step independently. If a later step fails, the earlier steps are undone by <b>compensating actions</b> (refund the payment, release the stock). It trades the clean isolation of a single transaction for availability and loose coupling.`,
  sections: [
    ['What is a saga?', PLAIN(`Sometimes a single action — placing an order — must touch several services: payment, inventory, shipping. Two-phase commit across them would be slow and fragile, so instead you run a <b>saga</b>: each service does its bit as its own normal transaction, one after another. There’s no global rollback; if step 3 fails, you explicitly <b>undo</b> steps 2 and 1 by running “compensating” actions that reverse them.`) +
      ANALOGY(`Think of booking a holiday yourself: book the flight, then the hotel, then the rental car — each a separate confirmed booking. If the car falls through, there’s no magic “undo the whole trip” button. You manually <b>compensate</b>: cancel the hotel, then cancel (and get refunded for) the flight, working backwards. A saga is exactly this — a chain of committed steps, each with a matching “undo” you run in reverse if something later fails.`)],
    ['Words you’ll need', KEYTERMS([
      ['Local transaction', 'One step done entirely within a single service’s own database — committed on its own.'],
      ['Compensating action', 'The explicit “undo” for a completed step: refund a charge, release a reservation. Not a database rollback.'],
      ['Orchestration', 'A central coordinator tells each service what to do next (easy to see and change).'],
      ['Choreography', 'No coordinator — each service reacts to events from the others (looser, but flow is scattered).'],
      ['Pivot step', 'The point of no return; steps that can’t be undone (like sending an email) go after it.'],
      ['Isolation (what you give up)', 'Because each step commits separately, others can briefly see intermediate states.']])],
    ['Orchestration vs choreography', TBL(['', 'Orchestration', 'Choreography'], [
      ['Who drives it', 'A central orchestrator directs each step', 'Each service reacts to events'],
      ['Visibility', 'Whole flow in one place — easy to monitor', 'Flow scattered across services'],
      ['Coupling', 'Orchestrator knows all steps', 'Looser, but event chains can get tangled'],
      ['Tools', 'Temporal, AWS Step Functions', 'Kafka / a message bus']])],
    ['Designing the undos (and what you give up)', PP(`The heart of a saga is designing good <b>compensating actions</b>:`) +
      UL([`Each step needs a <i>semantic</i> undo — <b>refund</b> a payment (not delete it), <b>release</b> a reservation, send a cancellation.`,
        `Compensations must be <b>idempotent and retryable</b> (they may be delivered more than once).`,
        `Some actions genuinely can’t be undone (an email already sent) — put those <b>last</b>, after the steps that might fail.`]) +
      WHY(`The price of a saga is <b>isolation</b>: because each step commits on its own, other transactions can briefly see an in-between state (an order charged but not yet shipped), or act on data a later compensation will reverse. You soften this with “semantic locks” — mark records as PENDING/APPROVED so others know a step is in flight — and by ordering the risky steps first. For reliability, each step’s write and its outgoing event must be saved together (the transactional outbox), and the saga’s progress must be stored durably so a crashed orchestrator resumes; workflow engines like Temporal give you that out of the box.`) +
      RECAP([
        `A saga runs a cross-service transaction as a <b>sequence of local transactions</b>, each committed independently.`,
        `There’s no global rollback — a failed step triggers <b>compensating actions</b> that semantically undo earlier steps in reverse.`,
        `Two styles: <b>orchestration</b> (central coordinator, easy to see) and <b>choreography</b> (event-driven, looser).`,
        `Compensations must be idempotent; un-undoable actions go after the <b>pivot</b> step; mark records PENDING to manage visibility.`,
        `You give up <b>isolation</b> (intermediate states are visible); make it reliable with the outbox pattern and durable saga state (e.g. Temporal).`])]
  ]
});

SDPATCH('idempotency', {
  blurb: `Networks and queues deliver messages <b>at least once</b>, so duplicates are a normal fact of life. You get “exactly-once <i>effects</i>” from two patterns working together: <b>idempotent consumers</b> (processing a message twice gives the same result as once) and the <b>transactional outbox</b> (you never lose an event when you save data).`,
  sections: [
    ['What problem are we solving?', PLAIN(`In distributed systems, the same message often arrives twice — a sender that didn’t get an acknowledgment retries, a queue redelivers after a worker crash. True “exactly-once delivery” is impossible in general (you can’t tell a lost message from a lost acknowledgment). So instead of trying to prevent duplicates, you make them <b>harmless</b>: design handlers so doing the work twice has the same effect as once, and make sure an event is never silently lost when you save the data that triggered it.`) +
      ANALOGY(`Imagine a mailroom clerk who’s told “post this invoice” — but the instruction sometimes comes through twice because of a bad phone line. If he just posts whatever he’s told, customers get two invoices. So he keeps a <b>logbook of invoice IDs already sent</b>: when an instruction arrives, he checks the book, and if that ID is already there, he does nothing. Duplicates become harmless. The outbox is the companion habit: he writes “to post: invoice #42” in the <i>same</i> ledger entry where he records the sale, so an instruction can never go missing.`)],
    ['Words you’ll need', KEYTERMS([
      ['At-least-once delivery', 'The realistic guarantee: messages are never lost, but may arrive more than once.'],
      ['Idempotent', 'Safe to do repeatedly — the second (and third…) time changes nothing.'],
      ['Dedupe table', 'A record of processed message IDs (with a unique constraint) so a repeat is detected and skipped.'],
      ['Dual-write problem', 'The bug where “save to DB, then publish an event” can crash in between — data saved, event lost (or vice versa).'],
      ['Transactional outbox', 'Writing the event into an “outbox” table in the <i>same</i> transaction as the data, then relaying it reliably.'],
      ['Exactly-once effects', 'The achievable goal: at-least-once delivery + idempotent handling = the effect happens once.']])],
    ['The dual-write problem and the outbox', WHY(`A tempting approach — “save the order, then publish an OrderPlaced event” — has a hole: if the process crashes between the two, the order exists but nobody is told (and “publish then save” fails the other way). You usually can’t wrap a database and a message broker in one transaction. The <b>outbox pattern</b> fixes it: write the order <i>and</i> an outbox row in one local transaction (both or neither), then a separate relay reads new outbox rows and publishes them, retrying on crash. That gives at-least-once publishing with nothing ever lost — the duplicates are then handled on the consumer side.`)],
    ['Making consumers idempotent', TBL(['Technique', 'How'], [
      ['Dedupe table', 'Store processed message IDs with a unique constraint, in the same transaction as the effect'],
      ['Natural idempotency', 'Use set-style ops: "SET status = PAID" instead of "balance += 40"'],
      ['Conditional writes', 'UPDATE … WHERE version = 7 — a replay of an old message does nothing'],
      ['Idempotency keys', 'For external APIs (payments), pass a key the provider deduplicates on']]) +
      PP(`Put together: give every message a unique ID at creation, make every handler safe to run twice, and store the side effect and the dedupe record <b>atomically</b> (same transaction) so a crash can’t record one without the other.`) +
      RECAP([
        `Delivery is <b>at-least-once</b>, so duplicates are normal; true exactly-once <i>delivery</i> is impossible — aim for exactly-once <i>effects</i>.`,
        `Make consumers <b>idempotent</b>: dedupe by message ID, use set-style/conditional writes, or idempotency keys for external APIs.`,
        `The <b>dual-write problem</b> (save then publish can crash in between) is solved by the <b>transactional outbox</b>.`,
        `Outbox: write data + event in one transaction; a relay publishes outbox rows reliably (at-least-once), consumers dedupe the repeats.`,
        `Checklist: unique message ID, handler safe to rerun, side effect + dedupe record saved atomically.`])]
  ]
});

SDPATCH('bloom', {
  blurb: `A Bloom filter is a tiny structure that answers “have I seen this key before?” using a small array of bits and a few hash functions. Its quirk: it can say “<b>maybe</b> yes” when the answer is actually no (a false positive), but it <b>never</b> says no when the answer is yes. That one-sided guarantee makes it perfect for skipping expensive lookups for things that definitely aren’t there.`,
  sections: [
    ['What is a Bloom filter?', PLAIN(`A Bloom filter is a space-saving way to test membership — “is this item in the set?” — without storing the items themselves. It uses a fixed array of bits. To add an item, you flip a few bits on (chosen by hashing the item). To check an item, you look at those same bits: if any is still off, the item was <b>definitely never added</b>; if all are on, it’s <b>probably</b> been added (but might be a coincidence). So it trades a small, tunable error rate for enormous memory savings.`) +
      ANALOGY(`Think of a nightclub bouncer with a tiny crib-sheet instead of the full guest list. The sheet lets him say, instantly, “you are <b>definitely not</b> on the list” (turn you away, no need to check the big list) — or “you <b>might</b> be on it, let me go check the real list inside.” He’s never wrong when he turns someone away, but he occasionally sends a non-guest to be double-checked. That’s a Bloom filter: a cheap “definitely-no / maybe-yes” pre-check in front of an expensive lookup.`)],
    ['Words you’ll need', KEYTERMS([
      ['Bit array', 'A row of bits (0/1), all starting at 0 — the filter’s entire storage.'],
      ['Hash functions', 'The k functions that map an item to k positions in the array.'],
      ['False positive', '“Maybe present” when it’s actually absent — possible, and tunable (e.g. 1%).'],
      ['False negative', '“Absent” when it’s actually present — <b>never</b> happens. This one-sided guarantee is the whole point.'],
      ['Membership test', 'The question it answers: “might this item be in the set?”']])],
    ['How it works', BSTEPS([
      ['Add an item', PP(`Hash it with the k functions to get k positions, and set those bits to 1. Bits only ever turn on, never off.`)],
      ['Check an item', PP(`Hash it the same way and look at its k positions. If <b>any</b> bit is 0, it was never added — a definite no. If <b>all</b> are 1, it’s probably present (though other items might have set those bits), so do the real lookup to be sure.`)],
      ['Why no deletes', PP(`You can’t just clear a bit to remove an item — that bit might also be “in use” by another item. (Counting Bloom filters or cuckoo filters add deletion if you need it.)`)]])],
    ['Sizing and where it’s used', PP(`It’s remarkably compact: roughly <b>10 bits per item</b> gives a 1% false-positive rate, so a filter covering 100 million keys is about 120 MB — far smaller than the keys themselves. More bits (and more hash functions) lower the error rate.`) +
      WHY(`The guarantee shapes where it fits: use a Bloom filter wherever a false positive merely costs an extra lookup, never where it would produce a wrong answer. Real uses: LSM-tree databases (Cassandra, RocksDB) keep one per file so a read can skip files that definitely don’t contain the key; caches use one to avoid storing “one-hit wonders” and to block lookups for keys that don’t exist; web crawlers track visited URLs; browsers have checked URLs against a local filter before asking a server. In every case it’s a cheap gate in front of something expensive.`) +
      RECAP([
        `A Bloom filter tests set membership using a small <b>bit array</b> and k hash functions, storing far less than the items themselves.`,
        `It’s <b>one-sided</b>: “definitely not present” is always true; “probably present” may be a <b>false positive</b> — but there are <b>no false negatives</b>.`,
        `Add = set k bits; check = all k bits set? Plain Bloom filters can’t delete (a bit may be shared).`,
        `It’s tiny (~10 bits/key for 1% error) and used to <b>skip expensive lookups</b> for things that definitely aren’t there.`,
        `Use it only where a false positive just costs an extra check, never where it would cause a wrong answer (LSM databases, caches, crawlers).`])]
  ]
});

SDPATCH('sketches', {
  blurb: `At huge scale, counting things exactly is expensive. Probabilistic <b>sketches</b> give approximate answers in tiny, fixed memory: a <b>count-min sketch</b> estimates how often each item appears (for finding the “heavy hitters”), and <b>HyperLogLog</b> estimates how many <i>distinct</i> items there are (unique visitors) — about 1% error in just 12 KB, for billions of items.`,
  sections: [
    ['Why approximate counting?', PLAIN(`Suppose you want “how many unique visitors today?” or “which URLs are trending?” over billions of events. Counting exactly means remembering every distinct ID (gigabytes) or a counter per item (and keeping them hot). Often you don’t need the exact number — “about 48 million, ±1%” is perfectly good for a dashboard. Sketches exploit that: they use a <b>fixed, tiny</b> amount of memory no matter how big the stream, accepting a small, known error.`) +
      ANALOGY(`It’s how you’d size up a crowd without counting heads. To estimate <b>how many people</b> are at a rally, you don’t tally each one — you glance at the density and area and say “roughly 50,000.” To find <b>the most common chant</b>, you don’t transcribe everyone — you sample what you hear. Sketches do this mathematically: a great estimate from a tiny, fixed amount of “looking,” instead of recording everything.`)],
    ['Words you’ll need', KEYTERMS([
      ['Sketch', 'A small, fixed-size structure that answers a counting question approximately.'],
      ['Count-min sketch', 'Estimates how often each item appears (frequencies). Only ever overestimates.'],
      ['Heavy hitters', 'The most frequent items (trending pages, abusive IPs) — what count-min helps find.'],
      ['HyperLogLog (HLL)', 'Estimates the count of <i>distinct</i> items (cardinality), e.g. unique visitors.'],
      ['Cardinality', 'The number of distinct values in a set.'],
      ['Mergeable', 'Two sketches combine into one covering both streams — so daily sketches roll up into weekly.']])],
    ['The two workhorses', PP(`<b>Count-min sketch</b> is a small grid of counters with several hash functions. To record an item, you bump one counter in each row (chosen by hashing). To estimate its count, you read those counters and take the <b>minimum</b>. Collisions can only <i>add</i> other items’ increments, so the estimate never falls below the true count, and the minimum strips away as much collision noise as possible. Pair it with a small heap and you have live “top-K” (trending hashtags, top URLs).`) +
      PP(`<b>HyperLogLog</b> estimates <i>distinct</i> counts. It hashes each item and tracks the longest run of leading zeros seen (across many small registers). Long zero-runs are rare, so the longest one hints at how many distinct values went by. With ~16,384 registers it hits ~0.8% error in <b>12 KB</b> — versus gigabytes to count a billion IDs exactly. Redis implements it as PFADD/PFCOUNT/PFMERGE.`)],
    ['When to use them (and when not)', WHY(`Both are <b>mergeable</b>, which is a superpower: compute a sketch per shard or per hour, then merge them to get the whole picture — daily HyperLogLogs combine into a weekly unique-visitor count with no recounting. Use sketches for analytics, monitoring and abuse detection, where ~1% error is fine and storing everything is the expensive alternative. <b>Never</b> use them for anything that must be exact — billing, financial counts — where even a tiny error is unacceptable. A common design pairs approximate real-time numbers from sketches with exact numbers from a slower nightly batch job.`) +
      RECAP([
        `Sketches give approximate counts in <b>tiny, fixed memory</b>, regardless of stream size, by accepting a small known error.`,
        `<b>Count-min sketch</b> estimates per-item frequencies (never underestimates) — great for finding <b>heavy hitters</b>/trending items.`,
        `<b>HyperLogLog</b> estimates <b>distinct</b> counts (unique visitors) at ~0.8% error in ~12 KB, vs gigabytes for an exact count.`,
        `Both are <b>mergeable</b>, so per-shard/per-hour sketches roll up into totals without recounting.`,
        `Use them for analytics/monitoring where ~1% error is fine; never for billing or anything that must be exact.`])]
  ]
});
