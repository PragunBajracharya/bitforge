/* ===== Interview prep E: TypeScript, OS, networking, low-level design, career, analyst interviews ===== */
SD_CATS.push(['ipcs', 'CS fundamentals'], ['ipda', 'Data analyst']);

IPT('ip-typescript', { name: 'TypeScript', cat: 'ipfe', roles: ['fe', 'fs', 'swe'],
  blurb: `TypeScript adds a static type system to JavaScript and is now the default for frontend and Node codebases. Interviews check that you can type real code (functions, objects, unions, generics), narrow safely, and know where the types stop protecting you.`,
  facts: [['Types exist', 'compile time only'], ['Typing', 'structural'], ['Key tools', 'unions, generics, narrowing'], ['Escape hatch', 'unknown, not any']],
  cheat: [['type vs interface', 'Both describe object shapes; interfaces merge and extend, types handle unions and mapped types'], ['Union / narrowing', 'string | number, then typeof / in / instanceof / discriminant checks'], ['Discriminated union', '{ kind: "ok", data } | { kind: "err", error } and switch on kind'], ['Generics', 'function first<T>(xs: T[]): T | undefined'], ['Constraints', '<T extends { id: string }>'], ['keyof / indexed', 'keyof User, User["email"]'], ['Utility types', 'Partial, Required, Pick, Omit, Record, Readonly, ReturnType, Awaited'], ['unknown vs any', 'unknown must be narrowed before use; any turns checking off'], ['never', 'Exhaustiveness: const _x: never = value in the default branch'], ['satisfies', 'Checks a value matches a type but keeps its narrower inferred type'], ['as const', 'Literal, readonly types for constant data'], ['Strictness', 'Turn on "strict": true (strictNullChecks, noImplicitAny)']],
  sections: [
    ['Structural typing', PP(`TypeScript compares shapes, not names: any object with the required properties fits a type, even if it was never declared as that type. This matches how JavaScript code is written, but it also means two unrelated types with the same fields are interchangeable. Use “branded” types (string & { __brand: "UserId" }) when you need IDs that can’t be mixed up.`)],
    ['Unions and narrowing', PP(`A union says a value is one of several types; TypeScript then requires you to check which before using type-specific features. It narrows automatically after typeof, instanceof, the in operator, equality checks and user-defined type guards (function isCat(a: Animal): a is Cat). Discriminated unions with a literal kind field are the most robust pattern for state machines and API results.`)],
    ['Generics', PP(`Generics let a function or type work over many types while keeping the relationship between input and output: identity<T>(x: T): T returns exactly what it got. Constrain them (T extends HasId) when the body needs certain properties, and let inference fill them in at call sites. Overusing generics makes signatures unreadable; prefer concrete types when only one is ever used.`)],
    ['Types and runtime', UL([`Types are erased when compiled: there are no runtime checks. Data from JSON, APIs, forms and localStorage is really unknown, so validate it at the boundary with a schema library (Zod, Valibot) that also infers the type.`, `Type assertions (x as User) tell the compiler to trust you; they’re unchecked and a common source of runtime bugs.`, `Enums generate runtime code; many teams prefer string literal unions (type Role = "admin" | "user") plus as const objects.`])],
    ['Typing React and APIs', UL([`Props: type Props = { title: string; onSave?: (v: string) => void; children?: React.ReactNode }.`, `Events: React.ChangeEvent<HTMLInputElement>; refs: useRef<HTMLDivElement>(null).`, `Share API types with the backend through OpenAPI codegen, tRPC or a shared package so client and server can’t drift.`])]
  ],
  snips: [['Narrowing', 'typescript', `type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function show(r: Result<number>) {
  if (r.ok) {
    return r.data.toFixed(2);       // narrowed: data exists
  }
  return "Error: " + r.error;       // narrowed: error exists
}

type Shape = { kind: "circle"; r: number } | { kind: "rect"; w: number; h: number };
function area(s: Shape): number {
  switch (s.kind) {
    case "circle": return Math.PI * s.r ** 2;
    case "rect": return s.w * s.h;
    default: { const never: never = s; return never; }  // compile error if a case is missing
  }
}`],
    ['Generics', 'typescript', `function groupBy<T, K extends PropertyKey>(items: T[], key: (x: T) => K): Record<K, T[]> {
  const out = {} as Record<K, T[]>;
  for (const item of items) (out[key(item)] ??= []).push(item);
  return out;
}

const byRole = groupBy([{ name: "Ana", role: "admin" }, { name: "Bo", role: "user" }], u => u.role);
// byRole: Record<string, { name: string; role: string }[]>

function pluck<T, K extends keyof T>(xs: T[], k: K): T[K][] {
  return xs.map(x => x[k]);
}`],
    ['Utility types', 'typescript', `interface User { id: string; email: string; name: string; admin: boolean }

type NewUser = Omit<User, "id">;                 // for create forms
type UserPatch = Partial<Pick<User, "email" | "name">>;
type UserMap = Record<string, User>;
type ApiUser = Readonly<User>;

const config = { retries: 3, mode: "fast" } as const;   // { readonly retries: 3; readonly mode: "fast" }
const routes = { home: "/", user: "/u/:id" } satisfies Record<string, string>;`],
    ['Runtime validation', 'typescript', `import { z } from "zod";

const UserSchema = z.object({ id: z.string(), email: z.string().email(), age: z.number().int().min(0) });
type User = z.infer<typeof UserSchema>;          // type derived from the schema

async function getUser(id: string): Promise<User> {
  const json: unknown = await (await fetch("/api/users/" + id)).json();
  return UserSchema.parse(json);                 // throws if the API sends the wrong shape
}`]],
  edge: [`JSON.parse returns any: annotate as unknown and validate.`, `Optional properties (x?: string) vs x: string | undefined differ under exactOptionalPropertyTypes.`, `Array index access returns T, not T | undefined, unless noUncheckedIndexedAccess is on.`, `Object.keys(obj) returns string[], not (keyof T)[], because objects can have extra keys.`, `Excess property checks only apply to object literals, not to variables.`],
  faq: [['type or interface?', PP(`Either works for object shapes. Interfaces support declaration merging and extends, and give clearer error messages for large object hierarchies; type aliases are needed for unions, mapped and conditional types. Pick one convention per codebase.`)],
    ['What is the difference between unknown and any?', PP(`any disables type checking for that value and everything it touches. unknown accepts any value but forces you to narrow it before use, so it’s the safe type for untrusted input.`)],
    ['How do you make an exhaustive switch?', PP(`Switch on a discriminant, and in the default branch assign the value to a variable of type never. If a new union member is added without a case, compilation fails.`)],
    ['What does satisfies do?', PP(`It checks that an expression is assignable to a type without changing the expression’s inferred type, so you keep literal keys and values for autocomplete while still validating the shape.`)]],
  qs: [SQ('Data comes from fetch().json(). What type should you give it before validation?', ['any', 'unknown', 'User', 'object'], 1, 'unknown forces narrowing or validation before use.'),
    SQ('What happens to TypeScript types at runtime?', ['They are checked on every call', 'They are erased', 'They become classes', 'They slow down the code'], 1, 'Types only exist at compile time.'),
    SQ('Which utility type makes every property optional?', ['Required', 'Partial', 'Pick', 'Readonly'], 1, 'Partial<T> maps each property to optional.')]
});
DP('ip-typescript', { work: ['Most React, Next.js and Node codebases; typed API clients and shared contracts.'],
  fu: [['Write a type that makes selected keys required.', 'type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }.'],
    ['How do conditional types work?', 'T extends U ? X : Y, evaluated per union member (distributive). With infer you can extract parts, e.g. type Elem<T> = T extends (infer E)[] ? E : never.'],
    ['How would you migrate a large JS codebase to TypeScript?', 'Enable allowJs and checkJs gradually, convert leaf modules first, start with strict off and turn flags on per directory, add types at API boundaries, and track any usage to drive it down.']],
  deep: [['Edge case', 'Function parameter bivariance for methods can let unsafe callbacks through; strictFunctionTypes covers function-typed properties only.'],
    ['Failure mode', 'Overusing as assertions to silence errors hides real bugs.'],
    ['In real systems', 'tRPC and Zod give end-to-end types; the TypeScript compiler is being ported to Go for ~10× faster builds.']],
  src: ['TypeScript Handbook', 'https://www.typescriptlang.org/docs/handbook/intro.html'] });

