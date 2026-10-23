/* ===== Interview prep A: software engineering core ===== */
SD_CATS.push(['ipswe', 'Software engineering'], ['ipfe', 'Frontend'], ['ipbe', 'Backend'], ['ipfs', 'Full-stack'], ['ipcareer', 'Behavioral & career']);

IPT('ip-coding', { name: 'The coding interview playbook', cat: 'ipswe', roles: ['swe', 'fe', 'be', 'fs'],
  blurb: `Coding rounds test problem solving and communication more than memorized answers. A repeatable process (clarify, examples, brute force, optimize, code, test) and a pattern vocabulary turn unfamiliar problems into familiar ones.`,
  facts: [['Length', '45 min, 1–2 problems'], ['Graded on', 'Approach, code, communication'], ['Practice', 'NeetCode 150 (Problems course)'], ['Must say', 'Time & space complexity']],
  cheat: [['1 · Clarify', 'Inputs, sizes, types, duplicates, negatives, empty input, expected output format'], ['2 · Examples', 'Walk a normal case and an edge case by hand'], ['3 · Brute force', 'State it and its complexity, even if slow'], ['4 · Optimize', 'Find the bottleneck; reach for a pattern'], ['5 · Code', 'Clean names, small helpers, talk while typing'], ['6 · Test', 'Trace an example, then edge cases; fix bugs calmly'], ['Sorted input', 'Two pointers, binary search'], ['“Subarray/substring”', 'Sliding window, prefix sums'], ['Top / k-th', 'Heap or quickselect'], ['All combinations', 'Backtracking'], ['Shortest path / levels', 'BFS'], ['Connectivity', 'DFS / union–find'], ['Overlapping subproblems', 'Dynamic programming'], ['Next greater', 'Monotonic stack'], ['Fast lookup', 'Hash map / set']],
  sections: [
    ['What interviewers evaluate', TBL(['Signal', 'What “strong” looks like'], [['Problem solving', 'Breaks the problem down, considers several approaches, explains trade-offs'], ['Coding', 'Correct, readable, idiomatic code without heavy hints'], ['Verification', 'Tests own code, finds own bugs, handles edge cases'], ['Communication', 'Thinks aloud, checks assumptions, responds to hints'], ['Complexity', 'States time and space accurately and justifies them']])],
    ['The process in detail', OL([`<b>Clarify (2–3 min).</b> Restate the problem. Ask about input size (it tells you the target complexity: n ≤ 10⁵ means O(n log n) or better), value ranges, duplicates, sortedness, and what to return when there is no answer.`, `<b>Examples.</b> Write one normal example and one tricky one. Many solutions appear while doing this by hand.`, `<b>Brute force.</b> Say it out loud with its complexity. It proves you understand the problem and gives a fallback.`, `<b>Optimize.</b> Ask “what work is repeated?” (cache it), “what if it were sorted?”, “can a hash map make this lookup O(1)?”, “can I process it in one pass?”.`, `<b>Code.</b> Agree on the approach first. Write top-down: main function, then helpers.`, `<b>Test.</b> Trace your example line by line, then empty input, one element, duplicates, negatives, and the largest input.`])],
    ['Complexity targets by input size', TBL(['n up to', 'Acceptable complexity', 'Typical technique'], [['10–20', 'O(2ⁿ), O(n!)', 'Backtracking, bitmask DP'], ['500', 'O(n³)', 'Triple loops, interval DP'], ['5,000', 'O(n²)', 'Nested loops, 2D DP'], ['10⁵–10⁶', 'O(n log n) or O(n)', 'Sorting, heaps, two pointers, hashing'], ['10⁹+', 'O(log n) or O(1)', 'Binary search, math']])],
    ['When you are stuck', UL([`Solve a smaller version (n = 1, 2, 3) and look for a pattern.`, `Ask which data structure would make the slow step fast.`, `Consider sorting first, or working backwards.`, `Say what you are thinking: interviewers give hints to candidates who show their reasoning.`])]
  ],
  edge: [`Empty input, single element, two elements.`, `All elements equal; already sorted; reverse sorted.`, `Negative numbers and zero (products, sums, division).`, `Integer overflow (sum of large ints in Java/C++).`, `Duplicates in input or in the answer (dedupe results).`, `Off-by-one: inclusive vs exclusive bounds, loop end conditions.`, `Very large input: recursion depth limits (use iteration).`, `Strings: case, whitespace, Unicode, empty string.`],
  faq: [['How do I explain the complexity of a solution with a sort and a loop?', PP(`Add the phases and keep the dominant term: sorting is O(n log n), the scan is O(n), so overall O(n log n). Space: O(1) extra if sorting in place (O(log n) to O(n) depending on the language’s sort), plus any auxiliary structures.`)],
    ['What if I can’t find the optimal solution?', PP(`Deliver a correct brute force with clear complexity, then discuss how you would improve it. A working, well-tested O(n²) solution with good communication often scores better than a buggy attempt at O(n).`)],
    ['Should I use built-in libraries?', PP(`Yes for standard tools (sorting, hash maps, heaps, deques) unless the problem is to implement them. Know their complexities: Python’s list.pop(0) is O(n) (use collections.deque), and JavaScript has no built-in heap.`)]],
  qs: [SQ('n is up to 100,000. Which complexity should you aim for?', ['O(n²)', 'O(n log n) or better', 'O(2ⁿ)', 'O(n³)'], 1, '10¹⁰ operations for O(n²) is far too slow; 10⁵ × 17 for O(n log n) is fine.')]
});

