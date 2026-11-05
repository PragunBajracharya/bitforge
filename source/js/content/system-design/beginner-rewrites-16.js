/* ===== Beginner-first rewrites — batch 16 (LLD sub-track: 10 LLD problems). SDPATCH: prose only, keeps code/quizzes. ===== */

SDPATCH('lld-parking', {
  blurb: `The classic low-level-design warm-up: model a multi-level parking lot that assigns a spot based on vehicle size, issues a ticket on entry, and charges a fee on exit. It exercises the basics — turning requirements into classes, using enums, a pricing strategy, and safely allocating spots — and interviewers use it to watch how you structure a design.`,
  sections: [
    ['What are we designing?', PLAIN(`This is an <b>object-design</b> problem (not a distributed-systems one): you’re being asked to lay out the <b>classes</b> for a parking lot. A car arrives, the system finds a free spot that fits its size and issues a <b>ticket</b>; when it leaves, the system works out the fee from how long it stayed and frees the spot. The skill on display is translating the words of the problem into clean classes with clear responsibilities.`) +
      ANALOGY(`Picture a real multi-storey car park with an attendant. At the barrier you’re given a ticket stamped with the time and pointed to a space that fits your vehicle (a motorbike bay, a car bay, a van bay). On the way out, the attendant reads your ticket, calculates the charge for the time you stayed, takes payment, and marks the space free for the next car. You’re designing the software version of that attendant and their system.`)],
    ['Words you’ll need', KEYTERMS([
      ['Entity classes', 'The nouns: ParkingLot, Level, Spot, Vehicle, Ticket — each a class with its own data.'],
      ['Enum', 'A fixed set of named values, e.g. VehicleSize = {MOTORBIKE, CAR, VAN} — cleaner than loose strings.'],
      ['Spot allocation', 'Finding and reserving a free spot that fits the vehicle — must be done safely so two cars don’t get the same spot.'],
      ['Pricing strategy', 'A swappable rule for the fee (per hour, flat, by size) — the Strategy pattern, so pricing can change without touching the rest.'],
      ['Ticket', 'The record of one parking session: which spot, entry time, and later the fee.']])],
    ['How the design comes together', WHY(`Start by pulling the <b>nouns</b> into classes (ParkingLot → Levels → Spots; Vehicle; Ticket) and the <b>verbs</b> into methods (park, unpark, calculate fee). Use an <b>enum</b> for vehicle/spot sizes rather than magic strings. Put the fee logic behind a <b>pricing strategy</b> so you can switch from “per hour” to “flat rate” without rewriting the lot. And treat <b>spot allocation as the one tricky spot</b>: finding and marking a space taken must be atomic, or two arriving cars could be assigned the same space. Calling out that detail is exactly what interviewers look for.`) +
      RECAP([
        `An <b>object-design</b> problem: model the parking lot’s classes and their responsibilities.`,
        `Turn nouns into entity classes (ParkingLot, Level, Spot, Vehicle, Ticket) and verbs into methods.`,
        `Use <b>enums</b> for sizes and a <b>pricing strategy</b> so the fee rule is swappable (open/closed).`,
        `Issue a <b>ticket</b> on entry; compute the fee from the stay on exit and free the spot.`,
        `<b>Spot allocation must be atomic</b> so two vehicles can’t be given the same spot.`])]
  ]
});