IPT('ip-os', { name: 'Operating systems fundamentals', cat: 'ipcs', roles: ['swe', 'be'],
  blurb: `Backend and generalist interviews probe what happens under your code: processes and threads, scheduling, memory and virtual memory, system calls, file systems and I/O. These explain performance problems, crashes and how containers work.`,
  facts: [['Unit of isolation', 'process'], ['Unit of scheduling', 'thread'], ['Page size', 'usually 4 KB'], ['Context switch', '≈ 1–5 µs']],
  cheat: [['Process', 'Own virtual address space, file descriptors, at least one thread'], ['Thread', 'Shares its process’s memory; own stack and registers'], ['Context switch', 'Save/restore registers; switching processes also changes page tables (TLB flush cost)'], ['Scheduler', 'Linux CFS/EEVDF: fair share of CPU by weight (nice values)'], ['Virtual memory', 'Per-process addresses mapped to physical pages by page tables'], ['Page fault', 'Access to an unmapped page: load from disk, allocate, or SIGSEGV'], ['Stack vs heap', 'Stack: per thread, LIFO frames; heap: dynamic allocation'], ['System call', 'Controlled entry into the kernel (read, write, mmap, fork)'], ['fork / exec', 'fork copies the process (copy-on-write); exec replaces its program'], ['File descriptor', 'Integer handle to an open file, socket or pipe'], ['Page cache', 'Kernel caches file data in RAM; fsync forces it to disk'], ['Deadlock conditions', 'Mutual exclusion, hold and wait, no preemption, circular wait']],
  sections: [
    ['Processes and threads', PP(`A process is a running program with its own virtual address space, so one process can’t corrupt another’s memory. Threads within a process share memory, which makes communication cheap but requires synchronization. Creating threads is cheaper than processes; switching between threads of the same process avoids changing page tables. Languages add lighter units on top: goroutines, Java virtual threads, async tasks multiplexed onto a few OS threads.`)],
    ['Virtual memory', PP(`Each process sees a large private address space. The MMU translates virtual pages to physical frames using page tables, with a TLB caching recent translations. Pages can be shared (libraries, copy-on-write after fork), lazily allocated (memory is only backed when touched) or swapped to disk. When RAM runs out Linux’s OOM killer terminates a process, which is often why a container “just dies”.`)],
    ['Scheduling and concurrency', UL([`Preemptive schedulers give each runnable thread time slices; I/O-bound threads sleep and don’t use CPU while waiting.`, `More threads than cores helps only when threads block on I/O; CPU-bound work peaks around one thread per core.`, `Synchronization: mutexes, read-write locks, semaphores, condition variables and atomic operations (compare-and-swap). Lock contention and false sharing (threads writing to the same cache line) destroy scaling.`])],
    ['I/O and file systems', UL([`Blocking I/O parks the thread; non-blocking I/O with epoll/kqueue/io_uring lets one thread serve thousands of sockets (how Node, Nginx and Go’s netpoller work).`, `write() usually returns once data is in the page cache, not on disk. Databases call fsync to make commits durable.`, `Everything is a file descriptor: files, sockets, pipes. Limits (ulimit -n) cause “too many open files” errors.`])],
    ['Containers are processes', PP(`A container is a process with namespaces (its own view of PIDs, network, mounts, users) and cgroups (limits on CPU, memory, I/O). There’s no separate kernel: that’s why containers start in milliseconds and why a memory limit kills the process when exceeded. Virtual machines, by contrast, run a full guest kernel on a hypervisor.`)]
  ],
  snips: [['Linux shell', 'bash', `ps aux --sort=-%mem | head          # top memory users
top -H -p <pid>                    # threads of one process
cat /proc/<pid>/status             # VmRSS, threads, context switches
ls -l /proc/<pid>/fd | wc -l       # open file descriptors
strace -c -p <pid>                 # which system calls, how often
vmstat 1                           # run queue, swapping, context switches/s
free -h; cat /proc/meminfo         # memory incl. page cache
dmesg | grep -i oom                # was something OOM-killed?`],
    ['Python: threads vs processes', 'python', `import time
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor

def cpu(n):
    return sum(i * i for i in range(n))

if __name__ == "__main__":
    for Pool in (ThreadPoolExecutor, ProcessPoolExecutor):
        t = time.perf_counter()
        with Pool(max_workers=4) as pool:
            list(pool.map(cpu, [5_000_000] * 4))
        print(Pool.__name__, round(time.perf_counter() - t, 2), "s")
# Threads: ~same as serial (GIL). Processes: ~4x faster on 4 cores.`]],
  edge: [`fork() in a multithreaded program copies only the calling thread; locks held by other threads stay locked forever in the child.`, `Memory limits in containers: the JVM and Node must be told (or detect) the cgroup limit, or they size heaps for the whole host.`, `Zombie processes: a parent that never waits on children leaves zombies; PID 1 in containers must reap them (tini).`],
  faq: [['Process vs thread?', PP(`A process has its own address space and resources; threads are execution units inside a process that share its memory. Processes give isolation; threads give cheap sharing at the cost of synchronization bugs.`)],
    ['What happens on a page fault?', PP(`The CPU traps to the kernel. If the address is valid but not resident, the kernel allocates a page or reads it from disk (major fault) and resumes the instruction; if invalid, the process gets SIGSEGV.`)],
    ['Why can adding threads make a program slower?', PP(`Lock contention, context-switch overhead, cache thrashing and false sharing. Beyond the number of cores, CPU-bound threads just take turns.`)],
    ['What is the difference between a container and a VM?', PP(`Containers share the host kernel and are isolated with namespaces and cgroups; VMs virtualize hardware and run their own kernel, giving stronger isolation with more overhead.`)]],
  qs: [SQ('What do threads of the same process share?', ['Stack', 'Registers', 'Heap and address space', 'Nothing'], 2, 'Each thread has its own stack and registers but shares memory.'),
    SQ('A container is killed with exit code 137. Likely cause?', ['Syntax error', 'OOM kill after exceeding its memory limit', 'Network timeout', 'Disk full'], 1, '137 = 128 + SIGKILL (9), typically from the OOM killer.'),
    SQ('Why does write() returning not guarantee data is on disk?', ['It does guarantee it', 'Data may still be in the page cache until fsync', 'Disks are read-only', 'Because of TCP'], 1, 'Durability requires fsync (or O_DIRECT/O_SYNC).')]
});
DP('ip-os', { work: ['Debugging memory leaks, OOM kills, CPU saturation and file-descriptor limits in production.'],
  fu: [['How does copy-on-write make fork fast?', 'The child shares the parent’s pages marked read-only; a page is copied only when either process writes to it. Redis uses this for background snapshots.'],
    ['What causes thrashing?', 'The working set exceeds RAM, so the system spends its time swapping pages in and out; throughput collapses. Fix by reducing memory use or adding RAM; many servers disable swap.'],
    ['Explain priority inversion.', 'A high-priority task waits on a lock held by a low-priority task, which is preempted by medium-priority tasks. Priority inheritance temporarily boosts the lock holder (the Mars Pathfinder bug).']],
  deep: [['Edge case', 'Transparent huge pages can cause latency spikes in databases; many recommend disabling them.'],
    ['Failure mode', 'Running out of inodes or file descriptors while disk space looks fine.'],
    ['In real systems', 'Linux’s EEVDF scheduler (6.6+), io_uring for async I/O, cgroups v2 in Kubernetes.']],
  src: ['Arpaci-Dusseau, Operating Systems: Three Easy Pieces (free online)', 'https://pages.cs.wisc.edu/~remzi/OSTEP/'] });

