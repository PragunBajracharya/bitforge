/* ===== Low-level design C: classic LLD problems with implementations (Python) ===== */
SD_CATS.push(['sdlld', 'Low-level design problems']);

SDX('lld-parking', { name: 'Parking Lot', cat: 'sdlld',
  blurb: `The canonical LLD warm-up: model a multi-level parking lot that assigns spots by vehicle size, issues tickets, and charges on exit. It exercises entities, enums, a pricing strategy and spot allocation — and interviewers use it to see how you structure classes.`,
  facts: [['Entities', 'Lot, Level, Spot, Vehicle, Ticket'], ['Varies', 'spot size, pricing'], ['Patterns', 'Strategy (pricing), Factory (vehicle)'], ['Core op', 'park → ticket → unpark → fee']],
  cheat: [['ParkingLot', 'Owns levels; park()/unpark()'], ['Level', 'Owns spots; finds a free fit'], ['Spot', 'Size + occupied flag + vehicle'], ['Vehicle', 'MOTORCYCLE / CAR / TRUCK (size)'], ['Ticket', 'Links vehicle, spot, entry time'], ['PricingStrategy', 'Fee from duration (injectable)'], ['Allocation', 'Smallest spot that fits'], ['Concurrency', 'Lock around find+reserve'], ['Extensible', 'EV spots, reserved, multiple gates'], ['Composition', 'Lot→Levels→Spots']],
  sections: [
    ['Requirements & entities', PP(`<b>Requirements:</b> multiple levels; spots of different sizes; a vehicle takes the <b>smallest spot it fits</b>; issue a ticket on entry; charge by <b>duration</b> on exit; be extensible (EV charging, reserved spots). <b>Entities (nouns → classes):</b> <code>ParkingLot</code> (owns <code>Level</code>s), <code>Level</code> (owns <code>Spot</code>s), <code>Spot</code> (size + occupancy), <code>Vehicle</code> (its size), <code>Ticket</code> (vehicle + spot + entry time). <b>Behavior (verbs → methods):</b> <code>park</code>, <code>unpark</code>, <code>find_spot</code>, <code>calculate_fee</code>.`)],
    ['Design choices', PP(`<b>Pricing</b> is a <b>Strategy</b> so new rules (flat, hourly, tiered) don’t touch the lot. <b>Allocation</b> picks the smallest fitting free spot. <b>Composition</b> models ownership (a level is composed of spots; a ticket is associated with a vehicle). <b>Concurrency</b>: finding and reserving a spot must be atomic (a lock), or two cars race for the same spot. Keep the lot <b>open/closed</b>: EV spots are a new <code>SpotSize</code>/subtype, not edits everywhere.`)]
  ],
  snipTitle: 'Parking lot implementation', snipNote: 'Enums for size, a pricing strategy, and atomic spot allocation.',
  snips: [['parking_lot.py', 'python', `from __future__ import annotations
from enum import IntEnum
from dataclasses import dataclass, field
from datetime import datetime
import threading, itertools

class Size(IntEnum):                       # ordered: a vehicle fits an >= spot
    MOTORCYCLE = 1; CAR = 2; TRUCK = 3

@dataclass
class Vehicle:
    plate: str
    size: Size

@dataclass
class Spot:
    id: str
    size: Size
    vehicle: Vehicle | None = None
    def is_free(self) -> bool: return self.vehicle is None
    def fits(self, v: Vehicle) -> bool: return self.is_free() and self.size >= v.size

@dataclass
class Ticket:
    id: str
    spot: Spot
    vehicle: Vehicle
    entry: datetime = field(default_factory=datetime.now)

class PricingStrategy:                      # Strategy: swap pricing rules
    def fee(self, hours: float) -> float: raise NotImplementedError
class HourlyPricing(PricingStrategy):
    def __init__(self, rate=2.0): self.rate = rate
    def fee(self, hours): return round(max(1, hours) * self.rate, 2)

class Level:
    def __init__(self, idx: int, spots: list[Spot]):
        self.idx, self.spots = idx, spots
    def find(self, v: Vehicle) -> Spot | None:
        # smallest fitting free spot
        return min((s for s in self.spots if s.fits(v)), key=lambda s: s.size, default=None)

class ParkingLot:
    def __init__(self, levels: list[Level], pricing: PricingStrategy):
        self.levels, self.pricing = levels, pricing
        self._lock = threading.Lock()
        self._seq = itertools.count(1)
        self.tickets: dict[str, Ticket] = {}
    def park(self, v: Vehicle) -> Ticket:
        with self._lock:                    # atomic find + reserve
            for lvl in self.levels:
                spot = lvl.find(v)
                if spot:
                    spot.vehicle = v
                    t = Ticket(f"T{next(self._seq)}", spot, v)
                    self.tickets[t.id] = t
                    return t
        raise RuntimeError("lot full")
    def unpark(self, ticket_id: str, now: datetime | None = None) -> float:
        with self._lock:
            t = self.tickets.pop(ticket_id)
            hours = ((now or datetime.now()) - t.entry).total_seconds() / 3600
            t.spot.vehicle = None           # free the spot
            return self.pricing.fee(hours)

# --- usage ---
lot = ParkingLot(
    [Level(0, [Spot("A1", Size.CAR), Spot("A2", Size.TRUCK)])],
    HourlyPricing(3.0))
t = lot.park(Vehicle("KA-01", Size.CAR))
print(t.id, t.spot.id)      # T1 A1
print(lot.unpark(t.id))     # fee (>= 1 hour minimum)`]],
  edge: [`<b>Race on allocation:</b> two threads can find the same free spot and both park — the find+reserve must be <b>atomic</b> (one lock, as above, or per-level locks / atomic compare-and-set on the spot).`, `A vehicle should take the <b>smallest fitting</b> spot, not the first free one, or trucks get stranded while cars waste large spots.`, `<b>Lost ticket</b> / re-entry and overnight/max-fee rules are common follow-ups — model them in the pricing strategy, not the lot.`, `Extensions (EV charging spots, reserved/handicap spots, multiple entry gates) should be <b>new types/strategies</b>, not edits to <code>park()</code>.`],
  faq: [['Why make pricing a Strategy instead of a method on ParkingLot?', PP(`Because pricing is the part most likely to <b>change and multiply</b> — flat rate, hourly, tiered by vehicle, weekend surcharges, max daily fee, first-hour-free. If the fee logic lives inside <code>ParkingLot.calculate_fee</code>, every new rule edits the lot (risking regressions) and the lot accumulates unrelated responsibilities. Making it a <b>Strategy</b> — an injected <code>PricingStrategy</code> with a <code>fee(hours)</code> method — means a new rule is a <b>new class</b> you pass in, the lot never changes (open/closed), and you can unit-test each pricing rule in isolation. It also lets different lots (airport vs mall) use different pricing with the same lot code. This is the single most common "show me SOLID" moment in the parking-lot question, so call it out explicitly.`)],
    ['How do you prevent two cars from being assigned the same spot?', PP(`The bug is a <b>race condition</b>: thread A finds spot S free, and before it marks S occupied, thread B also finds S free — now both park there. The fix is to make <b>"find a free spot" and "mark it occupied" a single atomic operation</b>. Simplest is a <b>lock</b> around the find+reserve block (as in the implementation), so only one thread allocates at a time. That’s fine for an interview and for moderate scale. To reduce contention you can use <b>finer-grained locks</b> (per level, so different levels allocate in parallel) or an <b>atomic compare-and-set</b> on each spot (attempt to flip <code>free→occupied</code>; if it fails because someone beat you, try the next spot). In a distributed version, the reservation would go through a database row lock or an atomic update so the invariant "one vehicle per spot" holds across servers.`)]],
  qs: [SQ('Pricing rules will change often. The cleanest design is to…', ['Add if/elif in ParkingLot.calculate_fee', 'Inject a PricingStrategy so the lot stays unchanged', 'Hardcode one rate', 'Use a global variable'], 1, 'Strategy keeps the lot open/closed and pricing testable in isolation.'),
    SQ('The main concurrency hazard in parking is…', ['Slow fee calculation', 'Two vehicles assigned the same spot if find+reserve isn’t atomic', 'Too many levels', 'Ticket formatting'], 1, 'Find-then-reserve must be atomic (lock or CAS) to keep one-vehicle-per-spot.')]
});
DP('lld-parking', {
  fu: [['How would you add EV charging or reserved spots?', 'Add a capability/type to Spot (e.g. an is_ev flag or an EVSpot subtype) and let allocation filter on it; reserved spots check a reservation before allocating. Both are new types/filters, not edits to park().'],
    ['How do multiple entry/exit gates change the design?', 'Gates are separate actors calling park()/unpark() on the shared lot; the lot’s locking already serializes allocation. A display board can be an Observer that updates free counts on each change.'],
    ['How does this scale to a distributed system?', 'The spot inventory moves to a database; reservation becomes an atomic row update or a short-lived distributed lock; tickets persist; pricing stays a strategy. The class design maps cleanly onto services.']],
  deep: [['Technique', 'Model ownership with composition (Lot→Level→Spot), vary pricing via Strategy, allocate the smallest fitting spot atomically, and keep extensions as new types.'],
    ['Failure mode', 'Non-atomic allocation (double-booked spots), first-fit instead of best-fit allocation, and pricing logic baked into the lot.'],
    ['In interviews', 'Lead with requirements and the noun→class list, then call out Strategy for pricing and the locking for allocation — the two things interviewers look for.']],
  src: ['Refactoring Guru: patterns used (Strategy, Factory)', 'https://refactoring.guru/design-patterns/strategy'] });