SDPATCH('lld-vending', {
  blurb: `A vending machine is the textbook <b>State pattern</b> problem: how it behaves depends on which mode it’s in — no money inserted, money inserted, dispensing, sold out. You model its inventory, its coins and change, and above all a clean state machine where each state knows what to do and which state comes next.`,
  sections: [
    ['What are we designing?', PLAIN(`You’re designing the control logic for a vending machine as a set of classes. The same action — “insert coin”, “select product”, “dispense” — does something <i>different</i> depending on the machine’s current mode. The clean way to capture that is the <b>State pattern</b>: one class per mode, each handling the events in its own way and deciding the next mode. Plus the supporting pieces: tracking stock and making change.`) +
      ANALOGY(`Think of using a real vending machine. Before you put money in, pressing a product button does nothing useful (“insert coin first”). Once you’ve inserted enough, that same button now dispenses. If an item’s sold out, it refuses and returns your money. The machine’s behaviour flips as it moves through clear modes — and that mode-dependent behaviour is precisely what the State pattern models.`)],
    ['Words you’ll need', KEYTERMS([
      ['State', 'One mode of the machine (NoCoin, HasCoin, Dispensing, SoldOut), each a class handling events its way.'],
      ['Transition', 'Moving from one state to the next — each state decides where to go after an event.'],
      ['Event / action', 'Inputs like insert-coin, select-product, dispense — handled differently per state.'],
      ['Inventory', 'How many of each product remain; drives the SoldOut state.'],
      ['Change', 'Working out and returning the correct coins when the paid amount exceeds the price.']])],
    ['How the design comes together', WHY(`List the <b>modes</b> first (NoCoin → HasCoin → Dispensing, plus SoldOut), then make each a <b>state class</b> implementing the same event methods. The machine (the context) just holds its current state and forwards events to it; each state does its bit and <b>sets the next state</b>. This kills the giant <code>if current_mode == …</code> blocks you’d otherwise get in every method. Layer in <b>inventory</b> (decrement on dispense, flip to SoldOut at zero) and <b>change</b> calculation, and you have a clean, extensible design where adding a new mode is a new class, not edits everywhere.`) +
      RECAP([
        `A vending machine is the canonical <b>State pattern</b> design: behaviour depends on the current mode.`,
        `Model each mode (NoCoin, HasCoin, Dispensing, SoldOut) as a <b>state class</b> handling the same events differently.`,
        `The machine holds its current state and delegates; each state <b>sets the next state</b> — no mode conditionals.`,
        `Track <b>inventory</b> (drives SoldOut) and compute <b>change</b> when overpaid.`,
        `Adding a mode is a new class, keeping the design open/closed.`])]
  ]
});

SDPATCH('lld-elevator', {
  blurb: `Designing an elevator system pairs a <b>per-car state machine</b> (each car moving up, down, or idle) with a <b>dispatch strategy</b> that decides which car answers each request and in what order. It’s a favourite because the “which car, in what sequence” scheduling has genuine depth.`,
  sections: [
    ['What are we designing?', PLAIN(`You’re modelling a building’s elevators: several cars, people pressing call buttons on floors and destination buttons inside. Two parts work together. Each <b>car</b> is a little state machine (idle / going up / going down) that services the stops it’s been given in a sensible order. A separate <b>dispatcher</b> decides, when a new request comes in, <b>which car</b> should take it. Separating these keeps each piece simple.`) +
      ANALOGY(`Think about pressing the “up” button in a lobby with four lifts. Something has to decide <i>which</i> lift comes — ideally a nearby one already heading your way, not one on the top floor going the other direction. And once a lift has several stops, it doesn’t zig-zag randomly; it sweeps in one direction picking up everyone, then reverses (like how it never skips floor 5 going up just to come back for it). You’re designing both that “which lift” decision and each lift’s “what order” sweep.`)],
    ['Words you’ll need', KEYTERMS([
      ['Car / state machine', 'Each elevator car, tracking its direction and the stops it must serve (idle/up/down).'],
      ['Request', 'A call (from a floor) or a destination (from inside a car) to be served.'],
      ['Dispatch strategy', 'The swappable rule for assigning a request to a car (e.g. nearest suitable car) — a Strategy.'],
      ['LOOK / SCAN', 'A sweep algorithm: keep going one direction serving stops, then reverse — avoids inefficient zig-zagging.'],
      ['Scheduling', 'Deciding which car and in what order — the part with real depth.']])],
    ['How the design comes together', WHY(`Model each <b>car</b> as a state machine that holds its pending stops and serves them with a <b>LOOK-style sweep</b> (continue in the current direction, then reverse) rather than naively in arrival order. Then put the “which car?” decision behind a <b>dispatch strategy</b> interface (a simple one: pick the nearest car already heading the right way, or an idle one), so you can improve the algorithm later without touching the cars. Splitting <b>per-car motion</b> from <b>cross-car dispatch</b> is the key structural insight — each stays simple, and the dispatcher is swappable (Strategy).`) +
      RECAP([
        `An elevator system = a <b>per-car state machine</b> plus a <b>dispatch strategy</b> across cars.`,
        `Each car tracks direction and pending stops, serving them with a <b>LOOK/SCAN sweep</b>, not random order.`,
        `A swappable <b>dispatch strategy</b> decides which car takes each request (e.g. nearest suitable car).`,
        `Separating per-car motion from cross-car dispatch keeps both parts simple.`,
        `The scheduling (“which car, what order”) is where the real design depth lives.`])]
  ]
});