IPT('ip-ds-cheat', { name: 'Data structures & Big-O cheat sheet', cat: 'ipswe', roles: ['swe', 'be', 'fe', 'fs'],
  blurb: `Choosing the right data structure is half of most solutions. Know each structure’s operations and costs, what it is built on, and the language-specific types that provide it.`,
  facts: [['Lookup by key', 'Hash map O(1)'], ['Ordered data', 'Balanced BST O(log n)'], ['Min/max quickly', 'Heap O(log n)'], ['FIFO', 'Queue / deque O(1)']],
  cheat: [['Array / list', 'Index O(1); append amortized O(1); insert/delete middle O(n); search O(n)'], ['Hash map / set', 'Get/put/delete O(1) average, O(n) worst; no order'], ['Stack', 'push/pop/peek O(1) (LIFO)'], ['Queue / deque', 'Push/pop both ends O(1) (FIFO)'], ['Heap', 'push/pop O(log n); peek min O(1); build O(n)'], ['Balanced BST', 'Search/insert/delete O(log n); sorted iteration'], ['Linked list', 'Insert/delete at known node O(1); search O(n)'], ['Trie', 'Insert/search O(word length)'], ['Graph (adj. list)', 'Space O(V + E); BFS/DFS O(V + E)'], ['Union–find', 'Union/find ≈ O(1) amortized'], ['Python', 'list, dict, set, collections.deque, heapq, bisect'], ['JavaScript', 'Array, Map, Set, Object; no heap (write one)'], ['Java', 'ArrayList, HashMap, HashSet, ArrayDeque, PriorityQueue, TreeMap'], ['C++', 'vector, unordered_map, set/map, deque, priority_queue']],
  sections: [
    ['Complexity classes', TBL(['Big-O', 'Name', 'Example'], [['O(1)', 'Constant', 'Hash lookup, array index'], ['O(log n)', 'Logarithmic', 'Binary search, heap push'], ['O(n)', 'Linear', 'One pass'], ['O(n log n)', 'Linearithmic', 'Sorting'], ['O(n²)', 'Quadratic', 'All pairs'], ['O(2ⁿ)', 'Exponential', 'All subsets'], ['O(n!)', 'Factorial', 'All permutations']]) + PP(`See the Algorithms course for full lessons on each structure.`)],
    ['Choosing a structure', TBL(['Need', 'Use'], [['Have I seen this before? Count occurrences?', 'Hash set / hash map'], ['Process in arrival order', 'Queue (BFS)'], ['Undo, matching brackets, DFS', 'Stack'], ['Repeatedly get the smallest/largest', 'Heap / priority queue'], ['Sorted order with inserts, floor/ceiling', 'Balanced BST (TreeMap, SortedList)'], ['Prefix search', 'Trie'], ['Range sum queries', 'Prefix sums (static), Fenwick/segment tree (dynamic)'], ['Groups that merge', 'Union–find'], ['LRU eviction', 'Hash map + doubly linked list']])],
    ['Amortized analysis', PP(`Dynamic arrays double their capacity when full. One append occasionally copies everything (O(n)), but n appends cost O(n) in total, so each is O(1) amortized. Hash tables resize the same way. “Amortized” means averaged over a sequence of operations, not averaged over random inputs.`)],
    ['Hash map internals (often asked)', UL([`A hash function maps a key to a bucket; collisions are handled by chaining or open addressing.`, `Load factor (entries ÷ buckets) triggers resizing, typically at 0.75.`, `Worst case O(n) when many keys collide; Java 8+ turns long chains into trees (O(log n)).`, `Keys must be immutable/hashable: equal objects must have equal hashes (override equals and hashCode together in Java).`])]
  ],
  snips: [['Python', 'python', `from collections import deque, Counter, defaultdict
import heapq, bisect

counts = Counter("mississippi")          # {'i': 4, 's': 4, 'p': 2, 'm': 1}
graph = defaultdict(list)                # adjacency list
q = deque([start]); q.append(x); q.popleft()     # O(1) queue
heap = []; heapq.heappush(heap, (dist, node)); heapq.heappop(heap)   # min-heap
max_heap = []; heapq.heappush(max_heap, -value)  # negate for max-heap
i = bisect.bisect_left(sorted_list, target)     # binary search`],
    ['JavaScript', 'javascript', `const counts = new Map();
for (const ch of "mississippi") counts.set(ch, (counts.get(ch) || 0) + 1);
const seen = new Set([1, 2, 3]);
const stack = []; stack.push(1); stack.pop();
// Queue: avoid shift() in hot loops (O(n)); use an index pointer
const q = [start]; let head = 0; while (head < q.length) { const x = q[head++]; /* ... */ }
// Map keeps insertion order; object keys are always strings`],
    ['Java', 'java', `Map<Character, Integer> counts = new HashMap<>();
for (char c : "mississippi".toCharArray()) counts.merge(c, 1, Integer::sum);
Deque<Integer> stack = new ArrayDeque<>(); stack.push(1); stack.pop();
Queue<Integer> q = new ArrayDeque<>(); q.offer(1); q.poll();
PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0]);   // beware overflow: use Integer.compare
TreeMap<Integer, String> tm = new TreeMap<>(); tm.floorKey(10); tm.ceilingKey(10);`]],
  edge: [`Using a mutable object (list) as a dict key in Python: not hashable.`, `JavaScript objects as maps: keys become strings ("1" and 1 collide), and inherited keys like "constructor" exist; use Map.`, `Java comparator a - b overflows for large ints; use Integer.compare(a, b).`, `Python heapq is a min-heap only; tuples compare element by element (add a tiebreaker if items aren’t comparable).`, `Removing from a list while iterating over it skips elements.`, `Recursion depth: Python’s default limit is ~1,000 frames.`],
  faq: [['Hash map vs balanced BST: when do you pick each?', PP(`Hash map for fastest average lookups when order doesn’t matter. Balanced BST (TreeMap, std::map) when you need sorted iteration, range queries, or floor/ceiling lookups, with guaranteed O(log n) even on adversarial keys.`)],
    ['Why is building a heap O(n) and not O(n log n)?', PP(`Bottom-up heapify sifts down from the last parent. Most nodes are near the leaves and move only a level or two; summing the work over all levels gives a geometric series bounded by 2n.`)]],
  qs: [SQ('You need to repeatedly remove the earliest deadline task while adding new tasks. Best structure?', ['Sorted array', 'Min-heap keyed by deadline', 'Hash map', 'Stack'], 1, 'Heaps give O(log n) insert and remove-min.')]
});