SDX('lld-vending', { name: 'Vending Machine', cat: 'sdlld',
  blurb: `A vending machine is the textbook State-pattern problem: its behavior depends on whether money has been inserted and whether a product is selected. It models inventory, coins/change, and a clear state machine.`,
  facts: [['Pattern', 'State (idle/has-money/dispensing)'], ['Entities', 'Machine, State, Inventory, Product'], ['Handles', 'coins, selection, change'], ['Core', 'event → state transition']],
  cheat: [['VendingMachine', 'Context holding current state + inventory'], ['State', 'Idle, HasMoney, Dispensing'], ['Events', 'insert_coin, select, dispense, refund'], ['Inventory', 'Product → (price, count)'], ['Change', 'Return balance − price'], ['Transition', 'Each state sets the next'], ['Invalid events', 'Handled per state (reject)'], ['Pattern', 'State removes big if/elif'], ['Extensible', 'Add states (maintenance) cleanly'], ['Atomic', 'Decrement stock + give change together']],
  sections: [
    ['Requirements & the state machine', PP(`<b>Requirements:</b> accept coins, let the user select a product, dispense it with correct <b>change</b>, reject invalid actions (select before paying, pick a sold-out item), and allow <b>refund</b>. The natural model is a <b>finite state machine</b>: <code>Idle</code> (no money) → <code>HasMoney</code> (coins inserted) → <code>Dispensing</code> → back to <code>Idle</code>. Each state handles the same events <b>differently</b>, which is exactly the <b>State pattern</b>.`)],
    ['Design choices', PP(`Each <b>state is a class</b> that handles <code>insert_coin</code>, <code>select</code>, <code>dispense</code>, <code>refund</code> and decides the next state; the machine (<b>context</b>) just delegates. <b>Inventory</b> maps a product to price and count. Dispensing must be <b>atomic</b>: check stock and balance, then decrement stock and compute change together, or you can oversell/undercharge. Invalid actions are handled explicitly per state (reject with a message) rather than silently.`)]
  ],
  snipTitle: 'Vending machine implementation', snipNote: 'The State pattern driving transitions; inventory and change handling.',
  snips: [['vending_machine.py', 'python', `from __future__ import annotations
from abc import ABC, abstractmethod
from dataclasses import dataclass

@dataclass
class Product:
    name: str; price: int; count: int      # price in cents

class State(ABC):
    def __init__(self, m: "VendingMachine"): self.m = m
    @abstractmethod
    def insert_coin(self, cents: int): ...
    @abstractmethod
    def select(self, name: str): ...
    @abstractmethod
    def dispense(self): ...

class Idle(State):
    def insert_coin(self, cents):
        self.m.balance += cents; self.m.state = HasMoney(self.m)
    def select(self, name): print("insert coins first")
    def dispense(self): print("nothing selected")

class HasMoney(State):
    def insert_coin(self, cents): self.m.balance += cents
    def select(self, name):
        p = self.m.inventory.get(name)
        if not p or p.count == 0: print("sold out"); return
        if self.m.balance < p.price: print(f"need {p.price - self.m.balance} more"); return
        self.m.selected = name; self.m.state = Dispensing(self.m)
    def dispense(self): print("select a product")

class Dispensing(State):
    def insert_coin(self, cents): print("dispensing, please wait")
    def select(self, name): print("dispensing, please wait")
    def dispense(self):
        p = self.m.inventory[self.m.selected]
        p.count -= 1                        # atomic: stock down + change out
        change = self.m.balance - p.price
        print(f"dispensed {p.name}, change {change}")
        self.m.balance = 0; self.m.selected = None; self.m.state = Idle(self.m)

class VendingMachine:
    def __init__(self, inventory: dict[str, Product]):
        self.inventory = inventory; self.balance = 0
        self.selected: str | None = None
        self.state: State = Idle(self)
    def insert_coin(self, c): self.state.insert_coin(c)
    def select(self, n): self.state.select(n)
    def dispense(self): self.state.dispense()

vm = VendingMachine({"coke": Product("coke", 150, 2)})
vm.select("coke")      # insert coins first
vm.insert_coin(100); vm.insert_coin(100)
vm.select("coke")      # ok -> Dispensing
vm.dispense()          # dispensed coke, change 50`]],
  edge: [`<b>Change-making:</b> returning exact change requires tracking the machine’s own coin inventory; if it can’t make change, reject the purchase or warn <b>before</b> taking money.`, `<b>Atomicity:</b> decrementing stock and computing change must happen together; interleaving (in a threaded machine) can oversell the last item.`, `<b>Invalid transitions</b> (select while dispensing, dispense while idle) must be handled per state, not crash or silently proceed.`, `Adding a <b>maintenance/out-of-service</b> state should be a new state class, not flags scattered through the logic.`],
  faq: [['Why is the State pattern the right fit for a vending machine?', PP(`Because the machine’s response to the <b>same events</b> depends entirely on <b>which mode it’s in</b>: inserting a coin while idle starts a transaction, but while dispensing it should be rejected; selecting a product only makes sense once there’s enough money. Without the pattern you’d write the same <code>if self.state == "idle": ... elif self.state == "has_money": ...</code> ladder inside <b>every</b> method (<code>insert_coin</code>, <code>select</code>, <code>dispense</code>), duplicated and easy to get out of sync. The <b>State pattern</b> makes each mode a class that handles all the events its own way and <b>decides the next state</b>, so the transition logic is localized and adding a mode (maintenance, exact-change-only) is a new class rather than edits across every method. It directly maps the problem’s finite-state nature onto the code, which is exactly what interviewers want to see here.`)],
    ['How do you handle giving change correctly?', PP(`Change is often the follow-up that separates a basic answer from a complete one. First, the machine must track its <b>own coin/note inventory</b>, not just the customer’s balance — you can only return change you physically have. The safe flow is: when the user has paid enough, compute <code>change = balance − price</code>, then check whether the machine can <b>make that amount</b> from available denominations (a greedy largest-first approach works for standard coin systems; a small dynamic-programming check is needed for arbitrary denominations). If it <b>can’t make change</b>, the right behavior is to <b>refuse before dispensing</b> and refund, or warn ("exact change only") up front — never take the money and short-change the customer. Finally, dispensing the product, deducting the change coins from inventory, and resetting the balance should be done <b>atomically</b> so a concurrent request or a mid-operation failure can’t leave inconsistent stock or balance.`)]],
  qs: [SQ('Which pattern best models a vending machine whose behavior depends on money inserted?', ['Singleton', 'State', 'Adapter', 'Builder'], 1, 'Each state (idle/has-money/dispensing) handles events differently and transitions.'),
    SQ('Decrementing stock and computing change should be…', ['Done in any order, separately', 'Performed atomically to avoid overselling/short-changing', 'Skipped for speed', 'Done by the caller'], 1, 'Doing them together prevents selling the last item twice or giving wrong change.')]
});
DP('lld-vending', {
  fu: [['How do you implement change-making for arbitrary denominations?', 'Greedy (largest coin first) works for canonical systems; for arbitrary denominations use dynamic programming (coin-change) to find a feasible/minimal set, and reject if none exists given current coin inventory.'],
    ['How would you add a maintenance mode?', 'Add a Maintenance state class that rejects normal events and allows restocking/coin-refill; transition into it from a service action. No existing state logic changes.'],
    ['What changes if the machine is multi-threaded?', 'Guard state transitions and inventory/coin updates with a lock so concurrent inserts/selects can’t oversell or double-dispense; or serialize events through a single queue.']],
  deep: [['Technique', 'Model modes as State classes that handle all events and set the next state; keep inventory/coins in the context; make dispense+change atomic.'],
    ['Failure mode', 'Conditionals duplicated across methods, non-atomic dispense (overselling), and taking money without being able to make change.'],
    ['In interviews', 'Name State immediately, draw the transition diagram, then code one or two states fully and the context delegation.']],
  src: ['Refactoring Guru: State', 'https://refactoring.guru/design-patterns/state'] });