SDPATCH('lld-movie', {
  blurb: `A movie-booking system (think BookMyShow or Fandango) is really about <b>seat selection under concurrency</b>: many people eye the same seats at once, so the hard part is <b>holding</b> and then <b>confirming</b> seats without ever double-booking. You model theatres, shows, seats, and the reservation flow around that.`,
  sections: [
    ['What are we designing?', PLAIN(`You’re designing how users pick and book cinema seats for a specific showing. The entities are straightforward (Theatre → Screen → Show → Seats), but the interesting bit is the <b>booking flow</b>: when someone selects seats you must <b>reserve them temporarily</b> while they pay, release them if they don’t finish in time, and guarantee two people can never confirm the same seat.`) +
      ANALOGY(`It’s exactly the experience of booking cinema seats online. You tap seats F4 and F5; they turn yellow (“held just for you”) and a countdown starts — you’ve got a few minutes to pay. If you dawdle, they go back to green for others. If you pay in time, they turn red (“sold”). The whole design revolves around that hold-then-confirm dance, because thousands of people are grabbing at the same popular seats.`)],
    ['Words you’ll need', KEYTERMS([
      ['Show', 'A specific screening (movie + screen + time) that owns a set of seats.'],
      ['Seat status', 'AVAILABLE → HELD → BOOKED, the lifecycle each seat moves through.'],
      ['Hold (with TTL)', 'A temporary reservation that auto-expires if payment isn’t completed in time.'],
      ['Atomic / all-or-nothing', 'Grabbing the chosen seats must succeed completely or not at all — no partial holds.'],
      ['Double-booking', 'Two users confirming the same seat — the one outcome the design must make impossible.']])],
    ['How the design comes together', WHY(`Model the entities (Theatre, Screen, Show, Seat) and give each seat a clear status lifecycle: <b>AVAILABLE → HELD → BOOKED</b>. The booking flow is the crux: when a user selects seats, place an <b>all-or-nothing hold</b> with a short <b>TTL</b> (so abandoned carts free their seats automatically), then convert the hold to <b>BOOKED</b> only after payment. The hold step must be <b>atomic</b> — if any requested seat is already taken, the whole request fails and the user picks again — because that’s what prevents two people from both holding F5. (This is the object-design cousin of the Ticketmaster case study, focused on the class model rather than the distributed scale.)`) +
      RECAP([
        `A movie-booking system centres on <b>seat selection under concurrency</b>.`,
        `Model Theatre → Screen → Show → Seats, with each seat moving AVAILABLE → HELD → BOOKED.`,
        `Place an <b>all-or-nothing hold with a TTL</b> while the user pays; expire it if they don’t finish.`,
        `Confirm to BOOKED only after payment; the hold must be <b>atomic</b> to prevent double-booking.`,
        `It’s the object-design counterpart of the Ticketmaster case study.`])]
  ]
});