IPT('ip-oop', { name: 'OOP & SOLID', cat: 'ipswe', roles: ['swe', 'be'],
  blurb: `Object-oriented design questions check that you can model a problem with classes that are easy to change. Know the four pillars, composition vs inheritance, and the SOLID principles, with concrete examples of each.`,
  facts: [['Pillars', 'Encapsulation, abstraction, inheritance, polymorphism'], ['Prefer', 'Composition over inheritance'], ['Principles', 'SOLID'], ['Interview format', 'Design a parking lot / library / elevator']],
  cheat: [['Encapsulation', 'Hide state behind methods; enforce invariants'], ['Abstraction', 'Expose what, hide how (interfaces)'], ['Inheritance', '“Is-a”; reuse via subclassing; fragile if deep'], ['Polymorphism', 'Same call, different behavior (overriding, interfaces)'], ['Composition', '“Has-a”; assemble behavior from parts'], ['S · Single responsibility', 'One reason to change per class'], ['O · Open/closed', 'Extend with new code, don’t edit old'], ['L · Liskov substitution', 'Subtypes usable wherever the base is'], ['I · Interface segregation', 'Small, focused interfaces'], ['D · Dependency inversion', 'Depend on abstractions; inject dependencies'], ['Overloading', 'Same name, different parameters (compile time)'], ['Overriding', 'Subclass replaces a method (run time)']],
  sections: [
    ['The four pillars with examples', UL([`<b>Encapsulation:</b> a BankAccount keeps balance private and exposes deposit() and withdraw(), which reject negative amounts and overdrafts. Callers can’t break the invariant.`, `<b>Abstraction:</b> a PaymentProcessor interface with charge(amount); callers don’t care whether Stripe or PayPal is behind it.`, `<b>Inheritance:</b> SavingsAccount extends Account and adds interest. Use sparingly: deep hierarchies are rigid.`, `<b>Polymorphism:</b> shapes.forEach(s =&gt; s.area()) works for Circle and Square alike.`])],
    ['SOLID with violations and fixes', TBL(['Principle', 'Violation', 'Fix'], [['SRP', 'A Report class that computes, formats as PDF and emails', 'Split into ReportCalculator, PdfFormatter, Mailer'], ['OCP', 'A switch on payment type edited for every new method', 'A PaymentMethod interface; add new classes'], ['LSP', 'Square extends Rectangle but setWidth also changes height', 'Don’t inherit; model both as Shape'], ['ISP', 'One Worker interface with work() and eat() for robots too', 'Split into Workable and Eatable'], ['DIP', 'OrderService creates new MySqlRepository() inside', 'Accept a Repository interface in the constructor']])],
    ['Composition over inheritance', PP(`Inheritance couples a subclass to its parent’s internals, and hierarchies explode when features combine (FlyingSwimmingDuck). Composition gives objects behaviors as fields (a Duck has a FlyBehavior and a QuackBehavior), so you can mix and swap them at runtime. Use inheritance for genuine “is-a” relationships with a stable base; otherwise compose.`)],
    ['Answering “design a parking lot”', OL([`Clarify requirements: vehicle types, spot sizes, multiple levels, payment, entry/exit gates.`, `Identify nouns → classes: ParkingLot, Level, Spot (Compact/Large/Motorcycle), Vehicle (Car/Truck/Motorcycle), Ticket, Payment.`, `Identify verbs → methods: parkVehicle, unpark, findSpot, calculateFee.`, `Define relationships: a lot has levels; a level has spots; a ticket links a vehicle and spot.`, `Apply patterns where natural: a strategy for pricing, a factory for vehicles, a singleton (carefully) for the lot.`, `Discuss concurrency (two cars taking the same spot), extensibility (EV charging spots) and testing.`])]
  ],
  snips: [['Java', 'java', `// Dependency inversion + open/closed: add payment methods without editing Checkout
interface PaymentMethod { void pay(long cents); }

final class CardPayment implements PaymentMethod {
    public void pay(long cents) { /* call card gateway */ }
}
final class WalletPayment implements PaymentMethod {
    public void pay(long cents) { /* call wallet API */ }
}

final class Checkout {
    private final PaymentMethod payment;          // depends on the abstraction
    Checkout(PaymentMethod payment) { this.payment = payment; }   // injected
    void complete(long cents) {
        if (cents <= 0) throw new IllegalArgumentException("amount must be positive");
        payment.pay(cents);
    }
}

// Encapsulation: the invariant balance >= 0 can't be broken from outside
final class Account {
    private long balance;
    void withdraw(long cents) {
        if (cents <= 0 || cents > balance) throw new IllegalArgumentException("invalid amount");
        balance -= cents;
    }
    long balance() { return balance; }
}`],
    ['Python', 'python', `from abc import ABC, abstractmethod

class PaymentMethod(ABC):
    @abstractmethod
    def pay(self, cents: int) -> None: ...

class CardPayment(PaymentMethod):
    def pay(self, cents: int) -> None:
        print(f"charging card {cents}")

class Checkout:
    def __init__(self, payment: PaymentMethod):   # dependency injection
        self._payment = payment

    def complete(self, cents: int) -> None:
        if cents <= 0:
            raise ValueError("amount must be positive")
        self._payment.pay(cents)

# Composition: behaviors as fields instead of a class per combination
class Duck:
    def __init__(self, fly, quack):
        self.fly, self.quack = fly, quack`],
    ['TypeScript', 'typescript', `interface PaymentMethod { pay(cents: number): Promise<void>; }

class CardPayment implements PaymentMethod {
  async pay(cents: number) { /* call gateway */ }
}

class Checkout {
  constructor(private readonly payment: PaymentMethod) {}   // injected
  async complete(cents: number) {
    if (cents <= 0) throw new RangeError("amount must be positive");
    await this.payment.pay(cents);
  }
}`]],
  edge: [`Equality: override equals and hashCode together (Java) or __eq__ and __hash__ (Python), or hash-based collections break.`, `Calling overridable methods from a constructor sees a half-initialized subclass.`, `Mutable objects returned from getters leak internal state; return copies or immutable views.`, `Multiple inheritance (Python MRO, C++ diamond) causes surprising method resolution.`, `Singletons make testing hard and hide dependencies; prefer injected single instances.`],
  faq: [['Abstract class vs interface?', PP(`An interface defines a contract (what) with no state; a class can implement many. An abstract class can hold shared state and partial implementation (how) but a class extends only one (in Java/C#). Use interfaces for capabilities (Comparable, PaymentMethod) and abstract classes for a family sharing code. Modern Java interfaces can have default methods, which blurs the line.`)],
    ['What is the Liskov substitution principle, in one sentence with an example?', PP(`Any code that works with a base type must keep working with any subtype: if Square extends Rectangle and setWidth on a Square also changes its height, code that sets width and height independently breaks, so Square shouldn’t be a subtype of a mutable Rectangle.`)]],
  qs: [SQ('OrderService does “new MySqlRepository()” internally, making it hard to test. Which principle helps?', ['Single responsibility', 'Dependency inversion (inject an abstraction)', 'Liskov substitution', 'Interface segregation'], 1, 'Depend on a Repository interface and pass the implementation in.')]
});