SDX('lld-elevator', { name: 'Elevator System', cat: 'sdlld',
  blurb: `Designing an elevator system combines a per-car state machine with a dispatch strategy that assigns requests to cars. It’s a favorite because the "which car, in what order" scheduling has real depth.`,
  facts: [['Entities', 'Controller, Elevator, Request'], ['Per car', 'direction + state machine'], ['Dispatch', 'Strategy (nearest, SCAN)'], ['Scheduling', 'serve requests in sweep order']],
  cheat: [['ElevatorController', 'Routes requests to elevators'], ['Elevator', 'Car: floor, direction, stops'], ['Request', 'Pickup floor + direction (or target)'], ['Direction', 'UP / DOWN / IDLE'], ['DispatchStrategy', 'Choose the best car (injectable)'], ['SCAN/LOOK', 'Sweep in one direction, then reverse'], ['Stops', 'Sorted set per direction'], ['Step()', 'Advance the simulation one tick'], ['Patterns', 'Strategy (dispatch), State (car)'], ['Extensible', 'Express cars, zoning, priorities']],
  sections: [
    ['Requirements & entities', PP(`<b>Requirements:</b> several elevators serve a building; external <b>hall calls</b> (floor + up/down) and internal <b>car calls</b> (target floor); minimize wait/travel; a car serves stops efficiently in a <b>sweep</b> rather than reversing constantly. <b>Entities:</b> <code>ElevatorController</code> (assigns requests), <code>Elevator</code> (a car with floor, direction, and a set of pending stops), <code>Request</code> (origin + direction or target). Behavior: <code>request</code>, <code>dispatch</code>, <code>step</code> (advance one tick).`)],
    ['Dispatch and per-car movement', PP(`<b>Dispatch</b> is a <b>Strategy</b>: given a request, pick the best car — simplest is <b>nearest idle/suitable car</b>; more realistic is one already moving toward the floor in the same direction. Each car follows the <b>SCAN/LOOK</b> idea: keep moving in its current direction serving stops in order, then reverse when none remain ahead. Pending stops are kept <b>sorted</b> so the car serves them in sweep order. The car itself is a small <b>state machine</b> (moving up/down, idle, doors open).`)]
  ],
  snipTitle: 'Elevator system implementation', snipNote: 'A LOOK-style car plus a pluggable nearest-car dispatch strategy.',
  snips: [['elevator.py', 'python', `from __future__ import annotations
from enum import Enum
from dataclasses import dataclass, field
from sortedcontainers import SortedSet      # or use a plain sorted list

class Dir(Enum): UP = 1; DOWN = -1; IDLE = 0

@dataclass
class Elevator:
    id: int
    floor: int = 0
    direction: Dir = Dir.IDLE
    up_stops: SortedSet = field(default_factory=SortedSet)    # floors above
    down_stops: SortedSet = field(default_factory=SortedSet)  # floors below

    def add_stop(self, floor: int):
        (self.up_stops if floor > self.floor else self.down_stops).add(floor)
        if self.direction == Dir.IDLE:
            self.direction = Dir.UP if floor > self.floor else Dir.DOWN

    def step(self):                          # LOOK: sweep, then reverse
        stops = self.up_stops if self.direction == Dir.UP else self.down_stops
        if not stops:
            # reverse if the other side has work, else go idle
            other = self.down_stops if self.direction == Dir.UP else self.up_stops
            self.direction = (Dir.DOWN if self.direction == Dir.UP else Dir.UP) if other else Dir.IDLE
            return
        target = stops[0] if self.direction == Dir.UP else stops[-1]
        self.floor += self.direction.value
        if self.floor == target:
            stops.discard(target)            # doors open here
            print(f"car {self.id} stops at {self.floor}")

class DispatchStrategy:
    def choose(self, cars: list[Elevator], floor: int) -> Elevator:
        raise NotImplementedError
class NearestCar(DispatchStrategy):
    def choose(self, cars, floor):
        return min(cars, key=lambda c: abs(c.floor - floor))   # simplest heuristic

class ElevatorController:
    def __init__(self, cars: list[Elevator], strategy: DispatchStrategy):
        self.cars, self.strategy = cars, strategy
    def request(self, floor: int):
        car = self.strategy.choose(self.cars, floor)
        car.add_stop(floor)
        return car.id
    def step(self):
        for c in self.cars: c.step()

ctrl = ElevatorController([Elevator(0), Elevator(1)], NearestCar())
ctrl.request(5); ctrl.request(3)
for _ in range(6): ctrl.step()`]],
  edge: [`<b>Starvation:</b> a naive "nearest car" or always-up sweep can leave some calls waiting forever under load — real dispatchers add aging/priority so old requests get served.`, `Hall calls carry a <b>direction</b>; a down-traveling car shouldn’t pick up an up request on the way unless it will reverse — track request direction, not just floor.`, `<b>SCAN vs LOOK:</b> LOOK reverses as soon as there are no stops ahead (more efficient) rather than traveling to the building’s end; make the choice explicit.`, `<b>Concurrency:</b> requests arrive asynchronously; serialize assignment/step updates so a car’s stop set isn’t mutated mid-step.`],
  faq: [['How do you decide which elevator serves a request?', PP(`That’s the <b>dispatch</b> decision, and the cleanest design makes it a <b>Strategy</b> so you can start simple and improve it without touching the rest of the system. The most basic heuristic is <b>nearest car</b> (minimize <code>|car.floor − request.floor|</code>), which is fine to code in an interview. A better one considers <b>direction and current load</b>: strongly prefer a car already moving <b>toward</b> the request floor in the <b>same direction</b> (it can pick up on the way with little extra cost), then idle cars, then cars that would have to reverse; you can score each car by estimated time-to-serve and pick the minimum. More advanced systems use <b>zoning</b> (cars assigned to floor bands), <b>express</b> cars for high floors, and <b>look-ahead</b> optimization. Because it’s a Strategy, you demonstrate the simple version working and then say "I’d swap in a smarter <code>choose()</code> that factors direction, load, and estimated wait" — showing extensibility.`)],
    ['How does a single car decide the order to serve its stops?', PP(`A car shouldn’t serve stops in the order they arrived — that causes wasteful back-and-forth. The standard approach is the <b>SCAN/LOOK</b> (elevator) algorithm: the car keeps moving in its <b>current direction</b>, serving all stops it passes <b>in sorted order</b>, and only <b>reverses</b> when there are no more stops ahead in that direction. <b>SCAN</b> goes all the way to the end of the building before reversing; <b>LOOK</b> (usually preferred) reverses as soon as there’s nothing further ahead, saving travel. In code you keep two sorted structures — stops above and below the car — and each tick move toward the nearest stop in the current direction, popping it when reached, then flip direction when the current side is empty and the other side has work. This serves everyone efficiently and bounds travel; adding <b>aging</b> (bump priority of long-waiting calls) prevents starvation under heavy load.`)]],
  qs: [SQ('Choosing which car handles a hall call is best modeled as…', ['A singleton', 'A dispatch Strategy (nearest/direction-aware), injectable', 'A builder', 'An adapter'], 1, 'Strategy lets you start with nearest-car and upgrade dispatch without rewrites.'),
    SQ('A single car should serve its stops using…', ['Arrival order (FIFO)', 'SCAN/LOOK: sweep in one direction, then reverse', 'Random order', 'Only the newest request'], 1, 'Sweeping in order (LOOK) minimizes travel vs reversing per request.')]
});
DP('lld-elevator', {
  fu: [['SCAN vs LOOK vs C-SCAN?', 'SCAN goes to the extreme end before reversing; LOOK reverses when no stops remain ahead (less travel); C-SCAN always sweeps one direction then jumps back for fairness. LOOK is the common practical choice.'],
    ['How do you prevent starvation under load?', 'Add aging/priority so long-waiting requests get boosted, or reserve capacity; purely greedy nearest-car dispatch can starve far-away or opposite-direction calls.'],
    ['How would you simulate and test this?', 'Drive it with a discrete-event step() loop, feed request sequences, and assert on total/worst-case wait and travel. The strategy abstraction makes comparing dispatch algorithms easy.']],
  deep: [['Technique', 'Model each car as a LOOK-style state machine with sorted up/down stop sets; make dispatch a Strategy; advance with a step() tick for simulation.'],
    ['Failure mode', 'FIFO stop service (excess travel), ignoring request direction, and starvation from greedy dispatch.'],
    ['In interviews', 'Separate controller (dispatch) from car (movement); show LOOK for a car and a pluggable dispatch strategy, then discuss improvements.']],
  src: ['Elevator algorithm (SCAN/LOOK)', 'https://en.wikipedia.org/wiki/Elevator_algorithm'] });

SDX('lld-movie', { name: 'Movie Ticket Booking', cat: 'sdlld',
  blurb: `A movie-booking system (BookMyShow/Fandango style) centers on seat selection under concurrency: many users eye the same seats, so the hard part is holding and confirming seats without double-booking. It models theaters, shows, seats, and a reservation flow.`,
  facts: [['Entities', 'Theater, Screen, Show, Seat, Booking'], ['Hard part', 'concurrent seat booking'], ['Flow', 'hold → pay → confirm (or expire)'], ['Prevents', 'double-booking']],
  cheat: [['Theater/Screen', 'Venue and its auditoriums'], ['Show', 'Movie on a screen at a time'], ['Seat', 'Per-show seat + status'], ['SeatStatus', 'AVAILABLE/HELD/BOOKED'], ['Booking', 'User + seats + state'], ['Hold', 'Temporary lock with expiry (TTL)'], ['Confirm', 'After payment, within TTL'], ['Atomicity', 'Hold all seats or none'], ['Concurrency', 'Lock/CAS per seat'], ['Expiry', 'Background release of stale holds']],
  sections: [
    ['Requirements & entities', PP(`<b>Requirements:</b> browse shows, pick seats, <b>pay</b>, get a confirmed booking; crucially, <b>no two users book the same seat</b>. <b>Entities:</b> <code>Theater</code> → <code>Screen</code> → <code>Show</code> (a movie at a time on a screen), per-show <code>Seat</code>s with a <b>status</b>, and a <code>Booking</code>. The seat status is the heart of it: <code>AVAILABLE → HELD → BOOKED</code>, with a path back to <code>AVAILABLE</code> if a hold <b>expires</b> or payment fails.`)],
    ['The hold-confirm flow (avoiding double-booking)', PP(`Selecting seats doesn’t book them — it places a <b>temporary hold</b> with a <b>TTL</b> (e.g. 5 minutes) so the user has time to pay. The hold must be <b>atomic and all-or-nothing</b>: either all requested seats move <code>AVAILABLE→HELD</code> or none do (otherwise two users each grab half a group). On successful payment within the TTL the seats move <code>HELD→BOOKED</code>; if the TTL passes, a background sweep releases them. Per-seat <b>locking</b> (or an atomic compare-and-set) enforces the invariant under concurrency.`)]
  ],
  snipTitle: 'Movie booking implementation', snipNote: 'Atomic all-or-nothing seat holds with TTL, then confirm.',
  snips: [['movie_booking.py', 'python', `from __future__ import annotations
from enum import Enum
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import threading, itertools

class SeatStatus(Enum): AVAILABLE = 1; HELD = 2; BOOKED = 3

@dataclass
class Seat:
    id: str
    status: SeatStatus = SeatStatus.AVAILABLE
    hold_until: datetime | None = None
    held_by: str | None = None

class Show:
    def __init__(self, show_id: str, seats: list[str]):
        self.id = show_id
        self.seats = {s: Seat(s) for s in seats}
        self._lock = threading.Lock()
        self._seq = itertools.count(1)
        self.bookings: dict[str, list[str]] = {}

    def hold(self, user: str, seat_ids: list[str], ttl=timedelta(minutes=5)) -> str:
        now = datetime.now()
        with self._lock:                      # atomic: all-or-nothing
            self._expire(now)
            for sid in seat_ids:
                seat = self.seats[sid]
                if seat.status != SeatStatus.AVAILABLE:
                    raise RuntimeError(f"seat {sid} not available")
            for sid in seat_ids:              # all check out -> hold them
                s = self.seats[sid]
                s.status = SeatStatus.HELD; s.hold_until = now + ttl; s.held_by = user
            hold_id = f"H{next(self._seq)}"
            self.bookings[hold_id] = seat_ids
            return hold_id

    def confirm(self, hold_id: str, user: str) -> str:
        with self._lock:
            self._expire(datetime.now())
            seat_ids = self.bookings.get(hold_id)
            if not seat_ids: raise RuntimeError("hold expired or invalid")
            for sid in seat_ids:
                s = self.seats[sid]
                if s.status != SeatStatus.HELD or s.held_by != user:
                    raise RuntimeError("hold no longer valid")
            for sid in seat_ids:
                self.seats[sid].status = SeatStatus.BOOKED
            return f"BOOKING-{hold_id}"

    def _expire(self, now):                   # release stale holds
        for s in self.seats.values():
            if s.status == SeatStatus.HELD and s.hold_until and s.hold_until < now:
                s.status = SeatStatus.AVAILABLE; s.hold_until = None; s.held_by = None

show = Show("S1", ["A1", "A2", "A3"])
h = show.hold("ada", ["A1", "A2"])       # both held atomically
print(show.confirm(h, "ada"))            # BOOKING-H1
# show.hold("bob", ["A1"])  -> RuntimeError: seat A1 not available`]],
  edge: [`<b>Partial holds</b> are the classic bug: if two users each request {A1,A2} and {A2,A3} and holds aren’t all-or-nothing, both can half-succeed and block each other — hold the whole group atomically.`, `<b>Hold expiry</b> must actually run (background sweep or lazy check on each access), or seats stay stuck in <code>HELD</code> after abandoned checkouts.`, `<b>Payment failure</b> after hold must release the seats; tie the hold TTL to the payment window.`, `At scale, the per-seat lock becomes a <b>database row lock / atomic update</b> (or a distributed lock), since the invariant must hold across many servers.`],
  faq: [['How do you stop two people from booking the same seat?', PP(`The core technique is a <b>two-phase hold-then-confirm with atomic seat state transitions</b>. Selecting seats doesn’t book them; it attempts to move them <code>AVAILABLE → HELD</code>, and this must be <b>atomic and all-or-nothing</b> for the whole seat group — under a lock (single server) or an atomic conditional update / row lock (distributed), you first verify every requested seat is <code>AVAILABLE</code>, and only if all are do you flip them all to <code>HELD</code>. If any seat is already held or booked, the entire request fails and the user picks again. The hold carries a <b>TTL</b> so an abandoned checkout doesn’t lock seats forever. Payment happens against the held seats, and <b>confirm</b> moves <code>HELD → BOOKED</code> only if the hold is still valid (same user, not expired). This guarantees the invariant "a seat is booked by at most one user" because the critical <code>AVAILABLE→HELD</code> check-and-set is serialized — two concurrent requests for the same seat can’t both win.`)],
    ['Why hold seats temporarily instead of booking them immediately on selection?', PP(`Because payment takes time and can fail, and users abandon carts. If you booked seats <b>immediately</b> on selection, a user who never pays would permanently consume seats (you’d need a reversal process), and you couldn’t reserve them during the payment flow without committing. If instead you did nothing until payment, two users could both reach the payment step for the same seats and one would fail <i>after</i> entering card details — a bad experience. The <b>temporary hold with TTL</b> solves both: it reserves the exact seats for a bounded window so the paying user is guaranteed those seats, while automatically returning them to the pool if payment isn’t completed in time. This mirrors how real ticketing works ("your seats are held for 5:00") and cleanly separates "intent to buy" (hold) from "purchase" (confirm), with expiry as the safety valve that prevents inventory from leaking.`)]],
  qs: [SQ('The key mechanism to prevent double-booking seats is…', ['Booking on page load', 'An atomic, all-or-nothing hold (AVAILABLE→HELD) with a TTL, then confirm', 'First-come email', 'Random assignment'], 1, 'Atomic hold-then-confirm serializes the critical transition and bounds reservations.'),
    SQ('Holding seats for a group of two should be…', ['Done seat by seat independently', 'All-or-nothing (hold both or neither)', 'Skipped', 'Done after payment'], 1, 'Per-seat partial holds let two users half-succeed and block each other.')]
});
DP('lld-movie', {
  fu: [['How does this scale to a distributed BookMyShow?', 'Seat inventory lives in a database; the hold becomes an atomic conditional UPDATE (status=HELD WHERE status=AVAILABLE) or a short-lived distributed lock per seat; a job expires stale holds; confirmed bookings are written transactionally with payment.'],
    ['How do you handle the hold expiry reliably?', 'Either a background sweeper that releases expired holds, a lazy check on each access (as in _expire), or TTL keys in Redis that auto-expire; combine lazy + periodic for correctness.'],
    ['How do you prevent a user from holding the whole theater?', 'Enforce a max-seats-per-booking limit and per-user hold caps, and rate-limit hold requests to curb hoarding/bots.']],
  deep: [['Technique', 'Model seat status as a small state machine; hold groups atomically with a TTL; confirm only valid holds; expire stale holds in the background.'],
    ['Failure mode', 'Non-atomic/partial holds (double-booking or deadlocked half-holds), holds that never expire, and not releasing seats on payment failure.'],
    ['In interviews', 'Lead with the concurrency invariant and the hold-confirm-expire flow; mention the distributed version (atomic UPDATE / Redis TTL) as the scale-up.']],
  src: ['Optimistic vs pessimistic concurrency (overview)', 'https://en.wikipedia.org/wiki/Optimistic_concurrency_control'] });