IPT('ip-networking', { name: 'Networking fundamentals', cat: 'ipcs', roles: ['swe', 'be', 'fs'],
  blurb: `Every distributed system rides on the network. Interviews expect you to explain the layers, how TCP gives reliability, what DNS, NAT and load balancers do, how TLS fits in, and how to debug “it can’t connect” and “it’s slow”.`,
  facts: [['Model', 'TCP/IP (4–5 layers)'], ['Reliability', 'TCP'], ['Low latency', 'UDP / QUIC'], ['MTU', '1500 bytes typical']],
  cheat: [['Layers', 'Link (Ethernet, Wi-Fi) → Internet (IP) → Transport (TCP, UDP) → Application (HTTP, DNS)'], ['IP', 'Best-effort delivery of packets between addresses; routers forward by prefix'], ['TCP', 'Connection, ordered reliable byte stream, flow and congestion control'], ['UDP', 'Datagrams; no connection, ordering or retransmission'], ['3-way handshake', 'SYN → SYN-ACK → ACK (one round trip before data)'], ['Ports', 'Identify processes; (src IP, src port, dst IP, dst port, proto) identifies a connection'], ['DNS', 'Name → IP, cached by resolvers for the TTL'], ['NAT', 'Many private addresses share one public IP by rewriting ports'], ['CIDR', '10.0.0.0/16 = 65,536 addresses with the first 16 bits fixed'], ['L4 vs L7 LB', 'Routes by IP/port vs by HTTP content'], ['TLS', 'Encrypts and authenticates on top of TCP (or inside QUIC)'], ['Latency', 'Same DC ~0.5 ms RTT; cross-continent 70–150 ms']],
  sections: [
    ['How TCP is reliable', UL([`Sequence numbers order bytes; the receiver acknowledges what it has received.`, `Missing data is retransmitted after a timeout or three duplicate ACKs (fast retransmit).`, `Flow control: the receiver advertises a window so a fast sender can’t overflow it.`, `Congestion control (CUBIC, BBR) grows the sending rate until loss or delay signals congestion, then backs off. New connections start slow, which is why reusing connections matters.`])],
    ['TCP vs UDP vs QUIC', TBL(['', 'TCP', 'UDP', 'QUIC'], [['Connection setup', '1 RTT (+ TLS 1 RTT)', 'None', '1 RTT including TLS; 0-RTT on resume'], ['Ordering', 'Single ordered stream', 'None', 'Per stream'], ['Head-of-line blocking', 'Yes: one loss stalls everything', 'No', 'Only the affected stream'], ['Used by', 'HTTP/1.1, HTTP/2, databases', 'DNS, games, VoIP, video calls', 'HTTP/3']])],
    ['Following a request', OL([`DNS resolves the name (cache, then recursive resolver).`, `The OS picks a source port and sends SYN to the destination IP; routers forward by longest-prefix match; NAT rewrites addresses at the edge.`, `TCP handshake, then TLS handshake.`, `HTTP request and response over the encrypted connection; a load balancer may terminate TLS and open another connection to a backend.`, `Connection is kept alive for reuse or closed (FIN/ACK); the closing side lingers in TIME_WAIT for up to 2×MSL.`])],
    ['Debugging connectivity', TBL(['Symptom', 'Likely cause', 'Tool'], [['Name doesn’t resolve', 'DNS record, resolver, search domain', 'dig, nslookup'], ['Connection refused', 'Nothing listening on that port, or firewall reject', 'ss -ltnp, nc -vz'], ['Connection timeout', 'Firewall/security group drops packets, routing', 'traceroute, cloud flow logs'], ['TLS error', 'Expired or wrong certificate, missing intermediate, SNI', 'openssl s_client'], ['Slow requests', 'Latency, packet loss, retransmits, slow server', 'curl -w timing, mtr, tcpdump']])]
  ],
  snips: [['Shell', 'bash', `dig +short api.example.com           # DNS answer
curl -sv https://api.example.com/health -o /dev/null   # handshake details
curl -s -o /dev/null -w "dns %{time_namelookup} connect %{time_connect} tls %{time_appconnect} ttfb %{time_starttransfer} total %{time_total}\\n" https://example.com
ss -tanp state established | head     # open TCP connections
nc -vz db.internal 5432               # is the port reachable?
mtr -rw example.com                   # per-hop latency and loss
sudo tcpdump -i any port 443 -c 20    # watch packets`],
    ['Python sockets', 'python', `import socket

# TCP echo client: connect, send, receive
with socket.create_connection(("example.com", 80), timeout=5) as s:
    s.sendall(b"HEAD / HTTP/1.1\\r\\nHost: example.com\\r\\nConnection: close\\r\\n\\r\\n")
    print(s.recv(200).decode(errors="replace"))

# UDP: no connection, just datagrams
u = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
u.sendto(b"ping", ("127.0.0.1", 9999))`]],
  edge: [`Ephemeral port exhaustion when opening a new outbound connection per request; pool connections.`, `Idle connections silently dropped by NATs and load balancers; use keep-alives shorter than their idle timeout.`, `MTU issues (blocked ICMP) cause large packets to vanish while small requests work.`, `TIME_WAIT buildup on the side that closes first.`],
  faq: [['What happens when you type a URL into a browser?', PP(`DNS lookup, TCP (or QUIC) connection, TLS handshake, HTTP request through CDNs and load balancers to an app server, response, then the browser parses HTML, fetches CSS/JS/images (reusing connections), builds the DOM and CSSOM, lays out and paints.`)],
    ['Why does TCP have a three-way handshake?', PP(`Both sides must agree on initial sequence numbers and confirm the other can receive: SYN carries the client’s, SYN-ACK acknowledges it and carries the server’s, and ACK confirms. Two messages couldn’t confirm both directions.`)],
    ['When would you use UDP?', PP(`When timeliness beats reliability (real-time audio/video, games), for simple request-response like DNS, or as a base for custom protocols like QUIC that implement reliability selectively.`)],
    ['What is head-of-line blocking?', PP(`When one lost or slow item delays everything behind it. In HTTP/1.1 it’s per connection; in HTTP/2 over TCP one lost packet stalls all streams; QUIC removes it at the transport level.`)]],
  qs: [SQ('nc -vz host 5432 says “Connection refused”. Most likely?', ['Packets dropped by a firewall', 'The host is reachable but nothing is listening on that port', 'DNS failed', 'TLS failed'], 1, 'Refused means a RST came back; timeouts suggest drops.'),
    SQ('How many addresses are in 10.0.0.0/24?', ['24', '256', '65,536', '16M'], 1, '32 − 24 = 8 bits → 2⁸.'),
    SQ('What does HTTP/3 change at the transport layer?', ['Uses UDP via QUIC', 'Removes encryption', 'Uses two TCP connections', 'Nothing'], 0, 'QUIC runs over UDP with built-in TLS 1.3 and independent streams.')]
});
DP('ip-networking', { work: ['Debugging timeouts and TLS errors, configuring VPCs, security groups and load balancers.'],
  fu: [['Why is the first request on a new connection slower?', 'DNS, TCP and TLS handshakes add round trips, and TCP slow start limits the initial window, so large responses need several round trips until the window grows.'],
    ['How does NAT break peer-to-peer connections, and how is it solved?', 'Inbound connections have no mapping; STUN discovers public addresses, hole punching opens mappings from both sides, and TURN relays when that fails (WebRTC).'],
    ['What does BGP do?', 'It exchanges routes between autonomous systems (networks) on the internet. Misconfigurations can withdraw or hijack routes and take services offline globally.']],
  deep: [['Edge case', 'IPv6-only clients and dual-stack issues (Happy Eyeballs races IPv4 and IPv6).'],
    ['Failure mode', 'Facebook’s 2021 outage: a BGP change withdrew routes to its DNS servers.'],
    ['In real systems', 'AWS VPCs, security groups and NAT gateways; Google’s BBR congestion control; Cloudflare’s anycast network.']],
  src: ['Kurose & Ross, Computer Networking: A Top-Down Approach, ch. 3 (transport layer)', null] });