IPT('ip-patterns', { name: 'Design patterns', cat: 'ipswe', roles: ['swe', 'be', 'fe'],
  blurb: `Design patterns are named solutions to recurring design problems. Interviewers expect you to recognize when one fits, implement the common ones, and avoid forcing them where plain code is clearer.`,
  facts: [['Creational', 'Factory, Builder, Singleton'], ['Structural', 'Adapter, Decorator, Facade, Proxy'], ['Behavioral', 'Strategy, Observer, Command, State'], ['Rule', 'Use when it removes complexity']],
  cheat: [['Factory', 'Create objects without naming concrete classes'], ['Builder', 'Step-by-step construction of complex objects'], ['Singleton', 'One instance; prefer DI-managed single instance'], ['Adapter', 'Make an incompatible interface fit'], ['Decorator', 'Wrap to add behavior (logging, caching) without subclassing'], ['Facade', 'Simple API over a complex subsystem'], ['Proxy', 'Stand-in that controls access (lazy load, cache, auth)'], ['Strategy', 'Swap algorithms behind one interface'], ['Observer / pub-sub', 'Notify subscribers of changes'], ['Command', 'Encapsulate an action (undo, queues)'], ['State', 'Behavior changes with internal state'], ['Iterator', 'Traverse without exposing internals'], ['Dependency injection', 'Pass dependencies in instead of creating them'], ['Repository', 'Collection-like access to persistence']],
  sections: [
    ['Where you meet them', TBL(['Pattern', 'Real-world example'], [['Observer', 'DOM events, React state subscriptions, Redux store, message buses'], ['Decorator', 'Python decorators, Express/Koa middleware, Java I/O streams'], ['Strategy', 'Sorting with a comparator, payment or pricing rules'], ['Factory', 'document.createElement, logging libraries choosing a handler'], ['Adapter', 'Wrapping a third-party SDK behind your own interface'], ['Proxy', 'ORM lazy loading, JavaScript Proxy for reactivity (Vue)'], ['Builder', 'Query builders, StringBuilder, HTTP request builders'], ['Command', 'Undo/redo stacks, job queues']])],
    ['When not to use them', UL([`A Strategy interface with one implementation is just indirection.`, `Singletons are global state: hidden coupling, hard to test, thread-safety issues.`, `In languages with first-class functions, many patterns collapse into a function (Strategy = pass a function; Command = a closure).`])],
    ['How to talk about patterns in interviews', PP(`Lead with the problem (“new payment types keep requiring edits to Checkout”), then name the pattern as the fix (“so each payment method becomes a Strategy behind one interface”), then mention the trade-off (“one more interface, but adding a method no longer touches existing code”).`)]
  ],
  snips: [['Observer (JS)', 'javascript', `class EventEmitter {
  #handlers = new Map();
  on(event, fn) {
    if (!this.#handlers.has(event)) this.#handlers.set(event, new Set());
    this.#handlers.get(event).add(fn);
    return () => this.#handlers.get(event)?.delete(fn);   // unsubscribe
  }
  emit(event, ...args) {
    for (const fn of [...(this.#handlers.get(event) || [])]) fn(...args);   // copy: handlers may unsubscribe
  }
}
const bus = new EventEmitter();
const off = bus.on("order:paid", o => console.log("email for", o.id));
bus.emit("order:paid", { id: 42 });
off();`],
    ['Decorator (Python)', 'python', `import functools, time

def retry(times=3, delay=0.1):
    def wrap(fn):
        @functools.wraps(fn)                 # keep name and docstring
        def inner(*args, **kwargs):
            for attempt in range(times):
                try:
                    return fn(*args, **kwargs)
                except ConnectionError:
                    if attempt == times - 1:
                        raise
                    time.sleep(delay * 2 ** attempt)
        return inner
    return wrap

@retry(times=5)
def fetch_rates():
    ...`],
    ['Strategy & Factory (TS)', 'typescript', `type Pricing = (base: number) => number;           // strategy as a function
const strategies: Record<string, Pricing> = {
  regular: b => b,
  sale: b => b * 0.8,
  member: b => Math.max(0, b - 5),
};
function priceFor(kind: string, base: number) {      // factory-style lookup
  const s = strategies[kind];
  if (!s) throw new Error("unknown pricing: " + kind);
  return s(base);
}`],
    ['Builder (Java)', 'java', `public final class HttpRequest {
    private final String url, method; private final Map<String, String> headers;
    private HttpRequest(Builder b) { url = b.url; method = b.method; headers = Map.copyOf(b.headers); }
    public static Builder to(String url) { return new Builder(url); }
    public static final class Builder {
        private final String url; private String method = "GET"; private final Map<String, String> headers = new HashMap<>();
        private Builder(String url) { this.url = Objects.requireNonNull(url); }
        public Builder method(String m) { this.method = m; return this; }
        public Builder header(String k, String v) { headers.put(k, v); return this; }
        public HttpRequest build() { return new HttpRequest(this); }
    }
}
// HttpRequest r = HttpRequest.to("https://api.example.com").method("POST").header("Accept", "application/json").build();`]],
  edge: [`Observer: handlers that unsubscribe during emit (iterate over a copy), memory leaks from never unsubscribing (React effects need cleanup).`, `Singleton in multithreaded code: lazy initialization needs synchronization (or use an enum / module-level instance).`, `Decorators that don’t preserve function metadata (use functools.wraps).`, `Builder: validate required fields in build(), not later.`],
  faq: [['Decorator vs inheritance for adding logging?', PP(`A decorator wraps any implementation of an interface at runtime and can be stacked (logging + caching + retries) without a subclass per combination. Inheritance fixes behavior at compile time and multiplies classes.`)],
    ['How would you implement undo/redo?', PP(`Command pattern: each action is an object with execute() and undo(). Keep two stacks; executing pushes onto undo and clears redo; undo pops from undo, calls undo(), pushes onto redo. For complex state, store snapshots (memento) or use immutable state.`)]],
  qs: [SQ('Express middleware that adds logging around every request is closest to which pattern?', ['Singleton', 'Decorator / chain of responsibility', 'Builder', 'Factory'], 1, 'Each middleware wraps the next handler and adds behavior.')]
});