SDX('lld-splitwise', { name: 'Splitwise (expense sharing)', cat: 'sdlld',
  blurb: `Splitwise tracks shared expenses among a group and tells everyone who owes whom. The interesting parts are modeling different split types (equal, exact, percentage) and simplifying the resulting web of debts into the fewest transactions.`,
  facts: [['Entities', 'User, Group, Expense, Split, Balance'], ['Splits', 'equal / exact / percent'], ['Core', 'net balance per user'], ['Bonus', 'minimize settle-up transactions']],
  cheat: [['User/Group', 'People and the set that shares expenses'], ['Expense', 'Payer, amount, participants, split'], ['SplitStrategy', 'Equal / Exact / Percent (Strategy)'], ['Balance sheet', 'Net owed per (debtor, creditor)'], ['Net balance', 'Sum of paid − owed per user'], ['Settle up', 'Reduce debts to transfers'], ['Simplify', 'Greedy max-creditor/max-debtor'], ['Validation', 'Exact sums to total; percents to 100'], ['Pattern', 'Strategy for split types'], ['Extensible', 'New split type = new strategy']],
  sections: [
    ['Requirements & entities', PP(`<b>Requirements:</b> users in a group add <b>expenses</b>, each split among participants by <b>equal</b>, <b>exact amounts</b>, or <b>percentages</b>; the system tracks <b>who owes whom</b> and supports <b>settle up</b>. <b>Entities:</b> <code>User</code>, <code>Group</code>, <code>Expense</code> (payer, amount, participants, split), and a <b>balance sheet</b> tracking net amounts between users. Each <b>split type is a Strategy</b>, so adding (say) share-based splitting is a new class.`)],
    ['Balances and debt simplification', PP(`For each expense, the <b>payer is owed</b> their share back by each participant; you accumulate these into a <b>net balance per user</b> (total paid minus total owed). To <b>settle up</b> with the <b>fewest transactions</b>, use a greedy approach: repeatedly take the person who <b>owes the most</b> and the person who <b>is owed the most</b>, transfer the smaller of the two amounts between them, and repeat. This reduces a tangled web of pairwise debts to a minimal set of payments.`)]
  ],
  snipTitle: 'Splitwise implementation', snipNote: 'Split strategies, net balances, and greedy debt simplification.',
  snips: [['splitwise.py', 'python', `from __future__ import annotations
from abc import ABC, abstractmethod
from collections import defaultdict
import heapq

class SplitStrategy(ABC):
    @abstractmethod
    def shares(self, amount: float, parts) -> dict[str, float]: ...

class EqualSplit(SplitStrategy):
    def shares(self, amount, parts):          # parts: list[user]
        each = round(amount / len(parts), 2)
        return {u: each for u in parts}

class ExactSplit(SplitStrategy):
    def shares(self, amount, parts):          # parts: dict[user, exact]
        if round(sum(parts.values()), 2) != round(amount, 2):
            raise ValueError("exact shares must sum to total")
        return dict(parts)

class PercentSplit(SplitStrategy):
    def shares(self, amount, parts):          # parts: dict[user, percent]
        if round(sum(parts.values()), 2) != 100:
            raise ValueError("percentages must sum to 100")
        return {u: round(amount * p / 100, 2) for u, p in parts.items()}

class ExpenseBook:
    def __init__(self):
        self.net: dict[str, float] = defaultdict(float)   # +owed to them, -they owe
    def add_expense(self, payer: str, amount: float, parts, strategy: SplitStrategy):
        shares = strategy.shares(amount, parts)
        for user, owed in shares.items():
            if user == payer: continue
            self.net[user] -= owed            # participant owes their share
            self.net[payer] += owed           # payer is owed it back
    def settle(self) -> list[tuple[str, str, float]]:
        # greedy: biggest debtor pays biggest creditor
        debtors  = [(-v, u) for u, v in self.net.items() if v < -1e-9]
        creditors= [(-v, u) for u, v in self.net.items() if v > 1e-9]
        heapq.heapify(debtors); heapq.heapify(creditors)   # max-heaps via negation
        transfers = []
        while debtors and creditors:
            d_amt, d = heapq.heappop(debtors)   # d_amt = -(owed), most negative
            c_amt, c = heapq.heappop(creditors)
            pay = round(min(-d_amt, -c_amt), 2)
            transfers.append((d, c, pay))       # d pays c
            d_rem, c_rem = (-d_amt) - pay, (-c_amt) - pay
            if d_rem > 1e-9: heapq.heappush(debtors, (-d_rem, d))
            if c_rem > 1e-9: heapq.heappush(creditors, (-c_rem, c))
        return transfers

book = ExpenseBook()
book.add_expense("ada", 90, ["ada", "bob", "cara"], EqualSplit())   # each owes 30
book.add_expense("bob", 60, {"bob": 50, "ada": 10}, PercentSplit()) # of 60
print(dict(book.net))
print(book.settle())      # minimal list of (debtor, creditor, amount)`]],
  edge: [`<b>Rounding:</b> equal splits of amounts that don’t divide evenly (10/3) leave cents unaccounted — assign the remainder to one participant so totals reconcile exactly.`, `<b>Validation:</b> exact splits must sum to the total and percentages to 100; reject early rather than storing inconsistent expenses.`, `Greedy debt simplification gives a <b>small</b> (often minimal) set of transfers but the true minimum is NP-hard in general — greedy is the accepted interview answer.`, `Track balances as a <b>net per user</b> (or per pair) rather than storing every raw debt, or settle-up math gets tangled and double-counts.`],
  faq: [['How do you support different split types cleanly?', PP(`Model each split type as a <b>Strategy</b> with a common method like <code>shares(amount, participants) → {user: owed}</code>, and have the expense hold whichever strategy it needs. <code>EqualSplit</code> divides evenly, <code>ExactSplit</code> takes per-person amounts (and validates they sum to the total), <code>PercentSplit</code> takes percentages (validating they sum to 100). The <code>ExpenseBook</code> that updates balances is written <b>once</b> against the strategy interface — it just asks for the shares and applies them — so adding a new split type (by shares, by adjustment, "I’ll cover X and split the rest") is a <b>new strategy class</b> with no changes to the balance logic. This is the SOLID moment interviewers look for in Splitwise: the split <i>rule</i> varies, so it’s a strategy, keeping the core open/closed and each split type independently testable.`)],
    ['How do you minimize the number of settle-up transactions?', PP(`First reduce everything to a <b>net balance per person</b> — total they paid minus total they owe — so a web of pairwise debts collapses into a single number per user (positive = they’re owed, negative = they owe; the sum is zero). Then use a <b>greedy</b> algorithm: put debtors and creditors in max-heaps by magnitude, repeatedly match the <b>person who owes the most</b> with the <b>person who is owed the most</b>, transfer the <b>smaller</b> of the two amounts between them, reduce both by that amount, and push back whoever still has a nonzero balance. Each transfer zeroes out at least one person, so you get a small set of payments — typically far fewer than the raw pairwise debts. Worth noting honestly: finding the <b>provably minimum</b> number of transactions is NP-hard in the general case, so this greedy approach is the standard, accepted answer; it’s near-optimal in practice and easy to reason about, and mentioning the NP-hardness shows depth.`)]],
  qs: [SQ('Different expense-split rules (equal/exact/percent) are best modeled as…', ['Subclasses of User', 'Split Strategy implementations behind one interface', 'A singleton', 'Separate databases'], 1, 'Strategy keeps the balance logic unchanged while split rules vary.'),
    SQ('To minimize settle-up transactions you…', ['Record every pairwise debt separately', 'Compute net balances, then greedily match biggest debtor with biggest creditor', 'Have everyone pay person A', 'Ignore small debts'], 1, 'Net balances + greedy matching yields a small set of transfers.')]
});
DP('lld-splitwise', {
  fu: [['Why is minimum cash-flow settlement NP-hard?', 'Choosing transfers to minimize their count is related to subset/partition problems; the general optimum is NP-hard. The greedy max-debtor/max-creditor approach is the practical, near-optimal solution used in interviews and products.'],
    ['How do you handle rounding fairly?', 'Compute shares, then distribute the leftover cents (total minus sum of rounded shares) to one or a few participants deterministically so the splits reconcile to the exact total.'],
    ['How would you add groups and multi-currency?', 'Scope balances per group; for multi-currency, store amounts with a currency and convert to a base currency (with a rate source) before netting, or keep per-currency balances.']],
  deep: [['Technique', 'Split types as strategies; accumulate net balances per user; settle via greedy heap-based matching; validate splits up front.'],
    ['Failure mode', 'Rounding leaks, invalid splits stored, and tangled per-debt bookkeeping that double-counts.'],
    ['In interviews', 'Call out Strategy for splits and the net-balance + greedy settle-up; note the true minimum is NP-hard.']],
  src: ['Minimize cash flow among friends (GeeksforGeeks)', 'https://www.geeksforgeeks.org/minimize-cash-flow-among-given-set-friends-borrowed-money/'] });

