/* ===== Beginner-first rewrites — batch 2 (case studies). Loads after originals, overrides them. ===== */

/* ---------------- Distributed key-value store ---------------- */
SDX('case-kv', { name: 'Design a distributed key-value store', cat: 'sdcase',
  blurb: `We’re going to build a giant “dictionary” — you give it a key and a value with put(key, value), and later get it back with get(key) — except it’s spread across hundreds of computers, it never refuses a write, and it survives machines (even a whole data centre) dying. This is how real stores like Amazon’s Dynamo and Cassandra work. It’s an advanced topic, so we’ll take it slowly and define everything.`,
  facts: [['What it does', 'put(key, value) / get(key)'], ['Copies of each item', '3 (so losing machines is fine)'], ['Keeps running when', 'nodes or a whole data centre fail'], ['Real examples', 'Amazon Dynamo, Cassandra']],
  dg: { w: 780, h: 390,
    c: [[330, 195, 140]],
    n: [['A', 'Node A', 330, 55, 'db'], ['B', 'Node B', 451, 125, 'db', 'handles this key'], ['C', 'Node C', 451, 265, 'db', 'copy 2'], ['D', 'Node D', 330, 335, 'db', 'copy 3'], ['E', 'Node E', 209, 265, 'db'], ['F', 'Node F', 209, 125, 'db'], ['cl', 'Client', 680, 195, 'client', 'put(“cart:42”)']],
    e: [['cl', 'B', 'save'], ['B', 'C', 'copy'], ['B', 'D', 'copy', 'n'], ['E', 'F', 'gossip', 'dbs'], ['C', 'D', 'sync up', 'dbs', 'ae']],
    t: [['key “cart:42” belongs here → B, C, D', 470, 40, 'start']] },
  cap: `Each key is assigned to a position on a “ring” of nodes; the next three nodes hold copies. Any node can take the request. Nodes constantly chatter (“gossip”) to notice failures, and quietly repair any copies that drift apart.`,
  walk: [[['cl', 'B', 'cl>B'], `You save something: put(“cart:42”, …). The system works out which node “owns” that key — node B — and sends it there.`],
    [['B', 'C', 'D', 'B>C', 'B>D'], `B keeps a copy and forwards it to the next two nodes, C and D, so the item now exists in <b>three</b> places. B replies “saved” as soon as enough copies confirm (it doesn’t wait for all three — more on that below).`],
    [['C', 'D', 'B'], `To read it back, the system asks a couple of the copies. If they disagree (because one missed a recent write), it returns the newest and quietly fixes the out-of-date one.`],
    [['E', 'F', 'E>F'], `Every second, each node whispers to a few random neighbours — “I’m alive, here’s who else I’ve seen.” This <b>gossip</b> spreads news of failures and new machines across the whole cluster in seconds, with no boss node in charge.`],
    [['C', 'D', 'ae'], `If a copy was offline during a write, a stand-in node holds the write and hands it over when the copy returns. In the background, copies compare notes and exchange only the differences, so they heal back into agreement.`]],
  sections: [
    ['What are we building (and why it’s hard)', PLAIN(`A <b>key-value store</b> is the simplest kind of database: it’s just a huge dictionary. The <b>key</b> is a label (like <code>cart:42</code>) and the <b>value</b> is whatever you stored under it (a shopping cart, a user record). Two operations: <code>put</code> to save, <code>get</code> to fetch. The twist is the word <b>distributed</b>: the data is far too big for one computer and must survive machines failing, so it lives on <b>hundreds of computers at once</b> — and that’s where all the interesting problems come from.`) +
      ANALOGY(`Imagine a nationwide chain of locker rooms. You drop a box in a locker and get a number. The clever bit: the system automatically stashes <b>three copies</b> of your box in three different buildings. If one building burns down, your box is still safe in the other two, and you never even notice. A distributed key-value store is that, for data.`) +
      PP(`Once you spread data across many machines, three new questions appear — and the whole design is just good answers to them: <b>(1)</b> which machine holds a given key? <b>(2)</b> what happens when a machine is down? <b>(3)</b> what if two people change the same key at the same time?`)],
    ['Words you’ll need', KEYTERMS([
      ['Node', 'Just one of the computers (servers) in the cluster. We have hundreds of them.'],
      ['Cluster', 'The whole group of nodes working together as one store.'],
      ['Replica / replication', 'A copy of a piece of data. We keep 3 copies (replicas) of everything so losing machines doesn’t lose data.'],
      ['Partition (or shard)', 'A slice of the data. Since it won’t fit on one node, we split it into partitions and spread them out.'],
      ['Consistent hashing', 'The clever rule for deciding which node owns which key, chosen so that adding or removing a machine only shuffles a tiny fraction of the data.'],
      ['Quorum', 'A “voting” rule: how many of the 3 copies must agree before we call a read or write successful.'],
      ['Available (the “A” in AP)', 'The store keeps accepting reads and writes even during failures, rather than going offline. This store chooses availability.']])],
    ['Step 1 — which node holds each key? (consistent hashing)', PP(`We need a rule that maps every key to a node. A naive rule like “node number = key mod 100” breaks horribly the moment you add or remove a machine (almost every key would move). The fix is <b>consistent hashing</b>.`) +
      ANALOGY(`Picture a big clock face (a “ring”). We place each node at some position around the clock. To store a key, we hash it to a position on the clock, then walk <b>clockwise</b> until we hit a node — that node owns the key. In the diagram, <code>cart:42</code> lands just before node B, so B owns it.`) +
      PP(`Why this is clever: when you add a new node, it slots into one spot on the clock and only takes over the slice of keys just behind it — <b>about 1/N of the data moves</b>, not everything. Removing a node is just as gentle. (Real systems give each machine many small positions on the ring, called <b>virtual nodes</b>, so the load spreads evenly.)`)],
    ['Step 2 — keep copies so failures don’t lose data', PP(`Owning a key isn’t enough; if that one node dies, the data is gone. So the owner plus the <b>next two nodes clockwise</b> each keep a copy — that’s <b>3 replicas</b> (we call this N = 3). We deliberately place those three in different racks or availability zones, so even losing a whole data centre leaves copies alive.`)],
    ['Step 3 — reads and writes with “voting” (quorums)', PP(`With 3 copies, a question arises: when you write, must all 3 confirm before we say “done”? Waiting for all 3 is slow and fails if even one copy is down. Waiting for none risks losing data. The middle path is a <b>quorum</b> — a voting rule:`) +
      KEYTERMS([
        ['W (write quorum)', 'How many copies must confirm a write before we call it saved. Common: W = 2.'],
        ['R (read quorum)', 'How many copies we ask on a read. Common: R = 2.'],
        ['The rule R + W > N', 'If reads and writes together always overlap on at least one copy, a read is guaranteed to see the latest write. With N=3, R=2, W=2: 2+2 > 3, so they always overlap.']]) +
      PP(`The beauty is that <b>you can tune it per request</b>: need the freshest possible data? Use a bigger quorum. Need the fastest possible response and can tolerate slight staleness? Use a smaller one. This is the “dial” that trades speed against freshness.`)],
    ['Step 4 — surviving the awkward failures', BSTEPS([
      ['A copy is down when a write arrives', PP(`We don’t reject the write. A different, healthy node temporarily accepts it and keeps a <b>hint</b> — a note saying “this really belongs to node C.” When C comes back, the stand-in hands the data over. This is called <b>hinted handoff</b>, and it’s how the store stays “always writable.”`)],
      ['Two people write the same key at once', PP(`Because any node can accept writes, two conflicting versions can briefly exist. The store keeps a little version history (a <b>vector clock</b>) so it can tell “this version came after that one” from “these two happened at the same time.” If they truly clash, it can keep both and let the app decide, or simply keep the last one (<b>last-write-wins</b>) if the app is fine with that.`)],
      ['Copies drift apart over time', PP(`Occasional lost messages mean copies can slowly diverge. In the background, pairs of replicas compare compact fingerprints of their data (<b>Merkle trees</b>) and exchange <b>only</b> the pieces that differ, instead of shipping everything. This quiet background repair is called <b>anti-entropy</b>.`)],
      ['Knowing who’s alive', PP(`There’s no boss node tracking health. Instead every node <b>gossips</b> — each second it tells a few random peers what it knows about who’s up and who’s down. News spreads to the whole cluster within seconds, and it keeps working no matter how many nodes there are.`)]])],
    ['Trade-offs worth saying out loud', UL([
      `This store favours <b>staying available</b> over being perfectly consistent: during a network split, both sides keep accepting writes, and any conflicts are sorted out afterwards.`,
      `<b>Last-write-wins</b> is simple but can silently drop one of two simultaneous updates; keeping version history avoids that but asks the app to merge.`,
      `<b>Deletes are tricky:</b> you can’t just erase data, or a lagging replica would “resurrect” it later. Instead you mark it deleted with a <b>tombstone</b> that lingers long enough for every copy to get the message.`,
      `A <b>hot key</b> (one wildly popular item) can overload its 3 replicas; cache it or split it.`]),
      RECAP([
        `A distributed key-value store is a giant dictionary spread over many machines that never loses data and never refuses writes.`,
        `<b>Consistent hashing</b> (a ring) decides which node owns each key, so adding/removing machines moves very little data.`,
        `Every item is kept as <b>3 copies</b> across different zones.`,
        `<b>Quorums</b> (R + W > N) let you dial the trade-off between speed and freshness per request.`,
        `<b>Hinted handoff</b> keeps writes flowing when a copy is down; <b>vector clocks</b> handle simultaneous writes; <b>gossip</b> + <b>Merkle-tree repair</b> keep the cluster in sync with no boss node.`])]
  ],
  qs: [SQ('With consistent hashing, what happens to the data when you add one new node to a 100-node cluster?', ['Almost all keys have to move', 'Only about 1/N of the keys move — the slice the new node takes over', 'Nothing moves ever', 'The cluster must restart'], 1, 'That “only a small slice moves” property is the whole point of consistent hashing.'),
    SQ('A copy (replica) is offline exactly when a write comes in. How does the store stay available?', ['It rejects the write', 'A healthy node temporarily holds the write (with a hint) and hands it off when the replica returns', 'It waits for the replica to recover', 'It deletes the key'], 1, 'Hinted handoff keeps writes succeeding through temporary failures.')]
});