IPT('ip-concurrency', { name: 'Concurrency & async', cat: 'ipswe', roles: ['swe', 'be'],
  blurb: `Concurrency is doing several things in overlapping time; parallelism is doing them at the same instant on multiple cores. Interviews probe race conditions, locks, deadlocks, and the difference between threads, processes and async I/O.`,
  facts: [['Shared memory', 'Threads'], ['Isolation', 'Processes'], ['I/O-bound', 'async / event loop'], ['Classic bugs', 'Races, deadlocks']],
  cheat: [['Process', 'Own memory space; isolated; heavier'], ['Thread', 'Shares memory with siblings; needs synchronization'], ['Async / event loop', 'One thread interleaves many I/O tasks'], ['Race condition', 'Result depends on timing of unsynchronized access'], ['Critical section', 'Code touching shared state; protect it'], ['Mutex / lock', 'One holder at a time'], ['Semaphore', 'Up to N holders (connection limits)'], ['Atomic', 'Indivisible operation (compare-and-swap)'], ['Deadlock', 'Circular wait for locks'], ['Livelock / starvation', 'Busy but no progress / never scheduled'], ['Thread pool', 'Reuse threads for many tasks'], ['GIL (CPython)', 'One thread runs Python bytecode at a time; use processes for CPU work'], ['Volatile / memory model', 'Visibility of writes across threads']],
  sections: [
    ['Choosing a model', TBL(['Workload', 'Best fit', 'Why'], [['Many network/disk waits (web servers, scrapers)', 'Async I/O or threads', 'Waiting doesn’t need CPU'], ['CPU-heavy (image processing, number crunching)', 'Processes / threads in languages without a GIL', 'Uses multiple cores'], ['Isolation and fault tolerance', 'Processes', 'A crash doesn’t corrupt others'], ['Simple background jobs', 'A job queue with workers', 'Durable, retryable']])],
    ['Race conditions', PP(`<code>count += 1</code> is read–modify–write. Two threads can both read 5 and both write 6, losing an update. Fixes: a lock around the critical section, an atomic increment, confinement (only one thread owns the data), or immutable data. The same race happens across servers on a database row; there you use transactions, row locks or atomic SQL updates.`)],
    ['Deadlock', PP(`Four conditions must all hold: mutual exclusion, hold-and-wait, no preemption, and circular wait. Thread 1 holds lock A and waits for B; thread 2 holds B and waits for A. Prevention: always acquire locks in a global order, use timeouts (tryLock), hold one lock at a time, or design lock-free with message passing.`)],
    ['Async/await', PP(`async functions run until an await on something not ready, then yield to the event loop, which runs other tasks; when the I/O completes, the function resumes. It scales to thousands of concurrent connections on one thread, but CPU-heavy work blocks everything, and forgetting to await (or awaiting sequentially when calls could run in parallel) are common bugs.`)],
    ['Producer–consumer', PP(`A bounded queue between producers and consumers decouples their speeds and provides backpressure: when the queue is full, producers block. Built in as BlockingQueue (Java), queue.Queue / asyncio.Queue (Python) and channels (Go).`)]
  ],
  snips: [['Python', 'python', `import threading, asyncio
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor

# Race condition fixed with a lock
counter = 0
lock = threading.Lock()
def work():
    global counter
    for _ in range(100_000):
        with lock:              # critical section
            counter += 1

# I/O-bound: run requests concurrently
async def fetch_all(urls, session):
    return await asyncio.gather(*(session.get(u) for u in urls))   # parallel, not sequential awaits

# CPU-bound: sidestep the GIL with processes
with ProcessPoolExecutor() as pool:
    results = list(pool.map(heavy_function, items))`],
    ['Java', 'java', `// Atomic counter instead of synchronized
AtomicLong counter = new AtomicLong();
ExecutorService pool = Executors.newFixedThreadPool(8);
for (int i = 0; i < 8; i++) pool.submit(() -> { for (int j = 0; j < 100_000; j++) counter.incrementAndGet(); });
pool.shutdown(); pool.awaitTermination(1, TimeUnit.MINUTES);

// Avoid deadlock: always lock accounts in id order
void transfer(Account a, Account b, long cents) {
    Account first = a.id() < b.id() ? a : b, second = first == a ? b : a;
    synchronized (first) { synchronized (second) { a.withdraw(cents); b.deposit(cents); } }
}`],
    ['JavaScript', 'javascript', `// Sequential (slow): total time = sum of all calls
for (const id of ids) results.push(await getUser(id));

// Concurrent (fast): total time ≈ slowest call
const results = await Promise.all(ids.map(getUser));

// Limit concurrency to n at a time
async function mapLimit(items, n, fn) {
  const out = new Array(items.length); let next = 0;
  async function worker() { while (next < items.length) { const i = next++; out[i] = await fn(items[i]); } }
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, worker));
  return out;
}`]],
  edge: [`Check-then-act races: “if not exists then insert” needs a unique constraint or lock, not two steps.`, `Double-checked locking without volatile (Java) is broken.`, `Holding a lock while doing I/O or calling unknown code invites deadlocks and stalls.`, `Promise.all rejects on the first failure; use Promise.allSettled to collect every result.`, `Blocking calls (time.sleep, synchronous file reads) inside async code freeze the event loop.`, `Thread-unsafe collections (HashMap, ArrayList) used from several threads corrupt silently.`],
  faq: [['Process vs thread?', PP(`A process has its own address space; a crash or memory bug stays inside it, and communication needs IPC. Threads share the process’s memory, so they communicate cheaply but must synchronize access. Threads are lighter to create and switch.`)],
    ['How does Python handle concurrency given the GIL?', PP(`The GIL lets only one thread execute Python bytecode at a time, but it is released during I/O, so threads work for I/O-bound tasks. For CPU-bound work use multiprocessing or native extensions (NumPy releases the GIL). asyncio handles many I/O tasks on one thread. Python 3.13+ has an experimental free-threaded build.`)],
    ['Explain a deadlock and how you’d prevent it.', PP(`Two threads each hold a lock the other needs, waiting forever. Prevent by acquiring locks in a consistent global order, using timeouts with retry, reducing lock scope, or avoiding shared locks with message passing.`)]],
  qs: [SQ('A Node.js API becomes unresponsive while computing a large report synchronously. Why?', ['Too many threads', 'CPU-bound work blocks the single event-loop thread', 'Promises are slow', 'The GIL'], 1, 'Move heavy work to worker threads, a child process or a job queue.')]
});