SDX('lld-ratelimiter', { name: 'Rate Limiter (object design)', cat: 'sdlld',
  blurb: `An in-process rate limiter decides whether a request is allowed under a quota. The LLD angle is designing swappable algorithms (token bucket, sliding window) behind one interface and making them thread-safe. (The distributed/system-design version is covered separately.)`,
  facts: [['Interface', 'allow(key) → bool'], ['Algorithms', 'token bucket, sliding window'], ['Pattern', 'Strategy (algorithm)'], ['Must be', 'thread-safe']],
  cheat: [['RateLimiter', 'allow(key) decides accept/reject'], ['Token bucket', 'Refill tokens over time; spend 1/request'], ['Leaky bucket', 'Queue drains at a fixed rate'], ['Fixed window', 'Count per time window (bursty at edges)'], ['Sliding window', 'Smooths the fixed-window edge burst'], ['Per-key state', 'One counter/bucket per user/IP'], ['Thread-safe', 'Lock per key'], ['Strategy', 'Swap algorithm behind allow()'], ['Allows bursts', 'Token bucket up to capacity'], ['Config', 'rate + capacity/window']],
  sections: [
    ['Requirements & interface', PP(`<b>Requirement:</b> given a <b>key</b> (user, IP, API token), decide if a request is <b>allowed</b> under a configured rate, cheaply and thread-safely. The interface is tiny — <code>allow(key) → bool</code> — which makes the <b>algorithm a Strategy</b>: the caller never changes when you swap token bucket for sliding window. State is <b>per key</b> (each user has their own bucket/counter), and updates must be <b>atomic</b> per key.`)],
    ['Token bucket vs sliding window', PP(`<b>Token bucket</b> refills tokens at a steady rate up to a <b>capacity</b>; each request spends a token, and requests are allowed while tokens remain — this permits controlled <b>bursts</b> (up to capacity) while bounding the average rate, and it’s the most common choice. <b>Fixed window</b> counts requests per calendar window but allows a <b>double burst</b> at the boundary; <b>sliding window</b> fixes that by weighting the previous window or tracking timestamps. Pick token bucket when bursts are acceptable, sliding window when you need a smoother cap.`)]
  ],
  snipTitle: 'Rate limiter implementation', snipNote: 'A thread-safe token-bucket strategy behind a tiny interface.',
  snips: [['rate_limiter.py', 'python', `from __future__ import annotations
from abc import ABC, abstractmethod
from dataclasses import dataclass
import time, threading
from collections import defaultdict

class RateLimiter(ABC):
    @abstractmethod
    def allow(self, key: str) -> bool: ...

@dataclass
class _Bucket:
    tokens: float
    last: float

class TokenBucket(RateLimiter):
    def __init__(self, rate_per_sec: float, capacity: int):
        self.rate, self.capacity = rate_per_sec, capacity
        self._buckets: dict[str, _Bucket] = {}
        self._locks: dict[str, threading.Lock] = defaultdict(threading.Lock)

    def allow(self, key: str) -> bool:
        with self._locks[key]:                 # atomic per key
            now = time.monotonic()
            b = self._buckets.get(key) or _Bucket(self.capacity, now)
            # refill based on elapsed time, capped at capacity
            b.tokens = min(self.capacity, b.tokens + (now - b.last) * self.rate)
            b.last = now
            if b.tokens >= 1:
                b.tokens -= 1
                self._buckets[key] = b
                return True
            self._buckets[key] = b
            return False

# 5 requests/sec, burst up to 10
rl = TokenBucket(rate_per_sec=5, capacity=10)
allowed = sum(rl.allow("user:1") for _ in range(12))
print(allowed)      # 10 immediately (burst), remaining rejected until refill`]],
  edge: [`<b>Thread safety:</b> read-modify-write of a bucket must be atomic per key, or concurrent requests over- or under-count; use a per-key lock (or atomic ops) rather than one global lock to avoid contention.`, `<b>Fixed-window boundary burst:</b> a fixed window allows up to 2× the limit around the boundary (end of one window + start of the next) — use sliding window if that matters.`, `<b>Clock source:</b> use a <b>monotonic</b> clock for refill math; wall-clock jumps (NTP) corrupt token calculations.`, `<b>Memory:</b> per-key state grows with distinct keys — evict idle buckets (LRU/TTL) so inactive users don’t leak memory.`],
  faq: [['Why is token bucket usually preferred, and how does it work?', PP(`<b>Token bucket</b> is popular because it bounds the <b>average</b> rate while still allowing <b>short bursts</b>, which matches real traffic (clients often send a quick batch then idle). It works by maintaining, per key, a bucket that <b>refills at a fixed rate</b> up to a maximum <b>capacity</b>; each request <b>spends one token</b>, and a request is allowed only if a token is available. Implementation is lazy and cheap: instead of a background refiller, you store the token count and the <b>last-update timestamp</b>, and on each request add <code>elapsed × rate</code> tokens (capped at capacity) before trying to spend one. The capacity controls the maximum burst size and the rate controls the steady-state throughput. Compared to a fixed-window counter (which allows a double burst at window edges) and leaky bucket (which smooths output but disallows bursts), token bucket gives the most useful trade-off for APIs, which is why it’s the default in many gateways.`)],
    ['What’s the difference between fixed-window and sliding-window limiting?', PP(`A <b>fixed window</b> counts requests in discrete intervals — e.g. "100 per minute" resets the counter at the top of each minute. It’s trivial to implement but has a well-known flaw: a client can send 100 requests in the last second of one window and 100 in the first second of the next, delivering <b>200 requests in ~2 seconds</b> while technically obeying the per-minute cap — a boundary burst up to 2× the limit. <b>Sliding window</b> fixes this by considering a moving time range. Two common forms: <b>sliding-window log</b> keeps timestamps of recent requests and counts those within the last interval (exact but memory-heavy), while <b>sliding-window counter</b> approximates by blending the current window’s count with a weighted fraction of the previous window’s count based on how far into the current window you are (cheap and smooth). Use fixed window when simplicity suffices and occasional edge bursts are fine; use sliding window when you need the cap to hold over <i>any</i> rolling interval, not just aligned ones.`)]],
  qs: [SQ('Which algorithm allows controlled bursts up to a capacity while bounding the average rate?', ['Fixed window', 'Token bucket', 'Leaky bucket (pure)', 'Round robin'], 1, 'Token bucket refills steadily and lets requests burst until tokens run out.'),
    SQ('The flaw of a fixed-window counter is…', ['It is too slow', 'A boundary burst can allow up to 2× the limit around the window edge', 'It cannot be made thread-safe', 'It needs a database'], 1, 'Requests at the end of one window plus start of the next double the burst.')]
});
DP('lld-ratelimiter', {
  fu: [['How do you make this distributed?', 'Move per-key state to a shared store (Redis) and do the refill/spend atomically with a Lua script or atomic INCR+EXPIRE; this is covered in the system-design rate-limiter case study. The Strategy interface stays the same.'],
    ['How do you avoid lock contention?', 'Use per-key locks (or sharded locks) rather than one global lock, and keep the critical section tiny (just the refill+spend). Atomic integer operations can replace locks for counter-based algorithms.'],
    ['How do you bound memory for many keys?', 'Evict idle buckets with an LRU or TTL so inactive keys don’t accumulate; in Redis, EXPIRE handles this automatically.']],
  deep: [['Technique', 'Tiny allow(key) interface with swappable algorithms (Strategy); per-key atomic refill+spend using a monotonic clock; evict idle state.'],
    ['Failure mode', 'Non-atomic updates (mis-counting), global-lock contention, wall-clock refill bugs, and unbounded per-key memory.'],
    ['In interviews', 'Default to token bucket, state the sliding-window alternative and its reason, and note the distributed version uses Redis atomics.']],
  src: ['Token bucket (overview)', 'https://en.wikipedia.org/wiki/Token_bucket'] });