SDPATCH('lld-splitwise', {
  blurb: `Splitwise tracks shared expenses in a group and tells everyone who owes whom. The interesting design parts are supporting different <b>split types</b> (equal, exact amounts, percentages) cleanly, and then <b>simplifying</b> the resulting tangle of debts into the fewest possible payments.`,
  sections: [
    ['What are we designing?', PLAIN(`You’re designing the logic behind an expense-sharing app. Someone pays for something and splits it among a group; the system keeps a running tally of each person’s <b>net balance</b> (how much they’re owed or owe overall). Two things need thought: expenses can be split in different ways, and after many expenses the “who owes whom” web gets messy and should be reduced to as few transfers as possible.`) +
      ANALOGY(`Picture a holiday with friends where everyone covers different things — one pays for dinner, another for the taxi, another for tickets. At the end nobody wants a confusing mess of “Ana owes Ben £7, Ben owes Carol £7, Carol owes Ana £3…”. You want it boiled down to the <b>fewest settle-up payments</b> (“just send Ben £4 and you’re done”). That boil-down is the clever part of the design.`)],
    ['Words you’ll need', KEYTERMS([
      ['Expense', 'One payment made by someone, to be split among participants.'],
      ['Split type (strategy)', 'How an expense is divided: equal, exact amounts, or percentages — a Strategy so new types plug in.'],
      ['Net balance', 'Per person, the single number of how much they’re overall owed (+) or owe (−).'],
      ['Debt simplification', 'Reducing the web of IOUs to the minimum number of payments.'],
      ['Greedy settlement', 'The usual algorithm: repeatedly match the biggest creditor with the biggest debtor.']])],
    ['How the design comes together', WHY(`Model an <b>Expense</b> plus a <b>split strategy</b> so equal/exact/percentage splits are interchangeable classes (add a new split type without touching the rest — Strategy and open/closed). Rather than storing every pairwise IOU, keep a single <b>net balance</b> per person; any expense just adjusts the payers’ and participants’ balances. To settle up, run <b>greedy debt simplification</b>: repeatedly take the person owed the most and the person who owes the most and transfer between them, which collapses the web into the fewest transfers. Choosing net balances + greedy settlement over a pile of pairwise debts is the insight that makes this design clean.`) +
      RECAP([
        `Splitwise tracks shared expenses and computes who owes whom.`,
        `Support split types (equal/exact/percentage) via a swappable <b>split strategy</b>.`,
        `Keep a single <b>net balance</b> per person rather than every pairwise IOU.`,
        `<b>Simplify debts</b> to the fewest payments with a <b>greedy</b> biggest-creditor/biggest-debtor match.`,
        `Net balances + greedy settlement is the clean modelling choice.`])]
  ]
});

SDPATCH('lld-ratelimiter', {
  blurb: `An in-process rate limiter decides whether a request is allowed under a quota. The object-design angle is making the algorithms (token bucket, sliding window) <b>swappable behind one interface</b> and <b>thread-safe</b>. (The large-scale, cross-server version is the separate distributed rate-limiter case study.)`,
  sections: [
    ['What are we designing?', PLAIN(`Here the focus is the <b>class design</b> of a rate limiter inside one program, not a distributed system. You want a tiny interface — <code>allow(client) → bool</code> — with the actual counting algorithm (token bucket, sliding window) sitting behind it as an interchangeable implementation, and the shared counters protected so multiple threads can’t miscount.`) +
      ANALOGY(`Think of a single club with one bouncer and a clicker counter per guest. The bouncer’s <i>job</i> (allow or refuse) is fixed, but <i>how</i> they count could vary — a bucket of entry tokens that refills over time, or a tally of the last minute’s entries. And if two doormen shared the same clicker, they’d have to take turns pressing it so the count stays right — that’s the thread-safety part.`)],
    ['Words you’ll need', KEYTERMS([
      ['Rate limiter interface', 'The small contract, typically allow(client_id) → bool.'],
      ['Algorithm (strategy)', 'Token bucket or sliding window behind the interface — a swappable Strategy.'],
      ['Token bucket', 'A bucket of tokens refilling at a fixed rate; each request takes one; empty = denied.'],
      ['Thread-safe', 'Correct when many threads call it at once — the shared counters need a lock.'],
      ['Quota', 'The allowance (e.g. 100 requests/minute) the limiter enforces per client.']])],
    ['How the design comes together', WHY(`Define one small <b>interface</b> (<code>allow</code>) and implement each algorithm as a separate class behind it (<b>Strategy</b>), so you can switch token bucket for sliding window without changing callers. Each per-client bucket/counter is <b>shared state</b>, so guard the “check-and-decrement” with a <b>lock</b> (or an atomic operation) — otherwise two threads could both see the last token and both be allowed through. That combination — a clean swappable interface plus correct concurrency — is the whole object-design lesson here; the cross-machine coordination belongs to the distributed case study.`) +
      RECAP([
        `The object-design angle: a small <code>allow()</code> interface with swappable counting algorithms behind it (Strategy).`,
        `Implement <b>token bucket</b> / <b>sliding window</b> as interchangeable classes.`,
        `Protect the shared per-client counters so the limiter is <b>thread-safe</b> (lock or atomic op).`,
        `Without that, concurrent calls can both spend the last token and over-allow.`,
        `Cross-server coordination is the separate distributed rate-limiter case study.`])]
  ]
});