IPT('ip-lld', { name: 'Low-level design (object-oriented design)', cat: 'ipbe', roles: ['swe', 'be'],
  blurb: `Low-level design rounds ask you to model a system in classes: a parking lot, an elevator, a library, a rate limiter. Interviewers look for clear entities and responsibilities, good use of interfaces and patterns, handling of concurrency and extension, and working code for the core flow.`,
  facts: [['Length', '45–60 min'], ['Output', 'classes, relationships, core code'], ['Judged on', 'clarity, extensibility, correctness'], ['Common asks', 'parking lot, elevator, LRU, vending machine']],
  cheat: [['1 · Requirements', 'Clarify actors, use cases and limits; agree on scope'], ['2 · Entities', 'Nouns become classes; verbs become methods'], ['3 · Relationships', 'Has-a (composition) vs is-a (inheritance); cardinalities'], ['4 · Interfaces', 'Program to interfaces where behavior varies (pricing, strategy)'], ['5 · Patterns', 'Strategy, state, factory, observer, singleton (sparingly)'], ['6 · Code', 'Core classes and the main flow; skip trivial getters'], ['7 · Concurrency', 'Shared state? Locks or atomic operations around allocation'], ['8 · Extend', 'Show how a new requirement fits without rewriting']],
  dg: { w: 860, h: 400,
    n: [['lot', 'ParkingLot', 140, 80, 'box', 'park(v) · leave(ticket)'], ['lvl', 'Level', 140, 220, 'box', 'findSpot(type)'], ['spot', 'Spot', 140, 350, 'box', 'size · occupied'],
      ['tk', 'Ticket', 430, 205, 'box', 'id · spot · entry time'], ['veh', 'Vehicle', 430, 350, 'box', 'Car · Motorcycle · Truck'], ['pr', '«interface» PricingStrategy', 700, 80, 'box', 'fee(ticket, now)'], ['hr', 'HourlyPricing', 610, 250, 'box'], ['flat', 'FlatPricing', 790, 250, 'box']],
    e: [['lot', 'lvl', '1..*'], ['lvl', 'spot', '1..*'], ['lot', 'tk', 'issues'], ['tk', 'veh', 'for', 'd'], ['spot', 'veh', 'holds 0..1'], ['lot', 'pr', 'uses'], ['hr', 'pr', 'implements', 'd'], ['flat', 'pr', '', 'd']] },
  cap: `A parking lot design: the lot owns levels, levels own spots, tickets record which vehicle is where, and pricing is a strategy so new pricing rules don’t change the lot.`,
  walk: [[['lot', 'lvl', 'lot>lvl'], `ParkingLot.park(vehicle) asks each Level for a free spot that fits the vehicle’s size.`],
    [['lvl', 'spot', 'lvl>spot'], `Level.findSpot keeps free spots per size in a set or queue, so allocation is O(1) instead of scanning.`],
    [['spot', 'veh', 'spot>veh'], `The spot is marked occupied atomically (a lock per level), so two cars at two gates can’t take the same spot.`],
    [['lot', 'tk', 'lot>tk'], `The lot issues a Ticket with the spot and entry time.`],
    [['lot', 'pr', 'lot>pr', 'hr', 'hr>pr'], `On leave(ticket) the lot asks its PricingStrategy for the fee. Swapping HourlyPricing for FlatPricing (or a weekend rule) needs no change to ParkingLot: the open/closed principle.`]],
  sections: [
    ['How to run the round', OL([`<b>Clarify:</b> vehicle types, spot sizes, multiple levels and gates, payment, display boards. Write the use cases.`, `<b>Identify entities</b> and their responsibilities in one line each.`, `<b>Sketch relationships</b> (a quick class diagram like the one above).`, `<b>Code the core:</b> park, leave, fee. Keep classes small and names clear.`, `<b>Discuss</b> concurrency, extension (EV charging spots, reservations), and testing.`])],
    ['Patterns that come up', TBL(['Pattern', 'Where it fits'], [['Strategy', 'Pricing rules, elevator dispatch algorithms, rate-limit algorithms'], ['State', 'Vending machine (idle, has money, dispensing), elevator (moving up, idle, doors open)'], ['Factory', 'Creating the right Vehicle or Spot subtype from input'], ['Observer', 'Display boards updated when spots change; notifications'], ['Singleton', 'One ParkingLot instance; prefer injecting a single instance instead']])],
    ['Other classic problems', TBL(['Problem', 'Key entities', 'Interesting part'], [['Elevator system', 'Elevator, Request, Dispatcher, Direction', 'Dispatch strategy (nearest car, SCAN), state machine per elevator'], ['LRU cache', 'Node, DoublyLinkedList, LRUCache', 'O(1) get/put with hash map + list (problem 146)'], ['Vending machine', 'Machine, State, Inventory, Coin', 'State pattern, change-making'], ['Library system', 'Book, Copy, Member, Loan', 'Copies vs titles, holds and fines'], ['Splitwise', 'User, Expense, Split, BalanceSheet', 'Split strategies, simplifying debts']])],
    ['What strong answers show', UL([`Each class has one reason to change.`, `Behavior that varies is behind an interface.`, `Invariants are protected (you can’t free a spot that isn’t occupied).`, `Thread safety is considered where state is shared.`, `The design is testable: dependencies (clock, pricing) are injected.`])]
  ],
  snips: [['Python', 'python', `from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
import itertools, threading, math

class PricingStrategy(ABC):
    @abstractmethod
    def fee(self, ticket: "Ticket", now: datetime) -> int: ...

class HourlyPricing(PricingStrategy):
    def __init__(self, cents_per_hour: int): self.rate = cents_per_hour
    def fee(self, ticket, now):
        hours = math.ceil((now - ticket.entry).total_seconds() / 3600)
        return max(1, hours) * self.rate

@dataclass
class Ticket:
    id: int
    plate: str
    spot_id: str
    entry: datetime

class Level:
    def __init__(self, name, spots_by_size):           # {"compact": 20, "large": 5}
        self.free = {size: [f"{name}-{size}-{i}" for i in range(n)] for size, n in spots_by_size.items()}
        self.lock = threading.Lock()
    def take(self, size):
        with self.lock:
            return self.free[size].pop() if self.free.get(size) else None
    def release(self, spot_id):
        size = spot_id.split("-")[1]
        with self.lock:
            self.free[size].append(spot_id)

class ParkingLot:
    def __init__(self, levels, pricing: PricingStrategy, clock=datetime.now):
        self.levels, self.pricing, self.clock = levels, pricing, clock
        self.ids, self.active = itertools.count(1), {}
    def park(self, plate, size):
        for level in self.levels:
            spot = level.take(size)
            if spot:
                t = Ticket(next(self.ids), plate, spot, self.clock())
                self.active[t.id] = (t, level)
                return t
        raise RuntimeError("lot full for size " + size)
    def leave(self, ticket_id):
        t, level = self.active.pop(ticket_id)
        level.release(t.spot_id)
        return self.pricing.fee(t, self.clock())`],
    ['Java', 'java', `interface PricingStrategy { long fee(Ticket t, Instant now); }

final class HourlyPricing implements PricingStrategy {
    private final long centsPerHour;
    HourlyPricing(long centsPerHour) { this.centsPerHour = centsPerHour; }
    public long fee(Ticket t, Instant now) {
        long hours = Math.max(1, (Duration.between(t.entry(), now).toMinutes() + 59) / 60);
        return hours * centsPerHour;
    }
}

record Ticket(long id, String plate, String spotId, Instant entry) {}

final class Level {
    private final Map<String, Deque<String>> free = new HashMap<>();
    synchronized Optional<String> take(String size) {
        Deque<String> q = free.get(size);
        return (q == null || q.isEmpty()) ? Optional.empty() : Optional.of(q.pop());
    }
    synchronized void release(String size, String spotId) { free.get(size).push(spotId); }
}`]],
  edge: [`Two gates allocating the same spot: lock per level or atomic compare-and-set on the spot.`, `Lost tickets and payment failures: decide the policy explicitly.`, `Time: inject a clock so fees are testable.`, `Over-engineering with deep inheritance trees (Car extends FourWheeler extends Vehicle…) instead of a size attribute.`],
  faq: [['How do you decide between inheritance and composition here?', PP(`Use inheritance only for real is-a relationships with shared behavior. Vehicle types mostly differ by size, so a size field (or small enum) is simpler than a class hierarchy; pricing varies independently, so it’s composed in as a strategy.`)],
    ['How would you add reservations?', PP(`Add a Reservation entity (spot or size, time window) and a ReservationService; spots gain a reserved state; allocation checks reservations first. Existing classes change minimally because allocation is behind Level.take.`)],
    ['How do you make the design thread-safe?', PP(`Identify shared mutable state (free spots, active tickets) and protect it: a lock per level keeps contention low, or use concurrent queues and atomic counters.`)]],
  qs: [SQ('Pricing rules will change often. Which pattern keeps ParkingLot unchanged?', ['Singleton', 'Strategy', 'Observer', 'Adapter'], 1, 'Inject a PricingStrategy implementation.'),
    SQ('Which pattern fits a vending machine whose behavior depends on whether money was inserted?', ['State', 'Factory', 'Decorator', 'Builder'], 0, 'Each state object handles events differently and transitions to the next state.')]
});
DP('ip-lld', { work: ['Designing modules and class structures in code reviews and design docs.'],
  fu: [['Design an elevator system’s dispatcher.', 'Collect hall calls in a queue; each elevator runs a state machine (idle, moving up/down, doors open) serving requests in its direction (SCAN/LOOK). The dispatcher assigns a call to the elevator with the lowest estimated arrival time, a pluggable strategy.'],
    ['How would you test your parking lot?', 'Unit-test pricing with a fake clock, allocation with small lots (full, sizes), and concurrency with many threads parking at once and asserting no spot is double-allocated.'],
    ['How does this change if the lot is distributed across many servers?', 'Spot state moves to a shared store with atomic operations (conditional updates), and the in-memory locks become database constraints or a reservation service.']],
  deep: [['Edge case', 'Large vehicles that occupy several adjacent spots.'],
    ['Failure mode', 'God classes that do everything; interviewers look for responsibilities split clearly.'],
    ['In real systems', 'The same thinking applies to designing service APIs and domain models (domain-driven design).']],
  src: ['Freeman & Robson, Head First Design Patterns 2nd ed.', null] });