SDX('lld-lru', { name: 'LRU Cache', cat: 'sdlld',
  blurb: `An LRU (least-recently-used) cache evicts the item unused for the longest time when it’s full. The classic design — a hash map plus a doubly linked list — gives O(1) get and put, and it’s both a common LLD question and LeetCode 146.`,
  facts: [['Evicts', 'least recently used'], ['Structures', 'hash map + doubly linked list'], ['Ops', 'get / put in O(1)'], ['LeetCode', '#146']],
  cheat: [['LRUCache', 'get(key), put(key,value), capacity'], ['Hash map', 'key → node (O(1) lookup)'], ['Doubly linked list', 'Order by recency'], ['Head', 'Most recently used'], ['Tail', 'Least recently used (evict here)'], ['On access', 'Move node to head'], ['On insert full', 'Remove tail, then add at head'], ['O(1)', 'Map lookup + O(1) list splice'], ['Dummy head/tail', 'Simplify edge cases'], ['Thread-safe', 'Add a lock if concurrent']],
  sections: [
    ['Why hash map + doubly linked list', PP(`You need two things in <b>O(1)</b>: <b>look up</b> a key’s value, and <b>reorder</b> it to "most recently used" on every access, plus <b>evict</b> the least recently used when full. A <b>hash map</b> gives O(1) key→node lookup; a <b>doubly linked list</b> gives O(1) <b>move-to-front</b> and <b>remove-from-tail</b> (because each node knows its neighbors, you can splice it out and reinsert without scanning). Neither structure alone suffices — the map can’t track recency order, and the list can’t look up by key — so you combine them.`)],
    ['The operations', PP(`<b><code>get(key)</code>:</b> if present, <b>move its node to the head</b> (most recent) and return the value; else return a miss. <b><code>put(key, value)</code>:</b> if the key exists, update and move to head; if new and the cache is <b>at capacity</b>, <b>evict the tail</b> node (least recent) and remove it from the map, then insert the new node at the head. Using <b>dummy head/tail sentinel</b> nodes removes most null-checks and edge cases.`)]
  ],
  snipTitle: 'LRU cache implementation', snipNote: 'Hash map + doubly linked list with sentinels for O(1) get/put.',
  snips: [['lru_cache.py', 'python', `class _Node:
    __slots__ = ("key", "val", "prev", "next")
    def __init__(self, key=0, val=0):
        self.key, self.val, self.prev, self.next = key, val, None, None

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.map: dict[int, _Node] = {}
        self.head = _Node()          # dummy head (most recent side)
        self.tail = _Node()          # dummy tail (least recent side)
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, n: _Node):
        n.prev.next = n.next; n.next.prev = n.prev
    def _add_front(self, n: _Node):
        n.prev = self.head; n.next = self.head.next
        self.head.next.prev = n; self.head.next = n

    def get(self, key: int) -> int:
        n = self.map.get(key)
        if not n: return -1
        self._remove(n); self._add_front(n)      # mark most-recently-used
        return n.val

    def put(self, key: int, value: int) -> None:
        if key in self.map:
            n = self.map[key]; n.val = value
            self._remove(n); self._add_front(n)
            return
        if len(self.map) >= self.cap:            # evict least-recently-used
            lru = self.tail.prev
            self._remove(lru); del self.map[lru.key]
        n = _Node(key, value)
        self.map[key] = n; self._add_front(n)

c = LRUCache(2)
c.put(1, 1); c.put(2, 2)
print(c.get(1))   # 1  (now 1 is most recent)
c.put(3, 3)       # capacity full -> evicts key 2 (least recent)
print(c.get(2))   # -1 (evicted)
print(c.get(3))   # 3`]],
  edge: [`Using <b>sentinel head/tail</b> nodes avoids special-casing empty list / single-element removals — a frequent source of bugs without them.`, `On <code>get</code> you must <b>also reorder</b> (not just return) — forgetting to move the node to the head breaks LRU semantics.`, `On <code>put</code> of an <b>existing</b> key, update value <b>and</b> move to head; treating it as a fresh insert can over-evict.`, `For concurrency, wrap operations in a <b>lock</b> — the map and list must stay consistent; alternatively use a ready-made concurrent cache.`],
  faq: [['Why does LRU need both a hash map and a doubly linked list?', PP(`Because the two required operations pull in different directions and each must be <b>O(1)</b>. <b>Lookup by key</b> ("is this cached, and what’s its value?") needs a <b>hash map</b> — a list would be O(n) to search. <b>Recency ordering</b> ("mark this the most recently used," "which is least recently used to evict?") needs an ordered structure where you can <b>move a node and remove the end in O(1)</b> — and a <b>doubly linked list</b> does exactly that, because each node holds pointers to its neighbors, so you can unlink it and relink it at the front without scanning. A singly linked list won’t work (removing a node needs its predecessor, which is O(n) to find); an array won’t work (reordering is O(n)). The trick is that the hash map stores <b>pointers to the list nodes</b>, so a <code>get</code> does an O(1) map lookup to find the node, then an O(1) list splice to move it to the front. Combined, you get O(1) <code>get</code> and <code>put</code> with correct eviction — which is why this exact pairing is the canonical answer.`)],
    ['How would you make the LRU cache thread-safe or handle TTLs?', PP(`For <b>thread safety</b>, the simplest correct approach is to guard every <code>get</code>/<code>put</code> with a <b>lock</b>, since each operation mutates both the map and the linked list and those must stay consistent — a reader that moves a node to the front races with a writer that’s evicting the tail. A single lock is fine for moderate concurrency; to reduce contention you can shard the cache into N independent segments keyed by <code>hash(key) % N</code> (as production caches like Caffeine/Guava do), so operations on different shards don’t block each other. For <b>TTL/expiry</b>, store an expiration timestamp on each node and treat an entry as a miss if it’s expired on access (lazy expiration), optionally plus a background sweep to reclaim memory from expired-but-untouched entries; combining LRU eviction with TTL gives you both size and freshness bounds. These are natural follow-ups once the core O(1) design is in place, and mentioning sharding and lazy-vs-active expiration shows you understand how real caches extend the textbook version.`)]],
  qs: [SQ('The standard O(1) LRU cache uses…', ['A single array', 'A hash map plus a doubly linked list', 'A binary search tree', 'A heap'], 1, 'The map gives O(1) lookup; the DLL gives O(1) reorder and tail eviction.'),
    SQ('On a cache hit (get), besides returning the value you must…', ['Do nothing else', 'Move the accessed node to the most-recently-used end', 'Evict it', 'Clear the cache'], 1, 'Reordering on access is what maintains least-recently-used semantics.')]
});
DP('lld-lru', {
  fu: [['How does Python’s functools.lru_cache relate?', 'It implements the same idea as a function-memoization decorator (with maxsize), backed by a dict + ordering. For a standalone cache you build the map+DLL yourself as shown; the concept is identical.'],
    ['What is LFU and when is it better than LRU?', 'LFU evicts the least-FREQUENTLY used item; it’s better when popularity is stable over time, while LRU adapts faster to changing access patterns. LFU is more complex (needs frequency buckets).'],
    ['How do production caches extend this?', 'They shard for concurrency, add TTL/expiry, size-based eviction with better policies (e.g. W-TinyLFU in Caffeine), and metrics. The textbook map+DLL is the core idea underneath.']],
  deep: [['Technique', 'Map key→node for O(1) lookup; doubly linked list with sentinels for O(1) reorder/evict; move-to-front on access; evict tail when full.'],
    ['Failure mode', 'Forgetting to reorder on get, mishandling existing-key puts, and edge-case bugs without sentinels.'],
    ['In interviews', 'State the map+DLL design and the O(1) reasoning first, then code it with sentinels; mention sharding/TTL for the production version.']],
  src: ['LeetCode 146: LRU Cache', 'https://leetcode.com/problems/lru-cache/'] });

SDX('lld-notification', { name: 'Notification System (object design)', cat: 'sdlld',
  blurb: `A notification service sends messages over multiple channels (email, SMS, push) with user preferences, templating, and retries. The LLD focus is channel abstraction, user preference routing, and designing for new channels without touching callers. (The large-scale version is a separate case study.)`,
  facts: [['Channels', 'email, SMS, push, in-app'], ['Pattern', 'Strategy (channel), Observer/Factory'], ['Routing', 'by user preference'], ['Reliability', 'retries + fallback']],
  cheat: [['NotificationService', 'send(user, event) orchestrates'], ['Channel', 'Interface: send(recipient, message)'], ['EmailChannel/SMS/Push', 'Concrete channels'], ['Preferences', 'Per user: which channels, opt-outs'], ['Template', 'Render message from event + data'], ['Factory', 'Create channel by type'], ['Retry', 'Backoff + fallback channel'], ['Rate limit', 'Avoid spamming a user'], ['Extensible', 'New channel = new class'], ['Async', 'Queue sends for throughput']],
  sections: [
    ['Requirements & entities', PP(`<b>Requirements:</b> send a notification for an <b>event</b> to a user over one or more <b>channels</b> (email, SMS, push, in-app), honoring the user’s <b>preferences</b> and <b>opt-outs</b>, rendering the message from a <b>template</b>, and <b>retrying</b> on failure. <b>Entities:</b> <code>NotificationService</code> (orchestrator), a <code>Channel</code> interface with concrete <code>EmailChannel</code>/<code>SMSChannel</code>/<code>PushChannel</code>, user <code>Preferences</code>, and a <code>Template</code> renderer.`)],
    ['Design choices', PP(`Each <b>channel is a Strategy</b> behind a common <code>send(recipient, message)</code> interface, created via a <b>Factory</b> keyed by channel type — so adding WhatsApp is a new class plus a registry entry, with no change to callers. The service looks up the user’s <b>preferred channels</b>, renders the <b>template</b>, and sends; on failure it <b>retries with backoff</b> and can <b>fall back</b> to another channel. For throughput, sends are <b>queued</b> and processed asynchronously rather than blocking the caller.`)]
  ],
  snipTitle: 'Notification system implementation', snipNote: 'Channel strategies, a factory, preference routing, and retry with fallback.',
  snips: [['notification.py', 'python', `from __future__ import annotations
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
import time

class Channel(ABC):
    @abstractmethod
    def send(self, recipient: str, message: str) -> bool: ...

class EmailChannel(Channel):
    def send(self, recipient, message): print(f"EMAIL -> {recipient}: {message}"); return True
class SMSChannel(Channel):
    def send(self, recipient, message): print(f"SMS   -> {recipient}: {message}"); return True
class PushChannel(Channel):
    def send(self, recipient, message): print(f"PUSH  -> {recipient}: {message}"); return True

_CHANNELS = {"email": EmailChannel, "sms": SMSChannel, "push": PushChannel}
def make_channel(kind: str) -> Channel:          # Factory
    return _CHANNELS[kind]()

@dataclass
class User:
    id: str
    contacts: dict[str, str]                      # {"email": "a@b.com", "sms": "+1..."}
    channels: list[str] = field(default_factory=lambda: ["push"])  # preferences

def render(template: str, data: dict) -> str:     # simple templating
    return template.format(**data)

class NotificationService:
    def __init__(self, retries=2):
        self.retries = retries
    def notify(self, user: User, template: str, data: dict):
        message = render(template, data)
        for kind in user.channels:                # route by preference
            recipient = user.contacts.get(kind)
            if not recipient: continue
            if self._send_with_retry(make_channel(kind), recipient, message):
                return kind                       # stop at first success (fallback order)
        raise RuntimeError("all channels failed")
    def _send_with_retry(self, ch: Channel, recipient: str, msg: str) -> bool:
        for attempt in range(self.retries + 1):
            if ch.send(recipient, msg): return True
            time.sleep(0.2 * (2 ** attempt))      # exponential backoff
        return False

u = User("u1", {"email": "ada@x.com", "sms": "+1555"}, channels=["sms", "email"])
NotificationService().notify(u, "Hi {name}, your order {oid} shipped", {"name": "Ada", "oid": 42})`]],
  edge: [`<b>Respect opt-outs and quiet hours</b> — sending to a user who disabled a channel (or at 3am) is a correctness/compliance bug, not just annoyance.`, `<b>Idempotency:</b> retries and at-least-once queues can send duplicates; attach a notification/dedup key so the same event isn’t delivered twice.`, `<b>Per-user rate limiting / batching</b> prevents notification storms (don’t send 50 emails for 50 rapid events — coalesce).`, `<b>Partial failure:</b> if one channel is down, fall back to another and record the failure; don’t block the caller — queue and process asynchronously.`],
  faq: [['How do you design for adding new channels without touching callers?', PP(`Put every channel behind a single <b>interface</b> — <code>Channel.send(recipient, message) → bool</code> — so concrete channels (<code>EmailChannel</code>, <code>SMSChannel</code>, <code>PushChannel</code>) are interchangeable <b>Strategies</b>, and create them through a <b>Factory/registry</b> keyed by channel type. The <code>NotificationService</code> depends only on the <code>Channel</code> interface and the registry, never on concrete classes. Adding a new channel (WhatsApp, Slack) is then a <b>new class plus one registry entry</b> — the service, the preference routing, and all callers stay unchanged (open/closed + dependency inversion). This also makes testing easy: inject a <code>FakeChannel</code> that records messages. The combination of a thin channel interface, a factory to build them, and preference-driven selection is exactly the extensible design interviewers are probing for in this question.`)],
    ['How do you make delivery reliable and avoid duplicate notifications?', PP(`Reliability and de-duplication pull against each other, so you design for both. For <b>reliability</b>, don’t send synchronously in the request path — enqueue the notification and have workers deliver it, <b>retry with exponential backoff</b> on transient channel failures, and <b>fall back</b> to another channel (or a lower-priority one) if the preferred channel keeps failing; record delivery status so failures are visible. But retries and at-least-once queues mean the <b>same notification can be attempted more than once</b>, risking duplicate emails/texts. The fix is <b>idempotency</b>: give each notification a stable <b>dedup key</b> (e.g. <code>event_id + channel + user_id</code>), and before sending, atomically check/record that key in a store with a TTL — if it’s already been delivered, skip it. Combine that with <b>per-user rate limiting / coalescing</b> (batch many rapid events into one digest) so a burst of events doesn’t become a burst of messages. The result is at-least-once delivery that is effectively exactly-once from the user’s perspective, which is the standard target for notification systems.`)]],
  qs: [SQ('To add a new channel (e.g. WhatsApp) without changing callers, you…', ['Edit the service’s send method', 'Add a new Channel strategy and register it in the factory', 'Create a new service', 'Use a global flag'], 1, 'A channel interface + factory keeps the service and callers unchanged.'),
    SQ('To avoid duplicate notifications from retries you should…', ['Never retry', 'Use an idempotency/dedup key per notification', 'Send on multiple channels always', 'Ignore failures'], 1, 'A dedup key makes at-least-once delivery effectively exactly-once.')]
});
DP('lld-notification', {
  fu: [['How does this scale to millions of notifications?', 'Enqueue sends (Kafka/queue), process with worker pools per channel, use provider SDKs with their own rate limits, and store delivery status. This is the large-scale notification case study; the class design maps onto the workers.'],
    ['How do templates and localization fit?', 'A Template/renderer selects content by event type and user locale, filling placeholders from event data. Keep templates in a store so content changes don’t require code deploys.'],
    ['How do preferences and quiet hours work?', 'A Preferences object per user stores enabled channels, opt-outs, and quiet-hour windows; the service filters/queues accordingly before sending.']],
  deep: [['Technique', 'Channel interface (Strategy) built by a Factory, preference-driven routing, template rendering, retry+backoff with fallback, and idempotency keys for dedup.'],
    ['Failure mode', 'Ignoring opt-outs/quiet hours, duplicate sends from retries without dedup, and synchronous sending that blocks callers.'],
    ['In interviews', 'Lead with the channel abstraction + factory and preference routing; add retry/fallback and idempotency for reliability.']],
  src: ['Refactoring Guru: Strategy & Factory', 'https://refactoring.guru/design-patterns/factory-method'] });