SDPATCH('lld-lru', {
  blurb: `An LRU (least-recently-used) cache evicts the item unused for the longest time when it’s full. The classic design — a <b>hash map plus a doubly linked list</b> — gives O(1) <code>get</code> and <code>put</code>. It’s both a common LLD question and LeetCode 146.`,
  sections: [
    ['What are we designing?', PLAIN(`You’re implementing a fixed-capacity cache that, when full, throws out whatever hasn’t been used in the longest time. The challenge is making both operations <b>instant (O(1))</b>: look up a key, and update “most recently used” order. The trick is combining two structures — a hash map for instant lookup, and a doubly linked list to track recency order.`) +
      ANALOGY(`Picture a small desk that holds ten files. Each time you use a file you move it to the top of the pile; when you need room for an eleventh, you toss the one at the bottom (least recently touched). The desk is the cache; “move to top on use, drop from bottom when full” is LRU. To find any file instantly you also keep an index card catalogue pointing straight to each file’s place in the pile — that’s the hash map.`)],
    ['Words you’ll need', KEYTERMS([
      ['Capacity', 'The fixed maximum number of items; exceeding it triggers eviction.'],
      ['Eviction', 'Removing the least-recently-used item to make room.'],
      ['Hash map', 'Gives O(1) lookup of a key — but has no notion of order.'],
      ['Doubly linked list', 'Keeps items in recency order and lets any node be unlinked in O(1).'],
      ['Sentinels', 'Dummy head/tail nodes that remove edge cases when moving/removing nodes.'],
      ['O(1)', 'Constant time: get and put don’t slow down as the cache grows.']])],
    ['How the design comes together', WHY(`Neither structure alone suffices: a hash map gives instant lookup but no order; a linked list gives order but slow lookup. Combine them — the <b>map</b> points to each key’s <b>node</b> in a <b>doubly linked list</b> kept most-recent-at-front. Then <code>get</code> looks up via the map and moves that node to the front (a couple of pointer swaps), and <code>put</code> on a full cache drops the back node (least recent) and its map entry. Use <b>sentinel</b> head/tail nodes to avoid null-checks. Every operation is O(1). (This is the hands-on implementation of the eviction-policy concept topic.)`) +
      RECAP([
        `An LRU cache evicts the <b>least-recently-used</b> item when it hits capacity.`,
        `Combine a <b>hash map</b> (O(1) lookup) with a <b>doubly linked list</b> (recency order, O(1) unlink).`,
        `<code>get</code>: look up via the map, move the node to the front (most recent).`,
        `<code>put</code> when full: drop the back node (least recent) and its map entry.`,
        `Use <b>sentinel</b> head/tail nodes; both operations are <b>O(1)</b> (LeetCode 146).`])]
  ]
});