IPT('ip-career', { name: 'Résumés, take-homes & offers', cat: 'ipcareer', roles: ['swe', 'fe', 'be', 'fs', 'da'],
  blurb: `Getting the interview and the offer are skills too: a résumé that gets past screening, take-home assignments that impress, a job search pipeline, and negotiating the offer. Small changes here often matter more than one more practice problem.`,
  facts: [['Résumé', '1 page (early career)'], ['Bullets', 'impact + numbers'], ['Take-home', 'README + tests'], ['Negotiate', 'almost always']],
  cheat: [['Bullet formula', 'Did X using Y, resulting in Z (with a number)'], ['Order', 'Experience and projects first; skills last; education first only if new grad'], ['Tailor', 'Mirror the job post’s key terms honestly'], ['Links', 'GitHub, portfolio, live demos that work'], ['Pipeline', 'Referrals > recruiters > cold applications'], ['Take-home', 'Clarify scope, clean code, tests, README with decisions and trade-offs'], ['Offer', 'Base, bonus, equity (vesting, cliff), sign-on, level'], ['Negotiate', 'Be enthusiastic, cite competing offers or data, ask for specifics'], ['Timeline', 'Ask for time to decide; align offers to arrive together']],
  sections: [
    ['A résumé that gets interviews', UL([`Recruiters skim for seconds: put your strongest, most relevant experience at the top.`, `Bullets show impact, not duties: “Cut checkout p95 latency from 1.2 s to 300 ms by adding Redis caching and batching DB calls” beats “Worked on checkout performance”.`, `Quantify: users, latency, revenue, cost, time saved, team size.`, `One page early in your career; plain formatting that parses in applicant tracking systems (no tables or columns).`, `Projects count when they’re real: deployed, used, with a README.`])],
    ['Take-home assignments', OL([`Confirm the scope and time expectation; ask questions early.`, `Build the core requirements first, cleanly, before extras.`, `Add tests for the important logic and a one-command setup.`, `Write a README: how to run, design decisions, trade-offs, what you’d do with more time.`, `Expect to walk through and extend it in a follow-up interview.`])],
    ['Running the search', UL([`Track applications in a spreadsheet: company, stage, contacts, next step, dates.`, `Referrals have much higher response rates; ask former colleagues and alumni with a short, specific message.`, `Schedule practice companies first and target companies later, and try to have final rounds close together.`])],
    ['Understanding and negotiating offers', TBL(['Component', 'What to check'], [['Base salary', 'Market data for your level and location (levels.fyi, Glassdoor)'], ['Equity', 'Number of shares or value, vesting schedule (4 years, 1-year cliff), refreshers; for startups, strike price and latest valuation'], ['Bonus', 'Target percentage and how reliably it pays out'], ['Sign-on', 'Often the easiest lever; may have clawbacks'], ['Level', 'Determines pay bands and future promotions']]) +
      PP(`Negotiate politely and concretely: thank them, state your excitement, then ask (“Is there flexibility on base? I have another offer at X”). Never lie about offers. Most companies expect it and rarely rescind for a professional request.`)]
  ],
  edge: [`Typos and broken links on a résumé are disqualifying for many reviewers.`, `Including confidential details from a current employer.`, `Taking a take-home far beyond the suggested time can backfire; note what you’d add instead.`, `Accepting verbally before seeing the written offer.`],
  faq: [['How do I explain a gap in my résumé?', PP(`Briefly and honestly (caregiving, health, study, layoffs), then focus on what you did to stay current and why you’re ready now. Most interviewers care far more about recent skills than gaps.`)],
    ['What do I say when asked for salary expectations early?', PP(`Defer if you can (“I’d like to learn more about the role first; I’m sure we can find a fair number”) or give a researched range for the level, not your current pay.`)],
    ['How do I write a project bullet without industry experience?', PP(`Describe what you built, the technical challenge and a result: “Built a URL shortener with Redis caching and rate limiting; load-tested to 2,000 req/s with p99 under 50 ms.”`)]],
  qs: [SQ('Which résumé bullet is strongest?', ['Responsible for the API', 'Worked on performance', 'Reduced API p95 latency 60% (800→320 ms) by adding caching and query batching', 'Familiar with many technologies'], 2, 'Specific action, technique and measured impact.'),
    SQ('Offer equity vests over 4 years with a 1-year cliff. What happens if you leave after 10 months?', ['You keep 10/48', 'You keep nothing', 'You keep half', 'It doubles'], 1, 'Nothing vests before the cliff.')]
});
DP('ip-career', { work: ['Every job search, promotion packet and performance review.'],
  fu: [['How do you compare a startup offer with a big-company offer?', 'Value public-company equity at market price; discount startup equity heavily (most are worth little), and weigh learning, scope, stability and runway.'],
    ['How do you handle an exploding offer?', 'Ask politely for more time with a specific date, explain you’re finishing other processes, and ask other companies to speed up.'],
    ['What should a portfolio project include for an analyst or engineer?', 'A real question or user, a deployed result or dashboard, clean code with a README, and a short write-up of decisions and impact.']],
  deep: [['Edge case', 'Non-competes and IP clauses: read them before signing.'],
    ['Failure mode', 'Applying to hundreds of jobs with a generic résumé instead of tailoring for fewer.'],
    ['In real systems', 'levels.fyi publishes crowdsourced compensation data by company and level.']],
  src: ['Levels.fyi: compensation data and negotiation guides', 'https://www.levels.fyi/'] });