IPT('ip-testing', { name: 'Testing', cat: 'ipswe', roles: ['swe', 'fe', 'be', 'fs'],
  blurb: `Tests let you change code with confidence. Know the test pyramid, what to mock and what not to, how to write tests that catch real bugs, and how testing fits into CI.`,
  facts: [['Most tests', 'Unit (fast, many)'], ['Fewer', 'Integration'], ['Fewest', 'End-to-end'], ['Pattern', 'Arrange–Act–Assert']],
  cheat: [['Unit test', 'One function/class in isolation; milliseconds'], ['Integration test', 'Several parts together (API + DB)'], ['End-to-end (E2E)', 'Real user flows in a browser (Playwright, Cypress)'], ['Test double', 'Stub (canned answers), mock (verifies calls), fake (working lightweight impl), spy'], ['AAA', 'Arrange inputs, Act, Assert outcome'], ['TDD', 'Red → green → refactor'], ['Coverage', 'Lines executed; not a quality guarantee'], ['Flaky test', 'Passes and fails without code changes (timing, order, network)'], ['Snapshot test', 'Compare output to a stored snapshot (UI)'], ['Property-based', 'Generate many inputs, assert invariants (Hypothesis, fast-check)'], ['Contract test', 'Verify API consumers and providers agree'], ['Tools', 'pytest, Jest/Vitest, JUnit, Testing Library, Playwright']],
  sections: [
    ['The test pyramid', PP(`Many fast unit tests at the base, fewer integration tests in the middle, a handful of end-to-end tests for critical journeys at the top. Unit tests pinpoint bugs and run in seconds; E2E tests catch wiring problems but are slow and flakier. Frontend teams often prefer a “testing trophy” weighted toward integration tests of components with real rendering.`)],
    ['What makes a good test', UL([`Tests behavior through the public interface, not implementation details, so refactoring doesn’t break it.`, `One reason to fail, with a descriptive name: <code>test_withdraw_more_than_balance_raises</code>.`, `Deterministic: control time, randomness and network.`, `Covers boundaries and failure paths, not only the happy path.`, `Fast and independent: no shared state or order dependence.`])],
    ['Mocking well', PP(`Mock at boundaries you don’t own or that are slow/nondeterministic: HTTP calls, payment gateways, clocks, randomness. Don’t mock the code under test or simple value objects. Over-mocking produces tests that pass while the real integration is broken; balance with integration tests against a real database (e.g. in a container).`)],
    ['Frontend testing', UL([`Testing Library: query by role and label like a user (<code>getByRole('button', { name: /save/i })</code>), not by CSS class.`, `Mock network with MSW so components fetch realistically.`, `Test accessibility (roles, labels) and loading/error states.`, `E2E with Playwright for login, checkout and other critical flows.`])]
  ],
  snips: [['pytest', 'python', `import pytest
from bank import Account, InsufficientFunds

def test_withdraw_reduces_balance():
    acct = Account(balance=100)          # Arrange
    acct.withdraw(30)                    # Act
    assert acct.balance == 70            # Assert

@pytest.mark.parametrize("amount", [0, -5, 101])
def test_invalid_withdrawals_raise(amount):
    with pytest.raises((ValueError, InsufficientFunds)):
        Account(balance=100).withdraw(amount)

def test_charge_calls_gateway(mocker):
    gateway = mocker.Mock()
    Checkout(gateway).complete(500)
    gateway.charge.assert_called_once_with(500)`],
    ['Jest + Testing Library', 'javascript', `import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Counter from "./Counter";

test("increments when the button is clicked", async () => {
  render(<Counter initial={1} />);
  await userEvent.click(screen.getByRole("button", { name: /increment/i }));
  expect(screen.getByText("Count: 2")).toBeInTheDocument();
});

test("debounce calls once after the wait", () => {
  jest.useFakeTimers();
  const fn = jest.fn(); const d = debounce(fn, 300);
  d(); d(); d();
  jest.advanceTimersByTime(300);
  expect(fn).toHaveBeenCalledTimes(1);
});`],
    ['JUnit 5', 'java', `class AccountTest {
    @Test void withdrawReducesBalance() {
        Account a = new Account(100);
        a.withdraw(30);
        assertEquals(70, a.balance());
    }
    @ParameterizedTest @ValueSource(longs = {0, -5, 101})
    void invalidWithdrawalsThrow(long amount) {
        assertThrows(IllegalArgumentException.class, () -> new Account(100).withdraw(amount));
    }
}`]],
  edge: [`Time-dependent code: inject a clock instead of calling now() directly.`, `Floating-point assertions: compare with a tolerance (pytest.approx, toBeCloseTo).`, `Tests sharing a database without cleanup become order-dependent.`, `Async tests that don’t await (or return) the promise pass vacuously.`, `Time zones and locales differ between developer machines and CI.`],
  faq: [['How do you test code that calls an external API?', PP(`Wrap the API behind an interface you own. Unit-test your logic with a stub of that interface (including error and timeout cases). Add a few integration tests against a sandbox or a recorded/mock server, and contract tests if another team owns the API.`)],
    ['Is 100% coverage a good goal?', PP(`Coverage shows what code ran, not whether behavior was checked. Aim for high coverage of critical logic and meaningful assertions, including edge cases; chasing 100% often produces brittle tests of trivial code.`)]],
  qs: [SQ('A test passes locally but fails randomly in CI. The most likely cause?', ['Too many assertions', 'Non-determinism: timing, shared state, order dependence or real network calls', 'Low coverage', 'Using AAA'], 1, 'Flaky tests come from uncontrolled time, randomness, concurrency or external dependencies.')]
});