SDPATCH('lld-notification', {
  blurb: `A notification service sends messages over several channels (email, SMS, push) according to user preferences, with templating and retries. The object-design focus is a clean <b>channel abstraction</b>, <b>preference-based routing</b>, and being able to add a new channel <i>without touching callers</i>. (The large-scale version is a separate case study.)`,
  sections: [
    ['What are we designing?', PLAIN(`The object-design version of a notification system: how do you structure the classes so that “notify user X about event Y” fans out to the right channels, respects their preferences, and is easy to extend with a new channel later? The answer leans on a common <b>channel interface</b>, a <b>factory</b> to build the right channel, preference-based routing, and retries with fallback.`) +
      ANALOGY(`Think of a company mailroom. A department hands over “tell Alex their order shipped”; the clerk checks Alex’s preferences (“email me, don’t text me”), picks the matching delivery method, formats the message from a template, and sends it — and if one courier fails, tries a backup. Adding a brand-new delivery method (say WhatsApp) just means training the clerk on it; the departments handing over messages don’t change.`)],
    ['Words you’ll need', KEYTERMS([
      ['Channel (strategy)', 'A way to deliver — Email/SMS/Push — behind one Notifier interface, interchangeable.'],
      ['Factory', 'Builds the right channel object from a key, so callers don’t import concrete channels.'],
      ['Preference routing', 'Choosing which channels to use per user based on their settings/opt-outs.'],
      ['Template', 'A reusable message format filled in with the specific details.'],
      ['Retry with fallback', 'If a channel fails, retry and/or try an alternative channel.']])],
    ['How the design comes together', WHY(`Define a single <b>Notifier interface</b> (<code>send(message)</code>) and make each channel an implementation (<b>Strategy</b>); build them via a <b>factory</b> so callers never import <code>EmailNotifier</code> directly. Route each notification through the user’s <b>preferences</b> to decide which channels to use, fill a <b>template</b> for the content, and wrap sending in <b>retry-with-fallback</b>. The payoff — and the thing to say out loud — is that adding a new channel is <b>one new class plus a factory entry</b>, with zero changes to the code that requests notifications. (The high-throughput, queue-based design is the separate notification-system case study.)`) +
      RECAP([
        `Object-design focus: structure a notification service so channels are swappable and extensible.`,
        `A common <b>Notifier interface</b> with Email/SMS/Push implementations (Strategy), built via a <b>factory</b>.`,
        `Route by <b>user preferences</b>, fill a <b>template</b>, and <b>retry with fallback</b> on failure.`,
        `Adding a channel = one new class + a factory entry, with no caller changes.`,
        `The large-scale, queue-based version is the separate case study.`])]
  ]
});

SDPATCH('lld-payment', {
  blurb: `A payment-gateway abstraction routes a charge to the right provider (Stripe, PayPal), handles the authorize/capture/refund lifecycle, enforces <b>idempotency</b> so retries don’t double-charge, and records every state change. It’s a neat combination of <b>Adapter</b>, <b>Strategy</b>, and a <b>state machine</b>.`,
  sections: [
    ['What are we designing?', PLAIN(`You’re designing the classes for an internal payment gateway that your app calls to take money, no matter which external provider actually processes it. It must present <i>one</i> interface to your code, adapt each provider’s different API behind it, move a payment correctly through its lifecycle (authorize → capture → refund), and never charge twice when a request is retried.`) +
      ANALOGY(`Think of a shop’s <b>card terminal</b>. The cashier taps one simple flow (“charge £20”) regardless of whether the customer’s card is Visa, Mastercard, or Amex — the terminal speaks to each network behind the scenes. It also knows the stages: first it <i>authorises</i> (checks funds and holds them), later <i>captures</i> (actually takes the money), and can <i>refund</i>. And if the cashier accidentally taps twice, the customer isn’t charged twice. You’re designing that terminal’s software.`)],
    ['Words you’ll need', KEYTERMS([
      ['Provider adapter', 'A wrapper making each provider’s API (Stripe, PayPal) fit your one gateway interface — the Adapter pattern.'],
      ['Authorize / capture / refund', 'The payment lifecycle: hold funds, then take them, and optionally return them.'],
      ['State machine', 'The allowed transitions between payment statuses (PENDING → AUTHORIZED → CAPTURED / FAILED / REFUNDED).'],
      ['Idempotency key', 'A unique ID per payment attempt so a repeated request returns the first result instead of charging again.'],
      ['Routing (strategy)', 'Choosing which provider handles a given charge.']])],
    ['How the design comes together', WHY(`Three patterns combine cleanly. Put each external provider behind an <b>adapter</b> so they all satisfy one gateway interface (your code never special-cases Stripe vs PayPal). Pick the provider via a <b>strategy</b>/router. Model the payment’s status as a <b>state machine</b> with only legal transitions (you can’t capture a failed payment), recording each change for audit. And enforce <b>idempotency</b>: stamp each attempt with a key, and on a repeat return the stored result rather than charging again — the single most important correctness rule, since networks retry. (This mirrors the payment-system case study, here at the class-design level.)`) +
      RECAP([
        `A payment gateway presents one interface and routes a charge to the right provider.`,
        `Use <b>adapters</b> to fit each provider’s API behind your interface, and a <b>strategy</b> to route.`,
        `Model the <b>authorize → capture → refund</b> lifecycle as a <b>state machine</b> with legal transitions only.`,
        `Enforce <b>idempotency</b> (a key per attempt) so retries never double-charge — the key correctness rule.`,
        `It combines Adapter + Strategy + state machine; the scaled version is the payment-system case study.`])]
  ]
});