IPT('ip-analyst', { name: 'Data analyst interviews', cat: 'ipda', roles: ['da'],
  blurb: `Analyst interviews mix four rounds: SQL live coding, statistics and experimentation, product or business case questions (metrics and root causes), and a take-home or portfolio presentation. This page is the cheat sheet and question bank; the Data Analytics course has the full lessons.`,
  facts: [['Rounds', 'SQL · stats · case · behavioral'], ['SQL focus', 'joins, GROUP BY, windows'], ['Case focus', 'metrics, root cause'], ['Tools', 'Excel, BI, Python']],
  cheat: [['SQL must-knows', 'JOIN types, GROUP BY/HAVING, CASE WHEN, CTEs, ROW_NUMBER/RANK, LAG/LEAD, date functions'], ['Classic SQL asks', 'Top N per group, running totals, retention, duplicates, second-highest value, DAU/MAU'], ['Metric questions', 'Define the goal, pick a north-star metric, add guardrails and counter-metrics'], ['Root cause', 'Check data first, then segment (time, region, platform, new vs returning), then hypotheses'], ['A/B testing', 'Hypothesis, metric, sample size/power, randomization unit, duration, SRM check, significance'], ['Stats basics', 'Mean vs median, variance, distributions, p-value, confidence interval, correlation ≠ causation'], ['Presenting', 'Answer first, one chart per point, recommendation and caveats'], ['Tools', 'Excel lookups and pivots, Power BI/Tableau, pandas']],
  sections: [
    ['SQL round', PP(`Expect 2–4 questions in 45 minutes on a small schema (users, orders, events). Talk through the grain of each table, write the query in steps with CTEs, and check edge cases: NULLs, duplicates, ties and empty groups. Practise in the SQL playground in the Data Analytics course.`) + TBL(['Ask', 'Pattern'], [['Top 3 products per category', 'ROW_NUMBER() OVER (PARTITION BY category ORDER BY revenue DESC) ≤ 3'], ['Month-over-month growth', 'LAG(revenue) OVER (ORDER BY month)'], ['Users who bought in consecutive months', 'Self-join or LAG on month per user'], ['7-day rolling average', 'AVG(x) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)'], ['Retention by signup cohort', 'First-activity month per user, then count active users by month offset']])],
    ['Product and metrics case', OL([`Clarify the product and the goal of the feature or business.`, `Propose a north-star metric and 2–3 supporting metrics (activation, engagement, retention, revenue).`, `Add guardrails: things that must not get worse (latency, complaints, cancellations).`, `For a metric drop: confirm it’s real (tracking, data delays), segment it, look for internal changes (releases, campaigns) and external ones (seasonality, competitors), then propose how to validate.`])],
    ['Statistics and experimentation', UL([`Explain a p-value and a confidence interval in plain words.`, `Choose sample size from baseline rate, minimum detectable effect, α and power.`, `Know pitfalls: peeking, multiple comparisons, novelty effects, sample ratio mismatch, network effects.`, `Know when not to A/B test (too little traffic, legal or ethical reasons) and alternatives (difference-in-differences, holdouts).`])],
    ['Take-home and portfolio', UL([`Clean the data and document assumptions.`, `Lead with the answer and a recommendation, then the evidence.`, `Keep charts simple with takeaway titles.`, `Include limitations and next steps.`])]
  ],
  snips: [['SQL: top N per group', 'sql', `WITH ranked AS (
  SELECT category, product, SUM(amount) AS revenue,
         ROW_NUMBER() OVER (PARTITION BY category ORDER BY SUM(amount) DESC) AS rn
  FROM orders
  GROUP BY category, product
)
SELECT category, product, revenue
FROM ranked
WHERE rn <= 3
ORDER BY category, rn;`],
    ['SQL: retention', 'sql', `WITH firsts AS (
  SELECT user_id, DATE_TRUNC('month', MIN(event_date)) AS cohort
  FROM events GROUP BY user_id
), activity AS (
  SELECT DISTINCT e.user_id, f.cohort,
         (EXTRACT(YEAR FROM AGE(DATE_TRUNC('month', e.event_date), f.cohort)) * 12
          + EXTRACT(MONTH FROM AGE(DATE_TRUNC('month', e.event_date), f.cohort))) AS month_n
  FROM events e JOIN firsts f USING (user_id)
)
SELECT cohort, month_n, COUNT(*) AS active_users
FROM activity
GROUP BY cohort, month_n
ORDER BY cohort, month_n;`]],
  edge: [`COUNT(col) skips NULLs; COUNT(*) doesn’t.`, `Ties: decide between ROW_NUMBER, RANK and DENSE_RANK and say why.`, `Averages of ratios vs ratio of sums give different answers.`, `Time zones and incomplete current periods distort trends.`],
  faq: [['“Daily active users dropped 10% yesterday. What do you do?”', PP(`Check whether it’s real: data pipeline delays, tracking or logging changes, bot filtering. Then segment by platform, app version, country, acquisition channel and new vs returning to localize it. Line it up with releases, outages, holidays or marketing changes. Form a hypothesis, validate it with data, and report the impact and next steps.`)],
    ['“How would you measure the success of a new feature?”', PP(`Tie it to the feature’s goal: adoption (% of eligible users who try it), engagement (repeat use), and the business outcome it should move (retention, conversion), plus guardrails. Ideally launch as an A/B test to measure causal impact.`)],
    ['“Explain a p-value to a product manager.”', PP(`If the change really had no effect, a p-value of 0.03 means we’d see a difference this big only about 3% of the time by chance. It doesn’t tell us the size of the effect or the probability the change works; the confidence interval shows the plausible effect size.`)],
    ['“What is the difference between RANK and DENSE_RANK?”', PP(`Both give ties the same rank; RANK then skips numbers (1, 1, 3) while DENSE_RANK doesn’t (1, 1, 2).`)]],
  qs: [SQ('You need the 2 most recent orders per customer. Which function?', ['SUM() OVER', 'ROW_NUMBER() OVER (PARTITION BY customer ORDER BY created_at DESC)', 'COUNT(DISTINCT)', 'NTILE(2)'], 1, 'Number rows within each customer, newest first, keep ≤ 2.'),
    SQ('A metric drops sharply overnight. First step?', ['Present it to leadership', 'Check data quality and tracking changes', 'Run an A/B test', 'Build a model'], 1, 'Many “drops” are pipeline or logging issues.')]
});
DP('ip-analyst', { work: ['Analyst, business intelligence and product analytics job searches.'],
  fu: [['How would you design an A/B test for a new checkout button?', 'Randomize users (not sessions), primary metric conversion rate, guardrails (AOV, errors), compute sample size for a minimum detectable effect, run full weeks, check SRM, then analyze with a two-proportion test or confidence interval.'],
    ['Conversion went up but revenue went down. How?', 'Mix shift: more small orders, discounts, or a change in which customers convert. Decompose revenue into users × conversion × orders per buyer × average order value.'],
    ['How do you handle a stakeholder who disagrees with your analysis?', 'Understand their reasoning, check whether they have context or data you lack, re-examine assumptions together, and if needed run an analysis that would distinguish the two views.']],
  deep: [['Edge case', 'Simpson’s paradox in segment analyses.'],
    ['Failure mode', 'Writing one giant query instead of steps you can check.'],
    ['In real systems', 'DataLemur and StrataScratch host real analyst SQL interview questions.']],
  src: ['DataLemur: SQL interview questions for data analysts', 'https://datalemur.com/'] });