IPT('ip-git', { name: 'Git, code review & CI', cat: 'ipswe', roles: ['swe', 'fe', 'be', 'fs'],
  blurb: `Every team expects fluent Git: branching, merging vs rebasing, resolving conflicts, recovering mistakes, and working through pull requests with code review and continuous integration.`,
  facts: [['Model', 'Commits form a DAG'], ['Integrate', 'merge or rebase'], ['Undo safely', 'git revert'], ['Workflow', 'Branch → PR → review → CI → merge']],
  cheat: [['git status / diff', 'What changed (unstaged, staged with --staged)'], ['git add -p', 'Stage hunks interactively'], ['git commit -m', 'Record a snapshot'], ['git switch -c feat', 'Create and switch to a branch'], ['git fetch / pull', 'Download / download + integrate'], ['git merge main', 'Join histories with a merge commit'], ['git rebase main', 'Replay your commits on top of main (linear history)'], ['git rebase -i HEAD~3', 'Squash, reorder, edit recent commits'], ['git stash', 'Shelve uncommitted work'], ['git revert <sha>', 'New commit undoing a commit (safe on shared branches)'], ['git reset --soft/--hard', 'Move branch pointer (hard discards work!)'], ['git reflog', 'Find “lost” commits after resets'], ['git cherry-pick <sha>', 'Copy one commit onto this branch'], ['git bisect', 'Binary-search history for the commit that broke something'], ['git blame / log -S', 'Who changed a line / when a string appeared']],
  sections: [
    ['Merge vs rebase', TBL(['', 'Merge', 'Rebase'], [['History', 'Preserves true history with merge commits', 'Linear, as if you started from the latest main'], ['Safety', 'Never rewrites shared history', 'Rewrites your commits (new SHAs)'], ['Rule', 'Fine anywhere', 'Only rebase commits not yet shared; never rebase a public branch'], ['Conflicts', 'Resolved once', 'May be resolved per replayed commit']])],
    ['Resolving conflicts', OL([`Run git status to see conflicted files.`, `Edit each file between &lt;&lt;&lt;&lt;&lt;&lt;&lt;, =======, &gt;&gt;&gt;&gt;&gt;&gt;&gt; markers to the correct combined result.`, `Run the tests.`, `git add the files, then git commit (merge) or git rebase --continue.`, `If it goes badly: git merge --abort or git rebase --abort.`])],
    ['Branching strategies', TBL(['Strategy', 'How', 'Good for'], [['Trunk-based', 'Short-lived branches merged to main daily; feature flags for unfinished work', 'Continuous delivery, most modern teams'], ['GitHub flow', 'Branch → PR → review → merge → deploy', 'Web apps'], ['Git flow', 'develop, release and hotfix branches', 'Versioned releases (mobile apps, libraries)']])],
    ['Code review', UL([`As an author: small focused PRs, a clear description (why, what, how tested), self-review first.`, `As a reviewer: correctness, edge cases, tests, readability, security; suggest rather than demand; separate must-fix from nits.`, `Automate style with linters and formatters so reviews focus on substance.`])],
    ['CI basics', PP(`On every push and PR, CI runs install → lint → type-check → unit tests → build → integration tests, and blocks merging when they fail. CD then deploys main automatically, often through staging and canary steps (see System Design → Deployments).`)]
  ],
  snips: [['Shell', 'bash', `# Update your feature branch with the latest main (linear history)
git fetch origin
git rebase origin/main          # resolve conflicts, then: git rebase --continue
git push --force-with-lease     # safe force-push of your own branch only

# Squash the last 3 commits into one before opening a PR
git rebase -i HEAD~3            # mark commits as "squash" or "fixup"

# Undo a bad commit that is already on main
git revert 3f2a9c1

# Recover after an accidental hard reset
git reflog                      # find the SHA
git reset --hard <sha>

# Find the commit that broke a test
git bisect start; git bisect bad; git bisect good v1.4.0
git bisect run npm test`],
    ['GitHub Actions', 'yaml', `name: ci
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run lint && npm run typecheck
      - run: npm test -- --coverage
      - run: npm run build`]],
  edge: [`Force-pushing a shared branch erases teammates’ commits: use --force-with-lease and only on your branches.`, `Committed secrets stay in history even after deletion: rotate the secret, then purge history.`, `Line-ending (CRLF/LF) churn across OSes: configure .gitattributes.`, `Large binaries bloat repos: use Git LFS.`, `Detached HEAD: commits there are easy to lose; create a branch.`],
  faq: [['How do you undo a commit that has already been pushed?', PP(`Use git revert, which adds a new commit reversing the change without rewriting shared history. Use reset only for local, unpushed commits.`)],
    ['What is the difference between git fetch and git pull?', PP(`fetch downloads remote commits and updates remote-tracking branches without touching your work. pull = fetch + merge (or rebase, with --rebase) into your current branch.`)]],
  qs: [SQ('You need to undo a commit on the shared main branch. Safest command?', ['git reset --hard HEAD~1 and force-push', 'git revert <sha>', 'git checkout .', 'Delete the repository'], 1, 'Revert creates a new commit and doesn’t rewrite history others depend on.')]
});