SDX('lld-payment', { name: 'Payment Gateway (object design)', cat: 'sdlld',
  blurb: `A payment gateway abstraction routes a charge to the right provider (Stripe, PayPal), handles the authorize/capture/refund lifecycle, enforces idempotency so retries don’t double-charge, and records every state transition. It combines Adapter, Strategy and a state machine.`,
  facts: [['Lifecycle', 'authorize → capture → refund'], ['Patterns', 'Adapter (providers), Strategy'], ['Critical', 'idempotency (no double-charge)'], ['Records', 'every transition (audit)']],
  cheat: [['PaymentGateway', 'charge/refund façade over providers'], ['Provider', 'Interface: authorize/capture/refund'], ['StripeAdapter/PayPalAdapter', 'Wrap each SDK (Adapter)'], ['PaymentStatus', 'INIT/AUTHORIZED/CAPTURED/FAILED/REFUNDED'], ['Idempotency key', 'Dedup retried charges'], ['Ledger', 'Record each transition (audit)'], ['Authorize vs capture', 'Hold funds, then settle'], ['Refund', 'Reverse a captured payment'], ['Retry-safe', 'Same key -> same result'], ['Routing', 'Pick provider by rules']],
  sections: [
    ['Requirements & structure', PP(`<b>Requirements:</b> charge a customer through one of several <b>providers</b>, support the <b>authorize → capture → refund</b> lifecycle, never <b>double-charge</b> on retries, and keep an <b>audit trail</b>. Each provider is wrapped by an <b>Adapter</b> that exposes a common <code>Provider</code> interface over its SDK, so the gateway is provider-agnostic. Provider <b>selection</b> (by currency, cost, or failover) is a <b>Strategy</b>. A <b>Payment</b> moves through a small <b>state machine</b>, and every transition is written to a <b>ledger</b>.`)],
    ['Idempotency: the non-negotiable part', PP(`Payments are the canonical place where <b>idempotency</b> is mandatory: a client retry, a network timeout, or a duplicate webhook must <b>not</b> charge twice. The gateway requires an <b>idempotency key</b> per charge; it records the key with the result, and a repeat with the same key <b>returns the original outcome</b> instead of charging again. The check-and-record must be <b>atomic</b> (a unique constraint or atomic insert) so two concurrent retries can’t both proceed.`)]
  ],
  snipTitle: 'Payment gateway implementation', snipNote: 'Provider adapters, a status state machine, and idempotent charging.',
  snips: [['payment_gateway.py', 'python', `from __future__ import annotations
from abc import ABC, abstractmethod
from enum import Enum
from dataclasses import dataclass, field
from datetime import datetime

class Status(Enum):
    INIT="INIT"; AUTHORIZED="AUTHORIZED"; CAPTURED="CAPTURED"
    FAILED="FAILED"; REFUNDED="REFUNDED"

class Provider(ABC):                           # common interface
    @abstractmethod
    def authorize(self, amount: int, token: str) -> bool: ...
    @abstractmethod
    def capture(self, amount: int) -> bool: ...

class StripeAdapter(Provider):                 # Adapter over a vendor SDK
    def authorize(self, amount, token): print(f"stripe authorize {amount}"); return True
    def capture(self, amount): print(f"stripe capture {amount}"); return True
class PayPalAdapter(Provider):
    def authorize(self, amount, token): print(f"paypal authorize {amount}"); return True
    def capture(self, amount): print(f"paypal capture {amount}"); return True

@dataclass
class Payment:
    id: str
    amount: int
    status: Status = Status.INIT
    history: list = field(default_factory=list)   # audit ledger
    def transition(self, new: Status):
        self.history.append((self.status, new, datetime.now()))
        self.status = new

class PaymentGateway:
    def __init__(self, provider: Provider):
        self.provider = provider
        self._payments: dict[str, Payment] = {}
        self._idem: dict[str, str] = {}            # idempotency key -> payment id

    def charge(self, idem_key: str, amount: int, token: str) -> Payment:
        if idem_key in self._idem:                 # retry-safe: return original
            return self._payments[self._idem[idem_key]]
        p = Payment(id=idem_key, amount=amount)
        self._payments[p.id] = p
        self._idem[idem_key] = p.id                # atomic claim in real DB (unique key)
        if not self.provider.authorize(amount, token):
            p.transition(Status.FAILED); return p
        p.transition(Status.AUTHORIZED)
        if self.provider.capture(amount):
            p.transition(Status.CAPTURED)
        else:
            p.transition(Status.FAILED)
        return p

gw = PaymentGateway(StripeAdapter())
p1 = gw.charge("order-42-key", 4999, "tok_visa")
p2 = gw.charge("order-42-key", 4999, "tok_visa")   # retry: same key
print(p1 is p2, p1.status)       # True CAPTURED  (NOT charged twice)`]],
  edge: [`<b>Double-charge on retry</b> is the cardinal sin — require an idempotency key and make the check-and-record <b>atomic</b> (DB unique constraint), or two concurrent retries both charge.`, `<b>Authorize vs capture:</b> authorize holds funds without moving them; capture settles later. Conflating them (or forgetting to capture) causes expired auths or uncaptured sales.`, `<b>Webhooks</b> from providers are <b>at-least-once and can arrive out of order</b> — process them idempotently and reconcile status, don’t assume one delivery.`, `Keep an <b>immutable audit ledger</b> of every transition for disputes/accounting; never overwrite history.`],
  faq: [['Why is idempotency the most important part of a payment gateway?', PP(`Because the cost of getting it wrong is <b>charging a customer twice</b> for one purchase, and the conditions that cause it are <b>normal</b>, not exceptional: a client times out and retries, a mobile network resends a request, a webhook is delivered more than once, or a user double-clicks "Pay." Without protection, each of those becomes a second charge. The standard fix is an <b>idempotency key</b> — a unique token the client generates per logical payment and sends with every attempt. The gateway records the key together with the result; the <b>first</b> request with a given key performs the charge, and any <b>repeat</b> with the same key <b>returns the stored result</b> instead of charging again. The subtlety is that the "check if this key exists, else create it" step must be <b>atomic</b> (a database <b>unique constraint</b> or an atomic insert), or two concurrent retries can both pass the check and both charge. This is why every real payment API (Stripe, etc.) requires idempotency keys — it turns inevitable retries into safe no-ops.`)],
    ['What’s the difference between authorize and capture, and why split them?', PP(`<b>Authorize</b> checks the card and <b>places a hold</b> on the funds without actually moving money; <b>capture</b> is the step that <b>settles</b> the charge and transfers the money. They’re split because many businesses need a gap between "the customer committed to pay" and "we’re ready to take the money." Classic cases: an <b>e-commerce order</b> authorizes at checkout but captures only when the item <b>ships</b> (so you don’t charge for something you can’t fulfill); a <b>hotel or car rental</b> authorizes a deposit/hold at booking and captures the final amount at checkout; <b>marketplaces</b> authorize, verify the seller, then capture. Splitting also lets you <b>cancel</b> an authorization cheaply (release the hold) instead of charging-then-refunding, and lets you capture a <b>different (usually lower) amount</b> than authorized. In the state machine this is <code>INIT → AUTHORIZED → CAPTURED</code>, with <code>AUTHORIZED</code> able to expire or be voided. If you only ever need immediate payment you can authorize-and-capture in one call, but modeling the two phases keeps the design correct for the many flows that require the hold-then-settle pattern — and each transition is written to the audit ledger for reconciliation and disputes.`)]],
  qs: [SQ('The mechanism that prevents retries from double-charging is…', ['A faster network', 'An idempotency key with an atomic check-and-record', 'Logging', 'A singleton gateway'], 1, 'Same key returns the original result; the atomic claim stops concurrent double charges.'),
    SQ('Wrapping each provider SDK behind a common Provider interface is an example of which pattern?', ['Observer', 'Adapter', 'Composite', 'Builder'], 1, 'Adapters translate each vendor SDK into one interface the gateway depends on.')]
});
DP('lld-payment', {
  fu: [['How do you handle provider failover/routing?', 'Make provider selection a Strategy: route by currency, cost, or health, and fail over to a backup provider on errors. The gateway depends on the Provider interface, so routing is swappable.'],
    ['How do webhooks fit in?', 'Providers send async status updates (captured, disputed, refunded) via webhooks; process them idempotently (dedup by event id), verify signatures, and reconcile the payment’s state machine rather than trusting a single synchronous response.'],
    ['Why keep an append-only ledger?', 'Payments require auditability for accounting, disputes and compliance; an immutable history of state transitions (not overwrites) lets you reconstruct exactly what happened and when.']],
  deep: [['Technique', 'Provider Adapters behind one interface, Strategy for routing, a status state machine, mandatory idempotency keys with atomic claim, and an append-only audit ledger.'],
    ['Failure mode', 'Double-charges from non-atomic idempotency, conflating authorize/capture, and trusting at-least-once webhooks as exactly-once.'],
    ['In interviews', 'Lead with idempotency and the authorize/capture/refund state machine, then Adapter for providers and Strategy for routing.']],
  src: ['Stripe: Idempotent requests', 'https://docs.stripe.com/api/idempotent_requests'] });