/* ---------------- Notification system ---------------- */
SDX('case-notify', { name: 'Design a notification system', cat: 'sdcase',
  blurb: `We’re building the service that sends you push notifications, text messages and emails when things happen — “your order shipped,” a login code, a reminder. It has to handle millions a minute, respect each person’s preferences (and “do not disturb”), never send the same thing twice, and keep working even when an outside service like the SMS provider is having a bad day.`,
  facts: [['Ways to reach people', 'app push, SMS, email, in-app'], ['Busy times', '≈ 1 million notifications a minute'], ['Promise', 'deliver at least once, but no duplicates'], ['Outside helpers', 'Apple/Google push, Twilio, email providers']],
  dg: { w: 840, h: 340,
    n: [['p', 'Your app’s services', 95, 170, 'svc', 'orders · social · login'], ['ns', 'Notification service', 330, 170, 'svc', 'prefs · dedupe · render'], ['pr', 'Preferences & templates', 330, 300, 'db'], ['qp', 'Push queue', 560, 55, 'queue'], ['qs', 'SMS queue', 560, 170, 'queue'], ['qe', 'Email queue', 560, 285, 'queue'], ['ap', 'Apple / Google push', 755, 55, 'ext'], ['tw', 'SMS provider', 755, 170, 'ext'], ['se', 'Email provider', 755, 285, 'ext']],
    e: [['p', 'ns', 'something happened'], ['ns', 'pr', 'check'], ['ns', 'qp'], ['ns', 'qs'], ['ns', 'qe'], ['qp', 'ap', 'workers send'], ['qs', 'tw', 'workers send'], ['qe', 'se', 'workers send']] },
  cap: `When something happens in your app, it tells the notification service, which checks the user’s preferences, avoids duplicates, fills in the message template, and drops it into a separate queue for each channel. Workers then call the outside providers, with retries — so a slow SMS provider never holds up your push notifications.`,
  walk: [[['p', 'ns', 'p>ns'], `Something happens — say an order ships. The order service tells the notification service “notify user 42: order shipped,” tagged with a unique event ID.`],
    [['ns', 'pr', 'ns>pr'], `The notification service does its checks: is this user opted out of SMS? Is it their quiet hours? Have we already sent this exact event (the ID guards against duplicates)? Then it fills in the message template in the user’s language.`],
    [['ns', 'qp', 'qe', 'ns>qp', 'ns>qe'], `It drops one message into each chosen channel’s queue. Keeping a <b>separate queue per channel</b> matters: an email backlog must never delay a push.`],
    [['qp', 'ap', 'qp>ap'], `Push workers look up the person’s device and call Apple’s or Google’s push service. Dead device tokens (old phones) get cleaned up.`],
    [['qe', 'se', 'qe>se'], `If a provider fails, the worker waits and retries; after several tries the message is set aside in a “dead-letter” pile for someone to look at. Delivery and open events flow back so you can track what happened.`]],
  sections: [
    ['What are we building?', PLAIN(`A notification system is the middle-man between <b>“something happened in your app”</b> and <b>“the user finds out about it.”</b> A hundred different events (order shipped, new message, login code, price drop) all funnel through one service that figures out <i>whether</i>, <i>how</i>, and <i>when</i> to tell each person — then actually delivers it through app push, text, or email.`) +
      ANALOGY(`Think of a smart mailroom. Departments across a big company drop off things to send. The mailroom clerk checks each recipient’s rules (“no texts after 9pm,” “unsubscribed from marketing”), makes sure nothing gets sent twice, picks the right delivery method, and hands it to the right courier — and if a courier is overwhelmed, the mail for <i>other</i> couriers still goes out on time.`)],
    ['Words you’ll need', KEYTERMS([
      ['Channel', 'A way of reaching someone: app push, SMS (text), email, or in-app. The same notification might go out on one or several.'],
      ['Queue', 'A waiting line for work. The service drops messages into a queue and separate “worker” programs pull them out and send them, so the service never has to wait around.'],
      ['Idempotency / dedupe', 'Making sure the same notification isn’t sent twice, even if the request is accidentally repeated. We do it by tagging each event with a unique ID and remembering which IDs we’ve already handled.'],
      ['Provider', 'An outside company that actually delivers the message — Apple/Google for push, Twilio for SMS, an email service. We don’t build these; we call them.'],
      ['At-least-once delivery', 'We’d rather send a message twice than lose it, so the system guarantees “at least once” — and then dedupe turns that into effectively “exactly once” from the user’s side.']])],
    ['How it works, step by step', BSTEPS([
      ['An event arrives', PP(`One of your app’s services reports an event (“order shipped, user 42”) with a unique <b>event ID</b>. Using an ID here is what later lets us catch duplicates.`)],
      ['Decide whether to send', PP(`The service checks <b>preferences</b>: has the user turned this channel or category off? Is it their <b>quiet hours</b> (based on their time zone)? Are we about to exceed a <b>rate limit</b> (e.g. no more than 3 marketing pushes a day)? Any of these can stop or delay the message.`)],
      ['Avoid duplicates', PP(`It looks up the event ID in a short-term memory. Seen it already? Skip — don’t send twice. This is what makes retries safe.`)],
      ['Fill in the template', PP(`Rather than hard-coding text, it loads a <b>template</b> (“Hi {name}, your order {id} shipped”) in the user’s language and fills in the details.`)],
      ['Fan out to per-channel queues', PP(`It drops the finished message into a <b>separate queue for each channel</b> — push, SMS, email. This separation is the single most important design choice (see below).`)],
      ['Workers deliver with retries', PP(`Each channel has its own pool of <b>workers</b> that pull from its queue and call the outside provider. If a call fails, they wait a bit and retry; after several failures the message goes to a <b>dead-letter queue</b> so it isn’t silently lost.`)]])],
    ['The key idea: keep channels (and priorities) in separate lines', WHY(`Picture one giant queue for everything. Now a marketing blast to 50 million people floods it — and a user’s <b>login code</b> (which they need in the next 10 seconds) is stuck behind all of it. Disaster. By giving each channel and each priority level its <b>own queue</b>, a backlog or outage in one lane can’t delay the others. Engineers call this a <b>bulkhead</b> — like the sealed compartments in a ship, so one flooded section doesn’t sink the whole vessel. Transactional messages (codes, receipts) ride a fast lane; marketing rides a slow one.`)],
    ['The other things that make it robust', UL([
      `<b>Provider failover:</b> hide each provider behind a small adapter so you can switch to a backup SMS provider the moment one starts failing, without touching the rest of the system.`,
      `<b>Rate limiting:</b> both <i>per user</i> (so nobody gets spammed) and <i>per provider</i> (so you stay within the limits they impose).`,
      `<b>Device registry:</b> a table mapping each user to their current device tokens, updated when they install, reopen, or uninstall the app (so you stop pushing to dead devices).`,
      `<b>Big campaigns aren’t 50M API calls:</b> a scheduler walks through the audience in chunks and feeds work in at a controlled pace, and workers send in batches where the provider allows it — so you don’t melt your own servers or the providers’.`]),
      RECAP([
        `A notification system turns app events into push/SMS/email, deciding whether, how, and when to tell each user.`,
        `Flow: event → check preferences & quiet hours → dedupe by event ID → fill the template → per-channel queue → workers call providers with retries.`,
        `<b>Separate queues per channel and priority</b> keep urgent codes fast even during a marketing blast (the bulkhead idea).`,
        `Tag events with IDs for <b>idempotency</b> (no duplicates), hide providers behind adapters for <b>failover</b>, and rate-limit per user and per provider.`,
        `Treat big campaigns as a throttled, batched job — never a flood of individual calls.`])]
  ],
  qs: [SQ('Why give each channel and priority its own queue instead of one shared queue?', ['Queues are cheaper that way', 'So a backlog or outage in one lane (e.g. a marketing blast) can’t delay urgent messages like login codes', 'Providers legally require it', 'To encrypt the messages'], 1, 'Isolated lanes (bulkheads) keep critical messages fast no matter what else is happening.'),
    SQ('How do we make sure a user isn’t notified twice when an event is accidentally sent to us again?', ['Send slower', 'Tag each event with a unique ID and skip any ID we’ve already handled (idempotency)', 'Use email only', 'Turn off retries'], 1, 'Dedupe by event ID turns safe “at-least-once” sending into effectively exactly-once.')]
});