SDPATCH('lld-scheduler', {
  blurb: `A task scheduler runs jobs at a set time or on a recurring schedule, with priorities and retries. The core design is a <b>min-heap (priority queue) keyed by next-run time</b>, worker threads that execute due tasks, and a retry/backoff policy — it’s the in-process cousin of cron and job queues.`,
  sections: [
    ['What are we designing?', PLAIN(`You’re designing something that holds a set of jobs and runs each one at the right moment — some once at a specific time, some repeating on an interval. The central question is: given many pending jobs, how do you efficiently always know <b>which runs next</b>? The answer is a <b>min-heap</b> ordered by next-run time, so the soonest job is always at the top, plus workers that pick it up when its time arrives and a policy for retrying failures.`) +
      ANALOGY(`Think of a <b>personal assistant with a diary</b>. They keep your appointments sorted by time, so at any moment they know the very next thing due — they don’t re-scan the whole diary each minute. When a task’s time comes, they do it (or hand it to someone free); recurring tasks (“water the plants every Tuesday”) get re-added for next time; and if something fails, they try again a bit later. You’re designing that diary-and-assistant.`)],
    ['Words you’ll need', KEYTERMS([
      ['Min-heap / priority queue', 'A structure that always gives the smallest item fast — here, the job with the earliest next-run time.'],
      ['Next-run time', 'The timestamp a job is due; the heap is ordered by it.'],
      ['Worker threads', 'Threads that pull due jobs off the heap and execute them.'],
      ['Recurring task', 'A job that, after running, is re-scheduled for its next occurrence.'],
      ['Retry / backoff', 'On failure, run again later, waiting progressively longer each time.']])],
    ['How the design comes together', WHY(`Keep all pending jobs in a <b>min-heap keyed by next-run time</b> so the soonest is always at the top — no scanning. A scheduler loop peeks the top: if it’s due, hand it to a <b>worker</b> thread to run; otherwise sleep until it is. After a <b>recurring</b> job runs, compute its next time and push it back onto the heap. Wrap execution in a <b>retry/backoff</b> policy so transient failures are retried with growing delays. This is the in-process version of cron and job queues, and the heap-by-time choice is what makes “what runs next?” cheap no matter how many jobs are queued.`) +
      RECAP([
        `A task scheduler runs jobs at a time or on a recurring schedule, with priorities and retries.`,
        `Store pending jobs in a <b>min-heap keyed by next-run time</b> so the soonest is always on top.`,
        `A loop dispatches due jobs to <b>worker threads</b> and sleeps until the next one is due.`,
        `<b>Recurring</b> jobs are re-pushed with their next run time; failures use <b>retry/backoff</b>.`,
        `It’s the in-process cousin of cron and job queues; the heap-by-time makes “what’s next?” cheap.`])]
  ]
});