SDX('lld-scheduler', { name: 'Task Scheduler', cat: 'sdlld',
  blurb: `A task scheduler runs jobs at a time or on a recurring schedule, with priorities and retries. The core design uses a min-heap (priority queue) keyed by next-run time, worker threads, and a retry/backoff policy — the in-process cousin of cron and job queues.`,
  facts: [['Core', 'min-heap by next-run time'], ['Runs', 'one-off and recurring (cron)'], ['Workers', 'pull due tasks and execute'], ['Reliability', 'retries + backoff']],
  cheat: [['Scheduler', 'schedule(task, run_at) + run loop'], ['Task', 'Callable + schedule + priority + retries'], ['Min-heap', 'Order by next-run time (then priority)'], ['Due', 'next_run <= now -> execute'], ['Recurring', 'Reschedule after run (interval/cron)'], ['Workers', 'Thread/process pool execute tasks'], ['Retry', 'On failure, backoff and requeue'], ['Priority', 'Tie-break among due tasks'], ['Wait', 'Sleep until the next task is due'], ['Persist', 'Durable store to survive restarts']],
  sections: [
    ['Requirements & core structure', PP(`<b>Requirements:</b> run a task <b>once at a time</b> or <b>repeatedly</b> on an interval/cron, with <b>priorities</b> and <b>retries</b> on failure. The core is a <b>min-heap (priority queue)</b> ordered by each task’s <b>next-run time</b>: the scheduler peeks the earliest task, <b>sleeps until it’s due</b>, then dispatches it. <b>Worker threads</b> execute tasks so a slow task doesn’t block the scheduler. <b>Recurring</b> tasks are <b>re-inserted</b> with their next run time after they execute.`)],
    ['Reliability and scaling notes', PP(`On failure a task is <b>retried with backoff</b> up to a limit (then dead-lettered). <b>Priority</b> breaks ties among tasks due at the same time. The scheduler <b>waits on a condition variable</b> until the next task is due (so newly added earlier tasks wake it). To survive restarts, tasks live in a <b>durable store</b>; to scale across machines, this becomes a distributed job queue where workers atomically <b>claim</b> due tasks (a lease) so each runs once.`)]
  ],
  snipTitle: 'Task scheduler implementation', snipNote: 'A min-heap by next-run time, worker execution, recurring tasks and retries.',
  snips: [['scheduler.py', 'python', `from __future__ import annotations
from dataclasses import dataclass, field
import heapq, threading, time
from typing import Callable

@dataclass(order=True)
class ScheduledTask:
    next_run: float                           # primary sort key (soonest first)
    priority: int = field(default=0)          # tie-break (lower = higher priority)
    seq: int = field(default=0)
    fn: Callable = field(compare=False, default=lambda: None)
    interval: float | None = field(compare=False, default=None)  # recurring
    retries_left: int = field(compare=False, default=0)

class Scheduler:
    def __init__(self):
        self._heap: list[ScheduledTask] = []
        self._lock = threading.Lock()
        self._cv = threading.Condition(self._lock)
        self._seq = 0
        self._running = True

    def schedule(self, fn, delay=0.0, interval=None, priority=0, retries=0):
        with self._cv:
            self._seq += 1
            t = ScheduledTask(time.monotonic() + delay, priority, self._seq, fn, interval, retries)
            heapq.heappush(self._heap, t)
            self._cv.notify()                 # wake the loop (maybe sooner than before)

    def _run_task(self, t: ScheduledTask):
        try:
            t.fn()
        except Exception as e:
            if t.retries_left > 0:            # retry with simple backoff
                t.retries_left -= 1
                self.schedule(t.fn, delay=1.0, interval=t.interval,
                              priority=t.priority, retries=t.retries_left)
            else:
                print(f"task failed permanently: {e}")
        if t.interval:                        # recurring: reschedule
            self.schedule(t.fn, delay=t.interval, interval=t.interval, priority=t.priority)

    def run(self):
        while self._running:
            with self._cv:
                while self._running and not self._heap:
                    self._cv.wait()           # nothing scheduled
                if not self._running: return
                now = time.monotonic()
                if self._heap[0].next_run > now:
                    self._cv.wait(timeout=self._heap[0].next_run - now)  # sleep until due
                    continue
                t = heapq.heappop(self._heap)
            threading.Thread(target=self._run_task, args=(t,), daemon=True).start()  # worker

    def stop(self):
        with self._cv: self._running = False; self._cv.notify_all()

s = Scheduler()
threading.Thread(target=s.run, daemon=True).start()
s.schedule(lambda: print("once, now"))
s.schedule(lambda: print("tick"), delay=0.5, interval=0.5)   # recurring
time.sleep(1.6); s.stop()`]],
  edge: [`<b>Don’t busy-wait:</b> the loop must <b>sleep until the next task is due</b> (condition variable with a timeout), and wake when an earlier task is added — polling in a tight loop wastes CPU.`, `<b>Recurring drift:</b> schedule the next run relative to the <b>intended</b> time, not "now after it finished," or periodic tasks slowly drift late.`, `<b>Long/blocking tasks</b> must run on <b>workers</b>, not the scheduler thread, or they delay every other due task.`, `For a <b>distributed</b> scheduler, workers must <b>atomically claim</b> a due task (a lease/lock) so the same job doesn’t run on two machines; add idempotency for safety.`],
  faq: [['Why a min-heap, and how does the scheduler avoid busy-waiting?', PP(`A <b>min-heap keyed by next-run time</b> is the right structure because the scheduler’s central question is "what runs <b>soonest</b>?" — and a min-heap answers that in O(1) for the peek and O(log n) for insert and pop, which beats re-sorting a list or scanning every task on each tick. The earliest task is always at the top. To avoid <b>busy-waiting</b> (spinning in a loop checking the clock, which burns CPU), the scheduler <b>sleeps until the top task is actually due</b>: it peeks the soonest <code>next_run</code>, computes how long until then, and waits that long on a <b>condition variable</b>. The condition variable is key because new tasks can arrive that are due <b>earlier</b> than whatever it’s currently waiting for — so <code>schedule()</code> calls <code>notify()</code> to <b>wake the loop</b>, which recomputes the wait against the new earliest task. When the wait elapses, the top task is due and gets dispatched. This gives precise timing with near-zero idle CPU, which is exactly how production schedulers and timer wheels are built.`)],
    ['How would you turn this into a distributed scheduler that runs each job exactly once?', PP(`The in-process design (heap + worker threads) breaks down across machines for two reasons: state is in memory (lost on restart) and multiple scheduler instances would each fire the same job. The distributed version makes two changes. First, <b>persist tasks in a durable store</b> (a database or a dedicated queue) with their next-run time, so jobs survive restarts and any instance can see them. Second, make dispatch a <b>claim with a lease</b>: a worker atomically marks a due task as "taken by me until time T" — via an atomic conditional UPDATE (<code>SET owner=me WHERE id=? AND owner IS NULL</code>), a short-lived distributed lock, or a queue with visibility-timeout semantics (like SQS) — so <b>only one worker</b> gets each task. If a worker crashes mid-run, the lease expires and the task becomes claimable again, which guarantees <b>at-least-once</b> execution; to approximate <b>exactly-once effects</b>, make the jobs <b>idempotent</b> (dedup key) since a crash after doing the work but before marking it done will cause a re-run. Recurring jobs reschedule by writing the next occurrence back to the store. This is essentially how systems like Quartz clustering, cron-on-a-cluster, and cloud schedulers work: durable storage + atomic lease + idempotent jobs.`)]],
  qs: [SQ('The core data structure of a time-based task scheduler is…', ['A stack', 'A min-heap ordered by next-run time', 'A hash map', 'A linked list'], 1, 'A min-heap gives O(1) peek of the soonest task and O(log n) insert/pop.'),
    SQ('To run each job exactly once across many machines, workers must…', ['Run every job they see', 'Atomically claim a due task (lease/lock) so only one worker runs it', 'Use a bigger heap', 'Disable retries'], 1, 'An atomic claim/lease plus idempotent jobs prevents duplicate execution.')]
});
DP('lld-scheduler', {
  fu: [['How do cron expressions fit in?', 'A recurring task can carry a cron expression; after each run you compute the next fire time from the cron spec (next matching timestamp) and reinsert into the heap. Libraries like croniter compute the next time.'],
    ['What is a timing/hashed timer wheel?', 'A timer wheel buckets timers by expiry into a circular array, giving O(1) insert/expire for huge numbers of timers — used in high-performance schedulers (e.g. Kafka, Netty) instead of a single heap when there are millions of timers.'],
    ['How do retries and dead-lettering work?', 'On failure, requeue with exponential backoff up to a max attempts; after that, move the task to a dead-letter store for inspection rather than retrying forever.']],
  deep: [['Technique', 'Min-heap by next-run time, condition-variable sleep until due, worker threads for execution, reschedule recurring tasks, retry with backoff.'],
    ['Failure mode', 'Busy-waiting, recurring drift, blocking the scheduler with long tasks, and duplicate runs in a distributed setup without atomic claims.'],
    ['In interviews', 'Describe the heap + wait-until-due loop and worker execution first; then extend to durable storage + atomic lease + idempotency for the distributed version.']],
  src: ['Hashed and hierarchical timing wheels (paper overview)', 'https://en.wikipedia.org/wiki/Timing_wheel'] });