/* ---------------- Chat app (WhatsApp) ---------------- */
SDX('case-chat', { name: 'Design a chat app (WhatsApp)', cat: 'sdcase',
  blurb: `We’re building real-time messaging for hundreds of millions of people: messages that arrive the instant they’re sent, work in groups, show “sent / delivered / read” ticks, and never get lost or shuffled out of order — even when the person you’re texting has their phone off. We’ll build it up from the one idea at its heart: a always-open connection between each phone and the server.`,
  facts: [['Daily users', '≈ 500 million'], ['Messages a day', '≈ 40 billion'], ['The key trick', 'an always-open connection (WebSocket)'], ['Messages stored', 'grouped by conversation']],
  dg: { w: 880, h: 370,
    n: [['a', 'Alice', 80, 90, 'client'], ['b', 'Bob', 80, 280, 'client'], ['g1', 'Gateway 1', 290, 90, 'svc', 'holds connections'], ['g2', 'Gateway 2', 290, 280, 'svc', 'holds connections'], ['cs', 'Chat service', 530, 185, 'svc'], ['pr', 'Who’s connected where', 530, 50, 'cache', 'user → gateway'], ['ms', 'Message store', 780, 185, 'db', 'by conversation'], ['pu', 'Push service', 530, 320, 'svc', 'for offline users']],
    e: [['a', 'g1', 'send'], ['g1', 'cs', 'message'], ['cs', 'ms', 'save'], ['cs', 'pr', 'where is Bob?'], ['cs', 'g2', 'deliver'], ['g2', 'b', 'down the open line'], ['cs', 'pu', 'if offline', 'd']] },
  cap: `Every phone keeps an always-open line to a “gateway” server. To send a message, the chat service saves it, looks up which gateway the recipient is connected to, and pushes it straight down their open line. If they’re offline, it sends a phone notification instead and syncs everything when they reconnect.`,
  walk: [[['a', 'g1', 'a>g1'], `Alice’s phone holds an always-open line (a WebSocket) to Gateway 1. She sends a message, tagged with an ID her phone generated (so a retry can’t duplicate it).`],
    [['g1', 'cs', 'cs', 'ms', 'g1>cs', 'cs>ms'], `The chat service gives the message the next <b>sequence number</b> for that conversation and saves it. Alice sees one grey tick ✓ — “sent to the server.”`],
    [['cs', 'pr', 'cs>pr'], `It checks a quick lookup table: which gateway is Bob connected to right now? Answer: Gateway 2.`],
    [['cs', 'g2', 'g2', 'b', 'cs>g2', 'g2>b'], `The message is handed to Gateway 2 and pushed down Bob’s open line. Bob’s phone confirms it arrived, which turns Alice’s ticks to ✓✓ — “delivered.”`],
    [['cs', 'pu', 'cs>pu'], `If Bob is offline, there’s no open line, so a normal phone notification is sent instead. When Bob reopens the app, it asks the server “give me everything after sequence number X” for each conversation and instantly catches up.`]],
  sections: [
    ['What are we building (and the one hard idea)', PLAIN(`A chat app lets two people — or a group — exchange messages that appear <b>instantly</b>. The tricky part is that word “instantly.” Normally your phone <i>asks</i> a server for things (“any new email?”). But for chat, the server needs to <b>push</b> a message to you the moment it arrives, without you asking. That requires a different kind of connection.`) +
      ANALOGY(`Normal web browsing is like <b>checking your mailbox</b> — you walk out and look, and if nothing’s there, you walked for nothing. Chat is like keeping a <b>phone line open</b> the whole time: the other side can talk to you the instant they want, with no “checking.” That always-open line is called a <b>WebSocket</b>, and it’s the foundation of the whole design.`)],
    ['Words you’ll need', KEYTERMS([
      ['WebSocket', 'An always-open, two-way connection between a phone and a server. Unlike a normal web request, the server can send data down it at any time — perfect for pushing new messages instantly.'],
      ['Gateway', 'A server whose only job is to hold a huge number of these open connections and shuttle messages to and from them. One gateway can hold hundreds of thousands of connections.'],
      ['Session registry', 'A fast lookup table (user → which gateway they’re connected to right now), so the system knows where to send a message for any online user.'],
      ['Sequence number', 'A simple counter per conversation (1, 2, 3 …) stamped on each message, so phones can put messages in the right order and tell if any are missing.'],
      ['Stateless', 'A server that keeps no important data of its own — it can be replaced freely because the real data lives in the stores. Gateways are basically stateless (they just hold connections).']])],
    ['How a message gets from Alice to Bob', BSTEPS([
      ['Everyone holds an open line', PP(`When you open the app, your phone establishes a <b>WebSocket</b> to a <b>gateway</b> and keeps it open. That’s how the server can reach you instantly later. With ~200 million people online and ~500K connections per gateway, you need a few hundred gateway servers.`)],
      ['Alice sends', PP(`Her message travels up her open line to her gateway, which passes it to the <b>chat service</b> (the brain). Her message carries an ID she generated, so if the network hiccups and her phone resends, the server recognises the duplicate and ignores it.`)],
      ['Save it and order it', PP(`The chat service stamps the message with the next <b>sequence number</b> for that conversation and saves it to the message store. The sequence number is what guarantees everyone sees the messages in the same order. Alice now gets her ✓ (“sent”).`)],
      ['Find the recipient', PP(`It asks the <b>session registry</b>: “which gateway is Bob on?” The registry is updated whenever anyone connects or disconnects, with heartbeats to notice dropped lines.`)],
      ['Deliver instantly', PP(`The message is sent to Bob’s gateway and pushed straight down his open line. His phone acknowledges, and Alice’s ticks become ✓✓ (“delivered”); when Bob actually views it, a read receipt makes them blue.`)],
      ['Handle offline', PP(`No open line for Bob? Send a regular phone <b>push notification</b>. When he reconnects, his app says “send me everything after the last sequence number I have” and catches up — nothing is lost.`)]])],
    ['The interesting details', UL([
      `<b>Keeping order:</b> within one conversation, the per-conversation <b>sequence number</b> is the source of truth for order. Phones sort by it and, if they spot a gap (…, 7, 9 — where’s 8?), they ask the server for the missing one.`,
      `<b>Where messages are stored:</b> in a table organised <b>by conversation</b>, so loading a chat or syncing after being offline is one tidy, in-order read. (WhatsApp historically deletes messages from its servers once delivered, and because of end-to-end encryption the server only ever holds scrambled text it can’t read.)`,
      `<b>Groups:</b> for a small group, the server simply delivers the message to each member’s connection. For enormous groups or broadcast channels, it’s cheaper to let members <b>pull</b> new messages when they open the chat, rather than push to everyone.`,
      `<b>Multiple devices:</b> each of your devices remembers its own “last sequence number seen” per conversation, so your phone and laptop stay in sync independently.`,
      `<b>Privacy:</b> end-to-end encryption means the message is scrambled on Alice’s phone and only Bob’s phone can unscramble it — the servers in the middle just move sealed envelopes around.`]),
      RECAP([
        `Chat needs the server to <b>push</b> messages instantly, so each phone keeps an always-open <b>WebSocket</b> to a <b>gateway</b>.`,
        `A <b>session registry</b> tracks which gateway each online user is on, so the chat service knows where to deliver.`,
        `The chat service <b>saves</b> each message and stamps it with a per-conversation <b>sequence number</b> that fixes the order; the ✓ / ✓✓ ticks come from acknowledgements at each hop.`,
        `Offline users get a push notification and <b>sync by sequence number</b> on reconnect — nothing is lost.`,
        `Store messages <b>by conversation</b> for fast loads; small groups push, huge groups pull; end-to-end encryption means servers only move scrambled text.`])]
  ],
  qs: [SQ('Why does a chat app use an always-open WebSocket instead of the phone repeatedly asking the server for new messages?', ['WebSockets are cheaper to run', 'So the server can push a new message to the phone the instant it arrives, with no delay from polling', 'Because phones can’t make normal requests', 'For encryption'], 1, 'An open two-way line lets the server deliver instantly rather than the phone constantly checking.'),
    SQ('How does the server know which machine to deliver Bob’s message to?', ['It broadcasts to every gateway', 'A session registry maps each online user to the gateway holding their connection', 'It guesses from Bob’s phone number', 'DNS'], 1, 'Gateways register “user → gateway” on connect; the chat service looks it up per message.')]
});

/* ---------------- News feed (Twitter / X) ---------------- */
SDX('case-feed', { name: 'Design a news feed (Twitter/X)', cat: 'sdcase',
  blurb: `We’re building a home feed: people post short messages, follow others, and open the app to see recent posts from everyone they follow. It’s read far, far more than it’s written, and follower counts swing from 10 to 100 million — and that one fact (how do you handle a celebrity?) shapes the entire design.`,
  facts: [['Daily users', '≈ 200 million'], ['Feed opens (peak)', '≈ 300,000 per second'], ['New posts', '≈ 6,000 per second'], ['The core trick', '“hybrid fan-out”']],
  dg: { w: 880, h: 390,
    n: [['au', 'Poster', 80, 70, 'client'], ['ps', 'Post service', 300, 70, 'svc'], ['pd', 'Posts store', 560, 70, 'db', 'the real posts'], ['q', 'Fan-out queue', 300, 195, 'queue'], ['fw', 'Fan-out workers', 560, 195, 'worker'], ['fg', 'Who-follows-whom', 790, 195, 'db'], ['tc', 'Timeline cache', 560, 330, 'cache', 'user → recent post IDs'], ['fs', 'Feed service', 300, 330, 'svc'], ['rd', 'Reader', 80, 330, 'client']],
    e: [['au', 'ps', 'post'], ['ps', 'pd', 'save once'], ['ps', 'q', 'new post'], ['q', 'fw'], ['fw', 'fg', 'who follows them?'], ['fw', 'tc', 'drop in ID'], ['rd', 'fs', 'open feed'], ['fs', 'tc', 'read IDs'], ['fs', 'pd', 'fetch posts', 'd']] },
  cap: `For a normal poster, every new post is copied into each follower’s ready-made timeline the moment it’s posted — so reading your feed is one instant lookup. For a celebrity with millions of followers, we skip that and instead fetch their posts when you open the app. Mixing the two is the “hybrid fan-out.”`,
  walk: [[['au', 'ps', 'pd', 'au>ps', 'ps>pd'], `Someone posts. The post itself is saved <b>once</b> in the posts store, with a time-sortable ID.`],
    [['ps', 'q', 'fw', 'ps>q', 'q>fw'], `A “deliver this to followers” job is put on a queue, so posting feels instant — the slow work happens in the background.`],
    [['fw', 'fg', 'tc', 'fw>fg', 'fw>tc'], `Workers look up who follows the poster and drop the new post’s ID into the top of each follower’s <b>ready-made timeline</b> (a short list kept in fast memory). 200 followers = 200 tiny writes.`],
    [['rd', 'fs', 'tc', 'rd>fs', 'fs>tc'], `A reader opens the app. The feed service just reads their pre-built list of post IDs — a single, instant cache lookup. No heavy work at read time.`],
    [['fs', 'pd', 'fs>pd'], `It turns those IDs into full posts, and <b>mixes in</b> recent posts from the handful of celebrities the reader follows (fetched right now, because copying a celebrity’s post to 100M timelines would be insane). Optionally a ranking model reorders everything.`]],
  sections: [
    ['What are we building?', PLAIN(`A news feed has two sides. <b>Posting:</b> a user writes a short message. <b>Reading:</b> a user opens the app and sees a <b>home timeline</b> — recent posts from all the accounts they follow, newest (or most interesting) first. The whole challenge is making that timeline load <b>instantly</b> for 200 million people when some accounts have 100 million followers.`) +
      ANALOGY(`Think of each person having a <b>pinboard</b>. When you post, helpers run around and pin a copy of your note on the pinboard of everyone who follows you — so when they walk up to their board, it’s already full and they see it instantly. That works beautifully… until a celebrity posts and you’d need to pin 100 million copies. For <i>those</i> accounts, we don’t pre-pin; instead we grab their latest notes when a follower actually looks. That mix is the key idea.`)],
    ['First, notice how lopsided it is', PP(`Before designing, size it up — it explains everything. Roughly 6,000 posts per second, but around 300,000 feed-opens per second at peak. Reading dwarfs writing. So the golden rule is: <b>do the hard work when someone posts (rare), so that reading (constant) is nearly free.</b> That instinct leads straight to the design.`) +
      KEYTERMS([
        ['Timeline', 'The list of posts a user sees when they open the app — the posts of everyone they follow.'],
        ['Fan-out', 'The act of taking one new post and delivering it to many followers. “Fan-out on write” = do it when posting; “fan-out on read” = do it when the follower opens the app.'],
        ['Hydrate', 'Turning a list of post IDs into the full posts (text, images). We store cheap IDs in timelines and fetch the full content only when needed.'],
        ['Hot key / celebrity problem', 'A single account (or post) so popular that the normal approach — copying it to every follower — would overwhelm the system.']])],
    ['The heart of it: push vs pull (and why we do both)', PP(`There are two ways to build a timeline, and the whole interview is about knowing when to use each.`) +
      TBL(['', 'Push — copy at posting time', 'Pull — gather at reading time'],
        [['When the work happens', 'When you post (once per follower)', 'When a follower opens their feed'],
         ['Reading the feed', 'Instant — just read your ready-made list', 'Slow — go fetch and merge posts from everyone you follow'],
         ['Posting', 'Cheap for normal users, brutal for celebrities (millions of copies)', 'Always cheap'],
         ['Wasted effort', 'Builds timelines for people who never log in', 'None'],
         ['Best for', 'Normal accounts', 'Celebrities and inactive followers']]) +
      PLAIN(`So we <b>combine</b> them (a <b>hybrid</b>): <b>push</b> for ordinary posters (most people), and <b>pull</b> for accounts above some follower count. When you open your feed, you get your pre-built list of normal people’s posts <i>plus</i> a quick on-the-spot fetch of the few celebrities you follow, merged together. We also skip pushing to people who haven’t logged in for weeks — we’ll rebuild their timeline if they come back.`)],
    ['Walking through the design', BSTEPS([
      ['Store the post once', PP(`The post goes into the posts store a single time, with a time-sortable ID (so “newest first” is easy). Timelines will only ever hold the <b>ID</b>, not a copy of the whole post — far cheaper.`)],
      ['Queue the fan-out', PP(`Posting immediately returns; a background job on a <b>queue</b> handles delivery so the user isn’t kept waiting.`)],
      ['Workers deliver to followers', PP(`Fan-out <b>workers</b> look up the poster’s followers and prepend the post ID to each follower’s timeline list (kept in fast memory like Redis, capped at a few hundred entries). For a celebrity, this step is <b>skipped</b> — pull handles them.`)],
      ['Reading is a single lookup', PP(`When you open the app, the feed service reads your ready-made list of IDs — one fast cache read — then <b>hydrates</b> those IDs into full posts and <b>merges in</b> the celebrities’ latest. A ranking model can reorder by predicted interest.`)]])],
    ['The other pieces (briefly, but completely)', UL([
      `<b>Likes & retweets counts</b> get hammered, so they’re kept as <b>sharded counters</b> (the count is split across several pieces and summed) and updated in the background, not on the main path.`,
      `<b>Viral posts</b> become <b>hot keys</b> — one post everyone wants at once; cache it in many places so no single server is crushed.`,
      `<b>Unfollows and deletes</b> aren’t scrubbed from every timeline immediately (too expensive); instead they’re filtered out when the feed is read, and cleaned up lazily later.`,
      `<b>Eventual consistency is fine here:</b> it’s okay if a brand-new post takes a few seconds to appear in everyone’s feed — far cheaper than guaranteeing it’s instant and perfectly consistent.`]),
      RECAP([
        `A news feed is hugely read-heavy, so the rule is: do the work when posting, keep reading almost free.`,
        `<b>Push (fan-out on write):</b> copy each new post’s ID into every follower’s ready-made timeline, so opening the feed is one instant lookup.`,
        `That breaks for <b>celebrities</b> (millions of copies per post), so for them we <b>pull</b> — fetch their posts when a follower reads — and merge.`,
        `The <b>hybrid</b> (push for most, pull for the famous) is the whole trick; also skip inactive users.`,
        `Timelines store cheap <b>IDs</b> and <b>hydrate</b> to full posts at read time; counts are sharded; a few seconds of staleness is acceptable.`])]
  ],
  prac: [355],
  qs: [SQ('Why not simply copy every new post into every follower’s timeline (push for everyone)?', ['Timelines can’t hold posts', 'A celebrity with 100M followers would need 100M copies per post, overwhelming the system — so their posts are pulled at read time instead', 'Pushing is always slower than pulling', 'Followers can’t read a cache'], 1, 'The celebrity/hot-key problem is exactly why the hybrid design pulls big accounts.'),
    SQ('Why is a news feed designed to do the heavy work at posting time rather than reading time?', ['Posting is more frequent than reading', 'Reading hugely outnumbers posting, so making reads cheap (even at the cost of more work per post) is the better trade', 'It uses less storage', 'To keep posts consistent'], 1, 'With ~300K reads/s vs ~6K posts/s, you optimise the common case: reads.')]
});
